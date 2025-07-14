import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useLocation, useHistory } from "react-router-dom";

const SOCKET_SERVER_URL = "http://localhost:3000";
const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

const videoStyle = {
  width: 320,
  height: 240,
  background: '#000',
  borderRadius: 8,
  margin: 8,
};

const gridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 16,
};

const chatContainerStyle = {
  width: 400,
  maxWidth: '90vw',
  margin: '24px auto',
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const messageListStyle = {
  minHeight: 120,
  maxHeight: 200,
  overflowY: 'auto',
  marginBottom: 8,
  padding: 4,
  background: '#f6f9fb',
  borderRadius: 4,
};

const RoomPage = () => {
  const [mediaError, setMediaError] = useState("");
  const [remoteStreams, setRemoteStreams] = useState({});
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const location = useLocation();
  const history = useHistory();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const socketRef = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const roomId = searchParams.get("roomId");
  const name = searchParams.get("name");

  const addRemoteStream = (peerId, stream) => {
    setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
  };
  const removeRemoteStream = (peerId) => {
    setRemoteStreams((prev) => {
      const copy = { ...prev };
      delete copy[peerId];
      return copy;
    });
  };

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      if (roomId) {
        socket.emit("join-room", roomId);
      }
    });

    socket.on("disconnect", () => {
    });

    socket.on("user-joined", async (peerId) => {
      if (!localStreamRef.current) return;
      const peerConnection = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current[peerId] = peerConnection;
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
      peerConnection.ontrack = (event) => {
        addRemoteStream(peerId, event.streams[0]);
      };
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal", { roomId, signal: { type: "candidate", candidate: event.candidate }, to: peerId });
        }
      };
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("signal", { roomId, signal: { type: "offer", sdp: offer.sdp }, to: peerId });
    });

    socket.on("signal", async ({ from, signal }) => {
      if (!localStreamRef.current) return;
      let peerConnection = peersRef.current[from];
      if (!peerConnection) {
        peerConnection = new RTCPeerConnection(ICE_SERVERS);
        peersRef.current[from] = peerConnection;
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
        peerConnection.ontrack = (event) => {
          addRemoteStream(from, event.streams[0]);
        };
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("signal", { roomId, signal: { type: "candidate", candidate: event.candidate }, to: from });
          }
        };
      }
      if (signal.type === "offer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: signal.sdp }));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("signal", { roomId, signal: { type: "answer", sdp: answer.sdp }, to: from });
      } else if (signal.type === "answer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: signal.sdp }));
      } else if (signal.type === "candidate") {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } catch {
          console.warn("Failed to add ICE candidate", signal.candidate);
        }
      }
    });

    socket.on("user-left", (peerId) => {
      if (peersRef.current[peerId]) {
        peersRef.current[peerId].close();
        delete peersRef.current[peerId];
      }
      removeRemoteStream(peerId);
    });

    socket.on("chat-message", ({ message, name: senderName, from }) => {
      setMessages((prev) => [...prev, { message, senderName, from, self: false }]);
    });

    return () => {
      socket.disconnect();
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      setRemoteStreams({});
    };
  }, [roomId]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        setMediaError("Could not access camera/microphone: " + err.message);
      });
  }, []);

  const handleLeaveRoom = () => {
    history.push("/");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    setMessages((prev) => [...prev, { message: chatInput, senderName: name, from: 'self', self: true }]);
    socketRef.current.emit("chat-message", { roomId, message: chatInput, name });
    setChatInput("");
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <strong>Room ID:</strong> {roomId || "(none)"} &nbsp;|&nbsp; <strong>Name:</strong> {name || "(none)"}
        </div>
        <button onClick={handleLeaveRoom} style={{ padding: '8px 16px', borderRadius: 6, background: '#fc5d5b', color: 'white', border: 'none', fontWeight: 600 }}>Leave Room</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
        <button onClick={toggleAudio} style={{ padding: '8px 16px', borderRadius: 6, background: audioEnabled ? '#0052c9' : '#9ca5ab', color: 'white', border: 'none', fontWeight: 600 }}>
          {audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
        </button>
        <button onClick={toggleVideo} style={{ padding: '8px 16px', borderRadius: 6, background: videoEnabled ? '#0052c9' : '#9ca5ab', color: 'white', border: 'none', fontWeight: 600 }}>
          {videoEnabled ? 'Turn Off Video' : 'Turn On Video'}
        </button>
      </div>
      <div style={chatContainerStyle}>
        <div style={messageListStyle}>
          {messages.length === 0 && <div style={{ color: '#aaa', textAlign: 'center' }}>No messages yet</div>}
          {messages.map((msg, idx) => (
            <div key={idx} style={{ margin: '4px 0', textAlign: msg.self ? 'right' : 'left' }}>
              <span style={{ fontWeight: 600, color: msg.self ? '#0052c9' : '#333' }}>{msg.self ? 'You' : (msg.senderName || 'Peer')}</span>: {msg.message}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            maxLength={300}
          />
          <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#0052c9', color: 'white', border: 'none', fontWeight: 600 }}>Send</button>
        </form>
      </div>
      {mediaError && <div style={{ color: 'red' }}>{mediaError}</div>}
      <div style={gridStyle}>
        <div>
          <video ref={localVideoRef} autoPlay playsInline muted style={videoStyle} />
          <div style={{ textAlign: 'center', fontWeight: 500 }}>{name || 'You'} (You)</div>
        </div>
        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <div key={peerId}>
            <video
              autoPlay
              playsInline
              ref={el => { if (el) el.srcObject = stream; }}
              style={videoStyle}
            />
            <div style={{ textAlign: 'center', fontWeight: 500 }}>Remote: {peerId}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomPage;
