const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const uuid = require('uuid-random');

const express = require('express');
const app = express();

const server = require('http').createServer(app);
const { Server } = require('socket.io');

const { addUser, getUser, removeUser } = require('./utils/users');

const io = new Server(server);

app.use(cors());

let roomIdGlobal, imgURLGlobal;

io.on('connection', (socket) => {
  socket.on('userJoined', (data) => {
    const { name, userId, roomId, host, presenter } = data;
    roomIdGlobal = roomId;
    socket.join(roomId);
    const users = addUser({
      name,
      userId,
      roomId,
      host,
      presenter,
      socketId: socket.id
    });
    socket.broadcast.to(roomId).emit('userJoinedMessageBroadcasted', name);
    io.to(roomId).emit('allUsers', users);
    io.to(roomId).emit('whiteBoardDataResponse', {
      imgURL: imgURLGlobal
    });
  });

  socket.on('whiteboardData', (data) => {
    imgURLGlobal = data.img;

    socket.broadcast.to(roomIdGlobal).emit('whiteBoardDataResponse', {
      imgURL: data.img
    });
  });

  socket.on('connect-to-student', (data) => {
    socket.to(data).emit('connect-to-instructor');
  });

  socket.on('message', (data) => {
    const { message } = data;
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast
        .to(roomIdGlobal)
        .emit('messageResponse', { message, name: user.name });
    }
  });

  socket.on('disconnect', () => {
    const user = getUser(socket.id);
    if (user) {
      removeUser(socket.id);
      socket.broadcast
        .to(roomIdGlobal)
        .emit('userLeftMessageBroadcasted', user.name);
    }
  });
});

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
server.listen(8080, () => {
  console.log('Started on : 8080');
});
