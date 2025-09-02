import React from 'react';
import { Link } from 'react-router-dom';
import ProjectCard from '../../../components/ui/ProjectCard';
import ClientHeaderLayout from '../../../layouts/ClientHeaderLayout';

// Mock data for client projects with proper typing
const mockClientProjects = [
  {
    id: '1',
    name: 'E-Commerce Website',
    description: 'A modern e-commerce platform with user-friendly interface',
    status: 'active' as const,
    clientCount: 1,
    createdAt: new Date().toISOString(),
    phasesCompletedCount: 2,
    phasesCount: 5
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    description: 'Secure banking application with real-time transaction monitoring',
    status: 'active' as const,
    clientCount: 1,
    createdAt: new Date().toISOString(),
    phasesCompletedCount: 1,
    phasesCount: 4
  },
  {
    id: '3',
    name: 'Corporate Website Redesign',
    description: 'Modern redesign of corporate website with focus on user experience',
    status: 'active' as const,
    clientCount: 1,
    createdAt: new Date().toISOString(),
    phasesCompletedCount: 0,
    phasesCount: 3
  }
];

const ClientMultiProjectDashboard: React.FC = () => {
  return (
    <ClientHeaderLayout pageTitle="Your Active Projects">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockClientProjects.map((project) => (
            <Link 
              to={`/client/projects/${project.id}`}
              key={project.id}
              className="block transition-transform hover:-translate-y-1"
            >
              <ProjectCard
                project={project}
                // No onDelete prop passed here, making the delete button non-functional
              />
            </Link>
          ))}
        </div>

        {/* Empty State (hidden by default) */}
        {mockClientProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-700">No Active Projects</h2>
              <p className="text-lg text-gray-500">
                You don't have any active projects at the moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </ClientHeaderLayout>
  );
};

export default ClientMultiProjectDashboard;
