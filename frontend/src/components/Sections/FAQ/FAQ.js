import React from 'react';
import { FAQCard } from './FAQCard';
import { faqData } from './FAQData';

const FAQSection = ({ theme, sectionRef }) => (
  <section id="faq" ref={sectionRef} className={`min-h-screen py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="faq-item opacity-0 text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
      <div className="space-y-8">
        {faqData.map((faq, index) => (
          <FAQCard key={index} faq={faq} theme={theme} />
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;