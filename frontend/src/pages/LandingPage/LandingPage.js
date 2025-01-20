import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

import useHowItWorksAnimation from '../../hooks/animations/useHowItWorksAnimation';
import useSectionAnimations from '../../hooks/animations/useSectionAnimations';

import HeroSection from '../../components/Sections/Hero/Hero';
import FeaturesSection from '../../components/Sections/Features/Features';
import HowItWorksSection from '../../components/Sections/HowItWorks/HowItWorks';
import PricingSection from '../../components/Sections/Pricing/Pricing';
import TestimonialsSection from '../../components/Sections/Testimonials/Testimonials';
import FAQSection from '../../components/Sections/FAQ/FAQ';
import CTASection from '../../components/Sections/CTA/CTA';

const LandingPage = () => {
  const theme = useSelector((state) => state.theme.current);
  const howItWorksRef = useRef(null);

  const sectionRefs = {
    hero: useRef(null),
    features: useRef(null),
    howItWorks: useRef(null),
    testimonials: useRef(null),
    pricing: useRef(null),
    faq: useRef(null),
    cta: useRef(null),
  };

  useHowItWorksAnimation(howItWorksRef);
  useSectionAnimations();

  return (
    <div className={
      `min-h-screen 
      ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
      transition-colors duration-300`}>

      <HeroSection theme={theme} sectionRef={sectionRefs.hero} />
      <FeaturesSection theme={theme} sectionRef={sectionRefs.features} />
      <HowItWorksSection theme={theme} sectionRef={sectionRefs.howItWorks} containerRef={howItWorksRef} />
      <TestimonialsSection theme={theme} sectionRef={sectionRefs.testimonials} />
      <PricingSection theme={theme} sectionRef={sectionRefs.pricing} />
      <FAQSection theme={theme} sectionRef={sectionRefs.faq} />
      <CTASection sectionRef={sectionRefs.cta} />
    </div>
  );
};

export default LandingPage;