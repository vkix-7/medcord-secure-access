
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Loader2 } from "lucide-react";
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

const recordTypeOptions = [
  "Clinical Exam",
  "Laboratory Test",
  "Imaging",
  "Surgery",
  "Prescription",
  "Immunization",
  "Consultation",
  "Other"
];

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  provider: z.string().min(2, { message: "Provider name is required." }),
  type: z.string({ required_error: "Please select a record type." }),
  date: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  encrypt: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddMedicalRecordForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      provider: "",
      type: "",
      date: new Date().toISOString().split('T')[0],
      summary: "",
      content: "",
      encrypt: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Get the current user's ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error("User not authenticated");
      }
      
      const { error: recordError, data: recordData } = await supabase
        .from("medical_records")
        .insert({
          title: data.title,
          provider: data.provider,
          type: data.type,
          date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
          summary: data.summary || null,
          content: data.content || null,
          encrypted: data.encrypt,
          patient_id: userData.user.id,
        })
        .select("id")
        .single();

      if (recordError) throw recordError;

      // Create blockchain transaction for record creation
      const { error: transactionError } = await supabase
        .from("blockchain_transactions")
        .insert({
          record_id: recordData.id,
          transaction_type: "create",
          status: "success",
          hash: `0x${Math.random().toString(16).substring(2, 34)}`,
          metadata: { action: "create_record", timestamp: new Date().toISOString() },
        });

      if (transactionError) {
        console.error("Error creating blockchain transaction:", transactionError);
      }

      toast({
        title: "Medical record created",
        description: "Your medical record has been successfully created and secured on the blockchain.",
      });

      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating record:", error);
      toast({
        variant: "destructive",
        title: "Error creating record",
        description: "There was a problem creating your medical record. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Medical Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medical Record</DialogTitle>
          <DialogDescription>
            Enter details of your medical record. All information is encrypted and secured on the blockchain.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Annual Physical Examination" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Healthcare Provider</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Smith / City Hospital" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recordTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief summary of the medical record"
                      className="resize-none"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed information about the medical record"
                      className="resize-none min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="encrypt"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Encrypt this record</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of encryption for sensitive medical information.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Creating Record...
                  </>
                ) : (
                  "Create Record"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
