import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePopupAnimation } from '../../../hooks/animations/usePopupAnimation';
import PopupButton from './PopupButton';

const Popup = ({ title, message, onClose,confirmText, onConfirm, isVisible }) => {
  const theme = useSelector((state) => state.theme.current);
  const { popupRef, overlayRef, handleClose } = usePopupAnimation(onClose, isVisible);
  const isDark = theme === 'dark';

  const handleConfirmClick = () => {
    handleClose();
    onConfirm?.();
  };

  // Handle escape key
  useEffect(() => {
    const currentPopupRef = popupRef.current;
    const currentOverlayRef = overlayRef.current;
    if (!currentPopupRef || !currentOverlayRef) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible, handleClose, popupRef, overlayRef]);

  if (!isVisible) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 opacity-0"
    >
      <div 
        ref={popupRef}
        className={`
          w-full max-w-md p-6 rounded-xl shadow-2xl transform
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          transition-colors duration-200
        `}
      >
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {message}
        </p>
        <div className="flex justify-end space-x-4">
          <PopupButton 
            variant="secondary" 
            onClick={handleClose}
          >
            Cancel
          </PopupButton>
          <PopupButton 
            variant="primary" 
            onClick={handleConfirmClick}
          >
            {confirmText || 'Confirm'}
          </PopupButton>
        </div>
      </div>
    </div>
  );
};

export default Popup;