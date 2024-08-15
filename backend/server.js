const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config(); // Load environment variables

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors()); // Allow requests from your React app
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// User Model
const User = mongoose.model('User', userSchema);

// Chat Schema
const chatSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', chatSchema);


// Signup Route
app.post('/signup', async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful', username: user.username, redirectUrl: '/chat' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Search User Route
app.get('/search-user', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });

    if (user) {
      res.status(200).json({ exists: true, name: user.name });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (error) {
    console.error('Error searching for user:', error);
    res.status(500).json({ message: 'Error searching for user' });
  }
});

// Send Message Route
app.post('/send-message', async (req, res) => {
  const { sender, receiver, message } = req.body;
  console.log('Received data:', { sender, receiver, message });

  if (!sender || !receiver || !message) {
    return res.status(400).json({ message: 'Sender, receiver, and message are required' });
  }

  try {
    const receiverExists = await User.findOne({ username: receiver });

    if (!receiverExists) {
      return res.status(400).json({ message: 'Receiver not found' });
    }

    const newChat = new Chat({ sender, receiver, message });
    await newChat.save(); // Save the message to the database

    // Notify the receiver via Socket.IO
    io.to(receiver).emit('receive-message', { sender, message });

    res.status(201).json({ message: 'Message sent and stored in DB' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message' });
  }
});


// Get Chats for a User Route
app.get('/chats', async (req, res) => {
  const { username } = req.query;

  try {
    const chats = await Chat.find({
      $or: [{ sender: username }, { receiver: username }],
    }).sort('timestamp');

    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

// Socket.IO for Real-Time Messaging
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    socket.join(username);
    console.log(`${username} joined room`);
  });

  socket.on('send-message', ({ receiver, message }) => {
    io.to(receiver).emit('receive-message', { sender: socket.username, message });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
