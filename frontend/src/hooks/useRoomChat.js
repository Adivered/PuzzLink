import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setActiveRoom, openChat } from '../store/chatSlice';
import socketService from '../services/socketService';

const useRoomChat = () => {
  const dispatch = useDispatch();
  const { roomId, gameId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const { activeRoom } = useSelector((state) => state.chat);

  // Get the current room ID from either roomId or gameId params
  const currentRoomId = roomId || gameId;

  useEffect(() => {
    if (currentRoomId && user) {
      // Set the active room for chat
      dispatch(setActiveRoom(currentRoomId));
      
      // Join the room chat via socket
      socketService.joinRoom(currentRoomId);

      // Cleanup when leaving the room
      return () => {
        socketService.leaveRoom(currentRoomId);
        // Don't clear active room here as user might want to keep chatting
      };
    }
  }, [currentRoomId, user, dispatch]);

  const openRoomChat = () => {
    if (currentRoomId) {
      dispatch(setActiveRoom(currentRoomId));
      dispatch(openChat());
    }
  };

  return {
    currentRoomId,
    isInRoom: !!currentRoomId,
    isActiveRoom: activeRoom === currentRoomId,
    openRoomChat
  };
};

export default useRoomChat; 