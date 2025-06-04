'use client';
import React, { useState, useRef } from 'react';
import { Send, Image, ChevronRight, ChevronDown, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCamera } from '@/app/context/CameraProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

const ImageAnalysisChat: React.FC = () => {
  const { cameras } = useCamera();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you analyze the images captured from your cameras. Send me a message or share an image to get started.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      imageUrl: selectedImage || undefined,
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAnalysisResponse(userMessage),
      };
      setMessages((prev) => [...prev, responseMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAnalysisResponse = (message: Message): string => {
    // In a real app, this would call an AI API
    // This is a placeholder implementation
    if (message.imageUrl) {
      return "I've analyzed the image. It appears to show a monitored area in good lighting conditions. No unusual activity detected. The image quality is good for security monitoring purposes.";
    } else if (message.content.toLowerCase().includes('detect')) {
      return "To enable detection, I'd need to analyze the images from your cameras. You can share a captured image using the 'Share Image' button.";
    } else if (message.content.toLowerCase().includes('help')) {
      return "I can help you analyze camera images for security monitoring. Just share an image from your captures, and I'll provide insights about what's visible in the frame.";
    } else {
      return "I'm here to help analyze your camera feeds and captures. If you'd like me to examine an image, please share it using the 'Share Image' button.";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const availableImages = cameras
    .filter((camera:any) => camera.lastCapture)
    .map((camera:any) => ({
      id: camera.id,
      name: camera.name,
      imageUrl: camera.lastCapture,
    }));

  return (
    <div className="mt-4">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-purple-500" />
              <h3 className="font-medium">AI Analysis Assistant</h3>
            </div>
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4">
            <ScrollArea className="h-64 pr-4 mb-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-purple-100 dark:bg-purple-900 text-gray-800 dark:text-gray-100'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {message.imageUrl && (
                        <div className="mb-2">
                          <img
                            src={message.imageUrl}
                            alt="Shared capture"
                            className="rounded-md max-h-40 w-auto"
                          />
                        </div>
                      )}
                      <p>{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {selectedImage && (
              <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image size={16} />
                    <span className="text-sm">Image selected</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setSelectedImage(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {availableImages.length > 0 && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    title="Share Image"
                    type="button"
                    className="h-10 w-10"
                  >
                    <Image size={18} />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your camera captures..."
                  className="border shadow-sm"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && !selectedImage}
                size="icon"
                title="Send message"
                className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ImageAnalysisChat;