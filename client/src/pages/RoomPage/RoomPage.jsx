import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

const SOCKET_SERVER_URL = "http://localhost:3000";

const RoomPage = () => {
  const [connected, setConnected] = useState(false);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const roomId = searchParams.get("roomId");
  const name = searchParams.get("name");

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);

    newSocket.on("connect", () => {
      setConnected(true);
      if (roomId) {
        newSocket.emit("join-room", roomId);
      }
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  return <div>RoomPage<br/>Socket status: {connected ? "Connected" : "Disconnected"}<br/>Room ID: {roomId || "(none)"}<br/>Name: {name || "(none)"}</div>;
};

export default RoomPage;
