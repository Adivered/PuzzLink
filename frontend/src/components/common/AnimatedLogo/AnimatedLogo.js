import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import gsap from 'gsap';

const AnimatedLogo = () => {
  const theme = useSelector((state) => state.theme.current);
  const logoRef = useRef(null);
  const letterRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      letterRefs.current.forEach((letter) => {
        gsap.to(letter, {
          y: -2,
          duration: 0.3,
          ease: "power2.out",
          paused: true,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const handleHover = (isHovering) => {
    letterRefs.current.forEach((letter, index) => {
      gsap.to(letter, {
        y: isHovering ? -2 : 0,
        duration: 0.3,
        delay: index * 0.03,
        ease: "power2.out"
      });
    });
  };

  return (
    <Link 
      to="/" 
      ref={logoRef}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      className="text-3xl font-bold relative group"
    >
      <span className="relative inline-block overflow-hidden">
        {'PuzzLink'.split('').map((letter, index) => (
          <span
            key={index}
            ref={el => letterRefs.current[index] = el}
            className={`inline-block ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
            } ${index >= 4 && theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`}
          >
            {letter}
          </span>
        ))}
      </span>
    </Link>
  );
};

export default AnimatedLogo;