import { NextApiRequest, NextApiResponse } from "next";
import sendWhatsAppMessage from "./sendWhatsAppMessage";

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('WEBHOOK_VERIFIED');
                res.status(200).send(challenge); // Respond with the challenge token from the query
            } else {
                res.status(403);
            }
        }
    } else if (req.method === 'POST') {
        try {
            const incomingMessage = req.body;

            const senderPhone = incomingMessage?.from?.phone_number;
            const receivedText = incomingMessage?.message?.text;

            if (senderPhone && receivedText) {
                // Testing: Send the received message back to the sender
                const responseData = await sendWhatsAppMessage(senderPhone, receivedText);

                console.log("WhatsApp Message Sent:", {
                    to: senderPhone,
                    message: receivedText,
                    responseData
                });

                res.status(200).json({ message: 'Message echoed successfully.' });
            } else {
                console.error("Invalid message format");
                res.status(400).json({ error: 'Invalid message format.' });
            }
        } catch (error) {
            console.error("Error echoing message:", error);
            res.status(500).json({ error: 'Failed to echo message.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed.' });
    }
}
