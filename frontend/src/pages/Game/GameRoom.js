import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGame } from '../../store/gameSlice';
import { useParams } from 'react-router-dom';
import { switchToRoom } from '../../store/roomSlice';
import PuzzleGame from '../../components/game/PuzzleGame';
import Whiteboard from '../../components/Whiteboard/Whiteboard';
import CenteredLoader from '../../components/common/LoadingSpinner';

const GameRoom = () => {
  const { gameId } = useParams();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const { data: game, loading, error, status } = useSelector((state) => state.game);
  const { isConnected } = useSelector((state) => state.socket);
  const user = useSelector((state) => state.auth.user);
  const roomData = useSelector((state) => state.room.data);
  const chatIsInitialized = useSelector((state) => state.chat.isInitialized);
  
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const fetchInitiated = useRef(false);
  const switchAttempted = useRef(false);
  const lastGameId = useRef(null);

  // Reset refs when gameId changes
  useEffect(() => {
    if (lastGameId.current !== gameId) {
      fetchInitiated.current = false;
      switchAttempted.current = false;
      setHasJoinedRoom(false);
      lastGameId.current = gameId;
    }
  }, [gameId]);

  // Stable memoized game room ID
  const gameRoomId = useMemo(() => {
    if (!game?.room) return null;
    return typeof game.room === 'object' ? game.room._id : game.room;
  }, [game?.room]);

  // Fetch game data - simplified with better conditions
  useEffect(() => {
    if (gameId && 
        (!game || game._id !== gameId) && 
        !loading && 
        status !== 'loading' && 
        !fetchInitiated.current) {
      
      console.log('🎮 Fetching game data for:', gameId);
      fetchInitiated.current = true;
      dispatch(fetchGame(gameId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, gameId, game?._id, loading, status]);

  // Room switching - simplified with refs to prevent multiple calls
  const handleRoomSwitch = useCallback(async () => {
    if (!gameRoomId || !isConnected || !user || hasJoinedRoom || switchAttempted.current) {
      return;
    }

    // Check if already in correct room
    if (roomData && roomData._id === gameRoomId) {
      console.log(`✅ GameRoom: Already in correct room ${gameRoomId}`);
      setHasJoinedRoom(true);
      return;
    }

    console.log(`🎮 GameRoom: Switching to room ${gameRoomId} from ${roomData?._id}`);
    switchAttempted.current = true;

    try {
      await dispatch(switchToRoom({ 
        roomId: gameRoomId,
        leaveRoomId: roomData?._id || null 
      })).unwrap();
      
      console.log('✅ GameRoom: Successfully joined room');
      setHasJoinedRoom(true);
    } catch (error) {
      console.error('❌ Failed to switch to game room:', error);
      switchAttempted.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameRoomId, isConnected, user, hasJoinedRoom, roomData?._id, dispatch]);

  // Trigger room switch when conditions are met
  useEffect(() => {
    if (gameRoomId && isConnected && user && !hasJoinedRoom) {
      handleRoomSwitch();
    }
  }, [gameRoomId, isConnected, user, hasJoinedRoom, handleRoomSwitch]);

  // Simplified loading state with stable dependencies
  const loadingState = useMemo(() => {
    const isGameDataReady = !!game && !loading;
    const isRoomDataReady = hasJoinedRoom || (gameRoomId && roomData && roomData._id === gameRoomId);
    const isChatDataReady = chatIsInitialized;
    const isAllDataReady = isGameDataReady && isRoomDataReady && isChatDataReady;
    
    let statusText = 'Loading game...';
    if (isGameDataReady && !isRoomDataReady) {
      statusText = 'Joining game room...';
    } else if (isGameDataReady && isRoomDataReady && !isChatDataReady) {
      statusText = 'Loading chat data...';
    }
    
    return {
      isGameDataReady,
      isRoomDataReady,
      isChatDataReady,
      isAllDataReady,
      statusText
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, loading, hasJoinedRoom, gameRoomId, roomData?.id, chatIsInitialized]);

  if (loading || !loadingState.isAllDataReady) {
    const progressSteps = [
      loadingState.isGameDataReady,
      loadingState.isRoomDataReady,  
      loadingState.isChatDataReady
    ];
    
    return (
      <CenteredLoader 
        statusText={loadingState.statusText}
        showProgress={true}
        progressSteps={progressSteps}
        progressLabels={['Game', 'Room', 'Chat']}
      />
    );
  }

  // Error state - let toast notifications handle errors
  if (error) {
    return null; // Error will be shown via toast
  }

  // No game data - let toast notifications handle errors
  if (!game) {
    return null; // Error will be shown via toast
  }

  // Render whiteboard for drawable games
  if (game.whiteboard) {
    return (
      <div className={`h-screen w-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Whiteboard gameId={gameId} />
      </div>
    );
  }

  // Render puzzle game
  if (game.puzzle) {
    return <PuzzleGame />;
  }

  // Invalid game type
  return (
    <div className={`h-screen w-screen flex items-center justify-center ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <p className="text-xl">Invalid game type</p>
    </div>
  );
};

export default React.memo(GameRoom);