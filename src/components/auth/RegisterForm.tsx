
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  userType: z.enum(["patient", "provider", "admin"]),
  licenseNumber: z.string().optional(),
  adminCode: z.string().optional(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
.refine(
  data => {
    if (data.userType === "provider" && (!data.licenseNumber || data.licenseNumber.length < 3)) {
      return false;
    }
    return true;
  },
  {
    message: "License number is required for providers",
    path: ["licenseNumber"],
  }
)
.refine(
  data => {
    if (data.userType === "admin" && (!data.adminCode || data.adminCode !== "MEDCORD2025")) {
      return false;
    }
    return true;
  },
  {
    message: "Valid admin code is required for admin registration",
    path: ["adminCode"],
  }
);

export default function RegisterForm() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "patient",
      licenseNumber: "",
      adminCode: "",
    },
  });
  
  const userType = form.watch("userType");

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      await signUp(values.email, values.password, {
        full_name: values.name,
        user_type: values.userType,
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-medblue-100">
          <UserPlus className="h-6 w-6 text-medblue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create your account
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>I am registering as a:</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="patient" id="patient" />
                      <Label htmlFor="patient">Patient</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="provider" id="provider" />
                      <Label htmlFor="provider">Healthcare Provider</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin">Administrator</Label>
                    </div>
                  </RadioGroup>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {userType === "provider" && (
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Medical License Number" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Your license will be verified before account activation
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {userType === "admin" && (
              <FormField
                control={form.control}
                name="adminCode"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Admin Registration Code</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter admin code" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      This code is required for administrator registration
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-medblue-600 hover:bg-medblue-700" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-medblue-500 hover:text-medblue-600 font-medium">
                Sign in
              </a>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
