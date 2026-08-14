"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAvatarStore } from "@/store/avatarStore";
import { Avatar3D } from "./Avatar3D";
import { CaptionDisplay } from "./CaptionDisplay";
import { SuggestionButtons } from "./SuggestionButtons";
import { StatusIndicator } from "./StatusIndicator";

// ===== INSTANT LOCAL AI =====
function getInstantResponse(message: string): { response: string; mode: string; suggestions: string[] } {
  const msg = message.toLowerCase().trim();

  if (msg.includes("meeting") || msg.includes("client") || msg.includes("appointment")) {
    return { response: "Welcome! Who are you here to meet? I can check their availability right now.", mode: "client", suggestions: ["The manager", "Admissions team", "HR department"] };
  }
  if (msg.includes("course") || msg.includes("learn") || msg.includes("python") || msg.includes("java") || msg.includes("training") || msg.includes("devops") || msg.includes("aws")) {
    return { response: "We offer Python, Java, DevOps, AWS, AI, Web Development and more. Are you a beginner or experienced?", mode: "student", suggestions: ["I'm a beginner", "I have experience", "What are the fees?", "Next batch?"] };
  }
  if (msg.includes("job") || msg.includes("career") || msg.includes("position") || msg.includes("work here") || msg.includes("vacancy")) {
    return { response: "We have openings for Python Developer, DevOps Engineer, Full Stack Developer and more. What's your experience?", mode: "job", suggestions: ["Python developer", "3 years experience", "Submit resume", "Available roles?"] };
  }
  if (msg.includes("internship") || msg.includes("intern")) {
    return { response: "We offer internships in Python, AWS, DevOps, AI, and Web Development. Which area interests you?", mode: "internship", suggestions: ["Python/AI", "Cloud/AWS", "Web Development", "Duration?"] };
  }
  if (msg.includes("beginner") || msg.includes("new") || msg.includes("start")) {
    return { response: "Our Python Fundamentals course is perfect for beginners. 3 months, hands-on projects, certification included. Want to know about fees or schedule?", mode: "student", suggestions: ["Fees?", "Schedule?", "Certificate?", "Placement?"] };
  }
  if (msg.includes("fee") || msg.includes("cost") || msg.includes("price") || msg.includes("how much")) {
    return { response: "Course fees vary by program. Shall I connect you with our admissions counsellor for exact pricing?", mode: "admission", suggestions: ["Yes please", "Payment options?", "Discounts?"] };
  }
  if (msg.includes("experience") || msg.includes("years") || msg.includes("senior") || msg.includes("advanced")) {
    return { response: "With your experience, our advanced programs or job opportunities might be perfect. What would you prefer?", mode: "general", suggestions: ["Advanced courses", "Job opportunities", "Both"] };
  }
  if (msg.includes("name is") || msg.includes("i am ") || msg.includes("i'm ") || msg.includes("myself")) {
    const nameMatch = msg.match(/(?:name is|i am|i'm|myself)\s+(\w+)/i);
    const name = nameMatch ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1) : "there";
    return { response: `Nice to meet you, ${name}! What brings you here today?`, mode: "reception", suggestions: ["Course enquiry", "Job opportunity", "Meeting someone", "Internship"] };
  }
  if (msg.includes("thank") || msg.includes("bye") || msg.includes("done")) {
    return { response: "Thank you for visiting! Have a wonderful day!", mode: "reception", suggestions: [] };
  }
  if (msg.includes("human") || msg.includes("person") || msg.includes("staff")) {
    return { response: "I'll connect you with our team right away. Please have a seat.", mode: "reception", suggestions: [] };
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("good")) {
    return { response: "Hello! Welcome to our office. How can I help you today?", mode: "reception", suggestions: ["Course enquiry", "Job opportunity", "Meeting someone", "Internship"] };
  }
  if (msg.includes("schedule") || msg.includes("timing") || msg.includes("batch") || msg.includes("when")) {
    return { response: "We have morning, afternoon, and weekend batches. Next batch starts in 2 weeks. Which timing works?", mode: "student", suggestions: ["Morning", "Afternoon", "Weekend", "Online?"] };
  }
  if (msg.includes("certificate") || msg.includes("certification")) {
    return { response: "Yes! All courses include industry-recognized certificates on completion.", mode: "student", suggestions: ["Placement?", "Duration?", "Register"] };
  }
  if (msg.includes("placement") || msg.includes("job assist")) {
    return { response: "We provide placement assistance with resume building, mock interviews, and referrals to partner companies.", mode: "student", suggestions: ["Success rate?", "Companies?", "Register"] };
  }
  if (msg.includes("online") || msg.includes("offline") || msg.includes("remote")) {
    return { response: "Both online and offline modes available. Online classes are live with the same trainer.", mode: "student", suggestions: ["Online", "Offline", "Fees?"] };
  }
  if (msg.includes("resume") || msg.includes("cv")) {
    return { response: "You can share your resume via email or scan a QR code. Which do you prefer?", mode: "job", suggestions: ["Email", "QR code"] };
  }

  return { response: "I can help with courses, jobs, internships, or connect you with our team. What would you like?", mode: "reception", suggestions: ["Courses", "Jobs", "Internships", "Meet someone"] };
}

/**
 * ReceptionKiosk - Voice-driven AI receptionist.
 * 
 * FIX: Browser requires ONE user click before TTS can play.
 * Shows a "Start" button first, then everything is automatic.
 */
export function ReceptionKiosk() {
  const {
    avatarState, setAvatarState, sessionActive, sessionId, startSession,
    mode, setMode, addMessage, visitorName, setVisitorName,
    isSpeaking, currentCaption, setCurrentCaption, suggestions, setSuggestions,
    setIsSpeaking,
  } = useAvatarStore();

  const [started, setStarted] = useState(false); // User must click once to unlock audio
  const [isProcessing, setIsProcessing] = useState(false);
  const [visitorTranscript, setVisitorTranscript] = useState("");
  const [micStatus, setMicStatus] = useState<"off" | "on" | "heard">("off");
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const shouldListenRef = useRef(true);
  const voicesLoaded = useRef(false);

  // ===== LOAD VOICES (Chrome needs this) =====
  const loadVoices = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) voicesLoaded.current = true;
  }, []);

  useEffect(() => {
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices]);

  // ===== SPEAK: Avatar speaks out loud =====
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;

    setCurrentCaption(text);
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    setAvatarState("speaking");
    stopMic();

    const synth = window.speechSynthesis;
    if (!synth) {
      // Fallback: just show text, then resume
      const dur = Math.max(2000, text.length * 50);
      setTimeout(() => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setAvatarState("listening");
        startMic();
      }, dur);
      return;
    }

    // Cancel anything in queue
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.lang = "en-US";

    // Select best voice
    const voices = synth.getVoices();
    const voice =
      voices.find(v => v.name.includes("Google US English") && v.lang === "en-US") ||
      voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
      voices.find(v => v.name.includes("Samantha")) ||
      voices.find(v => v.name.includes("Zira")) ||
      voices.find(v => v.name.includes("Microsoft") && v.lang.startsWith("en")) ||
      voices.find(v => v.lang.startsWith("en-") && !v.localService) ||
      voices.find(v => v.lang.startsWith("en"));

    if (voice) utter.voice = voice;

    utter.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      setAvatarState("listening");
      setTimeout(() => startMic(), 300);
    };

    utter.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      setAvatarState("listening");
      setTimeout(() => startMic(), 300);
    };

    synth.speak(utter);

    // Chrome bug: speechSynthesis can get stuck. Force-resume.
    const watchdog = setInterval(() => {
      if (!synth.speaking) {
        clearInterval(watchdog);
        if (isSpeakingRef.current) {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          setAvatarState("listening");
          setTimeout(() => startMic(), 300);
        }
      }
    }, 500);

    // Safety timeout (max 15 seconds for any utterance)
    setTimeout(() => {
      clearInterval(watchdog);
      if (isSpeakingRef.current) {
        synth.cancel();
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        setAvatarState("listening");
        startMic();
      }
    }, 15000);
  }, [setAvatarState, setCurrentCaption, setIsSpeaking]);

  // ===== MIC: Continuous speech recognition =====
  const startMic = useCallback(() => {
    if (typeof window === "undefined" || isSpeakingRef.current || !shouldListenRef.current) return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setMicStatus("off"); return; }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => setMicStatus("on");

    rec.onresult = (e: any) => {
      if (isSpeakingRef.current) return;

      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }

      if (interim) {
        setVisitorTranscript(interim);
        setMicStatus("heard");
      }

      if (final.trim()) {
        setVisitorTranscript("");
        setMicStatus("on");
        processMessage(final.trim());
      }
    };

    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicStatus("off");
        return;
      }
    };

    rec.onend = () => {
      if (shouldListenRef.current && !isSpeakingRef.current) {
        setTimeout(() => startMic(), 200);
      }
    };

    try { rec.start(); } catch {}
    recognitionRef.current = rec;
  }, []);

  const stopMic = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  // ===== PROCESS MESSAGE =====
  const processMessage = useCallback((message: string) => {
    if (isProcessing || isSpeakingRef.current) return;

    setIsProcessing(true);
    setAvatarState("thinking");
    setVisitorTranscript("");
    stopMic();

    // Extract name
    if (!visitorName) {
      const m = message.match(/(?:name is|i am|i'm|myself)\s+(\w+)/i);
      if (m) setVisitorName(m[1].charAt(0).toUpperCase() + m[1].slice(1));
    }

    // INSTANT response
    const result = getInstantResponse(message);

    if (result.mode !== mode) setMode(result.mode as any);
    if (result.suggestions.length > 0) setSuggestions(result.suggestions);

    addMessage({ id: `v-${Date.now()}`, role: "visitor", content: message, timestamp: new Date() });
    addMessage({ id: `a-${Date.now()}`, role: "assistant", content: result.response, timestamp: new Date() });

    setIsProcessing(false);

    // SPEAK the response
    speak(result.response);
  }, [isProcessing, mode, visitorName, speak, setAvatarState, setMode, setSuggestions, addMessage, stopMic, setVisitorName]);

  // ===== USER CLICKS "START" — unlocks audio + mic =====
  const handleStart = useCallback(() => {
    setStarted(true);

    // Unlock audio context by speaking
    const id = `session-${Date.now()}`;
    startSession(id);
    setSuggestions(["Course enquiry", "Job opportunity", "Meeting someone", "Internship"]);

    // Small delay then speak greeting
    setTimeout(() => {
      speak("Hello! Welcome to our office. How can I help you today?");
    }, 200);
  }, [speak, startSession, setSuggestions]);

  // Cleanup
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      stopMic();
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [stopMic]);

  // ===== START SCREEN (one-time click to unlock audio) =====
  if (!started) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-avatar-bg select-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-avatar-accent/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
          {/* Avatar preview */}
          <Avatar3D state="idle" isSpeaking={false} />

          {/* Welcome text */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              AI Office Assistant
            </h1>
            <p className="text-slate-400 text-lg">
              Your intelligent receptionist is ready
            </p>
          </div>

          {/* START button — unlocks TTS + Mic */}
          <motion.button
            onClick={handleStart}
            className="px-10 py-4 bg-gradient-to-r from-avatar-accent to-cyan-400 text-white text-xl font-semibold rounded-2xl shadow-lg shadow-avatar-accent/30 hover:shadow-avatar-accent/50 transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🎤 Start Conversation
          </motion.button>

          <p className="text-slate-500 text-sm max-w-md text-center">
            Click to begin. The assistant will speak to you and listen for your responses automatically.
          </p>
        </div>
      </div>
    );
  }

  // ===== MAIN KIOSK UI =====
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-avatar-bg select-none">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-avatar-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between h-full p-6">
        {/* Header */}
        <header className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-avatar-accent to-cyan-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-semibold">AI Office Assistant</h1>
              <p className="text-slate-400 text-xs">Voice-Enabled Receptionist</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              micStatus === "on" ? "bg-green-500/10 border-green-500/30" :
              micStatus === "heard" ? "bg-amber-500/10 border-amber-500/30" :
              "bg-slate-700/50 border-slate-600/30"
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${
                micStatus === "on" ? "bg-green-400 animate-pulse" :
                micStatus === "heard" ? "bg-amber-400" :
                "bg-slate-500"
              }`} />
              <span className={`text-xs font-medium ${
                micStatus === "on" ? "text-green-400" :
                micStatus === "heard" ? "text-amber-400" :
                "text-slate-500"
              }`}>
                {micStatus === "on" ? "Listening" : micStatus === "heard" ? "Hearing..." : "Mic Off"}
              </span>
            </div>
            <StatusIndicator state={avatarState} isConnected={true} mode={mode} />
          </div>
        </header>

        {/* Avatar */}
        <div className="flex-1 flex items-center justify-center w-full">
          <Avatar3D state={avatarState} isSpeaking={isSpeaking} />
        </div>

        {/* Visitor transcript */}
        <AnimatePresence>
          {visitorTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl mb-2"
            >
              <div className="bg-green-500/5 backdrop-blur-sm rounded-xl px-5 py-3 border border-green-500/20">
                <p className="text-green-300 text-base text-center">
                  🎤 &ldquo;{visitorTranscript}&rdquo;
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar response caption */}
        <div className="w-full max-w-3xl mb-3">
          <CaptionDisplay text={currentCaption} isVisible={!!currentCaption} state={avatarState} />
        </div>

        {/* Suggestion buttons */}
        <div className="w-full max-w-3xl">
          {sessionActive && suggestions.length > 0 && avatarState === "listening" && (
            <SuggestionButtons suggestions={suggestions} onSelect={processMessage} />
          )}
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center mt-3">
          <span className="text-slate-500 text-xs">🔊 Speak naturally — I&apos;m listening and will respond automatically</span>
        </footer>
      </div>
    </div>
  );
}
