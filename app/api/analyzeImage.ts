import axios from "axios";
import imageCompression from "browser-image-compression";

export type SupportedImageType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export interface AnalyzeOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  timeoutMs?: number;
}

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
}

// Updated type definition to properly handle inlineData
type MessagePart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

type GeminiResponse = { 
  candidates: { 
    content: { 
      parts: MessagePart[] 
    }
  }[] 
};

// Track the current context
interface AnalysisContext {
  originalDescription: string;
  originalImage: string; // Base64 encoded image
  imageType: string;
  conversation: { role: 'user' | 'model', content: string }[];
}

// Define a type for the conversation history entries
interface ConversationEntry {
  role: 'user' | 'model';
  parts: MessagePart[];
}

// Global context store (in a real app, you might use a proper state management solution)
let currentContext: AnalysisContext | null = null;

const validateImage = (file: File): void => {
  const validTypes: SupportedImageType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type as SupportedImageType)) {
    throw new Error(`Invalid file type. Supported types: ${validTypes.join(', ')}`);
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`File too large. Maximum size: 10MB`);
  }
};

const compressImage = async (file: File, options: CompressionOptions): Promise<File> => {
  const compressionOptions = {
    maxSizeMB: options.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight,
    useWebWorker: true,
  };
  try {
    return await imageCompression(file, compressionOptions);
  } catch (error) {
    console.error("Compression error:", error);
    return file;
  }
};

const getApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyBkIAgT8SBMwpitI-rOM-jrBLnCn2KTxf8";
  if (!apiKey) {
    throw new Error("Gemini API key not configured. Set NEXT_PUBLIC_GEMINI_API_KEY in .env");
  }
  return apiKey;
};

const extractTextFromResponse = (data: GeminiResponse): string => {
  const textPart = data.candidates[0].content.parts.find(part => part.text);
  return textPart?.text || "No description generated";
};

export const formatResponse = (description: string): string => {
  return `${description}`;
};

export const analyzeImageWithGemini = async (file: File, options: AnalyzeOptions = {}): Promise<string> => {
  const { maxSizeMB = 1, maxWidthOrHeight = 1920, timeoutMs = 30000 } = options;
  try {
    validateImage(file);
    const compressedFile = await compressImage(file, { maxSizeMB, maxWidthOrHeight });
    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result?.toString() || '';
          const base64Image = base64Data.split(",")[1];
          if (!base64Image) throw new Error("Failed to convert image to base64");
          
          const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
          const apiKey = getApiKey();
          
          const prompt = `
          **VICK AI**
            
          **Overall Impression:**
          [Brief summary of what the image represents]
          
          **Key Elements:**
          
          **Objects:**
            *[List all objects present with a short description]
          
          **Colors:**
            *[Describe the dominant and secondary colors]
          
          **Background:**
            *[Describe the background, including gradients, patterns, or plain colors]
          
          **Textures:**
            *[Mention any textures present, such as smooth, rough, glossy, etc.]
          
          **Visible Actions/Functionality:**
           *[Describe what is happening in the image, any user interactions or movement]
          
          **In Summary:**
          [A concise conclusion summarizing the overall image]
          
          VICK AI`;
          
          const response = await axios.post<GeminiResponse>(
            `${apiUrl}?key=${apiKey}`,
            {
              contents: [
                {
                  parts: [
                    { text: prompt },
                    { inlineData: { mimeType: file.type, data: base64Image } },
                  ],
                },
              ],
            },
            { timeout: timeoutMs }
          );
          
          const description = extractTextFromResponse(response.data);
          
          // Store the context for follow-up questions
          currentContext = {
            originalDescription: description,
            originalImage: base64Image,
            imageType: file.type,
            conversation: [
              { role: 'model', content: description }
            ]
          };
          
          resolve(formatResponse(description));
        } catch (error) {
          reject("Failed to analyze image. Try again later.");
        }
      };
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Unexpected error");
  }
};

// New function to handle follow-up questions
export const askFollowUpQuestion = async (question: string, options: AnalyzeOptions = {}): Promise<string> => {
  const { timeoutMs = 30000 } = options;
  
  if (!currentContext) {
    throw new Error("No image has been analyzed yet. Please analyze an image first.");
  }
  
  try {
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const apiKey = getApiKey();
    
    // Add the user question to the conversation history
    currentContext.conversation.push({ role: 'user', content: question });
    
    const prompt = `
    You are a helpful AI assistant that can analyze images.
    The user has already seen the initial description of the image.
    Now they are asking for additional details or clarification.
    
    User's follow-up question: ${question}
    
    Please provide a detailed and accurate response based on what you can see in the image.
    Focus specifically on addressing the user's question.
    `;
    
    // Correctly structured API payload
    const apiPayload = {
      contents: [
        {
          parts: [
            { text: prompt },
            { 
              inlineData: { 
                mimeType: currentContext.imageType, 
                data: currentContext.originalImage 
              } 
            },
          ],
        },
      ]
    };
    
    const response = await axios.post<GeminiResponse>(
      `${apiUrl}?key=${apiKey}`,
      apiPayload,
      { timeout: timeoutMs }
    );
    
    const followUpResponse = extractTextFromResponse(response.data);
    
    // Add model response to conversation history
    currentContext.conversation.push({ role: 'model', content: followUpResponse });
    
    return formatResponse(followUpResponse);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to process follow-up question");
  }
};

export const resetAnalysisContext = (): void => {
  currentContext = null;
};

export const getConversationHistory = (): { role: 'user' | 'model', content: string }[] => {
  return currentContext?.conversation || [];
};