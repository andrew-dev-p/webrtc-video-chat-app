import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

const SOCKET_SERVER_URL = "http://localhost:3000";

const RoomPage = () => {
  const [connected, setConnected] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const location = useLocation();
  const localVideoRef = useRef(null);

  // Get roomId and name from query params
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

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        setMediaError("Could not access camera/microphone: " + err.message);
      });
  }, []);

  return (
    <div>
      <div>RoomPage</div>
      <div>Socket status: {connected ? "Connected" : "Disconnected"}</div>
      <div>Room ID: {roomId || "(none)"}</div>
      <div>Name: {name || "(none)"}</div>
      {mediaError && <div style={{ color: 'red' }}>{mediaError}</div>}
      <div>
        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: 320, height: 240, background: '#000' }} />
        <div>Local Video</div>
      </div>
    </div>
  );
};

export default RoomPage;
