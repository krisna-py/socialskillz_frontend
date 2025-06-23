import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://socialskillz-server.onrender.com"); // Replace with your deployed signaling server URL

export default function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // ✅ Get local video stream on mount
  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("getUserMedia error:", err.name, err.message);
      }
    };

    startMedia();
  }, []);

  // ✅ Handle signaling and peer connection
  useEffect(() => {
    socket.on("joined", async ({ roomId, initiator }) => {
      const pc = new RTCPeerConnection(configuration);
      setPeerConnection(pc);

      const stream = localVideoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        setConnected(true);
      }

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal", { roomId, data: { candidate: event.candidate } });
        }
      };

      if (initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("signal", { roomId, data: { sdp: pc.localDescription } });
      }
    });

    socket.on("signal", async ({ peerId, data }) => {
      if (!peerConnection) return;

      if (data.sdp) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === "offer") {
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit("signal", { roomId: peerId, data: { sdp: answer } });
        }
      } else if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socket.on("peer-left", () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });
  }, [peerConnection]);

  const joinChat = () => {
    socket.emit("join");
  };

  return (
    <div className="App" style={{ padding: "2rem", textAlign: "center", color: "white", backgroundColor: "#1a1a2e", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎥 SocialSkillz Video Chat</h1>
      <button
        onClick={joinChat}
        style={{
          backgroundColor: "#ffce00",
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          marginBottom: "2rem",
        }}
      >
        {connected ? "Connected" : "Start Chatting Now"}
      </button>

      <div className="video-container" style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "45%", border: "2px solid white", borderRadius: "10px" }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "45%", border: "2px solid white", borderRadius: "10px" }}
        />
      </div>
    </div>
  );
}
