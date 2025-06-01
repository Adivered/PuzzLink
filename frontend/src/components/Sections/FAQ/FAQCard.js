import React, { useState } from 'react';

export const FAQCard = ({ faq, theme, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Different accent colors for each FAQ
  const accentColors = [
    {
      gradient: theme === 'dark' ? 'from-blue-500/20 to-cyan-500/20' : 'from-blue-400/30 to-cyan-400/30',
      border: theme === 'dark' ? 'border-blue-400/30' : 'border-blue-500/40',
      iconBg: 'from-blue-400 to-cyan-500',
      textAccent: theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
    },
    {
      gradient: theme === 'dark' ? 'from-purple-500/20 to-pink-500/20' : 'from-purple-400/30 to-pink-400/30',
      border: theme === 'dark' ? 'border-purple-400/30' : 'border-purple-500/40',
      iconBg: 'from-purple-400 to-pink-500',
      textAccent: theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
    },
    {
      gradient: theme === 'dark' ? 'from-emerald-500/20 to-teal-500/20' : 'from-emerald-400/30 to-teal-400/30',
      border: theme === 'dark' ? 'border-emerald-400/30' : 'border-emerald-500/40',
      iconBg: 'from-emerald-400 to-teal-500',
      textAccent: theme === 'dark' ? 'text-emerald-300' : 'text-emerald-600'
    },
    {
      gradient: theme === 'dark' ? 'from-amber-500/20 to-orange-500/20' : 'from-amber-400/30 to-orange-400/30',
      border: theme === 'dark' ? 'border-amber-400/30' : 'border-amber-500/40',
      iconBg: 'from-amber-400 to-orange-500',
      textAccent: theme === 'dark' ? 'text-amber-300' : 'text-amber-600'
    },
    {
      gradient: theme === 'dark' ? 'from-rose-500/20 to-red-500/20' : 'from-rose-400/30 to-red-400/30',
      border: theme === 'dark' ? 'border-rose-400/30' : 'border-rose-500/40',
      iconBg: 'from-rose-400 to-red-500',
      textAccent: theme === 'dark' ? 'text-rose-300' : 'text-rose-600'
    }
  ];

  const currentAccent = accentColors[index % accentColors.length];

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div 
      className={`group relative transition-all duration-500 transform hover:scale-[1.02] ${
        isOpen ? 'scale-[1.02]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${currentAccent.gradient} opacity-0 ${
        isOpen || isHovered ? 'opacity-100' : ''
      } transition-opacity duration-500`}></div>

      {/* Main card */}
      <div className={`relative p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
        theme === 'dark'
          ? 'bg-white/5 hover:bg-white/10 border border-white/10'
          : 'bg-white/60 hover:bg-white/80 border border-white/20'
      } backdrop-blur-xl shadow-lg hover:shadow-xl ${currentAccent.border} ${
        isOpen ? 'shadow-2xl' : ''
      }`}
      onClick={toggleOpen}
      >
        {/* Question header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 mr-4">
            {/* Question number */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${currentAccent.iconBg} flex items-center justify-center mr-4 transition-all duration-300 ${
              isOpen ? 'scale-110 rotate-6' : ''
            }`}>
              <span className="text-white font-bold text-sm">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Question text */}
            <h3 className={`text-lg md:text-xl font-bold transition-colors duration-300 ${
              theme === 'dark' ? 'text-white group-hover:text-gray-100' : 'text-gray-900 group-hover:text-gray-800'
            } ${isOpen ? currentAccent.textAccent : ''}`}>
              {faq.question}
            </h3>
          </div>

          {/* Expand/collapse icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${
            theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
          } flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'rotate-180 scale-110' : ''
          }`}>
            <svg 
              className={`w-5 h-5 transition-colors duration-300 ${
                isOpen ? currentAccent.textAccent : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Answer content */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
        }`}>
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-white/5' : 'bg-gray-50/50'
          } backdrop-blur-sm`}>
            <p className={`text-base leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {faq.answer}
            </p>

            {/* Additional action if answer is helpful */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20">
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Was this helpful?
              </span>
              <div className="flex space-x-2">
                <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                } hover:scale-105`}>
                  👍 Yes
                </button>
                <button className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                } hover:scale-105`}>
                  👎 No
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 ${
          isOpen ? 'opacity-100' : 'group-hover:opacity-100'
        } transition-opacity duration-700 animate-pulse`}></div>

        {/* Floating indicator */}
        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
          isOpen ? currentAccent.iconBg.replace('from-', 'bg-').split(' ')[0] : 'bg-gray-400'
        } opacity-60 animate-pulse`}></div>
      </div>
    </div>
  );
};