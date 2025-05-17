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
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import OTPVerificationForm from "./OTPVerificationForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { toast } from "sonner";

export default function LoginForm() {
  const navigate = useNavigate();
  const { signIn, isLoading } = useAuth();
  const [userType, setUserType] = useState<"patient" | "provider" | "admin">("patient");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      // Request OTP to be sent to the user's email
      await signIn(formData.email, formData.password, userType, true);
      setOtpSent(true);
      setLoginAttempts(0); // Reset attempts on successful OTP send
      toast.success("OTP sent to your email");
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoginAttempts(prev => prev + 1);
      
      // More user-friendly error message
      if (loginAttempts >= 2) {
        toast.error("Having trouble? Check that your email and password are correct, or use the 'Forgot password' option below.");
      } else {
        toast.error(error.message || "Login failed. Please check your credentials.");
      }
    }
  };

  const handleDirectLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      // Direct login without OTP
      await signIn(formData.email, formData.password, userType, false);
      toast.success("Logged in successfully");
      // No need to navigate here - AuthContext will handle it
    } catch (error: any) {
      console.error("Direct login failed:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm 
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  if (otpSent) {
    return (
      <OTPVerificationForm 
        email={formData.email} 
        password={formData.password}
        userType={userType} 
        onBack={() => setOtpSent(false)}
      />
    );
  }

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
              onValueChange={(value) => setUserType(value as "patient" | "provider" | "admin")}
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
                <Label htmlFor="admin">Admin</Label>
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
              <Button 
                type="button" 
                variant="link" 
                className="p-0 h-auto text-xs text-medblue-500 hover:text-medblue-600"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </Button>
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
          <div className="w-full flex gap-2">
            <Button 
              type="submit" 
              className="flex-1 bg-medblue-600 hover:bg-medblue-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Get OTP"
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={handleDirectLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Login Directly"
              )}
            </Button>
          </div>
          
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
