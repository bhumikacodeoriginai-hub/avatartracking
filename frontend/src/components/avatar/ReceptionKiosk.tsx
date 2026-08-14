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

      try {
        // Send to AI
        const response = await aiApi.chat({
          session_id: sessionId,
          message,
          language,
          visitor_name: visitorName,
        });

        // Process AI response
        if (response.mode && response.mode !== mode) {
          setMode(response.mode);
        }

        if (response.suggestions) {
          setSuggestions(response.suggestions);
        }

        // Display response
        setCurrentCaption(response.response);
        setAvatarState("speaking");

        addMessage({
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: response.response,
          timestamp: new Date(),
        });

        // Extract visitor name if present
        if (!visitorName && message.toLowerCase().includes("my name is")) {
          const nameMatch = message.match(/my name is (\w+)/i);
          if (nameMatch) {
            setVisitorName(nameMatch[1]);
          }
        }

        // After speaking, return to listening
        const speakDuration = Math.max(2000, response.response.length * 50);
        setTimeout(() => {
          setAvatarState("listening");
          setIsSpeaking(false);
        }, speakDuration);
      } catch (error) {
        console.error("AI chat error:", error);
        setCurrentCaption(
          "I apologize, but I'm having trouble right now. Please try again or speak with our team."
        );
        setAvatarState("error");
        setTimeout(() => setAvatarState("listening"), 3000);
      } finally {
        setIsProcessing(false);
      }
    },
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
