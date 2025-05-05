
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Hospital, User, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  userType?: "patient" | "provider" | null;
  userName?: string;
}

export default function Header({ userType, userName }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const isLoggedIn = !!user;
  
  const getUserInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Use profile data if available, otherwise fall back to props
  const displayName = profile?.full_name || userName || "";
  const displayUserType = profile?.user_type || userType;
  
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Hospital className="h-6 w-6 text-medblue-600" />
            <span className="font-bold text-xl text-medblue-600">MedCord</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:block">
                {displayUserType === "patient" ? "Patient Portal" : "Provider Portal"}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={displayName} />
                      <AvatarFallback className="bg-medblue-100 text-medblue-800">
                        {getUserInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {displayUserType === "patient" ? "Patient" : "Healthcare Provider"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
