import React from 'react';

function LoadingSkeleton() {
  return (
    <div className="skeleton-container">
      
      <div className="skeleton title mt-4"></div>
      <div className="skeleton line mt-8"></div>
      <div className="skeleton line"></div>
      <div className="skeleton line"></div>
    </div>
  );
}

export default LoadingSkeleton;
