import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getSocketInstance, setRoomUsers as setSocketRoomUsers, setOnlineUsers as setSocketOnlineUsers, addPendingInvitation, removePendingInvitation, emitSocketEvent } from '../app/store/socketSlice';
import store from '../app/store';
import { addToast } from '../app/store/toastSlice';
import { 
  addMessage, 
  setUserOnline, 
  setUserOffline, 
  setRoomUsers,
  initializeChatData,
  updateConversationsFromSocket,
  updateMessagesFromSocket,
  addConversationFromSocket,
  updateRoomFromSocket,
  removeRoomFromChat,
  markMessageAsSent,
  setRoomDetails,
  setActiveConversation,
  setActiveRoom
} from '../app/store/chatSlice';

import { 
  addPlayerToRoom, 
  removePlayerFromRoom,
  initializeRoomData,
  updateRoomData,
  updatePlayersFromSocket,
  updateGameStateFromSocket,
  clearRoomData
} from '../app/store/roomSlice';

import {
  setWhiteboardState,
  addStrokeToWhiteboard,
  removeStrokeFromWhiteboard,
  clearWhiteboard,
  setPuzzleState,
  updatePuzzlePiece,
  updatePuzzleMoves,
  completePuzzle,
  resetPuzzle,
  resetGame
} from '../app/store/gameSlice';

const useSocketEventHandlers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isConnected } = useSelector((state) => state.socket);
  const user = useSelector((state) => state.auth.user);
  const homeConversationId = useSelector((state) => state.auth.homeConversationId);
  
  // Track processed events to prevent duplicates
  const processedEvents = useRef(new Set());
  const eventTimestamps = useRef(new Map());
  const handlersRegistered = useRef(false);

  // Clear processed events when user changes
  useEffect(() => {
    processedEvents.current.clear();
    eventTimestamps.current.clear();
  }, [user?.id]);

  const isDuplicateEvent = (eventType, data) => {
    // Skip deduplication for rapid drawing events
    if (eventType.includes('whiteboard_draw_move') || eventType.includes('whiteboard_draw_start')) {
      return false;
    }
    
    // Create a stable key by excluding timestamp which can vary slightly
    const stableData = { ...data };
    delete stableData.timestamp;
    
    const eventKey = `${eventType}_${JSON.stringify(stableData)}`;
    const now = Date.now();
    
    // More aggressive deduplication during development (hot reloading)
    const debounceTime = process.env.NODE_ENV === 'development' ? 2000 : 1000; // 2 seconds in dev, 1 in prod
    
    // Check if we've seen this event recently
    if (eventTimestamps.current.has(eventKey)) {
      const lastTime = eventTimestamps.current.get(eventKey);
      if (now - lastTime < debounceTime) {
        console.log(`🔄 Duplicate event filtered: ${eventType} (${now - lastTime}ms ago)`);
        return true;
      }
    }
    
    // Record this event
    eventTimestamps.current.set(eventKey, now);
    
    // Clean up old events (older than 60 seconds)
    for (const [key, timestamp] of eventTimestamps.current.entries()) {
      if (now - timestamp > 60000) {
        eventTimestamps.current.delete(key);
      }
    }
    
    return false;
  };

  // ADD: Effect to handle navigation-based room leaving
  useEffect(() => {
    // If user navigates away from room/game page, emit leave_room
    const handleBeforeUnload = () => {
      const socket = getSocketInstance();
      if (socket && socket.connected && user?.currentRoom) {
        // Emit leave room event when user navigates away or closes tab
        socket.emit('leave_room', { roomId: user.currentRoom });
      }
    };

    // Listen for navigation changes and page unload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.currentRoom]);



  useEffect(() => {
    // Only set up event handlers when socket is connected and user is authenticated
    if (!isConnected || !user || !homeConversationId || homeConversationId === 'pending') {
      console.log('⏳ useSocketEventHandlers: Waiting for socket connection and valid user state', {
        isConnected,
        hasUser: !!user,
        homeConversationId: homeConversationId?.slice?.(-8) || homeConversationId
      });
      return;
    }

    const socket = getSocketInstance();
    if (!socket) {
      console.log('⚠️ useSocketEventHandlers: Socket instance not available despite connected state');
      return;
    }

    // Prevent duplicate handler registrations with stronger checking
    const handlerKey = `${user?.id}_${socket.id}`;
    if (handlersRegistered.current === handlerKey) {
      console.log('⏳ useSocketEventHandlers: Handlers already registered for this user/socket, skipping...');
      return;
    }

    // Clean up any existing handlers first
    if (handlersRegistered.current) {
      console.log('🧹 Cleaning up previous handlers before registering new ones');
      socket.removeAllListeners();
    }

    console.log('🔌 Setting up socket event handlers, socket connected:', socket.connected);
    handlersRegistered.current = handlerKey;

    // Data initialization events
    const handleInitialData = (data) => {
      console.log('📦 Initial data received:', {
        conversations: data.conversations?.length || 0,
        rooms: data.rooms ? Object.keys(data.rooms).length : 0,
        roomDetails: data.roomDetails ? Object.keys(data.roomDetails).length : 0,
        messages: data.messages ? Object.keys(data.messages).length : 0,
        currentRoom: data.currentRoom?.name || 'None',
        rawDataKeys: Object.keys(data),
        timestamp: new Date().toISOString()
      });
      
      const { conversations, rooms, roomDetails, messages } = data;
      const finalRoomDetails = roomDetails || rooms;
      
      console.log('💾 Dispatching initializeChatData with:', {
        conversations: (conversations || []).length,
        roomDetails: Object.keys(finalRoomDetails || {}).length,
        messages: Object.keys(messages || {}).length
      });
      dispatch(initializeChatData({
        conversations: conversations || [],
        roomDetails: finalRoomDetails || {},
        messages: messages || {}
      }));
      console.log('✅ Chat data initialized');
      
      const isNavigatingToRoom = window.location.pathname.startsWith('/rooms/');
      const isNavigatingToGame = window.location.pathname.startsWith('/game/');
      const targetRoomFromURL = isNavigatingToRoom ? window.location.pathname.split('/rooms/')[1] : null;
      
      if (targetRoomFromURL && finalRoomDetails && finalRoomDetails[targetRoomFromURL]) {
        const roomData = finalRoomDetails[targetRoomFromURL];
        dispatch(initializeRoomData(roomData));
      } else if (!isNavigatingToRoom && !isNavigatingToGame) {
        dispatch(initializeRoomData(null));
      }
    };

    const handleConversationsUpdate = (data) => {
      if (isDuplicateEvent('conversations_update', data)) return;
      dispatch(updateConversationsFromSocket(data.conversations));
    };

    const handleMessagesUpdate = (data) => {
      const { chatId, messages } = data;
      if (isDuplicateEvent('messages_update', data)) return;
      dispatch(updateMessagesFromSocket({ chatId, messages }));
    };

    const handleRoomDataUpdate = (data) => {
      const { roomId, roomData } = data;
      if (isDuplicateEvent('room_data_update', data)) return;
      
      console.log('🏠 Room data update received:', {
        roomId: roomId?.slice?.(-8) || roomId,
        roomName: roomData?.name,
        hasRoomData: !!roomData,
        roomDataKeys: roomData ? Object.keys(roomData) : []
      });
      
      if (roomData && roomData._id === roomId) {
        dispatch(setRoomDetails({ roomId, roomData }));
        console.log(`✅ Chat room details updated for ${roomData.name || roomId?.slice?.(-8)}`);
        
        const currentRoomState = store.getState?.()?.room;
        
        if (!currentRoomState?.isInitialized) {
          console.log(`🏠 Initializing room data for ${roomData.name || roomId?.slice?.(-8)}`);
          dispatch(initializeRoomData(roomData));
        } else {
          const batchedUpdates = () => {
            dispatch(updateRoomFromSocket({ roomId, roomData }));
            dispatch(updateRoomData(roomData));
            
            if (roomData.players && Array.isArray(roomData.players)) {
              const uniquePlayers = roomData.players.filter((player, index, array) => 
                player && player._id && array.findIndex(p => p._id === player._id) === index
              );
              dispatch(updatePlayersFromSocket(uniquePlayers));
            }
          };
          
          setTimeout(batchedUpdates, 0);
        }
      } else {
        console.warn('⚠️ Invalid room data update:', { roomId, roomData });
      }
    };

    // Chat-related events
    const handleMessageReceived = (data) => {
      dispatch(addMessage(data));
      
      if (data.tempId) {
        dispatch(markMessageAsSent({
          tempId: data.tempId,
          messageId: data._id
        }));
      }
    };

    const handleMessageSent = (data) => {
      if (data.tempId) {
        const messageId = data.message?._id || data._id;
        dispatch(markMessageAsSent({
          tempId: data.tempId,
          messageId: messageId
        }));
      }
    };

    const handleUserOnline = (data) => {
      const { userId } = data;
      dispatch(setUserOnline(userId));
      dispatch(setSocketOnlineUsers(userId));
    };

    const handleUserOffline = (data) => {
      const { userId } = data;
      dispatch(setUserOffline(userId));
    };

    const handleRoomUsers = (data) => {
      const { roomId, users } = data;
      dispatch(setRoomUsers({
        roomId,
        users,
        onlineCount: users?.length || 0
      }));
      dispatch(setSocketRoomUsers({ roomId, users }));
    };

    const handlePlayerJoined = (data) => {
      if (isDuplicateEvent('player_joined', data)) return;
      
      if (!data || !data.roomId) {
        console.warn('⚠️ Invalid player joined event - missing roomId');
        return;
      }
      
      if (data.players && Array.isArray(data.players)) {
        const uniquePlayers = data.players.filter((player, index, array) => {
          if (!player || !player._id) {
            console.warn('⚠️ Invalid player data:', player);
            return false;
          }
          return array.findIndex(p => p._id === player._id) === index;
        });
        
        dispatch(updatePlayersFromSocket(uniquePlayers));
        
      } else if (data.player && data.player._id) {
        dispatch(addPlayerToRoom({ player: data.player }));
      } else {
        console.warn('⚠️ Player joined event missing valid player data');
      }
    };

    const handlePlayerRemoved = (data) => {
      if (data.players && Array.isArray(data.players)) {
        const uniquePlayers = data.players.filter((player, index, array) => 
          player && player._id && array.findIndex(p => p._id === player._id) === index
        );
        dispatch(updatePlayersFromSocket(uniquePlayers));
      } else if (data.playerId) {
        dispatch(removePlayerFromRoom({ playerId: data.playerId }));
      }
      
      const currentUser = store.getState?.()?.auth?.user;
      if (data.playerName && data.removedBy && currentUser?.name !== data.removedBy) {
        dispatch(addToast({
          message: `${data.playerName} was removed from the room by ${data.removedBy}`,
          type: 'info'
        }));
      }
    };

    // Game state events
    const handleGameStateUpdate = (data) => {
      dispatch(updateGameStateFromSocket(data.gameState));
    };

    const handleGameStarting = (data) => {
      console.log('🎮 Game starting countdown received by user:', user?.name, data);
      let countdown = data.countdown || 3;
      
      dispatch(updateGameStateFromSocket({
        status: 'starting',
        countdown: countdown,
        roomId: data.roomId
      }));

      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          dispatch(updateGameStateFromSocket({
            status: 'starting',
            countdown: countdown,
            roomId: data.roomId
          }));
        } else {
          clearInterval(countdownInterval);
        }
      }, 1000);
    };

    const handleGameStarted = (data) => {
      console.log('🎮 Game started received by user:', user?.name, data);
      dispatch(updateGameStateFromSocket({
        status: 'active',
        gameId: data.gameId,
        startedAt: new Date().toISOString()
      }));

      if (data.gameId) {
        console.log('🚀 Navigating user', user?.name, 'to game:', data.gameId);
        navigate(`/game/${data.gameId}`);
      }
    };

    const handleGameEnded = (data) => {
      dispatch(updateGameStateFromSocket({
        status: 'ended',
        endedAt: new Date().toISOString(),
        winner: data.winner
      }));
    };

    // Conversation events
    const handleNewConversation = (data) => {
      dispatch(addConversationFromSocket(data.conversation));
    };

    // Room invitation events
    const handleRoomInvitation = (data) => {
      console.log('🔔 Room invitation received:', data);
      console.log('🔔 Data structure:', {
        roomId: data.roomId,
        inviterName: data.inviterName,
        timestamp: data.timestamp
      });
      
      dispatch(addPendingInvitation({
        roomId: data.roomId,
        inviterName: data.inviterName,
        timestamp: data.timestamp
      }));
      
      console.log('🔔 Added pending invitation to Redux store');
    };

    const handleInvitationAccepted = (data) => {
      if (isDuplicateEvent('invitation_accepted', data)) return;
      
      console.log('Invitation accepted:', data);
      
      dispatch(removePendingInvitation({
        roomId: data.roomId,
        inviterName: data.userName
      }));
    };

    // User room events
    const handleUserJoinedRoom = (data) => {
      console.log('User joined room:', data);
    };

    const handleUserLeftRoom = (data) => {
      console.log('👋 User left room:', data);
      
      if (data.roomId && data.userId) {
        dispatch(removePlayerFromRoom({ 
          playerId: data.userId 
        }));
      }
      
      // Only show toast for other users, and use global deduplication key
      if (data.userId !== user?.id) {
        const globalEventKey = `any_user_left_${data.userId}_${data.roomId}`;
        if (!eventTimestamps.current.has(globalEventKey) || 
            (Date.now() - eventTimestamps.current.get(globalEventKey)) > 5000) {
          eventTimestamps.current.set(globalEventKey, Date.now());
          dispatch(addToast({
            message: `${data.userName || 'A player'} has left the room`,
            type: 'info'
          }));
        }
      }
    };

    // CONSOLIDATED: Single handlePlayerLeftRoom function for game leave events
    const handlePlayerLeftRoom = (data) => {
      console.log('👋 Player left room (from game):', data);
      
      if (data.userId === data.currentUserId) {
        // Current user left - clean up all state
        console.log('🧹 Current user left room, cleaning up state...');
        
        // Clear room state
        dispatch(clearRoomData());
        
        // Clear game state 
        dispatch(resetGame());
        
        // Clear room-specific chat data (but keep home conversation)
        if (data.roomId) {
          dispatch(removeRoomFromChat({ roomId: data.roomId }));
        }
        
        // Reset chat to home conversation and clear all room-related chat state
        const authState = store.getState?.()?.auth;
        const homeConversationId = authState?.homeConversationId;
        
        // Clear active room first
        dispatch(setActiveRoom(null));
        
        // Set home conversation if available
        if (homeConversationId && homeConversationId !== 'pending') {
          dispatch(setActiveConversation(homeConversationId));
          // Join home conversation socket room
          emitSocketEvent('join_conversation', homeConversationId);
        }
        
        // Navigate to home
        if (window.location.pathname !== '/') {
          navigate('/');
        }
        
        // Show toast to confirm leaving (but only once)
        const leaveEventKey = `current_user_left_${data.roomId}`;
        if (!eventTimestamps.current.has(leaveEventKey) || 
            (Date.now() - eventTimestamps.current.get(leaveEventKey)) > 5000) {
          eventTimestamps.current.set(leaveEventKey, Date.now());
          dispatch(addToast({
            message: 'You have left the room',
            type: 'info'
          }));
        }
      } else {
        // Another player left - update room data and show toast
        if (data.roomId && data.userId) {
          dispatch(removePlayerFromRoom({
            playerId: data.userId
          }));
        }
        
        // Use same global deduplication key as handleUserLeftRoom
        const globalEventKey = `any_user_left_${data.userId}_${data.roomId}`;
        if (!eventTimestamps.current.has(globalEventKey) || 
            (Date.now() - eventTimestamps.current.get(globalEventKey)) > 5000) {
          eventTimestamps.current.set(globalEventKey, Date.now());
          dispatch(addToast({
            message: 'A player has left the room',
            type: 'info'
          }));
        }
      }
    };

    // Room management events
    const handleRoomClosed = (data) => {
      console.log('🚪 Room closed:', data);
      
      const roomId = data.roomId;
      
      if (roomId) {
        dispatch(removeRoomFromChat({ roomId }));
        
        const currentRoomState = store.getState?.()?.room?.data;
        if (currentRoomState && currentRoomState._id === roomId) {
          dispatch(clearRoomData());
        }
      }
      
      const message = data.reason === 'time_expired' 
        ? 'Time limit exceeded! The room has been closed.' 
        : 'The room has been closed.';
      
      if (window.location.pathname !== '/') {
        navigate('/');
      }
      
      dispatch(addToast({
        message,
        type: 'warning'
      }));
    };

    const handleGameTimeExpired = (data) => {
      console.log('⏰ Game time expired:', data);
    };

    // Whiteboard event handlers with deduplication
    const handleWhiteboardStrokeAdded = (data) => {
      // Use stroke ID for more reliable deduplication
      const strokeKey = `stroke_${data.stroke?.id}`;
      if (eventTimestamps.current.has(strokeKey)) {
        const lastTime = eventTimestamps.current.get(strokeKey);
        if (Date.now() - lastTime < 1000) { // 1 second deduplication
          console.log(`🔄 Duplicate stroke filtered: ${data.stroke?.id}`);
          return;
        }
      }
      eventTimestamps.current.set(strokeKey, Date.now());
      
      console.log('🎨 Stroke added to whiteboard:', data);
      if (data.stroke) {
        dispatch(addStrokeToWhiteboard({ stroke: data.stroke }));
        window.dispatchEvent(new CustomEvent('whiteboardStrokeAdded', { detail: data }));
      }
    };

    const handleWhiteboardStateSync = (data) => {
      if (isDuplicateEvent('whiteboard_state_sync', data)) return;
      console.log('🎨 Whiteboard state sync received:', data);
      dispatch(setWhiteboardState({
        gameId: data.gameId,
        strokes: data.strokes || [],
        background: data.background,
        dimensions: data.dimensions,
        collaborators: data.collaborators || [],
        version: data.version
      }));
      window.dispatchEvent(new CustomEvent('whiteboardStateSync', { detail: data }));
    };

    const handleWhiteboardCleared = (data) => {
      if (isDuplicateEvent('whiteboard_cleared', data)) return;
      console.log('🎨 Whiteboard cleared:', data);
      dispatch(clearWhiteboard());
      window.dispatchEvent(new CustomEvent('whiteboardCleared', { detail: data }));
    };

    const handleWhiteboardUndo = (data) => {
      if (isDuplicateEvent('whiteboard_undo', data)) return;
      console.log('🎨 Whiteboard undo:', data);
      if (data.strokeId) {
        dispatch(removeStrokeFromWhiteboard({ strokeId: data.strokeId }));
        window.dispatchEvent(new CustomEvent('whiteboardUndo', { detail: data }));
      }
    };

    const handleWhiteboardDrawStart = (data) => {
      if (isDuplicateEvent('whiteboard_draw_start', data)) return;
      window.dispatchEvent(new CustomEvent('whiteboardDrawStart', { detail: data }));
    };

    const handleWhiteboardDrawMove = (data) => {
      if (isDuplicateEvent('whiteboard_draw_move', data)) return;
      window.dispatchEvent(new CustomEvent('whiteboardDrawMove', { detail: data }));
    };

    const handleWhiteboardToolChange = (data) => {
      if (isDuplicateEvent('whiteboard_tool_change', data)) return;
      window.dispatchEvent(new CustomEvent('whiteboardToolChange', { detail: data }));
    };

    // Puzzle event handlers
    const handlePuzzleStateSync = (data) => {
      if (isDuplicateEvent('puzzle_state_sync', data)) return;
      console.log('🧩 Puzzle state sync received:', data);
      dispatch(setPuzzleState({
        puzzle: data.puzzle,
        moves: data.moves,
        startTime: data.startTime,
        endTime: data.endTime
      }));
    };

    const handlePieceMoved = (data) => {
      if (isDuplicateEvent('piece_moved', data)) return;
      console.log('🧩 Piece moved:', data);
      dispatch(updatePuzzlePiece({
        pieceId: data.pieceId,
        toPosition: data.toPosition,
        isCorrectlyPlaced: data.isCorrectlyPlaced
      }));
      if (data.totalMoves) {
        dispatch(updatePuzzleMoves(data.totalMoves));
      }
    };

    const handlePuzzleCompleted = (data) => {
      if (isDuplicateEvent('puzzle_completed', data)) return;
      console.log('🎉 Puzzle completed:', data);
      dispatch(completePuzzle({
        completedAt: data.completedAt
      }));
      dispatch(addToast({
        message: '🎉 Puzzle completed! Congratulations!',
        type: 'success'
      }));
    };

    const handlePuzzleReset = (data) => {
      if (isDuplicateEvent('puzzle_reset', data)) return;
      console.log('🔄 Puzzle reset:', data);
      dispatch(resetPuzzle({
        newStartTime: data.newStartTime
      }));
      dispatch(addToast({
        message: '🔄 Puzzle has been reset!',
        type: 'info'
      }));
    };

    // Error handling
    const handleError = (data) => {
      console.error('❌ Socket error received:', data);
      
      if (data.strokeId) {
        window.dispatchEvent(new CustomEvent('whiteboardError', { detail: data }));
      }
    };

    // Add catch-all listener for debugging (disabled in development due to hot reloading)
    // socket.onAny((eventName, ...args) => {
    //   if (eventName.includes('invitation')) {
    //     console.log('🔔 SOCKET EVENT RECEIVED:', eventName, ...args);
    //   }
    //   if (eventName.includes('game_')) {
    //     console.log(`🎯 ${user?.name} received:`, eventName, ...args);
    //   }
    // });
    
    // Register all event listeners
    socket.on('initial_data', handleInitialData);
    socket.on('conversations_update', handleConversationsUpdate);
    socket.on('messages_update', handleMessagesUpdate);
    socket.on('room_data_update', handleRoomDataUpdate);
    socket.on('message_received', handleMessageReceived);
    socket.on('message_sent', handleMessageSent);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);
    socket.on('room_users', handleRoomUsers);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_removed', handlePlayerRemoved);
    socket.on('game_state_update', handleGameStateUpdate);
    socket.on('game_starting', handleGameStarting);
    socket.on('game_started', handleGameStarted);
    socket.on('game_ended', handleGameEnded);
    socket.on('new_conversation', handleNewConversation);
    socket.on('room_invitation', handleRoomInvitation);
    socket.on('invitation_accepted', handleInvitationAccepted);
    socket.on('user_joined_room', handleUserJoinedRoom);
    socket.on('user_left_room', handleUserLeftRoom);
    socket.on('player_left_room', handlePlayerLeftRoom);
    socket.on('room_closed', handleRoomClosed);
    socket.on('game_time_expired', handleGameTimeExpired);
    socket.on('whiteboard_stroke_added', handleWhiteboardStrokeAdded);
    socket.on('whiteboard_state_sync', handleWhiteboardStateSync);
    socket.on('whiteboard_cleared', handleWhiteboardCleared);
    socket.on('whiteboard_undo', handleWhiteboardUndo);
    socket.on('whiteboard_draw_start', handleWhiteboardDrawStart);
    socket.on('whiteboard_draw_move', handleWhiteboardDrawMove);
    socket.on('whiteboard_tool_change', handleWhiteboardToolChange);
    socket.on('puzzle_state_sync', handlePuzzleStateSync);
    socket.on('piece_moved', handlePieceMoved);
    socket.on('puzzle_completed', handlePuzzleCompleted);
    socket.on('puzzle_reset', handlePuzzleReset);
    socket.on('error', handleError);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket event handlers');
      handlersRegistered.current = false;
      
      socket.off('initial_data', handleInitialData);
      socket.off('conversations_update', handleConversationsUpdate);
      socket.off('messages_update', handleMessagesUpdate);
      socket.off('room_data_update', handleRoomDataUpdate);
      socket.off('message_received', handleMessageReceived);
      socket.off('message_sent', handleMessageSent);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.off('room_users', handleRoomUsers);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_removed', handlePlayerRemoved);
      socket.off('game_state_update', handleGameStateUpdate);
      socket.off('game_starting', handleGameStarting);
      socket.off('game_started', handleGameStarted);
      socket.off('game_ended', handleGameEnded);
      socket.off('new_conversation', handleNewConversation);
      socket.off('room_invitation', handleRoomInvitation);
      socket.off('invitation_accepted', handleInvitationAccepted);
      socket.off('user_joined_room', handleUserJoinedRoom);
      socket.off('user_left_room', handleUserLeftRoom);
      socket.off('player_left_room', handlePlayerLeftRoom);
      socket.off('room_closed', handleRoomClosed);
      socket.off('game_time_expired', handleGameTimeExpired);
      socket.off('whiteboard_stroke_added', handleWhiteboardStrokeAdded);
      socket.off('whiteboard_state_sync', handleWhiteboardStateSync);
      socket.off('whiteboard_cleared', handleWhiteboardCleared);
      socket.off('whiteboard_undo', handleWhiteboardUndo);
      socket.off('whiteboard_draw_start', handleWhiteboardDrawStart);
      socket.off('whiteboard_draw_move', handleWhiteboardDrawMove);
      socket.off('whiteboard_tool_change', handleWhiteboardToolChange);
      socket.off('puzzle_state_sync', handlePuzzleStateSync);
      socket.off('piece_moved', handlePieceMoved);
      socket.off('puzzle_completed', handlePuzzleCompleted);
      socket.off('puzzle_reset', handlePuzzleReset);
      socket.off('error', handleError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [dispatch, navigate, isConnected]);
};

export default useSocketEventHandlers; 


