import { create } from "zustand";

export type AvatarState =
  | "idle"
  | "greeting"
  | "listening"
  | "thinking"
  | "speaking"
  | "goodbye"
  | "error";

export type ConversationMode =
  | "reception"
  | "client"
  | "parent"
  | "student"
  | "internship"
  | "job"
  | "admission"
  | "employee"
  | "general";

export interface Message {
  id: string;
  role: "visitor" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface AvatarStore {
  // Avatar state
  avatarState: AvatarState;
  setAvatarState: (state: AvatarState) => void;

  // Session
  sessionId: string | null;
  sessionActive: boolean;
  startSession: (sessionId: string) => void;
  endSession: () => void;

  // Conversation
  mode: ConversationMode;
  setMode: (mode: ConversationMode) => void;
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  // Visitor
  visitorName: string | null;
  setVisitorName: (name: string) => void;

  // Voice
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  currentCaption: string;
  setCurrentCaption: (caption: string) => void;

  // Suggestions
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;

  // Language
  language: string;
  setLanguage: (language: string) => void;

  // QR Code
  showQR: boolean;
  qrData: string | null;
  setShowQR: (show: boolean, data?: string) => void;

  // Connection
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Reset
  reset: () => void;
}

export const useAvatarStore = create<AvatarStore>((set) => ({
  // Avatar state
  avatarState: "idle",
  setAvatarState: (state) => set({ avatarState: state }),

  // Session
  sessionId: null,
  sessionActive: false,
  startSession: (sessionId) =>
    set({ sessionId, sessionActive: true, avatarState: "greeting" }),
  endSession: () =>
    set({
      sessionId: null,
      sessionActive: false,
      avatarState: "idle",
      visitorName: null,
      messages: [],
      mode: "reception",
      suggestions: [],
      currentCaption: "",
    }),

  // Conversation
  mode: "reception",
  setMode: (mode) => set({ mode }),
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  // Visitor
  visitorName: null,
  setVisitorName: (name) => set({ visitorName: name }),

  // Voice
  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),
  isSpeaking: false,
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
  currentCaption: "",
  setCurrentCaption: (caption) => set({ currentCaption: caption }),

  // Suggestions
  suggestions: [
    "I'm here for a meeting",
    "I want to inquire about courses",
    "I'm looking for a job",
    "I have an appointment",
  ],
  setSuggestions: (suggestions) => set({ suggestions }),

  // Language
  language: "en",
  setLanguage: (language) => set({ language }),

  // QR Code
  showQR: false,
  qrData: null,
  setShowQR: (show, data) => set({ showQR: show, qrData: data || null }),

  // Connection
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),

  // Reset
  reset: () =>
    set({
      avatarState: "idle",
      sessionId: null,
      sessionActive: false,
      mode: "reception",
      messages: [],
      visitorName: null,
      isListening: false,
      isSpeaking: false,
      currentCaption: "",
      suggestions: [
        "I'm here for a meeting",
        "I want to inquire about courses",
        "I'm looking for a job",
        "I have an appointment",
      ],
      showQR: false,
      qrData: null,
    }),
}));
