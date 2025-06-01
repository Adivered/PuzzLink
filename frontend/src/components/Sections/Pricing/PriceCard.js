import React, { useState } from 'react';
import CheckIcon from '../../common/Icons/CheckIcon';

export const PriceCard = ({ plan, theme, index, isPopular = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Card theme variations
  const cardThemes = [
    {
      gradient: theme === 'dark' ? 'from-blue-600/20 to-indigo-600/20' : 'from-blue-400/30 to-indigo-400/30',
      border: theme === 'dark' ? 'border-blue-400/30' : 'border-blue-500/40',
      buttonBg: 'from-blue-500 to-indigo-600',
      iconBg: 'from-blue-400 to-indigo-500'
    },
    {
      gradient: theme === 'dark' ? 'from-amber-600/20 to-orange-600/20' : 'from-amber-400/30 to-orange-400/30',
      border: theme === 'dark' ? 'border-amber-400/30' : 'border-amber-500/40',
      buttonBg: 'from-amber-500 to-orange-600',
      iconBg: 'from-amber-400 to-orange-500'
    },
    {
      gradient: theme === 'dark' ? 'from-emerald-600/20 to-green-600/20' : 'from-emerald-400/30 to-green-400/30',
      border: theme === 'dark' ? 'border-emerald-400/30' : 'border-emerald-500/40',
      buttonBg: 'from-emerald-500 to-green-600',
      iconBg: 'from-emerald-400 to-green-500'
    }
  ];

  const currentTheme = cardThemes[index % cardThemes.length];

  return (
    <div 
      className={`group relative transition-all duration-500 transform hover:scale-105 ${
        isPopular ? 'scale-105 z-10' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className={`px-6 py-2 rounded-full text-sm font-bold ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900'
              : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
          } shadow-lg animate-pulse`}>
            ⭐ Most Popular
          </div>
        </div>
      )}

      {/* Glow effect for popular plan */}
      {isPopular && (
        <div className={`absolute inset-0 rounded-3xl ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20'
            : 'bg-gradient-to-r from-yellow-300/30 to-orange-300/30'
        } blur-xl animate-pulse`}></div>
      )}

      {/* Main card */}
      <div className={`relative p-8 rounded-3xl transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-white/10 hover:bg-white/15 border border-white/20'
          : 'bg-white/80 hover:bg-white/90 border border-white/30'
      } backdrop-blur-xl shadow-2xl hover:shadow-3xl ${currentTheme.border} ${
        isPopular ? 'border-2' : ''
      }`}>
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${currentTheme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

        <div className="relative z-10">
          {/* Plan header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${currentTheme.iconBg} shadow-lg transform transition-all duration-300 ${
                isHovered ? 'scale-110 rotate-6' : ''
              }`}>
                <span className="text-2xl text-white font-bold">
                  {plan.name?.charAt(0) || 'P'}
                </span>
              </div>
            </div>
            
            <h3 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {plan.name}
            </h3>
            
            {plan.description && (
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {plan.description}
              </p>
            )}
          </div>

          {/* Price display */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center">
              <span className={`text-5xl font-black ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } transition-all duration-300 ${
                isHovered ? 'scale-110' : ''
              }`}>
                {plan.price}
              </span>
              {plan.period && (
                <span className={`text-lg ml-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  /{plan.period}
                </span>
              )}
            </div>
            
            {plan.originalPrice && (
              <div className="mt-2">
                <span className={`text-lg line-through ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {plan.originalPrice}
                </span>
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                  Save 50%
                </span>
              </div>
            )}
          </div>

          {/* Features list */}
          <ul className="space-y-4 mb-8">
            {plan.features?.map((feature, featureIndex) => (
              <li 
                key={featureIndex} 
                className={`flex items-start transition-all duration-300 ${
                  isHovered ? 'translate-x-2' : ''
                }`}
                style={{ transitionDelay: `${featureIndex * 50}ms` }}
              >
                <div className="flex-shrink-0 mr-3 mt-1">
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${currentTheme.iconBg} flex items-center justify-center`}>
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                </div>
                <span className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <button className={`w-full py-4 px-6 rounded-2xl text-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
            isPopular 
              ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
              : `bg-gradient-to-r ${currentTheme.buttonBg} text-white shadow-lg`
          } group-hover:shadow-2xl`}>
            <span className="flex items-center justify-center">
              {plan.buttonText || 'Choose Plan'}
              <svg 
                className={`w-5 h-5 ml-2 transition-transform duration-300 ${
                  isHovered ? 'translate-x-1' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          {/* Additional info */}
          {plan.note && (
            <p className={`text-xs text-center mt-4 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {plan.note}
            </p>
          )}
        </div>

        {/* Floating particles */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full opacity-40 animate-ping"></div>
        <div className="absolute bottom-6 left-6 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>
      </div>
    </div>
  );
};