
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  userType?: "patient" | "provider";
}

export default function AuthGuard({ children, userType }: AuthGuardProps) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  // Debug information
  useEffect(() => {
    console.log("AuthGuard rendered:", { user, profile, isLoading, userType });
  }, [user, profile, isLoading, userType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-medblue-600" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but preserve the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If userType is specified, check if the user has the required type
  if (userType && profile && profile.user_type !== userType) {
    const redirectPath = profile.user_type === "patient" 
      ? "/patient-dashboard" 
      : "/provider-dashboard";
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
