import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Collapsible from '@radix-ui/react-collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, CheckCircle, ChevronDown, ChevronUp, Trash2, Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { cn } from '../../utils/cn';
import apiService from '../../api/apiService';

export interface Phase {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_completed: boolean;
  order: number;
  createdAt?: string; // Optional field for metadata
  estimated_completion_at?: string | null; // Optional field for estimated completion date, can be null for cleared dates
}

// Helper function to derive phase status from is_active and is_completed flags
const getPhaseStatus = (phase: { is_active: boolean; is_completed: boolean }): 'active' | 'completed' | 'pending' => {
  if (phase.is_completed) {
    return 'completed';
  }
  if (phase.is_active) {
    return 'active';
  }
  return 'pending';
};

interface EnhancedPhaseItemProps {
  phase: Phase;
  projectId?: string;
  onSetActive?: (id: string) => void;
  onComplete?: (id: string) => void;
  onReopen?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onUpdate?: (id: string, data: { name: string; description: string; estimated_completion_at?: string | null }) => void;
  onDelete?: (id: string) => void;
  refetchData?: () => Promise<void>;
}

const EnhancedPhaseItem: React.FC<EnhancedPhaseItemProps> = ({ 
  phase, 
  projectId,
  onSetActive, 
  onComplete,
  onReopen,
  onDeactivate,
  onUpdate,
  onDelete,
  refetchData
}) => {
  const status = getPhaseStatus(phase);
  console.log(`PHASE ITEM RENDERED: id=${phase.id}, name=${phase.name}, status=${status}`);
  
  const [isOpen, setIsOpen] = useState(false);
  const [editName, setEditName] = useState(phase.name);
  const [editDescription, setEditDescription] = useState(phase.description);
  const [isEditing, setIsEditing] = useState(false);
  const [showEstimateInput, setShowEstimateInput] = useState(false);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState(phase.estimated_completion_at || '');
  
  // New handler function for setting a phase as active
  const handleSetActive = async () => {
    if (!projectId) {
      console.error('Cannot set phase as active: projectId is missing');
      return;
    }
    
    try {
      console.log(`Setting phase ${phase.id} as active for project ${projectId}`);
      
      // Make the API request to set this phase as active
      await apiService.post(`/admin/projects/${projectId}/phases/${phase.id}/set-active`);
      
      console.log('Phase set as active successfully');
      
      // If the parent component provided a refetch function, call it to update the UI
      if (refetchData) {
        await refetchData();
        console.log('Project data refetched after setting phase as active');
      }
    } catch (error) {
      console.error('Error setting phase as active:', error);
    }
  };
  
  // New handler function for marking a phase as complete
  const handleSetComplete = async () => {
    if (!projectId) {
      console.error('Cannot mark phase as complete: projectId is missing');
      return;
    }
    
    try {
      console.log(`Marking phase ${phase.id} as complete for project ${projectId}`);
      
      // Make the API request to mark this phase as complete
      await apiService.post(`/admin/projects/${projectId}/phases/${phase.id}/set-complete`);
      
      console.log('Phase marked as complete successfully');
      
      // If the parent component provided a refetch function, call it to update the UI
      if (refetchData) {
        await refetchData();
        console.log('Project data refetched after marking phase as complete');
      }
    } catch (error) {
      console.error('Error marking phase as complete:', error);
    }
  };
  
  // New handler function for reopening a completed phase
  const handleReopenPhase = async () => {
    if (!projectId) {
      console.error('Cannot reopen phase: projectId is missing');
      return;
    }
    
    try {
      console.log(`Reopening phase ${phase.id} for project ${projectId}`);
      
      // Make the API request to reopen this phase
      await apiService.post(`/admin/projects/${projectId}/phases/${phase.id}/reopen`);
      
      console.log('Phase reopened successfully');
      
      // If the parent component provided a refetch function, call it to update the UI
      if (refetchData) {
        await refetchData();
        console.log('Project data refetched after reopening phase');
      }
    } catch (error) {
      console.error('Error reopening phase:', error);
    }
  };
  
  // New handler function for deactivating an active phase (reuses the reopen endpoint)
  const handleDeactivatePhase = async () => {
    if (!projectId) {
      console.error('Cannot deactivate phase: projectId is missing');
      return;
    }
    
    try {
      console.log(`Deactivating phase ${phase.id} for project ${projectId}`);
      
      // Reuse the reopen endpoint since it provides the same functionality
      await apiService.post(`/admin/projects/${projectId}/phases/${phase.id}/reopen`);
      
      console.log('Phase deactivated successfully');
      
      // If the parent component provided a refetch function, call it to update the UI
      if (refetchData) {
        await refetchData();
        console.log('Project data refetched after deactivating phase');
      }
    } catch (error) {
      console.error('Error deactivating phase:', error);
    }
  };
  
  // Track phase prop changes and update local state
  useEffect(() => {
    console.log(`PHASE ITEM: Phase prop changed for id=${phase.id}`);
    setEditName(phase.name);
    setEditDescription(phase.description);
    setEstimatedCompletionDate(phase.estimated_completion_at || '');
  }, [phase]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusBadgeVariant = (status: 'pending' | 'active' | 'completed') => {
    switch (status) {
      case 'pending': return 'outline';
      case 'active': return 'default';
      case 'completed': return 'success';
      default: return 'outline';
    }
  };

  const handleUpdatePhase = () => {
    // Only proceed if the update handler exists and there are actual changes
    const hasChanges = 
      editName !== phase.name || 
      editDescription !== phase.description || 
      estimatedCompletionDate !== (phase.estimated_completion_at || '');
      
    if (onUpdate && hasChanges) {
      // Ensure we have valid data before sending the update
      if (editName.trim() === '') {
        alert('Phase name cannot be empty');
        return;
      }
      
      console.log(`Updating phase ${phase.id} with:`, {
        name: editName,
        description: editDescription,
        estimated_completion_at: estimatedCompletionDate || undefined
      });
      
      // Call the update handler from the parent component
      onUpdate(phase.id, {
        name: editName,
        description: editDescription,
        estimated_completion_at: estimatedCompletionDate || undefined
      });
    }
    // Exit editing mode and hide estimate input
    setIsEditing(false);
    setShowEstimateInput(false);
  };

  const handleCancel = () => {
    setEditName(phase.name);
    setEditDescription(phase.description);
    setEstimatedCompletionDate(phase.estimated_completion_at || '');
    setIsEditing(false);
    setShowEstimateInput(false);
  };

  // Prevent the collapsible from toggling when clicking on buttons or input fields
  const handleContentClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as Element).closest('button') ||
      (e.target as Element).closest('input') ||
      (e.target as Element).closest('textarea')
    ) {
      e.stopPropagation();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Collapsible.Root 
        open={isOpen} 
        onOpenChange={setIsOpen} 
        className={cn(
          "w-full mb-3 bg-white rounded-lg border shadow-sm",
          "transition-all duration-200",
          isDragging ? "opacity-50 ring-2 ring-primary/20" : "",
          isOpen ? "ring-1 ring-primary/30" : ""
        )}
      >
        <div ref={setNodeRef} style={style}>
          {/* Collapsible Trigger (Always Visible Part) */}
          <Collapsible.Trigger asChild>
            <div
              className={cn(
                "flex flex-col md:flex-row items-start md:items-center justify-between",
                "p-4 w-full cursor-pointer",
                isOpen ? "border-b border-gray-100" : ""
              )}
              onClick={handleContentClick}
            >
              {/* Handle and Content Container */}
              <div className="flex items-start w-full md:w-auto">
                {/* Drag Handle */}
                <div
                  {...attributes}
                  {...listeners}
                  className="mr-3 p-1 cursor-grab active:cursor-grabbing touch-none"
                  aria-label="Drag handle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>

                {/* Phase Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    <h3 className="text-base font-medium text-gray-900">{phase.name}</h3>
                    <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
                      {status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 md:mb-0 line-clamp-1">
                    {phase.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons and Toggle Indicator */}
              <div className="flex items-center gap-3 mt-3 md:mt-0 w-full md:w-auto">
                {/* Phase Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Set Active button clicked for phase:', phase.id);
                        if (onSetActive) {
                          onSetActive(phase.id);
                        } else if (projectId) {
                          handleSetActive();
                        } else {
                          console.error('Cannot set phase as active: both onSetActive and projectId are missing');
                        }
                      }}
                    >
                      Set Active
                    </Button>
                  )}
                  {status === 'active' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onComplete) {
                            onComplete(phase.id);
                          } else if (projectId) {
                            handleSetComplete();
                          } else {
                            console.error('Cannot mark phase as complete: both onComplete and projectId are missing');
                          }
                        }}
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        Mark as Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeactivate) {
                            onDeactivate(phase.id);
                          } else if (projectId) {
                            handleDeactivatePhase();
                          } else {
                            console.error('Cannot deactivate phase: both onDeactivate and projectId are missing');
                          }
                        }}
                      >
                        Deactivate
                      </Button>
                    </>
                  )}
                  {status === 'completed' && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      disabled
                      leftIcon={<CheckCircle className="w-4 h-4 text-success" />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Completed
                    </Button>
                  )}
                </div>
                
                {/* Toggle Indicator */}
                <div className="ml-auto md:ml-2">
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          </Collapsible.Trigger>
          
          {/* Collapsible Content (Expandable Part) */}
          <Collapsible.Content>
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <div className="space-y-4">
                  {/* Created Date */}
                  {phase.createdAt && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      <span>Created on: {new Date(phase.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                  
                  {/* Estimated Completion Date */}
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Estimated Completion Date</h4>
                    
                    {showEstimateInput || estimatedCompletionDate ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={estimatedCompletionDate}
                            onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                            disabled={!isEditing && !showEstimateInput}
                            className={!isEditing && !showEstimateInput ? "bg-gray-50" : ""}
                          />
                          
                          {/* Clear button for removing the date */}
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Set date to null and update the phase
                              if (onUpdate) {
                                onUpdate(phase.id, {
                                  name: editName,
                                  description: editDescription,
                                  estimated_completion_at: null
                                });
                                // Clear the local state too
                                setEstimatedCompletionDate('');
                              }
                            }}
                            disabled={!estimatedCompletionDate || (!isEditing && !showEstimateInput)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          
                          {!isEditing && showEstimateInput && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="primary" 
                                onClick={handleUpdatePhase}
                              >
                                Save Estimate
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => {
                                  setEstimatedCompletionDate(phase.estimated_completion_at || '');
                                  setShowEstimateInput(false);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {!showEstimateInput && estimatedCompletionDate && !isEditing && (
                          <div className="flex items-center text-sm text-gray-700">
                            <Calendar className="h-4 w-4 mr-1.5 text-primary-start" />
                            <span>Estimated completion: {new Date(estimatedCompletionDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setShowEstimateInput(true)}
                        disabled={isEditing}
                      >
                        Add Estimate
                      </Button>
                    )}
                  </div>
                  
                  {/* Reopen Button for Completed Phases */}
                  {status === 'completed' && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onReopen) {
                            onReopen(phase.id);
                          } else if (projectId) {
                            handleReopenPhase();
                          } else {
                            console.error('Cannot reopen phase: both onReopen and projectId are missing');
                          }
                        }}
                      >
                        Reopen Phase
                      </Button>
                    </div>
                  )}
                  
                  {/* Edit Form */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phase Name
                      </label>
                      <Input 
                        value={editName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50 text-gray-700" : ""}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea 
                        value={editDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                        disabled={!isEditing}
                        className={cn(
                          "w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
                          "focus:outline-none focus:ring-2 focus:ring-primary/50",
                          !isEditing ? "bg-gray-50 text-gray-700" : ""
                        )}
                        rows={3}
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between pt-2">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={handleUpdatePhase}
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Phase
                        </Button>
                      )}
                      
                      <AlertDialog.Root>
                        <AlertDialog.Trigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Delete
                          </Button>
                        </AlertDialog.Trigger>
                        <AlertDialog.Portal>
                          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                          <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-6 rounded-lg shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]">
                            <AlertDialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                              Delete Phase
                            </AlertDialog.Title>
                            <AlertDialog.Description className="text-sm text-gray-600 mb-5">
                              Are you sure you want to delete the phase "{phase.name}"? This action cannot be undone and all associated data will be lost.
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
                                  onClick={() => {
                                    console.log(`Deleting phase ${phase.id}: ${phase.name}`);
                                    onDelete && onDelete(phase.id);
                                  }}
                                >
                                  Delete
                                </Button>
                              </AlertDialog.Action>
                            </div>
                          </AlertDialog.Content>
                        </AlertDialog.Portal>
                      </AlertDialog.Root>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Collapsible.Content>
        </div>
      </Collapsible.Root>
    </motion.div>
  );
};

export default EnhancedPhaseItem;
