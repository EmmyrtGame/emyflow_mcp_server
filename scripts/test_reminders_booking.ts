
import { calendarCreateAppointment } from '../src/tools/calendar';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  console.log('--- Testing Reminder Scheduling ---');
  
  const clientId = 'white_dental';
  const phone = '+5213122983813'; 
  const startTime = '2025-12-12T20:00:00-06:00'; // 8 PM Mexico City
  const endTime = '2025-12-12T21:00:00-06:00';

  console.log(`Booking for ${phone} at ${startTime}...`);

  try {
      const result = await calendarCreateAppointment({
          client_id: clientId,
          patient_data: {
              nombre: 'Test Reminder Patient',
              telefono: phone
          },
          start_time: startTime,
          end_time: endTime,
          description: 'Cita de prueba para verificar recordatorios Whatsapp'
      });
      console.log('Booking Output:', result.content[0].text);
  } catch (e: any) {
      console.error('Error:', e.message);
  }
};

run();
