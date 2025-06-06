'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChatHistoryItem, Message } from '../types/types';
import { toast } from 'sonner';

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  recentChats: ChatHistoryItem[];
  addToRecentChats: (title: string, preview: string) => void;
  selectChat: (chatId: string) => void;
  selectedChatId: string | null;
  deleteChat: (chatId: string) => void;
  updateChatTitle: (chatId: string, newTitle: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// For local storage keys
const STORAGE_KEYS = {
  MESSAGES: 'chat-messages',
  RECENT_CHATS: 'recent-chats',
  SELECTED_CHAT: 'selected-chat-id'
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [recentChats, setRecentChats] = useState<ChatHistoryItem[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const storedRecentChats = localStorage.getItem(STORAGE_KEYS.RECENT_CHATS);
      const storedSelectedChatId = localStorage.getItem(STORAGE_KEYS.SELECTED_CHAT);
      
      if (storedMessages) setMessages(JSON.parse(storedMessages));
      if (storedRecentChats) setRecentChats(JSON.parse(storedRecentChats));
      if (storedSelectedChatId) setSelectedChatId(storedSelectedChatId);
    } catch (error) {
      console.error('Error loading chat data from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      localStorage.setItem(STORAGE_KEYS.RECENT_CHATS, JSON.stringify(recentChats));
      if (selectedChatId) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_CHAT, selectedChatId);
      }
    } catch (error) {
      console.error('Error saving chat data to localStorage:', error);
    }
  }, [messages, recentChats, selectedChatId]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const addToRecentChats = (title: string, preview: string) => {
    const newChat: ChatHistoryItem = {
      id: Date.now().toString(),
      title,
      timestamp: new Date().toISOString(),
      preview: preview.substring(0, 50) + (preview.length > 50 ? "..." : "")
    };
    
    setRecentChats(prev => [newChat, ...prev.slice(0, 9)]);
    setSelectedChatId(newChat.id);
    return newChat.id;
  };

  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    
    // In a real app with backend, you'd fetch messages here
    // For now, we'll simulate loading chat history from localStorage
    try {
      const chatStorageKey = `chat-${chatId}-messages`;
      const storedChatMessages = localStorage.getItem(chatStorageKey);
      
      if (storedChatMessages) {
        setMessages(JSON.parse(storedChatMessages));
      } else {
        clearMessages();
        addMessage({
          id: Date.now().toString(),
          role: 'system',
          content: `Started new chat session with ID: ${chatId}`,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast.error('Failed to load chat messages. Please try again.');
      clearMessages();
    }
  };

  const deleteChat = (chatId: string) => {
    setRecentChats(prev => prev.filter(chat => chat.id !== chatId));
    
    // If the deleted chat was selected, clear selection
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
      clearMessages();
    }
    
    // Clean up associated messages in localStorage
    try {
      localStorage.removeItem(`chat-${chatId}-messages`);
    } catch (error) {
      console.error('Error removing chat data:', error);
    }
  };

  const updateChatTitle = (chatId: string, newTitle: string) => {
    setRecentChats(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  };

  // Format timestamps for display
  const getFormattedChats = () => {
    return recentChats.map(chat => {
      // Convert ISO timestamp to relative time (e.g., "5 min ago")
      const timestamp = new Date(chat.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - timestamp.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      let formattedTime;
      if (diffMins < 1) {
        formattedTime = "Just now";
      } else if (diffMins < 60) {
        formattedTime = `${diffMins} min ago`;
      } else if (diffMins < 1440) {
        formattedTime = `${Math.floor(diffMins / 60)} hr ago`;
      } else {
        formattedTime = `${Math.floor(diffMins / 1440)} days ago`;
      }
      
      return {
        ...chat,
        displayTimestamp: formattedTime
      };
    });
  };

  const value = {
    messages,
    addMessage,
    clearMessages,
    recentChats: getFormattedChats(),
    addToRecentChats,
    selectChat,
    selectedChatId,
    deleteChat,
    updateChatTitle
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    toast.error('useChat must be used within a ChatProvider');
    throw new Error('useChat must be used within a ChatProvider');
  
  }
  return context;
};