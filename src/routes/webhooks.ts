import express from 'express';
import axios from 'axios';
import { clientService } from '../services/client.service';
import { trackLeadEvent } from '../tools/marketing';
import { updateContactMetadata } from '../tools/crm';

const router = express.Router();

/**
 * In-memory buffer to group incoming messages by user.
 * structure: { [userId]: { messages: string[], timer: NodeJS.Timeout } }
 */
const messageBuffer: Record<string, { messages: string[], timer: NodeJS.Timeout }> = {};

const BUFFER_DELAY_MS = 15000; // 3 seconds window

// TODO: Replace with actual Make Agent Webhook URL
const MAKE_AGENT_WEBHOOK_URL = process.env.MAKE_AGENT_WEBHOOK_URL || 'https://hook.us1.make.com/your-webhook-id';

router.post('/whatsapp', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !data.fromNumber || !data.body) {
       console.log('Webhook received but missing data:', req.body);
       return res.status(200).send('OK');
    }

    const userId = data.fromNumber;
    const messageBody = data.body;
    
    if (data.flow === 'inbound' && data.meta && data.meta.isFirstMessage === false) {
       const contactMetadata = data.chat?.contact?.metadata || [];
       const isLeadSent = contactMetadata.some((m: any) => m.key === 'capi_lead_enviado' && m.value === 'true');
       
       if (!isLeadSent) {
         const deviceId = req.body.device?.id;
         
         if (deviceId) {
            const clientConfig = await clientService.getClientByDeviceId(deviceId);
            if (clientConfig) {
               const clientId = clientConfig.slug;
               console.log(`[Webhook] Detected potential Lead for client ${clientId} (Device: ${deviceId})`);
               
               
               trackLeadEvent({
                 client_id: clientId,
                 user_data: {
                   phone: userId // fromNumber
                 }
               }).then(async (result) => {
                  if (result && result.success) {
                     await updateContactMetadata({
                       client_id: clientId,
                       phone_number: userId,
                       metadata: { 'capi_lead_enviado': 'true' }
                     }).catch((err: any) => console.error('[Webhook] Failed to update lead metadata:', err));
                  }
               }).catch((err: any) => console.error('[Webhook] Failed to track automated Lead:', err));
            }
         }
       } else {
         console.log(`[Webhook] Lead event skipped for ${userId}: 'capi_lead_enviado' metadata already true.`);
       }
    }

    if (messageBuffer[userId]) {
      clearTimeout(messageBuffer[userId].timer);
      messageBuffer[userId].messages.push(messageBody);
    } else {
      messageBuffer[userId] = {
        messages: [messageBody],
        timer: setTimeout(() => {}, 0)
      };
    }

    messageBuffer[userId].timer = setTimeout(async () => {
      const combinedMessage = messageBuffer[userId].messages.join(' ');
      delete messageBuffer[userId];

      console.log(`Processing buffered message for ${userId}: ${combinedMessage}`);

      try {
        // Send to Make Agent
        await axios.post(MAKE_AGENT_WEBHOOK_URL, {
          ...req.body, // Pass original context
          data: {
            ...data,
            body: combinedMessage
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
