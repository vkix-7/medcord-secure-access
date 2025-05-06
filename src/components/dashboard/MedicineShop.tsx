import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  doctorName: z.string().min(2, { message: "Doctor's name is required." }),
  prescriptionFile: z.any().refine((file) => file?.size > 0, {
    message: "Prescription file is required.",
  }),
  patientDetails: z.string().min(10, {
    message: "Please provide relevant patient details.",
  }),
  deliveryAddress: z.string().min(10, {
    message: "Please provide a valid delivery address.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function MedicineShop() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorName: "",
      patientDetails: "",
      deliveryAddress: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("prescriptionFile", file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPrescription = () => {
    form.setValue("prescriptionFile", null);
    setPrescriptionPreview(null);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Get the current user's ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Upload prescription file
      const fileExt = data.prescriptionFile.name.split('.').pop();
      const fileName = `${userData.user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, data.prescriptionFile);

      if (uploadError) throw uploadError;

      // Create order record
      const { error: orderError } = await supabase
        .from("medical_records")
        .insert({
          patient_id: userData.user.id,
          title: "Medicine Order",
          provider: data.doctorName,
          type: "Prescription",
          content: data.patientDetails,
          summary: data.deliveryAddress,
          status: "pending",
          encrypted: false,
        });

      if (orderError) throw orderError;

      toast({
        title: "Order placed successfully",
        description: "Your medicine order has been received and is being processed.",
      });

      form.reset();
      setPrescriptionPreview(null);
      setOpen(false);
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        variant: "destructive",
        title: "Error placing order",
        description: "There was a problem processing your order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Medicine Shop</h2>
        <p className="text-muted-foreground">
          Order your prescribed medicines securely with prescription verification.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Upload Prescription</CardTitle>
            <CardDescription>
              Start by uploading your valid prescription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Prescription
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                  <DialogTitle>Place Medicine Order</DialogTitle>
                  <DialogDescription>
                    Upload your prescription and provide necessary details to place your order.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="prescriptionFile"
                        render={({ field: { value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Prescription File</FormLabel>
                            <FormControl>
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-full">
                                  <Input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                    {...field}
                                  />
                                </div>
                                {prescriptionPreview && (
                                  <div className="relative w-full max-w-md mx-auto">
                                    <img
                                      src={prescriptionPreview}
                                      alt="Prescription preview"
                                      className="w-full h-auto rounded-lg border border-border object-contain max-h-[300px]"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-2 right-2 h-8 w-8"
                                      onClick={clearPrescription}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="doctorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Doctor's Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Dr. John Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="patientDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Patient Details</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter relevant medical history, allergies, or special instructions"
                                  className="resize-none min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your complete delivery address"
                                className="resize-none min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="sticky bottom-0 bg-background pt-4 border-t">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Valid prescription required</span>
            </div>
            <p>Upload a clear image or PDF of your prescription</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 