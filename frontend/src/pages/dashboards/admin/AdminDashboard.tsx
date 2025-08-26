import React, { useState, useMemo, useEffect } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import ProjectCard from '../../../components/ui/ProjectCard';
import CreateProjectModal from '../../../components/ui/CreateProjectModal';
import Input from '../../../components/ui/Input';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../../../components/ui/DropdownMenu';
import apiService from '../../../api/apiService';
import { useAuth } from '../../../context/AuthContext';

// Define project type based on the ProjectCard props
type ProjectType = {
  id: string;
  name: string;
  description: string;
  phasesCompleted: number;
  totalPhases: number;
  clientCount: number;
  createdAt: string;
  status: 'active' | 'completed' | 'pending' | 'canceled';
};

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  
  // State for managing the CreateProjectModal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for projects with API data fetching
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for search and filter functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiService.get('/admin/projects');
        if (response.data.success) {
          setProjects(response.data.projects);
        } else {
          setError('Failed to load projects');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('An error occurred while fetching projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, [token]);
  
  // Filter projects based on search term and status filter
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter by status (if not "All")
      const statusMatch = statusFilter === 'All' || 
        project.status.toLowerCase() === statusFilter.toLowerCase();
      
      // Filter by search term
      const searchMatch = !searchTerm || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return statusMatch && searchMatch;
    });
  }, [projects, searchTerm, statusFilter]);
  
  // Determine if there are any projects
  const hasProjects = projects.length > 0;

  // Handler for creating a new project
  const handleCreateProject = async (name: string, description: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.post('/admin/projects', {
        name,
        description
      });
      
      if (response.data.success) {
        // Add the new project to the current projects list
        setProjects([response.data.project, ...projects]);
        // Close the modal after successful creation
        setIsModalOpen(false);
      } else {
        setError('Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError('An error occurred while creating the project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for deleting a project
  const handleDeleteProject = async (id: string) => {
    try {
      const response = await apiService.delete(`/admin/projects/${id}`);
      
      if (response.data.success) {
        // Remove the deleted project from the list
        setProjects(projects.filter(project => project.id !== id));
      } else {
        setError('Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('An error occurred while deleting the project. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
      {isLoading ? (
        /* Loading State */
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="text-lg text-gray-500">Loading projects...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-error">Error</h2>
            <p className="text-lg text-gray-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="secondary"
              size="lg"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : hasProjects ? (
        <>
          {/* Projects Grid View */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Your Projects</h1>
          </div>
          
          {/* Control Bar */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                className="pl-10"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1 flex justify-between items-center gap-4 w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" leftIcon={<FilterIcon size={16} />}>
                    {statusFilter === 'All' ? 'All Projects' : `${statusFilter} Projects`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('All')}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('Active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('Completed')}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('Pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('Canceled')}>
                    Canceled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                onClick={() => setIsModalOpen(true)}
                leftIcon={<PlusIcon size={16} />}
              >
                Create New Project
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link 
                to={`/admin/projects/${project.id}`} 
                key={project.id}
                className="block transition-transform hover:-translate-y-1"
              >
                <ProjectCard
                  project={project}
                  onDelete={(id) => {
                    // Prevent navigation when clicking delete button
                    handleDeleteProject(id);
                  }}
                />
              </Link>
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
