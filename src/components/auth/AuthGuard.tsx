
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  userType: "patient" | "provider" | "any";
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

  // If userType is "any", allow access regardless of profile type
  if (userType === "any") {
    return <>{children}</>;
  }

  // Otherwise check if the user has the correct type
  if (profile?.user_type !== userType) {
    // Redirect to the appropriate dashboard based on user type
    if (profile?.user_type === "patient") {
      return <Navigate to="/patient-dashboard" replace />;
    } else if (profile?.user_type === "provider") {
      return <Navigate to="/provider-dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
