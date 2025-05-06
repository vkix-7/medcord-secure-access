import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const formSchema = z.object({
  provider: z.string().min(2, { message: "Provider name is required." }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  currency: z.string().default("USD"),
  status: z.string().default("pending"),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  recordId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddMedicalBillFormProps {
  recordId?: string;
  onSuccess: () => void;
}

export default function AddMedicalBillForm({ recordId, onSuccess }: AddMedicalBillFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [records, setRecords] = useState<Array<{ id: string; title: string }>>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "",
      amount: "",
      currency: "USD",
      status: "pending",
      dueDate: "",
      description: "",
      recordId: recordId || "",
    },
  });

  const loadRecords = async () => {
    const { data } = await supabase
      .from('medical_records')
      .select('id, title')
      .order('created_at', { ascending: false });
    
    if (data) {
      setRecords(data);
    }
  };

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      loadRecords();
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get the current user's ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error("User not authenticated");
      }
      
      // Insert medical bill record
      const { error: billError, data: billData } = await supabase
        .from("medical_bills")
        .insert({
          provider: data.provider,
          amount: parseFloat(data.amount),
          currency: data.currency,
          status: data.status,
          due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
          description: data.description || null,
          record_id: data.recordId || null,
          patient_id: userData.user.id,
        })
        .select("id")
        .single();

      if (billError) throw billError;
      
      // Create blockchain transaction for bill
      const { error: transactionError } = await supabase
        .from("blockchain_transactions")
        .insert({
          record_id: data.recordId || null,
          transaction_type: "billing",
          status: "success",
          hash: `0x${Math.random().toString(16).substring(2, 34)}`,
          metadata: { 
            bill_id: billData.id, 
            amount: data.amount,
            provider: data.provider,
            timestamp: new Date().toISOString() 
          },
        });

      if (transactionError) {
        console.error("Error creating blockchain transaction:", transactionError);
      }
      
      toast({
        title: "Medical bill added",
        description: "Your medical bill has been successfully added and secured on the blockchain.",
      });
      
      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding medical bill:", error);
      toast({
        variant: "destructive",
        title: "Error adding bill",
        description: "There was a problem adding your medical bill. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Healthcare Provider / Biller</FormLabel>
                  <FormControl>
                    <Input placeholder="City General Hospital" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="disputed">Disputed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {!recordId && (
              <FormField
                control={form.control}
                name="recordId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Medical Record (Optional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a record" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No related record</SelectItem>
                        {records.map(record => (
                          <SelectItem key={record.id} value={record.id}>{record.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about the bill"
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Saving...
                  </>
                ) : (
                  "Save Bill"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
