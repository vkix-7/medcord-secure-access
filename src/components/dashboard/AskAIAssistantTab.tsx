
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Send, User, MessageSquare } from "lucide-react";

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

// Sample responses based on keywords
const getAIResponse = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  if (lowerCaseMessage.includes("appointment") || lowerCaseMessage.includes("schedule")) {
    return "Your next appointment is scheduled with Dr. Johnson on May 15th at 10:00 AM. Would you like me to help you reschedule or make a new appointment?";
  } 
  else if (lowerCaseMessage.includes("medication") || lowerCaseMessage.includes("medicine")) {
    return "I can see you currently have prescriptions for: Lisinopril (10mg, daily) and Metformin (500mg, twice daily). Your Lisinopril prescription needs renewal in 2 weeks. Would you like more information about either of these medications?";
  }
  else if (lowerCaseMessage.includes("blood pressure") || lowerCaseMessage.includes("bp")) {
    return "Your last recorded blood pressure reading was 122/78 mmHg on April 28th, 2025. This is within the normal range. Your doctor recommends continuing your current medication and lifestyle changes.";
  }
  else if (lowerCaseMessage.includes("test") || lowerCaseMessage.includes("lab") || lowerCaseMessage.includes("result")) {
    return "Your recent lab work from May 1st, 2025 shows normal cholesterol levels and blood sugar within target range. Your doctor noted this is an improvement from your previous results and recommends maintaining your current treatment plan.";
  }
  else if (lowerCaseMessage.includes("thanks") || lowerCaseMessage.includes("thank you")) {
    return "You're welcome! Is there anything else I can help you with today?";
  }
  else {
    return "I understand you're asking about your health information. To better assist you, could you provide more specific details about what you'd like to know? I can help with your appointments, medications, recent test results, or general health questions.";
  }
};

export default function AskAIAssistantTab() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking and typing
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: getAIResponse(input),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] px-4 py-2 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">Health Assistant is typing...</span>
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
