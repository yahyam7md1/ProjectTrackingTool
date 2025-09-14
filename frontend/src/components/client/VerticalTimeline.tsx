import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface Phase {
  id: string;
  name: string;
  description: string;
  is_active?: boolean;
  is_completed?: boolean;
  status?: 'completed' | 'active' | 'pending';
  deadline?: string;
  estimated_completion_at?: string | null;
}

// Helper function to derive phase status from is_active and is_completed flags
export const getPhaseStatus = (phase: Phase): 'active' | 'completed' | 'pending' => {
  if (phase.status) {
    return phase.status;
  }
  
  if (phase.is_completed) {
    return 'completed';
  }
  if (phase.is_active) {
    return 'active';
  }
  return 'pending';
};

interface VerticalTimelineProps {
  phases: Phase[];
}

interface PhaseItemProps {
  phase: Phase;
  isFirst: boolean;
  isLast: boolean;
}

// Separate PhaseItem component for better organization
const PhaseItem: React.FC<PhaseItemProps> = ({ phase, isFirst, isLast }) => {
  const phaseStatus = getPhaseStatus(phase);
  const deadlineDate = phase.estimated_completion_at || phase.deadline;
  
  return (
    <div className={cn(
      "grid grid-cols-[auto_1fr] gap-x-4 relative",
      phaseStatus === 'active' && "bg-primary/5 rounded-lg",
    )}>
      {/* Column 1: Timeline Track (Line and Circle) */}
      <div className={cn(
        "relative w-12 flex items-center justify-center min-h-[60px]",
        phaseStatus === 'active' && "pl-4"
      )}>
        {/* Top half line - conditionally rendered if not first */}
        {!isFirst && (
          <div 
            className={cn(
              "absolute top-[-20px] h-1/2 w-0.5 left-6 -translate-x-1/2",
              phaseStatus === 'completed' || phaseStatus === 'active' 
                ? "bg-primary" 
                : "border-r-2 border-dashed border-gray-300"
            )} 
          />
        )}
        
        {/* Bottom half line - conditionally rendered if not last */}
        {!isLast && (
          <div 
            className={cn(
              "absolute bottom-0 h-1/2 w-0.5 left-6 -translate-x-1/2",
              phaseStatus === 'completed' || phaseStatus === 'active' 
                ? "bg-primary" 
                : "border-r-2 border-dashed border-gray-300"
            )} 
          />
        )}
        
        {/* Circle/Icon positioned at the center of the row */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 -translate-x-1/2 z-10 flex items-center justify-center p-1 bg-white rounded-full">
          {phaseStatus === 'completed' && (
            <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5 text-white" />
            </div>
          )}
          {phaseStatus === 'active' && (
            <div className="relative flex items-center justify-center">
              <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-full" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            </div>
          )}
          {phaseStatus === 'pending' && (
            <div className="border-2 border-gray-300 h-7 w-7 rounded-full" />
          )}
        </div>
      </div>
      
      {/* Column 2: Content */}
      <div className={cn(
        "py-2 space-y-3",
        phaseStatus === 'active' && "pr-4 pt-4 pb-4"
      )}>
        <div className="flex items-center space-x-3">
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center w-full pr-12">
            <h3
              className={cn(
                "text-lg",
                phaseStatus === 'active' && "font-bold",
                phaseStatus === 'pending' && "text-gray-500"
              )}
            >
              {phase.name}
            </h3>
          <Badge 
            variant={
              phaseStatus === 'completed' ? 'success' : 
              phaseStatus === 'active' ? 'default' : 'outline'
            }
            className="whitespace-nowrap"
          >
            {phaseStatus.charAt(0).toUpperCase() + phaseStatus.slice(1)}
          </Badge>
          </div>
        </div>
        
        <p className={cn(
          "text-sm text-gray-700",
          phaseStatus === 'pending' && "text-gray-500"
        )}>
          {phase.description}
        </p>
        
        {deadlineDate && (
          <div className={cn(
            "text-xs font-medium",
            phaseStatus === 'pending' ? "text-gray-500" : "text-gray-700"
          )}>
            Deadline: {deadlineDate}
          </div>
        )}
      </div>
    </div>
  );
};

export const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ phases }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.ol
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className="mt-6 space-y-4 ml-4 md:ml-12"
    >
      {phases.map((phase, index) => (
        <motion.li
          key={phase.id}
          variants={item}
          className="relative"
        >
          <PhaseItem 
            phase={phase} 
            isFirst={index === 0} 
            isLast={index === phases.length - 1} 
          />
        </motion.li>
      ))}
    </motion.ol>
  );
};

export default VerticalTimeline;
