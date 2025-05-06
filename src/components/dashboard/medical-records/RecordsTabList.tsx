
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecordsList from "./RecordsList";

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

interface RecordsTabListProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  recordTypes: string[];
  isLoading: boolean;
  records: MedicalRecord[];
  searchTerm: string;
  onRecordsUpdate: () => void;
}

export default function RecordsTabList({ 
  activeTab, 
  setActiveTab,
  recordTypes,
  isLoading,
  records,
  searchTerm,
  onRecordsUpdate
}: RecordsTabListProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full overflow-auto py-1 mb-4">
        <TabsTrigger value="all">All Records</TabsTrigger>
        {recordTypes.map((type) => (
          <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value={activeTab} className="pt-4">
        <RecordsList 
          isLoading={isLoading} 
          records={records} 
          searchTerm={searchTerm}
          onRecordsUpdate={onRecordsUpdate}
        />
      </TabsContent>
    </Tabs>
  );
}
