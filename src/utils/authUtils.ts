
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
};

// Handle OTP email sending through edge function
export const sendOTPEmail = async (email: string, otpCode: string): Promise<boolean> => {
  try {
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-otp-email', {
      body: {
        email,
        otpCode
      }
    });

    if (emailError) {
      console.error("Failed to send OTP email:", emailError);
      throw new Error(emailError.message || "Failed to send OTP email");
    }

    console.log("OTP email function response:", emailData);
    
    return true;
  } catch (emailSendError) {
    console.error("Error sending OTP email:", emailSendError);
    throw emailSendError;
  }
};

// Generate and send OTP
export const generateAndSendOTP = async (email: string): Promise<string | null> => {
  try {
    // Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP code:", otpCode);
    
    // Store the OTP in session storage for later verification
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // 10-minute expiry
    
    sessionStorage.setItem(`otp_${email}`, JSON.stringify({
      code: otpCode,
      expires: expiryTime.getTime()
    }));
    
    // Send the OTP email
    await sendOTPEmail(email, otpCode);
    
    return otpCode;
  } catch (error) {
    console.error("Error generating OTP:", error);
    throw error;
  }
};

// Verify OTP and sign in user
export const verifyOTPAndSignIn = async (email: string, otp: string, password: string): Promise<boolean> => {
  try {
    console.log("Verifying OTP:", email, otp);
    
    // Get stored OTP data
    const storedOTPData = sessionStorage.getItem(`otp_${email}`);
    if (!storedOTPData) {
      console.error("No OTP found for this email");
      return false;
    }
    
    const { code, expires } = JSON.parse(storedOTPData);
    const now = new Date().getTime();
    
    // Check if OTP is expired
    if (now > expires) {
      console.error("OTP has expired");
      sessionStorage.removeItem(`otp_${email}`);
      return false;
    }
    
    // Check if OTP matches
    if (code !== otp) {
      console.error("OTP does not match");
      return false;
    }
    
    console.log("OTP verified successfully, proceeding with signin");
    
    // Clean up the used OTP
    sessionStorage.removeItem(`otp_${email}`);
    
    // OTP is valid, sign in the user using the stored password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.error("Sign in error after OTP verification:", signInError);
      throw signInError;
    }
    
    console.log("Signed in after OTP verification:", signInData);
    return true;
  } catch (error) {
    console.error("Error in verifyOTPAndSignIn:", error);
    throw error;
  }
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
