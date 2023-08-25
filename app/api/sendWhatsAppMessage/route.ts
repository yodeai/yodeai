
import { NextResponse, NextRequest} from 'next/server'
import { sendWhatsAppMessage } from "./sendMessage";

export async function POST(request: NextRequest) {
    try {
        const { to, message, messageId } = await request.json(); // Destructure messageId from req.body
        const responseData = await sendWhatsAppMessage(to, message, messageId); // Pass messageId along

        console.log("WhatsApp Message Sent:", {
            to,
            message,
            messageId,
            responseData
        });
        return new NextResponse(
            JSON.stringify({ message: 'Message sent successfully.' }),
            { status: 200 }
          );
    } catch (error) {
        console.error("Error sending message");
        return new NextResponse(
            JSON.stringify({ error: 'Failed to send message.' }),
            { status: 500 }
          );
    }

}
