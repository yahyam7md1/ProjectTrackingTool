import { Button } from './components/ui/Button'; // Import your shiny new component
import { FaCoffee, FaTrash, FaArrowRight } from 'react-icons/fa';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-semibold mb-6">Button Showcase</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Primary (default)</p>
            <Button onClick={() => alert('Primary clicked')}>Primary</Button>

            <p className="text-sm text-text-secondary">Primary with icon</p>
            <Button leftIcon={<FaCoffee />} rightIcon={<FaArrowRight />}>
              Get Coffee
            </Button>

            <p className="text-sm text-text-secondary">Loading state</p>
            <Button loading>Saving...</Button>

            <p className="text-sm text-text-secondary">Full width</p>
            <Button className="w-full">Full width CTA</Button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-text-secondary">Secondary (outline)</p>
            <Button variant="secondary">Secondary</Button>

            <p className="text-sm text-text-secondary">Destructive</p>
            <Button variant="destructive" leftIcon={<FaTrash />}>
              Delete
            </Button>

            <p className="text-sm text-text-secondary">Small / Large sizes</p>
            <div className="flex gap-2">
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>

            <p className="text-sm text-text-secondary">Ghost</p>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;