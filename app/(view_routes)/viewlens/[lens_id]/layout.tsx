import LensViewOnlyForm from '@components/LensViewOnlyForm';
import QuestionAnswerForm from '@components/QuestionAnswerForm';
import React, { ReactNode } from 'react';

interface ViewLayoutProps {
  children: ReactNode;
}

const ViewLayout: React.FC<ViewLayoutProps> = ({ children }) => {
    //console.log("children:");
    //console.log(children);
    return (
        <>        
            <div>       
                    {children}   
            </div>            
        </>
  );
};

export default ViewLayout;
