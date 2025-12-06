import axios from 'axios';

const payload = {
    "id": "A58015C144587224782AD73D92323BE5",
    "object": "message",
    "event": "message:in:new",
    "created": 1764866063,
    "device": {
        "id": "692f4267d8c35034205c0602",
        "phone": "+5215536095485",
        "alias": "DentalCare",
        "plan": "io-professional"
    },
    "data": {
        "id": "A58015C144587224782AD73D92323BE5",
        "type": "text",
        "flow": "inbound",
        "status": "active",
        "ack": "delivered",
        "from": "5215532838460@c.us",
        "fromNumber": "+5215532838460",
        "to": "5215536095485@c.us",
        "toNumber": "+5215536095485",
        "date": "2025-12-04T16:34:23.000Z",
        "timestamp": 1764866063,
        "body": "Necesito amalgamas, reponer 2 muelas y posiblemente 3 dientes de enfrente",
        "chat": {
            "id": "5215532838460@c.us",
            "name": "Tlapaleria Escalona",
            "contact": {
                "name": "Tlapaleria Escalona",
                "phone": "+5215532838460"
            }
        }
    }
};

const sendWebhook = async () => {
    try {
        console.log('Sending webhook...');
        const response = await axios.post('http://localhost:3000/webhooks/whatsapp', payload);
        console.log('Response:', response.data);
    } catch (error: any) {
        console.error('Error:', error.message);
    }
};

sendWebhook();
