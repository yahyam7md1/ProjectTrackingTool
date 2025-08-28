import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import apiService from '../api/apiService';

// Define the project type
export type ProjectType = {
  id: string;
  name: string;
  description: string;
  phasesCompletedCount: number;
  phasesCount: number;
  clientCount: number;
  clientsCount?: number; // For backward compatibility
  createdAt: string;
  status: 'active' | 'completed' | 'pending' | 'canceled';
  phases?: any[];
  clients?: any[];
  [key: string]: any; // Allow for additional properties that might come from the API
};

// Define the context type
interface ProjectsContextType {
  projects: ProjectType[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  refreshProject: (projectId: string) => Promise<ProjectType | null>;
}

// Create the context with a default value
const ProjectsContext = createContext<ProjectsContextType>({
  projects: [],
  loading: false,
  error: null,
  fetchProjects: async () => {},
  refreshProject: async () => null,
});

// Create a provider component
export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch all projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get('/admin/projects');
      if (response.data.success) {
        setProjects(response.data.projects);
      } else {
        setError('Failed to load projects');
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // No automatic data fetching in the context
  // We'll rely on components to fetch data when needed

  // Function to refresh a single project and update it in the projects array
  const refreshProject = useCallback(async (projectId: string): Promise<ProjectType | null> => {
    try {
      const response = await apiService.get(`/admin/projects/${projectId}`);
      if (response.data.success) {
        const updatedProject = response.data.project;
        
        // Update the project in the projects array
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === projectId ? updatedProject : project
          )
        );
        
        return updatedProject;
      }
    } catch (err) {
      console.error('Error refreshing project:', err);
    }
    return null;
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, loading, error, fetchProjects, refreshProject }}>
      {children}
    </ProjectsContext.Provider>
  );
};

// Create a custom hook to use the projects context
export const useProjects = () => useContext(ProjectsContext);

export default ProjectsContext;
