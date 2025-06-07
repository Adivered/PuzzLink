import { gsap } from 'gsap';

/**
 * CTA Section Animations - Modular GSAP-only animations
 * Replaces all CSS animations with optimized GSAP alternatives
 */

// Animation configuration
const CTA_CONFIG = {
  orbs: {
    duration: 8,
    ease: "sine.inOut"
  },
  sparkles: {
    duration: 2,
    ease: "power2.inOut"
  },
  floating: {
    duration: 4,
    ease: "sine.inOut"
  },
  ping: {
    duration: 3,
    ease: "power2.out"
  },
  content: {
    stagger: 0.3,
    duration: 0.8
  }
};

/**
 * Creates animated background orbs (replaces CSS animate-pulse)
 */
export const createBackgroundOrbs = (leftOrbRef, rightOrbRef) => {
  const tl = gsap.timeline({ repeat: -1 });

  // Left orb animation (replaces animate-pulse with 8s duration)
  if (leftOrbRef.current) {
    tl.to(leftOrbRef.current, {
      scale: 1.1,
      opacity: 0.3,
      duration: CTA_CONFIG.orbs.duration / 2,
      ease: CTA_CONFIG.orbs.ease
    })
    .to(leftOrbRef.current, {
      scale: 1,
      opacity: 0.2,
      duration: CTA_CONFIG.orbs.duration / 2,
      ease: CTA_CONFIG.orbs.ease
    });
  }

  // Right orb animation (replaces animate-pulse with 6s duration + 2s delay)
  if (rightOrbRef.current) {
    gsap.to(rightOrbRef.current, {
      scale: 1.15,
      opacity: 0.35,
      duration: 6,
      ease: CTA_CONFIG.orbs.ease,
      yoyo: true,
      repeat: -1,
      delay: 2,
      force3D: true
    });
  }

  return tl;
};

/**
 * Creates floating puzzle pieces (replaces CSS animate-bounce and animate-ping)
 */
export const createFloatingPieces = (leftPieceRef, rightPieceRef) => {
  // Left piece - floating bounce (replaces animate-bounce with 4s duration)
  if (leftPieceRef.current) {
    gsap.to(leftPieceRef.current, {
      y: -15,
      rotation: 50, // Enhanced rotation instead of just 45deg
      duration: CTA_CONFIG.floating.duration,
      ease: CTA_CONFIG.floating.ease,
      yoyo: true,
      repeat: -1,
      force3D: true
    });
  }

  // Right piece - ping effect (replaces animate-ping with 3s duration)
  if (rightPieceRef.current) {
    gsap.to(rightPieceRef.current, {
      scale: 1.3,
      opacity: 0,
      duration: CTA_CONFIG.ping.duration,
      ease: CTA_CONFIG.ping.ease,
      repeat: -1,
      force3D: true
    });
  }
};

/**
 * Creates sparkle effects (replaces CSS animate-ping with staggered delays)
 */
export const createSparkleEffects = (sparkleContainerRef) => {
  if (!sparkleContainerRef.current) return null;

  const sparkles = sparkleContainerRef.current.children;
  
  return gsap.to(sparkles, {
    scale: 1.5,
    opacity: 0,
    duration: CTA_CONFIG.sparkles.duration,
    ease: CTA_CONFIG.sparkles.ease,
    repeat: -1,
    stagger: {
      each: 0.3, // Replaces the i * 0.3s delay pattern
      repeat: -1
    },
    force3D: true
  });
};

/**
 * Creates content entrance animations
 */
export const createContentAnimations = (titleRef, subtitleRef, buttonRef, statusRef) => {
  const tl = gsap.timeline();

  // Title entrance
  if (titleRef.current) {
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 50, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: CTA_CONFIG.content.duration, 
        ease: "power3.out" 
      }
    );
  }

  // Subtitle entrance
  if (subtitleRef.current) {
    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: CTA_CONFIG.content.duration, 
        ease: "power2.out" 
      },
      `-=${CTA_CONFIG.content.stagger}`
    );
  }

  // Button entrance with enhanced floating
  if (buttonRef.current) {
    tl.fromTo(buttonRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: CTA_CONFIG.content.duration, 
        ease: "back.out(1.7)" 
      },
      `-=${CTA_CONFIG.content.stagger}`
    )
    // Add continuous floating to button
    .to(buttonRef.current, {
      y: -5,
      duration: 2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      force3D: true
    });
  }

  // Status indicator entrance
  if (statusRef.current) {
    tl.fromTo(statusRef.current,
      { opacity: 0, scale: 0.8 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: CTA_CONFIG.content.duration, 
        ease: "elastic.out(1, 0.3)" 
      },
      `-=${CTA_CONFIG.content.stagger}`
    );
  }

  return tl;
};

/**
 * Single element animation for scroll triggers
 */
export const animateCTAElement = (element, index = 0) => {
  // Set initial state
  gsap.set(element, { opacity: 0, y: 20 });
  
  return gsap.to(element, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    delay: index * 0.08,
    ease: "power2.out",
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
export const animateCTAHeader = (element, index = 0) => {
  // Set initial state
  gsap.set(element, { opacity: 0, y: 20 });
  
  return gsap.to(element, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    delay: index * 0.08,
    ease: "power2.out",
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
 * Master CTA animations orchestrator
 */
export const createCTAAnimations = (refs) => {
  const {
    leftOrbRef,
    rightOrbRef,
    leftPieceRef,
    rightPieceRef,
    sparkleContainerRef,
    titleRef,
    subtitleRef,
    buttonRef,
    statusRef
  } = refs;

  // Create all animation timelines
  const backgroundTl = createBackgroundOrbs(leftOrbRef, rightOrbRef);
  const sparklesTl = createSparkleEffects(sparkleContainerRef);
  const contentTl = createContentAnimations(titleRef, subtitleRef, buttonRef, statusRef);

  // Create floating pieces (individual tweens for different timing)
  createFloatingPieces(leftPieceRef, rightPieceRef);

  return {
    timelines: {
      background: backgroundTl,
      sparkles: sparklesTl,
      content: contentTl
    },
    cleanup: () => {
      // Kill all timelines
      [backgroundTl, sparklesTl, contentTl].forEach(tl => {
        if (tl && typeof tl.kill === 'function') {
          tl.kill();
        }
      });

      // Kill individual elements
      [
        leftOrbRef.current,
        rightOrbRef.current,
        leftPieceRef.current,
        rightPieceRef.current,
        buttonRef.current
      ].forEach(el => {
        if (el) gsap.killTweensOf(el);
      });

      // Kill sparkles
      if (sparkleContainerRef.current) {
        gsap.killTweensOf(sparkleContainerRef.current.children);
      }
    }
  };
}; 