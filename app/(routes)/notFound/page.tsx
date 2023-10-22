import React from 'react';
import Container from "@components/Container";

const NotFoundPage = () => {
  return (
    <Container className="max-w-3xl ">
      
    <div className="w-full flex flex-col p-8">
      <h1>404 - Not Found</h1>
      <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
      <p>Sorry, either the page you are looking for does not exist, or you do not have permission to view it.</p>
    </div>
  </div>
    
  </Container >
  );
};

export default NotFoundPage;