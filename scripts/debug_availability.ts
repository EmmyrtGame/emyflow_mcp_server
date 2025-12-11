
import { clientService } from '../src/services/client.service';
import { calendarCheckAvailability } from '../src/tools/calendar';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
      const availResult = await calendarCheckAvailability({
          client_id: 'white_dental',
          query_date: '2025-12-12'
      });
      const parsed = JSON.parse(availResult.content[0].text);
      console.log('--- AGENDA DEL DIA (2025-12-12) ---');
      console.log(parsed.day_context);
      console.log('--- END AGENDA ---');
  } catch (e: any) {
      console.error(e);
  }
};
run();
