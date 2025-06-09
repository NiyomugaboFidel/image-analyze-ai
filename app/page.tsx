'use client';
import React, { useState, useEffect } from 'react';
import AICardGrid from './components/AiCardGrid';
import FeaturesSection from './components/FeatureSection';
import TestimonialSection from './components/Testimonial';
import { useAuth } from './context/AuthoContext';

const Home: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCookiePopup, setShowCookiePopup] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const acceptCookies = () => {
    // Save to localStorage so it persists across visits
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookiePopup(false);
  };

  useEffect(() => {
    // Check if user has previously accepted cookies
    const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');
    
    // Short timeout to let the page load before showing the popup
    const timer = setTimeout(() => {
      if (!hasAcceptedCookies) {
        setShowCookiePopup(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex justify-between w-full items-center">
              <a href="/" className="flex items-center">
                <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                  V
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Vicky AI</span>
              </a>
              
              {/* Desktop Navigation */}
              <nav className="hidden  lg:ml-8 lg:flex lg:space-x-8">
                <a href="#products" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Products
                </a>
                <a href="#solutions" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Solutions
                </a>
                <a href="#pricing" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Pricing
                </a>
                <a href="#resources" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Resources
                </a>
              </nav>
         
            {/* Right buttons */}
            <div className="flex items-center">
              {isAuthenticated && user ? (
                <>
                  <span className="text-gray-900 font-semibold mr-4">Hi, {user.name}</span>
                  <a href="/dashboard" className="ml-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Dashboard
                  </a>
                </>
              ) : (
                <>
                  <a href="/auth/login" className="hidden md:block text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    Log in
                  </a>
                  <a href="/auth/register" className="hidden md:block ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                    Sign up
                  </a>
                </>
              )}
              {/* Mobile menu button */}
              <button 
                className="ml-4 md:hidden bg-white p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
            </div>
            
          </div>
          
          {/* Mobile menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 border-t border-gray-100">
              <a href="#products" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50">
                Products
              </a>
              <a href="#solutions" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50">
                Solutions
              </a>
              <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50">
                Pricing
              </a>
              <a href="#resources" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50">
                Resources
              </a>
              <div className="pt-4 pb-3 border-t border-gray-100">
                {isAuthenticated && user ? (
                  <>
                    <span className="block px-3 py-2 rounded-md text-base font-medium text-gray-900">Hi, {user.name}</span>
                    <a href="/protected/dashboard" className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                      Dashboard
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/auth/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50">
                      Log in
                    </a>
                    <a href="/auth/register" className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                      Sign up
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="  bg-gradient-to-r from-indigo-600 to-purple-600   text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                <span className="block">Revolutionizing Safety</span>
                <span className="block text-blue-200">in Construction Sites</span>
              </h1>
              <p className="mt-6 max-w-xl mx-auto text-xl text-blue-100">
                Cutting-edge safety solutions powered by AI to protect workers, prevent accidents, and ensure compliance with industry standards.
              </p>
              <div className="mt-10 flex justify-center">
                <div className="rounded-md shadow">
                  <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10">
                    Get started
                  </a>
                </div>
                <div className="ml-3 rounded-md shadow">
                  <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900 md:py-4 md:text-lg md:px-10">
                    View solutions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Categories */}
        <section className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for safety tools..."
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* AI Card Grid Component */}
        <section id="products">
          <AICardGrid />
        </section>
        {/* Features Section Component */}
        <section id="solutions">
          <FeaturesSection />
        </section>
        {/* Testimonial Section Component */}
        <section id="resources">
          <TestimonialSection />
        </section>
        {/* Usage Statistics */}
        <section id="pricing" className="bg-blue-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Trusted by Safety Leaders Worldwide</h2>
              <p className="text-blue-200 max-w-2xl mx-auto">
                Join thousands of construction companies and safety professionals using our AI platform to enhance workplace safety.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-300">500K+</div>
                <p className="text-blue-200 mt-2">Active Users</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-300">10M+</div>
                <p className="text-blue-200 mt-2">Hazards Identified</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-300">98%</div>
                <p className="text-blue-200 mt-2">Satisfaction Rate</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-300">1000+</div>
                <p className="text-blue-200 mt-2">Construction Sites</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center items-center mt-12 gap-8 opacity-70">
              <div className="h-8">
                <img src="/api/placeholder/120/32" alt="Company logo" className="h-full" />
              </div>
              <div className="h-8">
                <img src="/api/placeholder/120/32" alt="Company logo" className="h-full" />
              </div>
              <div className="h-8">
                <img src="/api/placeholder/120/32" alt="Company logo" className="h-full" />
              </div>
              <div className="h-8">
                <img src="/api/placeholder/120/32" alt="Company logo" className="h-full" />
              </div>
              <div className="h-8">
                <img src="/api/placeholder/120/32" alt="Company logo" className="h-full" />
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className=" bg-gradient-to-r from-indigo-600 to-purple-600  rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-12 md:p-12 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to enhance workplace safety?</h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join over 500,000 safety professionals already using our AI platform to protect workers and prevent accidents.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="#" className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                    Start Free Trial
                  </a>
                  <a href="#" className="px-8 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
                    Schedule Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="ml-2 text-xl font-bold">Victoria AI</span>
              </div>
              <p className="mt-4 text-gray-400 max-w-xs">
                Empowering construction teams with cutting-edge AI safety tools and solutions to create safer work environments.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Products</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Hazard Detection</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Safety Training</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Compliance Assistant</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Incident Analyzer</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">PPE Monitoring</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Partners</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 Vicky AI, Inc. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Policy Popup */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-lg transition-transform duration-500 ease-in-out ${
          showCookiePopup ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
              </svg>
              <span className="font-bold">Cookie Notice</span>
            </div>
            <p className="text-sm text-gray-300 mt-2">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={acceptCookies}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium min-w-24 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Accept All
            </button>
            <button 
              onClick={acceptCookies}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm font-medium min-w-24 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Essential Only
            </button>
            <a 
              href="#" 
              className="px-4 py-2 text-sm font-medium text-blue-300 hover:text-blue-200"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;