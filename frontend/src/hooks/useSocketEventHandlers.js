import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getSocketInstance, setRoomUsers as setSocketRoomUsers, setOnlineUsers as setSocketOnlineUsers, addPendingInvitation, removePendingInvitation } from '../store/socketSlice';
import store from '../store';
import { addToast } from '../store/toastSlice';
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
  setRoomDetails
} from '../store/chatSlice';
import { 
  addPlayerToRoom, 
  removePlayerFromRoom,
  initializeRoomData,
  updateRoomData,
  updatePlayersFromSocket,
  updateGameStateFromSocket,
  clearRoomData
} from '../store/roomSlice';
import { 
  setWhiteboardState,
  addStrokeToWhiteboard,
  removeStrokeFromWhiteboard,
  clearWhiteboard,
  updateCollaboratorCursor,
  setPuzzleState,
  updatePuzzlePiece,
  updatePuzzleMoves,
  completePuzzle,
  resetPuzzle,
  addPuzzlePlayer,
  removePuzzlePlayer,
  addHint
} from '../store/gameSlice';

const useSocketEventHandlers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // OPTIMIZATION: Track processed events to prevent duplicates
  const processedEvents = useRef(new Map());
  const eventDeduplicationWindow = 1000; // 1 second window

  const isDuplicateEvent = (eventType, data) => {
    const eventKey = `${eventType}_${data.roomId || data.chatId || data._id}`;
    const now = Date.now();
    
    // Check if we've processed this event recently
    const lastProcessed = processedEvents.current.get(eventKey);
    if (lastProcessed && (now - lastProcessed) < eventDeduplicationWindow) {
      console.log(`🔄 Skipping duplicate ${eventType} event`);
      return true;
    }
    
    // Store the current timestamp
    processedEvents.current.set(eventKey, now);
    
    // OPTIMIZATION: Cleanup old entries periodically to prevent memory leaks
    if (processedEvents.current.size > 100) {
      const cutoffTime = now - eventDeduplicationWindow;
      for (const [key, timestamp] of processedEvents.current.entries()) {
        if (timestamp < cutoffTime) {
          processedEvents.current.delete(key);
        }
      }
    }
    
    return false;
  };

  useEffect(() => {
    const socket = getSocketInstance();
    if (!socket) return;

    // Data initialization events (replace API calls)
    const handleInitialData = (data) => {
      const { conversations, roomDetails, messages, currentRoom } = data;
      
      // Initialize chat data first - this is separate from room data
      dispatch(initializeChatData({
        conversations: conversations || [],
        roomDetails: roomDetails || {},
        messages: messages || {}
      }));

      // Check if user is navigating to a specific room URL or game URL
      const isNavigatingToRoom = window.location.pathname.startsWith('/rooms/');
      const isNavigatingToGame = window.location.pathname.startsWith('/game/');
      const targetRoomFromURL = isNavigatingToRoom ? window.location.pathname.split('/rooms/')[1] : null;
      
      // Get user's home room ID to distinguish it from game rooms
      const userHomeRoomId = store.getState?.()?.auth?.user?.homeRoomId;
      
      if (targetRoomFromURL && roomDetails && roomDetails[targetRoomFromURL]) {
        // User is navigating to a specific room and we have data for it
        const roomData = roomDetails[targetRoomFromURL];
        
        // Only initialize if it's NOT the home room (home room is chat-only)
        if (roomData._id !== userHomeRoomId) {
          dispatch(initializeRoomData(roomData));
        } else {
          // User is trying to access home room as game room - redirect to home
          navigate('/');
        }
      } else if (!isNavigatingToRoom && !isNavigatingToGame) {
        // User is not on a room URL or game URL (probably on home page)
        // Initialize room data as null since they're not trying to access a room
        dispatch(initializeRoomData(null));
        
        // Auto-navigate to their private room if they have one and it's not the home room
        if (currentRoom && currentRoom._id !== userHomeRoomId) {
          navigate(`/rooms/${currentRoom._id}`);
        }
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

    // OPTIMIZED: Consolidated room data update handler with deduplication
    const handleRoomDataUpdate = (data) => {
      const { roomId, roomData } = data;
      
      // OPTIMIZATION: Prevent duplicate room data updates
      if (isDuplicateEvent('room_data_update', data)) return;
      
      // Enhanced logging for debugging room name issues
      console.log('🏠 Room data update received:', {
        roomId: roomId?.slice?.(-8) || roomId,
        roomName: roomData?.name,
        hasRoomData: !!roomData,
        roomDataKeys: roomData ? Object.keys(roomData) : []
      });
      
      // Get user's home room ID to prevent home room from being treated as game room
      const userHomeRoomId = store.getState?.()?.auth?.user?.homeRoomId;
      
      // OPTIMIZATION: Single dispatch with validated data
      if (roomData && roomData._id === roomId) {
        // ALWAYS update chat room details first for proper chat display
        dispatch(setRoomDetails({ roomId, roomData }));
        console.log(`✅ Chat room details updated for ${roomData.name || roomId?.slice?.(-8)}`);
        
        // Only update room slice if it's NOT the home room (home room is chat-only)
        if (roomId !== userHomeRoomId) {
          // Check if room data is not initialized yet (user navigated to room URL directly)
          const currentRoomState = store.getState?.()?.room;
          
          if (!currentRoomState?.isInitialized) {
            // First time getting room data - initialize it
            console.log(`🏠 Initializing room data for ${roomData.name || roomId?.slice?.(-8)}`);
            dispatch(initializeRoomData(roomData));
          } else {
            // Room already initialized - just update it
            // OPTIMIZATION: Batch updates to prevent multiple re-renders
            const batchedUpdates = () => {
              // Update both chat and room slices in a coordinated way
              dispatch(updateRoomFromSocket({ roomId, roomData }));
              dispatch(updateRoomData(roomData));
              
              // OPTIMIZATION: Also ensure players are properly set with deduplication
              if (roomData.players && Array.isArray(roomData.players)) {
                const uniquePlayers = roomData.players.filter((player, index, array) => 
                  player && player._id && array.findIndex(p => p._id === player._id) === index
                );
                dispatch(updatePlayersFromSocket(uniquePlayers));
              }
            };
            
            // Use setTimeout to batch updates and reduce render frequency
            setTimeout(batchedUpdates, 0);
          }
        } else {
          // This is home room data - only update chat slice, not room slice
          console.log(`🏠 Updating Home room chat data`);
          dispatch(updateRoomFromSocket({ roomId, roomData }));
        }
      } else {
        console.warn('⚠️ Invalid room data update:', { roomId, roomData });
      }
    };

    // Chat-related events
    const handleMessageReceived = (data) => {
      dispatch(addMessage(data));
      
      // If this is a response to an optimistic message, mark it as sent
      if (data.tempId) {
        dispatch(markMessageAsSent({
          tempId: data.tempId,
          messageId: data._id
        }));
      }
    };

    const handleMessageSent = (data) => {
      // Mark optimistic message as sent
      if (data.tempId) {
        dispatch(markMessageAsSent({
          tempId: data.tempId,
          messageId: data._id
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

    // OPTIMIZED: Consolidated player events with deduplication
    const handlePlayerJoined = (data) => {
      // OPTIMIZATION: Validate data structure first
      if (!data || !data.roomId) {
        console.warn('⚠️ Invalid player joined event - missing roomId');
        return;
      }
      
      // OPTIMIZATION: Prefer full players list for consistency
      if (data.players && Array.isArray(data.players)) {
        // Deduplicate and validate players
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
      // OPTIMIZATION: Prefer full players list for consistency
      if (data.players && Array.isArray(data.players)) {
        const uniquePlayers = data.players.filter((player, index, array) => 
          player && player._id && array.findIndex(p => p._id === player._id) === index
        );
        dispatch(updatePlayersFromSocket(uniquePlayers));
      } else if (data.playerId) {
        dispatch(removePlayerFromRoom({ playerId: data.playerId }));
      }
      
      // Show notification if someone else was removed
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
      console.log('🎮 Game starting countdown:', data);
      let countdown = data.countdown || 3;
      
      dispatch(updateGameStateFromSocket({
        status: 'starting',
        countdown: countdown,
        roomId: data.roomId
      }));

      // Start countdown timer
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
      console.log('🎮 Game started:', data);
      dispatch(updateGameStateFromSocket({
        status: 'active',
        gameId: data.gameId,
        startedAt: new Date().toISOString()
      }));

      // Navigate to the game page
      if (data.gameId) {
        console.log('🚀 Navigating to game:', data.gameId);
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
      console.log('Room invitation received:', data);
      
      // Add invitation to pending invitations in Redux store
      dispatch(addPendingInvitation({
        roomId: data.roomId,
        inviterName: data.inviterName,
        timestamp: data.timestamp
      }));
    };

    const handleInvitationAccepted = (data) => {
      console.log('Invitation accepted:', data);
      
      // Remove the invitation from pending list for the inviter
      // This helps clean up the UI for the person who sent the invitation
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
      console.log('User left room:', data);
    };

    // Whiteboard event handlers
    const handleWhiteboardStateSync = (data) => {
      console.log('🔄 Whiteboard state sync received:', {
        gameId: data.gameId,
        strokeCount: data.strokes?.length || 0,
        version: data.version,
        collaboratorCount: data.collaborators?.length || 0
      });
      
      dispatch(setWhiteboardState({
        gameId: data.gameId,
        strokes: data.strokes || [],
        background: data.background,
        dimensions: data.dimensions,
        collaborators: data.collaborators || [],
        version: data.version
      }));
      
      // Dispatch custom event for whiteboard component
      window.dispatchEvent(new CustomEvent('whiteboardStateSync', { detail: data }));
    };

    const handleWhiteboardStrokeAdded = (data) => {
      if (!data.stroke || !data.stroke.id) {
        console.error('❌ Invalid stroke data received:', data);
        return;
      }
      
      dispatch(addStrokeToWhiteboard({
        gameId: data.gameId,
        stroke: data.stroke
      }));
      
      // Dispatch custom event for whiteboard component
      window.dispatchEvent(new CustomEvent('whiteboardStrokeAdded', { detail: data }));
    };

    const handleWhiteboardDrawStart = (data) => {
      // Dispatch custom event for whiteboard component  
      window.dispatchEvent(new CustomEvent('whiteboardDrawStart', { detail: data }));
    };

    const handleWhiteboardDrawMove = (data) => {
      // Dispatch custom event for whiteboard component
      window.dispatchEvent(new CustomEvent('whiteboardDrawMove', { detail: data }));
    };

    const handleWhiteboardCleared = (data) => {
      console.log('🧹 Whiteboard cleared:', {
        gameId: data.gameId,
        clearedBy: data.clearedBy,
        clearAll: data.clearAll,
        version: data.version
      });
      
      dispatch(clearWhiteboard({ gameId: data.gameId }));
      
      // Dispatch custom event for whiteboard component
      window.dispatchEvent(new CustomEvent('whiteboardCleared', { detail: data }));
    };

    const handleWhiteboardUndo = (data) => {
      console.log('↩️ Whiteboard undo:', {
        gameId: data.gameId,
        strokeId: data.strokeId,
        undoneBy: data.undoneBy,
        version: data.version
      });
      
      dispatch(removeStrokeFromWhiteboard({
        gameId: data.gameId,
        strokeId: data.strokeId
      }));
      
      // Dispatch custom event for whiteboard component
      window.dispatchEvent(new CustomEvent('whiteboardUndo', { detail: data }));
    };

    const handleWhiteboardUserCursor = (data) => {
      dispatch(updateCollaboratorCursor({
        gameId: data.gameId,
        userId: data.userId,
        cursor: { x: data.x, y: data.y, visible: data.visible }
      }));
      
      // Dispatch custom event for whiteboard component
      window.dispatchEvent(new CustomEvent('whiteboardUserCursor', { detail: data }));
    };

    const handleWhiteboardToolChange = (data) => {
      // Dispatch custom event for whiteboard component
      window.dispatchEvent(new CustomEvent('whiteboardToolChange', { detail: data }));
    };

    // Puzzle event handlers
    const handlePuzzleStateSync = (data) => {
      console.log('🧩 Puzzle state sync received:', {
        gameId: data.gameId,
        piecesCount: data.puzzle?.pieces?.length || 0,
        moves: data.moves,
        isCompleted: data.puzzle?.isCompleted
      });
      
      // Defensive check: if there are pieces without positions, the puzzle shouldn't be completed
      const piecesInBank = data.puzzle?.pieces?.filter(p => !p.currentPosition) || [];
      const shouldMarkAsCompleted = data.puzzle?.isCompleted && piecesInBank.length === 0;
      
      dispatch(setPuzzleState({
        puzzle: {
          ...data.puzzle,
          isCompleted: shouldMarkAsCompleted
        },
        moves: data.moves,
        startTime: data.startTime,
        endTime: data.endTime
      }));
    };

    const handlePieceMoved = (data) => {
      console.log('🧩 Piece moved event received:', {
        pieceId: data.pieceId,
        fromPosition: data.fromPosition,
        toPosition: data.toPosition,
        movedBy: data.movedBy,
        isCorrectlyPlaced: data.isCorrectlyPlaced
      });
      
      dispatch(updatePuzzlePiece({
        pieceId: data.pieceId,
        fromPosition: data.fromPosition,
        toPosition: data.toPosition,
        isCorrectlyPlaced: data.isCorrectlyPlaced,
        movedBy: data.movedBy
      }));
      
      if (data.totalMoves !== undefined) {
        dispatch(updatePuzzleMoves(data.totalMoves));
      }
    };

    const handlePuzzleCompleted = (data) => {
      console.log('🎉 Puzzle completed!', {
        gameId: data.gameId,
        completedBy: data.completedBy,
        totalMoves: data.totalMoves,
        duration: data.duration
      });
      
      dispatch(completePuzzle({
        completedAt: data.completedAt,
        completedBy: data.completedBy
      }));
      
      if (data.totalMoves !== undefined) {
        dispatch(updatePuzzleMoves(data.totalMoves));
      }
    };

    const handlePuzzleReset = (data) => {
      console.log('🔄 Puzzle reset:', {
        gameId: data.gameId,
        resetBy: data.resetBy
      });
      
      dispatch(resetPuzzle({
        newStartTime: data.newStartTime
      }));
    };

    const handlePlayerJoinedPuzzle = (data) => {
      console.log('👤 Player joined puzzle:', data);
      dispatch(addPuzzlePlayer({ userId: data.userId }));
    };

    const handlePlayerLeftPuzzle = (data) => {
      console.log('👋 Player left puzzle:', data);
      dispatch(removePuzzlePlayer({ userId: data.userId }));
    };

    const handleHintProvided = (data) => {
      console.log('💡 Hint provided:', data);
      dispatch(addHint({
        pieceId: data.pieceId,
        correctPosition: data.correctPosition,
        currentPosition: data.currentPosition
      }));
    };

    const handleHintUsed = (data) => {
      console.log('💡 Hint used by:', data.usedBy);
    };

    const handlePuzzleError = (data) => {
      console.error('🧩 Puzzle error:', data);
    };

    // Room management events
    const handleRoomClosed = (data) => {
      console.log('🚪 Room closed:', data);
      
      // Get the room ID from the data
      const roomId = data.roomId;
      
      // Clean up room state from both reducers
      if (roomId) {
        // Remove room from chat reducer (room list, messages, etc.)
        dispatch(removeRoomFromChat({ roomId }));
        
        // Clear room data from room reducer if it's the current room
        const currentRoomState = store.getState?.()?.room?.data;
        if (currentRoomState && currentRoomState._id === roomId) {
          dispatch(clearRoomData());
        }
      }
      
      // Show notification and navigate to home
      const message = data.reason === 'time_expired' 
        ? 'Time limit exceeded! The room has been closed.' 
        : 'The room has been closed.';
      
      // Navigate to home page
      navigate('/');
      
      // Show toast notification using the existing toast system
      dispatch(addToast({
        message,
        type: 'warning'
      }));
    };

    const handlePlayerLeftRoom = (data) => {
      console.log('👋 Player left room:', data);
      if (data.userId === data.currentUserId) {
        // Current user left, navigate to home
        navigate('/');
      } else {
        // Show notification that another player left
        dispatch(addToast({
          message: 'A player has left the room',
          type: 'info'
        }));
      }
    };

    const handleGameTimeExpired = (data) => {
      console.log('⏰ Game time expired:', data);
      // This will be followed by room_closed event
    };

    // Error handling
    const handleError = (data) => {
      console.error('❌ Socket error received:', data);
      
      // If it's a stroke-related error, dispatch event for whiteboard to handle
      if (data.strokeId) {
        window.dispatchEvent(new CustomEvent('whiteboardError', { detail: data }));
      }
    };

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
    
    // Whiteboard events
    socket.on('whiteboard_state_sync', handleWhiteboardStateSync);
    socket.on('whiteboard_stroke_added', handleWhiteboardStrokeAdded);
    socket.on('whiteboard_draw_start', handleWhiteboardDrawStart);
    socket.on('whiteboard_draw_move', handleWhiteboardDrawMove);
    socket.on('whiteboard_cleared', handleWhiteboardCleared);
    socket.on('whiteboard_undo', handleWhiteboardUndo);
    socket.on('whiteboard_user_cursor', handleWhiteboardUserCursor);
    socket.on('whiteboard_tool_change', handleWhiteboardToolChange);

    // Puzzle events
    socket.on('puzzle_state_sync', handlePuzzleStateSync);
    socket.on('piece_moved', handlePieceMoved);
    socket.on('puzzle_completed', handlePuzzleCompleted);
    socket.on('puzzle_reset', handlePuzzleReset);
    socket.on('player_joined_puzzle', handlePlayerJoinedPuzzle);
    socket.on('player_left_puzzle', handlePlayerLeftPuzzle);
    socket.on('hint_provided', handleHintProvided);
    socket.on('hint_used', handleHintUsed);
    socket.on('puzzle_error', handlePuzzleError);

    // Room management events
    socket.on('room_closed', handleRoomClosed);
    socket.on('player_left_room', handlePlayerLeftRoom);
    socket.on('game_time_expired', handleGameTimeExpired);

    // Error handling
    socket.on('error', handleError);

    // Cleanup function
    return () => {
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
      
      // Whiteboard events
      socket.off('whiteboard_state_sync', handleWhiteboardStateSync);
      socket.off('whiteboard_stroke_added', handleWhiteboardStrokeAdded);
      socket.off('whiteboard_draw_start', handleWhiteboardDrawStart);
      socket.off('whiteboard_draw_move', handleWhiteboardDrawMove);
      socket.off('whiteboard_cleared', handleWhiteboardCleared);
      socket.off('whiteboard_undo', handleWhiteboardUndo);
      socket.off('whiteboard_user_cursor', handleWhiteboardUserCursor);
      socket.off('whiteboard_tool_change', handleWhiteboardToolChange);

      // Puzzle events
      socket.off('puzzle_state_sync', handlePuzzleStateSync);
      socket.off('piece_moved', handlePieceMoved);
      socket.off('puzzle_completed', handlePuzzleCompleted);
      socket.off('puzzle_reset', handlePuzzleReset);
      socket.off('player_joined_puzzle', handlePlayerJoinedPuzzle);
      socket.off('player_left_puzzle', handlePlayerLeftPuzzle);
      socket.off('hint_provided', handleHintProvided);
      socket.off('hint_used', handleHintUsed);
      socket.off('puzzle_error', handlePuzzleError);

      // Room management events
      socket.off('room_closed', handleRoomClosed);
      socket.off('player_left_room', handlePlayerLeftRoom);
      socket.off('game_time_expired', handleGameTimeExpired);

      // Error handling
      socket.off('error', handleError);
    };
  }, [dispatch, navigate]);
};

export default useSocketEventHandlers; 