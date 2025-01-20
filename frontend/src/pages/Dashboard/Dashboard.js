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
    <div ref={dashboardRef} className={`container mx-auto px-4 mt-20 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
      <h1 className="text-4xl font-bold mb-8 text-center">Game Dashboard</h1>
      <CreateRoom />
    </div>
  );
};

export default Dashboard;

