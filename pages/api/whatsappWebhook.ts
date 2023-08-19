import { NextApiRequest, NextApiResponse } from "next";
import { sendWhatsAppMessage } from "./sendWhatsAppMessage";

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('WEBHOOK_VERIFIED');
                return res.status(200).send(challenge);
            } else {
                return res.status(403).send('Forbidden');
            }
        } else {
            return res.status(400).send('Invalid request parameters.');
        }
    } else if (req.method === 'POST') {
        // Check if it's a received user message
        if (req.body && req.body.entry) {
            const hasReceivedMessage = req.body.entry.some((entry: any) => 
                entry.changes && entry.changes.some((change: any) => 
                    change.field === "messages" && change.value && change.value.messages
                )
            );

            if (hasReceivedMessage) {
                try {
                    // Send a test message and the received body
                    await sendWhatsAppMessage("16509969470", "Message received!");
                    await sendWhatsAppMessage("16509969470", JSON.stringify(req.body));
                    return res.status(200).json({ message: 'Test messages sent.' });
                } catch (error) {
                    console.error("Error sending message:", error);
                    return res.status(500).json({ error: 'Failed to send message.' });
                }
            }
        }

        // If it's not a user message or some other event, just send a 200 OK 
        return res.status(200).json({ message: 'Webhook received.' });
    } else {
        return res.status(405).json({ error: 'Method not allowed.' });
    }
}

export default handler;
