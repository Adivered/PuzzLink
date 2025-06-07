import { gsap } from 'gsap';

/**
 * Features Section Animations - Enhanced Landing Page Animations
 * Puzzle-piece inspired animations for a collaborative platform
 */

// Enhanced animation configuration for landing page
const FEATURES_CONFIG = {
  content: {
    stagger: 0.15,
    duration: 0.8,
    ease: "back.out(1.7)"
  },
  header: {
    stagger: 0.08,
    duration: 0.7,
    ease: "power3.out"
  },
  background: {
    shapes: {
      duration: 6,
      ease: "sine.inOut"
    }
  },
  hover: {
    duration: 0.3,
    ease: "power2.out"
  },
  puzzle: {
    duration: 1.2,
    ease: "elastic.out(1, 0.75)"
  }
};

/**
 * Creates stunning puzzle-piece inspired entrance animations for feature cards
 * Each card slides in from a different direction like puzzle pieces coming together
 */
export const createFeatureCardAnimations = (elements) => {
  if (!elements || elements.length === 0) return null;

  const tl = gsap.timeline();
  
  elements.forEach((element, index) => {
    // Different entrance directions for puzzle-piece effect
    const directions = [
      { x: -100, y: 50, rotation: -15 },    // From bottom-left
      { x: 0, y: -80, rotation: 5 },        // From top
      { x: 100, y: 50, rotation: 15 },      // From bottom-right
      { x: -80, y: 0, rotation: -10 },      // From left
      { x: 80, y: 0, rotation: 10 },        // From right
      { x: 0, y: 100, rotation: -5 }        // From bottom
    ];
    
    const direction = directions[index % directions.length];
    
    // Set initial state
    gsap.set(element, {
      opacity: 0,
      x: direction.x,
      y: direction.y,
      rotation: direction.rotation,
      scale: 0.8,
      willChange: 'transform, opacity'
    });

    // Create entrance animation
    tl.to(element, {
      opacity: 1,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: FEATURES_CONFIG.content.duration,
      ease: FEATURES_CONFIG.content.ease,
      force3D: true,
      onStart: () => {
        element.classList.add('gsap-animated');
      },
      onComplete: () => {
        gsap.set(element, { willChange: 'auto' });
        // Add subtle hover animation
        createFeatureHoverEffect(element);
      }
    }, index * FEATURES_CONFIG.content.stagger);
  });

  return tl;
};

/**
 * Creates subtle hover effects for feature cards
 */
export const createFeatureHoverEffect = (element) => {
  if (!element) return;

  const card = element;
  
  // Mouse enter animation
  const handleMouseEnter = () => {
    gsap.to(card, {
      scale: 1.05,
      y: -10,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      duration: FEATURES_CONFIG.hover.duration,
      ease: FEATURES_CONFIG.hover.ease
    });
  };

  // Mouse leave animation
  const handleMouseLeave = () => {
    gsap.to(card, {
      scale: 1,
      y: 0,
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      duration: FEATURES_CONFIG.hover.duration,
      ease: FEATURES_CONFIG.hover.ease
    });
  };

  // Add event listeners
  card.addEventListener('mouseenter', handleMouseEnter);
  card.addEventListener('mouseleave', handleMouseLeave);

  // Return cleanup function
  return () => {
    card.removeEventListener('mouseenter', handleMouseEnter);
    card.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * Creates section header animations
 */
export const createFeatureHeaderAnimations = (elements) => {
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
      duration: FEATURES_CONFIG.header.duration,
      stagger: FEATURES_CONFIG.header.stagger,
      ease: FEATURES_CONFIG.header.ease,
      force3D: true,
      onComplete: () => {
        gsap.set(elements, { willChange: 'auto' });
      }
    }
  );
};

/**
 * Creates enhanced puzzle-themed background animations
 */
export const createFeatureBackgroundAnimations = (shapeRefs) => {
  const { squareRef, circleRef, diamondRef } = shapeRefs;
  const animations = [];

  // Gentle rotating puzzle piece animation
  if (squareRef.current) {
    const squareAnim = gsap.to(squareRef.current, {
      rotation: 360,
      duration: FEATURES_CONFIG.background.shapes.duration * 4,
      ease: "none",
      repeat: -1,
      force3D: true
    });
    animations.push(squareAnim);
  }

  // Breathing circle animation (like connectivity pulse)
  if (circleRef.current) {
    const circleAnim = gsap.to(circleRef.current, {
      scale: 1.3,
      opacity: 0.15,
      duration: FEATURES_CONFIG.background.shapes.duration,
      ease: FEATURES_CONFIG.background.shapes.ease,
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(circleAnim);
  }

  // Floating puzzle piece animation
  if (diamondRef.current) {
    const diamondAnim = gsap.to(diamondRef.current, {
      y: -20,
      x: 10,
      rotation: 25,
      duration: FEATURES_CONFIG.background.shapes.duration * 1.5,
      ease: FEATURES_CONFIG.background.shapes.ease,
      yoyo: true,
      repeat: -1,
      force3D: true
    });
    animations.push(diamondAnim);
  }

  return animations;
};

/**
 * Creates a "puzzle pieces connecting" animation for when all features are visible
 */
export const createPuzzleConnectionAnimation = (elements) => {
  if (!elements || elements.length === 0) return null;

  const tl = gsap.timeline({ paused: true });
  
  // Brief "magnetize" effect - all pieces slightly move toward center
  tl.to(elements, {
    scale: 1.02,
    duration: 0.4,
    ease: "power2.inOut",
    stagger: 0.05
  })
  .to(elements, {
    scale: 1,
    duration: 0.3,
    ease: "back.out(1.7)",
    stagger: 0.05
  }, "-=0.2");

  return tl;
};

/**
 * Master animation orchestrator for Features Section
 */
export const createFeaturesAnimations = (refs) => {
  const {
    headerElementsRef,
    featureCardsRef,
    backgroundShapeRefs
  } = refs;

  // Content animations
  const headerTl = headerElementsRef.current ? 
    createFeatureHeaderAnimations(headerElementsRef.current) : null;
  
  const cardsTl = featureCardsRef.current ? 
    createFeatureCardAnimations(featureCardsRef.current) : null;

  // Background animations
  const backgroundAnims = createFeatureBackgroundAnimations(backgroundShapeRefs);

  return {
    timelines: {
      header: headerTl,
      cards: cardsTl,
      background: backgroundAnims
    },
    cleanup: () => {
      // Kill all timelines and animations
      [headerTl, cardsTl, ...backgroundAnims].forEach(anim => {
        if (anim && typeof anim.kill === 'function') {
          anim.kill();
        }
      });
    }
  };
};

/**
 * Improved feature element animation - smooth and professional
 */
export const animateFeatureElement = (element, index = 0) => {
  // Set initial state - simple and clean
  gsap.set(element, { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  });
  
  const animation = gsap.to(element, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.8,
    delay: index * 0.15,
    ease: "power3.out",
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

  return animation;
};

/**
 * Single header element animation for scroll triggers
 */
export const animateFeatureHeader = (element, index = 0) => {
  // Set initial state
  gsap.set(element, { opacity: 0, y: 20 });
  
  return gsap.to(element, {
    opacity: 1,
    y: 0,
    duration: FEATURES_CONFIG.header.duration,
    delay: index * FEATURES_CONFIG.header.stagger,
    ease: FEATURES_CONFIG.header.ease,
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
