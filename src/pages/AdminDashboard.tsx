
import { useState } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { profile, isLoading } = useAuth();
  
  // If still loading, show nothing
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // If not logged in, redirect to login
  if (!profile) {
    return <Navigate to="/login" />;
  }

  return (
    <AdminDashboardLayout 
      userName={profile?.full_name || "Admin"}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <DashboardStats />
    </AdminDashboardLayout>
  );
}
