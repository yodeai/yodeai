import React, { useState, useEffect } from 'react';

const VectorSearchPage: React.FC = () => {
  const [output, setOutput] = useState<any | null>(null);

  useEffect(() => {
    const fetchOutput = async () => {
      const response = await fetch('/api/vectorSearch');
      const data = await response.json();
      setOutput(data);
    };

    fetchOutput();
  }, []);

  return (
    <div>
      <h1>Vector Search Results</h1>
      {output ? (
        <pre>{JSON.stringify(output, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default VectorSearchPage;
