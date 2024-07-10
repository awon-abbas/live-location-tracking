// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let location = { lat: 51.505, lng: -0.09 };

// Simulate location updates
setInterval(() => {
  location.lat += Math.random() * 0.01;
  location.lng += Math.random() * 0.01;
  io.emit("locationUpdate", location);
}, 1000);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.emit("locationUpdate", location);
});

server.listen(4000, () => {
  console.log("listening on *:4000");
});
