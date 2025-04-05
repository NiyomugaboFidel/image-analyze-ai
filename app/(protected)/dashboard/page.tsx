'use client'
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Calendar as CalendarIcon, Filter, MoreVertical, Search, AlertTriangle, HardHat, ArrowDown, FireExtinguisher } from 'lucide-react';
import { BarChartCard } from '../../components/BarChartCard';
import { AreaChartCard } from '../../components/AreaChartCard';
import { hazardData, HazardDataTable } from './HazardTableData';

// Define TypeScript interfaces for our data structures
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


// Type definitions for filter states
type StatusFilter = 'All' | 'Open' | 'Resolving' | 'Resolved';
type SeverityFilter = 'All' | 'Low' | 'Medium' | 'High' | 'Critical';

const ConstructionMonitoringDashboard: React.FC = () => {

  const [notifications, setNotifications] = useState<Notification[]>(notificationData);
  

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
      'Low': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[severity] || 'bg-gray-100 text-gray-800'}>
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
      'Open': 'bg-red-100 text-red-800',
      'Resolving': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
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
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Construction Site Safety Monitoring</h1>
          
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between">
                  <span>Notifications</span>
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>Mark all as read</Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className={`flex flex-col items-start p-3 ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <div className="flex justify-between w-full">
                        <span className="font-medium">{notification.message}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Hazards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{hazardData.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{hazardData.filter(h => h.status === 'Open').length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{hazardData.filter(h => h.severity === 'Critical').length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Resolved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {hazardData.filter(h => 
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
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="max-h-80 overflow-y-auto">
                <div className="space-y-4">
                  {hazardData
                    .slice()
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5)
                    .map((hazard) => (
                      <div key={hazard.id} className="flex items-start gap-4 p-2 rounded-lg hover:bg-gray-50">
                        <div className="bg-blue-100 p-2 rounded-full">
                          {getHazardIcon(hazard.type)}
                        </div>
                        <div>
                          <p className="font-medium">{hazard.type} detected in {hazard.location}</p>
                          <p className="text-sm text-gray-500">{new Date(hazard.timestamp).toLocaleString()}</p>
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
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          Construction Site Monitoring System © 2025
        </div>
      </footer>
    </div>
  );
};

export default ConstructionMonitoringDashboard;