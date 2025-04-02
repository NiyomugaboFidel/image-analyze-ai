'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Mic, Camera, Send, Loader2 } from "lucide-react";
import { analyzeImageWithGemini, askFollowUpQuestion } from '../api/analyzeImage';
import { Message } from '../types/types';
import { useChat } from '../context/ChatContext';




interface DescriptionProps {
  description: string
}

export const formatDescription = (description: string) => {
  return description
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
     .replace(/\*\*/g, '') 
      .replace(/"\b(.*?)\b"/g, '$1') 
      .replace(/\* /g, '') 
      .replace(/\n/g, '<br>');
};
  
  const DescriptionComponent = ({ description }: { description: string }) => {
    return <div dangerouslySetInnerHTML={{ __html: formatDescription(description) }} />;
  };
  

const ChatComponent = () => {
  const { messages, addMessage, addToRecentChats } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      // Display the image in chat
      const imageMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: 'Image upload',
        timestamp: new Date(),
        imageData: reader.result as string
      };
      
      addMessage(imageMessage);
      
      // Start analysis
      analyzeImage(file);
    };
    
    reader.readAsDataURL(file);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      // Get analysis from Gemini
      const analysis = await analyzeImageWithGemini(file);
      
      // Add system message with analysis
      const analysisMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: analysis,
        timestamp: new Date()
      };
      
      addMessage(analysisMessage);
      
      // Save to chat history
      addToRecentChats(`Image Analysis ${new Date().toLocaleTimeString()}`, analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: error instanceof Error ? error.message : "Failed to analyze image. Please try again.",
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    
    // Clear input
    setInputMessage('');
    
    // Process follow-up question
    try {
      setIsAnalyzing(true);
      const response = await askFollowUpQuestion(inputMessage);
      
      // Add system response
      const responseMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: response,
        timestamp: new Date()
      };
      
      addMessage(responseMessage);
    } catch (error) {
      console.error("Follow-up error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: error instanceof Error ? error.message : "Failed to process your question. Please try again.",
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Capture or upload an image to start analyzing
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-3/4 p-3 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                {message.imageData && (
                  <div className="mb-2">
                    <img
                      src={message.imageData}
                      alt="Captured"
                      className="max-w-full max-h-64 rounded"
                    />
                  </div>
                )}
                <div className="whitespace-pre-wrap">
                  <DescriptionComponent description={message.content} />
                  </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t p-4">
        <Card className="shadow rounded-xl">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about the image or type a follow-up question..."
                className="flex-1 bg-transparent border-none text-gray-700 text-md resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 bg-transparent hover:bg-gray-200"
                onClick={handleCaptureClick}
              >
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleImageCapture}
                  capture="environment"
                />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 bg-transparent hover:bg-gray-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 ml-auto bg-transparent hover:bg-gray-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="6" r="2" fill="currentColor"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  <circle cx="12" cy="18" r="2" fill="currentColor"/>
                </svg>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 ml-1 bg-slate-100 hover:bg-slate-200"
              >
                <Mic className="h-4 w-4 text-black" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 ml-1 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleSendMessage}
                disabled={isAnalyzing || !inputMessage.trim()}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatComponent;