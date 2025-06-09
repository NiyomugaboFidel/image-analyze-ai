'use client'
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Calendar as CalendarIcon, Filter, MoreVertical, Search, AlertTriangle, HardHat, ArrowDown, FireExtinguisher } from 'lucide-react';
import { BarChartCard } from '../../components/BarChartCard';
import { AreaChartCard } from '../../components/AreaChartCard';
import { HazardDataTable } from './HazardTableData';


interface Hazard {
  id: number;
  type: 'Missing Safety Gear' | 'Fire Risk' | 'Falling Object' | string;
  location: string;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Resolving' | 'Resolved';
  image: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}



const notificationData: Notification[] = [
  { id: 1, message: 'Critical hazard detected in Zone B', time: '1 hour ago', read: false },
  { id: 2, message: 'Hazard #3 has been resolved', time: '3 hours ago', read: true },
  { id: 3, message: '2 new hazards detected today', time: '5 hours ago', read: true },
];



type StatusFilter = 'All' | 'Open' | 'Resolving' | 'Resolved';
type SeverityFilter = 'All' | 'Low' | 'Medium' | 'High' | 'Critical';

const ConstructionMonitoringDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(notificationData);
  const [realHazards, setRealHazards] = useState<Hazard[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dangerDetections');
      if (stored) {
        const parsed = JSON.parse(stored);
        const mapped = parsed.map((h: any, idx: number) => ({
          id: h.id || idx,
          type: h.description?.toLowerCase().includes('fire') ? 'Fire Risk' : h.description?.toLowerCase().includes('object') ? 'Falling Object' : h.description?.toLowerCase().includes('gear') ? 'Missing Safety Gear' : 'Other',
          location: h.cameraName || 'Unknown',
          timestamp: h.timestamp,
          severity: h.severity ? (h.severity.charAt(0).toUpperCase() + h.severity.slice(1).toLowerCase()) : 'Medium',
          status: 'Open',
          image: h.image,
        }));
        setRealHazards(mapped);

       
        interface HazardNotification extends Notification {
          hazardId: number;
        }

        const hazardNotifications: HazardNotification[] = mapped.map((hazard: Hazard, idx: number): HazardNotification => {
          let message: string = '';
          if (hazard.severity === 'Critical') {
            message = `Critical hazard detected in ${hazard.location}`;
          } else {
            message = `New hazard detected in ${hazard.location}`;
          }
          return {
            id: typeof hazard.id === 'number' ? hazard.id : idx + 1000,
            hazardId: hazard.id,
            message,
            time: hazard.timestamp ? timeAgo(hazard.timestamp) : '',
            read: false,
          };
        });
        setNotifications(hazardNotifications);
      } else {
        setRealHazards([]);
        setNotifications(notificationData);
      }
    } catch {
      setRealHazards([]);
      setNotifications(notificationData);
    }
  }, []);

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

  const markAllAsRead = (): void => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: number): void => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notif => notif.id !== id)
    );
  };

  // Create a type map for severity badge classes
  type SeverityColorMap = {
    [key in Hazard['severity']]: string;
  };

  const getSeverityBadge = (severity: Hazard['severity']): any => {
    const colors: SeverityColorMap = {
      'Low': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <Badge className={colors[severity] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}>
        {severity}
      </Badge>
    );
  };

  // Create a type map for status badge classes
  type StatusColorMap = {
    [key in Hazard['status']]: string;
  };

  const getStatusBadge = (status: Hazard['status']): any => {
    const colors: StatusColorMap = {
      'Open': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Resolving': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}>
        {status}
      </Badge>
    );
  };

  const getHazardIcon = (type: string): any => {
    switch(type) {
      case 'Missing Safety Gear':
        return <HardHat className="h-4 w-4 mr-1" />;
      case 'Fire Risk':
        return <FireExtinguisher className="h-4 w-4 mr-1" />;
      case 'Falling Object':
        return <ArrowDown className="h-4 w-4 mr-1" />;
      default:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Construction Safety Monitoring System</h1>
          
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
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

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Hazards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{realHazards.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{realHazards.filter(h => h.status === 'Open').length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{realHazards.filter(h => h.severity === 'Critical').length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {realHazards.filter(h => 
                  h.status === 'Resolved' && 
                  new Date(h.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel (2/3 width on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hazards Table */}
            <HazardDataTable />
          </div>

          {/* Side Panel (1/3 width on large screens) */}
          <div className="space-y-6">
            {/* Statistics Cards */}
            <AreaChartCard />

            {/* Weekly Trend Chart */}
            <BarChartCard />

            {/* Recent Activity Feed */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-100">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                <div className="space-y-4">
                  {realHazards
                    .slice()
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5)
                    .map((hazard) => (
                      <div key={hazard.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                          {getHazardIcon(hazard.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{hazard.type} detected in {hazard.location}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(hazard.timestamp).toLocaleString()}</p>
                          <div className="mt-1 flex gap-2">
                            {getSeverityBadge(hazard.severity)}
                            {getStatusBadge(hazard.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="container mx-auto text-center text-gray-500 dark:text-gray-400 text-sm">
          Construction Site Monitoring System © 2025
        </div>
      </footer>
    </div>
  );
};

export default ConstructionMonitoringDashboard;