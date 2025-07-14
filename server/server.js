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

const userNames = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-room", ({ roomId, name }) => {
    socket.join(roomId);
    userNames[socket.id] = name;
    socket.to(roomId).emit("user-joined", { peerId: socket.id, name });
    socket.emit("participants", getParticipants(roomId));
    console.log(`Socket ${socket.id} joined room ${roomId} as ${name}`);
  });

  socket.on("signal", ({ roomId, signal, to }) => {
    if (to) {
      io.to(to).emit("signal", { from: socket.id, signal });
    } else {
      socket.to(roomId).emit("signal", { from: socket.id, signal });
    }
  });

  socket.on("chat-message", ({ roomId, message, name }) => {
    socket.to(roomId).emit("chat-message", { message, name, from: socket.id });
  });

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((roomId) => {
      socket.to(roomId).emit("user-left", socket.id);
    });
    delete userNames[socket.id];
    console.log(`Socket ${socket.id} disconnecting from rooms:`, rooms);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

function getParticipants(roomId) {
  const clients = io.sockets.adapter.rooms.get(roomId) || [];
  return Array.from(clients).map((id) => ({ peerId: id, name: userNames[id] || "Unknown" }));
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
