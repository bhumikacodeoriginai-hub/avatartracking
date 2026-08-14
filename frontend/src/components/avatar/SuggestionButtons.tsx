"use client";

import React from "react";
import { motion } from "framer-motion";

interface SuggestionButtonsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

/**
 * SuggestionButtons - Quick action buttons for common visitor responses.
 * Displayed during listening state to guide interaction.
 */
export function SuggestionButtons({ suggestions, onSelect }: SuggestionButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={suggestion}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(suggestion)}
          className="px-4 py-2 bg-slate-700/60 hover:bg-slate-600/80 border border-slate-500/30 hover:border-avatar-accent/50 rounded-full text-sm text-slate-200 hover:text-white transition-all duration-200 whitespace-nowrap"
        >
          {suggestion}
        </motion.button>
      ))}
    </motion.div>
  );
}
