
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MedicalRecord {
  id: string;
  title: string;
  provider: string | null;
  date: string | null;
  type: string;
  summary: string | null;
  content: string | null;
  status: "available" | "pending" | "restricted";
  encrypted: boolean | null;
}

export function useMedicalRecords(initialFilter: string = "all") {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(initialFilter);
  const { toast } = useToast();

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('medical_records')
        .select('*')
        .order('date', { ascending: false });
        
      if (activeTab !== "all") {
        query = query.eq('type', activeTab);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const formattedRecords: MedicalRecord[] = data.map(record => ({
        id: record.id,
        title: record.title,
        provider: record.provider,
        date: record.date ? new Date(record.date).toLocaleDateString() : null,
        type: record.type,
        summary: record.summary,
        content: record.content,
        status: (record.status as "available" | "pending" | "restricted") || "available",
        encrypted: record.encrypted || false
      }));
      
      setRecords(formattedRecords);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      toast({
        variant: "destructive",
        title: "Failed to load medical records",
        description: "There was a problem loading your medical records. Please refresh and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    isLoading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    refreshRecords: fetchRecords
  };
}

export const RECORD_TYPES = [
  "Clinical Exam", 
  "Laboratory Test", 
  "Imaging", 
  "Surgery", 
  "Prescription", 
  "Immunization", 
  "Consultation", 
  "Other"
];
