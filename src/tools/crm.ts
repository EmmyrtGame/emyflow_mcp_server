import axios from 'axios';
import { clients } from '../config/clients';

/**
 * Adds labels to a WhatsApp chat via Wassenger.
 * @param args.client_id The client identifier.
 * @param args.phone_number The user's phone number.
 * @param args.labels List of labels to add.
 */
export const addLabelToChat = async (args: { client_id: string; phone_number: string; labels: string[] }) => {
  const { client_id, phone_number, labels } = args;
  const clientConfig = clients[client_id];

  if (!clientConfig) {
    throw new Error(`Client ${client_id} not found`);
  }

  try {
    const deviceId = clientConfig.wassenger.deviceId;
    const chatWid = phone_number.includes('@c.us') ? phone_number : `${phone_number}@c.us`;

    const response = await axios.patch(
      `https://api.wassenger.com/v1/chat/${deviceId}/chats/${chatWid}/labels?upsert=true`, 
      labels,
      {
        headers: {
          "Token": clientConfig.wassenger.apiKey
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Error adding labels [${labels}] to ${phone_number}:`, error.response?.data || error.message);
    // Don't throw for internal label ops, just return failure
    return { success: false, error: error.message };
  }
};

/**
 * Updates contact metadata in Wassenger.
 */
export const updateContactMetadata = async (args: { client_id: string; phone_number: string; metadata: Record<string, string> }) => {
  const { client_id, phone_number, metadata } = args;
  const clientConfig = clients[client_id];

  if (!clientConfig) {
    throw new Error(`Client ${client_id} not found`);
  }

  try {
    const deviceId = clientConfig.wassenger.deviceId;
    const chatWid = phone_number.includes('@c.us') ? phone_number : `${phone_number}@c.us`;

    const formattedMetadata = Object.entries(metadata).map(([key, value]) => ({ key, value }));

    const response = await axios.patch(
      `https://api.wassenger.com/v1/chat/${deviceId}/contacts/${chatWid}`, 
      {
        metadata: formattedMetadata
      },
      {
        headers: {
          "Token": clientConfig.wassenger.apiKey
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(`Error updating metadata for ${phone_number}:`, error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Hands off the conversation to a human agent by adding a label.
 */
export const crmHandoffHuman = async (args: { client_id: string; phone_number: string }) => {
  const result = await addLabelToChat({
    client_id: args.client_id,
    phone_number: args.phone_number,
    labels: ["humano"]
  });

  if (!result.success) {
     throw new Error(`Failed to handoff to human: ${result.error}`);
  }

  return { content: [{ type: "text", text: JSON.stringify({ success: true, data: result.data }) }] };
};
