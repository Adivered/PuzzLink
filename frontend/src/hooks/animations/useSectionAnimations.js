import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useIsomorphicLayoutEffect from '../useIsomorphicLayoutEffect';

// Import animation functions from external files
import {
  animateFeatureElement, animateFeatureHeader,
  animateTestimonialElement, animateTestimonialHeader,
  animatePricingElement, animatePricingHeader,
  animateFAQElement, animateFAQHeader,
  animateCTAElement, animateCTAHeader
} from '../../animations/sections';

const useSectionAnimations = () => {
  useIsomorphicLayoutEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Performance optimizations
    gsap.config({ 
      force3D: true,
      autoSleep: 60,
      nullTargetWarn: false
    });

    // Animation mapping using external animation functions
    const animationMapping = {
      'feature': animateFeatureElement,
      'testimonial': animateTestimonialElement,
      'pricing': animatePricingElement,
      'faq': animateFAQElement,
      'cta': animateCTAElement,
      'section-header': (element, index) => {
        // Determine which header animation to use based on parent section
        const section = element.closest('section');
        if (!section) return animateFeatureHeader(element, index);
        
        const sectionId = section.id;
        switch (sectionId) {
          case 'features':
            return animateFeatureHeader(element, index);
          case 'testimonials':
            return animateTestimonialHeader(element, index);
          case 'pricing':
            return animatePricingHeader(element, index);
          case 'faq':
            return animateFAQHeader(element, index);
          case 'cta':
            return animateCTAHeader(element, index);
          default:
            return animateFeatureHeader(element, index);
        }
      }
    };

    // Create scroll triggers for each animation type
    const triggers = [];
    
    // Create a single function to handle all animations
    const createTriggers = () => {
      Object.keys(animationMapping).forEach(animationType => {
        const selector = `[data-animate="${animationType}"]`;
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) return;

        // Create individual triggers for better reliability
        elements.forEach((element, index) => {
          const trigger = ScrollTrigger.create({
            trigger: element,
            start: "top bottom-=100px",
            once: true,
            onEnter: () => {
              // Use the appropriate animation function from external files
              const animationFunction = animationMapping[animationType];
              animationFunction(element, index);
            }
          });
          triggers.push(trigger);
        });
      });
    };

    // Create triggers after a short delay to ensure DOM is ready
    setTimeout(createTriggers, 100);

    // Also create triggers immediately in case elements are already available
    createTriggers();

    // Cleanup function - more thorough cleanup
    return () => {
      // Kill all triggers
      triggers.forEach(trigger => {
        if (trigger && typeof trigger.kill === 'function') {
          trigger.kill();
        }
      });
      
      // Kill all ScrollTriggers
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      // Reset will-change on all animated elements
      Object.keys(animationMapping).forEach(animationType => {
        const selector = `[data-animate="${animationType}"]`;
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.style.willChange = 'auto');
      });
      
      // Clear any remaining GSAP tweens
      gsap.killTweensOf("*");
    };
  }, []);
};

export default useSectionAnimations;