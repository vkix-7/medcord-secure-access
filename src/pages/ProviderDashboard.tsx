
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MedicalRecordCard from "@/components/dashboard/MedicalRecordCard";
import BlockchainActivity from "@/components/dashboard/BlockchainActivity";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { Search, UserPlus, FileText, Database } from "lucide-react";

// Sample data
const samplePatients = [
  {
    id: "pat-001",
    name: "John Doe",
    dob: "10/15/1985",
    patientId: "P10054789",
    lastVisit: "May 2, 2025",
  },
  {
    id: "pat-002",
    name: "Emily Johnson",
    dob: "03/22/1992",
    patientId: "P10067523",
    lastVisit: "April 28, 2025",
  },
  {
    id: "pat-003",
    name: "Michael Chen",
    dob: "09/04/1976",
    patientId: "P10034681",
    lastVisit: "April 15, 2025",
  }
];

const sampleMedicalRecords = [
  {
    id: "rec-004",
    title: "Hypertension Follow-up",
    provider: "Dr. Robert Williams",
    date: "May 2, 2025",
    type: "Clinical Exam",
    summary: "Follow-up visit for hypertension management. Blood pressure stable with current medication.",
    status: "available" as const,
    encrypted: false,
  },
  {
    id: "rec-005",
    title: "Lab Results - Lipid Panel",
    provider: "City General Hospital",
    date: "April 25, 2025",
    type: "Laboratory Test",
    summary: "Complete lipid panel results showing cholesterol levels within target range.",
    status: "available" as const,
    encrypted: true,
  }
];

const sampleBlockchainEvents = [
  {
    id: "txn-004",
    type: "create" as const,
    actor: "Dr. Robert Williams",
    target: "Created Hypertension Follow-up record for John Doe",
    status: "success" as const,
    timestamp: new Date("2025-05-02T11:22:00"),
  },
  {
    id: "txn-005",
    type: "access" as const,
    actor: "Dr. Robert Williams",
    target: "Accessed Medical History for Emily Johnson",
    status: "success" as const,
    timestamp: new Date("2025-04-28T14:05:00"),
  },
  {
    id: "txn-006",
    type: "update" as const,
    actor: "Dr. Robert Williams",
    target: "Updated Prescription for Michael Chen",
    status: "pending" as const,
    timestamp: new Date("2025-04-15T10:30:00"),
  }
];

export default function ProviderDashboard() {
  const [patients] = useState(samplePatients);
  const [medicalRecords] = useState(sampleMedicalRecords);
  const [blockchainEvents] = useState(sampleBlockchainEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  
  const handleCreateRecord = () => {
    setIsCreatingRecord(true);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      setIsCreatingRecord(false);
      toast.success("Medical record created and securely stored on the blockchain");
    }, 2000);
  };
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <DashboardLayout
      userType="provider"
      userName="Dr. Robert Williams"
      tabs={[
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Provider Dashboard</h2>
              <p className="text-muted-foreground">
                Securely manage patient records and verify information on the blockchain.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Find Patient</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or patient ID..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <div className="border rounded-md">
                        <div className="grid grid-cols-3 p-3 bg-muted/40 border-b text-sm font-medium">
                          <div>Name</div>
                          <div>Patient ID</div>
                          <div>Last Visit</div>
                        </div>
                        {filteredPatients.length > 0 ? (
                          filteredPatients.map((patient) => (
                            <div 
                              key={patient.id}
                              className="grid grid-cols-3 p-3 border-b last:border-b-0 hover:bg-muted/20 cursor-pointer"
                            >
                              <div>{patient.name}</div>
                              <div>{patient.patientId}</div>
                              <div>{patient.lastVisit}</div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-muted-foreground">
                            No patients found matching your search.
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="gap-2" asChild variant="outline">
                      <a href="#">
                        <UserPlus className="h-4 w-4" />
                        <span>Register New Patient</span>
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-medblue-600" />
                      <CardTitle>Create Record</CardTitle>
                    </div>
                    <CardDescription>
                      Generate a new medical record
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a new encrypted medical record that will be securely stored on the blockchain.
                    </p>
                    <div className="space-y-4">
                      <Button 
                        className="w-full gap-2" 
                        onClick={handleCreateRecord}
                        disabled={isCreatingRecord}
                      >
                        {isCreatingRecord ? (
                          <span className="flex items-center gap-2">
                            <Database className="h-4 w-4 animate-pulse" />
                            Creating...
                          </span>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            <span>New Record</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Recent Medical Records</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medicalRecords.map((record) => (
                      <MedicalRecordCard key={record.id} {...record} />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Blockchain Activity</h3>
                  <BlockchainActivity events={blockchainEvents.slice(0, 2)} />
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "patients",
          label: "Patients",
          content: (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Patient Management</h2>
              <p className="text-muted-foreground">
                Search for patients and manage their medical records.
              </p>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or patient ID..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="border rounded-md">
                <div className="grid grid-cols-4 p-3 bg-muted/40 border-b text-sm font-medium">
                  <div>Name</div>
                  <div>Patient ID</div>
                  <div>Date of Birth</div>
                  <div>Last Visit</div>
                </div>
                {filteredPatients.map((patient) => (
                  <div 
                    key={patient.id}
                    className="grid grid-cols-4 p-3 border-b last:border-b-0 hover:bg-muted/20 cursor-pointer"
                  >
                    <div>{patient.name}</div>
                    <div>{patient.patientId}</div>
                    <div>{patient.dob}</div>
                    <div>{patient.lastVisit}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Register New Patient</span>
                </Button>
              </div>
            </div>
          ),
        },
        {
          id: "activity",
          label: "Blockchain Activity",
          content: (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Blockchain Transactions</h2>
              <p className="text-muted-foreground">
                View your recent activities recorded on the blockchain ledger.
              </p>
              
              <BlockchainActivity events={blockchainEvents} />
            </div>
          ),
        },
      ]}
    />
  );
}
