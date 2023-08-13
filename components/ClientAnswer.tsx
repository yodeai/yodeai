import React, { useState, useEffect } from 'react';

const ClientAnswer: React.FC = () => {
  const [answer, setAnswer] = useState<string | null>(null);

  useEffect(() => {
    fetch('/answer')
      .then(response => response.text())
      .then(data => {
        setAnswer(data);
      })
      .catch(error => {
        console.error('Error fetching the answer:', error);
      });
  }, []);

  return <>{answer || 'Loading...'}</>;
};

export default ClientAnswer;
