const express = require("express");
const http = require("http");
const socketIoServer = require("socket.io");
const cors = require("cors");
const twilio = require("twilio");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIoServer(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("signal", ({ roomId, signal, to }) => {
    if (to) {
      io.to(to).emit("signal", { from: socket.id, signal });
    } else {
      socket.to(roomId).emit("signal", { from: socket.id, signal });
    }
  });

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((roomId) => {
      socket.to(roomId).emit("user-left", socket.id);
    });
    console.log(`Socket ${socket.id} disconnecting from rooms:`, rooms);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
