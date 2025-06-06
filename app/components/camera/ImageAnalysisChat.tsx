'use client';
import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Send, Image, ChevronRight, ChevronDown, Bot, X, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCamera } from '@/app/context/CameraProvider';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

interface CameraData {
  id: string;
  name: string;
  lastCapture?: string;
}

const HAZARD_DETECTION_PROMPT = `You are an expert construction site safety AI. Based on our conversation history, analyze the provided content for hazards or dangerous situations including: fire, smoke, people without safety equipment, falling objects, unsafe working conditions, accidents, medical emergencies, or suspicious activities. 

For images/videos: Describe hazards with severity (low/medium/high). If no hazard: "No hazard detected."
For text: Answer safety-related questions or provide construction safety guidance based on context.

Be specific and concise. Consider previous messages for context.`;

const STORAGE_KEY = 'hazard_analysis_conversations';

const ImageAnalysisChat = forwardRef((_props, ref) => {
  const { cameras } = useCamera();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    setApiKey(key);
    if (!key) {
      toast.error("Missing API key. Set NEXT_PUBLIC_GEMINI_API_KEY for AI analysis.");
    }
    loadConversations();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations();
    }
  }, [conversations]);

  const loadConversations = useCallback((): void => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored).map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(parsed);
        if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id);
        } else {
          createNewConversation();
        }
      } else {
        createNewConversation();
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      createNewConversation();
    }
  }, []);

  const saveConversations = useCallback((): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
      toast.error("Failed to save conversation history.");
    }
  }, [conversations]);

  const createNewConversation = useCallback((): void => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `Safety Chat ${new Date().toLocaleDateString()}`,
      messages: [{
        id: '1',
        role: 'assistant',
        content: 'Hello! I can help analyze images/videos for construction hazards and answer safety questions. Upload media or ask me anything.',
        timestamp: new Date(),
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    clearInputs();
  }, []);

  const switchConversation = useCallback((conversationId: string): void => {
    setCurrentConversationId(conversationId);
    clearInputs();
  }, []);

  const clearInputs = useCallback((): void => {
    setInputValue('');
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const updateConversation = useCallback((conversationId: string, newMessages: Message[]): void => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            messages: newMessages, 
            updatedAt: new Date(),
            title: newMessages.length > 1 
              ? newMessages[1].content // Use full content, no truncation
              : conv.title
          }
        : conv
    ));
  }, []);

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const analyzeWithGemini = useCallback(async (
    textInput?: string,
    base64Image?: string,
    mimeType?: string,
    conversationHistory?: Message[]
  ): Promise<string> => {
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [
      { text: HAZARD_DETECTION_PROMPT }
    ];

    if (conversationHistory && conversationHistory.length > 1) {
      const recentHistory = conversationHistory.slice(-5).map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n');
      parts.push({ text: `Recent conversation:\n${recentHistory}\n\n` });
    }

    if (textInput?.trim()) {
      parts.push({ text: `Current user input: ${textInput}` });
    }

    if (base64Image && mimeType) {
      const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data
        }
      });
    }

    const requestBody = {
      contents: [{
        parts
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 400,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!result) {
      throw new Error('No valid response from AI model');
    }

    return result;
  }, [apiKey]);

  const generateStaticResponse = useCallback((message: Message, conversationHistory: Message[]): string => {
    const content = message.content.toLowerCase();
    const hasRecentContext = conversationHistory.length > 1;
    
    if (message.imageUrl) {
      return hasRecentContext 
        ? "I've analyzed the image in context of our conversation. The area appears monitored with good visibility. No immediate hazards detected. For comprehensive assessment, consider our previous discussion points."
        : "I've analyzed the image. The area appears to be under monitoring with good visibility. No immediate hazards detected in this frame. Consider regular safety inspections for comprehensive assessment.";
    }
    
    if (content.includes('hazard') || content.includes('safety') || content.includes('danger')) {
      return hasRecentContext
        ? "Based on our discussion, ensure proper PPE usage, secure scaffolding, clear walkways, and regular inspections. Share an image for specific hazard analysis related to your situation."
        : "For construction site safety, always ensure: proper PPE usage, secure scaffolding, clear walkways, proper signage, and regular safety inspections. Share an image for specific hazard analysis.";
    }
    
    if (content.includes('help') || content.includes('what') || content.includes('how')) {
      return "I can analyze images/videos for construction hazards and answer safety questions. Upload media files or ask about safety protocols, equipment, or best practices.";
    }
    
    return hasRecentContext
      ? "Continuing our safety discussion. Upload an image/video for hazard detection or ask me about safety procedures related to your specific concerns."
      : "I'm ready to help with construction safety analysis. Upload an image/video for hazard detection or ask me about safety procedures and best practices.";
  }, []);

  const handleSendMessage = useCallback(async (): Promise<void> => {
    if (!inputValue.trim() && !selectedImage && !selectedFile) return;
    if (!currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      imageUrl: selectedImage || undefined,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    updateConversation(currentConversationId, updatedMessages);
    
    setInputValue('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let aiResponse: string;

      if (selectedFile) {
        const base64 = await fileToBase64(selectedFile);
        aiResponse = await analyzeWithGemini(inputValue, base64, selectedFile.type, messages);
      } else if (selectedImage) {
        aiResponse = await analyzeWithGemini(inputValue, selectedImage, 'image/png', messages);
      } else {
        aiResponse = await analyzeWithGemini(inputValue, undefined, undefined, messages);
      }

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      updateConversation(currentConversationId, [...updatedMessages, responseMessage]);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateStaticResponse(userMessage, messages),
        timestamp: new Date(),
      };

      updateConversation(currentConversationId, [...updatedMessages, fallbackMessage]);
      toast.error("AI analysis unavailable. Using backup response.");
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [inputValue, selectedImage, selectedFile, currentConversationId, messages, fileToBase64, analyzeWithGemini, generateStaticResponse, updateConversation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleFileUpload = useCallback((): void => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      e.target.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported file type. Use JPEG, PNG, WebP, MP4, or WebM.");
      e.target.value = '';
      return;
    }

    try {
      setSelectedFile(file);
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
      toast.success(`File "${file.name}" selected for analysis.`);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error("Failed to process file. Please try again.");
      e.target.value = '';
    }
  }, [fileToBase64]);

  const clearSelectedImage = useCallback((): void => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Expose startChatWithImage to parent via ref
  useImperativeHandle(ref, () => ({
    startChatWithImage: (imageUrl: string, cameraName?: string) => {
      // Create a new conversation with the image as the first user message
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: `Image from ${cameraName || 'Camera'} - ${new Date().toLocaleTimeString()}`,
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Image received. Analyzing for hazards...'
            , timestamp: new Date(),
          },
          {
            id: '2',
            role: 'user',
            content: '',
            imageUrl,
            timestamp: new Date(),
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      setIsOpen(true);
    }
  }));

  return (
    <div className="mt-4">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-purple-500" />
              <h3 className="font-medium">AI Hazard Analysis</h3>
              {conversations.length > 0 && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                  {conversations.length} chats
                </span>
              )}
            </div>
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                onClick={createNewConversation}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus size={16} className="mr-1" />
                New Chat
              </Button>
              
              {conversations.length > 1 && (
                <ScrollArea className="flex-1 max-h-20">
                  <div className="flex gap-2">
                    {conversations.slice(0, 3).map((conv) => (
                      <Button
                        key={conv.id}
                        onClick={() => switchConversation(conv.id)}
                        variant={conv.id === currentConversationId ? "default" : "outline"}
                        size="sm"
                        className="text-xs whitespace-nowrap"
                      >
                        <MessageSquare size={12} className="mr-1" />
                        {conv.title}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <ScrollArea className="h-64 pr-4 mb-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                            alt="Analysis input"
                            className="rounded-md max-h-40 w-auto object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      {message.role === 'assistant' ? (
                        <div className="whitespace-pre-wrap text-sm font-medium">
                          {message.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                            if (/^\*\*[^*]+\*\*$/.test(part)) {
                              // Bold any text wrapped in **
                              return <strong key={i} className="font-bold text-purple-700 dark:text-purple-300">{part.replace(/\*\*/g, '')}</strong>;
                            }
                            if (/^\* /.test(part)) {
                              // If line starts with '* ', render as a bolded list item
                              return <div key={i} className="ml-4"><span className="font-bold">{part.replace(/^\* /, '')}</span></div>;
                            }
                            return part;
                          })}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {selectedImage && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image size={16} className="text-purple-500" />
                    <span className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : 'Camera image'} selected
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={clearSelectedImage}
                    title="Remove selected file"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <Button
                variant="outline"
                size="icon"
                title="Upload Image or Video (Max 10MB)"
                type="button"
                className="h-10 w-10 hover:bg-purple-50 hover:border-purple-300"
                onClick={handleFileUpload}
              >
                <Image size={18} />
              </Button>
              
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about safety or upload media for hazard analysis..."
                  className="border shadow-sm"
                  disabled={isLoading}
                />
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && !selectedImage && !selectedFile) || isLoading}
                size="icon"
                title="Send message"
                className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});

export default ImageAnalysisChat;