
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddMedicalRecordForm from "@/components/dashboard/AddMedicalRecordForm";
import RecordsFilter from "./medical-records/RecordsFilter";
import RecordsTabList from "./medical-records/RecordsTabList";
import { useMedicalRecords, RECORD_TYPES } from "@/hooks/useMedicalRecords";

export default function MedicalRecordsManager() {
  const { 
    records,
    isLoading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    refreshRecords
  } = useMedicalRecords();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Medical Records</CardTitle>
        <AddMedicalRecordForm onSuccess={refreshRecords} />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <RecordsFilter 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
          
          <RecordsTabList
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            recordTypes={RECORD_TYPES}
            isLoading={isLoading}
            records={records}
            searchTerm={searchTerm}
            onRecordsUpdate={refreshRecords}
          />
        </div>
      </CardContent>
    </Card>
  );
}
