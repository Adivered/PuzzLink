import { gsap } from 'gsap';

// Performance-optimized animation utilities
const defaultConfig = {
  ease: "power2.out", // Smooth, natural easing
};

export const fadeOut = (elements, options = {}) => {
  return gsap.to(elements, {
    opacity: 0,
    duration: options.duration || 0.6, // Slightly faster for better UX
    stagger: options.stagger || 0.1,   // Reduced stagger for quicker completion
    ease: options.ease || defaultConfig.ease,
    onComplete: options.onComplete
  });
}

export const fadeInUp = (elements, options = {}) => {
  const {
    stagger = 0.1,
    duration = 0.6,
    distance = 30,
    ease = "power2.out"
  } = options;

  return gsap.fromTo(elements,
    { 
      opacity: 0, 
      y: distance,
      willChange: 'transform, opacity'
    },
    { 
      opacity: 1, 
      y: 0, 
      duration,
      stagger,
      ease,
      onComplete: () => {
        // Clean up will-change for performance
        gsap.set(elements, { willChange: 'auto' });
      }
    }
  );
};

export const fadeInScale = (elements, options = {}) => {
  const {
    stagger = 0.15,
    duration = 0.5,
    scale = 0.95,
    ease = "power2.out"
  } = options;

  return gsap.fromTo(elements,
    { 
      opacity: 0, 
      scale,
      willChange: 'transform, opacity'
    },
    { 
      opacity: 1, 
      scale: 1, 
      duration,
      stagger,
      ease,
      onComplete: () => {
        // Clean up will-change for performance
        gsap.set(elements, { willChange: 'auto' });
      }
    }
  );
};

// Optimized slide in animation
export const slideIn = (elements, options = {}) => {
  const {
    stagger = 0.08,
    duration = 0.5,
    distance = 20,
    direction = 'left',
    ease = "power2.out"
  } = options;

  const fromProps = { 
    opacity: 0,
    willChange: 'transform, opacity'
  };
  const toProps = { 
    opacity: 1,
    duration,
    stagger,
    ease,
    onComplete: () => {
      gsap.set(elements, { willChange: 'auto' });
    }
  };

  // Set direction
  if (direction === 'left') {
    fromProps.x = -distance;
    toProps.x = 0;
  } else if (direction === 'right') {
    fromProps.x = distance;
    toProps.x = 0;
  } else if (direction === 'up') {
    fromProps.y = distance;
    toProps.y = 0;
  } else if (direction === 'down') {
    fromProps.y = -distance;
    toProps.y = 0;
  }

  return gsap.fromTo(elements, fromProps, toProps);
};

// New: Batch animation utility for better performance
export const batchAnimate = (animations) => {
  const timeline = gsap.timeline();
  animations.forEach(({ elements, type, options = {} }) => {
    switch (type) {
      case 'fadeOut':
        timeline.add(fadeOut(elements, options), options.delay || 0);
        break;
      case 'fadeInUp':
        timeline.add(fadeInUp(elements, options), options.delay || 0);
        break;
      case 'fadeInScale':
        timeline.add(fadeInScale(elements, options), options.delay || 0);
        break;
      case 'slideIn':
        timeline.add(slideIn(elements, options), options.delay || 0);
        break;
      default:
        console.warn(`Unknown animation type: ${type}`);
        break;
    }
  });
  return timeline;
};

// Performance monitoring (development only)
export const createPerformantAnimation = (animationFn, elements, options = {}) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const animation = animationFn(elements, options);
    animation.then(() => {
      const end = performance.now();
      if (end - start > 100) { // Warn if animation setup takes > 100ms
        console.warn(`Animation took ${end - start}ms to setup`);
      }
    });
    return animation;
  }
  return animationFn(elements, options);
};