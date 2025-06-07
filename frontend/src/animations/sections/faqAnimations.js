import { gsap } from 'gsap';

/**
 * FAQ Section Animations - Modular GSAP-only animations
 * Replaces CSS animations with optimized GSAP alternatives
 */

// Animation configuration
const FAQ_CONFIG = {
  content: {
    stagger: 0.08,
    duration: 0.5,
    ease: "power2.out"
  },
  header: {
    stagger: 0.05,
    duration: 0.6,
    ease: "power2.out"
  },
  background: {
    icons: {
      duration: 5,
      ease: "sine.inOut"
    },
    shapes: {
      duration: 7,
      ease: "power2.inOut"
    }
  }
};

/**
 * Creates FAQ item animations with slide-in effect
 */
export const createFAQItemAnimations = (elements) => {
  if (!elements || elements.length === 0) return null;

  return gsap.fromTo(elements, 
    { 
      opacity: 0, 
      x: -20,
      willChange: 'transform, opacity'
    },
    { 
      opacity: 1, 
      x: 0,
      duration: FAQ_CONFIG.content.duration,
      stagger: FAQ_CONFIG.content.stagger,
      ease: FAQ_CONFIG.content.ease,
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
export const createFAQHeaderAnimations = (elements) => {
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
      duration: FAQ_CONFIG.header.duration,
      stagger: FAQ_CONFIG.header.stagger,
      ease: FAQ_CONFIG.header.ease,
      force3D: true,
      onComplete: () => {
        gsap.set(elements, { willChange: 'auto' });
      }
    }
  );
};

/**
 * Creates background animations for FAQ icons and shapes
 */
export const createFAQBackgroundAnimations = (backgroundRefs) => {
  const { questionIconRef, starIconRef, geometricShapeRef, lightBulbRef } = backgroundRefs;
  const animations = [];

  // Question mark icon bouncing animation (replaces animate-bounce with 5s duration)
  if (questionIconRef.current) {
    const questionAnim = gsap.to(questionIconRef.current, {
      y: -12,
      rotation: 5,
      duration: FAQ_CONFIG.background.icons.duration,
      ease: FAQ_CONFIG.background.icons.ease,
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(questionAnim);
  }

  // Star icon pulsing animation (replaces animate-pulse with 3s duration)
  if (starIconRef.current) {
    const starAnim = gsap.to(starIconRef.current, {
      scale: 1.2,
      opacity: 0.8,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(starAnim);
  }

  // Geometric shape pulsing animation (replaces animate-pulse with 7s duration)
  if (geometricShapeRef.current) {
    const shapeAnim = gsap.to(geometricShapeRef.current, {
      scale: 1.1,
      rotation: 45,
      duration: FAQ_CONFIG.background.shapes.duration,
      ease: FAQ_CONFIG.background.shapes.ease,
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(shapeAnim);
  }

  // Light bulb ping animation (replaces animate-ping)
  if (lightBulbRef.current) {
    const lightBulbAnim = gsap.to(lightBulbRef.current, {
      scale: 1.3,
      opacity: 0,
      duration: 2,
      ease: "power2.out",
      repeat: -1,
      force3D: true
    });
    animations.push(lightBulbAnim);
  }

  return animations;
};

/**
 * Creates FAQ accordion toggle animations
 */
export const createFAQToggleAnimation = (element, isOpen) => {
  if (!element) return null;

  const content = element.querySelector('.faq-content');
  const icon = element.querySelector('.faq-icon');

  const tl = gsap.timeline();

  if (isOpen) {
    // Opening animation
    tl.to(icon, {
      rotation: 45,
      duration: 0.3,
      ease: "power2.out"
    })
    .fromTo(content, 
      { height: 0, opacity: 0 },
      { 
        height: 'auto', 
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      },
      "-=0.1"
    );
  } else {
    // Closing animation
    tl.to(content, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    })
    .to(icon, {
      rotation: 0,
      duration: 0.2,
      ease: "power2.out"
    }, "-=0.1");
  }

  return tl;
};

/**
 * Master animation orchestrator for FAQ Section
 */
export const createFAQAnimations = (refs) => {
  const {
    headerElementsRef,
    faqItemsRef,
    backgroundRefs
  } = refs;

  // Content animations
  const headerTl = headerElementsRef.current ? 
    createFAQHeaderAnimations(headerElementsRef.current) : null;
  
  const itemsTl = faqItemsRef.current ? 
    createFAQItemAnimations(faqItemsRef.current) : null;

  // Background animations
  const backgroundAnims = createFAQBackgroundAnimations(backgroundRefs);

  return {
    timelines: {
      header: headerTl,
      items: itemsTl,
      background: backgroundAnims
    },
    actions: {
      toggleFAQ: (element, isOpen) => createFAQToggleAnimation(element, isOpen)
    },
    cleanup: () => {
      [headerTl, itemsTl, ...backgroundAnims].forEach(anim => {
        if (anim && typeof anim.kill === 'function') {
          anim.kill();
        }
      });
    }
  };
};

/**
 * Single FAQ element animation for scroll triggers
 */
export const animateFAQElement = (element, index = 0) => {
  // Set initial state
  gsap.set(element, { opacity: 0, x: -20 });
  
  return gsap.to(element, {
    opacity: 1,
    x: 0,
    duration: FAQ_CONFIG.content.duration,
    delay: index * FAQ_CONFIG.content.stagger,
    ease: FAQ_CONFIG.content.ease,
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
export const animateFAQHeader = (element, index = 0) => {
  // Set initial state
  gsap.set(element, { opacity: 0, y: 20 });
  
  return gsap.to(element, {
    opacity: 1,
    y: 0,
    duration: FAQ_CONFIG.header.duration,
    delay: index * FAQ_CONFIG.header.stagger,
    ease: FAQ_CONFIG.header.ease,
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