import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { IconVhsTape, IconPalette, IconGlobe } from './RetroIcons';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [cursorMode, setCursorMode] = useState('default');
  const [cursorLabel, setCursorLabel] = useState('');
  const [trails, setTrails] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const lastPos = useRef({ x: 0, y: 0, time: 0 });
  const trailId = useRef(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || isCoarse) return;

    const el = cursorRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.14, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.14, ease: 'power3.out' });

    const onMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);
      xTo(e.clientX);
      yTo(e.clientY);

      const now = performance.now();
      const dist = Math.hypot(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y);
      if (dist > 42 && now - lastPos.current.time > 55) {
        lastPos.current = { x: e.clientX, y: e.clientY, time: now };
        const id = ++trailId.current;
        const colors = ['#FFD026', '#FF85B3', '#1FD655', '#19B5FE'];
        const color = colors[id % colors.length];
        setTrails((prev) => [...prev.slice(-6), { id, x: e.clientX, y: e.clientY, color }]);
        setTimeout(() => {
          setTrails((prev) => prev.filter((item) => item.id !== id));
        }, 380);
      }

      const target = e.target.closest('[data-cursor]');
      if (target) {
        const mode = target.getAttribute('data-cursor');
        const label = target.getAttribute('data-cursor-label') || '';
        setCursorMode(mode);
        setCursorLabel(label);
      } else {
        setCursorMode('default');
        setCursorLabel('');
      }
    };

    const onMouseLeaveWindow = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeaveWindow);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeaveWindow);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      {trails.map((t) => (
        <svg
          key={t.id}
          style={{ left: t.x - 7, top: t.y - 7 }}
          className="fixed w-3.5 h-3.5 animate-ping"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 1L10 6L15 8L10 10L8 15L6 10L1 8L6 6L8 1Z"
            fill={t.color}
            stroke="#111111"
            strokeWidth="1.5"
          />
        </svg>
      ))}

      <div
        ref={cursorRef}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        {cursorMode === 'default' ? (
          <div className="w-5 h-5 rounded-full bg-[#FFD026] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-[#111111] rounded-full" />
          </div>
        ) : (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#111111] shadow-[4px_4px_0px_#111111] font-pixel text-[10px] font-bold tracking-wider uppercase whitespace-nowrap translate-x-4 -translate-y-4 ${
              cursorMode === 'vhs'
                ? 'bg-[#FFD026] text-[#111111]'
                : cursorMode === 'hex'
                ? 'bg-[#1FD655] text-[#111111]'
                : 'bg-[#FF85B3] text-[#111111]'
            }`}
          >
            {cursorMode === 'vhs' && <IconVhsTape className="w-3.5 h-3.5" />}
            {cursorMode === 'hex' && <IconPalette className="w-3.5 h-3.5" />}
            {cursorMode === 'mockup' && <IconGlobe className="w-3.5 h-3.5" />}
            <span>
              {cursorLabel ||
                (cursorMode === 'vhs'
                  ? '[ OPEN PROJECT ]'
                  : cursorMode === 'hex'
                  ? '[ CLICK TO COPY HEX ]'
                  : '[ LAUNCH LIVE SITE ]')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
