import express from 'express';
import axios from 'axios';
import { clients } from '../config/clients';
import { trackLeadEvent } from '../tools/marketing';

const router = express.Router();

// Buffer storage (In-memory for V1)
// Key: userId (phone number), Value: { messages: string[], timer: NodeJS.Timeout }
const messageBuffer: Record<string, { messages: string[], timer: NodeJS.Timeout }> = {};

const BUFFER_DELAY_MS = 15000; // 3 seconds window

// TODO: Replace with actual Make Agent Webhook URL
const MAKE_AGENT_WEBHOOK_URL = process.env.MAKE_AGENT_WEBHOOK_URL || 'https://hook.us1.make.com/your-webhook-id';

router.post('/whatsapp', (req, res) => {
  try {
    const { data } = req.body;
    
    // Basic validation for Wassenger webhook structure
    if (!data || !data.fromNumber || !data.body) {
       // Just acknowledge if not a valid message event
       console.log('Webhook received but missing data:', req.body);
       return res.status(200).send('OK');
    }

    const userId = data.fromNumber;
    const messageBody = data.body;
    
    // Check for Lead Event (Inbound reply that is NOT the first message)
    if (data.flow === 'inbound' && data.meta && data.meta.isFirstMessage === false) {
       // Identify Client from Device ID
       // payload structure: req.body.device.id or req.body.data.device? User payload shows top level "device" object with "id"
       // But wait, the user provided payload shows "device" at root level AND "data" at root level.
       const deviceId = req.body.device?.id;
       
       if (deviceId) {
          const clientEntry = Object.entries(clients).find(([_, config]: [string, any]) => config.wassenger.deviceId === deviceId);
          if (clientEntry) {
             const [clientId, _] = clientEntry;
             console.log(`[Webhook] Detected potential Lead for client ${clientId} (Device: ${deviceId})`);
             
             // Track Lead Event asynchronously
             trackLeadEvent({
               client_id: clientId,
               user_data: {
                 phone: userId // fromNumber
               }
             }).catch((err: any) => console.error('[Webhook] Failed to track automated Lead:', err));
          }
       }
    }

    // If buffer exists for this user, clear the timer
    if (messageBuffer[userId]) {
      clearTimeout(messageBuffer[userId].timer);
      messageBuffer[userId].messages.push(messageBody);
    } else {
      // Create new buffer entry
      messageBuffer[userId] = {
        messages: [messageBody],
        timer: setTimeout(() => {}, 0) // Placeholder, will be set below
      };
    }

    // Set a new timer
    messageBuffer[userId].timer = setTimeout(async () => {
      const combinedMessage = messageBuffer[userId].messages.join(' ');
      delete messageBuffer[userId]; // Clear buffer

      console.log(`Processing buffered message for ${userId}: ${combinedMessage}`);

      try {
        // Send to Make Agent
        await axios.post(MAKE_AGENT_WEBHOOK_URL, {
          ...req.body, // Pass original context
          data: {
            ...data,
            body: combinedMessage // Override with combined message
          }
        });
      } catch (error) {
        console.error('Error sending to Make:', error);
      }

    }, BUFFER_DELAY_MS);

    res.status(200).send('Buffered');

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
