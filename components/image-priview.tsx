"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"

interface ImagePreviewProps {
  imageUrl: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  if (!imageUrl) return null

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative w-full">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="w-full h-auto object-contain max-h-96"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default ImagePreview