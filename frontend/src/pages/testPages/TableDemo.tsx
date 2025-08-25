import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  TableCaption 
} from "../../components/ui/Table";

const mockData = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Active", role: "Developer", lastActive: "Today" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Away", role: "Designer", lastActive: "Yesterday" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", status: "Offline", role: "Manager", lastActive: "3 days ago" },
  { id: 4, name: "Sarah Williams", email: "sarah@example.com", status: "Active", role: "Developer", lastActive: "Today" },
  { id: 5, name: "David Brown", email: "david@example.com", status: "Active", role: "QA Engineer", lastActive: "1 hour ago" },
];

const TableDemo = () => {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Table Component Demo</h1>
      
      <div className="rounded-md border mb-8">
        <Table>
          <TableCaption>List of Team Members</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.role}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      person.status === "Active" ? "bg-green-500" : 
                      person.status === "Away" ? "bg-yellow-500" : "bg-gray-400"
                    }`}></div>
                    {person.status}
                  </div>
                </TableCell>
                <TableCell>{person.lastActive}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Example of a simpler table without caption */}
      <div className="rounded-md border">
        <h2 className="text-xl font-semibold mb-4 px-4">Simple Table Example</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((person) => (
              <TableRow key={person.id}>
                <TableCell>#{person.id}</TableCell>
                <TableCell>{person.name}</TableCell>
                <TableCell>{person.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableDemo;
