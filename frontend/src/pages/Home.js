import React, { useEffect, useState } from 'react';
import LandingPage from './LandingPage/LandingPage';
import { useSelector } from 'react-redux';
import NotAUserPopup from '../components/common/NotAUserPopup';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const [showPopup, setShowPopup] = useState(user ? false : true);
  
  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    if (user)
      setShowPopup(false);
  }, [user]);



  return (
    <>
      <LandingPage/>
      {showPopup && (
        <NotAUserPopup
          onClose={() => closePopup()}
        />
      )}
      

    </>
  );
};

export default Home;