import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Search, AlertCircle, Loader2, Plus } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import apiService from '../../../api/apiService';
import PhasesList from '../../../components/project/PhasesList';
import { Phase } from '../../../components/project/EnhancedPhaseItem';
import { Client } from '../../../components/project/ClientItem';
import ClientsList from '../../../components/project/ClientsList';
import ProjectSettingsModal from '../../../components/project/ProjectSettingsModal';
import ProjectMiniCard from '../../../components/project/ProjectMiniCard';
import AddPhasesModal from '../../../components/project/AddPhasesModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useProjects } from '../../../context/ProjectsContext';
import ClientHeaderLayout from '../../../layouts/ClientHeaderLayout';

// Define types for our API data
type ProjectType = {
  id: string;
  name: string;
  description: string;
  phasesCount: number;
  phasesCompletedCount?: number;
  clientCount: number;  // Changed from clientsCount to clientCount to match API response
  clientsCount?: number; // Keep for backward compatibility
  status: 'active' | 'completed' | 'pending' | 'canceled';
  phases: Phase[] | any[];  // Make compatible with any[] from API
  clients: Client[] | any[]; // Make compatible with any[] from API
  createdAt?: string;
};

// Project Sidebar Component
const ProjectSidebar: React.FC<{
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
}> = ({ selectedProjectId, onSelectProject }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { projects, loading: isLoading, error, fetchProjects } = useProjects();
  
  // Fetch projects only once on component mount
  useEffect(() => {
    // Initial data fetch on component mount only
    fetchProjects();
  }, [fetchProjects]); // Include fetchProjects in dependencies to avoid exhaustive-deps warning

  // Filter projects based on search query
  const filteredProjects = projects ? projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  // Calculate project progress based on completed phases
  const calculateProgress = (project: ProjectType): number => {
    // Use phasesCompletedCount if available in the API response
    if (project.phasesCompletedCount !== undefined && project.phasesCount > 0) {
      return Math.round((project.phasesCompletedCount / project.phasesCount) * 100);
    }
    
    // Fall back to calculating from phases array if necessary
    if (!project || !project.phases || !Array.isArray(project.phases)) {
      return 0;
    }
    
    if (project.phasesCount === 0) return 0;
    const completedPhases = project.phases.filter(phase => phase.is_completed).length;
    return Math.round((completedPhases / project.phasesCount) * 100);
  };
  
  return (
    <Card className="bg-slate-50 h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          <Link to="/admin/dashboard" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Project List */}
        <div className="space-y-3 mt-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 text-error mx-auto mb-2" />
              <p className="text-sm text-error">{error}</p>
              <Button 
                variant="secondary" 
                size="sm"
                className="mt-3"
                onClick={() => navigate('/admin/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No projects found
            </div>
          ) : (
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to={`/admin/projects/${project.id}`}>
                    <ProjectMiniCard
                      id={project.id}
                      name={project.name}
                      description={project.description}
                      status={project.status as 'active' | 'completed' | 'pending' | 'canceled'}
                      progress={calculateProgress(project as ProjectType)}
                      phasesCount={project.phasesCount}
                      phasesCompletedCount={project.phasesCompletedCount}
                      clientsCount={project.clientCount} // Changed from clientsCount to clientCount
                      isSelected={selectedProjectId === project.id}
                      onClick={() => onSelectProject(project.id)}
                    />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ManageProjectPage: React.FC = () => {
  // Get project ID from URL params
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  
  // Access the projects context
  const { projects, refreshProject, fetchProjects } = useProjects();
  
  const [project, setProject] = useState<ProjectType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('phases');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState<boolean>(false);
  const [clientEmail, setClientEmail] = useState('');
  
  // Function to fetch project data that can be called from anywhere
  const fetchProjectData = async (id: string | undefined) => {
    if (!id) {
      // If no projectId is provided, try to get the first project
      try {
        // First try to get projects from context
        await fetchProjects();
        if (projects && projects.length > 0) {
          // Redirect to the first project
          navigate(`/admin/projects/${projects[0].id}`);
        } else {
          setError('No projects found. Please create one first.');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load projects';
        setError(errorMessage);
        setIsLoading(false);
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to get the project from the context
      const contextProject = await refreshProject(id);
      
      if (contextProject) {
        // Use the project from context, ensure phases and clients are arrays
        setProject({
          ...contextProject,
          phases: Array.isArray(contextProject.phases) ? contextProject.phases : [],
          clients: Array.isArray(contextProject.clients) ? contextProject.clients : []
        });
      } else {
        // Fallback to direct API call
        const response = await apiService.get(`/admin/projects/${id}`);
        if (response.data.success) {
          // Explicitly create a new object reference to ensure React detects the change
          setProject({ 
            ...response.data.project,
            phases: Array.isArray(response.data.project.phases) ? response.data.project.phases : [],
            clients: Array.isArray(response.data.project.clients) ? response.data.project.clients : []
          });
        } else {
          setError('Project not found or could not be loaded');
        }
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load project';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // We've already accessed these from the context at the top of the component

  // Function for child components to trigger a refresh of project data - now with useCallback for stable identity
  const refetchProjectData = useCallback(async () => {
    if (!projectId) return;
    
    console.log('Refetching project data for ID:', projectId);
    try {
      setError(null);
      
      // First, update the specific project in the context
      const updatedProject = await refreshProject(projectId);
      
      if (updatedProject) {
        // Update the local state with the updated project
        setProject({ 
          ...updatedProject,
          // Ensure phases and clients are proper arrays
          phases: Array.isArray(updatedProject.phases) ? [...updatedProject.phases] : [],
          clients: Array.isArray(updatedProject.clients) ? [...updatedProject.clients] : []
        });
        console.log('Project data refetched successfully:', updatedProject);
        
        // Also refresh the project list to ensure all views are in sync
        await fetchProjects();
      } else {
        // If refreshProject returns null, something went wrong
        setError('Project not found or could not be loaded');
        
        // Try to fetch directly as a fallback
        const response = await apiService.get(`/admin/projects/${projectId}`);
        if (response.data.success) {
          setProject({ 
            ...response.data.project,
            // Ensure phases and clients are proper arrays
            phases: Array.isArray(response.data.project.phases) ? [...response.data.project.phases] : [],
            clients: Array.isArray(response.data.project.clients) ? [...response.data.project.clients] : []
          });
          console.log('Project data refetched successfully via fallback:', response.data.project);
        }
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load project';
      setError(errorMessage);
    }
  }, [projectId, refreshProject, fetchProjects]); // Updated dependencies

  // Re-fetch project data when projectId changes
  useEffect(() => {
    // Make sure to bind the fetchProjectData function to the current projects value
    const fetchWithCurrentContext = () => fetchProjectData(projectId);
    fetchWithCurrentContext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, navigate]);
  
  // Debug log to monitor project state changes
  useEffect(() => {
    if (project) {
      console.log('MANAGE_PROJECT: Project state changed:', project);
      console.log('MANAGE_PROJECT: Current phases:', project.phases);
    }
  }, [project]);
  
  // Handle phase updates
  const handlePhasesChange = async (updatedPhases: Phase[]) => {
    if (!project) return;
    
    try {
      // Update on the server
      await apiService.put(`/admin/projects/${project.id}/phases`, { 
        phases: updatedPhases 
      });
      
      // Refetch project data to ensure we have the latest state
      if (projectId) {
        fetchProjectData(projectId);
      }
    } catch (err) {
      console.error('Error updating phases:', err);
      // Could add error handling/notification here
    }
  };

  // Handle client add
  const handleAddClient = async (email: string) => {
    if (!project) return;
    
    try {
      // Add client on the server
      const response = await apiService.post(`/admin/projects/${project.id}/clients`, { email });
      
      if (response.data.success) {
        // Use the refetchProjectData function instead
        await refetchProjectData();
      }
    } catch (err) {
      console.error('Error adding client:', err);
      // Could add error handling/notification here
    }
  };

  // Handle client remove
  const handleRemoveClient = async (clientId: string) => {
    if (!project) return;
    
    try {
      // Remove client on the server
      await apiService.delete(`/admin/projects/${project.id}/clients/${clientId}`);
      
      // Use the refetchProjectData function instead
      await refetchProjectData();
    } catch (err) {
      console.error('Error removing client:', err);
      // Could add error handling/notification here
    }
  };
  
  // Handle adding phases from the modal
  const handleAddPhases = async (phasesToAdd: { name: string; description: string }[]) => {
    // Logging for debugging
    console.log("PAGE: handleAddPhases function was REACHED. Data received:", phasesToAdd);
    
    if (!project) return;
    
    try {
      // Set a loading state if you have one
      // setIsAddingPhases(true);
      
      // Create an array of promises, one for each phase
      const creationPromises = phasesToAdd.map(phase => 
        apiService.post(`/admin/projects/${project.id}/phases`, { 
          name: phase.name,
          description: phase.description
        })
      );
      
      // Wait for all API calls to complete in parallel
      await Promise.all(creationPromises);
      
      // --- THIS IS THE CRITICAL PART ---
      // 1. Close the modal FIRST.
      setIsAddPhaseModalOpen(false);
      
      // 2. THEN, refetch the data.
      // Using await here to ensure the refetch completes before we move on
      await refetchProjectData();
      
      console.log("SUCCESS: Phases created and data refetched.");
      
    } catch (err) {
      console.error('Error adding phases:', err);
      // Could add error handling/notification here
    } finally {
      // Turn off any loading state
      // setIsAddingPhases(false);
    }
  };

  // Handle project settings update
  const handleUpdateProjectSettings = async (settings: { name: string; description: string; status?: string }) => {
    if (!project) return;
    
    try {
      // Update project on the server
      await apiService.put(`/admin/projects/${project.id}`, settings);
      
      // Close the modal first
      setIsSettingsModalOpen(false);
      
      // Then refetch project data using our refetchProjectData function
      await refetchProjectData();
      
      console.log("Project settings updated successfully");
    } catch (err) {
      console.error('Error updating project settings:', err);
      // Could add error handling/notification here
    }
  };

  // Handle project delete
  const handleDeleteProject = async () => {
    if (!project) return;
    
    try {
      // Delete project on the server - fix the double /api prefix issue
      await apiService.delete(`/admin/projects/${project.id}`);
      
      // Navigate to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error deleting project:', err);
      // Could add error handling/notification here
    }
  };

  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.6,
      } 
    }
  };

  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Log to check if the handleAddPhases function is being properly passed as a prop
  console.log("PAGE: Is the handleAddPhases function being passed as a prop?", {
    isFunction: typeof handleAddPhases === 'function'
  });

  return (
    <ClientHeaderLayout pageTitle={project?.name || "Manage Project"}>
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
      {/* Mobile-first layout with grid for responsive behavior */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {/* Left Column - Project Mini Dashboard */}
        <motion.div className="mb-6 md:mb-0" variants={sidebarVariants}>
          <ProjectSidebar 
            selectedProjectId={projectId || ''}
            onSelectProject={(id) => navigate(`/admin/projects/${id}`)}
          />
        </motion.div>
        
        {/* Right Column - Main Content Area */}
        <motion.div variants={contentVariants}>
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-gray-500">Loading project details...</p>
                  <p className="text-xs text-gray-400 mt-2">Fetching data from server</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="h-12 w-12 text-error mb-4" />
                  <h3 className="text-xl font-bold mb-2">Error Loading Project</h3>
                  <p className="text-gray-500 mb-6">{error}</p>
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => navigate('/admin/dashboard')}
                      variant="secondary"
                    >
                      Go to Dashboard
                    </Button>
                    <Button 
                      onClick={() => {
                        if (projectId) {
                          fetchProjectData(projectId);
                        }
                      }}
                      variant="primary"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : project ? (
                <>
                  {/* Project Header */}
                  <div className="flex flex-col mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center pl-8">
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                      </div>
                      <button
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 bg-white"
                        aria-label="Project settings"
                      >
                        <Settings className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-gray-500 ml-8">{project.description}</p>
                  </div>
                  
                  {/* Tabs */}
                  <Tabs.Root 
                    value={activeTab} 
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <Tabs.List className="flex bg-slate-100 rounded-lg p-1 mb-6">
                      <Tabs.Trigger 
                        value="phases"
                        className={cn(
                          "flex-1 px-4 py-2.5 text-sm font-medium transition-all rounded-md",
                          "focus:outline-none",
                          activeTab === 'phases' 
                            ? "bg-white text-gray-900 font-semibold shadow-sm" 
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        Phases
                      </Tabs.Trigger>
                      <Tabs.Trigger 
                        value="clients"
                        className={cn(
                          "flex-1 px-4 py-2.5 text-sm font-medium transition-all rounded-md",
                          "focus:outline-none",
                          activeTab === 'clients' 
                            ? "bg-white text-gray-900 font-semibold shadow-sm" 
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        Clients
                      </Tabs.Trigger>
                    </Tabs.List>
                
                    {/* Tab Content */}
                    <Tabs.Content value="phases" className="focus:outline-none mt-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Persistent header with Add Phase button */}
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold">Project Phases</h2>
                          <Button 
                            size="sm" 
                            leftIcon={<Plus className="w-4 h-4" />}
                            onClick={() => {
                              if (!isLoading && project) {
                                setIsAddPhaseModalOpen(true);
                              }
                            }}
                          >
                            Add Phase
                          </Button>
                        </div>
                        
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="ml-2 text-gray-500">Loading phases...</p>
                          </div>
                        ) : (
                          project && project.phases && Array.isArray(project.phases) && (
                            <PhasesList 
                              projectId={project.id}
                              phases={project.phases}
                              onPhasesChange={handlePhasesChange}
                              refetchData={refetchProjectData}
                              hideHeader={true} /* Hide the header in the PhasesList component since we now have it in the parent */
                              onAddPhaseClick={() => setIsAddPhaseModalOpen(true)}
                            />
                          )
                        )}
                      </motion.div>
                    </Tabs.Content>
                    <Tabs.Content value="clients" className="focus:outline-none mt-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Persistent header with Add Client form */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Client Access</h2>
                          </div>
                          
                          {/* Add Client Form - moved from ClientsList to always be visible */}
                          {!isLoading && project && (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              if (clientEmail) {
                                handleAddClient(clientEmail);
                                setClientEmail('');
                              }
                            }} className="mb-4">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                  <label htmlFor="clientEmail" className="sr-only">
                                    Client email address
                                  </label>
                                  <Input
                                    id="clientEmail"
                                    type="email"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    placeholder="Client email address"
                                  />
                                </div>
                                <Button 
                                  type="submit"
                                  leftIcon={<Plus className="h-4 w-4" />}
                                  className="whitespace-nowrap"
                                >
                                  Add Client
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                        
                        {isLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="ml-2 text-gray-500">Loading clients...</p>
                          </div>
                        ) : (
                          project && project.clients && Array.isArray(project.clients) && (
                            <ClientsList 
                              projectId={project.id}
                              clients={project.clients}
                              onAddClient={handleAddClient}
                              onRemoveClient={handleRemoveClient}
                              refetchData={refetchProjectData}
                              hideHeader={true} /* Hide the header and form in the ClientsList component */
                              hideForm={true} /* Hide the add client form since we've moved it to the parent */
                            />
                          )
                        )}
                      </motion.div>
                    </Tabs.Content>
                  </Tabs.Root>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-gray-500">No project selected</p>
                  <Button 
                    onClick={() => navigate('/admin/dashboard')}
                    variant="primary"
                    className="mt-4"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Project Settings Modal */}
      {project && (
        <ProjectSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          projectId={project.id}
          project={project}
          initialSettings={{
            name: project.name,
            description: project.description,
            status: project.status
          }}
          onSave={handleUpdateProjectSettings}
          onDelete={handleDeleteProject}
        />
      )}
      
      {/* Add Phases Modal */}
      {project && (
        <AddPhasesModal
          isOpen={isAddPhaseModalOpen}
          onClose={() => setIsAddPhaseModalOpen(false)}
          onAddPhases={handleAddPhases} /* This is the critical fix */
        />
      )}
    </motion.div>
    </ClientHeaderLayout>
  );
};

export default ManageProjectPage;
