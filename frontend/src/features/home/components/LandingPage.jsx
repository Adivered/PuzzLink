import React, { useMemo } from 'react';

// Feature Components
import { HeroSection } from '../sections/HeroSection';
import { FeaturesSection } from '../sections/FeaturesSection';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { PricingSection } from '../sections/PricingSection';
import { FAQSection } from '../sections/FAQSection';
import { CTASection } from '../sections/CTASection';

// Feature Hooks
import { useLandingPageLogic } from '../hooks/useLandingPageLogic';
import { useThemeManager } from '../../../shared/hooks/useThemeManager';
import { useGSAPManager } from '../../../hooks/animations/useGSAPManager';

/**
 * Landing Page component following Single Responsibility Principle
 * Orchestrates the display of landing page sections with proper animations and theme prop drilling
 */
export const LandingPage = () => {
  const { theme } = useThemeManager();
  
  // Centralized GSAP manager - memoized to prevent re-creation and double animations
  const gsapManager = useGSAPManager();
  
  // Memoize gsapManager to ensure stable reference across renders
  const stableGsapManager = useMemo(() => gsapManager, [gsapManager]);
  
  const { sectionRefs, howItWorksRef } = useLandingPageLogic(stableGsapManager);

  const containerClasses = `min-h-screen transition-colors duration-300 ${
    theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
  }`;

  return (
    <div className={containerClasses}>
      <HeroSection 
        theme={theme} 
        sectionRef={sectionRefs.hero} 
        gsapManager={stableGsapManager}
      />
      <FeaturesSection 
        theme={theme} 
        sectionRef={sectionRefs.features}
        gsapManager={stableGsapManager}
      />
      <HowItWorksSection 
        theme={theme}
        sectionRef={sectionRefs.howItWorks} 
        containerRef={howItWorksRef}
        gsapManager={stableGsapManager}
      />
      <TestimonialsSection 
        theme={theme} 
        sectionRef={sectionRefs.testimonials}
        gsapManager={stableGsapManager}
      />
      <PricingSection 
        theme={theme} 
        sectionRef={sectionRefs.pricing}
        gsapManager={stableGsapManager}
      />
      <FAQSection 
        theme={theme} 
        sectionRef={sectionRefs.faq}
        gsapManager={stableGsapManager}
      />
      <CTASection 
        theme={theme} 
        sectionRef={sectionRefs.cta}
        gsapManager={stableGsapManager}
      />
    </div>
  );
}; 