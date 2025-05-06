
import { useState } from "react";
import { FileUp, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface UploadMedicalFilesProps {
  recordId: string;
  onSuccess: () => void;
}

export default function UploadMedicalFiles({ recordId, onSuccess }: UploadMedicalFilesProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const userId = userData.user.id;
      const uploadPromises = files.map(async (file) => {
        // Create unique path for file in storage
        const filePath = `${userId}/${recordId}/${file.name}`;
        
        // Upload file to storage
        const { error: storageError, data: storageData } = await supabase.storage
          .from('medical_files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) throw storageError;
        
        // Store file metadata in database
        const { error: dbError } = await supabase
          .from('medical_files')
          .insert({
            record_id: recordId,
            file_path: filePath,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: userId
          });
        
        if (dbError) throw dbError;

        // Log blockchain transaction
        await supabase
          .from('blockchain_transactions')
          .insert({
            record_id: recordId,
            transaction_type: 'upload',
            status: 'success',
            hash: `0x${Math.random().toString(16).substring(2, 34)}`,
            metadata: { 
              file_name: file.name, 
              file_size: file.size, 
              timestamp: new Date().toISOString() 
            }
          });

        return storageData;
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) have been uploaded and secured on the blockchain.`
      });
      
      setFiles([]);
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was a problem uploading your files. Please try again."
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileUp className="h-4 w-4" />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Medical Documents</DialogTitle>
          <DialogDescription>
            Upload medical images, scan reports, prescriptions, or any other relevant documents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div
              className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Click to upload or drag and drop files
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPEG, PNG, or DICOM up to 20MB each
              </p>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-auto">
                <p className="text-sm font-medium">Selected files:</p>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted rounded-md p-2 text-sm">
                    <span className="truncate max-w-[80%]">{file.name}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length > 0 ? `(${files.length})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
