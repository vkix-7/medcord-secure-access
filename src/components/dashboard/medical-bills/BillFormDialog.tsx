
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import BillFormContent from "./BillFormContent";

interface BillFormDialogProps {
  recordId?: string;
  onSuccess: () => void;
}

export default function BillFormDialog({ recordId, onSuccess }: BillFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<Array<{ id: string; title: string }>>([]);
  
  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Receipt className="h-4 w-4" />
          Add Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Medical Bill</DialogTitle>
          <DialogDescription>
            Enter details of your medical bill. This will be securely stored and tracked.
          </DialogDescription>
        </DialogHeader>
        <BillFormContent 
          recordId={recordId} 
          onSuccess={() => {
            setOpen(false);
            onSuccess();
          }} 
          records={records}
          setRecords={setRecords}
        />
      </DialogContent>
    </Dialog>
  );
}
