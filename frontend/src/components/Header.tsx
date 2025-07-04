'use client';

import React from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onGetStarted?: () => void;
  onHistoryClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStarted, onHistoryClick }) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      // Scroll to the input section
      const inputSection = document.querySelector('[data-section="input"]');
      if (inputSection) {
        inputSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="relative w-full p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white/90 border border-white/30 shadow-xl rounded-2xl">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo/Brand */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                    <span className="text-blue-600">Automate</span> This Job
                  </h1>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* History Button */}
                {onHistoryClick && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onHistoryClick}
                    className="h-10 w-10 sm:h-11 sm:w-11 bg-white/95 backdrop-blur-sm border-gray-200 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <History className="h-4 w-4 text-gray-700" />
                    <span className="sr-only">Open analysis history</span>
                  </Button>
                )}
                
                {/* Get Started Button */}
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                  <svg 
                    className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M13 7l5 5m0 0l-5 5m5-5H6" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;