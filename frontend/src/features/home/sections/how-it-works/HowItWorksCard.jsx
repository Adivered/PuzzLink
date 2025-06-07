import React from 'react';

export const HowItWorksCard = ({ step, index, theme }) => {
  const colors = {
    0: { 
      gradient: theme === 'dark' ? 'from-blue-600 to-cyan-600' : 'from-blue-500 to-cyan-500',
      bg: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100/70',
      accent: theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
    },
    1: { 
      gradient: theme === 'dark' ? 'from-purple-600 to-pink-600' : 'from-purple-500 to-pink-500',
      bg: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-100/70',
      accent: theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
    },
    2: { 
      gradient: theme === 'dark' ? 'from-green-600 to-emerald-600' : 'from-green-500 to-emerald-500',
      bg: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-100/70',
      accent: theme === 'dark' ? 'text-green-300' : 'text-green-600'
    },
    3: { 
      gradient: theme === 'dark' ? 'from-orange-600 to-red-600' : 'from-orange-500 to-red-500',
      bg: theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-100/70',
      accent: theme === 'dark' ? 'text-orange-300' : 'text-orange-600'
    }
  };

  const cardColor = colors[index];

  return (
    <div className="flex flex-col items-center text-center w-full h-full justify-center px-8 relative">
      {/* Background Card Shape */}
      <div className={`absolute inset-4 rounded-3xl ${cardColor.bg} backdrop-blur-sm border ${
        theme === 'dark' ? 'border-white/10' : 'border-white/30'
      } shadow-2xl`}></div>
      
      {/* Floating Card Mockups around the main content */}
      <div className="absolute top-8 right-8 opacity-30">
        <div className={`w-8 h-10 bg-gradient-to-br ${cardColor.gradient} rounded shadow-lg rotate-12 animate-pulse`}></div>
      </div>
      <div className="absolute bottom-8 left-8 opacity-30">
        <div className={`w-6 h-8 bg-gradient-to-br ${cardColor.gradient} rounded shadow-lg -rotate-12 animate-pulse`} 
             style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Step Number with enhanced design */}
        <div className="relative mb-8">
          <div className={`w-24 h-24 bg-gradient-to-br ${cardColor.gradient} rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl transform hover:scale-110 transition-transform duration-300`}>
            {index + 1}
          </div>
          {/* Decorative ring */}
          <div className={`absolute inset-0 w-24 h-24 bg-gradient-to-br ${cardColor.gradient} rounded-full opacity-30 animate-ping`}></div>
        </div>
        
        {/* Title */}
        <h3 className={`text-3xl md:text-4xl font-bold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {step.title}
        </h3>
        
        {/* Description */}
        <p className={`text-lg md:text-xl leading-relaxed max-w-lg mx-auto ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {step.description}
        </p>
        
        {/* Action indicator */}
        <div className={`mt-8 inline-flex items-center px-4 py-2 rounded-full ${cardColor.bg} ${cardColor.accent} font-semibold text-sm`}>
          <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></span>
          Step {index + 1} of 4
        </div>
        
        {/* Card deck visualization for gaming context */}
        <div className="mt-6 flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className={`w-4 h-6 bg-gradient-to-br ${cardColor.gradient} rounded shadow-sm transform transition-transform duration-300`}
              style={{ 
                transform: `translateX(${i * -2}px) rotate(${(i - 1) * 5}deg)`,
                zIndex: 3 - i,
                opacity: 0.7 + (i * 0.15)
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}; 