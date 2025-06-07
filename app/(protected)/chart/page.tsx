'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChartCard } from '../../components/AreaChartCard';
import { BarChartCard } from '../../components/BarChartCard';


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

const ChartStatisticsPage: React.FC = () => {
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
      } else {
        setRealHazards([]);
      }
    } catch {
      setRealHazards([]);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl w-full mx-auto space-y-8">
        {/* Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Hazards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{realHazards.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{realHazards.filter(h => h.status === 'Open').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{realHazards.filter(h => h.severity === 'Critical').length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {realHazards.filter(h => 
                  h.status === 'Resolved' && 
                  new Date(h.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AreaChartCard />
          <BarChartCard />
        </div>
      </div>
    </div>
  );
};

export default ChartStatisticsPage;