// components/Sidebar.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Import icons from Lucide React
import { 
  Home, 
  FileText, 
  Layout, 
  Download, 
  FolderClosed, 
  Hash, 
  Layers, 
  Users, 
  Star, 
  CircleDot, 
  Settings,
  LogOut,
  LayoutDashboard,
  Bell
} from 'lucide-react';
import { User } from '@/app/types';

type NavItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
};

type SidebarProps = {
  className?: string;
  userProfile?: User
};

export function Sidebar({ className, userProfile }: SidebarProps) {
  const pathname = usePathname();

  const mainNavItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/dashboard' },
    { icon: <FileText size={20} />, label: 'Camera Control', href: '/chat' },
    { icon: <Layout size={20} />, label: 'Chart', href: '/chart' },
    { icon: <Bell size={20} />, label: 'Notification', href: '/notification' },
  
  ];

  const categoryNavItems: NavItem[] = [
    { icon: <FolderClosed size={20} />, label: 'Hazards tracked', href: '#' },

  ];

  const otherNavItems: NavItem[] = [
    { icon: <Users size={20} />, label: 'Team', href: '#' },
    { icon: <Star size={20} />, label: 'Favorites', href: '#' },
    { icon: <CircleDot size={20} />, label: 'Updates', href: '#' },
    { icon: <Settings size={20} />, label: 'Settings', href: '#' },
  ];

  return (
    <div className={cn("flex flex-col h-screen border-r w-16 hover:w-64 transition-width duration-300 overflow-hidden group",
      "bg-white dark:bg-gray-900 border-zinc-200 dark:border-gray-700", 
      className)}>
      <div className="p-3 flex items-center justify-center h-16">
      <a href="/" className="flex items-center">
                <div className="w-8 h-8 rounded bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                  V
                </div>
              </a>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 py-4">
          <div className="px-2 py-1">
            <div className="flex flex-col space-y-1">
              {mainNavItems.map((item, index) => (
                <NavItem key={index} item={item} isActive={pathname === item.href} />
              ))}
            </div>
          </div>
          
          <div className="px-2 py-1">
            <h2 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
              Topic trackers
            </h2>
            <div className="flex flex-col space-y-1 mt-2">
              {categoryNavItems.map((item, index) => (
                <NavItem key={index} item={item} isActive={pathname === item.href} />
              ))}
            </div>
          </div>

          <div className="px-2 py-1">
            <div className="flex flex-col space-y-1">
              {otherNavItems.map((item, index) => (
                <NavItem key={index} item={item} isActive={pathname === item.href} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="mt-auto p-2 border-t border-zinc-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {userProfile && (
          <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name}</AvatarFallback>
            </Avatar>
            <div className="hidden group-hover:block transition-all">
              <p className="text-sm font-medium text-zinc-900 dark:text-gray-100">{userProfile.name}</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon" className="w-full justify-start mt-2 group-hover:justify-start text-zinc-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
          <LogOut className="h-5 w-5" />
          <span className="ml-2 hidden group-hover:inline-block">Log out</span>
        </Button>
      </div>
    </div>
  );
}

function NavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        isActive
          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300"
          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-zinc-700 dark:text-gray-200"
      )}
    >
      <div className={cn("text-gray-500 dark:text-gray-400", isActive && "text-purple-600 dark:text-purple-300")}> 
        {item.icon}
      </div>
      <span className="hidden group-hover:inline-block truncate">{item.label}</span>
      {item.badge && (
        <span className="hidden group-hover:inline-flex ml-auto bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 text-xs font-medium rounded-full px-2 py-0.5">
          {item.badge}
        </span>
      )}
    </Link>
  );
}