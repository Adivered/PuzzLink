import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setActiveRoom, openChat, setRoomDetails } from '../store/chatSlice';
import { switchToRoom as switchToRoomAction } from '../store/roomSlice';

const useRoomChat = () => {
  const dispatch = useDispatch();
  const { roomId, gameId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const { activeRoom, roomDetails } = useSelector((state) => state.chat);
  const room = useSelector((state) => state.room.data);

  // Get the current room ID from either roomId or gameId params
  const currentRoomId = roomId || gameId;

  const switchToRoomHandler = useCallback(async (newRoomId, currentRoomId = null) => {
    try {
      // Switch room via centralized action
      await dispatch(switchToRoomAction({ 
        roomId: newRoomId, 
        leaveRoomId: currentRoomId 
      })).unwrap();
      
      // Open chat to show the room
      dispatch(openChat());
      
      console.log(`Switched to room ${newRoomId} from ${currentRoomId}`);
    } catch (error) {
      console.error('Failed to switch room:', error);
    }
  }, [dispatch]);

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
      switchToRoomHandler(user.homeRoomId);
    }
  };

  return {
    currentRoomId,
    homeRoomId: user?.homeRoomId,
    isInRoom: !!currentRoomId,
    isActiveRoom: activeRoom === currentRoomId,
    isHomeActive: activeRoom === user?.homeRoomId,
    openRoomChat,
    openHomeChat,
    switchToRoom: switchToRoomHandler
  };
};

export default useRoomChat; 