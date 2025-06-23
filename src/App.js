import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// Replace this with your actual Render backend URL
const socket = io("https://socialskillz-server.onrender.com");

export default function App() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    // ✅ Ensure media is started only after component is mounted
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

  useEffect(() => {
    // ✅ Signaling logic
    socket.on("joined", async ({ roomId, initiator }) => {
      const pc = new RTCPeerConnection(configuration);
      setPeerConnection(pc);

      const localStream = localVideoRef.current?.srcObject;
      if (localStream) {
        localStream.getTracks().forEach((track) =>
          pc.addTrack(track, localStream)
        );
        setConnected(true);
      }

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal", {
            roomId,
            data: { candidate: event.candidate },
          });
        }
      };

      if (initiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("signal", {
          roomId,
          data: { sdp: pc.localDescription },
        });
      }
    });

    socket.on("signal", async ({ peerId, data }) => {
      if (!peerConnection) return;

      if (data.sdp) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
        );

        if (data.sdp.type === "offer") {
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit("signal", {
            roomId: peerId,
            data: { sdp: answer },
          });
        }
      } else if (data.candidate) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
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
    <div className="p-4 text-white min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <h1 className="text-4xl font-bold mb-6">Welcome to SocialSkillz</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-purple-600 p-4 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold mb-2">Live Video Chat</h2>
          <p>Connect instantly with random strangers for real conversations.</p>
        </div>
        <div className="bg-purple-600 p-4 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold mb-2">Skill Building</h2>
          <p>
            Practice interviews, storytelling, and public speaking with
            feedback.
          </p>
        </div>
        <div className="bg-purple-600 p-4 rounded-xl shadow-md text-center">
          <h2 className="text-xl font-bold mb-2">Gamified Experience</h2>
          <p>Earn badges, level up, and unlock achievements as you improve!</p>
        </div>
      </div>

      <button
        onClick={joinChat}
        className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-300 transition mb-6"
      >
        {connected ? "Connected" : "Start Chatting Now"}
      </button>

      <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-3/4 md:w-1/2 rounded-xl shadow-xl border-4 border-white"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-3/4 md:w-1/2 rounded-xl shadow-xl border-4 border-white"
        />
      </div>
    </div>
  );
}
