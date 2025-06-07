import useIsomorphicLayoutEffect from '../useIsomorphicLayoutEffect';
import { gsap } from 'gsap';

const useHowItWorksAnimation = (containerRef) => {
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const steps = container.querySelectorAll('.step-card');
    if (steps.length === 0) return;

    let currentStep = 0;
    let animationTimeline;
    let nextStepTimeout;

    // Performance optimizations
    gsap.config({ 
      force3D: true,
      autoSleep: 60 
    });

    // Set will-change for better performance
    steps.forEach(step => {
      step.style.willChange = 'transform, opacity';
    });

    // Initially hide all steps except the first
    gsap.set(steps, { 
      opacity: 0, 
      x: 100, 
      scale: 0.8,
      force3D: true 
    });
    gsap.set(steps[0], { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      force3D: true 
    });

    const showStep = (stepIndex) => {
      if (animationTimeline) {
        animationTimeline.kill();
        animationTimeline = null;
      }
      
      animationTimeline = gsap.timeline();

      // Hide current step
      if (currentStep !== stepIndex) {
        animationTimeline.to(steps[currentStep], {
          opacity: 0,
          x: -100,
          scale: 0.8,
          duration: 0.4,
          ease: "power2.in",
          force3D: true
        });
      }

      // Show new step
      animationTimeline.fromTo(steps[stepIndex], 
        { 
          opacity: 0, 
          x: 100, 
          scale: 0.8 
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          force3D: true,
          onComplete: () => {
            currentStep = stepIndex;
          }
        }, 
        currentStep !== stepIndex ? 0.2 : 0
      );
    };

    const nextStep = () => {
      const nextIndex = (currentStep + 1) % steps.length;
      showStep(nextIndex);
      
      // Schedule next transition (longer pause on first step)
      const delay = nextIndex === 0 ? 4 : 3;
      nextStepTimeout = setTimeout(nextStep, delay * 1000);
    };

    // Start the slideshow after initial delay
    const startTimeout = setTimeout(nextStep, 3000);

    // Enhanced cleanup function
    return () => {
      // Clear timeouts
      if (startTimeout) clearTimeout(startTimeout);
      if (nextStepTimeout) clearTimeout(nextStepTimeout);
      
      // Kill animation timeline
      if (animationTimeline) {
        animationTimeline.kill();
        animationTimeline = null;
      }
      
      // Kill all GSAP tweens on steps
      gsap.killTweensOf(steps);
      
      // Reset will-change
      steps.forEach(step => {
        step.style.willChange = 'auto';
      });
    };
  }, [containerRef]);
};

export default useHowItWorksAnimation;