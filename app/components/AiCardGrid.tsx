'use client';
// types.ts
type AICard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'productivity' | 'creative' | 'analytics' | 'communication' | 'development';
  rating?: number;
  provider?: string;
  providerUrl?: string;
  bgColor?: string;
};

// cardData.ts
const aiCards: AICard[] = [
  {
    id: 'text-generation',
    title: 'Text Generator',
    description: 'Generate high-quality content for blogs, marketing, emails and more',
    icon: 'document-text',
    category: 'productivity',
    rating: 4.8,
    provider: 'intellify.ai',
    bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600'
  },
  {
    id: 'image-creator',
    title: 'Image Creator',
    description: 'Create stunning visuals from text descriptions in seconds',
    icon: 'photograph',
    category: 'creative',
    rating: 4.9,
    provider: 'intellify.ai',
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    id: 'code-assistant',
    title: 'Code Assistant',
    description: 'Get help with coding, debugging, and technical documentation',
    icon: 'code',
    category: 'development',
    rating: 4.7,
    provider: 'codegenius.io',
    bgColor: 'bg-gradient-to-r from-emerald-500 to-teal-500'
  },
  {
    id: 'data-analyzer',
    title: 'Data Analyzer',
    description: 'Transform raw data into actionable insights with AI analysis',
    icon: 'chart-bar',
    category: 'analytics',
    rating: 4.6,
    provider: 'datamagic.com',
    bgColor: 'bg-gradient-to-r from-amber-500 to-orange-500'
  },
  {
    id: 'video-ai',
    title: 'Video AI',
    description: 'Generate engaging videos with voiceovers in any language',
    icon: 'film',
    category: 'creative',
    rating: 4.7,
    provider: 'videogen.ai',
    bgColor: 'bg-gradient-to-r from-sky-500 to-blue-500'
  },
  {
    id: 'chat-assistant',
    title: 'Chat Assistant',
    description: 'Build custom chatbots for customer service and engagement',
    icon: 'chat-bubble-left-right',
    category: 'communication',
    rating: 4.8,
    provider: 'chatcraft.io',
    bgColor: 'bg-gradient-to-r from-green-500 to-emerald-500'
  }
];

import { StarIcon } from 'lucide-react';
// AICardGrid.tsx
import React, { useState, useEffect } from 'react';

const AICardGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredCards, setFilteredCards] = useState(aiCards);

  const categories = [
    { id: 'all', name: 'All Tools' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'creative', name: 'Creative' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'communication', name: 'Communication' },
    { id: 'development', name: 'Development' }
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
      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-indigo-600 text-white shadow-md'
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