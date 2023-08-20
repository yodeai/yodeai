import { NextApiRequest, NextApiResponse } from "next";
import { sendWhatsAppMessage } from "./sendWhatsAppMessage";
import { getAnswerForQuestion } from "./answerQuestion";  // import the new function

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
            const receivedMessages = req.body.entry.flatMap((entry: any) =>
                (entry.changes && entry.changes.flatMap((change: any) =>
                    (change.field === "messages" && change.value && change.value.messages) || []
                )) || []
            );

            if (receivedMessages.length > 0) {
                // Assuming one message at a time, you can loop through for multiple
                const userMessage = receivedMessages[0].text.body;
                const originalMessageId = receivedMessages[0].id;

                try {
                    if (userMessage) {
                        const answerResponse = await getAnswerForQuestion(userMessage);  // use the new function here
                        const responseText = answerResponse.response;

                        if (responseText) {
                            await sendWhatsAppMessage(receivedMessages[0].from, responseText, originalMessageId);
                        } else {
                            console.error("No response received from answerQuestionWithLogging");
                        }
                    } else {
                        console.error("Received empty userMessage");
                    }

                    return res.status(200).json({ message: 'Message sent.' });
                } catch (error) {
                    console.error("Error processing or sending message:", error);
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
