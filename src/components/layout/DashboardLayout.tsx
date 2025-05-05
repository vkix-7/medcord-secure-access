
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  userType: "patient" | "provider";
  userName: string;
  activeTab?: string;
  tabs?: {
    id: string;
    label: string;
    content: ReactNode;
  }[];
}

export default function DashboardLayout({
  children,
  userType,
  userName,
  activeTab = "overview",
  tabs = [],
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header userType={userType} userName={userName} />
      
      <div className="flex-1 container py-6">
        <div className="grid gap-6 md:grid-cols-[1fr] lg:grid-cols-[1fr]">
          <main className="flex flex-col gap-6">
            {tabs.length > 0 ? (
              <Tabs defaultValue={activeTab} className="w-full">
                <div className="flex items-center">
                  <TabsList className="w-full md:w-auto h-auto p-0 bg-transparent gap-4 mb-4">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary",
                          "rounded-none px-0 py-2 font-normal transition-colors"
                        )}
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="pt-2">
                    <ScrollArea className="h-full">
                      {tab.content}
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
