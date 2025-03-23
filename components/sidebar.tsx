"use client"

import { FC, useState } from 'react'
import { Plus, MessageCircle, Settings, Github, ChevronDown, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const Sidebar: FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
<div className='w-5 md:w-15'>
<div className={cn(
      "h-full flex flex-col bg-white dark:bg-black fixed z-50 shadow-lg transition-all",
      isExpanded ? "w-64" : "w-5"
    )}>
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-center ">
        <Button
          variant="outline"
          className="w-full justify-start gap-1   "
        >
          <Plus className="h-5 w-5 " />
          {isExpanded && <span>Start New Analysis</span>}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className='w-6 h-6  '
          onClick={() => setIsExpanded(prev => !prev)}
        >
          <ChevronLeft className={cn("h-5 w-5  transition-transform", isExpanded ? "rotate-180" : "rotate-0")} />
        </Button>
      </div>

      {/* Search History */}
      <div className="flex-1  p-2 space-y-3">
        {["Recent", "Last 7 Days", "Older"].map((category, i) => (
          <div key={i} className="pt-3  overflow-hidden first:pt-0">
            <h3 className="text-xs font-semibold  px-2 mb-2 uppercase">
              {category}
            </h3>
            <div className="space-y-1">
              {[1, 2, 3].map((item) => (
                <Button 
                  key={item} 
                  variant="ghost" 
                  className="w-full justify-start px-3 py-2 h-auto font-medium rounded-lg   transition"
                >
                  <MessageCircle className="h-5 w-5 mr-3 shrink-0 text-blue-400" />
                  <span className="truncate">Analysis {item}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t ">
        <div className={` ${isExpanded ? "flex" : "flex-col" } flex items-center gap-3 mb-3`}>
          <Button variant="ghost" size="icon" className="h-9 w-9  ">
            <Settings className="h-5 w-5 " />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9  " asChild>
            <a href="https://github.com/NiyomugaboFidel" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5 " />
            </a>
          </Button>
        </div>
        <Button variant="ghost" className="w-full overflow-hidden justify-start text-sm  font-medium h-auto py-2 rounded-lg ">
          Upgrade to Pro
        </Button>
      </div>
    </div>
</div>
  )
}

export default Sidebar
