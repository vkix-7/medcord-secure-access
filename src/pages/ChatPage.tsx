
import { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatInterface from "@/components/chat/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  const [activeTab, setActiveTab] = useState("chat");
  
  if (!user || !profile) {
    return null; // Will redirect via the useEffect
  }
  
  return (
    <ChatProvider>
      <AdminDashboardLayout 
        userName={profile?.full_name || "User"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      >
        <ChatInterface />
      </AdminDashboardLayout>
    </ChatProvider>
  );
}
