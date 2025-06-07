import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CSSPlugin } from 'gsap/CSSPlugin';

// Register GSAP plugins globally
gsap.registerPlugin(ScrollTrigger, CSSPlugin);

// Set global defaults for better performance and consistency
gsap.defaults({
  duration: 0.6,
  ease: "power2.out",
});

// Global performance configuration to reduce reflows and improve performance
gsap.config({
  force3D: true,
  autoSleep: 60,
  nullTargetWarn: false,
  autoKillThreshold: 7
});

// Configure ScrollTrigger defaults for better performance
ScrollTrigger.defaults({
  toggleActions: 'play none none reverse',
  start: 'top 90%',
  end: 'bottom 10%',
  refreshPriority: -1,
  fastScrollEnd: true,
  anticipatePin: false,
  scroller: window
});

// Optimize refresh behavior to reduce forced reflows
ScrollTrigger.config({
  limitCallbacks: true,
  syncInterval: 150,
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize"
});

// Performance optimization for focus/blur events
let rafId = null;
const throttledRefresh = () => {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    rafId = null;
  });
};

// Listen for visibility changes to reduce unnecessary calculations
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause all animations when tab is not visible
    gsap.globalTimeline.pause();
  } else {
    // Resume animations and refresh ScrollTrigger
    gsap.globalTimeline.resume();
    throttledRefresh();
  }
});

// Export for any additional setup if needed
export { gsap, ScrollTrigger };
