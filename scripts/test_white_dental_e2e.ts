
import { clientService } from '../src/services/client.service';
import { trackLeadEvent } from '../src/tools/marketing';
import { calendarCheckAvailability, calendarCreateAppointment } from '../src/tools/calendar';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const runTest = async () => {
  console.log('--- Starting White Dental E2E Test ---');

  const clientId = 'white_dental';
  const testPhone = '521234567890';
  const testEventCode = 'TEST94037';
  
  // 1. Verify Client Config
  console.log(`\n[1] Verifying Client Config for ${clientId}...`);
  const config = await clientService.getClientConfig(clientId);
  if (!config) {
      console.error('Client not found!');
      process.exit(1);
  }
  console.log(`Client found: ${config.name} (${config.slug})`);
  console.log(`Locations: ${config.locations?.length || 0}`);
  if (config.locations && config.locations.length > 0) {
      console.log(`First Location Sede: ${config.locations[0].name}`);
      console.log(`Calendars:`, config.locations[0].google);
  } else {
      console.error('No locations configured!');
      process.exit(1);
  }

  // 2. Simulate CAPI Event
  console.log(`\n[2] Simulating CAPI Lead Event...`);
  const capiResult = await trackLeadEvent({
      client_id: clientId,
      user_data: {
          phone: testPhone,
      },
      test_event_code: testEventCode
  });
  console.log('CAPI Result:', capiResult);

  // 3. Check Availability for Tomorrow (2025-12-12)
  console.log(`\n[3] Checking Availability for 2025-12-12...`);
  try {
      const availResult = await calendarCheckAvailability({
          client_id: clientId,
          query_date: '2025-12-12'
      });
      console.log('Availability Output:', availResult.content[0].text);
  } catch (e: any) {
      console.error('Error checking availability:', e.message);
  }

  // 4. Attempt Booking Valid Slot (2025-12-12 21:00 - 22:00)
  // Assuming 21:00 is free as per prompt instructions
  console.log(`\n[4] Attempting to book valid slot: 2025-12-12 21:00...`);
  try {
      const bookResult = await calendarCreateAppointment({
          client_id: clientId,
          patient_data: {
              nombre: 'Test CAPI Patient',
              telefono: testPhone
          },
          start_time: '2025-12-12T21:00:00-06:00', // Mexico City Time
          end_time: '2025-12-12T22:00:00-06:00',
          description: 'Cita de prueba E2E via Script'
      });
      console.log('Booking Result:', bookResult.content[0].text);
  } catch (e: any) {
      console.error('Error booking valid slot:', e.message);
  }

  // 5. Attempt Booking Invalid/Occupied Slot (2025-12-12 10:00 - 11:00)
  // Screenshot shows 10-11am is occupied
  console.log(`\n[5] Attempting to book occupied slot: 2025-12-12 10:00...`);
  try {
      const failResult = await calendarCreateAppointment({
          client_id: clientId,
          patient_data: {
              nombre: 'Test Conflict Patient',
              telefono: testPhone
          },
          start_time: '2025-12-12T10:00:00-06:00',
          end_time: '2025-12-12T11:00:00-06:00',
          description: 'Intento de cita en horario ocupado'
      });
      console.log('Booking Result (Expect Failure/Conflict):', failResult.content[0].text);
  } catch (e: any) {
      console.error('Error booking occupied slot (Expected):', e.message);
  }

  console.log('\n--- Test Complete ---');
  process.exit(0);
};

runTest().catch(console.error);
