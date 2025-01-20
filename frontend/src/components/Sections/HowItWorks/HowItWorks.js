import React from 'react';
import { HowItWorksCard } from './HowItWorksCard';
import { howItWorksData } from './HowItWorksData';

const HowItWorksSection = ({ theme, sectionRef, containerRef }) => (
  <section id="howItWorks" ref={sectionRef} className="min-h-screen py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
      <div ref={containerRef} className="relative overflow-hidden step-1">
        <div className="flex space-x-8">
          {howItWorksData.map((step, index) => (
            <HowItWorksCard key={index} step={step} index={index} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;