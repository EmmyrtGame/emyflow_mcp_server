
import { trackScheduleEvent, trackLeadEvent } from '../src/tools/marketing';

const TEST_CODE = 'TEST60565';
const CLIENT_ID = 'white_dental';

// Mock user data for testing
const userData = {
  phone: '+5215551234567',
  email: 'test_capi@example.com'
};

const runManualTest = async () => {
  console.log(`--- Running Manual CAPI Test [Code: ${TEST_CODE}] ---`);
  console.log(`Client: ${CLIENT_ID}`);

  try {
    // 1. Test Lead Event
    console.log('\n>> Sending Lead Event...');
    const resLead = await trackLeadEvent({
      client_id: CLIENT_ID,
      user_data: userData,
      test_event_code: TEST_CODE
    });
    console.log('Lead Event Result:', resLead);

    // 2. Test Schedule Event
    console.log('\n>> Sending Schedule Event...');
    const resSchedule = await trackScheduleEvent({
      client_id: CLIENT_ID,
      user_data: userData,
      test_event_code: TEST_CODE
    });
    console.log('Schedule Event Result:', resSchedule);

  } catch (error: any) {
    console.error('Manual Test Failed:', error.message);
  }
};

runManualTest();
