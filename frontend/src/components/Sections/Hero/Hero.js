import React from "react"
import PuzzlePieces from "../../PuzzlePieces/PuzzlePieces"
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HeroSection = ({theme, sectionRef}) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  return (
    <section id="hero" ref={sectionRef} className="h-[calc(100vh-7dvh)] sm:h-[calc(100vh-8dvh)] md:h-[calc(100vh-9dvh)] lg:h-[calc(100vh-10dvh)] flex items-center justify-center relative overflow-hidden" >
      <svg id="heroSvg" className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="heroGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#heroGradient)" />
        <PuzzlePieces />
      </svg>
      <div className="text-center z-10">
        <h1 className="text-6xl font-bold mb-4">Welcome to PuzzLink</h1>
        <p className="text-2xl mb-8">Connect, Create, and Solve Puzzles Together</p>
        <button 
          onClick = {() => user ? navigate('/dashboard') : navigate('/login')}
          className="bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 transition duration-300">
          Explore Features
        </button>
      </div>
    </section>
  )
}

export default HeroSection;