import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IconVhsTape, IconDocument, IconWindowFlag, IconMonitor } from '../ui/RetroIcons';

gsap.registerPlugin(ScrollTrigger);

export default function HeroDeskSection({
  profile,
  isBooted,
  onBootComplete,
  onNavigate,
}) {
  const sectionRef = useRef(null);
  const rigRef = useRef(null);
  const crtScreenRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const layer3Ref = useRef(null);
  const layer4Ref = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const focusMetricsRef = useRef({ scale: 2.35, x: 0, y: 0 });

  const [progress, setProgress] = useState(0);
  const [stickyActive, setStickyActive] = useState(false);
  const [pupilAngles, setPupilAngles] = useState({ leftX: 0, leftY: 0, rightX: 0, rightY: 0 });
  const [cvNotice, setCvNotice] = useState(false);

  // Measure the exact center & dimensions of the Blue CRT Screen relative to the viewport
  // so Phase 1 (Boot) and Phase 3 (Scroll Dive-In) lock 100% onto the CRT screen center,
  // while Phase 2 (Zoom-Out) rests with the monitor slightly to the left of center.
  const computeCrtFocus = () => {
    const rigEl = rigRef.current;
    const screenEl = crtScreenRef.current;
    if (!rigEl || !screenEl) return { scale: 2.35, x: 0, y: 0 };

    gsap.set(rigEl, { scale: 1, x: 0, y: 0 });
    const rigRect = rigEl.getBoundingClientRect();
    const screenRect = screenEl.getBoundingClientRect();

    const screenCenterX = screenRect.left - rigRect.left + screenRect.width / 2;
    const screenCenterY = screenRect.top - rigRect.top + screenRect.height / 2;
    const viewCenterX = rigRect.width / 2;
    const viewCenterY = rigRect.height / 2;

    const scaleX = (rigRect.width * 0.88) / Math.max(1, screenRect.width);
    const scaleY = (rigRect.height * 0.82) / Math.max(1, screenRect.height);
    const targetScale = Math.max(1.85, Math.min(2.75, Math.min(scaleX, scaleY)));

    const focusX = viewCenterX - screenCenterX;
    const focusY = viewCenterY - screenCenterY;

    rigEl.style.transformOrigin = `${screenCenterX}px ${screenCenterY}px`;
    const metrics = { scale: targetScale, x: focusX, y: focusY };
    focusMetricsRef.current = metrics;
    return metrics;
  };

  // Lock camera onto the CRT screen before first browser paint
  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const metrics = computeCrtFocus();
    if (!isBooted && rigRef.current) {
      gsap.set(rigRef.current, {
        scale: metrics.scale,
        x: metrics.x,
        y: metrics.y,
      });
    }
  }, []);

  // Phase 1 -> Phase 2: Preloader 0% to 100% (~1.8s), then Zoom-Out
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setProgress(100);
      onBootComplete?.();
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
      } else {
        setProgress(current);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Trigger Zoom-Out from centered CRT screen to full desk (monitor slightly left of center)
  useEffect(() => {
    if (progress < 100) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !rigRef.current) {
      onBootComplete?.();
      return;
    }

    gsap.to(rigRef.current, {
      scale: 1,
      x: 0,
      y: 0,
      duration: 1.25,
      ease: 'expo.inOut',
      onComplete: () => {
        onBootComplete?.();
      },
    });
  }, [progress]);

  const handleSkipBoot = () => {
    setProgress(100);
    if (rigRef.current) {
      gsap.killTweensOf(rigRef.current);
      gsap.set(rigRef.current, { scale: 1, x: 0, y: 0 });
    }
    onBootComplete?.();
  };

  // Phase 3: Scroll Dive-In through CRT Monitor + 2.5D Mouse Parallax + Eye-Tracking
  useEffect(() => {
    if (!isBooted) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const metrics = computeCrtFocus();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=55%',
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        animation: gsap.fromTo(
          rigRef.current,
          { scale: 1, x: 0, y: 0 },
          {
            scale: metrics.scale * 1.06,
            x: metrics.x,
            y: metrics.y,
            ease: 'power2.inOut',
          }
        ),
      });
    }, sectionRef);

    // 4-Layer Mouse Parallax with gsap.quickTo
    const l1X = gsap.quickTo(layer1Ref.current, 'x', { duration: 0.45, ease: 'power3.out' });
    const l1Y = gsap.quickTo(layer1Ref.current, 'y', { duration: 0.45, ease: 'power3.out' });
    const l2X = gsap.quickTo(layer2Ref.current, 'x', { duration: 0.4, ease: 'power3.out' });
    const l2Y = gsap.quickTo(layer2Ref.current, 'y', { duration: 0.4, ease: 'power3.out' });
    const l3X = gsap.quickTo(layer3Ref.current, 'x', { duration: 0.35, ease: 'power3.out' });
    const l3Y = gsap.quickTo(layer3Ref.current, 'y', { duration: 0.35, ease: 'power3.out' });
    const l3RotY = gsap.quickTo(layer3Ref.current, 'rotationY', { duration: 0.4, ease: 'power3.out' });
    const l3RotX = gsap.quickTo(layer3Ref.current, 'rotationX', { duration: 0.4, ease: 'power3.out' });
    const l4X = gsap.quickTo(layer4Ref.current, 'x', { duration: 0.3, ease: 'power3.out' });
    const l4Y = gsap.quickTo(layer4Ref.current, 'y', { duration: 0.3, ease: 'power3.out' });

    const onMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;

      l1X(nx * -8);
      l1Y(ny * -8);
      l2X(nx * -16);
      l2Y(ny * -12);
      l3X(nx * -22);
      l3Y(ny * -16);
      l3RotY(nx * 4);
      l3RotX(ny * -4);
      l4X(nx * -38);
      l4Y(ny * -26);

      // Smiley Eye-Tracking math: Math.atan2(mouseY - eyeY, mouseX - eyeX)
      if (leftEyeRef.current && rightEyeRef.current) {
        const rectL = leftEyeRef.current.getBoundingClientRect();
        const rectR = rightEyeRef.current.getBoundingClientRect();
        const angleL = Math.atan2(
          e.clientY - (rectL.top + rectL.height / 2),
          e.clientX - (rectL.left + rectL.width / 2)
        );
        const angleR = Math.atan2(
          e.clientY - (rectR.top + rectR.height / 2),
          e.clientX - (rectR.left + rectR.width / 2)
        );
        setPupilAngles({
          leftX: Math.cos(angleL) * 3.2,
          leftY: Math.sin(angleL) * 3.2,
          rightX: Math.cos(angleR) * 3.2,
          rightY: Math.sin(angleR) * 3.2,
        });
      }
    };

    const onResize = () => {
      computeCrtFocus();
      ScrollTrigger.refresh();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      ctx.revert();
    };
  }, [isBooted]);

  const totalBlocks = 10;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);

  return (
    <section
      id="desk"
      ref={sectionRef}
      aria-label="Creator Desk and Retro CRT Monitor"
      className="relative min-h-screen w-full overflow-hidden bg-[#F2E5C6] border-b-[4px] border-[#111111] flex flex-col justify-between select-none"
    >
      {/* Skip Boot button during Phase 1 Preloader */}
      {!isBooted && (
        <div className="fixed top-4 right-4 z-[60]">
          <button
            type="button"
            onClick={handleSkipBoot}
            className="brutalist-btn px-4 py-2 min-h-[44px] bg-[#FFD026] text-[#111111] border-[3px] border-[#111111] font-pixel text-xs font-bold uppercase"
          >
            [ SKIP BOOT ]
          </button>
        </div>
      )}

      {/* 2.5D Camera Stage */}
      <div
        ref={rigRef}
        className="relative w-full h-screen flex items-center justify-center overflow-hidden will-change-transform"
      >
        {/* LAYER 1: Window Sky, Clouds, City Skyline & Palm Leaves */}
        <div
          ref={layer1Ref}
          className="absolute inset-0 pointer-events-none z-0"
          aria-hidden="true"
        >
          {/* Left studio cream wall */}
          <div className="absolute inset-y-0 left-0 w-[45%] bg-[#F2E5C6] border-r-[4px] border-[#111111]" />
          {/* Wood window frame */}
          <div className="absolute inset-y-0 left-[43.5%] w-5 bg-[#FF7A1A] border-x-[3px] border-[#111111]" />

          {/* Right window sky */}
          <div className="absolute inset-y-0 right-0 left-[45%] bg-[#2074D4] overflow-hidden">
            <svg
              viewBox="0 0 600 360"
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              <path
                d="M70 90 C90 50, 160 50, 185 85 C220 75, 250 105, 235 130 L55 130 C35 115, 45 90, 70 90 Z"
                fill="#F2E5C6"
                stroke="#111111"
                strokeWidth="3"
              />
              <path
                d="M340 165 C360 135, 420 135, 440 162 C470 155, 495 180, 480 200 L325 200 C310 185, 320 165, 340 165 Z"
                fill="#F2E5C6"
                stroke="#111111"
                strokeWidth="3"
              />
              <g transform="translate(260, 210)">
                <rect x="0" y="35" width="65" height="120" fill="#B8E1FF" stroke="#111111" strokeWidth="3" />
                <rect x="55" y="10" width="85" height="145" fill="#DDF2FF" stroke="#111111" strokeWidth="3" />
                <rect x="130" y="25" width="75" height="130" fill="#A6D8FF" stroke="#111111" strokeWidth="3" />
                <rect x="195" y="0" width="90" height="155" fill="#E8F6FF" stroke="#111111" strokeWidth="3" />
                <path
                  d="M70 25V140M90 25V140M110 25V140M215 15V140M240 15V140M265 15V140"
                  stroke="#111111"
                  strokeWidth="2"
                />
              </g>
              <g stroke="#111111" strokeWidth="3" fill="#1FD655">
                <path d="M600 -10 C510 20, 440 60, 390 120 C445 95, 515 70, 600 50 Z" />
                <path d="M600 10 C520 55, 465 110, 430 175 C480 140, 540 105, 600 80 Z" />
                <path d="M600 35 C545 90, 505 150, 485 215 C525 175, 565 135, 600 110 Z" />
              </g>
            </svg>
          </div>
        </div>

        {/* Bottom Yellow Creator Desk Surface */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[25%] bg-[#FFC700] border-t-[4px] border-[#111111] z-0"
          aria-hidden="true"
        >
          <div className="w-full h-full flex justify-around">
            <div className="w-[3px] h-full bg-[#111111]/25 -skew-x-12" />
            <div className="w-[3px] h-full bg-[#111111]/25 -skew-x-6" />
            <div className="w-[3px] h-full bg-[#111111]/25 skew-x-6" />
            <div className="w-[3px] h-full bg-[#111111]/25 skew-x-12" />
          </div>
        </div>

        {/* LAYER 2: Wall Calendar JAN, Tropical Plant & Stacked Books (Absolute overlay, NOT flex sibling!) */}
        <div
          ref={layer2Ref}
          className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[1280px] z-10"
          aria-hidden="true"
        >
          {/* JAN Wall Calendar (Left Behind Monitor) */}
          <div className="absolute left-[3%] sm:left-[6%] top-[6%] w-44 sm:w-56 bg-[#FFFDF7] border-[3px] border-[#111111] rounded-lg shadow-[6px_6px_0px_#111111] p-3">
            <div className="flex justify-between px-1 -mt-5 mb-2">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-2.5 h-5 rounded-full bg-[#D6D3CE] border-2 border-[#111111]"
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono-code font-bold text-[#1FD655] mb-0.5">
              <span>2026</span>
              <span>PORTFOLIO</span>
            </div>
            <div className="font-bungee text-3xl sm:text-4xl text-[#FF4D38] leading-none tracking-tight mb-2">
              JAN
            </div>
            <div className="grid grid-cols-5 gap-1 font-mono-code text-xs font-bold text-[#1246B5] text-center">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span className="relative inline-flex items-center justify-center text-[#FF4D38] font-extrabold">
                8
                <span className="absolute inset-0 rounded-full border-2 border-[#FF4D38]" />
              </span>
              <span>9</span>
              <span>10</span>
              <span>14</span>
              <span>15</span>
              <span>16</span>
              <span>22</span>
              <span>23</span>
            </div>
          </div>

          {/* Potted Leaf Plant (Left Midground) */}
          <svg
            viewBox="0 0 140 190"
            className="absolute left-[1%] sm:left-[4%] top-[24%] w-28 sm:w-36 h-auto drop-shadow-[4px_4px_0px_#111111]"
          >
            <path
              d="M65 95 C20 65, 10 115, 35 145 C55 130, 65 110, 65 95 Z"
              fill="#1FD655"
              stroke="#111111"
              strokeWidth="3"
            />
            <path
              d="M70 85 C95 45, 135 65, 115 110 C95 110, 80 95, 70 85 Z"
              fill="#1FD655"
              stroke="#111111"
              strokeWidth="3"
            />
            <path
              d="M72 45 C45 20, 40 60, 75 72 C105 60, 100 20, 72 45 Z"
              fill="#FF4D38"
              stroke="#111111"
              strokeWidth="3"
            />
            <path d="M72 45 L82 28" stroke="#FFD026" strokeWidth="5" strokeLinecap="round" />
          </svg>

          {/* Right Midground Stacked Design Books */}
          <div className="absolute right-[6%] sm:right-[10%] bottom-[22%] flex items-end gap-1.5">
            <div className="w-9 h-44 bg-[#F2E5C6] border-[3px] border-[#111111] rounded-t shadow-[4px_4px_0px_#111111] flex flex-col justify-between p-1.5">
              <div className="w-full h-6 bg-[#111111]" />
              <span className="font-mono-code text-[9px] font-bold [writing-mode:vertical-rl] rotate-180 mx-auto">
                UI SYSTEMS
              </span>
            </div>
            <div className="w-10 h-48 bg-[#FF7A1A] border-[3px] border-[#111111] rounded-t shadow-[4px_4px_0px_#111111] flex flex-col justify-between p-1.5">
              <div className="w-full h-3 bg-[#FFFDF7] border border-[#111111]" />
              <span className="font-mono-code text-[9px] font-bold text-[#FFFDF7] [writing-mode:vertical-rl] rotate-180 mx-auto">
                WEB CRAFT
              </span>
            </div>
            <div className="w-10 h-44 bg-[#1FD655] border-[3px] border-[#111111] rounded-t shadow-[4px_4px_0px_#111111] flex flex-col justify-between p-1.5">
              <div className="w-full h-3 bg-[#FFD026] border border-[#111111]" />
              <span className="font-mono-code text-[9px] font-bold [writing-mode:vertical-rl] rotate-180 mx-auto">
                GSAP MOTION
              </span>
            </div>
          </div>
        </div>

        {/* LAYER 3: Center-Left Retro CRT Monitor & Interactive Stickers */}
        <div
          ref={layer3Ref}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative z-20 w-[92%] max-w-[630px] sm:-ml-10 md:-ml-16 flex flex-col items-center"
        >
          {/* Upper Monitor Housing */}
          <div className="relative w-full bg-[#F2E5C6] border-[4px] border-[#111111] rounded-[22px] p-4 sm:p-6 shadow-[10px_10px_0px_#111111]">
            {/* Top Bezel Rainbow Dot Stickers */}
            <div
              className="flex items-center justify-center gap-1.5 -mt-2 mb-2.5"
              aria-hidden="true"
            >
              {['#FF4D38', '#19B5FE', '#FFD026', '#1FD655', '#FF85B3', '#FF7A1A'].map(
                (color, idx) => (
                  <span
                    key={idx}
                    style={{ backgroundColor: color }}
                    className="w-3.5 h-3.5 rounded-full border-2 border-[#111111] flex items-center justify-center text-[7px] font-bold"
                  >
                    ★
                  </span>
                )
              )}
            </div>

            {/* Inner Dark Bezel + Blue CRT Glass Screen (Target of Phase 1 & Phase 3 Zoom) */}
            <div
              ref={crtScreenRef}
              className="relative w-full aspect-[16/10] bg-[#1B2028] border-[4px] border-[#111111] rounded-xl p-2 sm:p-3 overflow-hidden"
            >
              <div className="relative w-full h-full bg-[#1246B5] border-[2px] border-[#111111] rounded-lg overflow-hidden flex flex-col justify-between p-3 sm:p-5 text-[#FFFDF7]">
                <div className="crt-scanlines pointer-events-none absolute inset-0 z-10" />

                {/* Top System Bar inside CRT */}
                <div className="relative z-20 flex items-center justify-between gap-2 text-[10px] sm:text-xs font-mono-code text-[#FFD026]">
                  <span className="px-2 py-0.5 bg-[#111111]/60 border border-[#FFD026]/50 rounded">
                    {isBooted
                      ? `SYSTEM READY // ${profile.systemVersion || 'WEB PORTFOLIO v2026'}`
                      : 'BIOS BOOT SEQUENCE // CRT_85HZ'}
                  </span>
                  <span className="hidden sm:inline text-[#F2E5C6]">MEM: 64MB OK</span>
                </div>

                {/* Center CRT Content: Phase 1 Preloader vs Phase 2 Active OS */}
                <div className="relative z-20 my-auto flex flex-col items-center text-center px-2">
                  <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl tracking-wider text-[#F2E5C6] drop-shadow-[3px_3px_0px_#111111] mb-2">
                    PORTOFOLIO
                  </h1>

                  {!isBooted ? (
                    <div className="w-full max-w-[280px] flex flex-col items-center">
                      <div
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Portfolio system boot progress"
                        className="w-full h-7 bg-[#F2E5C6] border-[3px] border-[#111111] p-1 grid grid-cols-10 gap-1 shadow-[3px_3px_0px_#111111]"
                      >
                        {Array.from({ length: totalBlocks }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-full transition-colors duration-100 ${
                              i < filledBlocks ? 'bg-[#111111]' : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 font-pixel text-xs sm:text-sm tracking-widest text-[#F2E5C6]">
                        LOADING... {progress}%
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-md">
                      <p className="font-heading text-xs sm:text-sm md:text-base font-bold text-[#FFD026] tracking-wide">
                        {profile.role}
                      </p>

                      {cvNotice && (
                        <div
                          role="status"
                          className="px-3 py-1.5 bg-[#FFD026] text-[#111111] border-2 border-[#111111] rounded text-xs font-mono-code font-bold"
                        >
                          Jumping to Developer ID Card. Add /public/cv.pdf anytime to enable direct PDF download.
                        </div>
                      )}

                      {/* 2 Action Buttons inside CRT Screen */}
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                        <a
                          href="#projects"
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate('projects');
                          }}
                          className="brutalist-btn inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] bg-[#FFD026] text-[#111111] border-[2px] border-[#111111] rounded-lg font-pixel text-[11px] font-bold uppercase"
                        >
                          <IconVhsTape className="w-4 h-4" />
                          <span>EXPLORE WEB PROJECTS</span>
                        </a>

                        <a
                          href={profile.cvUrl || '#about'}
                          onClick={(e) => {
                            if (!profile.cvUrl) {
                              e.preventDefault();
                              setCvNotice(true);
                              setTimeout(() => setCvNotice(false), 3200);
                              onNavigate('about');
                            }
                          }}
                          className="brutalist-btn inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] bg-[#F2E5C6] text-[#111111] border-[2px] border-[#111111] rounded-lg font-pixel text-[11px] font-bold uppercase"
                        >
                          <IconDocument className="w-4 h-4" />
                          <span>ABOUT / CV</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom CRT Mini Taskbar + Scroll Prompt */}
                <div className="relative z-20 flex items-center justify-between bg-[#D6D3CE] text-[#111111] border-t-2 border-[#111111] -mx-3 sm:-mx-5 -mb-3 sm:-mb-5 px-2.5 py-1 text-[10px] font-pixel">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#FFFDF7] border border-[#111111] font-bold">
                      <IconWindowFlag className="w-3 h-3" /> Start
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#FFD026] border border-[#111111] font-bold">
                      <IconMonitor className="w-3 h-3" /> Folio
                    </span>
                  </div>
                  <span className="font-bold text-[#1246B5] hidden sm:inline">
                    SCROLL TO ENTER THE SYSTEM
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bezel Bar with Eye-Tracking Smiley Stickers */}
            <div className="mt-3 flex items-center justify-between px-3">
              <div
                ref={leftEyeRef}
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-[#FFD026] border-[2.5px] border-[#111111] shadow-[2px_2px_0px_#111111] flex flex-col items-center justify-center relative"
              >
                <div className="flex gap-1.5 -mt-0.5">
                  <span
                    style={{
                      transform: `translate(${pupilAngles.leftX}px, ${pupilAngles.leftY}px)`,
                    }}
                    className="w-1.5 h-1.5 rounded-full bg-[#111111] block"
                  />
                  <span
                    style={{
                      transform: `translate(${pupilAngles.leftX}px, ${pupilAngles.leftY}px)`,
                    }}
                    className="w-1.5 h-1.5 rounded-full bg-[#111111] block"
                  />
                </div>
                <div className="w-3.5 h-1.5 border-b-2 border-[#111111] rounded-b-full mt-0.5" />
              </div>

              <div className="flex items-center gap-2" aria-hidden="true">
                <div className="w-24 sm:w-40 h-2 bg-[#E8C574] border border-[#111111] rounded-full" />
                <div className="w-3 h-2 bg-[#1FD655] border border-[#111111]" />
              </div>

              <div className="flex items-center gap-2" aria-hidden="true">
                <div
                  ref={rightEyeRef}
                  className="w-8 h-8 rounded-full bg-[#A855F7] border-[2.5px] border-[#111111] shadow-[2px_2px_0px_#111111] flex flex-col items-center justify-center relative"
                >
                  <div className="flex gap-1.5 -mt-0.5">
                    <span
                      style={{
                        transform: `translate(${pupilAngles.rightX}px, ${pupilAngles.rightY}px)`,
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-[#FFFDF7] block"
                    />
                    <span
                      style={{
                        transform: `translate(${pupilAngles.rightX}px, ${pupilAngles.rightY}px)`,
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-[#FFFDF7] block"
                    />
                  </div>
                  <div className="w-3.5 h-1.5 border-b-2 border-[#FFFDF7] rounded-b-full mt-0.5" />
                </div>
              </div>
            </div>

            {/* INTERACTIVE STICKY NOTE (Right Bezel) */}
            <button
              type="button"
              onClick={() => setStickyActive((prev) => !prev)}
              aria-pressed={stickyActive}
              aria-label="Interactive desk sticky note: click to flip status message"
              className={`group absolute -right-3 sm:-right-8 -bottom-10 z-30 w-28 sm:w-32 min-h-[96px] p-2.5 bg-[#FF85B3] border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] transition-transform duration-200 ${
                stickyActive
                  ? '-rotate-2 -translate-y-2 bg-[#1FD655]'
                  : 'rotate-6 hover:rotate-2 hover:-translate-y-1.5'
              }`}
            >
              <div className="w-10 h-2.5 bg-[#FFFDF7]/70 border border-[#111111] mx-auto -mt-4 mb-1.5" />
              <p className="font-script text-xl sm:text-2xl font-bold leading-tight text-[#111111]">
                {stickyActive ? profile.stickyNoteActive : profile.stickyNoteInitial}
              </p>
              <span className="mt-1 block font-mono-code text-[9px] font-bold uppercase text-[#111111]/80">
                [Click Note]
              </span>
            </button>
          </div>

          {/* Lower PC Desktop Base Unit */}
          <div className="w-[95%] bg-[#F2E5C6] border-x-[4px] border-b-[4px] border-[#111111] rounded-b-xl p-3 sm:p-4 shadow-[10px_10px_0px_#111111] flex items-center justify-between gap-4">
            <div className="flex flex-col items-start gap-1">
              <span className="px-2.5 py-0.5 bg-[#FFD026] border-2 border-[#111111] font-bungee text-[10px] sm:text-xs -rotate-3 shadow-[2px_2px_0px_#111111]">
                {profile.deskTapeTop}
              </span>
              <span className="px-2.5 py-0.5 bg-[#FFD026] border-2 border-[#111111] font-bungee text-[10px] sm:text-xs rotate-2 ml-3 shadow-[2px_2px_0px_#111111]">
                {profile.deskTapeBottom}
              </span>
            </div>

            <div className="w-36 sm:w-52 bg-[#E8C574] border-[2.5px] border-[#111111] p-2 rounded flex flex-col gap-1.5" aria-hidden="true">
              <div className="w-full h-2 bg-[#111111] rounded-xs" />
              <div className="w-8 h-1.5 bg-[#111111] self-end" />
              <div className="flex gap-1 pt-1">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="flex-1 h-2 bg-[#111111]/30" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LAYER 4: Foreground Props (FIJI Water Bottle on Left, Coca-Copy Soda Can on Right) */}
        <div
          ref={layer4Ref}
          className="pointer-events-none absolute inset-x-0 bottom-[6%] mx-auto w-full max-w-[1180px] flex items-end justify-between px-3 sm:px-10 z-30"
          aria-hidden="true"
        >
          <div className="flex items-end gap-2">
            <div className="hidden sm:flex w-20 h-12 bg-[#1FD655] border-[3px] border-[#111111] rounded shadow-[4px_4px_0px_#111111] flex-col justify-center items-center p-1 -rotate-6">
              <span className="font-pixel text-[8px] font-bold bg-[#FFFDF7] px-1 border border-[#111111]">
                MINT.JS
              </span>
            </div>

            <svg
              viewBox="0 0 110 230"
              className="w-16 sm:w-24 h-auto drop-shadow-[6px_6px_0px_#111111]"
            >
              <rect x="36" y="6" width="38" height="18" rx="3" fill="#19B5FE" stroke="#111111" strokeWidth="3" />
              <path
                d="M28 24 H82 L96 55 V208 C96 216, 89 222, 80 222 H30 C21 222, 14 216, 14 208 V55 Z"
                fill="#DDF2FF"
                stroke="#111111"
                strokeWidth="3.5"
              />
              <rect x="18" y="68" width="74" height="148" rx="6" fill="#89CFF0" />
              <rect x="22" y="86" width="66" height="82" fill="#19B5FE" stroke="#111111" strokeWidth="2.5" />
              <text
                x="55"
                y="128"
                textAnchor="middle"
                fill="#FFFDF7"
                stroke="#111111"
                strokeWidth="1.2"
                fontFamily="Bungee, sans-serif"
                fontSize="22"
              >
                FIJI
              </text>
              <circle cx="70" cy="152" r="9" fill="#FF85B3" stroke="#111111" strokeWidth="2" />
              <circle cx="70" cy="152" r="3" fill="#FFD026" />
            </svg>
          </div>

          <svg
            viewBox="0 0 120 200"
            className="w-16 sm:w-24 h-auto drop-shadow-[6px_6px_0px_#111111]"
          >
            <ellipse cx="60" cy="20" rx="42" ry="10" fill="#D6D3CE" stroke="#111111" strokeWidth="3" />
            <path
              d="M18 20 V174 C18 184, 36 192, 60 192 C84 192, 102 184, 102 174 V20 Z"
              fill="#FF4D38"
              stroke="#111111"
              strokeWidth="3.5"
            />
            <ellipse cx="60" cy="20" rx="42" ry="10" fill="#E5E5E5" stroke="#111111" strokeWidth="3" />
            <path
              d="M78 32 C66 75, 88 125, 74 182"
              stroke="#FFFDF7"
              strokeWidth="6"
              fill="none"
            />
            <text
              x="56"
              y="112"
              textAnchor="middle"
              fill="#FFFDF7"
              fontFamily="Caveat, cursive"
              fontWeight="700"
              fontSize="28"
              transform="rotate(-82 56 112)"
            >
              Coca-Copy
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
