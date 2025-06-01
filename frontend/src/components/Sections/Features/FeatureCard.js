import React, { useState } from 'react';

export const FeatureCard = ({ feature, theme, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Color themes for each card
  const cardThemes = [
    { 
      gradient: theme === 'dark' ? 'from-cyan-500/20 to-blue-500/20' : 'from-cyan-400/30 to-blue-400/30',
      iconBg: theme === 'dark' ? 'from-cyan-400 to-blue-500' : 'from-cyan-500 to-blue-600',
      border: theme === 'dark' ? 'border-cyan-400/30' : 'border-cyan-500/40'
    },
    { 
      gradient: theme === 'dark' ? 'from-purple-500/20 to-pink-500/20' : 'from-purple-400/30 to-pink-400/30',
      iconBg: theme === 'dark' ? 'from-purple-400 to-pink-500' : 'from-purple-500 to-pink-600',
      border: theme === 'dark' ? 'border-purple-400/30' : 'border-purple-500/40'
    },
    { 
      gradient: theme === 'dark' ? 'from-emerald-500/20 to-teal-500/20' : 'from-emerald-400/30 to-teal-400/30',
      iconBg: theme === 'dark' ? 'from-emerald-400 to-teal-500' : 'from-emerald-500 to-teal-600',
      border: theme === 'dark' ? 'border-emerald-400/30' : 'border-emerald-500/40'
    },
    { 
      gradient: theme === 'dark' ? 'from-orange-500/20 to-red-500/20' : 'from-orange-400/30 to-red-400/30',
      iconBg: theme === 'dark' ? 'from-orange-400 to-red-500' : 'from-orange-500 to-red-600',
      border: theme === 'dark' ? 'border-orange-400/30' : 'border-orange-500/40'
    },
    { 
      gradient: theme === 'dark' ? 'from-indigo-500/20 to-purple-500/20' : 'from-indigo-400/30 to-purple-400/30',
      iconBg: theme === 'dark' ? 'from-indigo-400 to-purple-500' : 'from-indigo-500 to-purple-600',
      border: theme === 'dark' ? 'border-indigo-400/30' : 'border-indigo-500/40'
    },
    { 
      gradient: theme === 'dark' ? 'from-rose-500/20 to-pink-500/20' : 'from-rose-400/30 to-pink-400/30',
      iconBg: theme === 'dark' ? 'from-rose-400 to-pink-500' : 'from-rose-500 to-pink-600',
      border: theme === 'dark' ? 'border-rose-400/30' : 'border-rose-500/40'
    }
  ];

  const currentTheme = cardThemes[index % cardThemes.length];

  return (
    <div 
      className={`group relative p-8 rounded-3xl transition-all duration-500 transform hover:scale-105 cursor-pointer ${
        theme === 'dark'
          ? 'bg-white/5 hover:bg-white/10 border border-white/10'
          : 'bg-white/60 hover:bg-white/80 border border-white/20'
      } backdrop-blur-xl shadow-2xl hover:shadow-3xl ${currentTheme.border}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${currentTheme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"></div>

      <div className="relative z-10">
        {/* Icon with animated background */}
        <div className="mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${currentTheme.iconBg} shadow-lg transform transition-all duration-300 ${
            isHovered ? 'scale-110 rotate-6' : ''
          }`}>
            <span className="text-2xl text-white filter drop-shadow-lg">
              {feature.icon}
            </span>
          </div>
        </div>

        {/* Content */}
        <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
          theme === 'dark' ? 'text-white group-hover:text-cyan-300' : 'text-gray-900 group-hover:text-gray-800'
        }`}>
          {feature.title}
        </h3>
        
        <p className={`text-lg leading-relaxed transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-700'
        }`}>
          {feature.description}
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full opacity-40 animate-ping"></div>
      <div className="absolute bottom-6 left-6 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
};