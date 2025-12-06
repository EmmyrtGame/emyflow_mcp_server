
import axios from 'axios';
import { clients } from '../config/clients';

const WASSENGER_API_URL = 'https://api.wassenger.com/v1/messages';

/**
 * Sends a scheduled message using Wassenger API.
 */
export const scheduleWassengerMessage = async (
  apiKey: string,
  deviceId: string,
  phone: string,
  message: string,
  deliverAt: string
) => {
  try {
    const response = await axios.post(
      WASSENGER_API_URL,
      {
        phone,
        message,
        deliverAt,
        device: deviceId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Token': apiKey
        }
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error scheduling Wassenger message:', error.response?.data || error.message);
    // Don't throw, just log error to avoid breaking the appointment flow
    return null;
  }
};

/**
 * Schedules reminders for an appointment (24h, 6h, 3h before).
 */
export const scheduleAppointmentReminders = async (
  client_id: string,
  phone: string,
  appointmentTimeStr: string,
  patientName: string
) => {
  const clientConfig = clients[client_id];
  if (!clientConfig || !clientConfig.reminderTemplates) {
    console.warn(`Client ${client_id} missing config or reminderTemplates`);
    return;
  }

  const appointmentTime = new Date(appointmentTimeStr);
  const now = new Date();

  // Helper to format time for the message
  const timeFormatted = appointmentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  
  // Calculate reminder times
  const reminders = [
    { label: '24h', details: { hours: 24 } },
    { label: '3h', details: { hours: 3 } },
    { label: '1h', details: { hours: 1 } },
  ];

  for (const reminder of reminders) {
    const template = clientConfig.reminderTemplates[reminder.label as keyof typeof clientConfig.reminderTemplates];
    if (!template) continue;

    const reminderTime = new Date(appointmentTime);
    reminderTime.setHours(reminderTime.getHours() - reminder.details.hours);

    // Only schedule if the reminder time is in the future
    if (reminderTime > now) {
      const message = template
        .replace('{name}', patientName)
        .replace('{time}', timeFormatted);

      try {
        await scheduleWassengerMessage(
            clientConfig.wassenger.apiKey, 
            clientConfig.wassenger.deviceId, // Ensure we use the correct deviceId
            phone, 
            message, 
            reminderTime.toISOString()
        );
        console.log(`Scheduled ${reminder.label} reminder for ${phone} at ${reminderTime.toISOString()}`);
      } catch (e) {
        console.error(`Failed to schedule ${reminder.label} reminder`, e);
      }
    }
  }
};
