"use client";

import React, { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import type { AvatarState } from "@/store/avatarStore";

interface Avatar3DProps {
  state: AvatarState;
  isSpeaking: boolean;
}

/**
 * Avatar3D - 3D-style avatar with CSS animations.
 * 
 * For production, this would use Three.js + @react-three/fiber with a GLTF model.
 * This implementation provides a visually appealing animated avatar using CSS/SVG
 * that works without WebGL requirements for initial deployment.
 */
export function Avatar3D({ state, isSpeaking }: Avatar3DProps) {
  const avatarRef = useRef<HTMLDivElement>(null);

  // Animation variants based on state
  const containerVariants = {
    idle: {
      scale: 1,
      y: [0, -3, 0],
      transition: { y: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
    },
    greeting: {
      scale: 1.02,
      y: 0,
      transition: { duration: 0.5 },
    },
    listening: {
      scale: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    thinking: {
      scale: 0.98,
      y: 0,
      transition: { duration: 0.5 },
    },
    speaking: {
      scale: 1.01,
      y: 0,
      transition: { duration: 0.3 },
    },
    goodbye: {
      scale: 0.98,
      y: -5,
      transition: { duration: 0.5 },
    },
    error: {
      scale: 0.98,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  // Eye animation based on state
  const eyeAnimation = useMemo(() => {
    switch (state) {
      case "listening":
        return "animate-pulse-slow";
      case "thinking":
        return "";
      default:
        return "";
    }
  }, [state]);

  // Mouth animation for speaking
  const mouthHeight = isSpeaking ? "animate-pulse" : "";

  return (
    <motion.div
      ref={avatarRef}
      className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
      variants={containerVariants}
      animate={state}
    >
      {/* Avatar base - circular container with gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 shadow-2xl border border-slate-600/50 overflow-hidden">
        {/* Face background */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 shadow-inner">
          {/* Hair */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-2/5 bg-gradient-to-b from-slate-800 to-slate-700 rounded-t-full" />
          
          {/* Eyes */}
          <div className="absolute top-[38%] left-0 right-0 flex justify-center gap-8 md:gap-10">
            {/* Left eye */}
            <div className={`relative w-6 h-7 md:w-7 md:h-8 ${eyeAnimation}`}>
              <div className="absolute inset-0 bg-white rounded-full shadow-sm" />
              <motion.div
                className="absolute top-1/2 left-1/2 w-3 h-3 md:w-4 md:h-4 bg-slate-800 rounded-full"
                animate={{
                  x: state === "thinking" ? [-2, 2, -2] : [-1, 1, -1],
                  y: [-1, 0, -1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: state === "thinking" ? 2 : 4,
                  ease: "easeInOut",
                }}
                style={{ transform: "translate(-50%, -50%)" }}
              />
              {/* Eye highlight */}
              <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
            </div>
            
            {/* Right eye */}
            <div className={`relative w-6 h-7 md:w-7 md:h-8 ${eyeAnimation}`}>
              <div className="absolute inset-0 bg-white rounded-full shadow-sm" />
              <motion.div
                className="absolute top-1/2 left-1/2 w-3 h-3 md:w-4 md:h-4 bg-slate-800 rounded-full"
                animate={{
                  x: state === "thinking" ? [-2, 2, -2] : [-1, 1, -1],
                  y: [-1, 0, -1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: state === "thinking" ? 2 : 4,
                  ease: "easeInOut",
                }}
                style={{ transform: "translate(-50%, -50%)" }}
              />
              <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
            </div>
          </div>

          {/* Eyebrows */}
          <div className="absolute top-[32%] left-0 right-0 flex justify-center gap-12 md:gap-14">
            <motion.div
              className="w-7 h-1 bg-slate-700 rounded-full"
              animate={{
                y: state === "greeting" ? -2 : state === "error" ? 1 : 0,
                rotate: state === "error" ? 5 : 0,
              }}
            />
            <motion.div
              className="w-7 h-1 bg-slate-700 rounded-full"
              animate={{
                y: state === "greeting" ? -2 : state === "error" ? 1 : 0,
                rotate: state === "error" ? -5 : 0,
              }}
            />
          </div>

          {/* Nose */}
          <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-3 h-4 bg-amber-300/50 rounded-full" />

          {/* Mouth */}
          <div className="absolute top-[64%] left-1/2 -translate-x-1/2">
            <motion.div
              className={`bg-rose-400 rounded-full shadow-inner ${mouthHeight}`}
              animate={{
                width: isSpeaking ? [24, 32, 28, 24] : state === "greeting" ? 32 : 24,
                height: isSpeaking ? [8, 14, 10, 8] : state === "greeting" ? 10 : 6,
                borderRadius: state === "greeting" || isSpeaking ? "0 0 50% 50%" : "999px",
              }}
              transition={{
                repeat: isSpeaking ? Infinity : 0,
                duration: 0.3,
                ease: "easeInOut",
              }}
              style={{ width: 24, height: 6 }}
            />
          </div>

          {/* Blush */}
          {(state === "greeting" || state === "speaking") && (
            <>
              <div className="absolute top-[55%] left-[22%] w-5 h-3 bg-rose-300/40 rounded-full blur-sm" />
              <div className="absolute top-[55%] right-[22%] w-5 h-3 bg-rose-300/40 rounded-full blur-sm" />
            </>
          )}
        </div>

        {/* Professional clothing hint at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-gradient-to-t from-slate-600 to-transparent" />
      </div>

      {/* Outer glow based on state */}
      <motion.div
        className="absolute -inset-2 rounded-full"
        animate={{
          boxShadow:
            state === "speaking"
              ? "0 0 30px rgba(56, 189, 248, 0.4)"
              : state === "listening"
              ? "0 0 20px rgba(34, 197, 94, 0.3)"
              : state === "thinking"
              ? "0 0 20px rgba(251, 191, 36, 0.3)"
              : "0 0 10px rgba(56, 189, 248, 0.1)",
        }}
        transition={{ duration: 0.5 }}
      />

      {/* State indicator badge */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <motion.div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            state === "idle"
              ? "bg-slate-700 text-slate-300"
              : state === "listening"
              ? "bg-green-900/50 text-green-300 border border-green-500/30"
              : state === "speaking"
              ? "bg-blue-900/50 text-blue-300 border border-blue-500/30"
              : state === "thinking"
              ? "bg-amber-900/50 text-amber-300 border border-amber-500/30"
              : "bg-slate-700 text-slate-300"
          }`}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {state === "idle" && "Ready"}
          {state === "greeting" && "👋 Hello!"}
          {state === "listening" && "🎤 Listening..."}
          {state === "thinking" && "🤔 Thinking..."}
          {state === "speaking" && "💬 Speaking"}
          {state === "goodbye" && "👋 Goodbye!"}
          {state === "error" && "⚠️ Error"}
        </motion.div>
      </div>
    </motion.div>
  );
}
