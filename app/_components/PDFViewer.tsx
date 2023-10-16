
import React from 'react';

interface PDFViewerIframeProps {
  url: string;
  width?: string | number;
  height?: string | number;
}

const PDFViewerIframe: React.FC<PDFViewerIframeProps> = ({ url, width = "100%", height = "600px" }) => {
  return (
    <iframe 
      src={url} 
      width={width} 
      height={height} 
      style={{ border: "none" }}
      title="PDF Document"
    />
  );
}

export default PDFViewerIframe;
