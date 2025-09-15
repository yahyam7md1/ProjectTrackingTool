import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X } from 'lucide-react';

// Define the type of notification
type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Define the structure of a notification
interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

// Define the context interface
interface ToastContextProps {
  addToast: (message: string, type: NotificationType) => void;
  removeToast: (id: string) => void;
}

// Create the context with default values
const ToastContext = createContext<ToastContextProps>({
  addToast: () => {},
  removeToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Notification[]>([]);

  const addToast = (message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove the toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg max-w-sm animate-slide-in flex items-center justify-between
              ${toast.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : ''}
              ${toast.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' : ''}
              ${toast.type === 'info' ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' : ''}
            `}
          >
            <div className="pr-2">{toast.message}</div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;