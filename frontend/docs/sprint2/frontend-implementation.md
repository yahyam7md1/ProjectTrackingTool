# Sprint 2 Frontend Implementation Documentation

This document provides a comprehensive overview of the frontend implementation completed during Sprint 2 of the Phase Tracker project. It covers the development of project and phase management features, components, contexts, and integration with the backend API.

## Table of Contents
1. [Overview](#overview)
2. [Project Context](#project-context)
3. [Admin Dashboard Pages](#admin-dashboard-pages)
   - [Admin Dashboard](#admin-dashboard)
   - [Manage Project Page](#manage-project-page)
4. [Project Components](#project-components)
   - [PhasesList](#phaseslist)
   - [EnhancedPhaseItem](#enhancedphaseitem)
   - [ClientsList](#clientslist)
   - [ClientItem](#clientitem)
   - [AddPhasesModal](#addphasesmodal)
   - [ProjectSettingsModal](#projectsettingsmodal)
   - [ProjectMiniCard](#projectminicard)
5. [Backend Integration](#backend-integration)
   - [API Endpoints Used](#api-endpoints-used)
   - [Data Flow](#data-flow)
6. [Key Features Implemented](#key-features-implemented)
7. [Conclusion](#conclusion)

## Overview

During Sprint 2, the frontend implementation focused on creating a comprehensive project management interface for administrators. The key components developed include:

- A project context for managing project state across the application
- Admin dashboard views for project overview and detailed management
- Components for managing phases within projects
- Components for managing client access to projects
- Modals for adding phases and updating project settings
- Integration with the backend API for CRUD operations

These components work together to provide a seamless and intuitive interface for project and phase management, allowing administrators to effectively track project progress, manage phases, and control client access.

## Project Context

The `ProjectsContext.tsx` was implemented to manage project state across the application. This context provides a central store for project data and functions to interact with the backend API.

### Key Features:

- **State Management**: Maintains projects data, loading state, and error state
- **Data Fetching**: Provides methods to fetch all projects and refresh individual projects
- **Data Transformation**: Converts snake_case keys from the API to camelCase for frontend consistency

```tsx
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
```

The context provides two main functions:

1. **fetchProjects()**: Retrieves all projects from the backend API and updates the context state
2. **refreshProject(projectId)**: Retrieves a specific project by ID and updates it in the context state

The context also includes a helper function `camelCaseKeys` that converts snake_case keys from the API responses to camelCase for consistency in the frontend code.

## Admin Dashboard Pages

### Admin Dashboard

The `AdminDashboard.tsx` component serves as the main entry point for administrators to view and manage their projects.

#### Key Features:

- **Project Overview**: Displays a grid of project cards showing high-level information
- **Project Creation**: Allows administrators to create new projects
- **Search and Filter**: Provides search and filter functionality for projects
- **Loading States**: Handles loading, empty, and error states gracefully

```tsx
const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const { projects, loading: isLoading, error, fetchProjects } = useProjects();
  
  // State for managing the CreateProjectModal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for search and filter functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Fetch projects on component mount only
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects, token]);
  
  // Filter projects based on search term and status filter
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter by status and search term
      const statusMatch = statusFilter === 'All' || 
        project.status.toLowerCase() === statusFilter.toLowerCase();
      const searchMatch = !searchTerm || 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return statusMatch && searchMatch;
    });
  }, [projects, searchTerm, statusFilter]);
  
  // Handler for creating a new project
  const handleCreateProject = async (name: string, description: string) => {
    try {
      const response = await apiService.post('/admin/projects', {
        name,
        description
      });
      
      if (response.data.success) {
        await fetchProjects();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };
  
  // ...rest of the component
};
```

The dashboard implements multiple UI states:
- **Loading**: Shows a spinner while projects are being fetched
- **Error**: Displays an error message with a retry button
- **Empty**: Shows a welcome message when there are no projects
- **Loaded**: Displays a grid of project cards with search and filter controls

### Manage Project Page

The `ManageProjectPage.tsx` component provides detailed project management functionality, allowing administrators to:

- View and manage project phases
- Add and remove clients from the project
- Update project settings
- View project progress

This component is split into multiple sections and uses tabs to organize different aspects of project management:

```tsx
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
  
  // Function to fetch project data
  const fetchProjectData = async (id: string | undefined) => {
    if (!id) {
      // If no projectId is provided, try to get the first project
      try {
        await fetchProjects();
        if (projects && projects.length > 0) {
          navigate(`/admin/projects/${projects[0].id}`);
        } else {
          setError('No projects found. Please create one first.');
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError(err.response?.data?.message || 'Failed to load projects');
        setIsLoading(false);
      }
      return;
    }
    
    // Fetch the specific project data
    setIsLoading(true);
    setError(null);
    
    try {
      const contextProject = await refreshProject(id);
      
      if (contextProject) {
        setProject({
          ...contextProject,
          phases: Array.isArray(contextProject.phases) ? contextProject.phases : [],
          clients: Array.isArray(contextProject.clients) ? contextProject.clients : []
        });
      } else {
        // Fallback to direct API call
        const response = await apiService.get(`/admin/projects/${id}`);
        if (response.data.success) {
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
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Re-fetch project data when projectId changes
  useEffect(() => {
    fetchProjectData(projectId);
  }, [projectId, navigate]);
  
  // ...rest of the component
};
```

The Manage Project Page uses a tab-based interface to organize:
1. **Phases**: For managing project phases using the PhasesList component
2. **Clients**: For managing client access using the ClientsList component
3. **Details**: For viewing detailed project information

It also includes a sidebar that shows a list of all projects for quick navigation between projects.

## Project Components

### PhasesList

The `PhasesList.tsx` component provides drag-and-drop functionality for reordering phases and managing phase status. It uses @dnd-kit for the drag-and-drop implementation.

#### Key Features:

- **Drag-and-Drop Reordering**: Allows phases to be reordered through drag-and-drop
- **Phase Management**: Displays phases with their status and provides actions for each phase
- **API Integration**: Communicates with the backend to update phase order

```tsx
const PhasesList: React.FC<PhasesListProps> = ({ 
  projectId, 
  phases, 
  onPhasesChange,
  refetchData,
  hideHeader = false,
  onAddPhaseClick
}) => {
  // State for the confirmation dialog
  const [activationCandidateId, setActivationCandidateId] = useState<string | null>(null);
  
  // Set up DnD sensors with touch-friendly configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min distance (in px) before drag starts - helps with mobile touch
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle phase reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = phases.findIndex((phase) => phase.id === active.id);
      const newIndex = phases.findIndex((phase) => phase.id === over.id);

      // Create new array with updated order
      const reorderedPhases = arrayMove(phases, oldIndex, newIndex).map(
        (phase, index) => ({ ...phase, order: index })
      );

      try {
        // Extract just the IDs for the API request
        const orderedPhaseIds = reorderedPhases.map(phase => parseInt(phase.id));
        
        // Call API to reorder phases
        await apiService.put(`/admin/projects/${projectId}/phases/reorder`, {
          orderedPhaseIds: orderedPhaseIds
        });
        
        // Update UI via parent component
        onPhasesChange(reorderedPhases);
        
        // Refresh data to ensure we have the latest state
        if (refetchData) {
          await refetchData();
        }
      } catch (error) {
        console.error('Error reordering phases:', error);
      }
    }
  };
  
  // ...rest of the component
};
```

### EnhancedPhaseItem

The `EnhancedPhaseItem.tsx` component represents an individual phase within the PhasesList. It provides rich functionality for managing a single phase.

#### Key Features:

- **Sortable Item**: Acts as a sortable item within the drag-and-drop system
- **Collapsible Details**: Shows/hides detailed phase information
- **Status Management**: Provides controls to set a phase as active, complete, or reopen it
- **Editing**: Allows editing phase name and description
- **Estimated Completion Date**: Supports setting and clearing estimated completion dates

```tsx
export interface Phase {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_completed: boolean;
  order: number;
  createdAt?: string;
  estimated_completion_at?: string | null;
}

// Helper function to derive phase status from is_active and is_completed flags
const getPhaseStatus = (phase: { is_active: boolean; is_completed: boolean }): 'active' | 'completed' | 'pending' => {
  if (phase.is_completed) {
    return 'completed';
  }
  if (phase.is_active) {
    return 'active';
  }
  return 'pending';
};

const EnhancedPhaseItem: React.FC<EnhancedPhaseItemProps> = ({ 
  phase, 
  projectId,
  onSetActive, 
  onComplete,
  onReopen,
  onUpdate,
  onDelete,
  refetchData
}) => {
  const status = getPhaseStatus(phase);
  
  const [isOpen, setIsOpen] = useState(false);
  const [editName, setEditName] = useState(phase.name);
  const [editDescription, setEditDescription] = useState(phase.description);
  const [isEditing, setIsEditing] = useState(false);
  const [showEstimateInput, setShowEstimateInput] = useState(false);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState(phase.estimated_completion_at || '');
  
  // Handler function for setting a phase as active
  const handleSetActive = async () => {
    if (!projectId) {
      console.error('Cannot set phase as active: projectId is missing');
      return;
    }
    
    try {
      await apiService.post(`/admin/projects/${projectId}/phases/${phase.id}/set-active`);
      
      // If the parent component provided a refetch function, call it to update the UI
      if (refetchData) {
        await refetchData();
      }
    } catch (error) {
      console.error('Error setting phase as active:', error);
    }
  };
  
  // Similar handlers for setting complete and reopening phases
  // ...rest of the component
};
```

### ClientsList

The `ClientsList.tsx` component provides functionality for managing clients who have access to a project.

#### Key Features:

- **Client List Display**: Shows all clients assigned to the project
- **Add Client Form**: Provides a form to add new clients by email
- **Input Validation**: Validates email addresses before submission
- **Client Removal**: Allows administrators to remove clients from the project

```tsx
const ClientsList: React.FC<ClientsListProps> = ({
  projectId,
  clients,
  onAddClient,
  onRemoveClient,
  refetchData,
  hideHeader = false,
  hideForm = false
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email) {
      setError('Email is required');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if email is already in use
    if (clients.some(client => client.email.toLowerCase() === email.toLowerCase())) {
      setError('This client is already added to the project');
      return;
    }

    // Clear any previous errors
    setError(null);
    
    try {
      // Make API request to add client
      await apiService.post(`/admin/projects/${projectId}/clients`, { email });
      
      // Add the client via the parent component handler
      onAddClient(email);
      
      // Clear the input field
      setEmail('');
      
      // Refresh data to ensure UI is in sync
      if (refetchData) {
        refetchData();
      }
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to add client. Please try again.');
    }
  };
  
  // ...rest of the component
};
```

### ClientItem

The `ClientItem.tsx` component represents an individual client within the ClientsList, with functionality to remove them from the project.

### AddPhasesModal

The `AddPhasesModal.tsx` component provides a multi-step wizard for adding phases to a project.

#### Key Features:

- **Multi-step Wizard**: Guides the user through the process of adding phases
- **Dynamic Phase Creation**: Allows adding multiple phases at once
- **Drag-and-Drop Ordering**: Allows users to reorder phases before saving
- **Validation**: Ensures all required fields are completed before submission

```tsx
const AddPhasesModal: React.FC<AddPhasesModalProps> = ({
  isOpen,
  onClose,
  onAddPhases,
}) => {
  // State management for the multi-step wizard
  const [step, setStep] = useState(1);
  const [numPhases, setNumPhases] = useState(1);
  const [phases, setPhases] = useState<{ id: string; name: string; description: string }[]>([
    { id: 'phase-1', name: '', description: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFormErrors, setHasFormErrors] = useState(false);
  
  // Set up DnD sensors for phase reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle phase input changes
  const handlePhaseInputChange = (id: string, field: 'name' | 'description', value: string) => {
    setPhases(prevPhases => 
      prevPhases.map(phase => 
        phase.id === id ? { ...phase, [field]: value } : phase
      )
    );
  };

  // Handle phase reordering via drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setPhases(phases => {
        const oldIndex = phases.findIndex(phase => phase.id === active.id);
        const newIndex = phases.findIndex(phase => phase.id === over.id);
        
        return arrayMove(phases, oldIndex, newIndex);
      });
    }
  };
  
  // ...rest of the component
};
```

### ProjectSettingsModal

The `ProjectSettingsModal.tsx` component allows administrators to update project settings or delete a project.

#### Key Features:

- **Project Name/Description Editing**: Allows updating basic project information
- **Status Changes**: Provides a dropdown to change the project status
- **Project Deletion**: Includes a confirmation dialog for project deletion
- **Creation Date Display**: Shows when the project was created

```tsx
const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialSettings,
  project,
  onSave,
  onDelete,
}) => {
  const [settings, setSettings] = useState<ProjectSettings>({
    ...initialSettings,
    status: initialSettings.status || 'Active'
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Reset form when the modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setSettings({
        ...initialSettings,
        status: initialSettings.status || 'Active'
      });
    }
  }, [isOpen, initialSettings]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    onClose();
  };
  
  // ...rest of the component
};
```

### ProjectMiniCard

The `ProjectMiniCard.tsx` component displays a condensed view of a project, used in the sidebar of the Manage Project Page.

## Backend Integration

### API Endpoints Used

The frontend integrates with the following backend API endpoints:

#### Projects:
- `GET /admin/projects` - Fetch all projects
- `GET /admin/projects/:projectId` - Get a specific project by ID
- `POST /admin/projects` - Create a new project
- `PUT /admin/projects/:projectId` - Update a project
- `DELETE /admin/projects/:projectId` - Delete a project

#### Phases:
- `POST /admin/projects/:projectId/phases` - Add a new phase to a project
- `PUT /admin/projects/:projectId/phases/reorder` - Reorder phases
- `PUT /admin/projects/:projectId/phases/:phaseId` - Update a phase
- `DELETE /admin/projects/:projectId/phases/:phaseId` - Delete a phase
- `POST /admin/projects/:projectId/phases/:phaseId/set-active` - Set a phase as active
- `POST /admin/projects/:projectId/phases/:phaseId/set-complete` - Mark a phase as complete
- `POST /admin/projects/:projectId/phases/:phaseId/reopen` - Reopen a completed phase

#### Clients:
- `POST /admin/projects/:projectId/clients` - Assign a client to a project
- `DELETE /admin/projects/:projectId/clients/:clientId` - Remove a client from a project

### Data Flow

The data flow between the frontend and backend follows this pattern:

1. **Context Layer**: The `ProjectsContext` manages global project state and provides methods to interact with the API
2. **Page Components**: Pages like `AdminDashboard` and `ManageProjectPage` use the context to fetch and display data
3. **UI Components**: Components like `PhasesList` and `ClientsList` receive data from their parent components and dispatch actions
4. **API Service**: The `apiService` module handles the actual HTTP requests to the backend

## Key Features Implemented

1. **Project Management Dashboard**
   - Overview of all projects with filtering and search
   - Creation of new projects
   - Access to detailed project management

2. **Project Detail Management**
   - Tabbed interface for organizing project information
   - Sidebar for quick navigation between projects

3. **Phase Management**
   - Visual representation of project phases
   - Drag-and-drop reordering of phases
   - Status management (active, complete, pending)
   - Phase detail editing

4. **Client Access Management**
   - Adding clients to projects by email
   - Removing client access
   - Viewing all clients with access

5. **Project Settings**
   - Updating project name and description
   - Changing project status
   - Project deletion with confirmation

6. **Responsive Design**
   - Mobile-friendly layouts
   - Adaptive controls for different screen sizes

7. **Drag-and-Drop Functionality**
   - Phase reordering in both the phases list and when adding new phases
   - Touch-friendly implementation for mobile devices

## Conclusion

Sprint 2 delivered a comprehensive frontend implementation for the Phase Tracker application, focusing on project and phase management. The implementation follows a clean architecture approach:

- **Context API**: For global state management
- **Component Composition**: For building complex UIs from simple, reusable parts
- **API Integration**: For seamless communication with the backend

The user interface provides administrators with powerful tools to manage projects, phases, and client access, all within an intuitive and responsive design. The implementation is built with TypeScript to ensure type safety and includes comprehensive error handling to provide a robust user experience.

The frontend components developed in Sprint 2 lay a strong foundation for future enhancements, such as client-facing views, notifications, and reporting features in upcoming sprints.
