import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fadeInUp, fadeInScale } from '../../utils/animations';
import useIsomorphicLayoutEffect from '../useIsomorphicLayoutEffect';
gsap.registerPlugin(ScrollTrigger);

const useSectionAnimations = () => {
  useIsomorphicLayoutEffect(() => {
    // Optimize scroll trigger settings for better performance
    ScrollTrigger.defaults({
      start: 'top 90%',
      end: 'bottom 10%',
      toggleActions: 'play none none reverse',
      // Add performance optimizations
      refreshPriority: -1,
      fastScrollEnd: true
    });

    // Batch animations for better performance
    const animationBatches = [
      {
        selector: '[data-animate="feature"]',
        animation: (elements) => fadeInUp(elements, { stagger: 0.1, duration: 0.6 })
      },
      {
        selector: '[data-animate="testimonial"]',
        animation: (elements) => fadeInScale(elements, { stagger: 0.15, duration: 0.5 })
      },
      {
        selector: '[data-animate="pricing"]',
        animation: (elements) => {
          gsap.fromTo(elements, 
            { opacity: 0, y: 30, scale: 0.95 },
            { 
              opacity: 1, 
              y: 0, 
              scale: 1, 
              duration: 0.6, 
              stagger: 0.1,
              ease: "power2.out"
            }
          );
        }
      },
      {
        selector: '[data-animate="faq"]',
        animation: (elements) => {
          gsap.fromTo(elements,
            { opacity: 0, x: -20 },
            { 
              opacity: 1, 
              x: 0, 
              duration: 0.5, 
              stagger: 0.08,
              ease: "power2.out"
            }
          );
        }
      },
      {
        selector: '[data-animate="cta"]',
        animation: (elements) => {
          gsap.fromTo(elements,
            { opacity: 0, y: 20 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.6,
              stagger: 0.08,
              ease: "power2.out"
            }
          );
        }
      },
      {
        selector: '[data-animate="section-header"]',
        animation: (elements) => {
          elements.forEach(element => {
            gsap.fromTo(element,
              { opacity: 0, y: 20 },
              { 
                opacity: 1, 
                y: 0, 
                duration: 0.6,
                ease: "power2.out"
              }
            );
          });
        }
      }
    ];

    // Create scroll triggers for each batch
    animationBatches.forEach(({ selector, animation }) => {
      ScrollTrigger.batch(selector, {
        onEnter: animation,
        once: true,
        // Add performance optimizations
        refreshPriority: -1
      });
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
};

export default useSectionAnimations;