const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const config = require('../config.json');
const Room = require('./room');
const User = require('./user');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const rooms = {};
const users = {};

io.on('connection', (socket) => {
  socket.on('join', (data) => {
    const { nickname, roomId } = data;
    const room = rooms[roomId] || new Room(roomId);
    rooms[roomId] = room;

    const user = new User(socket.id, nickname, roomId);
    users[socket.id] = user;
    room.addUser(user);

    socket.join(roomId);
    io.to(roomId).emit('user_join', {
      id: user.id,
      nickname: user.nickname,
      x: user.x,
      y: user.y
    });
  });

  socket.on('move', (data) => {
    const user = users[socket.id];
    if (user) {
      user.x = data.x;
      user.y = data.y;
      socket.to(user.roomId).emit('user_move', {
        id: user.id,
        x: user.x,
        y: user.y
      });
    }
  });

  socket.on('send_message', (data) => {
    const user = users[socket.id];
    if (user) {
      io.to(user.roomId).emit('receive_message', {
        id: user.id,
        message: data.message
      });
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const room = rooms[user.roomId];
      room.removeUser(user);
      delete users[socket.id];
      io.to(user.roomId).emit('user_leave', { id: user.id });
    }
  });
});

app.use(express.static('public'));

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
