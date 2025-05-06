
import MedicalRecordsManager from "@/components/dashboard/MedicalRecordsManager";

export default function MedicalRecordsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Your Medical Records</h2>
      <p className="text-muted-foreground">
        All your medical records are encrypted and securely stored on the blockchain.
      </p>
      
      <MedicalRecordsManager />
    </div>
  );
}
