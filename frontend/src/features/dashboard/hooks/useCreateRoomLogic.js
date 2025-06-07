import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../../../app/store/roomSlice';
import { addToast } from '../../../app/store/toastSlice';

/**
 * Create Room logic hook following Single Responsibility Principle
 * Handles all room creation business logic previously in CreateRoom component
 */
export const useCreateRoomLogic = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentStation, setCurrentStation] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [roomData, setRoomData] = useState({
    name: "",
    invites: [],
    timeLimit: 30,
    gameMode: "",
    turnBased: false,
    image: null,
    imagePrompt: "",
    imagePreview: null,
  });

  // Station navigation logic
  const handleNext = useCallback(() => {
    if (currentStation < 2) {
      // Skip image station for whiteboard games
      if (currentStation === 1 && roomData.gameMode === 'Drawable') {
        return; // Stay on station 1, will create room directly
      }
      setCurrentStation(currentStation + 1);
    }
  }, [currentStation, roomData.gameMode]);
  
  const handlePrevious = useCallback(() => {
    if (currentStation > 0) {
      // Skip image station when going back from whiteboard games
      if (currentStation === 2 && roomData.gameMode === 'Drawable') {
        setCurrentStation(0); // Go back to game type selection
      } else {
        setCurrentStation(currentStation - 1);
      }
    }
  }, [currentStation, roomData.gameMode]);

  // Room data management
  const updateRoomData = useCallback((data) => {
    setRoomData((prev) => ({ ...prev, ...data }));
  }, []);

  // Room creation logic
  const handleCreateRoom = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Create room with invited users - invitations are now sent automatically during room creation
      const result = await dispatch(createRoom(roomData)).unwrap();

      // Show success toast
      const inviteCount = roomData.invites.length;
      let message = `Room "${result.name}" created successfully!`;
      if (inviteCount > 0) {
        message += ` Invitations sent to ${inviteCount} user${inviteCount > 1 ? 's' : ''}.`;
      }
      
      dispatch(addToast({
        message,
        type: 'success'
      }));

      navigate(`/rooms/${result._id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      dispatch(addToast({
        message: 'Failed to create room. Please try again.',
        type: 'error'
      }));
      setIsSubmitting(false);
    }
  }, [dispatch, roomData, isSubmitting, navigate]);

  // Validation logic
  const canProceedToNext = useCallback(() => {
    if (currentStation === 0) return !!roomData.gameMode;
    if (currentStation === 1) return !!roomData.name && roomData.timeLimit >= 5;
    return true;
  }, [currentStation, roomData.gameMode, roomData.name, roomData.timeLimit]);

  // Station change handler for dashboard header updates
  const handleStationChange = useCallback((station) => {
    setCurrentStation(station);
  }, []);

  return {
    // State
    currentStation,
    roomData,
    isSubmitting,
    
    // Actions
    handleNext,
    handlePrevious,
    updateRoomData,
    handleCreateRoom,
    canProceedToNext,
    handleStationChange,
  };
}; 