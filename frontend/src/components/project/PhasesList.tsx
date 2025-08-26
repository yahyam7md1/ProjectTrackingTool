import React, { useEffect } from 'react';
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

  // Handle setting a phase as active
  const handleSetPhaseActive = async (phaseId: string) => {
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
            return { ...phase, status: 'active' as const };
          } else if (phase.status === 'active') {
            // Ensure only one phase is active at a time
            return { ...phase, status: 'pending' as const };
          }
          return phase;
        });
        onPhasesChange(updatedPhases);
      }
    } catch (error) {
      console.error('Error setting phase as active:', error);
    }
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
            return { ...phase, status: 'completed' as const };
          }
          return phase;
        });
        onPhasesChange(updatedPhases);
      }
    } catch (error) {
      console.error('Error completing phase:', error);
    }
  };

  // Handle updating a phase
  const handleUpdatePhase = async (phaseId: string, data: { name: string; description: string }) => {
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



  // Container to wrap the content
  return (
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
                        onSetActive={handleSetPhaseActive}
                        onComplete={handleCompletePhase}
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
  );
};

export default PhasesList;
