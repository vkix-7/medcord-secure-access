
import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientOverviewTab from "@/components/dashboard/PatientOverviewTab";
import MedicalRecordsTab from "@/components/dashboard/MedicalRecordsTab";
import AccessControlTab from "@/components/dashboard/AccessControlTab";
import { usePatientData } from "@/hooks/usePatientData";

export default function PatientDashboard() {
  const { 
    providers, 
    blockchainEvents, 
    loading, 
    userName, 
    handleProviderUpdate 
  } = usePatientData();

  return (
    <DashboardLayout
      userType="patient"
      userName={userName}
      tabs={[
        {
          id: "overview",
          label: "Overview",
          content: (
            <PatientOverviewTab 
              blockchainEvents={blockchainEvents} 
              providers={providers}
              onProviderUpdate={handleProviderUpdate}
            />
          ),
        },
        {
          id: "records",
          label: "Medical Records",
          content: (
            <MedicalRecordsTab />
          ),
        },
        {
          id: "permissions",
          label: "Access Control",
          content: (
            <AccessControlTab 
              blockchainEvents={blockchainEvents} 
              providers={providers}
              onProviderUpdate={handleProviderUpdate}
            />
          ),
        },
      ]}
    />
  );
}
