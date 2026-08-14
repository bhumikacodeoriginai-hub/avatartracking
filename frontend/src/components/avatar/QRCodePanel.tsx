"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAvatarStore } from "@/store/avatarStore";

/**
 * QRCodePanel - Displays a QR code for mobile continuation.
 * Allows visitors to scan and continue on their phone.
 */
export function QRCodePanel() {
  const { qrData, setShowQR } = useAvatarStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute bottom-32 right-8 bg-white rounded-2xl p-6 shadow-2xl"
    >
      <div className="text-center space-y-3">
        <p className="text-slate-800 text-sm font-medium">
          Scan to continue on your phone
        </p>
        
        {/* QR Code placeholder - in production use qrcode.react */}
        <div className="w-40 h-40 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="grid grid-cols-5 gap-0.5 w-24 h-24 mx-auto">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-full h-full ${
                    Math.random() > 0.5 ? "bg-slate-900" : "bg-white"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-xs">{qrData || "Registration"}</p>
        
        <button
          onClick={() => setShowQR(false)}
          className="text-slate-400 text-xs hover:text-slate-600 underline"
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}
