"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AvatarState } from "@/store/avatarStore";

interface CaptionDisplayProps {
  text: string;
  isVisible: boolean;
  state: AvatarState;
}

/**
 * CaptionDisplay - Shows the avatar's spoken text as captions.
 * Supports accessibility with large readable text.
 */
export function CaptionDisplay({ text, isVisible, state }: CaptionDisplayProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && text && (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative"
        >
          {/* Background blur container */}
          <div className="relative bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            {/* State-specific accent */}
            <div
              className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
                state === "speaking"
                  ? "bg-gradient-to-r from-transparent via-avatar-accent to-transparent"
                  : state === "listening"
                  ? "bg-gradient-to-r from-transparent via-green-400 to-transparent"
                  : state === "thinking"
                  ? "bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                  : "bg-gradient-to-r from-transparent via-slate-500 to-transparent"
              }`}
            />

            {/* Caption text */}
            <p className="text-white text-lg md:text-xl lg:text-2xl text-center font-light leading-relaxed caption-text">
              {text}
            </p>

            {/* Thinking indicator */}
            {state === "thinking" && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <motion.div
                  className="w-2 h-2 bg-amber-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-amber-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-amber-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
