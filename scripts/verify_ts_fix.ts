
import { clientService } from '../src/services/client.service';
import { calendarCheckAvailability } from '../src/tools/calendar';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    // 1. Verify TS compilation by running this (ts-node will compile)
    console.log("TS Compilation Check...");
    
    // 2. Check if we can fetch config and see credentials
    const config = await clientService.getClientConfig('white_dental');
    if (config) {
        console.log("Config loaded.");
        console.log("Has credentials object?", !!(config.google as any).credentials);
        console.log("Has serviceAccountPath?", !!(config.google as any).serviceAccountPath);
    } else {
        console.log("Client not found.");
    }
};
run();
