import { calendarCheckAvailability } from './src/tools/calendar';

const testCalendar = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Scenario 1: Specific Slot (likely free)
    const start1 = new Date(tomorrow); start1.setHours(10, 0, 0, 0);
    const end1 = new Date(tomorrow); end1.setHours(11, 0, 0, 0);

    // Scenario 2: Whole Day Query
    const queryDate = tomorrow.toISOString();

    console.log('--- TEST 1: Specific Slot ---');
    try {
        const result = await calendarCheckAvailability({
            client_id: 'white_dental',
            start_time: start1.toISOString(),
            end_time: end1.toISOString()
        });
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error: any) { console.error(error.message); }

    console.log('\n--- TEST 2: Whole Day Query ---');
    try {
        const result = await calendarCheckAvailability({
            client_id: 'white_dental',
            query_date: queryDate
        });
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error: any) { console.error(error.message); }
};

testCalendar();
