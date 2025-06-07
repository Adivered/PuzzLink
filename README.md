# PuzzLink - Real-Time Collaborative Puzzle Platform

**Created by Adi Vered and Shiran Reich**

A real-time collaborative puzzle platform where users can create rooms, invite friends, and solve puzzles together with live synchronization and interactive features.

## Features

### Core Puzzle Features
- Real-time collaborative puzzle solving
- Live piece movement synchronization
- Multiple puzzle types (jigsaw, custom images)
- Adaptive difficulty levels
- Turn-based and free-play modes

### Room Management
- Create and manage puzzle rooms
- Invite players via email or direct links
- Private room conversations
- Real-time player status tracking

### Social Features
- Global home conversation
- Private messaging between users
- User profiles with avatars
- Online presence indicators

### Drawing and Creativity
- Interactive whiteboard functionality
- Custom puzzle creation from drawings
- Real-time drawing synchronization
- Multiple brush tools and colors

## Tech Stack

- **Frontend**: React, Redux Toolkit, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens, Google OAuth
- **Real-time**: WebSocket connections

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Zoo
```

2. Install backend dependencies
```bash
cd backend
npm install
npm install -g nodemon
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### Environment Setup

#### Backend (.env)
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
COOKIE_SECRET=your_cookie_secret_key
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
SERVER_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Frontend (.env)
```env
REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### Running the Application

1. Start the backend server
```bash
cd backend
nodemon app.js
```

2. Start the frontend development server
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Architecture

### Database Models

#### User Schema
- Authentication and profile information
- Online status and activity tracking
- Room associations and preferences

#### Room Schema
- Room configuration and settings
- Player management and invitations
- Embedded chat functionality
- Game state tracking

#### Game Schema
- Active game sessions
- Puzzle and whiteboard references
- Player turn management
- Real-time state synchronization

#### Puzzle Schema
- Puzzle metadata and configuration
- Piece positioning and state
- Progress tracking
- Image handling

### API Endpoints

#### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/verify` - Token verification
- POST `/api/auth/google` - Google OAuth

#### Rooms
- GET `/api/rooms` - Get user's rooms
- POST `/api/rooms` - Create new room
- PUT `/api/rooms/:id` - Update room
- DELETE `/api/rooms/:id` - Delete room
- POST `/api/rooms/:id/invite` - Invite players

#### Games
- POST `/api/games` - Start new game
- PUT `/api/games/:id` - Update game state
- GET `/api/games/:id` - Get game details

### Socket Events

#### Connection Management
- `connection` - User connects
- `disconnect` - User disconnects
- `join-room` - Join specific room
- `leave-room` - Leave room

#### Game Events
- `puzzle-piece-move` - Piece movement
- `puzzle-piece-drop` - Piece placement
- `game-state-update` - Game state changes
- `turn-change` - Turn-based game progression

#### Drawing Events
- `drawing-start` - Start drawing
- `drawing-data` - Drawing stroke data
- `drawing-end` - End drawing session

## Project Structure

```
Zoo/
├── backend/
│   ├── controllers/         # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── sockets/            # Socket event handlers
│   ├── middlewares/        # Authentication & validation
│   ├── config/             # Database configuration
│   └── app.js              # Express application
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── features/       # Feature-based modules
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
└── README.md
```

## Development Principles

The codebase follows SOLID principles:

- **Single Responsibility**: Each component and module has a focused purpose
- **Open/Closed**: Components are extensible without modification
- **Liskov Substitution**: Proper inheritance hierarchies
- **Interface Segregation**: Specific interfaces for different use cases
- **Dependency Inversion**: High-level modules don't depend on low-level details

## Testing

Run the test suite:
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

### Environment Variables
Set production environment variables for:
- Database connections
- JWT secrets
- OAuth credentials
- CORS origins 
