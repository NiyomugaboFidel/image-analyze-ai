export interface Message {
    id: string;
    role: 'user' | 'system';
    content: string;
    timestamp: Date;
    imageData?: string;
  }
  
  export interface ChatHistoryItem {
    id: string;
    title: string;
    timestamp: string;
    preview: string;
  }