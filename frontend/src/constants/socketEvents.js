// Frontend Socket Event Constants
// This should match the backend socket events

export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // User events
  JOIN_USER: 'join_user',
  USER_GOING_OFFLINE: 'user_going_offline',
  USER_ACTIVITY: 'user_activity',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  SWITCH_ROOM: 'switch_room',

  // Chat events
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_ERROR: 'message_error',
  MARK_MESSAGES_READ: 'mark_messages_read',
  MESSAGE_READ: 'message_read',
  ADD_REACTION: 'add_reaction',
  REACTION_ADDED: 'reaction_added',

  // Room events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  USER_JOINED_ROOM: 'user_joined_room',
  USER_LEFT_ROOM: 'user_left_room',
  ROOM_UPDATED: 'room_updated',
  ROOM_UPDATE: 'room_update',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  GAME_STARTING: 'game_starting',
  GAME_STARTED: 'game_started',
  SEND_ROOM_INVITATION: 'send_room_invitation',
  ROOM_INVITATION: 'room_invitation',
  ROOM_INVITATION_RESPONSE: 'room_invitation_response',
  INVITATION_ACCEPTED: 'invitation_accepted',
  GET_ROOM_USERS: 'get_room_users',
  ROOM_USERS: 'room_users',

  // Game events
  JOIN_GAME: 'join_game',
  LEAVE_GAME: 'leave_game',
  PLAYER_JOINED_GAME: 'player_joined_game',
  PLAYER_LEFT_GAME: 'player_left_game',
  PIECE_MOVED: 'piece_moved',
  PIECE_PLACED_CORRECTLY: 'piece_placed_correctly',
  GAME_PROGRESS: 'game_progress',
  GAME_PROGRESS_UPDATE: 'game_progress_update',
  HINT_USED: 'hint_used',
  GAME_COMPLETED: 'game_completed',
  CURSOR_POSITION: 'cursor_position',
  PLAYER_CURSOR: 'player_cursor',

  // Whiteboard events
  WHITEBOARD_JOIN: 'whiteboard_join',
  WHITEBOARD_LEAVE: 'whiteboard_leave',
  WHITEBOARD_DRAW_START: 'whiteboard_draw_start',
  WHITEBOARD_DRAW_MOVE: 'whiteboard_draw_move',
  WHITEBOARD_DRAW_END: 'whiteboard_draw_end',
  WHITEBOARD_STROKE_ADDED: 'whiteboard_stroke_added',
  WHITEBOARD_CLEAR: 'whiteboard_clear',
  WHITEBOARD_CLEARED: 'whiteboard_cleared',
  WHITEBOARD_UNDO: 'whiteboard_undo',
  WHITEBOARD_USER_CURSOR: 'whiteboard_user_cursor',
  WHITEBOARD_TOOL_CHANGE: 'whiteboard_tool_change',
  WHITEBOARD_STROKE_REMOVED: 'whiteboard_stroke_removed',
  WHITEBOARD_ERROR: 'whiteboard_error',

  // Puzzle events
  PUZZLE_JOIN: 'puzzle_join',
  PUZZLE_LEAVE: 'puzzle_leave',
  PUZZLE_MOVE_PIECE: 'puzzle_move_piece',
  PUZZLE_PIECE_MOVED: 'puzzle_piece_moved',
  PUZZLE_STATE_SYNC: 'puzzle_state_sync',
  PUZZLE_COMPLETED: 'puzzle_completed',
  PUZZLE_RESET: 'puzzle_reset',
  PUZZLE_HINT_REQUEST: 'puzzle_hint_request',
  PUZZLE_HINT_PROVIDED: 'puzzle_hint_provided',
  PUZZLE_ERROR: 'puzzle_error'
};

// Room name generators
export const ROOM_NAMES = {
  USER: (userId) => `user_${userId}`,
  CONVERSATION: (conversationId) => `conversation_${conversationId}`,
  ROOM: (roomId) => `room_${roomId}`,
  GAME: (gameId) => `game_${gameId}`,
  GAME_SPECTATORS: (gameId) => `game_${gameId}_spectators`,
}; 