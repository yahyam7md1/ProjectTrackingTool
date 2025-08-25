import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import ProjectCard from '../../../components/ProjectCard';
import CreateProjectModal from '../../../components/ui/CreateProjectModal';

// Mock project data
const mockProjects = [
  {
    id: '1',
    name: 'E-Commerce Website',
    description: 'A full-stack e-commerce website with user authentication, product catalog, and payment integration.',
    phasesCompleted: 3,
    totalPhases: 5,
    clientCount: 2,
    createdAt: '2025-06-15T10:30:00',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    description: 'Native mobile application for banking services including account management, transfers, and bill payments.',
    phasesCompleted: 1,
    totalPhases: 4,
    clientCount: 1,
    createdAt: '2025-07-02T14:45:00',
    status: 'pending' as const,
  },
  {
    id: '3',
    name: 'Healthcare Portal',
    description: 'Web portal for healthcare providers to manage patient records, appointments, and billing.',
    phasesCompleted: 4,
    totalPhases: 4,
    clientCount: 3,
    createdAt: '2025-05-20T09:15:00',
    status: 'completed' as const,
  },
  {
    id: '4',
    name: 'Inventory Management System',
    description: 'Software solution for tracking inventory levels, orders, sales, and deliveries for retail businesses.',
    phasesCompleted: 0,
    totalPhases: 3,
    clientCount: 1,
    createdAt: '2025-07-10T11:20:00',
    status: 'pending' as const,
  },
];

const AdminDashboard: React.FC = () => {
  // State for managing the CreateProjectModal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for projects (initialized with mock data)
  const [projects, setProjects] = useState(mockProjects);
  
  // Determine if there are any projects
  const hasProjects = projects.length > 0;

  // Handler for creating a new project
  const handleCreateProject = (name: string, description: string) => {
    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      phasesCompleted: 0,
      totalPhases: 3, // Default number of phases
      clientCount: 0,
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
    };

    setProjects([newProject, ...projects]);
  };

  // Handler for deleting a project
  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {hasProjects ? (
        <>
          {/* Projects Grid View */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Your Projects</h1>
            <Button
              onClick={() => setIsModalOpen(true)}
              leftIcon={<PlusIcon size={16} />}
            >
              Create New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-text-primary">Welcome to the Admin Panel</h2>
            <p className="text-lg text-gray-500">Get started by creating your first project.</p>
            <Button
              onClick={() => setIsModalOpen(true)}
              leftIcon={<PlusIcon size={16} />}
              size="lg"
              className="mt-4"
            >
              Create Your First Project
            </Button>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default AdminDashboard;
