import React from 'react';
import { X, Mail, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Trash2 } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';



export type Client = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
};

interface ClientItemProps {
  client: Client;
  onRemove: (clientId: string) => void;
}

const ClientItem: React.FC<ClientItemProps> = ({ client, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3">
        {client.avatar ? (
          <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shadow-sm">
            <img src={client.avatar} alt={client.name || client.email} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center shadow-sm",
            "bg-primary/10 text-primary font-medium"
          )}>
            {(client.name ? client.name[0] : client.email[0]).toUpperCase()}
          </div>
        )}
        <div>
          <div className="font-medium text-gray-900 mb-0.5">{client.email}</div>
          {client.name && (
            <div className="text-sm text-gray-500 flex items-center">
              {client.name}
              {client.role && (
                <>
                  <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-300" />
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{client.role}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <Button
            variant="destructive"
            size="sm"
            aria-label="Remove client"
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-6 rounded-lg shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Remove Client
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-5">
              Are you sure you want to remove this client? They will no longer have access to the project.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onRemove(client.id)}
                >
                  Remove
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

export default ClientItem;
