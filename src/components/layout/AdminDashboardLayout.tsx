import { ReactNode } from "react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { 
  LayoutDashboard, 
  
  Users, 
  Calendar, 
  PlusCircle,
  
  Settings,
 
  ShoppingCart,
  MessageSquare,
  HelpCircle,
  ClipboardList
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminDashboardLayoutProps {
  children: ReactNode;
  userName?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: "overview", title: "Dashboard", icon: LayoutDashboard },
 
  
  { id: "appointments", title: "All Appointments", icon: Calendar },
  { id: "records", title: "Medical Records", icon: ClipboardList },
  { id: "permissions", title: "Access Control", icon: Settings },
  { id: "share", title: "Share Data", icon: Users },
  
  { id: "shop", title: "Shop", icon: ShoppingCart },
  { id: "medicine", title: "Add Medicine", icon: PlusCircle },
  { id: "chat", title: "Chat", icon: MessageSquare },
  { id: "ai-assistant", title: "Ask AI", icon: HelpCircle }
];

export default function AdminDashboardLayout({
  children,
  userName = "User",
  activeTab,
  setActiveTab
}: AdminDashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-border/50 p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary p-1 text-primary-foreground">
                <ClipboardList size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold">MedCord</h1>
                <p className="text-xs text-muted-foreground">Health Records System</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        isActive={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-auto">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-2">Check your schedule</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    View your upcoming appointments and tasks
                  </p>
                  <Button size="sm" className="w-full" onClick={() => setActiveTab("appointments")}>View Schedule</Button>
                </CardContent>
              </Card>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset>
          <div className="flex flex-col h-full">
            <DashboardHeader userName={userName} setActiveTab={setActiveTab} />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
