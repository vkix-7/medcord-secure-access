
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Lock, Clock, Trash2, Edit, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import UploadMedicalFiles from "./UploadMedicalFiles";
import AddMedicalBillForm from "./AddMedicalBillForm";

interface MedicalRecordProps {
  id: string;
  title: string;
  provider: string | null;
  date: string | null;
  type: string;
  summary?: string | null;
  content?: string | null;
  status: "available" | "pending" | "restricted";
  encrypted: boolean | null;
  onDelete?: () => void;
  onUpdate?: () => void;
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
  onDelete,
  onUpdate,
}: MedicalRecordProps) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
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
  
  const handleDialogOpen = async (open: boolean) => {
    if (open) {
      await fetchFiles();
    }
  };
  
  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const { data, error } = await supabase
        .from('medical_files')
        .select('*')
        .eq('record_id', id);
        
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoadingFiles(false);
    }
  };
  
  const handleDeleteRecord = async () => {
    setIsDeleting(true);
    try {
      // Log blockchain transaction first
      const { error: transactionError } = await supabase
        .from('blockchain_transactions')
        .insert({
          record_id: id,
          transaction_type: 'delete',
          status: 'success',
          hash: `0x${Math.random().toString(16).substring(2, 34)}`,
          metadata: { record_title: title, timestamp: new Date().toISOString() }
        });
        
      if (transactionError) throw transactionError;
      
      // Delete record (this will cascade delete files due to foreign key)
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Record deleted",
        description: "Medical record has been permanently deleted.",
      });
      
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        variant: "destructive",
        title: "Error deleting record",
        description: "There was a problem deleting the record. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 bg-card">
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
      
      <div className="flex justify-between items-center">
        <Dialog onOpenChange={handleDialogOpen}>
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
              
              <div>
                <h4 className="text-sm font-medium mb-2">Related Documents</h4>
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">
                      {loadingFiles ? "Loading documents..." : files.length > 0 ? `${files.length} document(s)` : "No documents attached"}
                    </span>
                    <div className="flex gap-2">
                      <UploadMedicalFiles recordId={id} onSuccess={fetchFiles} />
                      <AddMedicalBillForm recordId={id} onSuccess={() => {}} />
                    </div>
                  </div>
                  
                  {loadingFiles ? (
                    <div className="py-4 flex justify-center">
                      <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : files.length > 0 ? (
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div 
                          key={file.id} 
                          className="flex items-center justify-between text-sm p-2 rounded-md bg-background"
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{file.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(file.uploaded_at).toLocaleDateString()} • {(file.file_size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7"
                            onClick={async () => {
                              try {
                                // Generate a signed URL for the file
                                const { data, error } = await supabase.storage
                                  .from('medical_files')
                                  .createSignedUrl(file.file_path, 60);
                                  
                                if (error) throw error;
                                if (data?.signedUrl) {
                                  window.open(data.signedUrl, '_blank');
                                }
                              } catch (err) {
                                console.error("Error viewing file:", err);
                                toast({
                                  variant: "destructive",
                                  title: "Error viewing file",
                                  description: "Unable to access the file. Please try again."
                                });
                              }
                            }}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <p>No documents have been uploaded for this record.</p>
                      <p className="mt-1">Click "Upload Files" to add documents.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Record Information</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Record ID:</span>
                  <span className="font-mono text-xs">{id}</span>
                  <span className="text-muted-foreground">Hash:</span>
                  <span className="font-mono text-xs truncate">0x{id.replace(/-/g, "")}</span>
                  <span className="text-muted-foreground">Created:</span>
                  <span>{date}</span>
                  <span className="text-muted-foreground">Last accessed:</span>
                  <span>Today</span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-1.5">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the medical record
                      and all associated files from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteRecord}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Record</DropdownMenuItem>
            <DropdownMenuItem>Download Encrypted Copy</DropdownMenuItem>
            <DropdownMenuItem>Share Access</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              Request Deletion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
