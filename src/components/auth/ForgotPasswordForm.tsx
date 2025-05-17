
import { useState } from "react";
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
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await forgotPassword(email);
        setIsSubmitted(true);
      } catch (error) {
        // Error is handled in AuthContext with toast
      }
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
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        {!isSubmitted ? (
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        ) : (
          <CardDescription className="text-green-600">
            If an account exists for {email}, you'll receive an email with reset instructions shortly.
          </CardDescription>
        )}
      </CardHeader>
      
      {!isSubmitted ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-medblue-600 hover:bg-medblue-700"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={onBack}
            >
              Return to Login
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
