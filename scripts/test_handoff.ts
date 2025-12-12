
import axios from 'axios';

const WEBHOOK_URL = 'http://localhost:3000/webhooks/whatsapp';
const TEST_JID = '5219999999999@c.us';
const TEST_NUMBER = '+5219999999999';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendWebhook(payload: any, label: string) {
  try {
    const res = await axios.post(WEBHOOK_URL, payload);
    console.log(`[${label}] Status: ${res.status}, Body: ${res.data}`);
  } catch (err: any) {
    console.error(`[${label}] Failed:`, err.message);
  }
}

async function runTest() {
  console.log('=== STARTING HUMAN HANDOFF TEST ===');

  // 1. Send INBOUND message (Should trigger AI initially)
  console.log('\n--- Test 1: Inbound message (Normal AI flow) ---');
  await sendWebhook({
    event: 'message:in:new',
    data: {
      id: 'msg_1',
      flow: 'inbound',
      from: TEST_JID,
      fromNumber: TEST_NUMBER,
      body: 'Hola, quiero una cita',
      meta: { isFirstMessage: false }
    }
  }, 'Inbound-1');

  // Wait for buffer buffer to potentially process (although buffer is 15s)
  // We just want to ensure it was accepted.
  await sleep(1000);

  // 2. Send API OUTBOUND message (Should NOT trigger handoff)
  console.log('\n--- Test 2: API Outbound message (No agent) ---');
  await sendWebhook({
    event: 'message:out:new',
    data: {
      id: 'msg_out_api',
      flow: 'outbound',
      to: TEST_JID,
      toNumber: TEST_NUMBER,
      body: 'Respuesta automática de AI',
      // No agent field
    }
  }, 'Outbound-API');

  await sleep(500);

  // 3. Send INBOUND message again (Should still trigger AI)
  console.log('\n--- Test 3: Inbound message after API reply (Should trigger AI) ---');
  await sendWebhook({
    event: 'message:in:new',
    data: {
      id: 'msg_2',
      flow: 'inbound',
      from: TEST_JID,
      fromNumber: TEST_NUMBER,
      body: 'Mas info',
      meta: { isFirstMessage: false }
    }
  }, 'Inbound-2');

  await sleep(1000);

  // 4. Send HUMAN OUTBOUND message (Should trigger handoff)
  console.log('\n--- Test 4: HUMAN Outbound message (Has agent) ---');
  await sendWebhook({
    event: 'message:out:new',
    data: {
      id: 'msg_out_human',
      flow: 'outbound',
      to: TEST_JID,
      toNumber: TEST_NUMBER,
      body: 'Hola, soy el Dr. Juan',
      agent: 'agent_12345' // Critical field
    }
  }, 'Outbound-HUMAN');

  await sleep(1000);

  // 5. Send INBOUND message immediately (Should be SUPPRESSED)
  console.log('\n--- Test 5: Inbound message after Human reply (Should be SUPPRESSED) ---');
  await sendWebhook({
    event: 'message:in:new',
    data: {
      id: 'msg_3',
      flow: 'inbound',
      from: TEST_JID,
      fromNumber: TEST_NUMBER,
      body: 'Gracias doctor',
      meta: { isFirstMessage: false }
    }
  }, 'Inbound-3');

  console.log('\n=== TEST COMPLETE ===');
  console.log('Check server logs to verify "Suppressed by Human Handoff" message.');
}

runTest();
