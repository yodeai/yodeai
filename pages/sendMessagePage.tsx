import React from 'react';

const SendMessagePage: React.FC = () => {
  const sendWhatsApp = async () => {
    try {
      // Replace this with your endpoint URL
      const url = '/api/sendWhatsAppMessage';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: '16509969470', 
          message: 'Hello World! I am yodeai'
        })
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
      <button onClick={sendWhatsApp}>Send Message</button>
    </div>
  );
};

export default SendMessagePage;
