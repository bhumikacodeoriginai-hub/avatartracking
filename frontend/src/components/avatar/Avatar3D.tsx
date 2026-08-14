"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import type { AvatarState } from "@/store/avatarStore";

interface Avatar3DProps {
  state: AvatarState;
  isSpeaking: boolean;
}

// Your CodeOrigin.ai avatar image - place this file in /frontend/public/avatar.png
// For now using the direct image path
const AVATAR_IMAGE = "/avatar.png";

/**
 * Avatar3D - Uses the CodeOrigin.ai corporate AI avatar image
 * with animated overlays for speaking, listening, and state effects.
 * 
 * Professional futuristic AI receptionist with gold/dark theme.
 */
export function Avatar3D({ state, isSpeaking }: Avatar3DProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px]">
      
      {/* === OUTER GLOW RINGS === */}
      
      {/* Pulsing outer ring */}
      <motion.div
        className="absolute -inset-4 rounded-full"
        animate={{
          boxShadow: state === "speaking"
            ? [
                "0 0 30px rgba(212,175,55,0.4), 0 0 60px rgba(212,175,55,0.2), 0 0 100px rgba(212,175,55,0.1)",
                "0 0 50px rgba(212,175,55,0.6), 0 0 90px rgba(212,175,55,0.3), 0 0 130px rgba(212,175,55,0.15)",
                "0 0 30px rgba(212,175,55,0.4), 0 0 60px rgba(212,175,55,0.2), 0 0 100px rgba(212,175,55,0.1)",
              ]
            : state === "listening"
            ? [
                "0 0 25px rgba(34,197,94,0.3), 0 0 50px rgba(34,197,94,0.15)",
                "0 0 40px rgba(34,197,94,0.5), 0 0 80px rgba(34,197,94,0.2)",
                "0 0 25px rgba(34,197,94,0.3), 0 0 50px rgba(34,197,94,0.15)",
              ]
            : state === "thinking"
            ? "0 0 30px rgba(234,179,8,0.3), 0 0 60px rgba(234,179,8,0.15)"
            : state === "greeting"
            ? [
                "0 0 30px rgba(212,175,55,0.3), 0 0 70px rgba(212,175,55,0.15)",
                "0 0 50px rgba(212,175,55,0.5), 0 0 100px rgba(212,175,55,0.2)",
                "0 0 30px rgba(212,175,55,0.3), 0 0 70px rgba(212,175,55,0.15)",
              ]
            : "0 0 15px rgba(212,175,55,0.1), 0 0 30px rgba(212,175,55,0.05)"
        }}
        transition={{ repeat: Infinity, duration: state === "speaking" ? 1.2 : 2.5, ease: "easeInOut" }}
      />

      {/* Rotating gold ring */}
      <motion.div
        className="absolute -inset-2 rounded-full border border-amber-500/20"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        style={{ borderStyle: "dashed" }}
      />

      {/* Inner solid ring */}
      <motion.div
        className={`absolute -inset-1 rounded-full border-2 transition-colors duration-700 ${
          state === "speaking" ? "border-amber-400/50" :
          state === "listening" ? "border-green-400/40" :
          state === "thinking" ? "border-yellow-400/30" :
          "border-amber-600/20"
        }`}
        animate={state === "speaking" ? { scale: [1, 1.01, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />

      {/* === MAIN AVATAR IMAGE === */}
      <motion.div
        className="relative w-full h-full rounded-full overflow-hidden shadow-2xl shadow-amber-900/30"
        animate={{
          y: state === "idle" ? [0, -3, 0] : state === "speaking" ? [0, -2, 0] : 0,
          scale: state === "greeting" ? [1, 1.02, 1] : 1,
        }}
        transition={{
          y: { repeat: Infinity, duration: state === "speaking" ? 2 : 5, ease: "easeInOut" },
          scale: { duration: 0.8, repeat: state === "greeting" ? 1 : 0 },
        }}
      >
        {/* The actual avatar image */}
        <img
          src={AVATAR_IMAGE}
          alt="AI Office Avatar"
          className="w-full h-full object-cover object-top"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback to a gradient if image not found
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Fallback if image not loaded */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f0f] via-[#1a1508] to-[#0f0d05] flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-3 mx-auto">
                <span className="text-3xl font-bold text-white">C</span>
              </div>
              <p className="text-amber-400/60 text-xs">CodeOrigin.ai</p>
            </div>
          </div>
        )}

        {/* === SPEAKING OVERLAY EFFECTS === */}
        {isSpeaking && (
          <>
            {/* Sound wave ring pulse */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-400/30"
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-amber-300/20"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeOut", delay: 0.3 }}
            />

            {/* Bottom glow (voice emanating) */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-amber-500/15 to-transparent rounded-b-full"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />
          </>
        )}

        {/* === LISTENING OVERLAY === */}
        {state === "listening" && !isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "inset 0 0 20px rgba(34,197,94,0.05)",
                "inset 0 0 40px rgba(34,197,94,0.1)",
                "inset 0 0 20px rgba(34,197,94,0.05)",
              ]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}

        {/* === THINKING OVERLAY === */}
        {state === "thinking" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-amber-500/5"
            animate={{ opacity: [0, 0.1, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </motion.div>

      {/* === AUDIO WAVEFORM (visible when speaking) === */}
      {isSpeaking && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-[3px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] bg-gradient-to-t from-amber-500 to-amber-300 rounded-full"
              animate={{
                height: [4, 12 + Math.random() * 16, 4],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.4 + Math.random() * 0.3,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* === STATE BADGE === */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          className={`px-5 py-2 rounded-full text-sm font-medium backdrop-blur-md border shadow-lg ${
            state === "idle" ? "bg-slate-900/90 text-amber-300/70 border-amber-600/20" :
            state === "listening" ? "bg-slate-900/90 text-green-300 border-green-500/40" :
            state === "speaking" ? "bg-slate-900/90 text-amber-300 border-amber-400/50" :
            state === "thinking" ? "bg-slate-900/90 text-yellow-300 border-yellow-500/30" :
            state === "greeting" ? "bg-slate-900/90 text-amber-300 border-amber-400/40" :
            "bg-slate-900/90 text-slate-300 border-slate-600/50"
          }`}
          animate={state === "speaking" ? { scale: [1, 1.03, 1] } : state === "listening" ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {state === "idle" && "● Ready"}
          {state === "greeting" && "✨ Hello!"}
          {state === "listening" && "🎤 Listening..."}
          {state === "thinking" && "⚡ Processing..."}
          {state === "speaking" && "🔊 Speaking"}
          {state === "goodbye" && "👋 Goodbye!"}
          {state === "error" && "⚠️ Error"}
        </motion.div>
      </div>
    </div>
  );
}
