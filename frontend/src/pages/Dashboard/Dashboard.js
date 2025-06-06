import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';
import CreateRoom from '../../components/Room/CreateRoom';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';

const Dashboard = () => {
  const theme = useSelector((state) => state.theme.current);
  const dashboardRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const [currentStation, setCurrentStation] = useState(0);

  const stationData = [
    {
      title: "Choose Your Game",
      subtitle: "Select the type of puzzle experience you want to create"
    },
    {
      title: "Configure Your Room",
      subtitle: "Set up room details and invite your friends to play"
    },
    {
      title: "Add Your Image",
      subtitle: "Upload or generate an image for your puzzle"
    }
  ];

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(dashboardRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      });
    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  // Animate text changes when station changes
  useIsomorphicLayoutEffect(() => {
    if (titleRef.current && subtitleRef.current) {
      const tl = gsap.timeline();
      tl.to([titleRef.current, subtitleRef.current], {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.out'
      })
      .set([titleRef.current, subtitleRef.current], {
        y: 20
      })
      .to([titleRef.current, subtitleRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  }, [currentStation]);

  const currentStationData = stationData[currentStation] || stationData[0];

  return (
    <div className={`h-[calc(100vh-140px)] overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
      <div 
        ref={dashboardRef} 
        className="h-full flex flex-col"
      >
        {/* Header Section - Compact */}
        <div className="flex-none px-6 pt-2 pb-2">
          <div className="text-center">
            <h1 
              ref={titleRef}
              className={`text-2xl lg:text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {currentStationData.title}
            </h1>
            <p 
              ref={subtitleRef}
              className={`text-sm lg:text-base ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {currentStationData.subtitle}
            </p>
          </div>
        </div>
        
        {/* Main Content - Expands to fill remaining space */}
        <div className="flex-1 px-4 pb-4 min-h-0">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-6xl h-full">
              <CreateRoom onStationChange={setCurrentStation} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

