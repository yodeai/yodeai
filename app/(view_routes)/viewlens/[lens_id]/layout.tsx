import LensViewOnlyForm from '@components/LensViewOnlyForm';
import QuestionAnswerForm from '@components/Pages/Toolbar/LensQuestions/QuestionListComponent';
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
