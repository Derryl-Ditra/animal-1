"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TRANSLATIONS, ANIMALS } from "./data";

type Lang = "id" | "en";

export default function AnimalExplorer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lang, setLang] = useState<Lang>("id");
  const [isBusy, setIsBusy] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  
  const isFirstLoad = useRef(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAnimal = ANIMALS[currentIndex];
  const t = TRANSLATIONS[lang];

  const triggerSound = useCallback((animalKey: string) => {
    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsBusy(true);
    
    const unlock = () => {
      setIsBusy(false);
      setIsPulsing(false);
    };

    // 1.2s interaction freeze
    setTimeout(unlock, 1200);

    // 1. Try static narrator files (Consistent across devices)
    const voiceUrl = `${BASE_PATH}/voices/${lang}/${animalKey.toLowerCase()}.mp3`;
    const audio = new Audio(voiceUrl);
    audioRef.current = audio;
    audio.playbackRate = 0.75; // Slower for toddlers

    audio.play().catch(() => {
      // 2. Fallback to System Speech Synthesis
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const text = t[animalKey as keyof typeof t];
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith(lang) && (v.name.includes("Female") || v.name.includes("Google"))) || voices.find(v => v.lang.startsWith(lang));
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 0.75;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    });
  }, [lang, t]);

  const navigate = useCallback((newDir: number) => {
    if (isBusy) return;
    
    const whoosh = new Audio("https://www.soundjay.com/misc/sounds/whoosh-01.mp3");
    whoosh.volume = 0.2;
    whoosh.play().catch(() => {});

    setDirection(newDir);
    setCurrentIndex((prev) => (prev + newDir + ANIMALS.length) % ANIMALS.length);
  }, [isBusy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBusy) return;
      
      switch (e.key) {
        case "ArrowLeft": navigate(-1); break;
        case "ArrowRight": navigate(1); break;
        case "ArrowUp": setLang("id"); break;
        case "ArrowDown": setLang("en"); break;
        case "Enter": 
        case " ": // Spacebar support as well
          handleInteraction(); 
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBusy, navigate, handleInteraction]);

  // Unified load/sync effect
  useEffect(() => {
    // Pre-warm speech synthesis engine
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    
    const delay = isFirstLoad.current ? 200 : 0;
    const timer = setTimeout(() => {
      triggerSound(currentAnimal.key);
      isFirstLoad.current = false;
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, lang, triggerSound, currentAnimal.key]);

  return (
    <main 
      className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-sans selection:bg-transparent touch-none focus:outline-none"
      tabIndex={0} // Ensure the main container can receive focus for keyboard events
      onClick={() => {
        if (isFirstLoad.current) {
          triggerSound(currentAnimal.key);
          isFirstLoad.current = false;
        }
      }}
    >
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {(["id", "en"] as Lang[]).map((l) => (
          <button 
            key={l}
            onClick={(e) => {
              e.stopPropagation();
              if (!isBusy) setLang(l);
            }}
            className={`px-3 py-1 rounded-full text-[10px] uppercase border border-white/10 transition-all ${lang === l ? "bg-white/20 border-white/40 font-bold" : "text-white/20"}`}
          >
            {l}
          </button>
        ))}
      </div>

      <button 
        className={`absolute left-0 inset-y-0 w-16 z-10 flex items-center justify-center text-white/5 text-xl transition-colors hover:text-white/20 ${isBusy ? "pointer-events-none" : "cursor-pointer"}`}
        onClick={(e) => { e.stopPropagation(); navigate(-1); }}
      >
        &larr;
      </button>
      <button 
        className={`absolute right-0 inset-y-0 w-16 z-10 flex items-center justify-center text-white/5 text-xl transition-colors hover:text-white/20 ${isBusy ? "pointer-events-none" : "cursor-pointer"}`}
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
          drag={isBusy ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, { offset }) => {
            if (!isBusy) {
              if (offset.x < -60) navigate(1);
              else if (offset.x > 60) navigate(-1);
            }
          }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center select-none"
          onClick={() => {
            if (!isBusy) {
              setIsPulsing(true);
              triggerSound(currentAnimal.key);
            }
          }}
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
