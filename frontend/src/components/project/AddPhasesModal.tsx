import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, MoveVertical } from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { cn } from '../../utils/cn';

interface AddPhasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhases: (phases: { name: string; description: string }[]) => Promise<void>;
  // Already correctly typed as Promise<void>
}

// Component for each sortable input field in step 2
const SortablePhaseInput = ({ 
  id, 
  index, 
  name, 
  description, 
  onChange 
}: { 
  id: string;
  index: number;
  name: string; 
  description: string;
  onChange: (id: string, field: 'name' | 'description', value: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-white p-4 mb-3 rounded-lg border shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Phase {index + 1}</div>
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded-full"
        >
          <MoveVertical className="h-4 w-4 text-gray-500" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor={`phase-name-${id}`} className="text-sm font-medium text-gray-700">
            Phase Name
          </label>
          <Input 
            id={`phase-name-${id}`}
            value={name}
            onChange={(e) => onChange(id, 'name', e.target.value)}
            placeholder="Enter phase name"
            className="w-full"
          />
        </div>
        
        <div className="space-y-1">
          <label htmlFor={`phase-description-${id}`} className="text-sm font-medium text-gray-700">
            Description
          </label>
          <Input 
            id={`phase-description-${id}`}
            value={description}
            onChange={(e) => onChange(id, 'description', e.target.value)}
            placeholder="Enter phase description"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

const AddPhasesModal: React.FC<AddPhasesModalProps> = ({ isOpen, onClose, onAddPhases }) => {
  // Steps: 1 = number input, 2 = phase details
  const [step, setStep] = useState(1);
  const [phaseCount, setPhaseCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced state with both UI needs (id for DnD) and API needs (name, description)
  const [phaseInputs, setPhaseInputs] = useState<Array<{
    id: string;
    name: string;
    description: string;
  }>>([]);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance (in px) before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle form step changes
  const handleNextStep = () => {
    if (step === 1 && phaseCount > 0) {
      // Initialize phase inputs with proper default values
      const initialPhases = Array.from({ length: phaseCount }, (_, i) => ({
        id: `phase-${i}`,
        name: `Phase ${i + 1}`, // Default name that can be edited
        description: '', // Empty description by default
      }));
      
      // Update the phase inputs state
      setPhaseInputs(initialPhases);
      
      // Move to the next step
      setStep(2);
    }
  };

  const handleBackStep = () => {
    setStep(1);
  };

  // Handle phase input changes
  const handlePhaseInputChange = (id: string, field: 'name' | 'description', value: string) => {
    setPhaseInputs(prevInputs => {
      // Find the index of the phase we want to update
      const index = prevInputs.findIndex(input => input.id === id);
      
      // If the phase wasn't found (should not happen), return unchanged state
      if (index === -1) return prevInputs;
      
      // Create a new array with the updated phase
      const updatedInputs = [...prevInputs];
      updatedInputs[index] = { ...updatedInputs[index], [field]: value };
      
      return updatedInputs;
    });
  };

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setPhaseInputs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Logging for debugging
    console.log("MODAL: handleSubmit function was CALLED.");
    
    // Reset any previous errors
    setError(null);
    
    // Map phaseInputs to only include name and description fields needed by the API
    const phasesForApi = phaseInputs.map(phase => ({
      name: phase.name.trim(),
      description: phase.description.trim()
    }));
    
    // Validate that all phases have a name
    const emptyNamePhases = phasesForApi.filter(phase => phase.name === '');
    
    if (emptyNamePhases.length > 0) {
      setError(`Please provide a name for all phases (${emptyNamePhases.length} missing)`);
      return;
    }
    
    try {
      setSubmitting(true);
      // Log data before calling the parent's handler
      console.log("MODAL: About to call onAddPhases with this data:", phasesForApi);
      
      // Call the parent's handler to actually add the phases
      // Note: Don't close the modal or reset form here - let the parent component handle that
      // after the API operations complete successfully
      await onAddPhases(phasesForApi);
      
      // Log after successfully calling the parent's handler
      console.log("MODAL: onAddPhases prop was successfully EXECUTED.");
      
      // Don't reset the form or close the modal here
      // The parent component will handle this in the proper order
      // The parent's handleAddPhases will call onClose() at the right time
    } catch (err) {
      console.error('Error submitting phases:', err);
      setError('Failed to create phases. Please try again.');
      // Only in the error case, we stay in the modal to show the error
    } finally {
      setSubmitting(false);
    }
  };

  // Reset the form
  const resetForm = () => {
    setStep(1);
    setPhaseCount(1);
    setPhaseInputs([]);
    setError(null);
    setSubmitting(false);
  };

  // Close handler that also resets the form
  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%]">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
            {step === 1 ? 'Add New Phases' : 'Configure Phases'}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Create new phases for your project by entering the quantity and details for each phase.
          </Dialog.Description>

          {/* Step 1: Number of phases */}
          {step === 1 && (
            <div className="space-y-1">
              <label htmlFor="phase-count" className="text-sm font-medium text-gray-700">
                How many phases do you want to create?
              </label>
              <Input
                id="phase-count"
                type="number"
                value={phaseCount.toString()}
                onChange={(e) => setPhaseCount(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={20}
                className="w-full"
              />
            </div>
          )}

          {/* Step 2: Phase details */}
          {step === 2 && (
            <div className="mt-4 mb-6">
              <p className="text-sm text-gray-500 mb-4">
                Configure your phases and drag to reorder them. <span className="font-medium text-primary">Phase names are required.</span>
              </p>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={phaseInputs.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {phaseInputs.map((phase, index) => (
                      <SortablePhaseInput
                        key={phase.id}
                        id={phase.id}
                        index={index}
                        name={phase.name}
                        description={phase.description}
                        onChange={handlePhaseInputChange}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {/* Modal footer with actions */}
          <div className="mt-6 flex justify-end gap-3">
            {step === 2 && (
              <Button 
                variant="secondary" 
                onClick={handleBackStep}
                disabled={submitting}
              >
                Back
              </Button>
            )}
            
            {step === 1 ? (
              <Button onClick={handleNextStep}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
              >
                {submitting ? (
                  <>Creating Phases...</>
                ) : (
                  <>Create Phases</>
                )}
              </Button>
            )}
          </div>

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
  );
};

export default AddPhasesModal;
