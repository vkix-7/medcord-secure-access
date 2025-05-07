
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Send, User, MessageSquare, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi there! I'm your health assistant. I can help answer questions about your medical records, medications, or general health topics. How can I assist you today?",
    sender: "ai",
    timestamp: new Date(),
  },
];

export default function AskAIAssistantTab() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Prepare user context from profile data if available
      const userContext = profile ? {
        name: profile.full_name,
        age: profile.age || null,
        conditions: profile.conditions || [],
        medications: profile.medications || [],
        allergies: profile.allergies || [],
      } : null;

      // Call our Edge Function with the user's message and context
      const { data, error } = await supabase.functions.invoke('gemini-health-assistant', {
        body: { 
          message: input,
          userContext
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to get response from AI assistant");
      }

      // Add AI response to chat
      const aiResponse: Message = {
        id: messages.length + 2,
        text: data?.response || "I'm sorry, I couldn't process your request at this time.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add fallback message on error
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I'm sorry, I'm having trouble responding right now. Please try again later or contact support if the issue persists.",
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get AI response");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Ask AI Assistant</h2>
        <p className="text-muted-foreground">
          Get help understanding your medical information or ask general health questions
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            <div className="flex flex-col h-[500px]">
              <ScrollArea className="flex-1 p-4 h-[calc(500px-70px)]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.sender === "user" ? "You" : "Health Assistant"} •{" "}
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-line">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] px-4 py-2 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">Health Assistant is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t p-4 bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your health question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping}
                  />
                  <Button onClick={handleSendMessage} disabled={isTyping}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
