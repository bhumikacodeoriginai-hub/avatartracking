"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceInterfaceProps {
  onMessage: (message: string) => void;
  isListening: boolean;
  language: string;
}

/**
 * VoiceInterface - Handles speech input and text input.
 * Uses Web Speech API for browser-based STT.
 * Falls back to text input when speech is unavailable.
 */
export function VoiceInterface({ onMessage, isListening, language }: VoiceInterfaceProps) {
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Check for Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!speechSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        setInterimTranscript("");
        onMessage(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [speechSupported, language, onMessage]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Handle text submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onMessage(textInput.trim());
      setTextInput("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Interim transcript display */}
      <AnimatePresence>
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-slate-400 text-sm italic"
          >
            &ldquo;{interimTranscript}&rdquo;
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex items-center gap-3">
        {/* Microphone button */}
        {speechSupported && (
          <button
            onClick={isRecording ? stopListening : startListening}
            className={`relative flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? "bg-red-500/20 border-2 border-red-500 text-red-400"
                : "bg-slate-700/50 border-2 border-avatar-accent/50 text-avatar-accent hover:bg-slate-600/50 hover:border-avatar-accent"
            }`}
          >
            {/* Microphone icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>

            {/* Recording animation */}
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-30" />
                <div className="absolute -inset-1 rounded-full border border-red-500/20 animate-pulse" />
              </>
            )}
          </button>
        )}

        {/* Text input */}
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-800/80 border border-slate-600/50 rounded-full px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-avatar-accent/50 focus:ring-1 focus:ring-avatar-accent/30 transition-all"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-avatar-accent/20 border border-avatar-accent/50 text-avatar-accent flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-avatar-accent/30 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" x2="11" y1="2" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
