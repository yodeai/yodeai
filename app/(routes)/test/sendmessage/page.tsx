"use client";
import React, { useState } from 'react';
import { WhatsAppPayload } from '../../../api/sendWhatsAppMessage/sendMessage';

const SendMessagePage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>('16509969470');
  const [messageText, setMessageText] = useState<string>('Hello World! I am yodeai');
  const [messageId, setMessageId] = useState<string>('');

  const sendWhatsApp = async () => {
    try {
      
      const url = '/api/sendWhatsAppMessage';

      const payload = {
        to: phoneNumber,
        message: messageText,
        messageId: ""
      };
 
      if (messageId) {
       
        payload['messageId'] = messageId;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Message sent successfully!');
      } else {
        alert('Failed to send message.');
      }
    } catch (error) {
      console.error("Error:", error);
      alert('An error occurred.');
    }
  };

  return (
    <div>
      <h1>Send WhatsApp Message</h1>
      <div>
        <label>
          Phone Number:
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Message Text:
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Message ID (optional):
          <input
            type="text"
            value={messageId}
            onChange={(e) => setMessageId(e.target.value)}
            placeholder="Enter message ID (if available)"
          />
        </label>
      </div>
      <button onClick={sendWhatsApp}>Send Message</button>
    </div>
  );
};

export default SendMessagePage;
