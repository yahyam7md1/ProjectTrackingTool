import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import EnhancedPhaseItem, { Phase } from './EnhancedPhaseItem';
import apiService from '../../api/apiService';

interface PhasesListProps {
  projectId: string;
  phases: Phase[];
  onPhasesChange: (phases: Phase[]) => void;
  refetchData?: () => Promise<void>; // Changed to Promise<void> to support async/await
  hideHeader?: boolean; // New prop to hide the header when it's shown in the parent
  onAddPhaseClick?: () => void; // Function to handle add phase button click
}

const PhasesList: React.FC<PhasesListProps> = ({ 
  projectId, 
  phases, 
  onPhasesChange,
  refetchData,
  hideHeader = false,
  onAddPhaseClick
}) => {
  console.log("PHASES LIST RENDERED. Received phases:", phases);
  
  // State for the confirmation dialog
  const [activationCandidateId, setActivationCandidateId] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("PHASES LIST: The 'phases' prop has CHANGED. New value:", phases);
    console.log("PHASES LIST: JSON representation:", JSON.stringify(phases));
    console.log("PHASES LIST: Array reference type:", Object.prototype.toString.call(phases));
  }, [phases]);
  
  // Set up DnD sensors with touch-friendly configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min distance (in px) before drag starts - helps with mobile touch
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle phase reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = phases.findIndex((phase) => phase.id === active.id);
      const newIndex = phases.findIndex((phase) => phase.id === over.id);

      // Create new array with updated order
      const reorderedPhases = arrayMove(phases, oldIndex, newIndex).map(
        (phase, index) => ({ ...phase, order: index })
      );

      try {
        // Extract just the IDs for the API request with the correct key name
        // Convert string IDs to numbers as the backend expects numeric IDs
        const orderedPhaseIds = reorderedPhases.map(phase => parseInt(phase.id));
        
        console.log('Sending reorder request with:', { orderedPhaseIds });
        
        // Call API to reorder phases with the correct key name
        await apiService.put(`/admin/projects/${projectId}/phases/reorder`, {
          orderedPhaseIds: orderedPhaseIds
        });
        
        // Update UI via parent component
        onPhasesChange(reorderedPhases);
        
        // Refresh data to ensure we have the latest state
        if (refetchData) {
          // Use await to ensure the refetch completes
          await refetchData();
          console.log("Phases reordered and data refetched");
        }
      } catch (error) {
        console.error('Error reordering phases:', error);
      }
    }
  };

  // Smart handler to check if another phase is active
  const handleSetActiveClick = (phaseId: string) => {
    // Check if any other phase is currently active
    const isAnotherPhaseActive = phases.some(p => p.is_active);
    
    if (isAnotherPhaseActive) {
      // If another phase is active, open the confirmation dialog
      setActivationCandidateId(phaseId);
    } else {
      // If no phase is active, proceed with activation directly
      executeSetActive(phaseId);
    }
  };
  
  // Execute phase activation (called directly or after confirmation)
  const executeSetActive = async (phaseId: string) => {
    try {
      // Call API to set phase as active
      await apiService.post(`/admin/projects/${projectId}/phases/${phaseId}/set-active`);
      
      // Update UI via refetch
      if (refetchData) {
        // Use await to ensure the refetch completes
        await refetchData();
        console.log("Phase set as active and data refetched");
      } else {
        // Fallback UI update if refetch isn't available
        const updatedPhases = phases.map(phase => {
          if (phase.id === phaseId) {
            // Set the selected phase as active and not completed
            return { ...phase, is_active: true, is_completed: false };
          } else if (phase.is_active) {
            // Only the currently active phase should be set as completed
            return { ...phase, is_active: false, is_completed: true };
          }
          // All other phases remain unchanged
          return phase;
        });
        onPhasesChange(updatedPhases);
      }
      
      // Clear the activation candidate ID
      setActivationCandidateId(null);
    } catch (error) {
      console.error('Error setting phase as active:', error);
      // Clear the activation candidate ID on error too
      setActivationCandidateId(null);
    }
  };
  
  // Legacy function for backward compatibility
  const handleSetPhaseActive = (phaseId: string) => {
    handleSetActiveClick(phaseId);
  };

  // Handle completing a phase
  const handleCompletePhase = async (phaseId: string) => {
    try {
      // Call API to set phase as complete
      await apiService.post(`/admin/projects/${projectId}/phases/${phaseId}/set-complete`);
      
      // Update UI via refetch
      if (refetchData) {
        // Use await to ensure the refetch completes
        await refetchData();
        console.log("Phase marked as complete and data refetched");
      } else {
        // Fallback UI update if refetch isn't available
        const updatedPhases = phases.map(phase => {
          if (phase.id === phaseId) {
            return { ...phase, is_active: false, is_completed: true };
          }
          return phase;
        });
        onPhasesChange(updatedPhases);
      }
    } catch (error) {
      console.error('Error completing phase:', error);
    }
  };
  
  // Handle reopening a completed phase
  const handleReopenPhase = async (phaseId: string) => {
    try {
      // Call API to reopen phase
      await apiService.post(`/admin/projects/${projectId}/phases/${phaseId}/reopen`);
      
      // Update UI via refetch
      if (refetchData) {
        // Use await to ensure the refetch completes
        await refetchData();
        console.log("Phase reopened and data refetched");
      } else {
        // Fallback UI update if refetch isn't available
        const updatedPhases = phases.map(phase => {
          if (phase.id === phaseId) {
            return { ...phase, is_active: false, is_completed: false };
          }
          return phase;
        });
        onPhasesChange(updatedPhases);
      }
    } catch (error) {
      console.error('Error reopening phase:', error);
    }
  };

  // Handle updating a phase
  const handleUpdatePhase = async (phaseId: string, data: { name: string; description: string; estimated_completion_at?: string | null }) => {
    try {
      console.log(`Updating phase ${phaseId} with data:`, data);
      
      // Call API to update phase
      // Note: The phaseId is sent as-is in the URL path, backend will parse it as needed
      await apiService.put(`/admin/projects/${projectId}/phases/${phaseId}`, data);
      
      // Update UI via refetch
      if (refetchData) {
        // Use await to ensure the refetch completes
        await refetchData();
        console.log("Phase updated and data refetched");
      } else {
        // Fallback UI update if refetch isn't available
        const updatedPhases = phases.map(phase => {
          if (phase.id === phaseId) {
            return { ...phase, ...data };
          }
          return phase;
        });
        onPhasesChange(updatedPhases);
      }
    } catch (error: any) {
      console.error('Error updating phase:', error);
      alert(`Failed to update phase: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  // Handle deleting a phase
  const handleDeletePhase = async (phaseId: string) => {
    try {
      console.log(`Deleting phase ${phaseId}`);
      
      // Call API to delete phase
      // Note: The phaseId is sent as-is in the URL path, backend will parse it as needed
      await apiService.delete(`/admin/projects/${projectId}/phases/${phaseId}`);
      
      // Update UI via refetch
      if (refetchData) {
        // Use await to ensure the refetch completes
        await refetchData();
        console.log("Phase deleted and data refetched");
      } else {
        // Fallback UI update if refetch isn't available
        const updatedPhases = phases
          .filter(phase => phase.id !== phaseId)
          .map((phase, index) => ({ ...phase, order: index }));
        onPhasesChange(updatedPhases);
      }
    } catch (error: any) {
      console.error('Error deleting phase:', error);
      alert(`Failed to delete phase: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  // Confirmation Dialog for Phase Activation
  const renderConfirmationDialog = () => {
    return (
      <AlertDialog.Root 
        open={!!activationCandidateId} 
        onOpenChange={(open) => !open && setActivationCandidateId(null)}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed top-[50%] left-[50%] max-w-[90vw] w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[2%] data-[state=open]:slide-in-from-bottom-[2%]">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Phase Activation
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-500 mb-5">
              Another phase is currently active. Activating this one will automatically complete the currently active phase only. Do you want to continue?
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="secondary" size="sm">
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => {
                    if (activationCandidateId) {
                      executeSetActive(activationCandidateId);
                    }
                  }}
                >
                  Confirm & Set Active
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    );
  };

  // Container to wrap the content
  return (
    <>
      <Card className="w-full border bg-white">
        {!hideHeader && (
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">Project Phases</CardTitle>
              <Button 
                size="sm" 
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={onAddPhaseClick}
                className="phases-list-add-button" // Add a class for easier targeting
              >
                Add Phase
              </Button>
            </div>
          </CardHeader>
        )}

        <CardContent className="p-4">
          {phases.length === 0 ? (
            // Empty state when there are no phases
            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-10 text-center">
              <div className="flex flex-col items-center justify-center">
                <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No phases yet</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-sm">
                  Add your first phase to get started with project planning.
                </p>
                {!hideHeader && (
                  <Button
                    variant="primary"
                    onClick={onAddPhaseClick}
                    leftIcon={<Plus className="h-4 w-4" />}
                    className="phases-list-add-button"
                  >
                    Add Your First Phase
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Regular view with phases list
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={phases.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence>
                  <motion.div className="space-y-3">
                    {phases.map((phase) => {
                      console.log(`PHASES LIST MAPPING: Rendering phase id=${phase.id}, name=${phase.name}`);
                      return (
                        <EnhancedPhaseItem
                          key={phase.id}
                          phase={phase}
                          projectId={projectId}
                          onSetActive={handleSetActiveClick}
                          onComplete={handleCompletePhase}
                          onReopen={handleReopenPhase}
                          onUpdate={handleUpdatePhase}
                          onDelete={handleDeletePhase}
                          refetchData={refetchData}
                        />
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
      {renderConfirmationDialog()}
    </>
  );
};

export default PhasesList;
