import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

export const usePopupAnimation = (onClose, isVisible) => {
  const popupRef = useRef(null);
  const overlayRef = useRef(null);

  const resetElements = useCallback(() => {
    const popup = popupRef.current;
    const overlay = overlayRef.current;
    
    if (popup && overlay) {
      gsap.set(popup, { 
        opacity: 0,
        scale: 0.5,
        y: -50,
        zIndex: 1001
      });
      gsap.set(overlay, { 
        opacity: 0,
        zIndex: 1000 
      });
    }
  }, []);

  const handleClose = useCallback(() => {
    const popup = popupRef.current;
    const overlay = overlayRef.current;

    const timeline = gsap.timeline({
      onComplete: () => {
        resetElements();
        onClose();
      }
    });

    timeline
      .to(popup, {
        duration: 0.4,
        opacity: 0,
        scale: 0.8,
        ease: 'power2.inOut'
      })
      .to(overlay, {
        duration: 0.3,
        opacity: 0,
        ease: 'power2.inOut'
      }, '-=0.2');
  }, [onClose, resetElements]);

  useEffect(() => {
    if (!isVisible) return;

    const popup = popupRef.current;
    const overlay = overlayRef.current;

    resetElements();

    const animations = [
      gsap.to(overlay, {
        duration: 0.3,
        opacity: 1,
        ease: 'power2.inOut'
      }),
      gsap.to(popup, {
        duration: 0.8,
        opacity: 1,
        scale: 1,
        y: 0,
        ease: 'bounce.out',
        delay: 0.1
      })
    ];

    return () => {
      animations.forEach(animation => animation.kill());
    };
  }, [isVisible, resetElements]);

  return { popupRef, overlayRef, handleClose };
};