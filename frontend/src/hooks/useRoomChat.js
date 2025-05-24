import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setActiveRoom, openChat, setRoomDetails, fetchRoomForChat } from '../store/chatSlice';
import { fetchRoom } from '../store/roomSlice';
import socketService from '../services/socketService';

const useRoomChat = () => {
  const dispatch = useDispatch();
  const { roomId, gameId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const { activeRoom, roomDetails } = useSelector((state) => state.chat);
  const room = useSelector((state) => state.room.data);

  // Get the current room ID from either roomId or gameId params
  const currentRoomId = roomId || gameId;

  useEffect(() => {
    if (currentRoomId && user) {
      // Check if we already have room details in chat
      const hasRoomDetails = roomDetails[currentRoomId];
      
      // If we don't have room details, try to fetch from room slice first
      if (!hasRoomDetails && (!room || room._id !== currentRoomId)) {
        dispatch(fetchRoom(currentRoomId));
      }
      
      // If still no room details and not in room slice, fetch for chat
      if (!hasRoomDetails && !room) {
        dispatch(fetchRoomForChat(currentRoomId));
      }
      
      // Set the active room for chat
      dispatch(setActiveRoom(currentRoomId));
      
      // Use the unified room switching method instead of separate join/leave
      // This automatically handles both room management and chat
      socketService.switchRoom(currentRoomId);

      // Cleanup when leaving the room
      return () => {
        // Switch back to Home room when leaving this room
        if (user.homeRoomId && user.homeRoomId !== currentRoomId) {
          socketService.switchRoom(user.homeRoomId, currentRoomId);
          dispatch(setActiveRoom(user.homeRoomId));
        }
      };
    }
  }, [currentRoomId, user, dispatch, room, roomDetails]);

  // Store room details in chat slice when room data is loaded
  useEffect(() => {
    if (room && room._id && currentRoomId === room._id && !roomDetails[currentRoomId]) {
      dispatch(setRoomDetails({
        roomId: room._id,
        roomData: {
          name: room.name,
          image: room.image,
          creator: room.creator,
          players: room.players
        }
      }));
    }
  }, [room, currentRoomId, dispatch, roomDetails]);

  const openRoomChat = () => {
    if (currentRoomId) {
      dispatch(setActiveRoom(currentRoomId));
      dispatch(openChat());
    }
  };

  const openHomeChat = () => {
    if (user?.homeRoomId) {
      socketService.switchRoom(user.homeRoomId, currentRoomId);
      dispatch(setActiveRoom(user.homeRoomId));
      dispatch(openChat());
    }
  };

  return {
    currentRoomId,
    homeRoomId: user?.homeRoomId,
    isInRoom: !!currentRoomId,
    isActiveRoom: activeRoom === currentRoomId,
    isHomeActive: activeRoom === user?.homeRoomId,
    openRoomChat,
    openHomeChat
  };
};

export default useRoomChat; 