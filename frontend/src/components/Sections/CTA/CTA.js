import React from 'react';
import { useNavigate } from 'react-router-dom';
const CTASection = ({ sectionRef }) => {
  const navigate = useNavigate();

  return (
    <section id="cta" ref={sectionRef} className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="ctaText" className="cta opacity-0 text-4xl font-bold mb-8">Ready to Start Your Puzzle Adventure?</h2>
        <p className="cta opacity-0 text-xl mb-8">Join thousands of puzzle enthusiasts and experience the joy of collaborative puzzle-solving today!</p>
        <button
          onClick={() => navigate('/signup')}
          id="ctaButton"
          className="opacity-0 inline-block bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300"
        >
          Sign Up Now
        </button>
      </div>
    </section>
  )
};

export default CTASection;