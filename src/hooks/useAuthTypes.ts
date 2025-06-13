
import { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
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

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string, userType?: "patient" | "provider" | "admin") => Promise<void>;
  signUp: (email: string, password: string, userData: UserSignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  resendOTP: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
}
