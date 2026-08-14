"use client";

import React, { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  useGLTF, 
  useAnimations, 
  Environment,
  ContactShadows,
  Html
} from "@react-three/drei";
import * as THREE from "three";
import type { AvatarState } from "@/store/avatarStore";

interface Avatar3DProps {
  state: AvatarState;
  isSpeaking: boolean;
}

// Ready Player Me avatar URL - Professional female corporate avatar
const AVATAR_URL = "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb";

/**
 * HumanAvatar - Loads and animates a realistic 3D human model.
 * Uses Ready Player Me GLB model with morph targets for expressions.
 */
function HumanAvatar({ state, isSpeaking }: { state: AvatarState; isSpeaking: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene, nodes, materials } = useGLTF(AVATAR_URL) as any;
  
  // Morph target refs for facial animation
  const headMesh = useRef<THREE.SkinnedMesh | null>(null);
  const teethMesh = useRef<THREE.SkinnedMesh | null>(null);
  
  // Animation state
  const blinkTimer = useRef(0);
  const mouthOpenValue = useRef(0);
  const headRotation = useRef({ x: 0, y: 0 });
  const breathOffset = useRef(0);
  const eyeLookTarget = useRef({ x: 0, y: 0 });

  // Find the head and teeth meshes with morph targets
  useEffect(() => {
    if (scene) {
      scene.traverse((child: any) => {
        if (child.isSkinnedMesh && child.morphTargetDictionary) {
          if (child.name === "Wolf3D_Head" || child.name === "Wolf3D_Avatar") {
            headMesh.current = child;
          }
          if (child.name === "Wolf3D_Teeth") {
            teethMesh.current = child;
          }
        }
      });
    }
  }, [scene]);

  // Main animation loop
  useFrame((_, delta) => {
    if (!group.current) return;

    // ====== BREATHING ======
    breathOffset.current += delta * 1.2;
    const breathAmount = Math.sin(breathOffset.current) * 0.003;
    group.current.position.y = -0.65 + breathAmount;

    // ====== BLINKING ======
    blinkTimer.current += delta;
    let blinkValue = 0;
    
    // Blink every 3-5 seconds
    const blinkInterval = 3.5 + Math.sin(blinkTimer.current * 0.3) * 1.5;
    const blinkPhase = blinkTimer.current % blinkInterval;
    if (blinkPhase < 0.15) {
      blinkValue = Math.sin((blinkPhase / 0.15) * Math.PI);
    }
    
    // Apply blink morph
    if (headMesh.current?.morphTargetDictionary && headMesh.current.morphTargetInfluences) {
      const blinkLeftIdx = headMesh.current.morphTargetDictionary["eyeBlinkLeft"];
      const blinkRightIdx = headMesh.current.morphTargetDictionary["eyeBlinkRight"];
      if (blinkLeftIdx !== undefined) headMesh.current.morphTargetInfluences[blinkLeftIdx] = blinkValue;
      if (blinkRightIdx !== undefined) headMesh.current.morphTargetInfluences[blinkRightIdx] = blinkValue;
    }

    // ====== MOUTH / SPEAKING ======
    if (isSpeaking) {
      // Simulate natural speech with varied mouth shapes
      const time = Date.now() * 0.008;
      mouthOpenValue.current = (
        Math.sin(time * 2.3) * 0.3 +
        Math.sin(time * 3.7) * 0.2 +
        Math.sin(time * 5.1) * 0.15 +
        0.1
      );
      mouthOpenValue.current = Math.max(0, Math.min(0.8, mouthOpenValue.current));
    } else {
      // Slight smile when not speaking
      mouthOpenValue.current += (0 - mouthOpenValue.current) * delta * 5;
    }
    
    // Apply mouth morph
    if (headMesh.current?.morphTargetDictionary && headMesh.current.morphTargetInfluences) {
      const jawOpenIdx = headMesh.current.morphTargetDictionary["jawOpen"];
      const mouthSmileLeftIdx = headMesh.current.morphTargetDictionary["mouthSmileLeft"];
      const mouthSmileRightIdx = headMesh.current.morphTargetDictionary["mouthSmileRight"];
      const viseme_aaIdx = headMesh.current.morphTargetDictionary["viseme_aa"];
      const viseme_OIdx = headMesh.current.morphTargetDictionary["viseme_O"];
      
      if (jawOpenIdx !== undefined) {
        headMesh.current.morphTargetInfluences[jawOpenIdx] = isSpeaking ? mouthOpenValue.current * 0.6 : 0;
      }
      
      if (isSpeaking) {
        // Alternate between visemes for realistic speech
        const time = Date.now() * 0.006;
        if (viseme_aaIdx !== undefined) {
          headMesh.current.morphTargetInfluences[viseme_aaIdx] = Math.max(0, Math.sin(time * 2) * 0.4);
        }
        if (viseme_OIdx !== undefined) {
          headMesh.current.morphTargetInfluences[viseme_OIdx] = Math.max(0, Math.sin(time * 3 + 1) * 0.3);
        }
      } else {
        // Clear visemes
        if (viseme_aaIdx !== undefined) headMesh.current.morphTargetInfluences[viseme_aaIdx] = 0;
        if (viseme_OIdx !== undefined) headMesh.current.morphTargetInfluences[viseme_OIdx] = 0;
        
        // Subtle smile in idle/listening
        const smileAmount = state === "greeting" ? 0.4 : state === "listening" ? 0.2 : 0.1;
        if (mouthSmileLeftIdx !== undefined) headMesh.current.morphTargetInfluences[mouthSmileLeftIdx] = smileAmount;
        if (mouthSmileRightIdx !== undefined) headMesh.current.morphTargetInfluences[mouthSmileRightIdx] = smileAmount;
      }
    }
    
    // Apply teeth morph (jaw open)
    if (teethMesh.current?.morphTargetDictionary && teethMesh.current.morphTargetInfluences) {
      const jawOpenIdx = teethMesh.current.morphTargetDictionary["jawOpen"];
      if (jawOpenIdx !== undefined) {
        teethMesh.current.morphTargetInfluences[jawOpenIdx] = isSpeaking ? mouthOpenValue.current * 0.6 : 0;
      }
    }

    // ====== HEAD MOVEMENT ======
    let targetRotX = 0;
    let targetRotY = 0;

    switch (state) {
      case "idle":
        // Gentle slow movement
        targetRotX = Math.sin(Date.now() * 0.0005) * 0.03;
        targetRotY = Math.sin(Date.now() * 0.0003) * 0.04;
        break;
      case "greeting":
        // Slight nod forward
        targetRotX = Math.sin(Date.now() * 0.003) * 0.06 - 0.03;
        targetRotY = 0;
        break;
      case "listening":
        // Attentive, occasional small nods
        targetRotX = Math.sin(Date.now() * 0.002) * 0.04 - 0.02;
        targetRotY = Math.sin(Date.now() * 0.001) * 0.03;
        break;
      case "thinking":
        // Look slightly up and to the side
        targetRotX = -0.08;
        targetRotY = 0.1 + Math.sin(Date.now() * 0.001) * 0.03;
        break;
      case "speaking":
        // Natural head movement while talking
        targetRotX = Math.sin(Date.now() * 0.0015) * 0.05;
        targetRotY = Math.sin(Date.now() * 0.001) * 0.06;
        break;
      case "goodbye":
        // Slight tilt with smile
        targetRotX = -0.03;
        targetRotY = 0;
        break;
    }

    // Smooth interpolation
    headRotation.current.x += (targetRotX - headRotation.current.x) * delta * 2;
    headRotation.current.y += (targetRotY - headRotation.current.y) * delta * 2;
    
    group.current.rotation.x = headRotation.current.x;
    group.current.rotation.y = headRotation.current.y;

    // ====== EYE MOVEMENT ======
    if (headMesh.current?.morphTargetDictionary && headMesh.current.morphTargetInfluences) {
      const eyeTime = Date.now() * 0.0008;
      
      // Look towards camera / visitor with slight wandering
      const lookX = Math.sin(eyeTime) * 0.15;
      const lookY = Math.sin(eyeTime * 0.7) * 0.1;
      
      const lookLeftIdx = headMesh.current.morphTargetDictionary["eyeLookOutLeft"];
      const lookRightIdx = headMesh.current.morphTargetDictionary["eyeLookOutRight"];
      const lookUpIdx = headMesh.current.morphTargetDictionary["eyeLookUpLeft"];
      const lookDownIdx = headMesh.current.morphTargetDictionary["eyeLookDownLeft"];
      
      if (lookLeftIdx !== undefined) {
        headMesh.current.morphTargetInfluences[lookLeftIdx] = Math.max(0, lookX);
      }
      if (lookRightIdx !== undefined) {
        headMesh.current.morphTargetInfluences[lookRightIdx] = Math.max(0, -lookX);
      }
      if (lookUpIdx !== undefined) {
        headMesh.current.morphTargetInfluences[lookUpIdx] = Math.max(0, lookY);
      }
      if (lookDownIdx !== undefined) {
        headMesh.current.morphTargetInfluences[lookDownIdx] = Math.max(0, -lookY);
      }
    }

    // ====== EYEBROW EXPRESSIONS ======
    if (headMesh.current?.morphTargetDictionary && headMesh.current.morphTargetInfluences) {
      const browUpLeftIdx = headMesh.current.morphTargetDictionary["browOuterUpLeft"];
      const browUpRightIdx = headMesh.current.morphTargetDictionary["browOuterUpRight"];
      const browInnerUpIdx = headMesh.current.morphTargetDictionary["browInnerUp"];
      
      let browAmount = 0;
      if (state === "greeting") browAmount = 0.3;
      else if (state === "thinking") browAmount = 0.4;
      else if (state === "listening") browAmount = 0.15;
      
      if (browUpLeftIdx !== undefined) headMesh.current.morphTargetInfluences[browUpLeftIdx] = browAmount;
      if (browUpRightIdx !== undefined) headMesh.current.morphTargetInfluences[browUpRightIdx] = browAmount;
      if (browInnerUpIdx !== undefined) headMesh.current.morphTargetInfluences[browInnerUpIdx] = state === "thinking" ? 0.3 : 0;
    }
  });

  return (
    <group ref={group} position={[0, -0.65, 0]} scale={1.8}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Loading indicator while 3D model downloads
 */
function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-3 border-avatar-accent/30 border-t-avatar-accent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading Avatar...</p>
      </div>
    </Html>
  );
}

/**
 * Scene lighting for professional corporate look
 */
function SceneLighting() {
  return (
    <>
      {/* Main key light - warm, from front-right */}
      <directionalLight
        position={[3, 4, 5]}
        intensity={1.8}
        color="#fff5e6"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Fill light - cool, from front-left */}
      <directionalLight
        position={[-3, 2, 4]}
        intensity={0.8}
        color="#e6f0ff"
      />
      {/* Rim/back light for separation */}
      <directionalLight
        position={[0, 3, -3]}
        intensity={0.6}
        color="#b4d4ff"
      />
      {/* Ambient for overall illumination */}
      <ambientLight intensity={0.4} color="#ffffff" />
      {/* Subtle point light for face highlight */}
      <pointLight position={[0, 1.5, 3]} intensity={0.5} color="#fff8f0" distance={5} />
    </>
  );
}

/**
 * Avatar3D - Professional 3D human avatar with Three.js.
 * 
 * Features:
 * - Realistic human 3D model (Ready Player Me)
 * - Natural blinking
 * - Eye movement / tracking
 * - Lip synchronization during speech
 * - Head movement based on state
 * - Facial expressions (smile, brow raise, etc.)
 * - Breathing animation
 * - Professional corporate lighting
 */
export function Avatar3D({ state, isSpeaking }: Avatar3DProps) {
  const [loadError, setLoadError] = useState(false);

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px]">
      {/* Glow ring behind avatar */}
      <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
        state === "speaking" 
          ? "shadow-[0_0_60px_rgba(56,189,248,0.4)]" 
          : state === "listening"
          ? "shadow-[0_0_40px_rgba(34,197,94,0.3)]"
          : state === "thinking"
          ? "shadow-[0_0_40px_rgba(251,191,36,0.3)]"
          : "shadow-[0_0_20px_rgba(56,189,248,0.15)]"
      }`} />
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0.2, 2.2], fov: 30 }}
        style={{ borderRadius: "50%", background: "linear-gradient(180deg, #1a2744 0%, #0d1b2a 50%, #162032 100%)" }}
        onError={() => setLoadError(true)}
      >
        <SceneLighting />
        
        <Suspense fallback={<LoadingFallback />}>
          {!loadError && <HumanAvatar state={state} isSpeaking={isSpeaking} />}
        </Suspense>
        
        {/* Subtle contact shadow beneath */}
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.4}
          scale={3}
          blur={2}
          far={1}
        />
      </Canvas>

      {/* State indicator badge */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10">
        <div className={`px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border ${
          state === "idle"
            ? "bg-slate-800/80 text-slate-300 border-slate-600/50"
            : state === "listening"
            ? "bg-green-900/60 text-green-300 border-green-500/40"
            : state === "speaking"
            ? "bg-blue-900/60 text-blue-300 border-blue-500/40"
            : state === "thinking"
            ? "bg-amber-900/60 text-amber-300 border-amber-500/40"
            : state === "greeting"
            ? "bg-cyan-900/60 text-cyan-300 border-cyan-500/40"
            : "bg-slate-800/80 text-slate-300 border-slate-600/50"
        }`}>
          {state === "idle" && "● Ready"}
          {state === "greeting" && "👋 Hello!"}
          {state === "listening" && "🎤 Listening..."}
          {state === "thinking" && "● Processing..."}
          {state === "speaking" && "💬 Speaking"}
          {state === "goodbye" && "👋 Goodbye!"}
          {state === "error" && "⚠ Error"}
        </div>
      </div>
    </div>
  );
}

// Preload the avatar model
useGLTF.preload(AVATAR_URL);
