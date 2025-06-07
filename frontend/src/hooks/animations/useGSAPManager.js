import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Centralized GSAP Manager Hook
 * Handles plugin registration, performance optimization, and cleanup
 * Should be used once at the top level (LandingPage) and pass refs to children
 */
export const useGSAPManager = () => {
  const isInitialized = useRef(false);
  const activeAnimations = useRef(new Set());
  const scrollTriggers = useRef(new Set());
  const timelines = useRef(new Set());

  // Initialize GSAP once
  useEffect(() => {
    if (!isInitialized.current) {
      // Register plugins
      gsap.registerPlugin(ScrollTrigger);
      
      // Global GSAP configuration for optimal performance
      gsap.config({
        autoSleep: 60,
        nullTargetWarn: false,
        trialWarn: false
      });

      // ScrollTrigger performance settings
      ScrollTrigger.config({
        limitCallbacks: true,
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
      });

      // Set default ease for smoother animations
      gsap.defaults({
        ease: "power2.out"
      });

      isInitialized.current = true;
    }

    // Global cleanup on unmount
    return () => {
      // Kill all GSAP tweens
      gsap.killTweensOf("*");
      
      // Clear ScrollTrigger (safe for tests)
      if (ScrollTrigger && typeof ScrollTrigger.getAll === 'function') {
        const triggers = ScrollTrigger.getAll();
        if (triggers && Array.isArray(triggers)) {
          triggers.forEach(trigger => trigger.kill());
        }
      }
      if (ScrollTrigger && typeof ScrollTrigger.clearMatchMedia === 'function') {
        ScrollTrigger.clearMatchMedia();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to register animations for tracking
  const registerAnimation = useCallback((animation) => {
    if (animation) {
      activeAnimations.current.add(animation);
    }
    return animation;
  }, []);

  // Function to register ScrollTriggers for tracking
  const registerScrollTrigger = useCallback((trigger) => {
    if (trigger) {
      scrollTriggers.current.add(trigger);
    }
    return trigger;
  }, []);

  // Function to unregister animations
  const unregisterAnimation = useCallback((animation) => {
    if (animation) {
      activeAnimations.current.delete(animation);
      if (typeof animation.kill === 'function') {
        animation.kill();
      }
    }
  }, []);

  // Function to unregister ScrollTriggers
  const unregisterScrollTrigger = useCallback((trigger) => {
    if (trigger) {
      scrollTriggers.current.delete(trigger);
      if (typeof trigger.kill === 'function') {
        trigger.kill();
      }
    }
  }, []);

  // Create optimized animation with automatic registration
  const createAnimation = useCallback((target, vars) => {
    const animation = gsap.to(target, {
      ...vars,
      onStart: () => {
        // Mark element as animated to override CSS
        if (target && target.classList) {
          target.classList.add('gsap-animated');
        }
        if (vars.onStart) vars.onStart();
      },
      onComplete: () => {
        // Clean up will-change after animation
        if (target && target.style) {
          setTimeout(() => {
            target.style.willChange = 'auto';
          }, 100);
        }
        if (vars.onComplete) vars.onComplete();
      }
    });
    return registerAnimation(animation);
  }, [registerAnimation]);

  // Create optimized ScrollTrigger with automatic registration
  const createScrollTrigger = useCallback((vars) => {
    if (!ScrollTrigger || typeof ScrollTrigger.create !== 'function') {
      console.warn('ScrollTrigger not available');
      return null;
    }
    const trigger = ScrollTrigger.create({
      ...vars,
      onEnter: (self) => {
        // Mark element as being animated
        if (self.trigger && self.trigger.classList) {
          self.trigger.classList.add('gsap-animated');
        }
        if (vars.onEnter) vars.onEnter(self);
      }
    });
    return registerScrollTrigger(trigger);
  }, [registerScrollTrigger]);

  // Batch animate elements with stagger
  const animateElements = useCallback((elements, animationType, startIndex = 0) => {
    if (!elements || elements.length === 0) return;

    const configs = {
      feature: { 
        from: { opacity: 0, y: 30, scale: 0.95 },
        to: { opacity: 1, y: 0, scale: 1 },
        stagger: 0.1, duration: 0.6 
      },
      testimonial: { 
        from: { opacity: 0, scale: 0.95, y: 20 },
        to: { opacity: 1, scale: 1, y: 0 },
        stagger: 0.15, duration: 0.5 
      },
      pricing: { 
        from: { opacity: 0, y: 30, scale: 0.95 },
        to: { opacity: 1, y: 0, scale: 1 },
        stagger: 0.1, duration: 0.6 
      },
      faq: { 
        from: { opacity: 0, x: -20 },
        to: { opacity: 1, x: 0 },
        stagger: 0.08, duration: 0.5 
      },
      cta: { 
        from: { opacity: 0, y: 20 },
        to: { opacity: 1, y: 0 },
        stagger: 0.08, duration: 0.6 
      },
      'section-header': { 
        from: { opacity: 0, y: 20 },
        to: { opacity: 1, y: 0 },
        stagger: 0.05, duration: 0.6 
      }
    };

    const config = configs[animationType] || configs.feature;

    elements.forEach((element, index) => {
      // Set initial state
      gsap.set(element, config.from);
      
      // Create animation
      createAnimation(element, {
        ...config.to,
        duration: config.duration,
        delay: (startIndex + index) * config.stagger,
        onStart: () => {
          element.style.willChange = 'transform, opacity';
          element.classList.add('gsap-animated');
        }
      });
    });
  }, [createAnimation]);

  // Refresh ScrollTrigger (useful after DOM changes)
  const refresh = useCallback(() => {
    if (ScrollTrigger && typeof ScrollTrigger.refresh === 'function') {
      ScrollTrigger.refresh();
    }
  }, []);

  return {
    // Animation creators
    createAnimation,
    createScrollTrigger,
    animateElements,
    
    // Management functions
    registerAnimation,
    registerScrollTrigger,
    unregisterAnimation,
    unregisterScrollTrigger,
    
    // Collections access
    timelines: timelines.current,
    
    // Utility functions
    refresh,
    
    // Direct GSAP access for advanced use
    gsap,
    ScrollTrigger
  };
}; 