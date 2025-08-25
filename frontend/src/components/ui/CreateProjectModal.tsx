import React from 'react';
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
  const [projectName, setProjectName] = React.useState('');
  const [projectDescription, setProjectDescription] = React.useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateProject && projectName.trim()) {
      onCreateProject(projectName, projectDescription);
      setProjectName('');
      setProjectDescription('');
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-in">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold text-text-primary">
              Create New Project
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                className="rounded-full p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description</Label>
              <textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description"
                className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder:text-gray-400 bg-white text-text-primary shadow-sm transition min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full">
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
