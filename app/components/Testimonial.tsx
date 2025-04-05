
import React from 'react';

const testimonials = [
  {
    id: 1,
    content: "This AI platform has completely revolutionized our content creation process. We're saving 20+ hours per week while creating better quality material.",
    author: "Sarah Johnson",
    title: "Marketing Director, TechCorp",
    avatar: "/api/placeholder/48/48"
  },
  {
    id: 2,
    content: "The code assistant has been a game-changer for our development team. It's like having an expert developer always available to help.",
    author: "Michael Chen",
    title: "Lead Developer, StartupX",
    avatar: "/api/placeholder/48/48"  
  },
  {
    id: 3,
    content: "We've integrated the AI chatbot into our customer service workflow and have seen a 40% reduction in response time while improving satisfaction.",
    author: "Emma Rodriguez",
    title: "Customer Success Manager, RetailPlus",
    avatar: "/api/placeholder/48/48"
  }
];

const TestimonialSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how businesses are transforming their workflows with our AI platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-medium text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#" className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center">
            Read more success stories
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;