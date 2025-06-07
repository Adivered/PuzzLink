import React from 'react';
import { PriceCard } from './pricing/PriceCard';
import { pricingData } from './pricing/pricingData';

/**
 * Pricing Section component following Single Responsibility Principle
 * Displays pricing plans with animations and theme integration
 */
export const PricingSection = ({ theme, sectionRef }) => (
  <section 
    id="pricing" 
    ref={sectionRef} 
    className={`relative min-h-screen py-24 overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-bl from-green-900 via-emerald-900 to-teal-900' 
        : 'bg-gradient-to-bl from-green-50 via-emerald-50 to-teal-50'
    }`}
  >
    {/* Animated Background Elements */}
    <div className="absolute inset-0">
      {/* Price tag icons floating */}
      <div className="absolute top-20 right-20 opacity-10">
        <svg className={`w-20 h-20 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'} animate-bounce`} 
             style={{ animationDuration: '4s' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.586 2.586A2 2 0 0011.172 2H4a2 2 0 00-2 2v7.172a2 2 0 00.586 1.414L8.586 18.586a2 2 0 002.828 0l7.172-7.172a2 2 0 000-2.828L12.586 2.586zM7 9a2 2 0 110-4 2 2 0 010 4z"/>
        </svg>
      </div>

      <div className="absolute bottom-32 left-16 opacity-15">
        <svg className={`w-16 h-16 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-500'} animate-pulse`} 
             style={{ animationDuration: '6s' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>

      {/* Geometric patterns */}
      <div className="absolute bottom-1/4 right-1/3">
        <div className={`w-24 h-24 ${
          theme === 'dark' ? 'bg-gradient-to-br from-teal-400/15 to-cyan-400/15' : 'bg-gradient-to-br from-teal-300/25 to-cyan-300/25'
        } rounded-full animate-pulse`} style={{ animationDuration: '8s' }}></div>
      </div>
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
          <span className="block">Simple</span>
          <span className={`block bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-green-400 via-emerald-400 to-teal-400' 
              : 'from-green-500 via-emerald-500 to-teal-500'
          } bg-clip-text text-transparent`}>
            Pricing
          </span>
        </h2>
        <p 
          data-animate="section-header"
          className={`text-xl md:text-2xl max-w-3xl mx-auto mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Choose the perfect plan to unlock your puzzle-solving potential
        </p>

        {/* Value proposition badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { icon: '🔒', text: 'No Hidden Fees' },
            { icon: '🔄', text: 'Cancel Anytime' },
            { icon: '💾', text: 'Data Backup' },
            { icon: '🚀', text: 'Instant Access' }
          ].map((badge, index) => (
            <div 
              key={index}
              data-animate="section-header"
              className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                theme === 'dark'
                  ? 'bg-white/10 border border-white/20 text-gray-300'
                  : 'bg-white/60 border border-white/30 text-gray-700'
              } backdrop-blur-sm transition-all duration-300 hover:scale-105`}
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative">
        {/* Popular plan highlight beam */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full">
          <div className={`w-full h-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-b from-yellow-400/50 via-orange-400/30 to-transparent' 
              : 'bg-gradient-to-b from-yellow-500/40 via-orange-500/20 to-transparent'
          } opacity-30`}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {pricingData.map((plan, index) => (
            <div 
              key={index}
              data-animate="pricing"
              style={{ 
                zIndex: index === 1 ? 10 : 1
              }}
            >
              <PriceCard plan={plan} theme={theme} index={index} isPopular={index === 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
); 