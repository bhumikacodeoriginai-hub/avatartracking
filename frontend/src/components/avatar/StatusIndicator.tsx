"use client";

import React from "react";
import type { AvatarState, ConversationMode } from "@/store/avatarStore";

interface StatusIndicatorProps {
  state: AvatarState;
  isConnected: boolean;
  mode: ConversationMode;
}

/**
 * StatusIndicator - Shows current system status, mode, and connection state.
 */
export function StatusIndicator({ state, isConnected, mode }: StatusIndicatorProps) {
  const modeLabels: Record<ConversationMode, string> = {
    reception: "Reception",
    client: "Client Mode",
    parent: "Parent Mode",
    student: "Student Mode",
    internship: "Internship Mode",
    job: "Job Mode",
    admission: "Admission Mode",
    employee: "Employee Mode",
    general: "General",
  };

  return (
    <div className="flex items-center gap-3">
      {/* Mode badge */}
      {mode !== "reception" && (
        <div className="px-3 py-1 bg-avatar-accent/10 border border-avatar-accent/30 rounded-full">
          <span className="text-avatar-accent text-xs font-medium">
            {modeLabels[mode]}
          </span>
        </div>
      )}

      {/* Connection indicator */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-400" : "bg-red-400"
          }`}
        />
        <span className="text-slate-400 text-xs">
          {isConnected ? "Connected" : "Offline"}
        </span>
      </div>
    </div>
  );
}
