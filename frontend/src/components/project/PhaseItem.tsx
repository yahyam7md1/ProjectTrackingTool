import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import apiService from '../../api/apiService';

export interface Phase {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_completed: boolean;
  order: number;
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
}

interface PhaseItemProps {
  phase: Phase;
  projectId?: string;
  onSetActive?: (id: string) => void;
  onComplete?: (id: string) => void;
  refetchData?: () => Promise<void>;
}

const PhaseItem: React.FC<PhaseItemProps> = ({ phase, projectId, onSetActive, onComplete, refetchData }) => {
  const status = getPhaseStatus(phase);
  
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col md:flex-row items-start md:items-center justify-between",
        "p-4 mb-3 bg-white rounded-lg border shadow-sm",
        "transition-all duration-200",
        isDragging ? "opacity-50 ring-2 ring-primary/20" : "",
      )}
    >
      {/* Handle and Content Container */}
      <div className="flex items-start w-full md:w-auto">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mr-3 p-1 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag handle"
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
          <p className="text-sm text-gray-500 mb-3 md:mb-0">{phase.description}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-3 md:mt-0 w-full md:w-auto">
        {status === 'pending' && (
          <Button 
            size="sm" 
            variant="primary" 
            onClick={async () => {
              if (onSetActive) {
                onSetActive(phase.id);
              } else if (projectId) {
                try {
                  await apiService.post(`/admin/projects/${projectId}/phases/${phase.id}/set-active`);
                  
                  if (refetchData) {
                    await refetchData();
                    console.log("Phase set as active and data refetched");
                  }
                } catch (error) {
                  console.error('Error setting phase as active:', error);
                }
              }
            }}
          >
            Set Active
          </Button>
        )}
        {status === 'active' && (
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => onComplete && onComplete(phase.id)}
            leftIcon={<CheckCircle className="w-4 h-4" />}
          >
            Complete
          </Button>
        )}
        {status === 'completed' && (
          <Button 
            size="sm" 
            variant="ghost" 
            disabled
            leftIcon={<CheckCircle className="w-4 h-4 text-success" />}
          >
            Completed
          </Button>
        )}
      </div>
    </div>
  );
};

export default PhaseItem;
