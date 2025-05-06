
import { BlockchainEvent, Provider } from "@/hooks/usePatientData";
import BlockchainActivity from "@/components/dashboard/BlockchainActivity";
import PermissionControl from "@/components/dashboard/PermissionControl";

interface AccessControlTabProps {
  blockchainEvents: BlockchainEvent[];
  providers: Provider[];
  onProviderUpdate: (providers: any) => void;
}

export default function AccessControlTab({
  blockchainEvents,
  providers,
  onProviderUpdate
}: AccessControlTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Manage Access Permissions</h2>
      <p className="text-muted-foreground">
        Control who can access your medical records through blockchain-based smart contracts.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PermissionControl 
          providers={providers as any} 
          onPermissionsUpdate={onProviderUpdate} 
        />
        
        <BlockchainActivity events={blockchainEvents as any} />
      </div>
    </div>
  );
}
