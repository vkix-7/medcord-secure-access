
import { Loader2 } from "lucide-react";
import MedicalRecordCard from "@/components/dashboard/MedicalRecordCard";

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

interface RecordsListProps {
  isLoading: boolean;
  records: MedicalRecord[];
  searchTerm: string;
  onRecordsUpdate: () => void;
}

export default function RecordsList({ isLoading, records, searchTerm, onRecordsUpdate }: RecordsListProps) {
  // Filter records based on search term
  const filteredRecords = records.filter(record => 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (record.provider && record.provider.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.summary && record.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredRecords.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No medical records found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          {searchTerm ? "Try adjusting your search." : "Click 'Add Medical Record' to create a new record."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredRecords.map((record) => (
        <MedicalRecordCard 
          key={record.id}
          {...record}
          onDelete={onRecordsUpdate}
          onUpdate={onRecordsUpdate}
        />
      ))}
    </div>
  );
}
