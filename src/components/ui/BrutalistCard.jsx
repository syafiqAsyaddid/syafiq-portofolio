import React, { useRef, useState } from 'react';

export default function BrutalistCard({
  children,
  className = '',
  bg = 'bg-[#F2E5C6]',
  borderWidth = 'border-[3px]',
  maxOffset = 10,
  enableTilt = true,
  as: Component = 'div',
  ...rest
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    boxShadow: '6px 6px 0px #111111',
    transform: 'perspective(900px) rotateX(0deg) rotateY(0deg)',
  });

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    const shadowX = Math.round(-dx * maxOffset);
    const shadowY = Math.round(-dy * maxOffset);
    const tiltX = enableTilt ? (dy * -2.5).toFixed(2) : 0;
    const tiltY = enableTilt ? (dx * 2.5).toFixed(2) : 0;

    setStyle({
      boxShadow: `${shadowX}px ${shadowY}px 0px #111111`,
      transform: `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      boxShadow: '6px 6px 0px #111111',
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg)',
    });
  };

  return (
    <Component
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`${bg} ${borderWidth} border-[#111111] rounded-xl transition-[box-shadow,transform] duration-150 ease-out ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
