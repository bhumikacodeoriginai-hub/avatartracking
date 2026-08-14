import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("access_token") 
    : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    return Promise.reject(error);
  }
);

// AI / Conversation APIs
export const aiApi = {
  chat: async (data: {
    session_id: string;
    message: string;
    language?: string;
    visitor_name?: string | null;
    context?: Record<string, unknown>;
  }) => {
    const response = await api.post("/ai/chat", data);
    return response.data;
  },

  detectIntent: async (message: string, context?: Record<string, unknown>) => {
    const response = await api.post("/ai/detect-intent", { message, context });
    return response.data;
  },

  tts: async (text: string, language: string = "en", voice: string = "professional_female") => {
    const response = await api.post("/ai/tts", { text, language, voice });
    return response.data;
  },

  stt: async (audioBase64: string, language: string = "en") => {
    const response = await api.post("/ai/stt", { audio_base64: audioBase64, language });
    return response.data;
  },
};

// CV APIs (called by CV service, frontend reads state)
export const cvApi = {
  getConfig: async () => {
    const response = await api.get("/cv/config");
    return response.data;
  },
};

// Visitor APIs
export const visitorApi = {
  create: async (data: Record<string, unknown>) => {
    const response = await api.post("/visitors", data);
    return response.data;
  },

  createSession: async (data: { track_id?: number; detection_confidence?: number; language?: string }) => {
    const response = await api.post("/visitors/sessions", data);
    return response.data;
  },

  endSession: async (sessionId: string, reason: string = "departure", summary?: string) => {
    const response = await api.put(`/visitors/sessions/${sessionId}/end`, { reason, summary });
    return response.data;
  },

  recordConsent: async (visitorId: string, consentType: string, granted: boolean) => {
    const response = await api.post(`/visitors/${visitorId}/consent`, {
      consent_type: consentType,
      granted,
    });
    return response.data;
  },
};

// Settings APIs
export const settingsApi = {
  getAvatarSettings: async () => {
    const response = await api.get("/settings/avatar");
    return response.data;
  },

  getDetectionSettings: async () => {
    const response = await api.get("/settings/detection");
    return response.data;
  },
};

// Auth APIs
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh", { refresh_token: refreshToken });
    return response.data;
  },

  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Dashboard APIs
export const dashboardApi = {
  overview: async () => {
    const response = await api.get("/analytics/overview");
    return response.data;
  },

  visitors: async (period: string = "week") => {
    const response = await api.get(`/analytics/visitors?period=${period}`);
    return response.data;
  },

  leads: async (period: string = "month") => {
    const response = await api.get(`/analytics/leads?period=${period}`);
    return response.data;
  },
};
