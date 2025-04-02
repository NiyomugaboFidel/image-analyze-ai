'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useChat } from '../context/ChatContext';
const RecentChatsComponent = () => {
  const { recentChats, selectChat, clearMessages } = useChat();

  const handleNewChat = () => {
    clearMessages();
  };

  return (
    <div className="w-full h-full">
      <Card className="rounded-xl shadow-lg flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-lg text-black font-semibold">Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <Button className="border w-full" onClick={handleNewChat}>New Analysis</Button>
        </CardContent>
        <CardContent className="flex-1 overflow-y-auto space-y-2">
          {recentChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className="flex items-center gap-3 p-2 rounded-lg shadow hover:bg-gray-100 transition-all cursor-pointer"
            >
              <MessageCircle className="h-5 w-5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{chat.title}</span>
                <span className="text-xs text-gray-400">{chat.timestamp}</span>
                <span className="text-xs text-gray-500 truncate">{chat.preview}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentChatsComponent;
