import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fadeOut, fadeInUp, fadeInScale } from '../../utils/animations';
import useIsomorphicLayoutEffect from '../useIsomorphicLayoutEffect';
gsap.registerPlugin(ScrollTrigger);

const useSectionAnimations = () => {
  useIsomorphicLayoutEffect(() => {
    // Hero Animation
    const heroTl = gsap.timeline({ repeat: -1 });
    heroTl.to('#heroSvg', { opacity: 0.6, duration: 60 });

    // Features Animation
    ScrollTrigger.batch('.feature', {
      start: 'top center',
      onEnter: (elements) => {fadeInUp(elements)},
      onEnterBack: (elements) => fadeInUp(elements),
      onLeave: (elements) => fadeOut(elements),
      onLeaveBack: (elements) => fadeOut(elements),
      once: false
    });

    // Testimonials Animation
    ScrollTrigger.batch('.testimonial', {
      start: 'top center',
      onEnter: (elements) => fadeInScale(elements),
      onEnterBack: (elements) => fadeInScale(elements),
      onLeave: (elements) => fadeOut(elements),
      onLeaveBack: (elements) => fadeOut(elements),
      once: false
    });

    // Pricing Animation
    ScrollTrigger.batch('.price-card', {
      start: 'top center',
      onEnter: (elements) => fadeInUp(elements),
      onEnterBack: (elements) => fadeInUp(elements),
      onLeave: (elements) => fadeOut(elements),
      onLeaveBack: (elements) => fadeOut(elements),
      once: false
    });

    // FAQ Animation
    ScrollTrigger.batch('.faq-item', {
      start: 'top center',
      onEnter: (elements) => fadeInUp(elements, { stagger: 0.2, duration: 0.6 }),
      onEnterBack: (elements) => fadeInUp(elements, { stagger: 0.2, duration: 0.6 }),
      onLeave: (elements) => fadeOut(elements),
      onLeaveBack: (elements) => fadeOut(elements),
      once: false
    });

    ScrollTrigger.batch('.cta', {
      start: 'top center',
      onEnter: (elements) => fadeInUp(elements, { duration: 0.6 }),
      onEnterBack: (elements) => fadeInUp(elements, { duration: 0.6 }),
      onLeave: (elements) => fadeOut(elements),
      onLeaveBack: (elements) => fadeOut(elements),
      once: false
    });

    ScrollTrigger.batch('#ctaButton', {
      start: 'top center',
      onEnter: (elements) => fadeInScale(elements, { duration: 0.6 }),
      onEnterBack: (elements) => fadeInScale(elements, { duration: 0.6 }),
      onLeave: (elements) => fadeOut(elements),
      onLeaveBack: (elements) => fadeOut(elements),
      once: false
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
};

export default useSectionAnimations;