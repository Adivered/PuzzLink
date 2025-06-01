import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CTASection = ({ sectionRef }) => {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.current);

  return (
    <section 
      id="cta" 
      ref={sectionRef} 
      className={`relative min-h-screen py-24 overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900' 
          : 'bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50'
      }`}
    >
      {/* Epic Background Elements */}
      <div className="absolute inset-0">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 opacity-20">
          <div className={`w-full h-full rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-pink-400 to-violet-600' 
              : 'bg-gradient-to-br from-pink-300 to-violet-500'
          } animate-pulse blur-3xl`} style={{ animationDuration: '8s' }}></div>
        </div>
        
        <div className="absolute -bottom-40 -right-40 w-80 h-80 opacity-20">
          <div className={`w-full h-full rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-cyan-400 to-blue-600' 
              : 'bg-gradient-to-br from-cyan-300 to-blue-500'
          } animate-pulse blur-3xl`} style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
        </div>

        {/* Floating puzzle pieces */}
        <div className="absolute top-20 left-1/4 opacity-15">
          <div className={`w-16 h-16 ${
            theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500'
          } transform rotate-45 animate-bounce rounded-lg`} style={{ animationDuration: '4s' }}></div>
        </div>
        
        <div className="absolute bottom-32 right-1/4 opacity-15">
          <div className={`w-12 h-12 ${
            theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
          } rounded-full animate-ping`} style={{ animationDuration: '3s' }}></div>
        </div>

        {/* Sparkle effects */}
        <div className="absolute top-1/3 right-1/3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 ${
                theme === 'dark' ? 'bg-white' : 'bg-gray-900'
              } rounded-full animate-ping`}
              style={{
                top: `${Math.sin(i * 45 * Math.PI / 180) * 40 + 40}px`,
                left: `${Math.cos(i * 45 * Math.PI / 180) * 40 + 40}px`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main CTA Content */}
        <div className="mb-16">
          <h2 
            data-animate="cta"
            className={`text-6xl md:text-7xl lg:text-8xl font-black mb-8 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            <span className="block">Ready to</span>
            <span className={`block bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-pink-400 via-purple-400 to-cyan-400' 
                : 'from-pink-500 via-purple-500 to-cyan-500'
            } bg-clip-text text-transparent`}>
              Puzzle?
            </span>
          </h2>
          
          <p 
            data-animate="cta"
            className={`text-2xl md:text-3xl max-w-4xl mx-auto mb-12 leading-relaxed ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Experience the ultimate collaborative puzzle-solving adventure and connect with fellow puzzle enthusiasts
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/signup')}
              data-animate="cta"
              className={`group relative px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-gradient-to-r from-pink-600 to-violet-700 hover:from-pink-500 hover:to-violet-600 text-white shadow-lg shadow-pink-500/25'
              }`}
            >
              <span className="relative z-10 flex items-center">
                Start Your Journey
                <svg className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400/20 to-violet-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            </button>
          </div>
        </div>

        {/* Final flourish */}
        <div 
          data-animate="cta"
          className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
        >
          <span className="inline-flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-400 mr-3 animate-pulse"></span>
            Free to start • Join in 30 seconds
          </span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;