
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MedicalRecordsManager from "@/components/dashboard/MedicalRecordsManager";
import PermissionControl from "@/components/dashboard/PermissionControl";
import BlockchainActivity from "@/components/dashboard/BlockchainActivity";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types for data
interface BlockchainEvent {
  id: string;
  type: "access" | "update" | "create" | "permission" | "upload" | "delete" | "billing";
  actor: string;
  target: string;
  status: "success" | "pending" | "rejected";
  timestamp: Date;
}

interface Provider {
  id: string;
  name: string;
  type: string;
  status: "active" | "pending" | "inactive";
}

export default function PatientDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [blockchainEvents, setBlockchainEvents] = useState<BlockchainEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Patient");
  const { toast } = useToast();

  // Fetch user profile and data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error("Not authenticated");
        }

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, user_type')
          .eq('id', userData.user.id)
          .single();

        if (profileError) throw profileError;
        if (profileData?.full_name) {
          setUserName(profileData.full_name);
        }

        // Fetch blockchain events
        await fetchBlockchainEvents();

        // Fetch providers (using sample data for now)
        const sampleProviders = [
          {
            id: "prov-001",
            name: "Dr. Sarah Johnson",
            type: "Primary Care Physician",
            status: "active" as const,
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
        setProviders(sampleProviders);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: "Please try refreshing the page.",
        });
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch blockchain events
  const fetchBlockchainEvents = async () => {
    try {
      const { data: transactions, error } = await supabase
        .from('blockchain_transactions')
        .select(`
          id,
          transaction_type,
          status,
          created_at,
          metadata,
          medical_records(title, patient_id)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (transactions) {
        const events: BlockchainEvent[] = transactions.map(tx => {
          // Determine the actor (mostly the user for now)
          let actor = "You";
          
          // Determine the target based on transaction type and related record
          let target = tx.medical_records?.title || "Medical Record";
          if (tx.transaction_type === 'permission') {
            target = `Added access for ${tx.metadata?.provider || 'provider'}`;
          } else if (tx.transaction_type === 'upload') {
            target = tx.metadata?.file_name || 'Document';
          } else if (tx.transaction_type === 'billing') {
            target = `Bill for $${tx.metadata?.amount || '0'} from ${tx.metadata?.provider || 'provider'}`;
          }
          
          return {
            id: tx.id,
            type: tx.transaction_type as any,
            actor: actor,
            target: target,
            status: tx.status as "success" | "pending" | "rejected",
            timestamp: new Date(tx.created_at),
          };
        });
        
        setBlockchainEvents(events);
      }
    } catch (error) {
      console.error("Error fetching blockchain events:", error);
    }
  };

  const handleProviderUpdate = (updatedProviders: typeof providers) => {
    setProviders(updatedProviders);
  };

  return (
    <DashboardLayout
      userType="patient"
      userName={userName}
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
              
              <div className="grid gap-6">
                <MedicalRecordsManager />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BlockchainActivity events={blockchainEvents} />
                  <PermissionControl 
                    providers={providers} 
                    onPermissionsUpdate={handleProviderUpdate} 
                  />
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
              
              <MedicalRecordsManager />
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
