
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string, userType?: "patient" | "provider" | "admin", sendOTP?: boolean) => Promise<void>;
  signUp: (email: string, password: string, userData: UserSignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  resendOTP: (email: string, password: string) => Promise<void>;
}

interface UserProfile {
  id: string;
  user_type: "patient" | "provider" | "admin";
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  age?: number;
  gender?: string;
  medical_history?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  avatar_url?: string;
}

export interface UserSignUpData {
  full_name: string;
  user_type: "patient" | "provider" | "admin";
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Helper function to clean up auth state to prevent authentication limbo
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

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
            fetchUserProfile(currentSession.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        setProfile(null);
      } else {
        console.log("Fetched profile:", data);
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfile(null);
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
        // Request OTP to be sent
        const { data: otpData, error: otpError } = await supabase.rpc('create_otp', {
          p_email: email,
          p_phone_number: null,
          p_user_id: null,
          p_expires_in: '00:10:00'  // 10 minutes expiry
        });
        
        if (otpError) throw otpError;
        console.log("OTP requested successfully, code:", otpData);
        
        // Now call our edge function to send the OTP email
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-otp-email', {
            body: {
              email,
              otpCode: otpData  // The create_otp function returns the generated code
            }
          });

          if (emailError) {
            console.error("Failed to send OTP email:", emailError);
            toast.error("Failed to send OTP email. Please try again.");
            throw new Error(emailError.message || "Failed to send OTP email");
          }

          console.log("OTP email sent successfully:", emailData);
          toast.success("OTP sent to your email");
        } catch (emailSendError) {
          console.error("Error sending OTP email:", emailSendError);
          toast.error("Failed to send OTP email. Please try again.");
          throw emailSendError;
        }
        
        // Store user type temporarily in local storage
        localStorage.setItem('medcord_temp_user_type', userType);
        
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
          await fetchUserProfile(data.user.id);
          
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
      
      // Verify OTP
      const { data, error } = await supabase.rpc('verify_otp', {
        p_email: email,
        p_phone_number: null,
        p_code: otp
      });
      
      if (error) throw error;
      
      if (data === true) {
        // OTP is valid, sign in the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: "dummyPassword" // We'll change this flow in a real implementation
        });
        
        if (signInError) throw signInError;
        
        // Get user type from local storage
        const userType = localStorage.getItem('medcord_temp_user_type') || 'patient';
        localStorage.removeItem('medcord_temp_user_type'); // Clean up
        
        // Update user type in profile if necessary
        if (signInData.user) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ user_type: userType })
            .eq("id", signInData.user.id);
            
          if (updateError) console.error("Failed to update user type:", updateError);
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendOTP = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Request a new OTP
      const { data: otpData, error: otpError } = await supabase.rpc('create_otp', {
        p_email: email,
        p_phone_number: null,
        p_user_id: null,
        p_expires_in: '00:10:00'  // 10 minutes expiry
      });
      
      if (otpError) throw otpError;
      
      // Send the OTP email
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-otp-email', {
          body: {
            email,
            otpCode: otpData  // The create_otp function returns the generated code
          }
        });

        if (emailError) {
          console.error("Failed to send OTP email:", emailError);
          toast.error("Failed to send OTP email. Please try again.");
          throw new Error(emailError.message || "Failed to send OTP email");
        }

        toast.success("OTP email sent successfully");
      } catch (emailSendError) {
        console.error("Error sending OTP email:", emailSendError);
        toast.error("Failed to send OTP email. Please try again.");
        throw emailSendError;
      }
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
