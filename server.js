const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store connected users
const users = new Map();

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('user joined', (username) => {
    users.set(socket.id, username);
    socket.data.username = username;
    updateUserList();
    socket.broadcast.emit('user joined', username);
    console.log(`${username} joined (${socket.id})`);
  });

  socket.on('chat message', (msg) => {
    msg.time = new Date(); // Add server-side timestamp
    io.emit('chat message', msg);
  });

  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    if (username) {
      console.log(`${username} disconnected (${socket.id})`);
      users.delete(socket.id);
      updateUserList();
      io.emit('user left', username);
    }
  });

  function updateUserList() {
    const userArray = Array.from(users.values());
    io.emit('user list', userArray);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});