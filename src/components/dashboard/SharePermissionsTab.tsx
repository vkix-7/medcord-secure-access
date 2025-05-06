
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { UserPlus, Shield, Clock, X } from "lucide-react";
import { toast } from "sonner";

const initialSharedUsers = [
  { id: 1, name: "Dr. Sarah Johnson", email: "sarah.johnson@example.com", access: "Full Access", status: "active" },
  { id: 2, name: "Dr. Michael Chen", email: "michael.chen@example.com", access: "View Only", status: "pending" },
  { id: 3, name: "Caregiver: Emma Davis", email: "emma.davis@example.com", access: "Limited Access", status: "active" },
];

export default function SharePermissionsTab() {
  const [sharedUsers, setSharedUsers] = useState(initialSharedUsers);
  const [email, setEmail] = useState("");
  const [accessType, setAccessType] = useState("View Only");

  const handleAddUser = () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    
    const newUser = {
      id: sharedUsers.length + 1,
      name: `Pending User`,
      email: email,
      access: accessType,
      status: "pending"
    };
    
    setSharedUsers([...sharedUsers, newUser]);
    setEmail("");
    toast.success("Permission invitation sent successfully");
  };

  const handleRemoveAccess = (id: number) => {
    setSharedUsers(sharedUsers.filter(user => user.id !== id));
    toast.success("Access permission removed");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Share Medical Information</h2>
        <p className="text-muted-foreground">
          Control who has access to your medical records and what level of access they have
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <CardTitle>Grant Access</CardTitle>
          </div>
          <CardDescription>
            Add healthcare providers or caregivers who need access to your medical information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="doctor@hospital.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="access">Access Level</Label>
              <select 
                id="access"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={accessType}
                onChange={(e) => setAccessType(e.target.value)}
              >
                <option value="View Only">View Only</option>
                <option value="Limited Access">Limited Access</option>
                <option value="Full Access">Full Access</option>
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddUser} className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Send Access Invitation
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Active Permissions</CardTitle>
          </div>
          <CardDescription>
            People who currently have access to your medical information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Email</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sharedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.access}</TableCell>
                  <TableCell>
                    {user.status === "pending" ? (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 text-amber-500 mr-1" />
                        <span className="text-amber-500">Pending</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500">Active</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAccess(user.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
