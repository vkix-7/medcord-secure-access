
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  cleanupAuthState, 
  generateAndSendOTP, 
  fetchUserProfile, 
  verifyOTPAndSignIn, 
  resetPassword 
} from "@/utils/authUtils";
import { AuthContextProps, UserProfile, UserSignUpData } from "@/hooks/useAuthTypes";

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === "SIGNED_OUT") {
          setProfile(null);
        } else if (event === "SIGNED_IN" && currentSession?.user) {
          // Fetch user profile after small timeout to prevent deadlocks
          setTimeout(() => {
            loadUserProfile(currentSession.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        loadUserProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profileData = await fetchUserProfile(userId);
      setProfile(profileData as UserProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, userType: "patient" | "provider" | "admin" = "patient", sendOTP: boolean = false) => {
    try {
      setIsLoading(true);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try to sign out globally first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Global sign out failed, continuing:", err);
      }
      
      if (sendOTP) {
        // Generate and send OTP
        await generateAndSendOTP(email);
        
        // Store user type and password temporarily in local storage
        localStorage.setItem('medcord_temp_user_type', userType);
        localStorage.setItem('medcord_temp_password', password);
        
        toast.success("OTP sent to your email");
        return;
      } else {
        // Standard sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          // Fetch the user profile
          await loadUserProfile(data.user.id);
          
          // Get user type and redirect accordingly
          const { data: profileData } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", data.user.id)
            .single();
            
          toast.success("Logged in successfully");
          
          if (profileData?.user_type === "patient") {
            navigate("/patient-dashboard");
          } else if (profileData?.user_type === "provider") {
            navigate("/provider-dashboard");
          } else {
            navigate("/admin-dashboard");
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const password = localStorage.getItem('medcord_temp_password') || '';
      const userType = localStorage.getItem('medcord_temp_user_type') || 'patient';
      
      console.log("Verifying OTP:", email, otp);
      
      const success = await verifyOTPAndSignIn(email, otp, password);
      
      if (success) {
        // Clean up temp storage
        localStorage.removeItem('medcord_temp_password');
        localStorage.removeItem('medcord_temp_user_type');
        
        // Redirect based on user type
        if (userType === "patient") {
          navigate("/patient-dashboard");
        } else if (userType === "provider") {
          navigate("/provider-dashboard");
        } else {
          navigate("/admin-dashboard");
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error in verifyOTP:", error);
      toast.error(error.message || "Failed to verify OTP");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendOTP = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await generateAndSendOTP(email);
      toast.success("A new OTP has been sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: UserSignUpData) => {
    try {
      setIsLoading(true);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            user_type: userData.user_type,
          },
        },
      });

      if (error) throw error;
      
      toast.success("Account created successfully! Please check your email to verify your account.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const result = await resetPassword(email);
      if (result) {
        toast.success("Password reset instructions sent to your email");
      }
      return result;
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload for clean state
      window.location.href = '/login';
      
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        verifyOTP,
        resendOTP,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
