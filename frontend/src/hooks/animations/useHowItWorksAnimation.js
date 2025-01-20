import useIsomorphicLayoutEffect from '../useIsomorphicLayoutEffect';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const useHowItWorksAnimation = (containerRef) => {
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const steps = container.querySelectorAll('.step');
    const layouts = ['step-1', 'step-2', 'step-3', 'step-4'];
    let curLayout = 0;

    const nextState = () => {
      const state = Flip.getState(steps, { props: "opacity", simple: true });
      container.classList.remove(layouts[curLayout]);
      curLayout = (curLayout + 1) % layouts.length;
      container.classList.add(layouts[curLayout]);

      Flip.from(state, {
        absolute: true,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.inOut",
        spin: false,
        simple: true,
        onEnter: (elements, animation) => gsap.fromTo(elements,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, delay: animation.duration() - 0.1 }
        ),
        onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0.8 })
      });

      gsap.delayedCall(2, nextState);
    };

    gsap.delayedCall(1, nextState);

    return () => {
      gsap.killTweensOf(nextState);
    };
  }, [containerRef]);
};

export default useHowItWorksAnimation;