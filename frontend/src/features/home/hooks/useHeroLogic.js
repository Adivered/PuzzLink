import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';

/**
 * Hero section logic hook following Single Responsibility Principle
 * Handles all Hero section animations and interactions
 */
export const useHeroLogic = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Animation refs
  const contentRef = useRef();
  const buttonRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const sectionRef = useRef();

  // Hero section animations
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animate title with stagger effect
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    )
    .fromTo(buttonRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.3"
    );

    // Floating animation for the button
    gsap.to(buttonRef.current, {
      y: -5,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

    return () => tl.kill();
  }, []);

  // Handle CTA button click with animation
  const handleExplore = useCallback(() => {
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: () => {
        user ? navigate('/dashboard') : navigate('/login');
      }
    });
  }, [user, navigate]);

  // Feature highlights data
  const features = [
    { icon: '🧩', title: 'Smart Puzzles', desc: 'AI-powered challenges' },
    { icon: '🤝', title: 'Team Play', desc: 'Collaborate in real-time' },
    { icon: '🏆', title: 'Achievements', desc: 'Track your progress' }
  ];

  return {
    // Refs for animations
    contentRef,
    buttonRef,
    titleRef,
    subtitleRef,
    sectionRef,
    
    // Data
    user,
    features,
    
    // Actions
    handleExplore,
  };
}; 