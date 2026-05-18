# 🦁 Animal Looks Explorer

A minimalist, sensory-driven Progressive Web App (PWA) designed to help toddlers learn animal names through realistic visuals and high-fidelity bilingual audio.

Inspired by Joel Sartore's *Photo Ark* project, the app features gorgeous, high-contrast baby animal portraits on a solid black background, keeping the focus entirely on the subject for a beautiful, distraction-free learning experience.

---

## 👶 Features

- **Photo Ark Aesthetic**: Curated high-fidelity studio photography of baby animals (cubs, calves, foals) set against a **pure, 100% solid black background** with zero distracting elements.
- **Bilingual Narration**: Warm, clear, native voice pronunciations in both **Bahasa Indonesia** and **English**, slowed down to `0.75x` for optimal phonetic development.
- **Toddler-First Interaction**: Pure gesture-based swiping and simple tapping. Zero UI clutter, menus, or accidental triggers.
- **32 Verified Animals**: Expanded to include iconic local and globally famous species, including Indonesian treasures like the **Bekantan (Proboscis Monkey)**, **Orangutan**, **Tapir**, **Komodo Dragon**, and **Anoa**.
- **Self-Contained & Private**: 100% of all audio and visual assets are embedded locally within the project bundle, completely eliminating third-party CDNs or external tracking.

---

## ⚡ Performance & Mobile Optimization

- **Ultra-Lightweight Bundle (Saved 16.4+ MB)**: Compressed all high-definition PNGs into highly optimized **WebP** assets, bringing the entire deck of 32 images down to just **1.8 MB** (averaging ~50 KB per image) for instantaneous load times over any connection.
- **GPU Hardware Acceleration**: Implemented CSS hardware compositing (`transform: translateZ(0)` and `will-change`) for buttery-smooth, lag-free spring animations on high-refresh-rate tablets and phones.
- **Smart Next/Prev Preloading**: Behind-the-scenes caching of adjacent assets ensures zero loading delay or white flashes when swiping.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Static HTML Export)
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS 4 & Custom Vanilla CSS Optimization

---

## 📱 How to Use

Simply launch the app on a mobile device, tablet, or browser. 
- **Swipe left/right** to explore.
- **Tap anywhere** on the animal to hear its name pronounced.
- **Toggle language** instantly in the top-right corner.
