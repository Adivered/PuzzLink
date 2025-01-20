import React from 'react';
import { TestimonialCard } from './TestimonialCard';
import { testimonialsData } from './testimonialsData';

const TestimonialsSection = ({ theme, sectionRef }) => (
  <section id="testimonials" ref={sectionRef} className={`min-h-screen py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="testimonial opacity-0 text-4xl font-bold text-center mb-12">What Our Users Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonialsData.map((testimonial, index) => (
          <TestimonialCard key={index} testimonial={testimonial} theme={theme} />
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;