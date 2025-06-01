import React from 'react';
import { FAQCard } from './FAQCard';
import { faqData } from './FAQData';

const FAQSection = ({ theme, sectionRef }) => (
  <section 
    id="faq" 
    ref={sectionRef} 
    className={`relative min-h-screen py-24 overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-tr from-slate-900 via-gray-900 to-zinc-900' 
        : 'bg-gradient-to-tr from-slate-50 via-gray-50 to-zinc-50'
    }`}
  >
    {/* Animated Background Elements */}
    <div className="absolute inset-0">
      {/* Question mark icons floating */}
      <div className="absolute top-32 left-16 opacity-10">
        <svg className={`w-24 h-24 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} animate-bounce`} 
             style={{ animationDuration: '5s' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
        </svg>
      </div>

      <div className="absolute bottom-24 right-20 opacity-15">
        <svg className={`w-16 h-16 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'} animate-pulse`} 
             style={{ animationDuration: '3s' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>

      {/* Geometric patterns */}
      <div className="absolute top-1/4 right-1/4">
        <div className={`w-40 h-40 ${
          theme === 'dark' ? 'bg-gradient-to-br from-blue-400/10 to-purple-400/10' : 'bg-gradient-to-br from-blue-300/20 to-purple-300/20'
        } rounded-full animate-spin`} style={{ animationDuration: '25s' }}></div>
      </div>

      <div className="absolute bottom-1/3 left-1/3">
        <div className={`w-28 h-28 ${
          theme === 'dark' ? 'bg-gradient-to-br from-green-400/15 to-teal-400/15' : 'bg-gradient-to-br from-green-300/25 to-teal-300/25'
        } transform rotate-45 animate-pulse`} style={{ animationDuration: '7s' }}></div>
      </div>

      {/* Help bubble pattern */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${
              theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-500'
            } rounded-full animate-ping opacity-20`}
            style={{
              top: `${Math.sin(i * 60 * Math.PI / 180) * 60 + 60}px`,
              left: `${Math.cos(i * 60 * Math.PI / 180) * 60 + 60}px`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: '4s'
            }}
          ></div>
        ))}
      </div>
    </div>

    <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-20">
        <h2 
          data-animate="section-header"
          className={`text-5xl md:text-6xl font-black mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          <span className="block">Got</span>
          <span className={`block bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-blue-400 via-cyan-400 to-teal-400' 
              : 'from-blue-500 via-cyan-500 to-teal-500'
          } bg-clip-text text-transparent`}>
            Questions?
          </span>
        </h2>
        <p 
          data-animate="section-header"
          className={`text-xl md:text-2xl max-w-3xl mx-auto mb-12 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Find answers to common questions about PuzzLink and get started quickly
        </p>
      </div>

      {/* FAQ Items */}
      <div className="space-y-6 mb-16">
        {faqData.map((faq, index) => (
          <div 
            key={index}
            data-animate="faq"
            className="opacity-0"
          >
            <FAQCard faq={faq} theme={theme} index={index} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;