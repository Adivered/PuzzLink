import { gsap } from 'gsap';

/**
 * Testimonials Section Animations - Modular GSAP-only animations
 * Replaces CSS animations with optimized GSAP alternatives
 */

// Animation configuration
const TESTIMONIALS_CONFIG = {
  content: {
    stagger: 0.15,
    duration: 0.5,
    ease: "power2.out"
  },
  header: {
    stagger: 0.05,
    duration: 0.6,
    ease: "power2.out"
  },
  background: {
    orbs: {
      duration: 8,
      ease: "sine.inOut"
    },
    sparkles: {
      duration: 3,
      ease: "power2.out"
    }
  }
};

/**
 * Creates testimonial card animations with floating effect
 */
export const createTestimonialCardAnimations = (elements) => {
  if (!elements || elements.length === 0) return null;

  return gsap.fromTo(elements, 
    { 
      opacity: 0, 
      scale: 0.95,
      y: 20,
      willChange: 'transform, opacity'
    },
    { 
      opacity: 1, 
      scale: 1,
      y: 0,
      duration: TESTIMONIALS_CONFIG.content.duration,
      stagger: TESTIMONIALS_CONFIG.content.stagger,
      ease: TESTIMONIALS_CONFIG.content.ease,
      force3D: true,
      onComplete: () => {
        gsap.set(elements, { willChange: 'auto' });
      }
    }
  );
};

/**
 * Creates section header animations
 */
export const createTestimonialHeaderAnimations = (elements) => {
  if (!elements || elements.length === 0) return null;

  return gsap.fromTo(elements,
    { 
      opacity: 0, 
      y: 20,
      willChange: 'transform, opacity'
    },
    { 
      opacity: 1, 
      y: 0,
      duration: TESTIMONIALS_CONFIG.header.duration,
      stagger: TESTIMONIALS_CONFIG.header.stagger,
      ease: TESTIMONIALS_CONFIG.header.ease,
      force3D: true,
      onComplete: () => {
        gsap.set(elements, { willChange: 'auto' });
      }
    }
  );
};

/**
 * Creates background orb animations (replaces CSS animate-pulse and animate-bounce)
 */
export const createTestimonialBackgroundAnimations = (backgroundRefs) => {
  const { leftOrbRef, rightOrbRef, sparklesRef } = backgroundRefs;
  const animations = [];

  // Left orb pulsing animation (replaces animate-pulse with 8s duration)
  if (leftOrbRef.current) {
    const leftOrbAnim = gsap.to(leftOrbRef.current, {
      scale: 1.1,
      opacity: 0.35,
      duration: TESTIMONIALS_CONFIG.background.orbs.duration,
      ease: TESTIMONIALS_CONFIG.background.orbs.ease,
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(leftOrbAnim);
  }

  // Right orb bouncing animation (replaces animate-bounce with 6s duration)
  if (rightOrbRef.current) {
    const rightOrbAnim = gsap.to(rightOrbRef.current, {
      y: -15,
      scale: 1.15,
      duration: 6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(rightOrbAnim);
  }

  // Sparkle effects (replaces CSS animate-ping with staggered delays)
  if (sparklesRef.current && sparklesRef.current.children) {
    const sparkles = Array.from(sparklesRef.current.children);
    const sparkleAnim = gsap.to(sparkles, {
      scale: 1.5,
      opacity: 0,
      duration: TESTIMONIALS_CONFIG.background.sparkles.duration,
      ease: TESTIMONIALS_CONFIG.background.sparkles.ease,
      repeat: -1,
      stagger: {
        each: 0.5,
        repeat: -1
      },
      force3D: true
    });
    animations.push(sparkleAnim);
  }

  return animations;
};

/**
 * Master animation orchestrator for Testimonials Section
 */
export const createTestimonialsAnimations = (refs) => {
  const {
    headerElementsRef,
    testimonialCardsRef,
    backgroundRefs
  } = refs;

  // Content animations
  const headerTl = headerElementsRef.current ? 
    createTestimonialHeaderAnimations(headerElementsRef.current) : null;
  
  const cardsTl = testimonialCardsRef.current ? 
    createTestimonialCardAnimations(testimonialCardsRef.current) : null;

  // Background animations
  const backgroundAnims = createTestimonialBackgroundAnimations(backgroundRefs);

  return {
    timelines: {
      header: headerTl,
      cards: cardsTl,
      background: backgroundAnims
    },
    cleanup: () => {
      [headerTl, cardsTl, ...backgroundAnims].forEach(anim => {
        if (anim && typeof anim.kill === 'function') {
          anim.kill();
        }
      });
    }
  };
};

/**
 * Single testimonial element animation for scroll triggers
 */
export const animateTestimonialElement = (element, index = 0) => {
  // Set initial state
  gsap.set(element, { opacity: 0, scale: 0.95, y: 20 });
  
  return gsap.to(element, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: TESTIMONIALS_CONFIG.content.duration,
    delay: index * TESTIMONIALS_CONFIG.content.stagger,
    ease: TESTIMONIALS_CONFIG.content.ease,
    force3D: true,
    onStart: () => {
      element.style.willChange = 'transform, opacity';
      element.classList.add('gsap-animated');
    },
    onComplete: () => {
      setTimeout(() => {
        element.style.willChange = 'auto';
      }, 100);
    }
  });
};

/**
 * Single header element animation for scroll triggers
 */
export const animateTestimonialHeader = (element, index = 0) => {
  // Set initial state
  gsap.set(element, { opacity: 0, y: 20 });
  
  return gsap.to(element, {
    opacity: 1,
    y: 0,
    duration: TESTIMONIALS_CONFIG.header.duration,
    delay: index * TESTIMONIALS_CONFIG.header.stagger,
    ease: TESTIMONIALS_CONFIG.header.ease,
    force3D: true,
    onStart: () => {
      element.style.willChange = 'transform, opacity';
      element.classList.add('gsap-animated');
    },
    onComplete: () => {
      setTimeout(() => {
        element.style.willChange = 'auto';
      }, 100);
    }
  });
}; 