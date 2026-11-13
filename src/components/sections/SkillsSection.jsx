import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BrutalistCard from '../ui/BrutalistCard';
import { IconControlSliders, IconReboot } from '../ui/RetroIcons';

export default function SkillsSection({ skills }) {
  const arenaRef = useRef(null);
  const [stickerOffsets, setStickerOffsets] = useState(() =>
    skills.stickers.reduce((acc, item) => {
      acc[item.id] = { x: 0, y: 0 };
      return acc;
    }, {})
  );
  const [resetKey, setResetKey] = useState(0);

  // Cursor Repulsion when mouse moves rapidly across the sticker arena
  const handleStickerMouseEnter = (id, e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = centerX - e.clientX;
    const dy = centerY - e.clientY;
    const pushX = Math.max(-42, Math.min(42, dx * 0.85 + (Math.random() - 0.5) * 20));
    const pushY = Math.max(-32, Math.min(32, dy * 0.85 + (Math.random() - 0.5) * 20));

    setStickerOffsets((prev) => ({
      ...prev,
      [id]: {
        x: Math.max(-65, Math.min(65, (prev[id]?.x || 0) + pushX)),
        y: Math.max(-55, Math.min(55, (prev[id]?.y || 0) + pushY)),
      },
    }));
  };

  const handleResetStickers = () => {
    setStickerOffsets(
      skills.stickers.reduce((acc, item) => {
        acc[item.id] = { x: 0, y: 0 };
        return acc;
      }, {})
    );
    setResetKey((prev) => prev + 1);
  };

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative bg-blueprint-grid border-b-[4px] border-[#111111] py-16 sm:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#FFD026] border-[3px] border-[#111111] rounded-full shadow-[6px_6px_0px_#111111] self-start">
            <IconControlSliders className="w-5 h-5" />
            <h2
              id="skills-heading"
              className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight"
            >
              Skills & Tech Stack (Control Panel)
            </h2>
          </div>
          <p className="font-mono-code text-xs font-bold text-[#111111] bg-[#F2E5C6] px-3 py-1.5 rounded border-2 border-[#111111] self-start sm:self-auto">
            CONTROL_PANEL.CPL // DRAG OR NUDGE CRAFT STICKERS
          </p>
        </div>

        {/* 3-Column Control Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* PANEL LEFT (5 cols): Front-End & Back-End Stack */}
          <BrutalistCard
            bg="bg-[#F2E5C6]"
            className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="px-4 py-1.5 bg-[#1FD655] border-[2.5px] border-[#111111] rounded-full shadow-[3px_3px_0px_#111111] inline-block mb-5">
                <h3 className="font-script text-2xl font-bold text-[#111111]">
                  Front-End & Back-End Stack
                </h3>
              </div>

              <div className="space-y-3.5">
                {skills.stack.map((tech) => (
                  <div
                    key={tech.name}
                    className="bg-[#FFFDF7] border-[2.5px] border-[#111111] rounded-xl p-3 shadow-[4px_4px_0px_#111111]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{ backgroundColor: tech.color }}
                        className="w-10 h-10 rounded-lg border-2 border-[#111111] font-pixel text-xs font-bold flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#111111]"
                      >
                        {tech.code}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-heading text-sm font-extrabold text-[#111111] truncate">
                            {tech.name}
                          </span>
                          <span className="px-2 py-0.5 bg-[#FFD026] border border-[#111111] rounded-full font-mono-code text-[10px] font-bold shrink-0">
                            {tech.level}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono-code text-[#111111]/75 mt-0.5">
                          {tech.category}
                        </div>
                        <div className="mt-2 w-full h-2.5 bg-[#D6D3CE] border border-[#111111] rounded-xs overflow-hidden">
                          <div
                            style={{ width: tech.barWidth }}
                            className="h-full bg-[#FFD026] border-r border-[#111111]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BrutalistCard>

          {/* PANEL CENTER (3 cols): Design & Dev Tools */}
          <BrutalistCard
            bg="bg-[#F2E5C6]"
            className="lg:col-span-3 p-5 sm:p-6 flex flex-col justify-between"
          >
            <div>
              <div className="px-4 py-1.5 bg-[#1FD655] border-[2.5px] border-[#111111] rounded-full shadow-[3px_3px_0px_#111111] inline-block mb-5">
                <h3 className="font-script text-2xl font-bold text-[#111111]">
                  Design & Dev Tools
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {skills.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="bg-[#FFFDF7] border-[2.5px] border-[#111111] rounded-xl p-3 shadow-[3px_3px_0px_#111111] flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-heading text-sm font-extrabold text-[#111111]">
                        {tool.name}
                      </div>
                      <div className="font-mono-code text-[11px] text-[#111111]/75">
                        {tool.role}
                      </div>
                    </div>
                    <span
                      style={{ backgroundColor: tool.bg }}
                      className="px-2.5 py-1 border-2 border-[#111111] rounded-md font-pixel text-[10px] font-bold uppercase shrink-0"
                    >
                      {tool.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </BrutalistCard>

          {/* PANEL RIGHT (4 cols): 2D Physics Draggable & Repulsive Sticker Box */}
          <div className="lg:col-span-4 bg-[#1B2028] border-[3px] border-[#111111] rounded-xl shadow-[6px_6px_0px_#111111] p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="px-4 py-1 bg-[#1FD655] border-2 border-[#111111] rounded-full shadow-[3px_3px_0px_#111111]">
                <h3 className="font-script text-xl font-bold text-[#111111]">
                  Personal & Web Craft
                </h3>
              </div>

              <button
                type="button"
                onClick={handleResetStickers}
                aria-label="Reset draggable skill stickers to default positions"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[40px] bg-[#FFD026] text-[#111111] border-2 border-[#111111] rounded font-pixel text-[10px] font-bold uppercase hover:bg-[#FFFDF7]"
              >
                <IconReboot className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>
            </div>

            <p className="font-mono-code text-xs text-[#F2E5C6] mb-3">
              Interactive Sticker Arena: hover rapidly to repel pills or drag & throw them inside the box.
            </p>

            {/* Bounded Physics Box */}
            <div
              key={resetKey}
              ref={arenaRef}
              className="relative flex-1 min-h-[320px] bg-[#1246B5] border-[3px] border-[#111111] rounded-xl p-4 flex flex-wrap content-center justify-center gap-3 overflow-hidden"
            >
              <div className="crt-scanlines pointer-events-none absolute inset-0" />

              {skills.stickers.map((sticker) => {
                const offset = stickerOffsets[sticker.id] || { x: 0, y: 0 };
                return (
                  <motion.button
                    key={sticker.id}
                    type="button"
                    drag
                    dragConstraints={arenaRef}
                    dragElastic={0.35}
                    dragTransition={{ bounceStiffness: 380, bounceDamping: 18 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95, cursor: 'grabbing' }}
                    animate={{
                      x: offset.x,
                      y: offset.y,
                      rotate: sticker.rotate,
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    onMouseEnter={(e) => handleStickerMouseEnter(sticker.id, e)}
                    onClick={() =>
                      setStickerOffsets((prev) => ({
                        ...prev,
                        [sticker.id]: {
                          x: ((prev[sticker.id]?.x || 0) + 25) % 50,
                          y: ((prev[sticker.id]?.y || 0) - 20) % 40,
                        },
                      }))
                    }
                    style={{ backgroundColor: sticker.bg }}
                    className="relative z-10 px-4 py-2 min-h-[44px] border-[2.5px] border-[#111111] rounded-full shadow-[4px_4px_0px_#111111] font-heading text-xs sm:text-sm font-extrabold text-[#111111] select-none"
                  >
                    {sticker.text}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
