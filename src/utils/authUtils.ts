
import { supabase } from "@/integrations/supabase/client";

// Helper function to clean up auth state to prevent authentication limbo
export const cleanupAuthState = () => {
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
  // Clean up any temporary OTP storage
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('otp_')) {
      sessionStorage.removeItem(key);
    }
  });
  // Clean up temporary login storage
  localStorage.removeItem('medcord_temp_user_type');
  localStorage.removeItem('medcord_temp_password');
};

// Password reset functionality
export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error("Error sending password reset:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};

// Profile fetching logic
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log("Fetching profile for user:", userId);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    } else {
      console.log("Fetched profile:", data);
      return data;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
