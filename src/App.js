import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("https://your-signaling-server-url.onrender.com"); // Replace with your actual signaling server URL

export default function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // ✅ Step 1: Safely get user's media after mount
  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("getUserMedia error:", err.name, err.message);
      }
    };

    startMedia();
  }, []);

  // ✅ Step 2: Set up signaling & WebRTC
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

  // ✅ Step 3: Simple button to join chat
  const joinChat = () => {
    socket.emit("join");
  };

  return (
    <div className="App">
      <h1>SocialSkillz Video Chat</h1>
      <button onClick={joinChat}>
        {connected ? "Connected" : "Start Chatting Now"}
      </button>

      <div className="video-container" style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
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
