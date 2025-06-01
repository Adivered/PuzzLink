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

    // Initially hide all steps except the first
    gsap.set(steps, { opacity: 0, x: 100, scale: 0.8 });
    gsap.set(steps[0], { opacity: 1, x: 0, scale: 1 });



    const showStep = (stepIndex) => {
      if (animationTimeline) animationTimeline.kill();
      
      animationTimeline = gsap.timeline();

      // Hide current step
      if (currentStep !== stepIndex) {
        animationTimeline.to(steps[currentStep], {
          opacity: 0,
          x: -100,
          scale: 0.8,
          duration: 0.4,
          ease: "power2.in"
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
      gsap.delayedCall(delay, nextStep);
    };

    // Start the slideshow after initial delay
    const startDelay = gsap.delayedCall(3, nextStep);

    // Cleanup function
    return () => {
      if (animationTimeline) animationTimeline.kill();
      gsap.killTweensOf(nextStep);
      startDelay.kill();
      gsap.killTweensOf(steps);
    };
  }, [containerRef]);
};

export default useHowItWorksAnimation;