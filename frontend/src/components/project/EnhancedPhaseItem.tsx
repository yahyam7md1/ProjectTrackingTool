import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Collapsible from '@radix-ui/react-collapsible';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, CheckCircle, ChevronDown, ChevronUp, Trash2, Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { cn } from '../../utils/cn';
import apiService from '../../api/apiService';

export interface Phase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  order: number;
  createdAt?: string; // Optional field for metadata
}

interface EnhancedPhaseItemProps {
  phase: Phase;
  projectId?: string;
  onSetActive?: (id: string) => void;
  onComplete?: (id: string) => void;
  onUpdate?: (id: string, data: { name: string; description: string }) => void;
  onDelete?: (id: string) => void;
  refetchData?: () => Promise<void>;
}

const EnhancedPhaseItem: React.FC<EnhancedPhaseItemProps> = ({ 
  phase, 
  projectId,
  onSetActive, 
  onComplete,
  onUpdate,
  onDelete,
  refetchData
}) => {
  console.log(`PHASE ITEM RENDERED: id=${phase.id}, name=${phase.name}, status=${phase.status}`);
  
  const [isOpen, setIsOpen] = useState(false);
  const [editName, setEditName] = useState(phase.name);
  const [editDescription, setEditDescription] = useState(phase.description);
  const [isEditing, setIsEditing] = useState(false);
  
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
  
  // Track phase prop changes and update local state
  useEffect(() => {
    console.log(`PHASE ITEM: Phase prop changed for id=${phase.id}`);
    setEditName(phase.name);
    setEditDescription(phase.description);
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

  const getStatusBadgeVariant = (status: Phase['status']) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'active': return 'default';
      case 'completed': return 'success';
      default: return 'outline';
    }
  };

  const handleUpdatePhase = () => {
    // Only proceed if the update handler exists and there are actual changes
    if (onUpdate && (editName !== phase.name || editDescription !== phase.description)) {
      // Ensure we have valid data before sending the update
      if (editName.trim() === '') {
        alert('Phase name cannot be empty');
        return;
      }
      
      console.log(`Updating phase ${phase.id} with:`, {
        name: editName,
        description: editDescription
      });
      
      // Call the update handler from the parent component
      onUpdate(phase.id, {
        name: editName,
        description: editDescription
      });
    }
    // Exit editing mode regardless of whether an update was made
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(phase.name);
    setEditDescription(phase.description);
    setIsEditing(false);
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
                    <Badge variant={getStatusBadgeVariant(phase.status)} className="capitalize">
                      {phase.status}
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
                  {phase.status === 'pending' && (
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
                  {phase.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onComplete && onComplete(phase.id);
                      }}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                      Complete
                    </Button>
                  )}
                  {phase.status === 'completed' && (
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
                      <span>Created: {new Date(phase.createdAt).toLocaleDateString()}</span>
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
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        leftIcon={<Trash2 className="h-4 w-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add confirmation dialog
                          if (window.confirm(`Are you sure you want to delete the phase "${phase.name}"?`)) {
                            console.log(`Deleting phase ${phase.id}: ${phase.name}`);
                            onDelete && onDelete(phase.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
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
