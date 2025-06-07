import { useEffect } from 'react';

/**
 * Centralized Scroll Animations Hook
 * Simplified approach to prevent double triggering
 * Works exactly like the original with ScrollTrigger.batch for smooth performance
 */
const useCentralizedScrollAnimations = (gsapManager) => {
  useEffect(() => {
    if (!gsapManager) return;

    // Wait for DOM to be ready
    const initializeScrollAnimations = () => {
      // Use ScrollTrigger.batch for smooth performance like original
      const animationTypes = ['section-header', 'feature', 'testimonial', 'pricing', 'faq', 'cta'];
      
      animationTypes.forEach(animationType => {
        const elements = document.querySelectorAll(`[data-animate="${animationType}"]`);
        if (elements.length === 0) return;

        // Use ScrollTrigger.batch for optimal performance
        gsapManager.ScrollTrigger.batch(elements, {
          onEnter: (elements) => {
            const config = getAnimationConfig(animationType);
            
            // Animate all elements in batch with stagger
            gsapManager.gsap.fromTo(elements,
              config.from,
              {
                ...config.to,
                duration: config.duration,
                stagger: config.stagger,
                ease: config.ease,
                onStart: () => {
                  elements.forEach(el => {
                    el.style.willChange = 'transform, opacity';
                    el.classList.add('gsap-animated');
                  });
                },
                onComplete: () => {
                  setTimeout(() => {
                    elements.forEach(el => {
                      el.style.willChange = 'auto';
                    });
                  }, 100);
                }
              }
            );
          },
          start: "top 85%",
          once: true
        });
      });
    };

    // Initialize with slight delay for proper DOM readiness
    const timeoutId = setTimeout(initializeScrollAnimations, 150);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup is handled by gsapManager
    };
  }, [gsapManager]);
};

// Simplified animation configurations like the original
function getAnimationConfig(animationType) {
  const configs = {
    'section-header': {
      from: { opacity: 0, y: 30 },
      to: { opacity: 1, y: 0 },
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.15
    },
    feature: {
      from: { opacity: 0, y: 50, scale: 0.9 },
      to: { opacity: 1, y: 0, scale: 1 },
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.15
    },
    testimonial: {
      from: { opacity: 0, scale: 0.9, y: 30 },
      to: { opacity: 1, scale: 1, y: 0 },
      duration: 0.7,
      ease: "back.out(1.7)",
      stagger: 0.25
    },
    pricing: {
      from: { opacity: 0, y: 30, scale: 0.95 },
      to: { opacity: 1, y: 0, scale: 1 },
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.15
    },
    faq: {
      from: { opacity: 0, x: -20 },
      to: { opacity: 1, x: 0 },
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.1
    },
    cta: {
      from: { opacity: 0, y: 20 },
      to: { opacity: 1, y: 0 },
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.1
    }
  };

  return configs[animationType] || configs.feature;
}

export default useCentralizedScrollAnimations; 