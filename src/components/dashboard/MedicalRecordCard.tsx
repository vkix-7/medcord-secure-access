
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Lock, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MedicalRecordProps {
  id: string;
  title: string;
  provider: string;
  date: string;
  type: string;
  summary?: string;
  content?: string;
  status: "available" | "pending" | "restricted";
  encrypted: boolean;
}

export default function MedicalRecordCard({
  id,
  title,
  provider,
  date,
  type,
  summary,
  content,
  status,
  encrypted,
}: MedicalRecordProps) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  
  const getStatusBadge = () => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "restricted":
        return <Badge className="bg-red-500">Restricted</Badge>;
      default:
        return null;
    }
  };
  
  const handleDecrypt = () => {
    setIsDecrypting(true);
    // Simulate decryption process
    setTimeout(() => {
      setIsDecrypting(false);
      setIsDecrypted(true);
    }, 1500);
  };
  
  return (
    <div className="med-card">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">Provider: {provider}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {encrypted && (
            <Badge variant="outline" className="flex items-center gap-1 border-medblue-200 text-medblue-700">
              <Lock className="h-3 w-3" />
              <span>Encrypted</span>
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-3 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          {date}
        </div>
        <div className="flex items-center text-muted-foreground">
          <FileText className="h-4 w-4 mr-1" />
          {type}
        </div>
      </div>
      
      {summary && (
        <p className="text-sm mb-3 line-clamp-2">{summary}</p>
      )}
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">View Record</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground">Provider: {provider}</span>
                <span>•</span>
                <span className="text-muted-foreground">{date}</span>
                <span>•</span>
                <span className="text-muted-foreground">{type}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {encrypted && !isDecrypted ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium">This record is encrypted</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need to decrypt this record to view its contents
                  </p>
                </div>
                <Button 
                  onClick={handleDecrypt} 
                  className="flex items-center gap-2"
                  disabled={isDecrypting}
                >
                  {isDecrypting ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Decrypting...
                    </>
                  ) : (
                    "Decrypt Record"
                  )}
                </Button>
              </div>
            ) : (
              <div className="border rounded-md p-4 bg-muted/30">
                <p>{content || summary || "Record content not available."}</p>
              </div>
            )}
            
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium mb-2">Record Information</h4>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Record ID:</span>
                <span className="font-mono text-xs">{id}</span>
                <span className="text-muted-foreground">Hash:</span>
                <span className="font-mono text-xs truncate">0x{Math.random().toString(16).substring(2, 32)}</span>
                <span className="text-muted-foreground">Created:</span>
                <span>{date}</span>
                <span className="text-muted-foreground">Last accessed:</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
