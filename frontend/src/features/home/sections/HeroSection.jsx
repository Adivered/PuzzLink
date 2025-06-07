import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useIsomorphicLayoutEffect from '../../../hooks/useIsomorphicLayoutEffect';

// Shared Components
import { PuzzlePieces } from '../components/PuzzlePieces';

/**
 * Hero Section component with GSAP animations
 * Clean implementation using useGSAPManager with double-execution prevention
 */
export const HeroSection = ({ theme, sectionRef, gsapManager }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Refs for animated elements
  const titleRef = useRef();
  const subtitleRef = useRef();
  const buttonRef = useRef();
  const featuresRef = useRef();
  const hasAnimatedRef = useRef(false);
  
  // Memoized animation function to prevent re-creation
  const runAnimations = useCallback(() => {
    if (!gsapManager?.gsap || hasAnimatedRef.current) return;
    
    const { gsap } = gsapManager;
    
    // Ensure all elements exist before animating
    const animatedElements = [titleRef.current, subtitleRef.current, buttonRef.current];
    const featureElements = featuresRef.current ? Array.from(featuresRef.current.children) : [];
    
    if (animatedElements.every(el => el) && featureElements.length > 0) {
      // Mark as animated to prevent double execution
      hasAnimatedRef.current = true;
      
      // Set initial states IMMEDIATELY to prevent flash
      gsap.set(animatedElements, {
        opacity: 0,
        y: 50,
        scale: 0.9
      });
      
      gsap.set(featureElements, {
        opacity: 0,
        y: 30,
        scale: 0.95
      });
      
      // Use requestAnimationFrame to start animations
      requestAnimationFrame(() => {
        // Animate main elements
        gsap.to(titleRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.2,
          onComplete: () => titleRef.current?.classList.add('gsap-animated')
        });
        
        gsap.to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.4,
          onComplete: () => subtitleRef.current?.classList.add('gsap-animated')
        });
        
        gsap.to(buttonRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.4,
          onComplete: () => buttonRef.current?.classList.add('gsap-animated')
        });
        
        // Animate feature cards with stagger
        featureElements.forEach((element, index) => {
          gsap.to(element, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            // delay: 0.8 + (index * 0.1)
            onComplete: () => element?.classList.add('gsap-animated')
          });
        });
      });
    }
  }, [gsapManager]);
  
  // Animation setup with dependency on the memoized function
  useIsomorphicLayoutEffect(() => {
    runAnimations();
  }, [runAnimations]);

  const handleExplore = () => {
    if (gsapManager && buttonRef.current) {
      gsapManager.createAnimation(buttonRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
          user ? navigate('/dashboard') : navigate('/login');
        }
      });
    }
  };

  return (
    <section 
      id="hero" 
      ref={sectionRef} 
      className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-700 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}
    >
      {/* Dynamic Background Layers */}
      <div className="absolute inset-0">
        {/* Animated mesh gradient */}
        <div className={`absolute inset-0 opacity-60 ${
          theme === 'dark' 
            ? 'bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20' 
            : 'bg-gradient-to-tr from-blue-400/20 via-purple-400/20 to-pink-400/20'
        } animate-pulse`} style={{ animationDuration: '8s' }}></div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 animate-bounce"
             style={{ animationDuration: '6s' }}>
          <div className={`w-full h-full rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-cyan-400 to-blue-600' 
              : 'bg-gradient-to-br from-cyan-300 to-blue-500'
          } blur-xl`}></div>
        </div>
        
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-20 animate-pulse"
             style={{ animationDuration: '4s', animationDelay: '2s' }}>
          <div className={`w-full h-full rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-purple-400 to-pink-600' 
              : 'bg-gradient-to-br from-purple-300 to-pink-500'
          } blur-xl`}></div>
        </div>
      </div>

      {/* Puzzle Pieces Background */}
      <div className="absolute inset-0 opacity-30">
        <PuzzlePieces theme={theme} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Title with gradient text */}
        <h1 
          ref={titleRef}
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
          data-animate="hero-title"
        >
          <span className="block">Welcome to</span>
          <span className={`block bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-cyan-400 via-blue-400 to-purple-400' 
              : 'from-cyan-500 via-blue-500 to-purple-500'
          } bg-clip-text text-transparent font-extrabold transform hover:scale-105 transition-transform duration-300`}>
            PuzzLink
          </span>
        </h1>

        {/* Subtitle with enhanced styling */}
        <p 
          ref={subtitleRef}
          className={`text-xl sm:text-2xl md:text-3xl mb-12 font-medium leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}
          data-animate="hero-subtitle"
        >
          <span className="block sm:inline">Connect, Create, and</span>
          <span className={`block sm:inline font-bold ${
            theme === 'dark' 
              ? 'text-gradient-to-r from-pink-400 to-purple-400' 
              : 'text-purple-600'
          }`}> Solve Puzzles Together</span>
        </p>

        {/* Interactive CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button 
            ref={buttonRef}
            onClick={handleExplore}
            className={`group relative px-8 py-4 sm:px-10 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25'
            }`}
            data-animate="hero-button"
          >
            <span className="relative z-10">
              {user ? 'Start Playing' : 'Start Your Journey'}
            </span>
            
            {/* Button glow effect */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-cyan-400/20 to-purple-400/20'
                : 'bg-gradient-to-r from-cyan-300/20 to-purple-300/20'
            } blur-xl`}></div>
            
            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
          </button>
        </div>

        {/* Feature highlights */}
        <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { icon: '🧩', title: 'Smart Puzzles', desc: 'AI-powered challenges' },
            { icon: '🤝', title: 'Team Play', desc: 'Collaborate in real-time' },
            { icon: '🏆', title: 'Achievements', desc: 'Track your progress' }
          ].map((feature, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                  : 'bg-white/30 border border-white/20 hover:bg-white/50'
              }`}
              data-animate="hero-feature"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className={`font-bold mb-1 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{feature.title}</h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className={`w-6 h-10 border-2 rounded-full ${
          theme === 'dark' ? 'border-gray-400' : 'border-gray-600'
        } flex justify-center`}>
          <div className={`w-1 h-3 ${
            theme === 'dark' ? 'bg-gray-400' : 'bg-gray-600'
          } rounded-full animate-bounce mt-2`}></div>
        </div>
      </div>
    </section>
  );
}; 