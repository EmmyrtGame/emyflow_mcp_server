import axios from 'axios';
import crypto from 'crypto';
import { clients } from '../config/clients';

const hashData = (data: string) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};


export const buildCapiPayload = (args: any, clientConfig: any) => {
  const { event_name, user_data, event_source_url, event_id, action_source = "website" } = args;

  const hashedUserData: any = {};
  if (user_data.email) hashedUserData.em = hashData(user_data.email.toLowerCase().trim());
  if (user_data.phone) hashedUserData.ph = hashData(user_data.phone.replace(/[^0-9]/g, ''));
  if (user_data.fbp) hashedUserData.fbp = user_data.fbp;
  if (user_data.fbc) hashedUserData.fbc = user_data.fbc;
  if (user_data.client_user_agent) hashedUserData.client_user_agent = user_data.client_user_agent;
  if (user_data.client_ip_address) hashedUserData.client_ip_address = user_data.client_ip_address;

  const eventData: any = {
    event_name: event_name,
    event_time: Math.floor(Date.now() / 1000),
    user_data: hashedUserData,
    action_source: action_source,
  };

  if (event_source_url) eventData.event_source_url = event_source_url;
  if (event_id) eventData.event_id = event_id;

  return {
    data: [eventData],
    access_token: clientConfig.meta.accessToken,
  };
};

export const trackScheduleEvent = async (args: {
  client_id: string;
  user_data: { 
    phone: string; 
    email?: string; 
    fbp?: string; 
    fbc?: string;
  };
}) => {
  const { client_id, user_data } = args;
  
  // Wrap in try-catch to ensure it never blocks the main flow
  try {
    const clientConfig = clients[client_id];
    if (!clientConfig) {
      console.warn(`[Marketing] Client ${client_id} not found, skipping tracking.`);
      return;
    }

    // Default to 'chat' since this is an internal automated system, mostly likely from whatsapp flow
    // But typically schedule comes from system, so 'chat' or 'website' (if web booking).
    // Given the context of Wassenger usage, 'chat' is safer or just stick to 'website' if it's the default.
    // User mentioned "no quiero que forme parte del servidor MCP... agentes de IA... alucionaciones"
    // implies backend automation.
    // Let's use "chat" as discussed previously for WhatsApp flow compatibility.
    const payload = buildCapiPayload({
      event_name: 'Schedule',
      user_data: user_data,
      action_source: 'chat'
    }, clientConfig);

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${clientConfig.meta.pixelId}/events`,
      payload
    );
    console.log(`[Marketing] Schedule event tracked for ${user_data.phone}:`, response.data);
    return { success: true };
  } catch (error: any) {
    // Log but do not throw
    console.error('[Marketing] Error tracking schedule event:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};
