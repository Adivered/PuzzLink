import { gsap } from 'gsap';

/**
 * Pricing Section Animations - Modular GSAP-only animations
 * Replaces CSS animations with optimized GSAP alternatives
 */

// Animation configuration
const PRICING_CONFIG = {
  content: {
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out"
  },
  header: {
    stagger: 0.05,
    duration: 0.6,
    ease: "power2.out"
  },
  background: {
    icons: {
      duration: 4,
      ease: "sine.inOut"
    },
    shapes: {
      duration: 8,
      ease: "power2.inOut"
    }
  }
};

/**
 * Creates pricing card animations with special popular plan scaling
 */
export const createPricingCardAnimations = (elements) => {
  if (!elements || elements.length === 0) return null;

  return gsap.fromTo(elements, 
    { 
      opacity: 0, 
      y: 30,
      scale: 0.95,
      willChange: 'transform, opacity'
    },
    { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      duration: PRICING_CONFIG.content.duration,
      stagger: PRICING_CONFIG.content.stagger,
      ease: PRICING_CONFIG.content.ease,
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
export const createPricingHeaderAnimations = (elements) => {
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
      duration: PRICING_CONFIG.header.duration,
      stagger: PRICING_CONFIG.header.stagger,
      ease: PRICING_CONFIG.header.ease,
      force3D: true,
      onComplete: () => {
        gsap.set(elements, { willChange: 'auto' });
      }
    }
  );
};

/**
 * Creates background animations for pricing icons and shapes
 */
export const createPricingBackgroundAnimations = (backgroundRefs) => {
  const { priceTagIconRef, checkIconRef, geometricShapeRef } = backgroundRefs;
  const animations = [];

  // Price tag icon bouncing animation (replaces animate-bounce with 4s duration)
  if (priceTagIconRef.current) {
    const priceTagAnim = gsap.to(priceTagIconRef.current, {
      y: -10,
      duration: PRICING_CONFIG.background.icons.duration,
      ease: PRICING_CONFIG.background.icons.ease,
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(priceTagAnim);
  }

  // Check icon pulsing animation (replaces animate-pulse with 6s duration)
  if (checkIconRef.current) {
    const checkAnim = gsap.to(checkIconRef.current, {
      scale: 1.1,
      opacity: 0.8,
      duration: 6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(checkAnim);
  }

  // Geometric shape pulsing animation (replaces animate-pulse with 8s duration)
  if (geometricShapeRef.current) {
    const shapeAnim = gsap.to(geometricShapeRef.current, {
      scale: 1.2,
      opacity: 0.3,
      duration: PRICING_CONFIG.background.shapes.duration,
      ease: PRICING_CONFIG.background.shapes.ease,
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(shapeAnim);
  }

  return animations;
};

/**
 * Creates value proposition badge animations
 */
export const createValueBadgeAnimations = (elements) => {
  if (!elements || elements.length === 0) return null;

  return gsap.fromTo(elements,
    { 
      opacity: 0, 
      scale: 0.8,
      willChange: 'transform, opacity'
    },
    { 
      opacity: 1, 
      scale: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: "back.out(1.7)",
      force3D: true,
      onComplete: () => {
        gsap.set(elements, { willChange: 'auto' });
      }
    }
  );
};

/**
 * Master animation orchestrator for Pricing Section
 */
export const createPricingAnimations = (refs) => {
  const {
    headerElementsRef,
    pricingCardsRef,
    valueBadgesRef,
    backgroundRefs
  } = refs;

  // Content animations
  const headerTl = headerElementsRef.current ? 
    createPricingHeaderAnimations(headerElementsRef.current) : null;
  
  const cardsTl = pricingCardsRef.current ? 
    createPricingCardAnimations(pricingCardsRef.current) : null;

  const badgesTl = valueBadgesRef.current ? 
    createValueBadgeAnimations(valueBadgesRef.current) : null;

  // Background animations
  const backgroundAnims = createPricingBackgroundAnimations(backgroundRefs);

  return {
    timelines: {
      header: headerTl,
      cards: cardsTl,
      badges: badgesTl,
      background: backgroundAnims
    },
    cleanup: () => {
      [headerTl, cardsTl, badgesTl, ...backgroundAnims].forEach(anim => {
        if (anim && typeof anim.kill === 'function') {
          anim.kill();
        }
      });
    }
  };
};

/**
 * Single pricing element animation for scroll triggers
 */
export const animatePricingElement = (element, index = 0) => {
  // Set initial state
  gsap.set(element, { opacity: 0, y: 30, scale: 0.95 });
  
  return gsap.to(element, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: PRICING_CONFIG.content.duration,
    delay: index * PRICING_CONFIG.content.stagger,
    ease: PRICING_CONFIG.content.ease,
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
export const animatePricingHeader = (element, index = 0) => {
  // Set initial state
  gsap.set(element, { opacity: 0, y: 20 });
  
  return gsap.to(element, {
    opacity: 1,
    y: 0,
    duration: PRICING_CONFIG.header.duration,
    delay: index * PRICING_CONFIG.header.stagger,
    ease: PRICING_CONFIG.header.ease,
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