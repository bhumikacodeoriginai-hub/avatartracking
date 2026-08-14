"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAvatarStore } from "@/store/avatarStore";
import { Avatar3D } from "./Avatar3D";
import { CaptionDisplay } from "./CaptionDisplay";
import { SuggestionButtons } from "./SuggestionButtons";
import { StatusIndicator } from "./StatusIndicator";
import { aiApi } from "@/lib/api";

/**
 * Local demo AI - provides intelligent responses when backend is unavailable.
 */
function getDemoResponse(message: string): { response: string; mode: string; suggestions: string[] } {
  const msg = message.toLowerCase();

  if (msg.includes("meeting") || msg.includes("client") || msg.includes("appointment")) {
    return {
      response: "Welcome! Who are you here to meet? I can check if they're available and notify them of your arrival.",
      mode: "client",
      suggestions: ["I have an appointment with the manager", "I'm meeting the admissions team", "Can you check if Rahul is available?"],
    };
  }
  if (msg.includes("course") || msg.includes("learn") || msg.includes("python") || msg.includes("training")) {
    return {
      response: "I'd be happy to help with course information! We offer programs in Python, Java, DevOps, AWS, AI/ML, Web Development, and more. Are you a beginner or do you have prior programming experience?",
      mode: "student",
      suggestions: ["I'm a complete beginner", "I have some experience", "What are the fees?", "When does the next batch start?"],
    };
  }
  if (msg.includes("job") || msg.includes("career") || msg.includes("position") || msg.includes("opening")) {
    return {
      response: "We have several open positions! Could you tell me about your experience and the kind of role you're looking for? We currently have openings for Python Developer, DevOps Engineer, Full Stack Developer, and more.",
      mode: "job",
      suggestions: ["I'm a Python developer with 3 years experience", "What positions are available?", "How do I submit my resume?"],
    };
  }
  if (msg.includes("internship") || msg.includes("intern")) {
    return {
      response: "Great! We offer internship programs in Python, AWS, DevOps, AI/ML, Web Development, and more. What's your current education level and which area interests you?",
      mode: "internship",
      suggestions: ["I'm interested in Python/AI", "I'm a final year student", "What's the duration?", "Is it paid?"],
    };
  }
  if (msg.includes("beginner") || msg.includes("new to programming")) {
    return {
      response: "Perfect! For beginners, I'd recommend starting with our Python Fundamentals course. It's a 3-month program covering basics to intermediate concepts with hands-on projects. Would you like details on fees, schedule, or syllabus?",
      mode: "student",
      suggestions: ["What are the fees?", "What's the schedule?", "Do you provide certificates?", "Is placement assistance available?"],
    };
  }
  if (msg.includes("fee") || msg.includes("cost") || msg.includes("price")) {
    return {
      response: "Our course fees vary by program. For the most accurate and current fee information, I'd recommend speaking with our admissions counsellor. Would you like me to connect you with them?",
      mode: "admission",
      suggestions: ["Yes, connect me with admissions", "What about payment options?", "Are there any discounts?"],
    };
  }
  if (msg.includes("experience") || msg.includes("years")) {
    return {
      response: "That's great! With your experience, you might be a good fit for our advanced programs or even our job openings. Would you like to explore advanced courses, or are you looking for job opportunities with us?",
      mode: "general",
      suggestions: ["Tell me about advanced courses", "I'm looking for a job", "What's the admission process?"],
    };
  }
  if (msg.includes("name is") || msg.includes("i am") || msg.includes("i'm")) {
    const nameMatch = msg.match(/(?:name is|i am|i'm)\s+(\w+)/i);
    const name = nameMatch ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1) : "there";
    return {
      response: `Nice to meet you, ${name}! What brings you to our office today? I can help with course enquiries, job opportunities, internships, or meeting someone from our team.`,
      mode: "reception",
      suggestions: ["I want to inquire about courses", "I'm looking for a job", "I have a meeting", "I'm looking for an internship"],
    };
  }
  if (msg.includes("thank") || msg.includes("bye") || msg.includes("that's all")) {
    return {
      response: "Thank you for visiting! It was great talking with you. Have a wonderful day!",
      mode: "reception",
      suggestions: [],
    };
  }
  if (msg.includes("human") || msg.includes("real person") || msg.includes("someone")) {
    return {
      response: "Of course! I'll connect you with our reception team right away. Please have a seat and someone will be with you shortly.",
      mode: "reception",
      suggestions: ["Thank you"],
    };
  }

  return {
    response: "I'd be happy to help you! Could you tell me a bit more about what brings you here today? I can assist with course enquiries, job opportunities, internships, appointments, or general information about our office.",
    mode: "reception",
    suggestions: ["I want to inquire about courses", "I'm looking for a job", "I have an appointment", "I'm looking for an internship"],
  };
}

/**
 * ReceptionKiosk - Main kiosk display component.
 * 
 * FULLY VOICE-DRIVEN:
 * - Avatar SPEAKS responses automatically using Text-to-Speech
 * - Microphone is ALWAYS LISTENING (continuous speech recognition)
 * - No need to press buttons — just talk naturally
 * - Suggestion buttons remain as visual aid / touch fallback
 */
export function ReceptionKiosk() {
  const {
    avatarState,
    setAvatarState,
    sessionActive,
    sessionId,
    startSession,
    endSession,
    mode,
    setMode,
    addMessage,
    visitorName,
    setVisitorName,
    isSpeaking,
    currentCaption,
    setCurrentCaption,
    suggestions,
    setSuggestions,
    showQR,
    language,
    setIsSpeaking,
  } = useAvatarStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [visitorTranscript, setVisitorTranscript] = useState("");
  const [micStatus, setMicStatus] = useState<"off" | "listening" | "heard">("off");
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isCurrentlySpeaking = useRef(false);
  const autoRestartRef = useRef(true);

  // ===== TEXT-TO-SPEECH: Avatar speaks out loud =====
  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    
    // Cancel any ongoing speech
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    
    // Try to get a natural female voice
    const voices = synth.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")
    ) || voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Samantha") || v.name.includes("Zira") || v.name.includes("Google"))
    ) || voices.find(
      (v) => v.lang.startsWith("en")
    );
    
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => {
      isCurrentlySpeaking.current = true;
      setIsSpeaking(true);
      setAvatarState("speaking");
      // Pause listening while avatar is speaking to prevent feedback
      stopListening();
    };
    
    utterance.onend = () => {
      isCurrentlySpeaking.current = false;
      setIsSpeaking(false);
      setAvatarState("listening");
      // Resume listening after avatar finishes speaking
      setTimeout(() => {
        startListening();
      }, 500);
    };
    
    utterance.onerror = () => {
      isCurrentlySpeaking.current = false;
      setIsSpeaking(false);
      setAvatarState("listening");
      setTimeout(() => startListening(), 500);
    };
    
    synth.speak(utterance);
  }, [language, setIsSpeaking, setAvatarState]);

  // ===== SPEECH RECOGNITION: Always listening for visitor =====
  const startListening = useCallback(() => {
    if (typeof window === "undefined" || isCurrentlySpeaking.current) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicStatus("off");
      return;
    }

    // Don't restart if already running
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-US";

    recognition.onstart = () => {
      setMicStatus("listening");
    };

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      // Show interim transcript
      if (interimText) {
        setVisitorTranscript(interimText);
        setMicStatus("heard");
      }

      // Process final result
      if (finalText.trim()) {
        setVisitorTranscript("");
        setMicStatus("listening");
        handleVisitorMessage(finalText.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setMicStatus("off");
        return;
      }
      // Auto-restart on other errors
      setMicStatus("listening");
    };

    recognition.onend = () => {
      // Auto-restart recognition (continuous listening)
      if (autoRestartRef.current && !isCurrentlySpeaking.current) {
        setTimeout(() => {
          if (autoRestartRef.current) startListening();
        }, 300);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setMicStatus("off");
  }, []);

  // ===== AUTO-START SESSION & VOICE =====
  useEffect(() => {
    // Load voices
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    // Auto-start demo session
    const demoTimeout = setTimeout(() => {
      if (!sessionActive) {
        const demoSessionId = `demo-${Date.now()}`;
        startSession(demoSessionId);
        
        const greeting = "Hello! Welcome to our office. How can I help you today?";
        setCurrentCaption(greeting);
        setSuggestions([
          "I'm here for a meeting",
          "I want to inquire about courses",
          "I'm looking for a job",
          "I'm looking for an internship",
        ]);
        
        // Speak the greeting automatically
        setTimeout(() => {
          speakText(greeting);
        }, 500);
      }
    }, 1500);

    return () => {
      clearTimeout(demoTimeout);
      autoRestartRef.current = false;
      stopListening();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Idle timeout management
  useEffect(() => {
    if (sessionActive && avatarState === "listening") {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      
      idleTimerRef.current = setTimeout(() => {
        const idleMsg = "Is there anything else I can help you with?";
        setCurrentCaption(idleMsg);
        speakText(idleMsg);
        
        // Final goodbye timeout
        setTimeout(() => {
          const byeMsg = "Thank you for visiting. Have a great day!";
          setCurrentCaption(byeMsg);
          speakText(byeMsg);
          
          setTimeout(() => {
            endSession();
            stopListening();
          }, 4000);
        }, 15000);
      }, 45000); // 45 second idle timeout
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive, avatarState]);

  // ===== HANDLE VISITOR MESSAGE (from voice or button click) =====
  const handleVisitorMessage = useCallback(
    async (message: string) => {
      if (!sessionId || isProcessing || isCurrentlySpeaking.current) return;

      setIsProcessing(true);
      setAvatarState("thinking");
      setVisitorTranscript("");
      stopListening(); // Pause listening while processing

      // Add visitor message
      addMessage({
        id: `msg-${Date.now()}`,
        role: "visitor",
        content: message,
        timestamp: new Date(),
      });

      let responseText = "";
      let responseMode = mode;
      let responseSuggestions: string[] = [];

      try {
        const response = await aiApi.chat({
          session_id: sessionId,
          message,
          language,
          visitor_name: visitorName,
        });
        responseText = response.response;
        responseMode = response.mode || mode;
        responseSuggestions = response.suggestions || [];
      } catch {
        const demoResult = getDemoResponse(message);
        responseText = demoResult.response;
        responseMode = demoResult.mode;
        responseSuggestions = demoResult.suggestions;
      }

      // Update state
      if (responseMode !== mode) {
        setMode(responseMode as any);
      }
      if (responseSuggestions.length > 0) {
        setSuggestions(responseSuggestions);
      }

      // Display & SPEAK the response
      setCurrentCaption(responseText);
      addMessage({
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      });

      // Extract visitor name
      if (!visitorName) {
        const nameMatch = message.match(/(?:my name is|i am|i'm)\s+(\w+)/i);
        if (nameMatch) {
          setVisitorName(nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1));
        }
      }

      setIsProcessing(false);
      
      // SPEAK THE RESPONSE (this will also handle state transitions)
      speakText(responseText);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, mode, language, visitorName, isProcessing]
  );

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleVisitorMessage(suggestion);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-avatar-bg">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Ambient particles effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-avatar-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-8">
        {/* Top bar */}
        <header className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-avatar-accent to-cyan-400 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-semibold">AI Office Assistant</h1>
              <p className="text-slate-400 text-xs">Intelligent Receptionist</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Mic status indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-colors ${
                micStatus === "listening" ? "bg-green-400 animate-pulse" :
                micStatus === "heard" ? "bg-amber-400 animate-pulse" :
                "bg-slate-500"
              }`} />
              <span className="text-slate-400 text-xs">
                {micStatus === "listening" ? "🎤 Mic Active" :
                 micStatus === "heard" ? "🎤 Hearing..." :
                 "🎤 Mic Off"}
              </span>
            </div>
            <StatusIndicator state={avatarState} isConnected={true} mode={mode} />
          </div>
        </header>

        {/* Avatar area */}
        <div className="flex-1 flex items-center justify-center w-full max-w-2xl">
          <Avatar3D state={avatarState} isSpeaking={isSpeaking} />
        </div>

        {/* Visitor's voice transcript (what they're saying) */}
        {visitorTranscript && (
          <div className="w-full max-w-3xl mb-2">
            <div className="bg-slate-700/40 backdrop-blur-sm rounded-xl px-5 py-3 border border-slate-600/30">
              <p className="text-slate-300 text-sm italic text-center">
                🎤 &ldquo;{visitorTranscript}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Caption / Avatar response area */}
        <div className="w-full max-w-3xl mb-4">
          <CaptionDisplay
            text={currentCaption}
            isVisible={!!currentCaption}
            state={avatarState}
          />
        </div>

        {/* Suggestion buttons (touch fallback) */}
        <div className="w-full max-w-3xl space-y-4">
          {sessionActive && suggestions.length > 0 && avatarState === "listening" && (
            <SuggestionButtons
              suggestions={suggestions}
              onSelect={handleSuggestionClick}
            />
          )}

          {/* Idle state message */}
          {!sessionActive && (
            <div className="text-center animate-fade-in">
              <p className="text-slate-300 text-2xl font-light mb-2">
                Welcome — I&apos;m your AI Assistant
              </p>
              <p className="text-slate-500 text-sm">
                Step closer to begin a conversation
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-between mt-4 text-slate-600 text-xs">
          <span>🔊 Voice-enabled — Just speak naturally</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </footer>
      </div>
    </div>
  );
}
