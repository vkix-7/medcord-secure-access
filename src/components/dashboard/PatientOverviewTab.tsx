
import { BlockchainEvent, Provider } from "@/hooks/usePatientData";
import MedicalRecordsManager from "@/components/dashboard/MedicalRecordsManager";
import BlockchainActivity from "@/components/dashboard/BlockchainActivity";
import PermissionControl from "@/components/dashboard/PermissionControl";

interface PatientOverviewTabProps {
  blockchainEvents: BlockchainEvent[];
  providers: Provider[];
  onProviderUpdate: (providers: any) => void;
}

export default function PatientOverviewTab({ 
  blockchainEvents, 
  providers,
  onProviderUpdate
}: PatientOverviewTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Patient Dashboard</h2>
      <p className="text-muted-foreground">
        Welcome back! View your medical records and manage access permissions securely on the blockchain.
      </p>
      
      <div className="grid gap-6">
        <MedicalRecordsManager />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BlockchainActivity events={blockchainEvents as any} />
          <PermissionControl 
            providers={providers as any} 
            onPermissionsUpdate={onProviderUpdate} 
          />
        </div>
      </div>
    </div>
  );
}
