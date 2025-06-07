# 🧩 PuzzLink - Real-time Collaborative Puzzle Platform

Welcome to **PuzzLink**, the ultimate real-time collaborative puzzle-solving platform that brings people together through the joy of puzzles! 🎮✨

## 👨‍💻 Creators

**Built with ❤️ by:**
- **Adi Vered** 🚀
- **Shiran Reich** 🌟

---

## 🌟 Features

### 🧩 **Core Puzzle Features**
- **Real-time Collaboration** 👥 - Solve puzzles together with friends in real-time
- **Custom Puzzle Creation** 🎨 - Upload your own images and create personalized puzzles
- **Adaptive Difficulty** 🧠 - AI-powered difficulty adjustment based on skill level
- **Multiple Game Modes** 🎯 - Puzzle solving and collaborative whiteboard drawing

### 🏠 **Room Management**
- **Private Rooms** 🔒 - Create secure rooms for friends and family
- **Public Rooms** 🌐 - Join community puzzle sessions
- **Room Invitations** 📧 - Send invites via real-time notifications
- **Player Management** 👑 - Room creators can manage participants

### 💬 **Social Features**
- **Real-time Chat** 💭 - Communicate while solving puzzles
- **Progress Tracking** 📊 - Monitor your improvement over time
- **Leaderboards** 🏆 - Compete with other puzzle enthusiasts
- **Achievement System** 🎖️ - Unlock rewards for your puzzle-solving skills

### 🎨 **UI/UX Features**
- **Dark/Light Theme** 🌙☀️ - Toggle between beautiful themes
- **Responsive Design** 📱💻 - Seamless experience across all devices
- **Smooth Animations** ✨ - GSAP-powered animations and transitions
- **Modern UI** 🎨 - Beautiful, intuitive interface with Tailwind CSS

---

## 🚀 Getting Started

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) 📦
- **npm** or **yarn** 📦
- **MongoDB** 🍃 (local or cloud instance)
- **nodemon** (globally installed) 🔄

```bash
# Install nodemon globally
npm install -g nodemon
```

### 🔧 Installation

#### 1. **Clone the Repository**
```bash
git clone https://github.com/your-username/puzzlink.git
cd puzzlink
```

#### 2. **Backend Setup** 🔧
```bash
cd backend
npm install
```

#### 3. **Frontend Setup** 🎨
```bash
cd ../frontend
npm install
```

### 🔐 Environment Configuration

#### **Backend Environment** (.env in `/backend`)
Create a `.env` file in the backend directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/puzzlink
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/puzzlink

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### **Frontend Environment** (.env in `/frontend`)
Create a `.env` file in the frontend directory:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Google OAuth (Optional)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### ▶️ Running the Application

#### **Start Backend Server** 🔙
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

#### **Start Frontend Development Server** 🎨
```bash
cd frontend
npm start
# Application will open at http://localhost:3000
```

#### **Production Build** 🏗️
```bash
# Frontend production build
cd frontend
npm run build

# Backend production
cd backend
npm start
```

---

## 🏗️ Architecture & Design

### 🎯 **Tech Stack**

#### **Frontend** 🎨
- **React.js** ⚛️ - Modern UI library
- **Redux Toolkit** 🔄 - State management
- **Socket.io Client** 🔌 - Real-time communication
- **Tailwind CSS** 🎨 - Utility-first CSS framework
- **GSAP** ✨ - High-performance animations
- **React Router** 🛣️ - Client-side routing

#### **Backend** 🔧
- **Node.js** 📦 - Runtime environment
- **Express.js** 🚂 - Web application framework
- **Socket.io** 🔌 - Real-time bidirectional communication
- **MongoDB** 🍃 - NoSQL database
- **Mongoose** 🏷️ - ODM for MongoDB
- **JWT** 🔐 - Authentication
- **Passport.js** 🛂 - Authentication middleware

### 🗄️ **Database Models**

#### **User Model** 👤
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  picture: String,
  currentRoom: ObjectId (ref: Room),
  isOnline: Boolean,
  lastActive: Date,
  createdAt: Date
}
```

#### **Room Model** 🏠
```javascript
{
  name: String,
  creator: ObjectId (ref: User),
  players: [ObjectId] (ref: User),
  pendingInvitations: [ObjectId] (ref: User),
  gameMode: String (puzzle, drawable),
  status: String (waiting, inProgress, completed),
  currentGame: ObjectId (ref: Game),
  timeLimit: Number,
  turnBased: Boolean,
  image: String,
  createdAt: Date
}
```

#### **Game Model** 🎮
```javascript
{
  room: ObjectId (ref: Room),
  puzzle: ObjectId (ref: Puzzle),
  whiteboard: ObjectId (ref: Whiteboard),
  startTime: Date,
  endTime: Date,
  moves: Number
}
```

#### **Puzzle Model** 🧩
```javascript
{
  originalImage: {
    url: String,
    width: Number,
    height: Number
  },
  pieces: [ObjectId] (ref: PieceSchema),
  isCompleted: Boolean,
  completedAt: Date
}
```

### 🏛️ **SOLID Principles Implementation**

Our codebase follows **SOLID** principles for maintainable and scalable code:

#### **S - Single Responsibility Principle** 📝
- Each component has one clear responsibility
- Separate data, presentation, and business logic
- Example: `FeatureCard` only handles feature display

#### **O - Open/Closed Principle** 🔓
- Components are open for extension, closed for modification
- Theme system allows easy addition of new themes
- Plugin-based animations with GSAP

#### **L - Liskov Substitution Principle** 🔄
- Card components (`FeatureCard`, `PriceCard`, `TestimonialCard`) are interchangeable
- Consistent props interface across similar components

#### **I - Interface Segregation Principle** 🔌
- Small, focused hooks and utilities
- Specific context providers for different features
- Modular Socket.io handlers

#### **D - Dependency Inversion Principle** ⬆️
- Higher-level modules don't depend on lower-level modules
- Abstract Socket.io through custom hooks
- Database abstraction through Mongoose models

### 📁 **Project Structure**

```
puzzlink/
├── 📁 backend/
│   ├── 📁 controllers/     # Request handlers
│   ├── 📁 models/         # Database models
│   ├── 📁 routes/         # API routes
│   ├── 📁 middlewares/    # Custom middleware
│   ├── 📁 sockets/        # Socket.io handlers
│   ├── 📁 config/         # Configuration files
│   └── 📄 app.js          # Express application
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 app/           # App configuration & store
│   │   ├── 📁 features/      # Feature-based modules
│   │   │   ├── 📁 auth/      # Authentication
│   │   │   ├── 📁 dashboard/ # User dashboard
│   │   │   ├── 📁 game/      # Game functionality
│   │   │   ├── 📁 home/      # Landing page
│   │   │   │   └── 📁 sections/ # Landing page sections
│   │   │   └── 📁 rooms/     # Room management
│   │   ├── 📁 shared/        # Shared components
│   │   ├── 📁 hooks/         # Custom React hooks
│   │   └── 📁 utils/         # Utility functions
│   └── 📄 package.json
└── 📄 README.md
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 🚢 Deployment

### **Frontend Deployment (Netlify/Vercel)**
```bash
cd frontend
npm run build
# Deploy the build folder
```

### **Backend Deployment (Heroku/Railway)**
```bash
# Set environment variables in your hosting platform
# Deploy backend with MongoDB Atlas connection
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. 🍴 Fork the repository
2. 🌱 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Socket.io** for real-time communication 🔌
- **MongoDB** for flexible data storage 🍃
- **React** community for amazing tools ⚛️
- **GSAP** for smooth animations ✨
- All contributors who made this project possible! 🌟

---

## 📞 Support

If you encounter any issues or have questions:

- 🐛 [Open an issue](https://github.com/your-username/puzzlink/issues)
- 💬 Join our community discussions
- 📧 Contact the creators: Adi Vered & Shiran Reich

---

**Happy Puzzling! 🧩✨**

*Built with passion for bringing people together through the joy of collaborative puzzle-solving.* 