
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MedicalRecordCard from "@/components/dashboard/MedicalRecordCard";
import PermissionControl from "@/components/dashboard/PermissionControl";
import BlockchainActivity from "@/components/dashboard/BlockchainActivity";

// Sample data
const sampleMedicalRecords = [
  {
    id: "rec-001",
    title: "Annual Physical Examination",
    provider: "Dr. Sarah Johnson",
    date: "May 2, 2025",
    type: "Clinical Exam",
    summary: "Routine annual physical examination with blood work analysis. Overall health status is good.",
    content: "Patient appears in good health. Blood pressure: 120/80 mmHg. Pulse: 72 bpm. Weight: 154 lbs. Height: 5'10\". Blood tests indicate normal liver and kidney function. Cholesterol levels within normal range. Recommended maintaining current diet and exercise regimen.",
    status: "available" as const,
    encrypted: true,
  },
  {
    id: "rec-002",
    title: "COVID-19 Vaccination",
    provider: "City General Hospital",
    date: "April 15, 2025",
    type: "Immunization",
    summary: "Administration of COVID-19 mRNA vaccine, second booster dose.",
    status: "available" as const,
    encrypted: false,
  },
  {
    id: "rec-003",
    title: "Allergy Test Results",
    provider: "Dr. Michael Lee",
    date: "March 10, 2025",
    type: "Laboratory Test",
    summary: "Skin prick test and blood analysis for potential allergens.",
    status: "pending" as const,
    encrypted: true,
  }
];

const sampleProviders = [
  {
    id: "prov-001",
    name: "Dr. Sarah Johnson",
    type: "Primary Care Physician",
    status: "active" as const, // Using 'as const' to ensure proper typing
  },
  {
    id: "prov-002",
    name: "City General Hospital",
    type: "Hospital",
    status: "active" as const,
  },
  {
    id: "prov-003",
    name: "National Health Insurance",
    type: "Insurance Provider",
    status: "pending" as const,
  }
];

const sampleBlockchainEvents = [
  {
    id: "txn-001",
    type: "create" as const,
    actor: "Dr. Sarah Johnson",
    target: "Annual Physical Examination",
    status: "success" as const,
    timestamp: new Date("2025-05-02T14:32:00"),
  },
  {
    id: "txn-002",
    type: "access" as const,
    actor: "City General Hospital",
    target: "Medical History",
    status: "success" as const,
    timestamp: new Date("2025-05-01T09:15:00"),
  },
  {
    id: "txn-003",
    type: "permission" as const,
    actor: "You",
    target: "Added access for National Health Insurance",
    status: "pending" as const,
    timestamp: new Date("2025-04-30T16:45:00"),
  }
];

export default function PatientDashboard() {
  const [medicalRecords] = useState(sampleMedicalRecords);
  const [providers, setProviders] = useState(sampleProviders);
  const [blockchainEvents] = useState(sampleBlockchainEvents);
  
  const handleProviderUpdate = (updatedProviders: typeof providers) => {
    setProviders(updatedProviders);
  };
  
  return (
    <DashboardLayout
      userType="patient"
      userName="John Doe"
      tabs={[
        {
          id: "overview",
          label: "Overview",
          content: (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Patient Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back! View your medical records and manage access permissions securely on the blockchain.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-full">
                  <h3 className="text-lg font-medium mb-4">Recent Medical Records</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medicalRecords.map((record) => (
                      <MedicalRecordCard key={record.id} {...record} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          id: "records",
          label: "Medical Records",
          content: (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Your Medical Records</h2>
              <p className="text-muted-foreground">
                All your medical records are encrypted and securely stored on the blockchain.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicalRecords.map((record) => (
                  <MedicalRecordCard key={record.id} {...record} />
                ))}
              </div>
            </div>
          ),
        },
        {
          id: "permissions",
          label: "Access Control",
          content: (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Manage Access Permissions</h2>
              <p className="text-muted-foreground">
                Control who can access your medical records through blockchain-based smart contracts.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PermissionControl 
                  providers={providers} 
                  onPermissionsUpdate={handleProviderUpdate} 
                />
                
                <BlockchainActivity events={blockchainEvents} />
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
