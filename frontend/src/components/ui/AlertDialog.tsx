import React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionLabel?: string;
  cancelLabel?: string;
  onAction?: () => void;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  actionLabel = 'OK',
  cancelLabel,
  onAction,
  variant = 'info'
}) => {
  // Variant-based styling
  const getTitleStyle = () => {
    switch (variant) {
      case 'success':
        return 'text-green-700';
      case 'warning':
        return 'text-amber-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay 
          className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
        />
        <AlertDialogPrimitive.Content 
          className="fixed top-[50%] left-[50%] max-w-[90vw] w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%]"
        >
          <AlertDialogPrimitive.Title className={cn("text-lg font-semibold mb-2", getTitleStyle())}>
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="text-gray-600 mb-5">
            {description}
          </AlertDialogPrimitive.Description>
          <div className="flex justify-end gap-3">
            {cancelLabel && (
              <AlertDialogPrimitive.Cancel asChild>
                <Button variant="secondary" onClick={onClose}>
                  {cancelLabel}
                </Button>
              </AlertDialogPrimitive.Cancel>
            )}
            <AlertDialogPrimitive.Action asChild>
              <Button 
                variant={
                  variant === 'success' ? 'primary' : 
                  variant === 'warning' ? 'primary' :
                  variant === 'error' ? 'destructive' : 
                  'primary'
                } 
                onClick={() => {
                  onAction?.();
                  onClose();
                }}
              >
                {actionLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};

export default AlertDialog;