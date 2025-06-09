'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, MoreVertical } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Helper to format time ago
  function timeAgo(dateString: string): string {
    const now = new Date();
    const then = new Date(dateString);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString();
  }

  // Load notifications from dangerDetections in localStorage
  useEffect(() => {
    try {
      const dangerDetections = localStorage.getItem('dangerDetections');
      if (dangerDetections) {
        const parsed = JSON.parse(dangerDetections);
        const hazardNotifications = parsed.map((h: any, idx: number) => {
          let message = h.severity === 'Critical'
            ? `Critical hazard detected in ${h.cameraName || 'Unknown'}`
            : `New hazard detected in ${h.cameraName || 'Unknown'}`;
          return {
            id: h.id || idx,
            message,
            time: h.timestamp ? timeAgo(h.timestamp) : '',
            read: false,
          };
        });
        // If notifications already exist in localStorage, preserve their read/delete state
        const stored = localStorage.getItem('notifications');
        if (stored) {
          // Merge read/delete state
          const storedArr = JSON.parse(stored);
          const merged = hazardNotifications.map((notif: Notification) => {
            const found = storedArr.find((n: Notification) => n.id === notif.id);
            return found ? { ...notif, read: found.read } : notif;
          });
          setNotifications(merged);
          localStorage.setItem('notifications', JSON.stringify(merged));
        } else {
          setNotifications(hazardNotifications);
          localStorage.setItem('notifications', JSON.stringify(hazardNotifications));
        }
      } else {
        setNotifications([]);
        localStorage.setItem('notifications', JSON.stringify([]));
      }
    } catch {
      setNotifications([]);
      localStorage.setItem('notifications', JSON.stringify([]));
    }
  }, []);

  const markAllAsRead = (): void => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id: number): void => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Notifications</h1>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-900 border dark:border-gray-700">
                <DropdownMenuLabel className="flex justify-between text-gray-800 dark:text-gray-100">
                  <span>Notifications</span>
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-gray-800 dark:text-gray-100">Mark all as read</Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className={`flex flex-col items-start p-3 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/40' : ''} text-gray-800 dark:text-gray-100`}>
                      <div className="flex justify-between w-full">
                        <span className="font-medium">{notification.message}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-800 dark:text-gray-100">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white dark:bg-gray-900 border dark:border-gray-700">
                            <DropdownMenuItem onClick={() => deleteNotification(notification.id)} className="text-red-600 dark:text-red-400">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{notification.time}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {notifications.length > 0 ? notifications.map((notification) => (
            <Card key={notification.id} className={`shadow-md border transition-all ${notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/40'}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  {notification.message}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-800 dark:text-gray-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white dark:bg-gray-900 border dark:border-gray-700">
                    <DropdownMenuItem onClick={() => deleteNotification(notification.id)} className="text-red-600 dark:text-red-400">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {!notification.read && <Badge className="bg-blue-500 text-white">Unread</Badge>}
                  <span className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</span>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">No notifications to display.</div>
          )}
        </div>
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={markAllAsRead} disabled={notifications.every(n => n.read)}>
            Mark all as read
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NotificationPage;
