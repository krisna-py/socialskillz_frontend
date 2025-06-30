// SocialSkillzTextChat - React-based high-end text chatting website with WebSockets

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://socialskillz-server.onrender.com"); // Replace with your actual backend URL

export default function App() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, { from: "peer", text: msg }]);
    });

    return () => {
      socket.off("connect");
      socket.off("chat-message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chat-message", message);
      setMessages((prev) => [...prev, { from: "me", text: message }]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-pink-500 flex flex-col items-center justify-center text-white font-sans p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Welcome to <span className="text-yellow-300">SocialSkillz Chat</span>
      </h1>

      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg w-full max-w-md">
        <div className="h-64 overflow-y-auto mb-4 p-2 border border-white rounded-lg bg-white/5">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 text-${msg.from === "me" ? "right" : "left"}`}> 
              <span className={msg.from === "me" ? "text-green-300" : "text-blue-300"}> 
                {msg.from === "me" ? "You" : "Stranger"}:
              </span> {msg.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 p-2 rounded-md text-black"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-yellow-300 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
