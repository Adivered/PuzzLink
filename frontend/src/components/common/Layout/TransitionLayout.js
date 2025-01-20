import React, { useRef, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import gsap from 'gsap';

const TransitionLayout = ({ children }) => {
  const theme = useSelector((state) => state.theme.current);
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  useLayoutEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#111827' : '#ffffff';
    if (transitionStage === "fadeOut") {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.1,
        ease: "power1.out",
        onComplete: () => {
          setDisplayLocation(location);
          setTransitionStage("fadeIn");
        }
      });
    } else {
      gsap.fromTo(containerRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.3,
          ease: "power2.inOut",
        }
      );
    }
  }, [transitionStage, location, theme]);

  return (
    <div 
      ref={containerRef} 
      className={`h-full w-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
    >
      {children}
    </div>
  );
};

export default TransitionLayout;