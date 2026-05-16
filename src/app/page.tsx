"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Translations ---
const TRANSLATIONS = {
  id: {
    Lion: "Singa",
    Tiger: "Harimau",
    Elephant: "Gajah",
    Giraffe: "Jerapah",
    Zebra: "Zebra",
    Panda: "Panda",
    Penguin: "Penguin",
    Koala: "Koala",
    Kangaroo: "Kanguru",
    Monkey: "Monyet",
    Bunny: "Kelinci",
    Pigeon: "Burung Merpati",
    Goose: "Angsa",
    Duck: "Bebek",
    Cat: "Kucing",
    Dog: "Anjing",
    Squirrel: "Tupai",
    Horse: "Kuda",
    Cow: "Sapi",
    Sheep: "Domba",
    Turtle: "Kura-kura",
    Fish: "Ikan",
    Sparrow: "Burung Gereja",
    Owl: "Burung Hantu",
    Frog: "Katak",
    Butterfly: "Kupu-kupu",
    Bee: "Lebah",
    Fox: "Rubah",
    Deer: "Rusa",
  },
  en: {
    Lion: "Lion",
    Tiger: "Tiger",
    Elephant: "Elephant",
    Giraffe: "Giraffe",
    Zebra: "Zebra",
    Panda: "Panda",
    Penguin: "Penguin",
    Koala: "Koala",
    Kangaroo: "Kangaroo",
    Monkey: "Monkey",
    Bunny: "Bunny",
    Pigeon: "Pigeon",
    Goose: "Goose",
    Duck: "Duck",
    Cat: "Cat",
    Dog: "Dog",
    Squirrel: "Squirrel",
    Horse: "Horse",
    Cow: "Cow",
    Sheep: "Sheep",
    Turtle: "Turtle",
    Fish: "Fish",
    Sparrow: "Sparrow",
    Owl: "Owl",
    Frog: "Frog",
    Butterfly: "Butterfly",
    Bee: "Bee",
    Fox: "Fox",
    Deer: "Deer",
  },
};

// --- Data Structure ---
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/animal-1' : '';

const ANIMALS = [
  { id: "lion", key: "Lion", image: `${BASE_PATH}/animals/lion.png` },
  { id: "tiger", key: "Tiger", image: `${BASE_PATH}/animals/tiger.png` },
  { id: "elephant", key: "Elephant", image: `${BASE_PATH}/animals/elephant.png` },
  { id: "giraffe", key: "Giraffe", image: `${BASE_PATH}/animals/giraffe.png` },
  { id: "zebra", key: "Zebra", image: `${BASE_PATH}/animals/zebra.png` },
  { id: "panda", key: "Panda", image: `${BASE_PATH}/animals/panda.png` },
  { id: "bunny", key: "Bunny", image: `${BASE_PATH}/animals/bunny.png` },
  { id: "pigeon", key: "Pigeon", image: `${BASE_PATH}/animals/pigeon.png` },
  { id: "goose", key: "Goose", image: `${BASE_PATH}/animals/goose.png` },
  { id: "duck", key: "Duck", image: `${BASE_PATH}/animals/duck.png` },
  { id: "cat", key: "Cat", image: `${BASE_PATH}/animals/cat.png` },
  { id: "dog", key: "Dog", image: `${BASE_PATH}/animals/dog.png` },
  { id: "squirrel", key: "Squirrel", image: `${BASE_PATH}/animals/squirrel.png` },
  { id: "horse", key: "Horse", image: `${BASE_PATH}/animals/horse.png` },
  { id: "cow", key: "Cow", image: `${BASE_PATH}/animals/cow.png` },
  { id: "sheep", key: "Sheep", image: `${BASE_PATH}/animals/sheep.png` },
  { id: "turtle", key: "Turtle", image: `${BASE_PATH}/animals/turtle.png` },
  { id: "fish", key: "Fish", image: `${BASE_PATH}/animals/fish.png` },
  { id: "sparrow", key: "Sparrow", image: `${BASE_PATH}/animals/sparrow.png` },
  { id: "owl", key: "Owl", image: `${BASE_PATH}/animals/owl.png` },
  { id: "frog", key: "Frog", image: `${BASE_PATH}/animals/frog.png` },
  { id: "butterfly", key: "Butterfly", image: `${BASE_PATH}/animals/butterfly.png` },
  { id: "bee", key: "Bee", image: `${BASE_PATH}/animals/bee.png` },
  { id: "fox", key: "Fox", image: `${BASE_PATH}/animals/fox.png` },
  { id: "deer", key: "Deer", image: `${BASE_PATH}/animals/deer.png` },
];

type Lang = "id" | "en";

export default function AnimalExplorer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lang, setLang] = useState<Lang>("id");
  const [isPulsing, setIsPulsing] = useState(false);

  const currentAnimal = ANIMALS[currentIndex];
  const t = TRANSLATIONS[lang];

  // Sound effects
  const playSound = useCallback((url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Ignore autoplay blocks
  }, []);

  const navigate = useCallback((newDirection: number) => {
    playSound("https://www.soundjay.com/misc/sounds/whoosh-01.mp3");
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % ANIMALS.length;
      } else {
        return (prev - 1 + ANIMALS.length) % ANIMALS.length;
      }
    });
  }, [playSound]);

  // Speech function with "Warm Female Voice" optimization
  const speak = useCallback((animalKey: string) => {
    const voiceUrl = `${BASE_PATH}/voices/${lang}/${animalKey.toLowerCase()}.mp3`;
    const audio = new Audio(voiceUrl);
    audio.volume = 1.0;
    
    audio.play().catch(() => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const text = TRANSLATIONS[lang][animalKey as keyof typeof TRANSLATIONS['id']];
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find a warm/female voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
          (v.name.includes("Female") || v.name.includes("Soft") || v.name.includes("Google")) && 
          v.lang.startsWith(lang)
        ) || voices.find(v => v.lang.startsWith(lang));

        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 0.75;
        utterance.pitch = 1.1; // Slightly higher for "warmth"
        
        window.speechSynthesis.cancel(); // Clear queue
        window.speechSynthesis.speak(utterance);
      }
    });
  }, [lang]);

  useEffect(() => {
    // Pre-warm synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    
    speak(currentAnimal.key);
    
    // Preload next image and next voice
    const nextIndex = (currentIndex + 1) % ANIMALS.length;
    const nextKey = ANIMALS[nextIndex].key;
    
    // Image preload
    const img = new Image();
    img.src = ANIMALS[nextIndex].image;
    
    // Voice preload
    const audio = new Audio(`${BASE_PATH}/voices/${lang}/${nextKey.toLowerCase()}.mp3`);
    audio.load();
  }, [currentIndex, lang, currentAnimal.key, speak]);

  const handleInteraction = () => {
    playSound("https://www.soundjay.com/button/sounds/button-30.mp3");
    speak(currentAnimal.key);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 500);
  };


  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
    }),
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <div className="app-bg" />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-50 flex gap-2 md:gap-3">
        <button 
          onClick={() => setLang("id")}
          className={`language-btn text-xs md:text-sm ${lang === "id" ? "active" : ""}`}
        >
          ID
        </button>
        <button 
          onClick={() => setLang("en")}
          className={`language-btn text-xs md:text-sm ${lang === "en" ? "active" : ""}`}
        >
          EN
        </button>
      </div>

      {/* Navigation Areas */}
      <div 
        className="absolute left-0 top-0 w-[60px] md:w-[120px] h-full z-10 cursor-pointer flex items-center justify-start pl-4 md:pl-8 group" 
        onClick={() => navigate(-1)}
      >
        <div className="text-white/20 group-hover:text-white/70 transition-colors text-2xl md:text-4xl">&larr;</div>
      </div>
      <div 
        className="absolute right-0 top-0 w-[60px] md:w-[120px] h-full z-10 cursor-pointer flex items-center justify-end pr-4 md:pr-8 group" 
        onClick={() => navigate(1)}
      >
        <div className="text-white/20 group-hover:text-white/70 transition-colors text-2xl md:text-4xl">&rarr;</div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentAnimal.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, { offset, velocity }) => {
            if (offset.x < -50) navigate(1);
            else if (offset.x > 50) navigate(-1);
          }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center select-none"
          style={{ padding: "5vh 5vw", willChange: "transform, opacity" }}
          onClick={handleInteraction}
        >
          {/* Image Container - Maximized for 85-95% screen coverage */}
          <div className="relative w-[90vw] h-[80vh] flex items-center justify-center">
            <motion.img
              src={currentAnimal.image}
              alt={currentAnimal.key}
              className="max-w-full max-h-full object-contain will-change-transform"
              initial={{ rotate: -5 }}
              animate={{ 
                rotate: 0,
                scale: isPulsing ? 1.05 : 1,
              }}
              transition={{ 
                scale: { type: "spring", stiffness: 400, damping: 10 },
                rotate: { duration: 0.5 }
              }}
            />
          </div>
          
          {/* Text Area - Absolute overlay to keep image space clear */}
          <div className="absolute bottom-[8vh] flex flex-col items-center justify-start max-w-full pointer-events-none">
            <motion.h1 
              className="text-lg sm:text-2xl md:text-3xl font-black text-white/80 tracking-tighter uppercase italic leading-none break-words px-4"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t[currentAnimal.key as keyof typeof t]}
            </motion.h1>
          </div>
        </motion.div>
      </AnimatePresence>

    </main>
  );
}
