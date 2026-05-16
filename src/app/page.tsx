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
  
  const isFirstLoad = useRef(true);

  const currentAnimal = ANIMALS[currentIndex];
  const t = TRANSLATIONS[lang];

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const speak = useCallback((animalKey: string) => {
    setIsBusy(true);
    const voiceUrl = `${BASE_PATH}/voices/${lang}/${animalKey.toLowerCase()}.mp3`;
    const audio = new Audio(voiceUrl);
    
    // Fixed 1.2s freeze logic
    const unlock = () => {
      setIsBusy(false);
      setIsPulsing(false);
    };

    // Trigger unlock after 1.2s regardless of audio length (as requested)
    setTimeout(unlock, 1200);

    audio.play().catch(() => {
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

  const navigate = useCallback((newDir: number) => {
    if (isBusy) return;
    playSound("https://www.soundjay.com/misc/sounds/whoosh-01.mp3");
    setDirection(newDir);
    setCurrentIndex((prev) => (prev + newDir + ANIMALS.length) % ANIMALS.length);
  }, [isBusy]);

  useEffect(() => {
    // First slide: 200ms delay. New slides: Immediate.
    const delay = isFirstLoad.current ? 200 : 0;
    const timer = setTimeout(() => {
      speak(currentAnimal.key);
      isFirstLoad.current = false;
    }, delay);
    return () => clearTimeout(timer);
  }, [currentIndex, lang, speak, currentAnimal.key]);

  const handleInteraction = () => {
    if (isBusy) return;
    setIsPulsing(true);
    speak(currentAnimal.key);
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <div className="app-bg" />

      {/* Language Switcher - No dimming */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        {["id", "en"].map((l) => (
          <button 
            key={l}
            onClick={() => !isBusy && setLang(l as Lang)}
            className={`language-btn text-xs md:text-sm uppercase ${lang === l ? "active" : ""}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Navigation - No dimming, just functional lock */}
      <div className={`absolute inset-y-0 left-0 w-24 z-10 flex items-center justify-center ${isBusy ? "pointer-events-none" : "cursor-pointer"}`} onClick={() => navigate(-1)}>
        <div className="text-white/20 text-3xl">&larr;</div>
      </div>
      <div className={`absolute inset-y-0 right-0 w-24 z-10 flex items-center justify-center ${isBusy ? "pointer-events-none" : "cursor-pointer"}`} onClick={() => navigate(1)}>
        <div className="text-white/20 text-3xl">&rarr;</div>
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentAnimal.id}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? 1000 : -1000, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d < 0 ? 1000 : -1000, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          drag={isBusy ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, { offset }) => {
            if (!isBusy) {
              if (offset.x < -50) navigate(1);
              else if (offset.x > 50) navigate(-1);
            }
          }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center select-none"
          onClick={handleInteraction}
        >
          <div className="relative w-[90vw] h-[80vh] flex items-center justify-center">
            <motion.img
              src={currentAnimal.image}
              alt={currentAnimal.key}
              className="max-w-full max-h-full object-contain"
              animate={{ scale: isPulsing ? 1.1 : 1 }}
            />
          </div>
          
          <div className="absolute bottom-[8vh] pointer-events-none">
            <h1 className="text-2xl md:text-4xl font-black text-white/80 uppercase italic">
              {t[currentAnimal.key as keyof typeof t]}
            </h1>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
