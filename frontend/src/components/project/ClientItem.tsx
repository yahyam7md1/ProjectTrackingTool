import React from 'react';
import { X, Mail, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(client.id)}
        className="text-gray-400 hover:text-error hover:bg-error/5"
        aria-label="Remove client"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ClientItem;
