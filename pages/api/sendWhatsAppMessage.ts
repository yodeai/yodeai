import { NextApiRequest, NextApiResponse } from "next";

export type WhatsAppPayload = {
    messaging_product: string;
    to: string;
    type: string;
    text: {
        preview_url: boolean;
        body: string;
    };
    context?: {
        message_id: string;
    };
};

export async function sendWhatsAppMessage(to: string, message: string, messageId?: string): Promise<any> {
    const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_API_PHONE_NUMBER_ID}/messages`;

    const payload: WhatsAppPayload = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
            "preview_url": false,
            "body": message
        }
    };
    if (messageId) {
        payload.context = {"message_id": messageId };
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
    };
    // Logging the main API call details
    //console.log('Making API call to:', WHATSAPP_API_URL);
    //console.log('Payload:', payload);
    //console.log('Headers:', headers);

    const res = await fetch(WHATSAPP_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const responseStatus = await res.status;
        const response = await res.text();
        throw new Error(`${responseStatus}: ${response}`);
    }

    const responseData = await res.json();
    return responseData;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { to, message, messageId } = req.body; // Destructure messageId from req.body
            const responseData = await sendWhatsAppMessage(to, message, messageId); // Pass messageId along

            console.log("WhatsApp Message Sent:", {
                to,
                message,
                messageId,
                responseData
            });

            res.status(200).json({ message: 'Message sent successfully.' });
        } catch (error) {
            console.error("Error sending message");
            res.status(500).json({ error: 'Failed to send message.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed.' });
    }
}
