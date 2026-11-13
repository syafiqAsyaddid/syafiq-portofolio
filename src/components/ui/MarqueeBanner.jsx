import React, { useEffect, useRef, useState } from 'react';

export default function MarqueeBanner({
  items = ['ABOUT ME', 'DEVELOPER ID CARD', 'RETRO OS SYSTEM'],
  bg = 'bg-[#FF4D38]',
  textColor = 'text-[#FFFDF7]',
  tilt = '-rotate-1',
  scrollVelocityRef,
}) {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsPaused(true);
      return;
    }

    let rafId;
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!isPaused && trackRef.current) {
        const velocity = scrollVelocityRef?.current ? Math.abs(scrollVelocityRef.current) : 0;
        const speedMultiplier = Math.min(2.2, 1 + velocity * 0.025);
        // Calm, readable ticker pace (~1.8% of track width per second, frame-rate independent)
        offsetRef.current -= 1.8 * dt * speedMultiplier;
        if (offsetRef.current <= -50) {
          offsetRef.current += 50;
        }
        trackRef.current.style.transform = `translate3d(${offsetRef.current}%, 0, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused, scrollVelocityRef]);

  const halfItems = [...items, ...items, ...items];
  const repeatedItems = [...halfItems, ...halfItems];

  return (
    <div
      className={`relative z-20 ${bg} ${textColor} border-y-[3px] border-[#111111] py-2.5 overflow-hidden shadow-[0px_5px_0px_#111111] ${tilt}`}
    >
      <div className="flex items-center justify-between">
        <div
          ref={trackRef}
          className="flex items-center whitespace-nowrap will-change-transform w-max"
        >
          {repeatedItems.map((label, idx) => (
            <div key={idx} className="flex items-center gap-4 mx-4">
              <span className="font-bungee text-base sm:text-xl tracking-wider uppercase">
                {label}
              </span>
              <svg
                viewBox="0 0 18 18"
                className="w-4 h-4 shrink-0"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 1L11.3 6.2L17 6.8L12.7 10.6L13.9 16.2L9 13.2L4.1 16.2L5.3 10.6L1 6.8L6.7 6.2L9 1Z"
                  fill="#FFD026"
                  stroke="#111111"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          aria-label={isPaused ? 'Resume marquee ticker animation' : 'Pause marquee ticker animation'}
          aria-pressed={isPaused}
          className="relative z-10 mr-3 px-2.5 py-1 min-h-[36px] min-w-[44px] rounded bg-[#FFFDF7] text-[#111111] border-2 border-[#111111] font-pixel text-[10px] font-bold uppercase shadow-[2px_2px_0px_#111111] hover:bg-[#FFD026]"
        >
          {isPaused ? 'PLAY' : 'PAUSE'}
        </button>
      </div>
    </div>
  );
}
