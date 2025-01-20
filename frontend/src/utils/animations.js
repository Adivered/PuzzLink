import { gsap } from 'gsap';


export const fadeOut = (elements, optionns = {}) => {
  console.log("fading out");
  return gsap.to(elements, {
    opacity: 0,
    duration: optionns.duration || 0.8,
    stagger: optionns.stagger || 0.2
  });
}
export const fadeInUp = (elements, options = {}) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 50 },
    { 
      opacity: 1, 
      y: 0,
      duration: options.duration || 0.8,
      stagger: options.stagger || 0.2 
    }
  );
};

export const fadeInScale = (elements, options = {}) => {
  return gsap.fromTo(
    elements,
    { opacity: 0, scale: 0.8 },
    { 
      opacity: 1, 
      scale: 1, 
      duration: options.duration || 0.8,
      stagger: options.stagger || 0.3 
    }
  );
};