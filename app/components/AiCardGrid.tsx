'use client';
// types.ts
type AICard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'detection' | 'monitoring' | 'analytics' | 'alerting' | 'compliance';
  rating?: number;
  provider?: string;
  providerUrl?: string;
  bgColor?: string;
};

// cardData.ts
const aiCards: AICard[] = [
  {
    id: 'hazard-detection',
    title: 'Hazard Detection',
    description: 'Real-time AI vision to identify unsafe conditions, dangerous materials, and equipment failures',
    icon: 'shield-alert',
    category: 'detection',
    rating: 4.8,
    provider: 'Vicky AI',
    bgColor: 'bg-gradient-to-r from-red-500 to-orange-600'
  },
  {
    id: 'worker-safety',
    title: 'Worker Safety Monitoring',
    description: 'Track PPE compliance, unsafe behaviors, and worker positioning in hazardous areas',
    icon: 'user-check',
    category: 'monitoring',
    rating: 4.9,
    provider: 'Vicky AI',
    bgColor: 'bg-gradient-to-r from-yellow-500 to-amber-600'
  },
  {
    id: 'compliance-tracking',
    title: 'Compliance Tracking',
    description: 'Ensure adherence to safety regulations and standards with automated monitoring',
    icon: 'clipboard-check',
    category: 'compliance',
    rating: 4.7,
    provider: 'Vicky AI',
    bgColor: 'bg-gradient-to-r from-emerald-500 to-teal-600'
  },
  {
    id: 'safety-analytics',
    title: 'Safety Analytics',
    description: 'Transform safety data into actionable insights with comprehensive dashboards',
    icon: 'bar-chart',
    category: 'analytics',
    rating: 4.6,
    provider: 'Vicky AI',
    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600'
  },
  {
    id: 'alert-system',
    title: 'Real-time Alerts',
    description: 'Instant notifications via WhatsApp, email, and in-app messaging when hazards are detected',
    icon: 'bell',
    category: 'alerting',
    rating: 4.8,
    provider: 'Vicky AI',
    bgColor: 'bg-gradient-to-r from-purple-500 to-violet-600'
  },
  {
    id: 'health-monitoring',
    title: 'Environmental Monitoring',
    description: 'Track air quality, noise levels, and environmental conditions that affect worker health',
    icon: 'activity',
    category: 'monitoring',
    rating: 4.7,
    provider: 'Vicky AI',
    bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600'
  }
];

import { StarIcon } from 'lucide-react';
// AICardGrid.tsx
import React, { useState, useEffect } from 'react';

const AICardGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredCards, setFilteredCards] = useState(aiCards);

  const categories = [
    { id: 'all', name: 'All Features' },
    { id: 'detection', name: 'Hazard Detection' },
    { id: 'monitoring', name: 'Monitoring' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'alerting', name: 'Alerting' },
    { id: 'compliance', name: 'Compliance' }
  ];

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredCards(aiCards);
    } else {
      setFilteredCards(aiCards.filter(card => card.category === selectedCategory));
    }
  }, [selectedCategory]);

  return (
    <div className="bg-white w-full max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Construction Safety Features</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover how our AI-powered platform helps protect workers and prevent accidents before they happen.
        </p>
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>



      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map(card => (
          <div 
            key={card.id}
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col"
          >
            <div className={`${card.bgColor} text-white p-6`}>
              <div className="flex justify-between items-start">
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    {/* This would be replaced with actual icon based on card.icon */}
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                  </svg>
                </div>
                {card.rating && (
                  <div className="flex items-center bg-white/20 px-2 py-1 rounded-full">
                    <StarIcon className="h-4 w-4 text-yellow-300" />
                    <span className="ml-1 text-sm font-medium">{card.rating}</span>
                  </div>
                )}
              </div>
              <h3 className="mt-4 text-xl font-bold">{card.title}</h3>
            </div>
            
            <div className="p-6 flex-grow">
              <p className="text-gray-600">{card.description}</p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
              {card.provider && (
                <span className="text-xs text-gray-500">By {card.provider}</span>
              )}
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Try Now
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* View more button */}
      <div className="mt-10 text-center">
        <button onClick={()=> setSelectedCategory('all')} className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
          View All AI Tools
        </button>
      </div>
   
    </div>
  );
};

export default AICardGrid;