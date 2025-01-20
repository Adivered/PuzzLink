require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const passport = require("./config/passport");
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/default');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
require('./config/passport');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

app.use(session({
  secret: config.cookieSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongoUri,
    ttl: 24 * 60 * 60 // Session TTL (1 day)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game')
const userRoutes = require('./routes/user');
const roomRoutes = require('./routes/room');
const profileRoutes = require('./routes/profile');
const imageRoutes = require('./routes/image');  

app.use(authRoutes);
app.use(gameRoutes);
app.use(userRoutes);
app.use(roomRoutes);
app.use(profileRoutes);
app.use(imageRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: config.nodeEnv === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// STATIC FILES
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

module.export = app;