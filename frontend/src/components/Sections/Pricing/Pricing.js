import React from 'react';
import { PriceCard } from './PriceCard';
import { pricingData } from './PricingData';

const PricingSection = ({ theme, sectionRef }) => (
  <section id="pricing" ref={sectionRef} className="min-h-screen py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="price-card opacity-0 text-4xl font-bold text-center mb-12">Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingData.map((plan, index) => (
          <PriceCard key={index} plan={plan} theme={theme} />
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;