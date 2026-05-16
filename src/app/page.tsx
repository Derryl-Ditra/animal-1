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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFirstLoad = useRef(true);

  const currentAnimal = ANIMALS[currentIndex];
  const t = TRANSLATIONS[lang];

  // Optimized sound trigger with automatic cleanup
  const triggerSound = useCallback((animalKey: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsBusy(true);
    const voiceUrl = `${BASE_PATH}/voices/${lang}/${animalKey.toLowerCase()}.mp3`;
    const audio = new Audio(voiceUrl);
    audioRef.current = audio;

    const unlock = () => {
      setIsBusy(false);
      setIsPulsing(false);
    };

    // Rule: Freeze for 1.2s to prevent doom-scrolling
    setTimeout(unlock, 1200);

    audio.play().catch(() => {
      // Fallback: Speech Synthesis
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const text = TRANSLATIONS[lang][animalKey as keyof typeof TRANSLATIONS['id']];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === "id" ? "id-ID" : "en-US";
        utterance.rate = 0.75;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    });
  }, [lang]);

  // Clean navigation logic
  const navigate = useCallback((newDir: number) => {
    if (isBusy) return;
    
    // Instant whoosh sound
    const whoosh = new Audio("https://www.soundjay.com/misc/sounds/whoosh-01.mp3");
    whoosh.volume = 0.2;
    whoosh.play().catch(() => {});

    setDirection(newDir);
    setCurrentIndex((prev) => (prev + newDir + ANIMALS.length) % ANIMALS.length);
  }, [isBusy]);

  // Unified load/sync effect
  useEffect(() => {
    const delay = isFirstLoad.current ? 200 : 0;
    const timer = setTimeout(() => {
      triggerSound(currentAnimal.key);
      isFirstLoad.current = false;
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, lang, triggerSound, currentAnimal.key]);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-sans selection:bg-transparent">
      
      {/* Language Toggle */}
      <div className="absolute top-8 right-8 z-50 flex gap-3">
        {(["id", "en"] as Lang[]).map((l) => (
          <button 
            key={l}
            onClick={() => !isBusy && setLang(l)}
            className={`language-btn text-sm uppercase ${lang === l ? "active" : "text-white/40"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        className={`absolute left-0 inset-y-0 w-32 z-10 flex items-center justify-center text-white/10 text-4xl transition-colors hover:text-white/40 ${isBusy ? "pointer-events-none" : "cursor-pointer"}`}
        onClick={() => navigate(-1)}
      >
        &larr;
      </button>
      <button 
        className={`absolute right-0 inset-y-0 w-32 z-10 flex items-center justify-center text-white/10 text-4xl transition-colors hover:text-white/40 ${isBusy ? "pointer-events-none" : "cursor-pointer"}`}
        onClick={() => navigate(1)}
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
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
          onClick={() => {
            if (!isBusy) {
              setIsPulsing(true);
              triggerSound(currentAnimal.key);
            }
          }}
        >
          <div className="relative w-full h-[70vh] flex items-center justify-center">
            <motion.img
              src={currentAnimal.image}
              alt={currentAnimal.key}
              className="max-w-full max-h-full object-contain pointer-events-none"
              animate={{ scale: isPulsing ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
            />
          </div>
          
          <div className="mt-8 pointer-events-none">
            <h1 className="text-4xl md:text-6xl font-black text-white/90 tracking-tighter uppercase italic">
              {t[currentAnimal.key as keyof typeof t]}
            </h1>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
