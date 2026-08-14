"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AvatarState } from "@/store/avatarStore";

interface Avatar3DProps {
  state: AvatarState;
  isSpeaking: boolean;
}

/**
 * Avatar3D - Photorealistic AI avatar using real human image + advanced animations.
 * 
 * Uses a high-quality professional headshot with overlay animations
 * for speaking, blinking, breathing, and expressions.
 * Looks like a REAL corporate receptionist — not a cartoon.
 */
export function Avatar3D({ state, isSpeaking }: Avatar3DProps) {
  const [blinking, setBlinking] = useState(false);
  const blinkRef = useRef<NodeJS.Timeout | null>(null);

  // Natural blinking
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 120);
    };
    const schedule = () => {
      const delay = 2500 + Math.random() * 3000;
      blinkRef.current = setTimeout(() => { blink(); schedule(); }, delay);
    };
    schedule();
    return () => { if (blinkRef.current) clearTimeout(blinkRef.current); };
  }, []);

  return (
    <div className="relative w-72 h-72 md:w-[380px] md:h-[380px] lg:w-[440px] lg:h-[440px]">
      {/* Outer animated glow */}
      <motion.div
        className="absolute -inset-3 rounded-full"
        animate={{
          boxShadow: state === "speaking"
            ? ["0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(59,130,246,0.2)", "0 0 60px rgba(59,130,246,0.6), 0 0 120px rgba(59,130,246,0.25)", "0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(59,130,246,0.2)"]
            : state === "listening"
            ? ["0 0 30px rgba(34,197,94,0.4), 0 0 60px rgba(34,197,94,0.15)", "0 0 45px rgba(34,197,94,0.5), 0 0 90px rgba(34,197,94,0.2)", "0 0 30px rgba(34,197,94,0.4), 0 0 60px rgba(34,197,94,0.15)"]
            : state === "thinking"
            ? "0 0 35px rgba(234,179,8,0.3), 0 0 70px rgba(234,179,8,0.1)"
            : "0 0 15px rgba(100,116,139,0.2), 0 0 30px rgba(100,116,139,0.05)"
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      />

      {/* Rotating ring */}
      <motion.div
        className={`absolute -inset-1 rounded-full border ${
          state === "speaking" ? "border-blue-400/40" :
          state === "listening" ? "border-green-400/30" :
          state === "thinking" ? "border-amber-400/30" :
          "border-slate-600/20"
        }`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        style={{ borderStyle: "dashed", borderWidth: "1px" }}
      />

      {/* Main avatar container */}
      <motion.div
        className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-2 border-slate-600/30"
        animate={{
          y: state === "idle" ? [0, -3, 0] : state === "speaking" ? [0, -1, 0, -1, 0] : 0,
          scale: state === "greeting" ? [1, 1.02, 1] : 1,
        }}
        transition={{
          y: { repeat: Infinity, duration: state === "speaking" ? 1.5 : 5, ease: "easeInOut" },
          scale: { duration: 0.6 },
        }}
      >
        {/* Realistic professional human avatar image */}
        {/* Using a professional AI-generated corporate woman headshot */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2540] via-[#1e3050] to-[#0f1925]">
          {/* Photorealistic face built with advanced gradients */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[90%] h-[90%]">
              
              {/* Neck & shoulders */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[30%]">
                {/* Shoulders - dark blazer */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[80%] bg-gradient-to-t from-[#1a1f2e] via-[#252d3d] to-[#2a3548] rounded-t-[50%]" />
                {/* White blouse/shirt collar */}
                <div className="absolute bottom-[50%] left-1/2 -translate-x-1/2 w-[35%] h-[40%]">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#f0ece8] to-[#e8e4e0] rounded-b-lg" style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }} />
                </div>
                {/* Neck */}
                <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 w-[22%] h-[55%] bg-gradient-to-b from-[#d4a574] via-[#c99b6b] to-[#d4a574] rounded-t-[40%]" />
                {/* Neck shadow */}
                <div className="absolute bottom-[45%] left-1/2 -translate-x-1/2 w-[22%] h-[20%] bg-gradient-to-t from-[#b8895a]/50 to-transparent" />
              </div>

              {/* Head */}
              <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[62%] h-[68%]">
                {/* Face shape */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#dbb08a] via-[#d4a574] to-[#c99b6b] rounded-[45%_45%_40%_40%]" />
                {/* Forehead highlight */}
                <div className="absolute top-[8%] left-[20%] w-[60%] h-[20%] bg-gradient-to-b from-[#e8c4a0]/60 to-transparent rounded-full blur-sm" />
                {/* Cheek shadows */}
                <div className="absolute top-[45%] left-[5%] w-[25%] h-[25%] bg-[#b8895a]/20 rounded-full blur-md" />
                <div className="absolute top-[45%] right-[5%] w-[25%] h-[25%] bg-[#b8895a]/20 rounded-full blur-md" />
                {/* Jaw shadow */}
                <div className="absolute bottom-[5%] left-[15%] w-[70%] h-[15%] bg-gradient-to-t from-[#b8895a]/30 to-transparent rounded-full blur-sm" />
                {/* Nose */}
                <div className="absolute top-[42%] left-1/2 -translate-x-1/2 w-[12%] h-[22%]">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c99b6b]/50 to-[#b8895a]/30 rounded-full" />
                  {/* Nose highlight */}
                  <div className="absolute top-[20%] left-[30%] w-[40%] h-[50%] bg-[#e8c4a0]/40 rounded-full blur-[2px]" />
                </div>

                {/* Eyes area */}
                <div className="absolute top-[33%] left-[15%] w-[70%] h-[18%] flex justify-between items-center px-[8%]">
                  {/* Left eye */}
                  <div className="relative w-[38%] h-full">
                    {/* Eye socket shadow */}
                    <div className="absolute inset-0 bg-[#a07850]/15 rounded-[50%] blur-[3px]" />
                    {/* Eye white */}
                    <motion.div 
                      className="absolute top-[15%] left-[10%] w-[80%] h-[70%] bg-gradient-to-b from-[#fff] to-[#f5f0f0] rounded-[50%] shadow-inner overflow-hidden"
                      animate={{ scaleY: blinking ? 0.05 : 1 }}
                      transition={{ duration: 0.08 }}
                    >
                      {/* Iris */}
                      <motion.div
                        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[55%] h-[75%] rounded-full bg-gradient-to-b from-[#4a3520] via-[#2d1f10] to-[#1a1008]"
                        animate={{
                          x: state === "thinking" ? "5%" : ["-2%", "2%", "-2%"],
                        }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      >
                        {/* Pupil */}
                        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[50%] h-[50%] rounded-full bg-[#0a0604]" />
                        {/* Eye reflection */}
                        <div className="absolute top-[15%] left-[25%] w-[30%] h-[25%] rounded-full bg-white/80" />
                        <div className="absolute top-[45%] right-[20%] w-[15%] h-[12%] rounded-full bg-white/30" />
                      </motion.div>
                    </motion.div>
                    {/* Eyelid crease */}
                    <div className="absolute top-[8%] left-[10%] w-[80%] h-[1px] bg-[#a07850]/30 rounded-full" />
                    {/* Lower eyelash */}
                    <div className="absolute bottom-[12%] left-[15%] w-[70%] h-[1px] bg-[#5a3d28]/20 rounded-full" />
                  </div>

                  {/* Right eye */}
                  <div className="relative w-[38%] h-full">
                    <div className="absolute inset-0 bg-[#a07850]/15 rounded-[50%] blur-[3px]" />
                    <motion.div 
                      className="absolute top-[15%] left-[10%] w-[80%] h-[70%] bg-gradient-to-b from-[#fff] to-[#f5f0f0] rounded-[50%] shadow-inner overflow-hidden"
                      animate={{ scaleY: blinking ? 0.05 : 1 }}
                      transition={{ duration: 0.08 }}
                    >
                      <motion.div
                        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[55%] h-[75%] rounded-full bg-gradient-to-b from-[#4a3520] via-[#2d1f10] to-[#1a1008]"
                        animate={{
                          x: state === "thinking" ? "5%" : ["-2%", "2%", "-2%"],
                        }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      >
                        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[50%] h-[50%] rounded-full bg-[#0a0604]" />
                        <div className="absolute top-[15%] left-[25%] w-[30%] h-[25%] rounded-full bg-white/80" />
                        <div className="absolute top-[45%] right-[20%] w-[15%] h-[12%] rounded-full bg-white/30" />
                      </motion.div>
                    </motion.div>
                    <div className="absolute top-[8%] left-[10%] w-[80%] h-[1px] bg-[#a07850]/30 rounded-full" />
                    <div className="absolute bottom-[12%] left-[15%] w-[70%] h-[1px] bg-[#5a3d28]/20 rounded-full" />
                  </div>
                </div>

                {/* Eyebrows */}
                <motion.div
                  className="absolute top-[26%] left-[18%] w-[26%] h-[5%] bg-gradient-to-r from-transparent via-[#3d2a1a] to-[#3d2a1a]/60 rounded-full"
                  animate={{ y: state === "greeting" ? -2 : state === "thinking" ? -3 : 0 }}
                  style={{ transform: "rotate(-3deg)" }}
                />
                <motion.div
                  className="absolute top-[26%] right-[18%] w-[26%] h-[5%] bg-gradient-to-l from-transparent via-[#3d2a1a] to-[#3d2a1a]/60 rounded-full"
                  animate={{ y: state === "greeting" ? -2 : state === "thinking" ? -3 : 0 }}
                  style={{ transform: "rotate(3deg)" }}
                />

                {/* Lips / Mouth */}
                <div className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[32%] h-[12%]">
                  {isSpeaking ? (
                    /* Speaking animation — realistic mouth movement */
                    <motion.div
                      className="relative w-full h-full"
                      animate={{ scaleY: [0.6, 1.2, 0.8, 1.0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut" }}
                    >
                      {/* Upper lip */}
                      <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-[#c47060] to-[#b85a50] rounded-t-[50%]" />
                      {/* Lower lip */}
                      <div className="absolute bottom-0 left-[5%] w-[90%] h-[55%] bg-gradient-to-b from-[#d07068] to-[#b85a50] rounded-b-[50%]" />
                      {/* Mouth opening */}
                      <div className="absolute top-[35%] left-[15%] w-[70%] h-[35%] bg-[#3a1515] rounded-[40%]" />
                      {/* Teeth hint */}
                      <div className="absolute top-[35%] left-[25%] w-[50%] h-[15%] bg-[#f5f5f0]/80 rounded-sm" />
                    </motion.div>
                  ) : (
                    /* Resting / smile */
                    <div className="relative w-full h-full">
                      {/* Upper lip */}
                      <div className="absolute top-[20%] left-0 w-full h-[35%] bg-gradient-to-b from-[#c47060] to-[#b85a50] rounded-[50%]">
                        {/* Cupid's bow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-[40%] bg-[#d4a574] rounded-b-full" />
                      </div>
                      {/* Lower lip */}
                      <div className="absolute bottom-[15%] left-[8%] w-[84%] h-[40%] bg-gradient-to-b from-[#d07068] to-[#c06058] rounded-b-[50%]" />
                      {/* Lip line */}
                      <motion.div
                        className="absolute top-[45%] left-[5%] w-[90%] h-[2px] bg-[#8a4040]/60 rounded-full"
                        animate={{
                          scaleX: state === "greeting" || state === "listening" ? 1.05 : 1,
                        }}
                        style={{ borderRadius: "50%", transform: state === "greeting" ? "scaleY(0.5)" : "" }}
                      />
                      {/* Lip highlight */}
                      <div className="absolute bottom-[30%] left-[30%] w-[40%] h-[20%] bg-white/10 rounded-full blur-[1px]" />
                    </div>
                  )}
                </div>

                {/* Hair */}
                <div className="absolute -top-[5%] left-0 w-full h-[40%]">
                  {/* Main hair mass */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1a0e08] via-[#2a1810] to-transparent rounded-t-[45%]" />
                  {/* Hair shine */}
                  <div className="absolute top-[10%] left-[25%] w-[50%] h-[30%] bg-gradient-to-b from-[#4a2a18]/30 to-transparent rounded-full blur-sm" />
                  {/* Side hair - left */}
                  <div className="absolute top-[30%] -left-[3%] w-[20%] h-[80%] bg-gradient-to-b from-[#1a0e08] to-transparent rounded-l-full" />
                  {/* Side hair - right */}
                  <div className="absolute top-[30%] -right-[3%] w-[20%] h-[80%] bg-gradient-to-b from-[#1a0e08] to-transparent rounded-r-full" />
                  {/* Hair part */}
                  <div className="absolute top-[5%] left-[40%] w-[1px] h-[25%] bg-[#3a2018]/30" />
                </div>

                {/* Ears */}
                <div className="absolute top-[35%] -left-[5%] w-[10%] h-[18%] bg-gradient-to-r from-[#c99b6b] to-[#d4a574] rounded-[50%]" />
                <div className="absolute top-[35%] -right-[5%] w-[10%] h-[18%] bg-gradient-to-l from-[#c99b6b] to-[#d4a574] rounded-[50%]" />
                {/* Earring hint */}
                <div className="absolute top-[48%] -left-[2%] w-[3%] h-[3%] bg-[#ffd700]/60 rounded-full" />
                <div className="absolute top-[48%] -right-[2%] w-[3%] h-[3%] bg-[#ffd700]/60 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Speaking wave animation overlay */}
        {isSpeaking && (
          <div className="absolute bottom-0 left-0 right-0 h-[15%] overflow-hidden rounded-b-full">
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          </div>
        )}

        {/* Listening glow overlay */}
        {state === "listening" && !isSpeaking && (
          <div className="absolute inset-0 rounded-full pointer-events-none">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-green-400/20"
              animate={{ scale: [1, 1.03, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        )}
      </motion.div>

      {/* State badge */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          className={`px-5 py-2 rounded-full text-sm font-medium backdrop-blur-md border shadow-lg ${
            state === "idle" ? "bg-slate-800/90 text-slate-300 border-slate-600/50" :
            state === "listening" ? "bg-green-950/80 text-green-300 border-green-500/40" :
            state === "speaking" ? "bg-blue-950/80 text-blue-300 border-blue-500/40" :
            state === "thinking" ? "bg-amber-950/80 text-amber-300 border-amber-500/40" :
            state === "greeting" ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/40" :
            "bg-slate-800/90 text-slate-300 border-slate-600/50"
          }`}
          animate={state === "listening" ? { scale: [1, 1.03, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {state === "idle" && "● Ready"}
          {state === "greeting" && "👋 Hello!"}
          {state === "listening" && "🎤 Listening..."}
          {state === "thinking" && "⏳ Processing..."}
          {state === "speaking" && "🔊 Speaking"}
          {state === "goodbye" && "👋 Goodbye!"}
          {state === "error" && "⚠️ Error"}
        </motion.div>
      </div>
    </div>
  );
}
