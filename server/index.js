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

let location = { lat: 51.505, lng: -0.09 }; // Initialize with default values

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("sendLocation", (newLocation) => {
    location = newLocation;
    io.emit("locationUpdate", location);
  });

  socket.emit("locationUpdate", location);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Simulate location updates every second
setInterval(() => {
  if (location) {
    location.lat += Math.random() * 0.01;
    location.lng += Math.random() * 0.01;
    io.emit("locationUpdate", location);
  }
}, 1000);

server.listen(4000, () => {
  console.log("listening on *:4000");
});
