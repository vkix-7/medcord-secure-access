
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";

interface OTPVerificationFormProps {
  email: string;
  password: string;
  userType: "patient" | "provider" | "admin";
  onBack: () => void;
}

export default function OTPVerificationForm({ email, password, userType, onBack }: OTPVerificationFormProps) {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { verifyOTP, resendOTP, isLoading } = useAuth();

  useEffect(() => {
    // Check if we have an OTP code in sessionStorage (from dev mode)
    const storedOTPData = sessionStorage.getItem(`otp_${email}`);
    if (storedOTPData) {
      try {
        const { code } = JSON.parse(storedOTPData);
        toast.info("DEV MODE: Auto-filling OTP from development mode", {
          description: `OTP: ${code}`,
          duration: 5000,
        });
        setOtp(code);
      } catch (e) {
        console.error("Error parsing stored OTP:", e);
      }
    }
  }, [email]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    try {
      console.log("Submitting OTP for verification:", otp);
      const success = await verifyOTP(email, otp);
      
      console.log("OTP verification result:", success);
      
      if (!success) {
        toast.error("Invalid OTP or OTP has expired. Please try again.");
      }
      // Redirect is handled in the verifyOTP function in AuthContext
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Failed to verify OTP");
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await resendOTP(email, password);
      setCountdown(60);
      toast.success("A new OTP has been sent to your email");

      // Check if we're in development mode and show the OTP
      setTimeout(() => {
        const storedOTPData = sessionStorage.getItem(`otp_${email}`);
        if (storedOTPData) {
          try {
            const { code } = JSON.parse(storedOTPData);
            toast.info("DEV MODE: New OTP generated", {
              description: `OTP: ${code}`,
              duration: 5000,
            });
            setOtp(code);
          } catch (e) {
            console.error("Error parsing stored OTP:", e);
          }
        }
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="w-fit -ml-2 mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
        <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center py-4">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="text-sm text-center text-muted-foreground">
          Didn't receive the code? Make sure to check your spam folder.
        </div>
        {process.env.NODE_ENV !== 'production' && (
          <div className="text-sm text-center bg-yellow-50 p-2 rounded-md text-amber-600 border border-amber-200">
            Development Mode: OTP is shown in console and auto-filled when available
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          onClick={handleVerify} 
          className="w-full bg-medblue-600 hover:bg-medblue-700"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify & Log In"
          )}
        </Button>
        <div className="flex justify-center items-center w-full text-sm">
          <Button 
            variant="link" 
            onClick={handleResendOTP}
            disabled={countdown > 0 || isResending}
            size="sm"
            className="p-0 flex items-center"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Resending...
              </>
            ) : countdown > 0 ? (
              `Resend OTP in ${countdown}s`
            ) : (
              <>
                <RefreshCw className="mr-1 h-3 w-3" />
                Resend OTP
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
