"use client"

import { FC } from 'react'
import { Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

const ChatHeader: FC = () => {
  return (
    <header className="border-b">
      <div className="flex h-14 items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-semibold">Image Analysis</h1>
        </div>
        
        <div className="hidden md:block">
          <h1 className="text-sm font-semibold">Image Analysis</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Upgrade</span>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

export default ChatHeader