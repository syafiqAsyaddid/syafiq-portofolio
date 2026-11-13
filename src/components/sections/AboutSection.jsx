import React, { useState } from 'react';
import BrutalistCard from '../ui/BrutalistCard';
import MarqueeBanner from '../ui/MarqueeBanner';
import { IconCopy, IconCheck, IconArrowUpRight } from '../ui/RetroIcons';

export default function AboutSection({
  profile,
  experience,
  education,
  skills,
  scrollVelocityRef,
  onNavigate,
}) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [contactMinimized, setContactMinimized] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.contact.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      window.location.href = `mailto:${profile.contact.email}`;
    }
  };

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative bg-blueprint-grid border-b-[4px] border-[#111111] pb-20"
    >
      {/* Tilted Red Marquee Header matching Ref 1 */}
      <MarqueeBanner
        items={['ABOUT ME', 'DEVELOPER ID CARD', 'ABOUT ME', 'WEB ENGINEER']}
        bg="bg-[#FF4D38]"
        textColor="text-[#FFFDF7]"
        tilt="-rotate-1"
        scrollVelocityRef={scrollVelocityRef}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-14 sm:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN (4 cols): Sunburst Photo ID Card + CONTACT OS Box */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Profile Photo Frame with Pink/Cream Sunburst */}
            <BrutalistCard
              bg="bg-[#F2E5C6]"
              className="overflow-hidden p-0 relative"
              enableTilt={true}
            >
              {/* Sunburst SVG Backdrop + Developer Portrait */}
              <div className="relative w-full aspect-[4/4.6] bg-[#FF85B3] overflow-hidden border-b-[3px] border-[#111111] flex items-end justify-center">
                <svg
                  viewBox="0 0 400 400"
                  className="absolute inset-0 w-full h-full object-cover"
                  aria-hidden="true"
                >
                  <rect width="400" height="400" fill="#F2E5C6" />
                  <g fill="#FF85B3">
                    <polygon points="200,230 0,0 70,0" />
                    <polygon points="200,230 130,0 210,0" />
                    <polygon points="200,230 270,0 350,0" />
                    <polygon points="200,230 400,20 400,100" />
                    <polygon points="200,230 400,160 400,240" />
                    <polygon points="200,230 400,300 400,400" />
                    <polygon points="200,230 280,400 180,400" />
                    <polygon points="200,230 100,400 0,380" />
                    <polygon points="200,230 0,290 0,200" />
                    <polygon points="200,230 0,130 0,50" />
                  </g>
                </svg>

                {/* Real User Cutout Portrait */}
                <img
                  src={profile.photo.src}
                  alt={profile.photo.alt}
                  width={profile.photo.width}
                  height={profile.photo.height}
                  fetchPriority="high"
                  className="relative z-10 w-[86%] h-[92%] object-contain object-bottom drop-shadow-[4px_4px_0px_#111111]"
                />
              </div>

              {/* Bold Tilted Name Banner at Bottom of Frame (matching NATHAN in Ref 1) */}
              <div className="bg-[#F2E5C6] px-4 py-3 text-center">
                <div className="inline-block px-3 py-1 bg-[#111111] text-[#F2E5C6] font-bungee text-2xl sm:text-3xl tracking-wider uppercase -rotate-1 shadow-[3px_3px_0px_#FF4D38]">
                  {profile.displayName}
                </div>
                <p className="mt-1.5 font-mono-code text-[11px] font-bold text-[#111111]">
                  {profile.badgeLabel}
                </p>
              </div>
            </BrutalistCard>

            {/* CONTACT Window Card (Directly below photo, matching Ref 1) */}
            <div className="bg-[#D6D3CE] border-[3px] border-[#111111] rounded-xl shadow-[6px_6px_0px_#111111] overflow-hidden">
              {/* Classic OS Window Title Bar */}
              <div className="bg-[#FFFDF7] border-b-[3px] border-[#111111] px-3 py-2 flex items-center justify-between">
                <span className="font-mono-code text-xs font-bold px-1.5 py-0.5 border border-[#111111] bg-[#D6D3CE]">
                  ID
                </span>
                <span className="font-bungee text-sm tracking-widest text-[#111111]">
                  CONTACT
                </span>
                <button
                  type="button"
                  onClick={() => setContactMinimized((prev) => !prev)}
                  aria-expanded={!contactMinimized}
                  aria-label={contactMinimized ? 'Expand contact card' : 'Minimize contact card'}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center bg-[#FFD026] border-2 border-[#111111] font-mono-code text-xs font-bold hover:bg-[#FF4D38] hover:text-[#FFFDF7]"
                >
                  {contactMinimized ? '+' : '-'}
                </button>
              </div>

              {!contactMinimized && (
                <div className="p-3.5 space-y-2.5 text-xs font-mono-code">
                  {/* 1-Click Copy Email Row */}
                  <div className="flex items-center justify-between gap-2 p-2 bg-[#FFFDF7] border-2 border-[#111111] rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 bg-[#FFD026] border border-[#111111] font-bold">
                        @
                      </span>
                      <span className="truncate font-bold text-[#111111]">
                        {profile.contact.email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      aria-label="Copy email address to clipboard"
                      className="px-2.5 py-1.5 min-h-[36px] bg-[#FFD026] border-2 border-[#111111] rounded font-bold text-[11px] flex items-center gap-1 shrink-0 hover:bg-[#1FD655]"
                    >
                      {copiedEmail ? (
                        <>
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>COPIED</span>
                        </>
                      ) : (
                        <>
                          <IconCopy className="w-3.5 h-3.5" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Social Links matching Ref 1 */}
                  <div className="grid grid-cols-1 gap-2">
                    <a
                      href={profile.contact.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 min-h-[44px] bg-[#F2E5C6] border-2 border-[#111111] rounded-lg font-bold text-[#111111] hover:bg-[#FFD026]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-[#FF85B3] border border-[#111111]">
                          IG
                        </span>
                        <span>Instagram Profile</span>
                      </span>
                      <IconArrowUpRight className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={profile.contact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 min-h-[44px] bg-[#F2E5C6] border-2 border-[#111111] rounded-lg font-bold text-[#111111] hover:bg-[#FFD026]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-[#19B5FE] border border-[#111111]">
                          IN
                        </span>
                        <span>LinkedIn Network</span>
                      </span>
                      <IconArrowUpRight className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={profile.contact.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2 min-h-[44px] bg-[#F2E5C6] border-2 border-[#111111] rounded-lg font-bold text-[#111111] hover:bg-[#FFD026]"
                    >
                      <span className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-[#1FD655] border border-[#111111]">
                          GH
                        </span>
                        <span>GitHub Repositories</span>
                      </span>
                      <IconArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (8 cols): Yellow Script "Hello!", Bio, 3 Stats, & 3 Ref-1 Overview Columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Script Yellow Heading */}
            <div>
              <h2
                id="about-heading"
                className="font-script text-6xl sm:text-7xl font-bold text-[#FFD026] drop-shadow-[4px_4px_0px_#111111] leading-none inline-block -rotate-2"
              >
                {profile.greeting}
              </h2>
            </div>

            {/* Bio Card */}
            <BrutalistCard bg="bg-[#F2E5C6]" className="p-5 sm:p-7 space-y-3">
              {profile.bioParagraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-sm sm:text-base leading-relaxed text-[#111111] font-medium"
                >
                  {paragraph}
                </p>
              ))}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono-code">
                <span className="px-2.5 py-1 bg-[#FFD026] border-2 border-[#111111] font-bold">
                  LOCATION: {profile.location}
                </span>
                <span className="px-2.5 py-1 bg-[#FFFDF7] border-2 border-[#111111] font-bold">
                  EDIT PROFILE DATA IN: src/data/portfolioData.js
                </span>
              </div>
            </BrutalistCard>

            {/* 3 Honest Metric Cards (R-17 / R-38 compliant) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {profile.stats.map((stat) => (
                <BrutalistCard
                  key={stat.id}
                  bg="bg-[#FFFDF7]"
                  className="p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      style={{ backgroundColor: stat.accent }}
                      className="px-2 py-0.5 border-2 border-[#111111] font-pixel text-[10px] font-bold uppercase"
                    >
                      METRIC SLOT
                    </span>
                  </div>
                  <div className="font-heading text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-1 font-heading text-xs font-bold text-[#111111]">
                    {stat.label}
                  </div>
                  <p className="mt-1 font-mono-code text-[10px] text-[#111111]/75">
                    {stat.note}
                  </p>
                </BrutalistCard>
              ))}
            </div>

            {/* 3 Quick-Overview Columns matching Reference 1 (Experience, Education, Software Skills) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Column 1: Experience Preview */}
              <div className="space-y-3">
                <div className="px-4 py-1.5 bg-[#1FD655] border-[3px] border-[#111111] rounded-full shadow-[4px_4px_0px_#111111] text-center">
                  <span className="font-script text-2xl font-bold text-[#111111]">
                    Experience
                  </span>
                </div>
                {experience.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#F2E5C6] border-[3px] border-[#111111] rounded-xl overflow-hidden shadow-[4px_4px_0px_#111111]"
                  >
                    <div className="bg-[#FFD026] border-b-[2px] border-[#111111] px-3 py-1 font-mono-code text-xs font-bold">
                      {item.period}
                    </div>
                    <div className="p-3">
                      <h3 className="font-heading text-xs font-extrabold text-[#111111]">
                        {item.role}
                      </h3>
                      <p className="font-mono-code text-[11px] text-[#111111]/80 mt-0.5">
                        {item.organization}
                      </p>
                    </div>
                  </div>
                ))}
                <a
                  href="#experience"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('experience');
                  }}
                  className="inline-flex items-center justify-center w-full min-h-[44px] px-3 py-2 bg-[#FFD026] border-2 border-[#111111] rounded-lg font-pixel text-[10px] font-bold uppercase shadow-[3px_3px_0px_#111111] hover:bg-[#FFFDF7]"
                >
                  Full Career Timeline
                </a>
              </div>

              {/* Column 2: Education & Personal Craft Pills */}
              <div className="space-y-3">
                <div className="px-4 py-1.5 bg-[#1FD655] border-[3px] border-[#111111] rounded-full shadow-[4px_4px_0px_#111111] text-center">
                  <span className="font-script text-2xl font-bold text-[#111111]">
                    Education
                  </span>
                </div>
                {education.slice(0, 1).map((edu) => (
                  <div
                    key={edu.id}
                    className="bg-[#F2E5C6] border-[3px] border-[#111111] rounded-xl overflow-hidden shadow-[4px_4px_0px_#111111]"
                  >
                    <div className="bg-[#FFD026] border-b-[2px] border-[#111111] px-3 py-1 font-mono-code text-xs font-bold">
                      {edu.period}
                    </div>
                    <div className="p-3">
                      <h3 className="font-heading text-xs font-extrabold text-[#111111]">
                        {edu.degree}
                      </h3>
                      <p className="font-mono-code text-[11px] text-[#111111]/80 mt-0.5">
                        {edu.institution}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="px-4 py-1 bg-[#1FD655] border-[3px] border-[#111111] rounded-full shadow-[4px_4px_0px_#111111] text-center mt-4">
                  <span className="font-script text-xl font-bold text-[#111111]">
                    Core Web Values
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {skills.stickers.slice(0, 4).map((st) => (
                    <div
                      key={st.id}
                      className="px-3 py-1.5 bg-[#F2E5C6] border-2 border-[#111111] rounded-full text-center font-heading text-xs font-bold shadow-[2px_2px_0px_#111111]"
                    >
                      {st.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Software & Stack Snapshot */}
              <div className="space-y-3">
                <div className="px-4 py-1.5 bg-[#1FD655] border-[3px] border-[#111111] rounded-full shadow-[4px_4px_0px_#111111] text-center">
                  <span className="font-script text-2xl font-bold text-[#111111]">
                    Software Skills
                  </span>
                </div>
                <div className="space-y-2">
                  {skills.stack.slice(0, 4).map((item) => (
                    <div
                      key={item.name}
                      className="bg-[#F2E5C6] border-[2.5px] border-[#111111] rounded-lg p-2 shadow-[3px_3px_0px_#111111] flex items-center gap-2.5"
                    >
                      <span
                        style={{ backgroundColor: item.color }}
                        className="w-8 h-8 rounded border-2 border-[#111111] font-pixel text-xs font-bold flex items-center justify-center shrink-0"
                      >
                        {item.code}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-heading text-xs font-extrabold truncate">
                          {item.name}
                        </div>
                        <div className="mt-1 w-full h-2 bg-[#FFFDF7] border border-[#111111] rounded-xs overflow-hidden">
                          <div
                            style={{ width: item.barWidth, backgroundColor: '#FFD026' }}
                            className="h-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="#skills"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('skills');
                  }}
                  className="inline-flex items-center justify-center w-full min-h-[44px] px-3 py-2 bg-[#19B5FE] border-2 border-[#111111] rounded-lg font-pixel text-[10px] font-bold uppercase shadow-[3px_3px_0px_#111111] hover:bg-[#FFD026]"
                >
                  Open Full Control Panel
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
