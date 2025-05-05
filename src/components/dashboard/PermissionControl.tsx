
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { Database, Shield, Clock } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  type: string;
  status: "active" | "pending" | "revoked";
}

interface PermissionControlProps {
  providers: Provider[];
  onPermissionsUpdate?: (providers: Provider[]) => void;
}

export default function PermissionControl({ 
  providers, 
  onPermissionsUpdate 
}: PermissionControlProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    providers.reduce((acc, provider) => {
      acc[provider.id] = provider.status === "active";
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleTogglePermission = (providerId: string) => {
    setPermissions((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };
  
  const handleSavePermissions = () => {
    setIsUpdating(true);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      setIsUpdating(false);
      
      // Update provider statuses based on permissions
      const updatedProviders = providers.map(provider => ({
        ...provider,
        status: permissions[provider.id] ? "active" as const : "revoked" as const
      }));
      
      if (onPermissionsUpdate) {
        onPermissionsUpdate(updatedProviders);
      }
      
      toast.success("Permissions updated successfully");
    }, 2000);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-medblue-600" />
          <CardTitle>Access Control</CardTitle>
        </div>
        <CardDescription>
          Manage who can access your medical records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {providers.map((provider) => (
            <div 
              key={provider.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id={`permission-${provider.id}`}
                  checked={permissions[provider.id]}
                  onCheckedChange={() => handleTogglePermission(provider.id)}
                />
                <div>
                  <Label
                    htmlFor={`permission-${provider.id}`}
                    className="font-medium"
                  >
                    {provider.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {provider.type}
                  </p>
                </div>
              </div>
              <div>
                {provider.status === "pending" ? (
                  <span className="med-tag med-tag-yellow flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </span>
                ) : provider.status === "active" ? (
                  <span className="med-tag med-tag-green">Active</span>
                ) : (
                  <span className="med-tag med-tag-red">Revoked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSavePermissions} 
          className="w-full"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4 animate-pulse" />
              Updating Blockchain...
            </span>
          ) : (
            "Save Permissions"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
