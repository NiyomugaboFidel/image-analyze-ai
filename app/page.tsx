"use client"

import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import { AlertCircle } from "lucide-react"

import ImageUploader from '@/components/image-uploader'
import ImagePreview from '@/components/image-priview'
import Description, { formatDescription } from '@/components/description'
import Loader from '@/components/loader'
import { analyzeImageWithGemini, askFollowUpQuestion, resetAnalysisContext } from './api/analyzeImage'
import { Input } from '@/components/ui/input'

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [question, setQuestion] = useState<string>('')
  const [followUpResponses, setFollowUpResponses] = useState<Array<{question: string, answer: string}>>([])
  const [isFollowUpMode, setIsFollowUpMode] = useState<boolean>(false)

  const handleImageSelected = async (file: File) => {
    setImageUrl(URL.createObjectURL(file))
    setDescription('')
    setError('')
    setLoading(true)
    setFollowUpResponses([])
    setIsFollowUpMode(false)
  
    try {
      // Reset any previous context
      resetAnalysisContext();
      
      const description = await analyzeImageWithGemini(file);
      setDescription(description);
      setIsFollowUpMode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const answer = await askFollowUpQuestion(question);
      setFollowUpResponses(prev => [...prev, {question, answer}]);
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process your question');
    } finally {
      setLoading(false);
    }
  }
  
  const handleReset = () => {
    setImageUrl('');
    setDescription('');
    setError('');
    setQuestion('');
    setFollowUpResponses([]);
    setIsFollowUpMode(false);
    resetAnalysisContext();
  }

  function formatResponse(text: string) {
    return text
        .replace(/\*\*/g, '') // Remove bold markers
        .replace(/"\b(.*?)\b"/g, '$1') // Remove quotes around text
        .replace(/\* /g, '') // Remove leading stars in lists
        .replace(/\n/g, '<br>'); // Convert new lines to HTML line breaks
}
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* <Sidebar /> */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* <ChatHeader /> */}
        <main className="flex-1 overflow-auto py-4 w-full">
          <div className="max-w-3xl mx-auto px-4 space-y-6">
            {(!imageUrl && !description) && (
              <div className="flex flex-col items-center justify-center py-20">
                <h1 className="text-3xl font-semibold mb-4">VICKY AI</h1>
        
                <ImageUploader onImageSelected={handleImageSelected} />
              </div>
            )}

            {imageUrl && (
              <>
                <div className="flex items-center justify-between">
                  <ImageUploader onImageSelected={handleImageSelected} />
                  {/* <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="ml-2"
                  >
                    Reset
                  </Button> */}
                </div>
                
                {loading && <Loader />}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <ImagePreview imageUrl={imageUrl} />
                <Description description={description} />
                
                {isFollowUpMode && description && (
                  <div className="mt-8 border rounded-lg p-4">
                    <h2 className="text-xl font-medium mb-4">Ask for more details</h2>
                    <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                      <Input
                        placeholder="Ask a question about this image..."
                        value={question}
                        onChange={(e:any) => setQuestion(e.target.value)}
                        disabled={loading}
                        className="flex-1"
                      />
                      <Button className='border bg-[#000] text-white' type="submit" disabled={loading || !question.trim()}>
                        Ask
                      </Button>
                    </form>
                    
                    {followUpResponses.length > 0 && (
                      <div className="mt-6 space-y-4">
                        {followUpResponses.map((item, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <div className="font-medium text-primary">Q: {item.question}</div>
                            <div className="mt-2" dangerouslySetInnerHTML={{ __html: formatDescription(item.answer) }} />
                             <div  />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}