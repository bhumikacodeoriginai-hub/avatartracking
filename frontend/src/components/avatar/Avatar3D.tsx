"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { AvatarState } from "@/store/avatarStore";

interface Avatar3DProps {
  state: AvatarState;
  isSpeaking: boolean;
}

/**
 * Avatar3D - Real Human Avatar
 * 
 * Uses a REAL human video/image for the avatar display.
 * 
 * HOW TO SET UP YOUR REAL AVATAR:
 * 
 * Option 1 (RECOMMENDED): Use a talking-head video
 *   - Record a real person (professional woman/man) speaking
 *   - Save as: frontend/public/avatar-speaking.mp4 (person talking)
 *   - Save as: frontend/public/avatar-idle.mp4 (person idle/smiling, loop)
 *   - Save as: frontend/public/avatar.png (still photo fallback)
 * 
 * Option 2: Use a service like D-ID, HeyGen, or Synthesia
 *   - Generate a realistic AI talking head video
 *   - Export the video files
 * 
 * Option 3: Use a high-quality photo (current fallback)
 *   - Save a real professional headshot as frontend/public/avatar.png
 *   - The system will animate with overlays
 * 
 * The avatar switches between idle video and speaking video
 * based on the current state.
 */
export function Avatar3D({ state, isSpeaking }: Avatar3DProps) {
  const speakingVideoRef = useRef<HTMLVideoElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasIdleVideo, setHasIdleVideo] = useState(false);

  // Control video playback based on state
  useEffect(() => {
    if (isSpeaking && speakingVideoRef.current && hasVideo) {
      speakingVideoRef.current.play().catch(() => {});
      if (idleVideoRef.current) idleVideoRef.current.pause();
    } else {
      if (speakingVideoRef.current) speakingVideoRef.current.pause();
      if (idleVideoRef.current && hasIdleVideo) idleVideoRef.current.play().catch(() => {});
    }
  }, [isSpeaking, hasVideo, hasIdleVideo]);

  return (
    <div className="relative w-80 h-80 md:w-[400px] md:h-[400px] lg:w-[460px] lg:h-[460px]">
      
      {/* === OUTER EFFECTS === */}
      
      {/* Animated glow ring */}
      <motion.div
        className="absolute -inset-4 rounded-full"
        animate={{
          boxShadow: isSpeaking
            ? [
                "0 0 40px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.15)",
                "0 0 60px rgba(212,175,55,0.6), 0 0 120px rgba(212,175,55,0.25)",
                "0 0 40px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.15)",
              ]
            : state === "listening"
            ? [
                "0 0 20px rgba(34,197,94,0.3), 0 0 50px rgba(34,197,94,0.1)",
                "0 0 35px rgba(34,197,94,0.4), 0 0 70px rgba(34,197,94,0.15)",
                "0 0 20px rgba(34,197,94,0.3), 0 0 50px rgba(34,197,94,0.1)",
              ]
            : "0 0 15px rgba(212,175,55,0.1)"
        }}
        transition={{ repeat: Infinity, duration: isSpeaking ? 1 : 2.5, ease: "easeInOut" }}
      />

      {/* Rotating ring */}
      <motion.div
        className={`absolute -inset-2 rounded-full border transition-colors duration-500 ${
          isSpeaking ? "border-amber-400/40" :
          state === "listening" ? "border-green-400/25" :
          "border-amber-600/15"
        }`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        style={{ borderStyle: "dashed" }}
      />

      {/* === MAIN AVATAR CONTAINER === */}
      <motion.div
        className="relative w-full h-full rounded-full overflow-hidden shadow-2xl shadow-black/50 border-2 border-amber-700/30"
        animate={{
          y: state === "idle" ? [0, -2, 0] : 0,
          scale: isSpeaking ? [1, 1.005, 1] : 1,
        }}
        transition={{ repeat: Infinity, duration: isSpeaking ? 2 : 6, ease: "easeInOut" }}
      >
        {/* Speaking video (real person talking) */}
        <video
          ref={speakingVideoRef}
          src="/avatar-speaking.mp4"
          className={`absolute inset-0 w-full h-full object-cover ${isSpeaking && hasVideo ? "opacity-100" : "opacity-0"}`}
          muted
          loop
          playsInline
          onCanPlay={() => setHasVideo(true)}
          onError={() => setHasVideo(false)}
        />

        {/* Idle video (real person idle/smiling) */}
        <video
          ref={idleVideoRef}
          src="/avatar-idle.mp4"
          className={`absolute inset-0 w-full h-full object-cover ${!isSpeaking && hasIdleVideo ? "opacity-100" : "opacity-0"}`}
          muted
          loop
          playsInline
          autoPlay
          onCanPlay={() => setHasIdleVideo(true)}
          onError={() => setHasIdleVideo(false)}
        />

        {/* Still image fallback (always shown underneath) */}
        <img
          src="/avatar.png"
          alt="AI Assistant"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: -1 }}
        />

        {/* === SPEAKING OVERLAY EFFECTS === */}
        {isSpeaking && (
          <>
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-400/25"
              animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-amber-300/15"
              animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
            />
            
            {/* Voice glow at bottom */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-t from-amber-500/20 to-transparent rounded-b-full"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            />
          </>
        )}

        {/* Listening indicator */}
        {state === "listening" && !isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-green-400/15"
            animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}

        {/* Thinking overlay */}
        {state === "thinking" && (
          <motion.div
            className="absolute inset-0 bg-amber-500/5 rounded-full"
            animate={{ opacity: [0, 0.08, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}
      </motion.div>

      {/* === AUDIO WAVEFORM (speaking) === */}
      {isSpeaking && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-[2px]">
          {Array.from({ length: 11 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] bg-gradient-to-t from-amber-500 to-amber-300 rounded-full opacity-80"
              animate={{ height: [3, 8 + Math.random() * 14, 3] }}
              transition={{ repeat: Infinity, duration: 0.3 + Math.random() * 0.3, delay: i * 0.04, ease: "easeInOut" }}
            />
          ))}
        </div>
      )}

      {/* === STATE BADGE === */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          className={`px-5 py-2 rounded-full text-sm font-medium backdrop-blur-md border shadow-lg ${
            state === "idle" ? "bg-black/80 text-amber-300/70 border-amber-600/20" :
            state === "listening" ? "bg-black/80 text-green-300 border-green-500/40" :
            isSpeaking ? "bg-black/80 text-amber-300 border-amber-400/50" :
            state === "thinking" ? "bg-black/80 text-yellow-300 border-yellow-500/30" :
            state === "greeting" ? "bg-black/80 text-amber-300 border-amber-400/40" :
            "bg-black/80 text-slate-300 border-slate-600/50"
          }`}
          animate={isSpeaking ? { scale: [1, 1.03, 1] } : state === "listening" ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {state === "idle" && "● Ready"}
          {state === "greeting" && "✨ Hello!"}
          {state === "listening" && "🎤 Listening..."}
          {state === "thinking" && "⚡ Processing..."}
          {isSpeaking && "🔊 Speaking"}
          {state === "goodbye" && "👋 Goodbye!"}
          {state === "error" && "⚠️ Error"}
        </motion.div>
      </div>
    </div>
  );
}
