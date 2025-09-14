import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../../api/apiService';
import ProjectCard from '../../../components/ui/ProjectCard';
import ClientHeaderLayout from '../../../layouts/ClientHeaderLayout';
import { ClientProject } from '../../../types/client';

const ClientMultiProjectDashboard: React.FC = () => {
  // State hooks for managing projects data
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch client projects on component mount
  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        const response = await apiService.get('/client/projects');
        
        if (response.data.success) {
          // The backend sends projects in response.data.data, not response.data.projects
          console.log('Raw project data:', response.data.data);
          
          // Convert snake_case to camelCase for all project fields
          const convertedProjects = response.data.data.map((project: any) => {
            // Create a new object with camelCase keys
            const converted: any = {};
            Object.keys(project).forEach(key => {
              const camelKey = key.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());
              converted[camelKey] = project[key];
            });
            return converted;
          });
          
          console.log('Converted project data:', convertedProjects);
          setProjects(convertedProjects);
        } else {
          setError('Failed to fetch projects.');
        }
      } catch (err) {
        console.error('Error fetching client projects:', err);
        setError('An error occurred while fetching your projects.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientProjects();
  }, []);
  return (
    <ClientHeaderLayout pageTitle="Your Active Projects">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-700">Loading Projects</h2>
              <p className="text-lg text-gray-500">Please wait while we load your projects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-red-600">Error</h2>
              <p className="text-lg text-gray-500">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link 
                  to={`/client/projects/${project.id}`}
                  key={project.id}
                  className="block transition-transform hover:-translate-y-1"
                >
                  <ProjectCard
                    project={project}
                  />
                </Link>
              ))}
            </div>

            {/* Empty State (hidden by default) */}
            {projects.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-700">No Active Projects</h2>
                  <p className="text-lg text-gray-500">
                    You don't have any active projects at the moment.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ClientHeaderLayout>
  );
};

export default ClientMultiProjectDashboard;
