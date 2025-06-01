import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToast } from '../../store/toastSlice';
import { 
  removePendingInvitation, 
  updateInvitationStatus 
} from '../../store/socketSlice';
import { emitSocketEvent } from '../../store/socketSlice';
import { Users, Clock, Check, X } from 'lucide-react';

const SimpleInvitationHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.current);
  const { pendingInvitations } = useSelector((state) => state.socket);
  const processedInvitations = useRef(new Set());
  const [currentInvitation, setCurrentInvitation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isDarkTheme = theme === 'dark';

  const handleDeclineInvitation = useCallback(async () => {
    if (!currentInvitation) return;

    try {
      console.log('❌ Declining invitation:', currentInvitation);

      // Send decline response via socket FIRST
      emitSocketEvent('room_invitation_response', {
        roomId: currentInvitation.roomId,
        accepted: false
      });

      // Remove from pending invitations immediately
      dispatch(removePendingInvitation({
        roomId: currentInvitation.roomId,
        inviterName: currentInvitation.inviterName
      }));

      // Show info toast
      dispatch(addToast({
        message: `Declined invitation from ${currentInvitation.inviterName}`,
        type: 'info'
      }));

      // Close modal and reset
      setShowModal(false);
      setCurrentInvitation(null);
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  }, [currentInvitation, dispatch]);

  // Handle new invitations
  useEffect(() => {
    console.log('🔍 SimpleInvitationHandler - Checking invitations:', {
      totalPending: pendingInvitations.length,
      currentInvitation: currentInvitation?.id,
      processedCount: processedInvitations.current.size
    });

    const pendingInvites = pendingInvitations.filter(inv => 
      inv.status === 'pending' && !processedInvitations.current.has(inv.id)
    );
    
    console.log('🔍 Filtered pending invites:', pendingInvites.length);
    
    if (pendingInvites.length > 0 && !currentInvitation) {
      const invitation = pendingInvites[0]; // Handle one at a time
      
      console.log('🎯 Processing new invitation:', invitation);
      
      // Mark as processed to prevent duplicate handling
      processedInvitations.current.add(invitation.id);
      
      // Show toast notification first
      dispatch(addToast({
        message: `${invitation.inviterName} invited you to join a room!`,
        type: 'invitation',
        duration: 3000
      }));

      // Show custom modal after a brief delay
      setTimeout(() => {
        setCurrentInvitation(invitation);
        setShowModal(true);
      }, 500);
    }
  }, [pendingInvitations, dispatch, currentInvitation]);

  const handleAcceptInvitation = async () => {
    if (!currentInvitation) return;

    try {
      console.log('🎯 Accepting invitation:', currentInvitation);
      
      // Send acceptance response via socket FIRST
      emitSocketEvent('room_invitation_response', {
        roomId: currentInvitation.roomId,
        accepted: true
      });

      // Remove from pending invitations immediately
      dispatch(removePendingInvitation({
        roomId: currentInvitation.roomId,
        inviterName: currentInvitation.inviterName
      }));

      // Show success toast
      dispatch(addToast({
        message: `Joining ${currentInvitation.inviterName}'s room...`,
        type: 'success'
      }));

      // Close modal and reset
      setShowModal(false);
      setCurrentInvitation(null);

      // Navigate to the room
      console.log('🚀 Navigating to room:', currentInvitation.roomId);
      navigate(`/rooms/${currentInvitation.roomId}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      dispatch(addToast({
        message: 'Failed to join room. Please try again.',
        type: 'error'
      }));
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const inviteTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - inviteTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
  };

  // Auto-decline after 30 seconds
  useEffect(() => {
    if (showModal && currentInvitation) {
      const timer = setTimeout(() => {
        handleDeclineInvitation();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [showModal, currentInvitation, handleDeclineInvitation]);

  // Clean up processed invitations when they're removed from Redux store
  useEffect(() => {
    const currentInvitationIds = new Set(pendingInvitations.map(inv => inv.id));
    const processedIds = Array.from(processedInvitations.current);
    
    // Remove processed IDs that are no longer in the pending list
    processedIds.forEach(id => {
      if (!currentInvitationIds.has(id)) {
        processedInvitations.current.delete(id);
      }
    });
  }, [pendingInvitations]);

  if (!showModal || !currentInvitation) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div 
        className={`
          w-full max-w-md mx-4 p-6 rounded-xl shadow-2xl transform transition-all duration-300
          ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          animate-slide-in-right
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users size={24} className="text-blue-500" />
            <h2 className="text-xl font-bold">Room Invitation</h2>
          </div>
          <button 
            onClick={handleDeclineInvitation}
            className={`p-1 rounded-full transition-colors ${
              isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X size={20} className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Invitation Content */}
        <div className="mb-6">
          <div className={`p-4 rounded-lg mb-4 ${
            isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <p className="text-lg font-medium mb-2">
              <span className="text-blue-500">{currentInvitation.inviterName}</span> invited you to join a game room!
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Clock size={14} className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'} />
              <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                {getTimeAgo(currentInvitation.timestamp)}
              </span>
            </div>
          </div>
          
          <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            Join the room to start playing together! You can chat, solve puzzles, and have fun with other players.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleDeclineInvitation}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              isDarkTheme 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            <X size={16} />
            <span>Decline</span>
          </button>
          
          <button
            onClick={handleAcceptInvitation}
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Check size={16} />
            <span>Accept & Join</span>
          </button>
        </div>

        {/* Auto-decline notice */}
        <div className={`mt-4 p-3 rounded-lg text-xs ${
          isDarkTheme ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
        }`}>
          <p>⏰ This invitation will auto-decline in 30 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleInvitationHandler; 