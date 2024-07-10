// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let location = { lat: 0, lng: 0 };

// Simulate location updates
setInterval(() => {
  location.lat += Math.random() * 0.01;
  location.lng += Math.random() * 0.01;
  io.emit('locationUpdate', location);
}, 1000);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('locationUpdate', location);
});

server.listen(4000, () => {
  console.log('listening on *:4000');
});
