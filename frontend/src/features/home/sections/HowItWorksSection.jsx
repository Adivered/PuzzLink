import React from 'react';
import { HowItWorksCard } from './how-it-works/HowItWorksCard';
import { howItWorksData } from './how-it-works/howItWorksData';

/**
 * How It Works Section component following Single Responsibility Principle
 * Displays step-by-step process with animations and theme integration
 */
export const HowItWorksSection = ({ theme, sectionRef, containerRef }) => (
  <section 
    id="howItWorks" 
    ref={sectionRef} 
    className={`min-h-screen py-20 relative overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}
  >
    {/* Animated Background Shapes */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large floating circles */}
      <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10 animate-pulse ${
        theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
      }`}></div>
      <div className={`absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-10 animate-bounce ${
        theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
      }`} style={{ animationDuration: '6s' }}></div>
      <div className={`absolute -bottom-16 left-1/3 w-64 h-64 rounded-full opacity-10 animate-pulse ${
        theme === 'dark' ? 'bg-pink-400' : 'bg-pink-500'
      }`} style={{ animationDelay: '2s' }}></div>
      
      {/* Floating cards mockup shapes */}
      <div className="card-mockup absolute top-20 right-20 opacity-20">
        <div className={`w-16 h-20 rounded-lg rotate-12 ${
          theme === 'dark' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-purple-500'
        } shadow-lg animate-bounce`} style={{ animationDuration: '3s' }}></div>
      </div>
      <div className="card-mockup absolute bottom-32 left-16 opacity-20">
        <div className={`w-12 h-16 rounded-lg -rotate-12 ${
          theme === 'dark' ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-purple-400 to-pink-500'
        } shadow-lg animate-pulse`} style={{ animationDelay: '1s' }}></div>
      </div>
      <div className="card-mockup absolute top-1/2 left-8 opacity-20">
        <div className={`w-14 h-18 rounded-lg rotate-6 ${
          theme === 'dark' ? 'bg-gradient-to-br from-pink-500 to-red-600' : 'bg-gradient-to-br from-pink-400 to-red-500'
        } shadow-lg animate-bounce`} style={{ animationDelay: '3s', animationDuration: '4s' }}></div>
      </div>
    </div>

    <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className={`text-5xl md:text-6xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          How It Works
        </h2>
        <p className={`text-xl md:text-2xl ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Master the game in 4 simple steps
        </p>
      </div>
      
      {/* Main Slideshow Container */}
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="w-full max-w-6xl relative">
          {/* Card Container */}
          <div 
            ref={containerRef} 
            className="relative w-full h-96 mx-auto"
            style={{ maxWidth: '800px' }}
          >
            {howItWorksData.map((step, index) => (
              <div 
                key={index} 
                className="step-card absolute top-0 left-0 w-full h-full"
              >
                <HowItWorksCard step={step} index={index} theme={theme} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
); 