import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import VerticalTimeline from '../../../components/client/VerticalTimeline';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

const ClientManageProjectPage: React.FC = () => {
  // Mock project data with phases
  const mockProject = {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with new branding and improved user experience.',
    phases: [
      {
        id: '1',
        name: 'Discovery & Planning',
        description: 'Initial research, requirement gathering, and project planning. Defining project scope and timeline.',
        status: 'completed' as const,
        deadline: 'July 15, 2025'
      },
      {
        id: '2',
        name: 'Design & Wireframing',
        description: 'Creating wireframes and design mockups for approval. Including responsive layouts for all devices.',
        status: 'active' as const,
        deadline: 'August 1, 2025'
      },
      {
        id: '3',
        name: 'Development',
        description: 'Front-end and back-end implementation based on approved designs. Includes database integration and API development.',
        status: 'pending' as const,
        deadline: 'September 15, 2025'
      },
      
    ]
  };

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
        {/* Back Navigation */}
        <Link 
          to="/dashboard/client" 
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{mockProject.name}</h1>
          <p className="mt-2 text-gray-600">{mockProject.description}</p>
        </div>

        {/* Project Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Project Timeline</h2>
          <VerticalTimeline phases={mockProject.phases} />
        </Card>
      </main>
    </div>
  );
};

export default ClientManageProjectPage;
