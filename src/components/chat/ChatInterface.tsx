
import { useState, useRef, useEffect } from "react";
import { useChat, ChatContact, ChatMessage } from "@/contexts/ChatContext";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  User,
  HelpCircle,
  Clock,
  Check,
  CheckCheck,
  MessageSquare,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function ChatInterface() {
  const { messages, contacts, activeContact, sendMessage, setActiveContact } = useChat();
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Filter messages for the active contact
  const filteredMessages = activeContact
    ? messages.filter(
        (msg) =>
          (msg.senderId === activeContact.id || msg.receiverId === activeContact.id)
      )
    : [];
    
  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Scroll to the bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);
  
  const handleSendMessage = () => {
    if (messageInput.trim() !== "") {
      sendMessage(messageInput);
      setMessageInput("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  
  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const formatMessageTime = (timestamp: Date) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Chat</h2>
        <p className="text-muted-foreground">
          Connect with doctors and helpdesk staff
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[70vh]">
        {/* Contact List */}
        <Card className="md:col-span-1">
          <CardContent className="p-3 h-full flex flex-col">
            <div className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <ScrollArea className="flex-grow pr-3">
              {filteredContacts.length > 0 ? (
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={cn(
                        "p-2 rounded-lg cursor-pointer hover:bg-accent",
                        activeContact?.id === contact.id && "bg-accent"
                      )}
                      onClick={() => setActiveContact(contact)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={contact.avatar} alt={contact.name} />
                            <AvatarFallback className={
                              contact.type === "doctor"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }>
                              {getInitials(contact.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={cn(
                              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                              getStatusColor(contact.status)
                            )}
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <span className="font-medium">{contact.name}</span>
                            {contact.unreadCount > 0 && (
                              <Badge variant="destructive" className="rounded-full px-2">
                                {contact.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {contact.type === "doctor" ? (
                              <>
                                <User className="h-3 w-3" /> Doctor
                              </>
                            ) : (
                              <>
                                <HelpCircle className="h-3 w-3" /> Helpdesk
                              </>
                            )}
                            {contact.status !== "online" && contact.lastActive && (
                              <span className="ml-2 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(contact.lastActive))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No contacts found
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardContent className="p-0 h-full flex flex-col">
            {activeContact ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={activeContact.avatar} alt={activeContact.name} />
                      <AvatarFallback className={
                        activeContact.type === "doctor"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }>
                        {getInitials(activeContact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{activeContact.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full mr-1",
                            getStatusColor(activeContact.status)
                          )}
                        />
                        {activeContact.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice call</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Video className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Video call</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>More options</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                {/* Messages Area */}
                <ScrollArea className="flex-grow p-4">
                  {filteredMessages.length > 0 ? (
                    <div className="space-y-4">
                      {filteredMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.senderType === "patient" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] px-4 py-2 rounded-lg",
                              message.senderType === "patient"
                                ? "bg-primary text-primary-foreground"
                                : message.senderType === "doctor"
                                  ? "bg-blue-100"
                                  : "bg-amber-100"
                            )}
                          >
                            <div className="flex justify-between gap-4 mb-1">
                              <span className="font-medium text-xs">
                                {message.senderType === "patient"
                                  ? "You"
                                  : message.senderName}
                              </span>
                              <span className="text-xs opacity-70 whitespace-nowrap">
                                {formatMessageTime(message.timestamp)}
                              </span>
                            </div>
                            <p>{message.content}</p>
                            {message.senderType === "patient" && (
                              <div className="flex justify-end mt-1">
                                {message.read ? (
                                  <CheckCheck className="h-3 w-3 opacity-70" />
                                ) : (
                                  <Check className="h-3 w-3 opacity-70" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No messages yet. Send a message to start the conversation.
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message Input */}
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      className="flex-grow"
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <div className="bg-muted rounded-full p-6 mx-auto w-fit mb-4">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No conversation selected</h3>
                  <p className="text-muted-foreground">
                    Choose a contact from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
