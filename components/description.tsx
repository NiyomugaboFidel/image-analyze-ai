"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from '@/lib/utils'

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
const Description: React.FC<DescriptionProps> = ({ description }) => {
  if (!description) return null


  
  const DescriptionComponent = ({ description }: { description: string }) => {
    return <div dangerouslySetInnerHTML={{ __html: formatDescription(description) }} />;
  };
  

  
  return (
    <Card className={cn(
      "bg-accent border-muted-foreground/20 shadow-md",
    )}>
      <CardContent className="p-4 text-foreground">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-primary text-xs font-semibold">AI</span>
          </div>
          <div>
           <DescriptionComponent description={description} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Description