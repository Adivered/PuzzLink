import { useEffect, useRef } from 'react';
import {
  createFeaturesAnimations,
  createTestimonialsAnimations,
  createPricingAnimations,
  createFAQAnimations,
  createCTAAnimations
} from '../../animations/sections';

/**
 * Hook for individual sections to use their dedicated external animations
 * @param {string} sectionType - The type of section (features, testimonials, pricing, faq, cta)
 * @param {object} refs - Object containing refs for the section elements
 * @returns {object} Animation controller object
 */
const useSectionAnimation = (sectionType, refs) => {
  const animationController = useRef(null);

  useEffect(() => {
    // Create animations based on section type
    switch (sectionType) {
      case 'features':
        animationController.current = createFeaturesAnimations(refs);
        break;
      case 'testimonials':
        animationController.current = createTestimonialsAnimations(refs);
        break;
      case 'pricing':
        animationController.current = createPricingAnimations(refs);
        break;
      case 'faq':
        animationController.current = createFAQAnimations(refs);
        break;
      case 'cta':
        animationController.current = createCTAAnimations(refs);
        break;
      default:
        console.warn(`Unknown section type: ${sectionType}`);
        return;
    }

    // Cleanup function
    return () => {
      if (animationController.current && animationController.current.cleanup) {
        animationController.current.cleanup();
      }
    };
  }, [sectionType, refs]);

  return animationController.current;
};

export default useSectionAnimation; 