import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';
import CreateRoom from '../../components/Room/CreateRoom';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';

const Dashboard = () => {
  const theme = useSelector((state) => state.theme.current);
  const dashboardRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(dashboardRef.current, {
        opacity: 0,
        x: -100,
        duration: 1,
        ease: 'power3.out'
      });
    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={`min-h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div 
        ref={dashboardRef} 
        className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
      >
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Game Dashboard
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          } max-w-2xl mx-auto`}>
            Create and manage your puzzle rooms with friends
          </p>
        </div>
        
        {/* Main Content */}
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <CreateRoom />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

