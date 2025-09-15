import React, { useState } from 'react';
import { PlusIcon, UsersIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import ClientItem, { Client } from './ClientItem';
import apiService from '../../api/apiService';
import { useToast } from '../ui/ToastProvider';

interface ClientsListProps {
  projectId: string;
  clients: Client[];
  onAddClient: (email: string) => void;
  onRemoveClient: (clientId: string) => void;
  refetchData?: () => void;
  hideHeader?: boolean; // New prop to hide the header when it's shown in the parent
  hideForm?: boolean; // New prop to hide the form when it's shown in the parent
}

const ClientsList: React.FC<ClientsListProps> = ({
  projectId,
  clients,
  onAddClient,
  onRemoveClient,
  refetchData,
  hideHeader = false,
  hideForm = false
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email) {
      setError('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if email is already in use
    if (clients.some(client => client.email.toLowerCase() === email.toLowerCase())) {
      setError('This client is already added to the project');
      return;
    }

    // Clear any previous errors
    setError(null);
    
    try {
      // Make API request to add client
      const response = await apiService.post(`/admin/projects/${projectId}/clients`, { email });
      
      // Handle partial success (client added but email failed)
      if (response.data.partialSuccess) {
        addToast('Client added, but notification email could not be sent', 'warning');
        setError('Client added, but we couldn\'t send them a notification email. They may have limited access.');
      } else {
        // Complete success
        addToast(`Client ${email} added successfully`, 'success');
      }
      
      // Add the client via the parent component handler
      onAddClient(email);
      
      // Clear the input field
      setEmail('');
      
      // Refresh data to ensure UI is in sync
      if (refetchData) {
        refetchData();
      }
    } catch (err: any) {
      console.error('Error adding client:', err);
      
      // Handle different error types
      if (err.response?.data?.validationError) {
        // This is an email validation error
        const errorMsg = err.response.data.error || 'Invalid email address. Please check and try again.';
        setError(errorMsg);
        addToast(errorMsg, 'error');
      } else if (err.response?.status === 400) {
        // Bad request - likely invalid input
        const errorMsg = err.response.data.error || 'Invalid input. Please check and try again.';
        setError(errorMsg);
        addToast(errorMsg, 'error');
      } else {
        // Generic server error
        setError('Failed to add client. Please try again.');
        addToast('Failed to add client. Please try again.', 'error');
      }
    }
  };

  return (
    <Card className="w-full border bg-white">
      {!hideHeader && (
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-xl font-semibold">Client Access</CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="p-4">
        {/* Add Client Form - only show if not hidden */}
        {!hideForm && (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="clientEmail" className="sr-only">
                  Client email address
                </label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="Client email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className={error ? 'border-error' : ''}
                />
                {error && <p className="mt-1 text-xs text-error">{error}</p>}
              </div>
              <Button 
                type="submit"
                leftIcon={<PlusIcon className="h-4 w-4" />}
                className="whitespace-nowrap"
              >
                Add Client
              </Button>
            </div>
          </form>
        )}
        
        {/* Client List or Empty State */}
        {clients.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-10 text-center">
            <div className="flex flex-col items-center justify-center">
              <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No clients assigned</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-sm">
                Add clients to provide them access to this project.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div className="space-y-2">
              {clients.map(client => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ClientItem
                    client={client}
                    onRemove={onRemoveClient}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsList;
