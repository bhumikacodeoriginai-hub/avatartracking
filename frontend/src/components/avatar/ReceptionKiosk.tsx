"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAvatarStore } from "@/store/avatarStore";
import { Avatar3D } from "./Avatar3D";
import { VoiceInterface } from "./VoiceInterface";
import { CaptionDisplay } from "./CaptionDisplay";
import { SuggestionButtons } from "./SuggestionButtons";
import { StatusIndicator } from "./StatusIndicator";
import { QRCodePanel } from "./QRCodePanel";
import { VisitorRegistration } from "./VisitorRegistration";
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
      response: "Thank you for visiting! It was great talking with you. Have a wonderful day! 👋",
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
 * This is the full-screen UI displayed on the reception display/kiosk.
 * It integrates the 3D avatar, voice interface, captions, and interaction UI.
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
    messages,
    addMessage,
    visitorName,
    setVisitorName,
    isListening,
    isSpeaking,
    currentCaption,
    setCurrentCaption,
    suggestions,
    setSuggestions,
    showQR,
    language,
    setIsListening,
    setIsSpeaking,
  } = useAvatarStore();

  const [showRegistration, setShowRegistration] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate session start (in production, CV service triggers this)
  useEffect(() => {
    // Auto-start demo session after component mounts
    const demoTimeout = setTimeout(() => {
      if (!sessionActive) {
        const demoSessionId = `demo-${Date.now()}`;
        startSession(demoSessionId);
        setCurrentCaption("Hello! Welcome to our office. How can I help you today?");
        setSuggestions([
          "I'm here for a meeting",
          "I want to inquire about courses",
          "I'm looking for a job",
          "I'm looking for an internship",
        ]);
        
        // Transition to listening after greeting
        setTimeout(() => {
          setAvatarState("listening");
        }, 3000);
      }
    }, 2000);

    return () => clearTimeout(demoTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Idle timeout management
  useEffect(() => {
    if (sessionActive && avatarState === "listening") {
      // Reset idle timer on any state change
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      
      idleTimerRef.current = setTimeout(() => {
        setCurrentCaption("Is there anything else I can help you with?");
        setAvatarState("speaking");
        
        // Final goodbye timeout
        setTimeout(() => {
          setCurrentCaption("Thank you for visiting. Have a great day!");
          setAvatarState("goodbye");
          
          setTimeout(() => {
            endSession();
          }, 3000);
        }, 10000);
      }, 30000); // 30 second idle timeout
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [sessionActive, avatarState]);

  // Handle visitor message (from voice or text)
  const handleVisitorMessage = useCallback(
    async (message: string) => {
      if (!sessionId || isProcessing) return;

      setIsProcessing(true);
      setAvatarState("thinking");

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
        // Try to send to backend AI
        const response = await aiApi.chat({
          session_id: sessionId,
          message,
          language,
          visitor_name: visitorName,
        });

        responseText = response.response;
        responseMode = response.mode || mode;
        responseSuggestions = response.suggestions || [];
      } catch (error) {
        // Backend unavailable — use local demo AI
        console.log("Backend unavailable, using demo mode");
        const demoResult = getDemoResponse(message);
        responseText = demoResult.response;
        responseMode = demoResult.mode;
        responseSuggestions = demoResult.suggestions;
      }

      // Process response
      if (responseMode !== mode) {
        setMode(responseMode as any);
      }

      if (responseSuggestions.length > 0) {
        setSuggestions(responseSuggestions);
      }

      // Display response
      setCurrentCaption(responseText);
      setAvatarState("speaking");

      addMessage({
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      });

      // Extract visitor name if present
      if (!visitorName && message.toLowerCase().includes("my name is")) {
        const nameMatch = message.match(/(?:my name is|i am|i'm)\s+(\w+)/i);
        if (nameMatch) {
          setVisitorName(nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1));
        }
      }

      // After speaking, return to listening
      const speakDuration = Math.max(2000, responseText.length * 40);
      setTimeout(() => {
        setAvatarState("listening");
        setIsSpeaking(false);
      }, speakDuration);

      setIsProcessing(false);
    },
    [sessionId, mode, language, visitorName, isProcessing, addMessage, setAvatarState, setCurrentCaption, setIsSpeaking, setMode, setSuggestions, setVisitorName]
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
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-8">
        {/* Top bar - Company name and status */}
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
          <StatusIndicator
            state={avatarState}
            isConnected={true}
            mode={mode}
          />
        </header>

        {/* Avatar area */}
        <div className="flex-1 flex items-center justify-center w-full max-w-2xl">
          <div className="relative">
            {/* Avatar glow ring */}
            {sessionActive && (
              <div className="absolute inset-0 -m-4 rounded-full border-2 border-avatar-accent/30 animate-glow" />
            )}
            <Avatar3D state={avatarState} isSpeaking={isSpeaking} />
          </div>
        </div>

        {/* Caption / Response area */}
        <div className="w-full max-w-3xl mb-4">
          <CaptionDisplay
            text={currentCaption}
            isVisible={!!currentCaption}
            state={avatarState}
          />
        </div>

        {/* Interaction area */}
        <div className="w-full max-w-3xl space-y-4">
          {/* Voice interface */}
          {sessionActive && (
            <VoiceInterface
              onMessage={handleVisitorMessage}
              isListening={isListening}
              language={language}
            />
          )}

          {/* Suggestion buttons */}
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

        {/* QR Code Panel */}
        {showQR && <QRCodePanel />}

        {/* Registration Modal */}
        {showRegistration && (
          <VisitorRegistration
            onClose={() => setShowRegistration(false)}
            sessionId={sessionId}
          />
        )}

        {/* Footer */}
        <footer className="w-full flex items-center justify-between mt-4 text-slate-600 text-xs">
          <span>Powered by AI Avatar Platform</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </footer>
      </div>
    </div>
  );
}
