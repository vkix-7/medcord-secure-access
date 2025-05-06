import { Bell, Gift, Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar"; // only if SidebarTrigger is actually exported

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

interface DashboardHeaderProps {
  userName?: string;
  setActiveTab?: (tab: string) => void;
}

export default function DashboardHeader({ userName = "User", setActiveTab }: DashboardHeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme');
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return (savedTheme as 'light' | 'dark') || (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    // Update the theme in localStorage and document
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="flex h-16 items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground hidden md:block">
            Welcome to your dashboard
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <Gift className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">New features</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getUserInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium">Hello, {userName}</p>
                <p className="text-xs text-muted-foreground">
                  Patient Account
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab?.("profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab?.("settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
