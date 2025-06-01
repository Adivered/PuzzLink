import React, { useState } from 'react';

export const TestimonialCard = ({ testimonial, theme, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Different card orientations and colors
  const cardVariants = [
    {
      rotation: 'rotate-1',
      gradient: theme === 'dark' ? 'from-blue-600/20 to-purple-600/20' : 'from-blue-400/30 to-purple-400/30',
      borderColor: theme === 'dark' ? 'border-blue-400/30' : 'border-blue-500/40',
      avatarBg: 'from-blue-400 to-blue-600'
    },
    {
      rotation: '-rotate-1',
      gradient: theme === 'dark' ? 'from-emerald-600/20 to-teal-600/20' : 'from-emerald-400/30 to-teal-400/30',
      borderColor: theme === 'dark' ? 'border-emerald-400/30' : 'border-emerald-500/40',
      avatarBg: 'from-emerald-400 to-teal-600'
    },
    {
      rotation: 'rotate-2',
      gradient: theme === 'dark' ? 'from-rose-600/20 to-pink-600/20' : 'from-rose-400/30 to-pink-400/30',
      borderColor: theme === 'dark' ? 'border-rose-400/30' : 'border-rose-500/40',
      avatarBg: 'from-rose-400 to-pink-600'
    }
  ];

  const variant = cardVariants[index % cardVariants.length];

  return (
    <div 
      className={`group relative transform transition-all duration-500 hover:scale-105 ${variant.rotation} hover:rotate-0`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main card */}
      <div className={`relative p-8 rounded-3xl transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-white/10 hover:bg-white/15 border border-white/20'
          : 'bg-white/80 hover:bg-white/90 border border-white/30'
      } backdrop-blur-xl shadow-2xl hover:shadow-3xl ${variant.borderColor}`}>
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${variant.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

        {/* Quote icon */}
        <div className="relative z-10 mb-6">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${variant.avatarBg} shadow-lg`}>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
          </div>
        </div>

        {/* Quote text */}
        <blockquote className={`relative z-10 text-lg leading-relaxed mb-6 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          "{testimonial.quote}"
        </blockquote>

        {/* Star rating */}
        <div className="relative z-10 flex items-center mb-6">
          <div className="flex text-yellow-400 mr-3">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-4 h-4 fill-current transition-all duration-300 ${
                  isHovered ? 'scale-110' : ''
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            ))}
          </div>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            5.0
          </span>
        </div>

        {/* Author info */}
        <div className="relative z-10 flex items-center">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${variant.avatarBg} flex items-center justify-center mr-4 transition-all duration-300 ${
            isHovered ? 'scale-110 rotate-12' : ''
          } shadow-lg`}>
            <span className="text-xl font-bold text-white">
              {testimonial.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h4 className={`font-bold text-lg ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {testimonial.name}
            </h4>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {testimonial.role}
            </p>
            {testimonial.company && (
              <p className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                at {testimonial.company}
              </p>
            )}
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full opacity-60 animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-4 right-8 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};