import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

export interface Phase {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  deadline?: string;
}

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
  return (
    <div className={cn(
      "grid grid-cols-[auto_1fr] gap-x-4",
      phase.status === 'active' && "bg-primary/5 p-4 rounded-lg",
    )}>
      {/* Column 1: Timeline Track (Line and Circle) */}
      <div className="relative w-12 flex items-center justify-center min-h-[60px]">
        {/* Vertical Line Container - provides continuous track */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Continuous vertical line */}
          <div className={cn(
            "absolute h-full w-0.5 left-1/2 -translate-x-1/2",
            isFirst && "top-1/2",
            isLast && "bottom-1/2",
            phase.status === 'completed' || phase.status === 'active' ? "bg-primary" : 
            "border-r-2 border-dashed border-gray-300"
          )} />
          
          {/* Circle/Icon with background to hide line and create illusion of separate segments */}
          <div className="relative z-10 flex items-center justify-center p-1 bg-white rounded-full">
            {phase.status === 'completed' && (
              <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
            )}
            {phase.status === 'active' && (
              <div className="relative flex items-center justify-center">
                <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-white rounded-full" />
                </div>
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              </div>
            )}
            {phase.status === 'pending' && (
              <div className="border-2 border-gray-300 h-7 w-7 rounded-full" />
            )}
          </div>
        </div>
      </div>
      
      {/* Column 2: Content */}
      <div className="py-2 space-y-3">
        <div className="flex items-center space-x-3">
          <h3 
            className={cn(
              "text-lg",
              phase.status === 'active' && "font-bold",
              phase.status === 'pending' && "text-gray-500"
            )}
          >
            {phase.name}
          </h3>
          <Badge 
            variant={
              phase.status === 'completed' ? 'success' : 
              phase.status === 'active' ? 'default' : 'outline'
            }
          >
            {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
          </Badge>
        </div>
        
        <p className={cn(
          "text-sm text-gray-700",
          phase.status === 'pending' && "text-gray-500"
        )}>
          {phase.description}
        </p>
        
        {phase.deadline && (
          <div className={cn(
            "text-xs font-medium",
            phase.status === 'pending' ? "text-gray-500" : "text-gray-700"
          )}>
            Deadline: {phase.deadline}
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
      className="mt-6 space-y-16 ml-4 md:ml-12"
    >
      {phases.map((phase, index) => (
        <motion.li
          key={phase.id}
          variants={item}
          className="relative py-2"
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
