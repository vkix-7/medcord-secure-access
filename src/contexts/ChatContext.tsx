
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'patient' | 'doctor' | 'helpdesk';
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  type: 'doctor' | 'helpdesk';
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastActive?: Date;
  unreadCount: number;
}

interface ChatContextType {
  messages: ChatMessage[];
  contacts: ChatContact[];
  activeContact: ChatContact | null;
  sendMessage: (content: string) => void;
  setActiveContact: (contact: ChatContact) => void;
  markAsRead: (messageIds: string[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Mock data for initial development
const mockContacts: ChatContact[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    type: 'doctor',
    status: 'online',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    type: 'doctor',
    status: 'offline',
    lastActive: new Date(Date.now() - 3600000),
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'MedCord Helpdesk',
    type: 'helpdesk',
    status: 'online',
    unreadCount: 1,
  }
];

const generateMockMessages = (userId: string): ChatMessage[] => {
  // Generate some mock messages with the contacts
  return [
    {
      id: '101',
      senderId: '1', // Dr. Sarah Johnson
      senderName: 'Dr. Sarah Johnson',
      senderType: 'doctor',
      receiverId: userId,
      content: "Hello, how are you feeling today? I see you've been taking the new medication for a week now.",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: true,
    },
    {
      id: '102',
      senderId: userId,
      senderName: 'You',
      senderType: 'patient',
      receiverId: '1',
      content: "I'm feeling much better, thank you! The headaches have decreased significantly.",
      timestamp: new Date(Date.now() - 82800000), // 23 hours ago
      read: true,
    },
    {
      id: '103',
      senderId: '1', 
      senderName: 'Dr. Sarah Johnson',
      senderType: 'doctor',
      receiverId: userId,
      content: "That's great news! Any side effects you've noticed?",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false,
    },
    {
      id: '104',
      senderId: '3', // Helpdesk
      senderName: 'MedCord Helpdesk',
      senderType: 'helpdesk',
      receiverId: userId,
      content: "Your appointment has been confirmed for next Monday at 2:00 PM with Dr. Johnson.",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      read: false,
    },
  ];
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>(mockContacts);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);

  useEffect(() => {
    if (user) {
      // In a real app, fetch messages from Supabase here
      setMessages(generateMockMessages(user.id));
    }
  }, [user]);

  const sendMessage = (content: string) => {
    if (!activeContact || !user || !content.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: 'You',
      senderType: 'patient',
      receiverId: activeContact.id,
      content: content,
      timestamp: new Date(),
      read: true,
    };

    setMessages(prev => [...prev, newMessage]);
    
    // In a real app, save the message to Supabase here
    
    // Mock response for demo purposes
    if (activeContact.type === 'helpdesk') {
      setTimeout(() => {
        const helpDeskReply: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          senderId: activeContact.id,
          senderName: activeContact.name,
          senderType: 'helpdesk',
          receiverId: user.id,
          content: "Thank you for your message. A support agent will respond shortly.",
          timestamp: new Date(),
          read: false,
        };
        setMessages(prev => [...prev, helpDeskReply]);
      }, 1000);
    }
  };

  const handleSetActiveContact = (contact: ChatContact) => {
    setActiveContact(contact);
    
    // Mark messages from this contact as read
    if (user) {
      const unreadMessageIds = messages
        .filter(m => m.senderId === contact.id && m.receiverId === user.id && !m.read)
        .map(m => m.id);
      
      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
      
      // Update unread count for this contact
      setContacts(prev => 
        prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c)
      );
    }
  };

  const markAsRead = (messageIds: string[]) => {
    setMessages(prev => 
      prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, read: true } : msg
      )
    );
    
    // In a real app, update the read status in Supabase here
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        contacts,
        activeContact,
        sendMessage,
        setActiveContact: handleSetActiveContact,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
