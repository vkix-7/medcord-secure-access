
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
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"patient" | "provider">("patient");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      // Mock authentication logic
      if (formData.email && formData.password) {
        toast.success("Login successful!");
        
        // Redirect based on user type
        if (userType === "patient") {
          navigate("/patient-dashboard");
        } else {
          navigate("/provider-dashboard");
        }
      } else {
        toast.error("Please fill in all fields");
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-medblue-100">
          <Lock className="h-6 w-6 text-medblue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userType">I am a:</Label>
            <RadioGroup
              id="userType"
              value={userType}
              onValueChange={(value) => setUserType(value as "patient" | "provider")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="patient" id="patient" />
                <Label htmlFor="patient">Patient</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="provider" id="provider" />
                <Label htmlFor="provider">Healthcare Provider</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              required
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-medblue-500 hover:text-medblue-600">
                Forgot your password?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              required
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-medblue-600 hover:bg-medblue-700" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-medblue-500 hover:text-medblue-600 font-medium">
              Register
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
