import { calendarCheckAvailability } from './src/tools/calendar';

const testCalendar = async () => {
    // Define a time range for tomorrow (e.g., 10:00 AM to 11:00 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(16, 0, 0, 0);

    console.log(`Checking availability for: ${tomorrow.toISOString()} - ${endTime.toISOString()}`);

    try {
        const result = await calendarCheckAvailability({
            client_id: 'white_dental',
            start_time: tomorrow.toISOString(),
            end_time: endTime.toISOString()
        });

        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('Error testing calendar:', error.message);
        if (error.response) {
            console.error('API Error details:', error.response.data);
        }
    }
};

testCalendar();
