import React from 'react';
import { Trash2, Users, Calendar } from 'lucide-react';
import { Badge } from './Badge';
import { IconButton } from './IconButton';
import { motion } from 'framer-motion';
import { parseISO, format } from 'date-fns';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    phasesCompletedCount?: number;
    phasesCount?: number;
    // For backward compatibility
    phasesCompleted?: number;
    totalPhases?: number;
    clientCount: number;
    createdAt: string;
    status: 'active' | 'completed' | 'pending' | 'canceled';
  };
  onDelete?: (id: string) => void;
}

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success';
    case 'completed':
      return 'default';
    case 'canceled':
      return 'destructive';
    case 'on hold':
      return 'warning';
    case 'pending':
    default:
      return 'outline';
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const { 
    id, 
    name, 
    description, 
    phasesCompletedCount = 0, 
    phasesCount = 0, 
    phasesCompleted = 0, 
    totalPhases = 0, 
    clientCount, 
    createdAt, 
    status 
  } = project;
  
  // Use the new fields if available, otherwise fall back to the old fields
  const completedPhases = phasesCompletedCount !== undefined ? phasesCompletedCount : phasesCompleted;
  const totalPhasesCount = phasesCount !== undefined ? phasesCount : totalPhases;
  
  const progressPercentage = totalPhasesCount > 0 ? (completedPhases / totalPhasesCount) * 100 : 0;
  
  let formattedDate = 'N/A';
  if (createdAt) {
    try {
      console.log('Original createdAt:', createdAt);
      
      // Handle different date formats that might come from SQLite
      // SQLite typically returns "YYYY-MM-DD HH:MM:SS" format
      let dateObject;
      
      if (createdAt.includes('T')) {
        // It's already in ISO format
        dateObject = parseISO(createdAt);
      } else if (createdAt.includes(' ')) {
        // SQLite format with space between date and time
        dateObject = parseISO(createdAt.replace(' ', 'T'));
      } else {
        // Plain date string
        dateObject = new Date(createdAt);
      }
      
      // Check if date is valid before formatting
      if (isNaN(dateObject.getTime())) {
        console.error('Invalid date object created from:', createdAt);
        formattedDate = 'Invalid Date';
      } else {
        formattedDate = format(dateObject, 'yyyy/MM/dd');
        console.log('Formatted date:', formattedDate);
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'for input:', createdAt);
      formattedDate = 'Invalid Date';
    }
  } else {
    console.log('No createdAt value provided');
    console.log('Project data:', project);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-primary/20 hover:border-primary transition-colors p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-primary truncate">{name}</h3>
        <IconButton 
          variant="ghost" 
          size="sm"
          icon={<Trash2 size={18} />} 
          aria-label={`Delete project ${name}`}
          onClick={() => onDelete && onDelete(id)}
          className="text-gray-500 hover:text-error"
        />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-2">{description}</p>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{completedPhases}/{totalPhasesCount} phases</span>
          <span className="text-gray-500">{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex justify-between items-center pt-1">
        <div className="flex items-center text-sm text-gray-500">
          <Users size={16} className="mr-1" />
          <span>{clientCount} {clientCount === 1 ? 'client' : 'clients'}</span>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <Calendar size={16} className="mr-1" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-end">
        <Badge variant={getStatusVariant(status) as any} className="capitalize">
          {status}
        </Badge>
      </div>
    </div>
  );
};

export default ProjectCard;
