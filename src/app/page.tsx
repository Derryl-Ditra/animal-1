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
    
    const whoosh = new Audio("https://www.soundjay.com/misc/sounds/whoosh-01.mp3");
    whoosh.volume = 0.2;
    whoosh.play().catch(() => {});

    setDirection(newDir);
    setCurrentIndex((prev) => (prev + newDir + ANIMALS.length) % ANIMALS.length);
  }, [isBusy]);

  useEffect(() => {
    const delay = isFirstLoad.current ? 200 : 0;
    const timer = setTimeout(() => {
      triggerSound(currentAnimal.key);
      isFirstLoad.current = false;
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, lang, triggerSound, currentAnimal.key]);

  return (
    <main 
      className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-sans selection:bg-transparent touch-none"
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
          <div className="relative w-full h-[85vh] flex items-center justify-center">
            <motion.img
              src={currentAnimal.image}
              alt={currentAnimal.key}
              className="max-w-full max-h-full object-contain pointer-events-none"
              animate={{ scale: isPulsing ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
            />
          </div>
          
          <div className="absolute bottom-6 pointer-events-none">
            <h1 className="text-[12px] md:text-[14px] font-medium text-white/40 tracking-[0.2em] uppercase">
              {t[currentAnimal.key as keyof typeof t]}
            </h1>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
