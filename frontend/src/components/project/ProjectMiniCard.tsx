import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface ProjectMiniCardProps {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending' | 'canceled';
  phasesCount: number;
  phasesCompletedCount?: number;
  clientsCount: number;
  progress?: number; // For backward compatibility (0 to 100)
  isSelected: boolean;
  onClick: () => void;
}

const ProjectMiniCard: React.FC<ProjectMiniCardProps> = ({
  name,
  description,
  status,
  progress,
  phasesCount,
  phasesCompletedCount = 0,
  clientsCount,
  isSelected,
  onClick,
}) => {
  // Calculate progress based on phases if phasesCompletedCount is provided
  const calculatedProgress = phasesCount > 0 
    ? Math.round((phasesCompletedCount / phasesCount) * 100) 
    : (progress || 0); // Fall back to provided progress or 0
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all duration-200",
        "hover:bg-gray-50",
        "border-2",
        isSelected 
          ? "border-primary shadow-md bg-primary/5" 
          : "border-transparent hover:border-gray-200"
      )}
    >
      {/* Project Name and Status */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-medium text-gray-900 line-clamp-1">{name}</h3>
        <span className={cn(
          "w-2 h-2 rounded-full flex-shrink-0",
          status === 'active' && "bg-green-500",
          status === 'pending' && "bg-yellow-500",
          status === 'completed' && "bg-blue-500",
          status === 'canceled' && "bg-red-500",
        )}></span>
      </div>
      
      {/* Project Description */}
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
        {description}
      </p>
      
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
        <motion.div 
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${calculatedProgress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        ></motion.div>
      </div>
      
      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{phasesCompletedCount}/{phasesCount} Phases</span>
          </span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{clientsCount} Clients</span>
          </span>
        </div>
        <span className="capitalize text-xs px-2 py-0.5 bg-gray-100 rounded-full">{status}</span>
      </div>
    </div>
  );
};

export default ProjectMiniCard;
