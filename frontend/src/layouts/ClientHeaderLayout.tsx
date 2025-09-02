import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

interface ClientHeaderLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const ClientHeaderLayout: React.FC<ClientHeaderLayoutProps> = ({ children, pageTitle }) => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Logo */}
            <div className="text-primary font-bold text-xl">PhaseTracker</div>
          </div>
          <Button 
            variant="ghost" 
            leftIcon={<LogOut size={16} />}
            aria-label="Logout"
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Content Area */}
      <main>
        {pageTitle && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{pageTitle}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default ClientHeaderLayout;
