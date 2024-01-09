import LensViewOnlyForm from '@components/LensViewOnlyForm';
import React, { ReactNode } from 'react';

interface ViewLayoutProps {
  children: ReactNode;
}

const ViewLayout: React.FC<ViewLayoutProps> = ({ children }) => {
    return (
        <>        
            <div>       
                    {children}   
            </div>            
        </>
  );
};

export default ViewLayout;
