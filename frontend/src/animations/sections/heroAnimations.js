import { gsap } from 'gsap';

/**
 * Hero Section Animations - Modular and Optimized
 * Following GSAP best practices for performance and maintainability
 */

// Animation configuration constants
const ANIMATION_CONFIG = {
  button: {
    float: {
      duration: 2.5,
      ease: "sine.inOut",
      yOffset: 8
    },
    click: {
      duration: 0.15,
      ease: "power2.out",
      scale: 0.95
    }
  },
  content: {
    entrance: {
      delay: 0.5,
      duration: 1,
      stagger: 0.2
    }
  },
  background: {
    orbs: {
      duration: 4,
      ease: "sine.inOut"
    },
    mesh: {
      duration: 6,
      ease: "power2.inOut"
    }
  }
};

/**
 * Creates the optimized floating animation using sine wave motion
 * Based on research: most natural floating effect uses trigonometric functions
 */
export const createFloatingAnimation = (element, config = {}) => {
  const { amplitude = 8, duration = 2.5, ease = "sine.inOut", delay = 0 } = config;
  
  if (!element) return null;
  
  gsap.killTweensOf(element);
  
  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
    delay,
    defaults: { force3D: true }
  });
  
  tl.to(element, { y: -amplitude, duration, ease });
  return tl;
};

/**
 * Creates button click animation with proper feedback
 */
export const createButtonClickAnimation = (element, onComplete) => {
  if (!element) return null;

  return gsap.to(element, {
    scale: ANIMATION_CONFIG.button.click.scale,
    duration: ANIMATION_CONFIG.button.click.duration,
    yoyo: true,
    repeat: 1,
    ease: ANIMATION_CONFIG.button.click.ease,
    force3D: true,
    onComplete: onComplete
  });
};

/**
 * Master animation orchestrator for Hero Section
 * Returns an object with all animation controllers for easy management
 */
export const createHeroAnimations = (refs) => {
  const {
    titleRef,
    subtitleRef, 
    buttonRef,
    meshGradientRef,
    orb1Ref,
    orb2Ref,
    scrollDotRef,
    featureCardsRef,
    borderAnimationRef
  } = refs;

  // Main content animation timeline
  const contentTl = gsap.timeline({ 
    delay: ANIMATION_CONFIG.content.entrance.delay,
    defaults: { force3D: true }
  });
  
  // Title animation
  if (titleRef.current) {
    contentTl.fromTo(titleRef.current, 
      { opacity: 0, y: 50, scale: 0.8 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: ANIMATION_CONFIG.content.entrance.duration, 
        ease: "power3.out" 
      }
    );
  }

  // Subtitle animation
  if (subtitleRef.current) {
    contentTl.fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "power2.out" 
      },
      "-=0.5"
    );
  }

  // Button animation
  if (buttonRef.current) {
    contentTl.fromTo(buttonRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.6, 
        ease: "back.out(1.7)" 
      },
      "-=0.3"
    );
  }

  // Feature cards staggered animation
  if (featureCardsRef.current && featureCardsRef.current.children) {
    const cards = featureCardsRef.current.children;
    contentTl.fromTo(cards,
      { opacity: 0, y: 30, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power2.out"
      },
      "-=0.2"
    );
  }

  // Background animations timeline (separate for performance)
  const backgroundTl = gsap.timeline({ 
    repeat: -1,
    defaults: { force3D: true }
  });
  
  // Mesh gradient pulse animation
  if (meshGradientRef.current) {
    backgroundTl.to(meshGradientRef.current, {
      opacity: 0.8,
      duration: ANIMATION_CONFIG.background.mesh.duration / 2,
      ease: ANIMATION_CONFIG.background.mesh.ease
    })
    .to(meshGradientRef.current, {
      opacity: 0.6,
      duration: ANIMATION_CONFIG.background.mesh.duration / 2,
      ease: ANIMATION_CONFIG.background.mesh.ease
    });
  }

  // Floating orb animations
  if (orb1Ref.current) {
    gsap.to(orb1Ref.current, {
      y: -20,
      duration: ANIMATION_CONFIG.background.orbs.duration,
      ease: ANIMATION_CONFIG.background.orbs.ease,
      yoyo: true,
      repeat: -1,
      force3D: true
    });
  }

  if (orb2Ref.current) {
    gsap.to(orb2Ref.current, {
      scale: 1.1,
      opacity: 0.3,
      duration: ANIMATION_CONFIG.background.orbs.duration / 2,
      ease: ANIMATION_CONFIG.background.orbs.ease,
      yoyo: true,
      repeat: -1,
      delay: 1,
      force3D: true
    });
  }

  // Button floating animation
  const buttonFloatTl = createFloatingAnimation(buttonRef.current);

  // Scroll indicator animation
  const scrollTl = scrollDotRef.current ? gsap.to(scrollDotRef.current, {
    y: 8,
    duration: 1.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    force3D: true
  }) : null;

  // Border animation for button
  if (borderAnimationRef.current) {
    gsap.to(borderAnimationRef.current, {
      opacity: 0.7,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      force3D: true
    });
  }

  // Return controller object
  return {
    timelines: {
      content: contentTl,
      background: backgroundTl,
      buttonFloat: buttonFloatTl,
      scroll: scrollTl
    },
    actions: {
      buttonClick: (onComplete) => createButtonClickAnimation(buttonRef.current, onComplete)
    },
    cleanup: () => {
      // Kill all timelines safely
      [contentTl, backgroundTl, buttonFloatTl, scrollTl].forEach(tl => {
        if (tl && typeof tl.kill === 'function') {
          tl.kill();
        }
      });

      // Kill individual tweens safely
      [
        meshGradientRef.current,
        orb1Ref.current,
        orb2Ref.current,
        scrollDotRef.current,
        buttonRef.current,
        borderAnimationRef.current
      ].forEach(el => {
        if (el) gsap.killTweensOf(el);
      });
    }
  };
};
