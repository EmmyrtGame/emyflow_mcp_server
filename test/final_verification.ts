import dotenv from 'dotenv';
dotenv.config();

import { calendarCheckAvailability, calendarCreateAppointment } from '../src/tools/calendar';
import { crmHandoffHuman } from '../src/tools/crm';
import { trackLeadEvent } from '../src/tools/marketing';
import { DateTime } from 'luxon';

async function runVerification() {
  const clientId = 'white_dental';
  console.log('--- Starting Verification for client:', clientId, '---');

  try {
    // 1. Check Availability (DB Source)
    console.log('\n[1/4] Testing Check Availability (from DB)...');
    // Use a future date to ensure we see availability or busy slots
    const queryDate = DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd');
    const resultAvailability = await calendarCheckAvailability({ 
      client_id: clientId, 
      query_date: queryDate 
    });
    console.log('Availability Result:', JSON.stringify(resultAvailability, null, 2));


    // 2. Schedule Appointment (Non-working hours test)
    console.log('\n[2/4] Testing Schedule Appointment (Non-working hours)...');
    // Using a known non-working time, e.g., Sunday at 3 AM
    const nextSunday = DateTime.now().plus({ weeks: 1 }).startOf('week').minus({ days: 1 }).set({ hour: 3 }); 
    const startTime = nextSunday.toISO()!;
    const endTime = nextSunday.plus({ minutes: 30 }).toISO()!;
    
    // Note: The tool itself doesn't enforce working hours logic, Google Calendar accepts it unless there is a conflict. 
    // The user asked "agendar google calendar para horario no laboral (a manera de testeo)".
    // So we just try to insert it.
    const resultSchedule = await calendarCreateAppointment({
      client_id: clientId,
      patient_data: { nombre: 'Test Bot', telefono: '0000000000' },
      start_time: startTime,
      end_time: endTime,
      description: 'Cita de prueba automatizada (Eliminar)',
      sede: 'san_francisco'
    });
    console.log('Schedule Result:', JSON.stringify(resultSchedule, null, 2));


    // 3. Human Handoff
    console.log('\n[3/4] Testing Human Handoff...');
    const resultHandoff = await crmHandoffHuman({
      client_id: clientId,
      phone_number: '+5213122983813'
    });
    console.log('Handoff Result:', JSON.stringify(resultHandoff, null, 2));


    // 4. Meta Ads Lead Event
    console.log('\n[4/4] Testing Meta Ads Lead Event...');
    const resultMeta = await trackLeadEvent({
      client_id: clientId,
      user_data: {
        phone: '5213122983813' // Using the same real number for formatting
      },
      test_event_code: 'TEST48252'
    });
    console.log('Meta Result:', JSON.stringify(resultMeta, null, 2));

  } catch (error) {
    console.error('Verification Failed:', error);
  }
}

runVerification();
