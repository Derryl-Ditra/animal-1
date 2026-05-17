"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TRANSLATIONS, ANIMALS, BASE_PATH } from "./data";

type Lang = "id" | "en";

export default function AnimalExplorer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lang, setLang] = useState<Lang>("id");
  const [isBusy, setIsBusy] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const currentAnimal = ANIMALS[currentIndex];
  const t = TRANSLATIONS[lang];

  // Robust Audio MP3 Narration
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const triggerNarration = useCallback((animalKey: string) => {
    if (typeof window === "undefined") return;

    setIsBusy(true);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const text = TRANSLATIONS[lang][animalKey as keyof typeof TRANSLATIONS['id']];
    const fileName = text.toLowerCase().replace(/ /g, "_") + ".mp3";
    const audioUrl = `${BASE_PATH}/voices/${lang}/${fileName}`;
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setIsBusy(false);
      setIsPulsing(false);
    };

    audio.onerror = () => {
      setIsBusy(false);
      setIsPulsing(false);
    };

    audio.play().catch(() => {
      setIsBusy(false);
      setIsPulsing(false);
    });
  }, [lang]);

  const navigate = useCallback((newDir: number) => {
    if (isBusy || !hasStarted) return;
    
    const whoosh = new Audio("https://www.soundjay.com/misc/sounds/whoosh-01.mp3");
    whoosh.volume = 0.1;
    whoosh.play().catch(() => {});

    setDirection(newDir);
    setCurrentIndex((prev) => (prev + newDir + ANIMALS.length) % ANIMALS.length);
  }, [isBusy, hasStarted]);

  const handleInteraction = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
      return;
    }
    if (!isBusy) {
      setIsPulsing(true);
      triggerNarration(currentAnimal.key);
    }
  }, [hasStarted, isBusy, currentAnimal.key, triggerNarration]);

  // Handle first sound trigger after start
  useEffect(() => {
    if (hasStarted) {
      triggerNarration(currentAnimal.key);
    }
  }, [hasStarted, currentIndex, lang, triggerNarration, currentAnimal.key]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStarted) {
        if (e.key === "Enter" || e.key === " ") setHasStarted(true);
        return;
      }
      if (isBusy) return;
      
      switch (e.key) {
        case "ArrowLeft": navigate(-1); break;
        case "ArrowRight": navigate(1); break;
        case "ArrowUp": setLang("id"); break;
        case "ArrowDown": setLang("en"); break;
        case "Enter": 
        case " ":
          handleInteraction(); 
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasStarted, isBusy, navigate, handleInteraction]);

  // Pre-warm engine is removed since we use mp3s now

  return (
    <main 
      className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-sans selection:bg-transparent touch-none focus:outline-none"
      tabIndex={0}
      onClick={handleInteraction}
    >
      
      {/* Start Overlay (Audio Unlock) */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer"
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center"
            >
              <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white/60 border-b-[15px] border-b-transparent ml-2" />
            </motion.div>
            <p className="mt-6 text-white/40 text-[10px] tracking-[0.3em] uppercase">Tap to Start</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {(["id", "en"] as Lang[]).map((l) => (
          <button 
            key={l}
            onClick={(e) => {
              e.stopPropagation();
              setLang(l);
            }}
            className={`px-3 py-1 rounded-full text-[10px] uppercase border border-white/10 transition-all ${lang === l ? "bg-white/20 border-white/40 font-bold" : "text-white/20"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        className={`absolute left-0 inset-y-0 w-16 z-10 flex items-center justify-center text-white/5 text-xl transition-colors hover:text-white/20 ${isBusy || !hasStarted ? "pointer-events-none" : "cursor-pointer"}`}
        onClick={(e) => { e.stopPropagation(); navigate(-1); }}
      >
        &larr;
      </button>
      <button 
        className={`absolute right-0 inset-y-0 w-16 z-10 flex items-center justify-center text-white/5 text-xl transition-colors hover:text-white/20 ${isBusy || !hasStarted ? "pointer-events-none" : "cursor-pointer"}`}
        onClick={(e) => { e.stopPropagation(); navigate(1); }}
      >
        &rarr;
      </button>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentAnimal.id}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d < 0 ? "100%" : "-100%", opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
          drag={isBusy || !hasStarted ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, { offset }) => {
            if (!isBusy) {
              if (offset.x < -60) navigate(1);
              else if (offset.x > 60) navigate(-1);
            }
          }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center select-none"
        >
          <div className="relative w-full h-[90vh] flex items-center justify-center p-4">
            <motion.img
              src={currentAnimal.image}
              alt={currentAnimal.key}
              className="max-w-full max-h-full object-contain pointer-events-none"
              animate={{ scale: isPulsing ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            />
          </div>
          
          <div className="absolute bottom-4 pointer-events-none">
            <h1 className="text-[10px] font-medium text-white/20 tracking-[0.3em] uppercase">
              {t[currentAnimal.key as keyof typeof t]}
            </h1>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
