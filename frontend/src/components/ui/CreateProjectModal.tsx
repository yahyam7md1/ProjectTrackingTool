import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from './Button';
import Input from './Input';
import Label from './Label';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject?: (name: string, description: string) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset form state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
    } else {
      // Clear form fields when modal is closed
      setName('');
      setDescription('');
      setIsSubmitting(false);
      setValidationError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name.trim()) {
      setValidationError('Project name is required');
      return;
    }
    
    setValidationError(null);
    setIsSubmitting(true);
    
    try {
      if (onCreateProject) {
        await onCreateProject(name, description);
        // Form will be reset when modal closes
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setValidationError('An error occurred while creating the project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%]">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Create New Project
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <div className="text-sm text-error p-2 bg-error/10 rounded border border-error/20">
                {validationError}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description</Label>
              <textarea
                id="projectDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder:text-gray-400 bg-white text-text-primary shadow-sm transition min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full" 
                loading={isSubmitting} 
                disabled={isSubmitting}
              >
                Create Project
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateProjectModal;
