import { useRef } from 'react';
import useCentralizedScrollAnimations from '../../../hooks/animations/useCentralizedScrollAnimations';
import useHowItWorksAnimation from '../../../hooks/animations/useHowItWorksAnimation';

/**
 * Landing page logic hook following Single Responsibility Principle
 * Manages section references and centralized animation initialization
 */
export const useLandingPageLogic = (gsapManager) => {
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

  // Initialize centralized animations and HowItWorks specific animation
  useCentralizedScrollAnimations(gsapManager);
  useHowItWorksAnimation(howItWorksRef);

  return {
    sectionRefs,
    howItWorksRef,
  };
}; 