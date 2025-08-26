import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import Input from '../ui/Input';

export interface ProjectSettings {
  name: string;
  description: string;
}

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialSettings: ProjectSettings;
  onSave: (settings: ProjectSettings) => void;
  onDelete: () => void;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialSettings,
  onSave,
  onDelete,
}) => {
  const [settings, setSettings] = useState<ProjectSettings>(initialSettings);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Reset form when the modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%]">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Project Settings
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Update your project name and description or delete the project if needed.
            </Dialog.Description>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Project Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={settings.name}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={settings.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder:text-gray-400 bg-white text-text-primary shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-error mb-3">Danger Zone</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Once you delete a project, there is no going back. This action cannot be undone.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete Project
                </Button>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>

            {/* Close button */}
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed top-[50%] left-[50%] max-w-[90vw] w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%]">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Delete Project
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-500 mb-5">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-error flex-shrink-0 mr-2" />
                <p>
                  Are you sure you want to delete this project? This action cannot be undone and all project data will be permanently lost.
                </p>
              </div>
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="secondary">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                >
                  Delete Project
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
};

export default ProjectSettingsModal;
