// Socket Event Constants
// This file centralizes all socket event names to avoid magic strings
// and make the codebase more maintainable

const SOCKET_EVENTS = {
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
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
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
  TURN_STARTED: 'turn_started',
  TURN_ENDED: 'turn_ended',
  GAME_PAUSED: 'game_paused',
  GAME_RESUMED: 'game_resumed',
  JOIN_AS_SPECTATOR: 'join_as_spectator',
  REQUEST_GAME_STATE: 'request_game_state',
  GAME_STATE_SYNC: 'game_state_sync',
};

// Room name generators
const ROOM_NAMES = {
  USER: (userId) => `user_${userId}`,
  CONVERSATION: (conversationId) => `conversation_${conversationId}`,
  ROOM: (roomId) => `room_${roomId}`,
  GAME: (gameId) => `game_${gameId}`,
  GAME_SPECTATORS: (gameId) => `game_${gameId}_spectators`,
  HOME: () => 'home', // Special home room identifier
};

module.exports = {
  SOCKET_EVENTS,
  ROOM_NAMES
}; 