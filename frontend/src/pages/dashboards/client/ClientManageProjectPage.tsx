import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import VerticalTimeline, { Phase } from '../../../components/client/VerticalTimeline';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import apiService from '../../../api/apiService';

interface Project {
  id: string;
  name: string;
  description: string;
  phases: Phase[];
}

const ClientManageProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      // Reset states when projectId changes
      setIsLoading(true);
      setError(null);
      
      if (!projectId) {
        setError("Project ID is missing");
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await apiService.get(`/client/projects/${projectId}`);
        console.log('Project details response:', response.data);
        
        if (response.data.success) {
          setProject(response.data.data);
        } else {
          setError("Failed to load project details");
        }
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("An error occurred while fetching project details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [projectId]); // Re-fetch when projectId changes

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-bold text-xl text-primary">PhaseTracker</span>
          </div>
          <Button variant="ghost" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Navigation - Always visible */}
        <Link 
          to="/client/dashboard" 
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-6"></div>
            <p className="text-lg text-gray-600 font-medium">Loading Project Timeline...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="h-[60vh] flex items-center justify-center">
            <Card className="p-8 bg-red-50 border-red-200 w-full max-w-md shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-red-100 p-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-600">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-red-700 mb-2">Unable to Load Project</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <div className="flex gap-4">
                  <Button 
                    variant="ghost"
                    className="border border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Project Content */}
        {project && !isLoading && !error && (
          <>
            {/* Project Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-2 text-gray-600">{project.description}</p>
            </div>

            {/* Project Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 pl-2 py-2">Project Timeline</h2>
              <VerticalTimeline phases={project.phases} />
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default ClientManageProjectPage;
