
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, SortDesc } from "lucide-react";
import MedicalRecordCard from "@/components/dashboard/MedicalRecordCard";
import AddMedicalRecordForm from "@/components/dashboard/AddMedicalRecordForm";
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

export default function MedicalRecordsManager() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const fetchRecords = async () => {
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
  };

  useEffect(() => {
    fetchRecords();
  }, [activeTab]);

  const filteredRecords = records.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (record.provider && record.provider.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.summary && record.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const recordTypes = ["Clinical Exam", "Laboratory Test", "Imaging", "Surgery", "Prescription", "Immunization", "Consultation", "Other"];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Medical Records</CardTitle>
        <AddMedicalRecordForm onSuccess={fetchRecords} />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center mb-4">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="ghost" size="icon" className="ml-2">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <SortDesc className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full overflow-auto py-1 mb-4">
              <TabsTrigger value="all">All Records</TabsTrigger>
              {recordTypes.map((type) => (
                <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="pt-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecords.map((record) => (
                    <MedicalRecordCard 
                      key={record.id}
                      {...record}
                      onDelete={() => fetchRecords()}
                      onUpdate={() => fetchRecords()}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No medical records found.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchTerm ? "Try adjusting your search." : "Click 'Add Medical Record' to create a new record."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
