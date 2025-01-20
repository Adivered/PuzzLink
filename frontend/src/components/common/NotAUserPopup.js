import React from 'react';
import Popup from './Popup/Popup';

const NotAUserPopup = ({ onClose }) => {
  const handleConfirm = () => {
    window.location.href = '/login';
  };

  return (
    <Popup 
      title="Not a User"
      message="Please login to access this feature."
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmText="Login"
      isVisible={true}
    />
  );
};

export default NotAUserPopup;