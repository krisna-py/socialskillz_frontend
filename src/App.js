// SocialSkillzVideoChat - React-based high-end video chatting website with WebRTC

import React, { useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Video, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const startVideo = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = localStream;
    // Placeholder for real WebRTC signaling logic
    setConnected(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 to-pink-500 flex flex-col items-center justify-center text-white font-sans p-6">
      <motion.h1
        className="text-5xl font-bold mb-4 text-center drop-shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to <span className="text-yellow-300">SocialSkillz</span>
      </motion.h1>

      <motion.p
        className="text-lg max-w-2xl text-center mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Enhance your social skills by video chatting with real people around the world. Designed with intelligent matching and interactive tools to boost your confidence and communication.
      </motion.p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
      >
        <motion.div
          className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl p-6 text-center hover:scale-105 transition-all"
          variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}
        >
          <Video className="mx-auto w-10 h-10 mb-4 text-yellow-300" />
          <h3 className="text-xl font-semibold">Live Video Chat</h3>
          <p>Connect instantly with random strangers for real conversations.</p>
        </motion.div>

        <motion.div
          className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl p-6 text-center hover:scale-105 transition-all"
          variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}
        >
          <User className="mx-auto w-10 h-10 mb-4 text-green-300" />
          <h3 className="text-xl font-semibold">Skill Building</h3>
          <p>Practice interviews, storytelling, and public speaking with feedback.</p>
        </motion.div>

        <motion.div
          className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-2xl p-6 text-center hover:scale-105 transition-all"
          variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}
        >
          <Sparkles className="mx-auto w-10 h-10 mb-4 text-pink-300" />
          <h3 className="text-xl font-semibold">Gamified Experience</h3>
          <p>Earn badges, level up, and unlock achievements as you improve!</p>
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <Button
          onClick={startVideo}
          className="text-lg px-8 py-4 bg-yellow-300 text-black font-bold rounded-full shadow-xl hover:bg-yellow-400 transition-colors"
        >
          {connected ? "Connected!" : "Start Chatting Now"}
        </Button>
      </motion.div>

      {connected && (
        <div className="mt-10 flex gap-4 w-full max-w-4xl justify-center">
          <video ref={localVideoRef} autoPlay muted className="w-1/2 rounded-xl shadow-lg border-4 border-white" />
          <video ref={remoteVideoRef} autoPlay className="w-1/2 rounded-xl shadow-lg border-4 border-white" />
        </div>
      )}
    </main>
  );
}
