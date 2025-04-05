// FeaturesSection.tsx
import { ChartPie, CloudLightning, PuzzleIcon, ShieldCheckIcon } from 'lucide-react';
import React from 'react';

const features = [
  {
    id: 'powerful',
    title: 'Powerful AI Models',
    description: 'Access state-of-the-art AI models trained on diverse datasets for exceptional results across various tasks.',
    icon: CloudLightning,
    color: 'text-purple-500'
  },
  {
    id: 'customizable',
    title: 'Fully Customizable',
    description: 'Tailor AI capabilities to your specific needs with customization options and fine-tuning capabilities.',
    icon: PuzzleIcon,
    color: 'text-blue-500'
  },
  {
    id: 'integration',
    title: 'Seamless Integration',
    description: 'Easily integrate with your existing workflows through our comprehensive API and pre-built connectors.',
    icon: ChartPie,
    color: 'text-green-500'
  },
  {
    id: 'security',
    title: 'Enterprise Security',
    description: 'Rest easy with our enterprise-grade security measures and compliance with major security standards.',
    icon: ShieldCheckIcon,
    color: 'text-red-500'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our AI Platform</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the difference with our advanced AI tools designed to enhance productivity and creativity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-start"
            >
              <div className={`${feature.color} bg-opacity-10 p-3 rounded-lg mr-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
          <div className="md:flex">
            <div className="p-8 md:p-12 md:w-3/5">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to transform your workflow?</h3>
              <p className="text-indigo-100 mb-6">
                Get started today and experience the power of AI with our 14-day free trial. No credit card required.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                  Start Free Trial
                </button>
                <button className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
            <div className="md:w-2/5 bg-indigo-800 flex items-center justify-center p-8">
              <img src="/api/placeholder/400/320" alt="AI Platform Dashboard" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

