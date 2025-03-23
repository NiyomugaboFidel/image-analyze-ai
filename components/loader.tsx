"use client"

import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"

interface LoaderProps {
  showProgress?: boolean
}

const Loader: React.FC<LoaderProps> = ({ showProgress = true }) => {
  const [progress, setProgress] = useState(10)

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(30), 300)
    const timer2 = setTimeout(() => setProgress(60), 800)
    const timer3 = setTimeout(() => setProgress(85), 1500)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <Card className="py-4 px-6">
      <div className="flex flex-col items-center justify-center w-full gap-2">
        {showProgress ? (
          <>
            <Progress value={progress} className="w-full max-w-md" />
            <p className="text-sm text-muted-foreground">Analyzing image...</p>
          </>
        ) : (
          <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        )}
      </div>
    </Card>
  )
}

export default Loader

// Missing import
import { Card } from "@/components/ui/card"