import React from 'react';
import { TestimonialCard } from './TestimonialCard';
import { testimonialsData } from './testimonialsData';

const TestimonialsSection = ({ theme, sectionRef }) => (
  <section 
    id="testimonials" 
    ref={sectionRef} 
    className={`relative min-h-screen py-24 overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900' 
        : 'bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50'
    }`}
  >
    {/* Animated Background Elements */}
    <div className="absolute inset-0">
      {/* Large quote background */}
      <div className={`absolute top-20 left-20 text-9xl opacity-5 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      } font-serif`}>
        "
      </div>
      <div className={`absolute bottom-20 right-20 text-9xl opacity-5 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      } font-serif rotate-180`}>
        "
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-1/4">
        <div className={`w-40 h-40 rounded-full opacity-10 ${
          theme === 'dark' ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-gradient-to-br from-cyan-300 to-blue-400'
        } animate-pulse`} style={{ animationDuration: '8s' }}></div>
      </div>
      
      <div className="absolute bottom-1/3 right-1/3">
        <div className={`w-32 h-32 rounded-full opacity-15 ${
          theme === 'dark' ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gradient-to-br from-purple-300 to-pink-400'
        } animate-bounce`} style={{ animationDuration: '6s' }}></div>
      </div>

      {/* Subtle star pattern */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 ${
              theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500'
            } rounded-full animate-ping`}
            style={{
              top: `${Math.sin(i * 72 * Math.PI / 180) * 50 + 50}px`,
              left: `${Math.cos(i * 72 * Math.PI / 180) * 50 + 50}px`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '3s'
            }}
          ></div>
        ))}
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
          <span className="block">Success</span>
          <span className={`block bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-yellow-400 via-orange-400 to-red-400' 
              : 'from-yellow-500 via-orange-500 to-red-500'
          } bg-clip-text text-transparent`}>
            Stories
          </span>
        </h2>
        <p 
          data-animate="section-header"
          className={`text-xl md:text-2xl max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Hear from puzzle enthusiasts who've transformed their gaming experience with PuzzLink
        </p>
      </div>

      {/* Testimonials Grid with Floating Effect */}
      <div className="relative">
        {/* Central connecting lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-px h-64 ${
            theme === 'dark' ? 'bg-gradient-to-b from-transparent via-gray-600 to-transparent' : 'bg-gradient-to-b from-transparent via-gray-400 to-transparent'
          } opacity-30`}></div>
          <div className={`absolute w-64 h-px ${
            theme === 'dark' ? 'bg-gradient-to-r from-transparent via-gray-600 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-400 to-transparent'
          } opacity-30`}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {testimonialsData.map((testimonial, index) => (
            <div 
              key={index}
              data-animate="testimonial"
              className="opacity-0"
              style={{ 
                transform: `translateY(${index % 2 === 0 ? '20px' : '-20px'})`,
                zIndex: testimonialsData.length - index
              }}
            >
              <TestimonialCard testimonial={testimonial} theme={theme} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;