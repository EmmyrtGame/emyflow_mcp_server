
import axios from 'axios';

const WEBHOOK_URL = 'http://localhost:3000/webhooks/whatsapp';
const DEVICE_ID = '68fd1067b488de07029fccc2'; // white_dental

const runTest = async () => {
  console.log('--- Testing Lead Webhook Trigger ---');

  const payload = {
    device: {
      id: DEVICE_ID
    },
    data: {
      fromNumber: '+5215551234567',
      body: 'Info please',
      flow: 'inbound',
      meta: {
        isFirstMessage: false // Crucial trigger
      }
    }
  };

  try {
    console.log('Sending payload...');
    const response = await axios.post(WEBHOOK_URL, payload);
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    
    // We can't easily assert the console log of the server from here unless we pipe output.
    // But if the server doesn't crash and we see the log in the server output, we are good.
    // The previous setup captured server output via command_status.
  } catch (error: any) {
    console.error('Test Failed:', error.message);
    if (error.response) {
       console.error('Server Responded:', error.response.data);
    }
  }
};

runTest();
