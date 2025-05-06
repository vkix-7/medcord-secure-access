
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

// Define our own types to avoid conflicts
export interface BlockchainEvent {
  id: string;
  type: "access" | "update" | "create" | "permission" | "upload" | "delete" | "billing";
  actor: string;
  target: string;
  status: "success" | "pending" | "rejected";
  timestamp: Date;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  status: "active" | "pending" | "inactive";
}

// Helper function to safely extract string values from JSON metadata
export const getMetadataValue = (metadata: Json | null, key: string): string => {
  if (!metadata) return '';
  
  if (typeof metadata === 'object' && metadata !== null) {
    const value = (metadata as Record<string, Json>)[key];
    return value?.toString() || '';
  }
  
  return '';
};

export function usePatientData() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [blockchainEvents, setBlockchainEvents] = useState<BlockchainEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Patient");
  const { toast } = useToast();

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
            target = `Added access for ${getMetadataValue(tx.metadata, 'provider') || 'provider'}`;
          } else if (tx.transaction_type === 'upload') {
            target = getMetadataValue(tx.metadata, 'file_name') || 'Document';
          } else if (tx.transaction_type === 'billing') {
            const amount = getMetadataValue(tx.metadata, 'amount') || '0';
            const provider = getMetadataValue(tx.metadata, 'provider') || 'provider';
            target = `Bill for $${amount} from ${provider}`;
          }
          
          return {
            id: tx.id,
            type: tx.transaction_type as BlockchainEvent["type"],
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

        // Set up sample data
        const sampleProviders: Provider[] = [
          {
            id: "prov-001",
            name: "Dr. Sarah Johnson",
            type: "Primary Care Physician",
            status: "active",
          },
          {
            id: "prov-002",
            name: "City General Hospital",
            type: "Hospital",
            status: "active",
          },
          {
            id: "prov-003",
            name: "National Health Insurance",
            type: "Insurance Provider",
            status: "pending",
          }
        ];
        setProviders(sampleProviders);

        // Insert sample medical records if none exist
        await createSampleRecords(userData.user.id);

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

  // Create sample medical records
  const createSampleRecords = async (userId: string) => {
    try {
      // First check if records already exist
      const { data: existingRecords, error: checkError } = await supabase
        .from('medical_records')
        .select('id')
        .eq('patient_id', userId)
        .limit(1);

      if (checkError) throw checkError;
      
      // Only add sample records if none exist
      if (existingRecords && existingRecords.length === 0) {
        const sampleRecords = [
          {
            title: "Annual Physical Examination",
            provider: "Dr. Sarah Johnson",
            type: "Clinical Exam",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            summary: "Routine annual check-up. All vitals normal.",
            content: "Blood pressure: 120/80, Heart rate: 68 bpm, Weight: 160 lbs, Height: 5'10\"",
            patient_id: userId,
            status: "active",
          },
          {
            title: "COVID-19 Vaccination",
            provider: "City Health Department",
            type: "Immunization",
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
            summary: "Second dose of COVID-19 vaccine administered",
            content: "Pfizer-BioNTech COVID-19 Vaccine, Lot #BX5467, administered in left deltoid",
            patient_id: userId,
            status: "active",
          },
          {
            title: "Blood Work Results",
            provider: "LabCorp Medical Laboratory",
            type: "Laboratory Test",
            date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
            summary: "Complete blood count and metabolic panel",
            content: "All results within normal range. Cholesterol: 185 mg/dL, Glucose: 92 mg/dL",
            patient_id: userId,
            status: "active",
          }
        ];

        const { error: insertError } = await supabase
          .from('medical_records')
          .insert(sampleRecords);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Error creating sample records:", error);
    }
  };

  // Use type assertion to resolve type mismatch
  const handleProviderUpdate = (updatedProviders: any) => {
    setProviders(updatedProviders as Provider[]);
  };

  return { 
    providers, 
    blockchainEvents, 
    loading, 
    userName, 
    handleProviderUpdate,
    fetchBlockchainEvents
  };
}
