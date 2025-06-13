"use client"

import { FC } from 'react'
import { Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

const ChatHeader: FC = () => {
  return (
    <header className="border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <div className="flex h-14 items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden text-gray-500 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <a href="/" className="flex items-center">
          <div className="w-8 h-8 rounded bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
            V
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">Vicky AI</span>
        </a>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700">
            <Sparkles className="h-3.5 w-3.5 text-gray-700 dark:text-gray-200" />
            <span>Upgrade</span>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

export default ChatHeader