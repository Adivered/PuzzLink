import React from 'react';
import { useSelector } from 'react-redux';
import { useAppLifecycle } from '../hooks/useAppLifecycle';
import useNavigationLeave from '../../hooks/useNavigationLeave';

// Global Components
import ToastContainer from '../../shared/components/ui/ToastContainer';
import { FloatingChat } from '../../features/chat/components/FloatingChat';
import InvitationHandler from '../../features/common/components/InvitationHandler';

/**
 * Global Components following Single Responsibility Principle
 * Handles app-wide UI components and lifecycle management
 * Only shows chat when data is ready
 */
export const GlobalComponents = () => {
  const { user, homeConversationId } = useSelector((state) => state.auth);
  const { isInitialized } = useSelector((state) => state.chat);
  
  // Handle app lifecycle (socket cleanup, etc.)
  useAppLifecycle();
  
  // Handle room leaving when navigating away
  useNavigationLeave();

  // Only show chat when user is authenticated, has valid homeConversationId, and chat data is initialized
  const shouldShowChat = user && homeConversationId && homeConversationId !== 'pending' && isInitialized;

  return (
    <>
      <ToastContainer />
      {shouldShowChat && <FloatingChat />}
      <InvitationHandler />
    </>
  );
}; 