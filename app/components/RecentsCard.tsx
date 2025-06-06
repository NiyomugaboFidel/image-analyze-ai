'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useChat } from '../context/ChatContext';
import { useCamera } from '../context/CameraProvider';

const RecentChatsComponent = () => {
  const { recentChats, selectChat, clearMessages } = useChat();
  const { cameras } = useCamera();

  // Load recent chats from localStorage (hazard_analysis_conversations)
  const [localRecent, setLocalRecent] = React.useState<any[]>([]);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('hazard_analysis_conversations');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Map the full conversation data including messages
        setLocalRecent(parsed.map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          messages: conv.messages || [], // Include the full messages array
          preview: conv.messages?.[conv.messages.length-1]?.content || '',
          timestamp: conv.updatedAt ? new Date(conv.updatedAt).toLocaleString() : '',
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt
        })));
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
      setLocalRecent([]);
    }
  }, []);

  // Load connected cameras from localStorage (cameraConfigs)
  const [localCameras, setLocalCameras] = React.useState<any[]>([]);
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('cameraConfigs');
      if (stored) {
        setLocalCameras(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading camera configs:', e);
      setLocalCameras([]);
    }
  }, []);

  const handleNewChat = () => {
    clearMessages();
  };

  const handleSelectLocalChat = (chatId: string) => {
    // Find the selected chat and load it into the current chat context
    const selectedChat = localRecent.find(chat => chat.id === chatId);
    if (selectedChat && selectChat) {
      // You might need to adapt this based on your selectChat implementation
      selectChat(chatId);
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="rounded-xl shadow-lg flex flex-col h-full bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg text-black dark:text-gray-100 font-semibold">Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <Button 
            className="border w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800" 
            onClick={handleNewChat}
          >
            New Analysis
          </Button>
        </CardContent>
        <CardContent className="flex-1 overflow-y-auto space-y-2">
          {/* Show recent chats from localStorage */}
          {localRecent.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Recent Local Chats</div>
              {localRecent.map((chat) => (
                <div 
                  key={chat.id} 
                  className="flex flex-col mb-4 p-3 border rounded-lg shadow bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleSelectLocalChat(chat.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 truncate max-w-xs" title={chat.title}>
                      {chat.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <svg className="h-3 w-3 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 2a1 1 0 00-1 1v1H5a3 3 0 00-3 3v7a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3h-.01V3a1 1 0 00-1-1H6zm0 2h8v1H6V4zm-1 3h10a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1zm5 2a1 1 0 10-2 0v2a1 1 0 002 0v-2z"/>
                    </svg>
                    <span className="text-xs text-gray-400 dark:text-gray-400">{chat.timestamp}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({chat.messages?.length || 0} messages)
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-300 mb-2 italic truncate" title={chat.preview}>
                    {chat.preview}
                  </span>
                  
                  {/* Display all messages in this chat */}
                  {chat.messages && chat.messages.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Messages:</div>
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {chat.messages.map((msg: any, idx: number) => (
                          <div key={msg.id || idx} className={`p-2 rounded-lg ${msg.role === 'assistant' ? 'bg-gradient-to-r from-purple-50 to-gray-100 dark:from-purple-900 dark:to-gray-800 border-l-4 border-purple-400 dark:border-purple-600' : 'bg-gray-50 dark:bg-gray-800 border-l-4 border-blue-200 dark:border-blue-400'}`}> 
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold ${msg.role === 'user' ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'}`}>{msg.role === 'user' ? 'User' : 'AI'}</span>
                              {msg.timestamp && (
                                <span className="text-xs text-gray-400 dark:text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                              )}
                            </div>
                            {msg.imageUrl && (
                              <div className="mb-2">
                                <img src={msg.imageUrl} alt="Message attachment" className="rounded max-h-24 max-w-full object-cover border" />
                              </div>
                            )}
                            {msg.role === 'assistant' ? (
                              <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-medium">
                                {msg.content.split(/(\*\*[^*]+\*\*)/g).map((part: string, i: number) => {
                                  if (/^\*\*[^*]+\*\*$/.test(part)) {
                                    // Bold any text wrapped in **
                                    return <strong key={i} className="font-bold text-purple-700 dark:text-purple-300">{part.replace(/\*\*/g, '')}</strong>;
                                  }
                                  if (/^\* /.test(part)) {
                                    // If line starts with '* ', render as a list item
                                    return <li key={i} className="ml-4 list-disc">{part.replace(/^\* /, '')}</li>;
                                  }
                                  return part;
                                })}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                {msg.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Show connected cameras from localStorage */}
          {localCameras.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Connected Cameras</div>
              {localCameras.map((cam) => (
                <div key={cam.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <span className="h-5 w-5 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-200 font-bold text-xs">
                    {cam.name?.[0] || '?'}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{cam.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-400">{cam.deviceId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show current session's recent chats as fallback */}
          {recentChats.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Current Session Chats</div>
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className="flex items-center gap-3 p-2 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer bg-white dark:bg-gray-900 border"
                >
                  <MessageCircle className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 truncate" title={chat.title}>
                      {chat.title}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg className="h-3 w-3 text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a1 1 0 00-1 1v1H5a3 3 0 00-3 3v7a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3h-.01V3a1 1 0 00-1-1H6zm0 2h8v1H6V4zm-1 3h10a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1zm5 2a1 1 0 10-2 0v2a1 1 0 002 0v-2z"/>
                      </svg>
                      <span className="text-xs text-gray-400 dark:text-gray-400">{chat.timestamp}</span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 italic truncate" title={chat.preview}>
                      {chat.preview}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show empty state if no chats */}
          {localRecent.length === 0 && recentChats.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent conversations</p>
              <p className="text-xs">Start a new analysis to begin</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentChatsComponent;