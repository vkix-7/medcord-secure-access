import { useState } from "react";
import { usePatientData } from "@/hooks/usePatientData";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import PatientOverviewTab from "@/components/dashboard/PatientOverviewTab";
import MedicalRecordsTab from "@/components/dashboard/MedicalRecordsTab";
import AccessControlTab from "@/components/dashboard/AccessControlTab";
import SharePermissionsTab from "@/components/dashboard/SharePermissionsTab";
import AskAIAssistantTab from "@/components/dashboard/AskAIAssistantTab";
import AppointmentsTab from "@/components/dashboard/AppointmentsTab";
import ShopTab from "@/components/dashboard/ShopTab";
import ProfileTab from "@/components/dashboard/ProfileTab";
import DashboardStats from "@/components/dashboard/DashboardStats";
import SettingsTab from "@/components/dashboard/SettingsTab";

export default function PatientDashboard() {
  const { 
    providers, 
    blockchainEvents, 
    loading, 
    userName, 
    handleProviderUpdate 
  } = usePatientData();
  
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <PatientOverviewTab 
            blockchainEvents={blockchainEvents} 
            providers={providers}
            onProviderUpdate={handleProviderUpdate}
          />
        );
      case "records":
        return <MedicalRecordsTab />;
      case "permissions":
        return (
          <AccessControlTab 
            blockchainEvents={blockchainEvents} 
            providers={providers}
            onProviderUpdate={handleProviderUpdate}
          />
        );
      case "share":
        return <SharePermissionsTab />;
      case "ai-assistant":
        return <AskAIAssistantTab />;
      case "appointments":
        return <AppointmentsTab />;
      case "shop":
        return <ShopTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <AdminDashboardLayout 
      userName={userName}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderTabContent()}
    </AdminDashboardLayout>
  );
}
