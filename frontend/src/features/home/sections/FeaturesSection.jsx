import React from 'react';
import { featuresData } from './features/featuresData';
import { FeatureCard } from './features/FeatureCard';

/**
 * Features Section component following Single Responsibility Principle
 * Displays key features with animations and theme integration
 */
export const FeaturesSection = ({ theme, sectionRef, gsapManager }) => {
  return (
    <section 
      id="features" 
      ref={sectionRef} 
      className={`relative min-h-screen py-24 overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900' 
          : 'bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50'
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 opacity-10">
          <div className={`w-full h-full ${
            theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-500'
          } rotate-45`}></div>
        </div>
        
        <div className="absolute bottom-20 right-10 w-24 h-24 opacity-15">
          <div className={`w-full h-full ${
            theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
          } rounded-full`}></div>
        </div>
        
        <div className="absolute top-1/2 right-1/4 w-20 h-20 opacity-10">
          <div className={`w-full h-full ${
            theme === 'dark' ? 'bg-pink-400' : 'bg-pink-500'
          } rotate-12`}></div>
        </div>

        {/* Grid pattern overlay */}
        <div className={`absolute inset-0 opacity-5 ${
          theme === 'dark' ? 'bg-white' : 'bg-gray-900'
        }`} style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 
            data-animate="section-header"
            className={`text-5xl md:text-6xl font-black mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            <span className="block">Powerful</span>
            <span className={`block bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-cyan-400 via-purple-400 to-pink-400' 
                : 'from-cyan-500 via-purple-500 to-pink-500'
            } bg-clip-text text-transparent`}>
              Features
            </span>
          </h2>
          <p 
            data-animate="section-header"
            className={`text-xl md:text-2xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Discover the innovative tools that make PuzzLink the ultimate platform for puzzle enthusiasts
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {featuresData.map((feature, index) => (
            <div 
              key={index}
              data-animate="feature"
            >
              <FeatureCard feature={feature} theme={theme} index={index} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div 
            data-animate="feature"
            className={`inline-flex items-center px-6 py-3 rounded-full ${
              theme === 'dark'
                ? 'bg-white/10 border border-white/20 text-gray-300'
                : 'bg-white/50 border border-white/30 text-gray-700'
            } backdrop-blur-sm transition-all duration-300 hover:scale-105`}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 mr-3"></span>
            <span className="font-semibold">More features coming soon</span>
          </div>
        </div>
      </div>
    </section>
  );
}; 