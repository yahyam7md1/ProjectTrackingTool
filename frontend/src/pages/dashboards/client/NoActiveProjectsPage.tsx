import React from 'react';
import { FolderArchiveIcon } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import ClientHeaderLayout from '../../../layouts/ClientHeaderLayout';

const NoActiveProjectsPage: React.FC = () => {
  // We're using ClientHeaderLayout which has its own logout button
  const { } = useAuth(); // Auth context still available if needed

  return (
    <ClientHeaderLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Icon showing empty/waiting state */}
          <FolderArchiveIcon className="h-16 w-16 text-gray-400 mb-6" />
          
          {/* Main heading */}
          <h1 className="text-2xl font-bold text-text-primary mb-3">
            You're All Caught Up!
          </h1>
          
          {/* Explanation paragraph */}
          <p className="text-lg text-gray-500 max-w-md mb-8">
            You currently have no active projects assigned to you. If you believe this is an error, 
            please contact your project manager.
          </p>
          
          {/* Additional contact button - the logout is already in header */}
          {/* <Button 
          <Button 
            variant="secondary"
            className="shadow-sm"
          >
            Contact Support
          </Button>
          */}
        </div>
      </div>
    </ClientHeaderLayout>
  );
};

export default NoActiveProjectsPage;
