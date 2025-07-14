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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
