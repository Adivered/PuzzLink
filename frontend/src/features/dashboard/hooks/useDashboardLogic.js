import { useRef } from 'react';
import { gsap } from 'gsap';
import useIsomorphicLayoutEffect from '../../../hooks/useIsomorphicLayoutEffect';

/**
 * Dashboard logic hook following Single Responsibility Principle
 * Handles dashboard state management and animation refs
 */
export const useDashboardLogic = () => {
  const dashboardRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

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

  // Initial dashboard animation
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

  const currentStationData = stationData[0]; // Default to first station

  return {
    dashboardRef,
    titleRef,
    subtitleRef,
    currentStationData,
  };
};
