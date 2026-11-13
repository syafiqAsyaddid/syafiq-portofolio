import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IconTimeline,
  IconVhsTape,
  IconCheck,
  IconDocument,
  IconReboot,
} from '../ui/RetroIcons';

// All connections span the open Center Alley between Left Column (right-edge pins)
// and Right Column (left-edge pins), so NO string ever crosses over card text.
const STRING_CONNECTIONS = [
  {
    id: 'conn-1',
    from: 'exp-1',
    to: 'edu-1',
    type: 'cross',
    label: 'Academic HCI -> Full-Stack Production',
  },
  {
    id: 'conn-2',
    from: 'exp-1',
    to: 'exp-2',
    type: 'left-alley',
    label: 'Studio Systems -> Lead Web Engineering',
  },
  {
    id: 'conn-3',
    from: 'edu-1',
    to: 'exp-2',
    type: 'cross',
    label: 'Design Systems Study -> Studio UI/UX Role',
  },
  {
    id: 'conn-4',
    from: 'edu-1',
    to: 'edu-2',
    type: 'right-alley',
    label: 'University Core -> React & WCAG Certifications',
  },
  {
    id: 'conn-5',
    from: 'edu-2',
    to: 'exp-2',
    type: 'cross',
    label: 'Verified WCAG Craft -> Production Interfaces',
  },
  {
    id: 'conn-6',
    from: 'exp-2',
    to: 'exp-3',
    type: 'left-alley',
    label: 'Freelance Launches -> Studio UI/UX Role',
  },
  {
    id: 'conn-7',
    from: 'edu-2',
    to: 'exp-3',
    type: 'cross',
    label: 'Foundational Certs -> First Client Websites',
  },
];

// Left column pins sit on the inner RIGHT corner; Right column pins sit on the inner LEFT corner.
const CARD_CONFIG = {
  'exp-1': { pinSide: 'right', pinColor: '#FF4D38', tilt: '-rotate-1' },
  'exp-2': { pinSide: 'right', pinColor: '#1FD655', tilt: 'rotate-1' },
  'exp-3': { pinSide: 'right', pinColor: '#19B5FE', tilt: '-rotate-1' },
  'edu-1': { pinSide: 'left', pinColor: '#FF85B3', tilt: 'rotate-1' },
  'edu-2': { pinSide: 'left', pinColor: '#FFD026', tilt: '-rotate-1' },
};

// Point-to-quadratic-Bezier distance sample helper
function sampleBezierPoint(x0, y0, cx, cy, x1, y1, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
    y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
  };
}

export default function ExperienceSection({
  experience = [],
  education = [],
  onNavigate,
}) {
  const boardRef = useRef(null);
  const pinRefs = useRef({});

  // Direct DOM refs for 60fps zero-lag SVG updates during card expand/collapse & cursor plucking
  const shadowPathRefs = useRef({});
  const mainPathRefs = useRef({});
  const knotCircleRefs = useRef({});
  const pinGroupRefs = useRef({});

  // Elastic spring state per string connection
  const stringPhysicsRef = useRef(
    STRING_CONNECTIONS.reduce((acc, conn) => {
      acc[conn.id] = { ox: 0, oy: 0, vx: 0, vy: 0, touched: 0 };
      return acc;
    }, {})
  );
  const mouseTrackerRef = useRef({
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    active: false,
  });

  const allItems = [
    ...experience.map((item) => ({
      ...item,
      category: 'work',
      ...(CARD_CONFIG[item.id] || {
        pinSide: 'right',
        pinColor: '#FF4D38',
        tilt: '-rotate-1',
      }),
    })),
    ...education.map((item) => ({
      ...item,
      category: 'education',
      ...(CARD_CONFIG[item.id] || {
        pinSide: 'left',
        pinColor: '#19B5FE',
        tilt: 'rotate-1',
      }),
    })),
  ];

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'work' | 'education'
  const [selectedId, setSelectedId] = useState('exp-1');
  const [hoveredId, setHoveredId] = useState(null);
  const [pluckedConnLabel, setPluckedConnLabel] = useState('');
  const [openNotes, setOpenNotes] = useState(() => ({
    'exp-1': true,
    'edu-1': true,
  }));

  const focusId = hoveredId || selectedId;
  const focusIdRef = useRef(focusId);
  focusIdRef.current = focusId;
  const activeFilterRef = useRef(activeFilter);
  activeFilterRef.current = activeFilter;

  // Continuous 60fps loop: tracks pin positions smoothly during card expand/minimize
  // AND applies interactive elastic string physics when the cursor touches any string.
  useEffect(() => {
    let rafId;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateFrame = () => {
      const boardEl = boardRef.current;
      if (boardEl) {
        const boardRect = boardEl.getBoundingClientRect();
        const isDesktopTwoCol =
          window.innerWidth >= 1024 && activeFilterRef.current === 'all';
        const coords = {};

        // 1. Read live pin coordinates every frame
        Object.entries(pinRefs.current).forEach(([id, pinEl]) => {
          if (!pinEl) return;
          const r = pinEl.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;
          coords[id] = {
            x: r.left - boardRect.left + r.width / 2,
            y: r.top - boardRect.top + r.height / 2,
          };
        });

        // 2. Update 3D Push-Pin SVG caps at exact pin coordinates
        Object.entries(pinGroupRefs.current).forEach(([id, groupEl]) => {
          if (!groupEl) return;
          const c = coords[id];
          if (!c) {
            groupEl.style.display = 'none';
            return;
          }
          groupEl.style.display = 'block';
          groupEl.setAttribute('transform', `translate(${c.x.toFixed(1)}, ${c.y.toFixed(1)})`);
        });

        // 3. Update every string path + cursor touch interaction physics
        const mouse = mouseTrackerRef.current;
        const currentFocus = focusIdRef.current;

        STRING_CONNECTIONS.forEach((conn) => {
          const shadowEl = shadowPathRefs.current[conn.id];
          const mainEl = mainPathRefs.current[conn.id];
          const knotEl = knotCircleRefs.current[conn.id];
          const start = coords[conn.from];
          const end = coords[conn.to];

          if (!shadowEl || !mainEl || !start || !end) {
            if (shadowEl) shadowEl.style.display = 'none';
            if (mainEl) mainEl.style.display = 'none';
            if (knotEl) knotEl.style.display = 'none';
            return;
          }

          shadowEl.style.display = 'block';
          mainEl.style.display = 'block';

          // Compute base control point strictly inside the open Center Alley / side margin
          let baseCx = (start.x + end.x) / 2;
          let baseCy = (start.y + end.y) / 2 + 26;

          if (conn.type === 'left-alley') {
            baseCx = Math.max(start.x, end.x) + (isDesktopTwoCol ? 28 : 16);
            baseCy = (start.y + end.y) / 2;
          } else if (conn.type === 'right-alley') {
            baseCx = isDesktopTwoCol
              ? Math.min(start.x, end.x) - 28
              : Math.max(start.x, end.x) + 16;
            baseCy = (start.y + end.y) / 2;
          } else {
            // Cross-alley catenary sag in the center gap between columns
            baseCx = (start.x + end.x) / 2;
            baseCy = (start.y + end.y) / 2 + 28;
          }

          const phys = stringPhysicsRef.current[conn.id];

          // Check if the cursor is touching/brushing across this string
          if (!prefersReduced && mouse.active) {
            let minDist = 9999;
            for (let s = 1; s <= 7; s++) {
              const t = s / 8;
              const pt = sampleBezierPoint(
                start.x,
                start.y,
                baseCx + phys.ox,
                baseCy + phys.oy,
                end.x,
                end.y,
                t
              );
              const d = Math.hypot(mouse.x - pt.x, mouse.y - pt.y);
              if (d < minDist) minDist = d;
            }

            const touchRadius = 46;
            if (minDist < touchRadius) {
              const influence = (1 - minDist / touchRadius) * 0.85;
              // Push the string in the direction the cursor is moving
              phys.vx += mouse.vx * influence * 0.55;
              phys.vy += mouse.vy * influence * 0.55;

              // Also nudge slightly away from cursor center if cursor is moving slowly
              const midPt = sampleBezierPoint(
                start.x,
                start.y,
                baseCx,
                baseCy,
                end.x,
                end.y,
                0.5
              );
              const pushX = midPt.x - mouse.x;
              const pushY = midPt.y - mouse.y;
              const pushLen = Math.max(1, Math.hypot(pushX, pushY));
              phys.vx += (pushX / pushLen) * influence * 2.2;
              phys.vy += (pushY / pushLen) * influence * 2.2;
              phys.touched = 18;
            }
          }

          // Elastic spring-damper integration (Hooke's law)
          if (!prefersReduced) {
            const stiffness = 0.16;
            const damping = 0.83;
            const ax = -stiffness * phys.ox;
            const ay = -stiffness * phys.oy;
            phys.vx = (phys.vx + ax) * damping;
            phys.vy = (phys.vy + ay) * damping;
            phys.ox = Math.max(-85, Math.min(85, phys.ox + phys.vx));
            phys.oy = Math.max(-85, Math.min(85, phys.oy + phys.vy));
            if (phys.touched > 0) phys.touched -= 1;
          } else {
            phys.ox = 0;
            phys.oy = 0;
          }

          const finalCx = baseCx + phys.ox;
          const finalCy = baseCy + phys.oy;
          const pathD = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${finalCx.toFixed(1)} ${finalCy.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;

          shadowEl.setAttribute('d', pathD);
          mainEl.setAttribute('d', pathD);

          const isHighlighted =
            conn.from === currentFocus ||
            conn.to === currentFocus ||
            phys.touched > 0;

          shadowEl.setAttribute('stroke-width', isHighlighted ? '7.5' : '5.5');
          mainEl.setAttribute('stroke', isHighlighted ? '#FFD026' : '#FF4D38');
          mainEl.setAttribute('stroke-width', isHighlighted ? '4.2' : '3');

          if (knotEl) {
            if (isHighlighted) {
              const midCurve = sampleBezierPoint(
                start.x,
                start.y,
                finalCx,
                finalCy,
                end.x,
                end.y,
                0.5
              );
              knotEl.style.display = 'block';
              knotEl.setAttribute('cx', midCurve.x.toFixed(1));
              knotEl.setAttribute('cy', midCurve.y.toFixed(1));
            } else {
              knotEl.style.display = 'none';
            }
          }
        });

        // Decay mouse velocity slightly each frame
        mouse.vx *= 0.6;
        mouse.vy *= 0.6;
      }

      rafId = requestAnimationFrame(updateFrame);
    };

    rafId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleBoardMouseMove = (e) => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const rect = boardEl.getBoundingClientRect();
    const nextX = e.clientX - rect.left;
    const nextY = e.clientY - rect.top;
    const tracker = mouseTrackerRef.current;

    if (tracker.active) {
      tracker.vx = Math.max(-28, Math.min(28, nextX - tracker.x));
      tracker.vy = Math.max(-28, Math.min(28, nextY - tracker.y));
    }
    tracker.x = nextX;
    tracker.y = nextY;
    tracker.active = true;
  };

  const handleBoardMouseLeave = () => {
    mouseTrackerRef.current.active = false;
    mouseTrackerRef.current.vx = 0;
    mouseTrackerRef.current.vy = 0;
  };

  // Pluck all connected strings with a visible wave when a user clicks a pin or "Pluck Strings"
  const pluckStringsForCard = (cardId) => {
    STRING_CONNECTIONS.forEach((conn, idx) => {
      if (conn.from === cardId || conn.to === cardId) {
        const phys = stringPhysicsRef.current[conn.id];
        if (phys) {
          phys.vx += (idx % 2 === 0 ? 1 : -1) * 14;
          phys.vy += 10;
          phys.touched = 24;
        }
      }
    });
  };

  const toggleEvidenceNote = (id) => {
    setSelectedId(id);
    pluckStringsForCard(id);
    setOpenNotes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExpandAllNotes = (expand) => {
    const next = {};
    allItems.forEach((item) => {
      next[item.id] = expand;
    });
    setOpenNotes(next);
  };

  const handleTraceNext = () => {
    const visibleItems = allItems.filter((item) =>
      activeFilter === 'all' ? true : item.category === activeFilter
    );
    if (visibleItems.length === 0) return;
    const currentIndex = visibleItems.findIndex((i) => i.id === selectedId);
    const nextItem = visibleItems[(currentIndex + 1) % visibleItems.length];
    setSelectedId(nextItem.id);
    pluckStringsForCard(nextItem.id);
    setOpenNotes((prev) => ({ ...prev, [nextItem.id]: true }));
  };

  const connectedIds = new Set([focusId]);
  STRING_CONNECTIONS.forEach((conn) => {
    if (conn.from === focusId) connectedIds.add(conn.to);
    if (conn.to === focusId) connectedIds.add(conn.from);
  });

  const activeConnectionLabels = STRING_CONNECTIONS.filter(
    (conn) => conn.from === focusId || conn.to === focusId
  );

  const workItems = allItems.filter((i) => i.category === 'work');
  const eduItems = allItems.filter((i) => i.category === 'education');
  const showWork = activeFilter === 'all' || activeFilter === 'work';
  const showEdu = activeFilter === 'all' || activeFilter === 'education';

  const renderPinnedCard = (item) => {
    const isEducation = item.category === 'education';
    const title = isEducation ? item.degree : item.role;
    const subtitle = isEducation ? item.institution : item.organization;
    const isFocused = focusId === item.id;
    const isDirectlyConnected = connectedIds.has(item.id);
    const isNoteOpen = !!openNotes[item.id];
    const isRightPin = item.pinSide === 'right';

    return (
      <motion.article
        key={item.id}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        onMouseEnter={() => {
          setHoveredId(item.id);
          setPluckedConnLabel('');
        }}
        onMouseLeave={() => setHoveredId(null)}
        className={`relative z-20 transition-transform duration-200 ${
          isFocused ? 'rotate-0 scale-[1.01]' : item.tilt
        }`}
      >
        {/* Main Pinned Evidence Card (Reference 1 Yellow/Cream Aesthetic) */}
        <div
          className={`relative bg-[#F2E5C6] border-[3px] border-[#111111] rounded-2xl overflow-hidden transition-shadow duration-200 ${
            isFocused
              ? 'shadow-[10px_10px_0px_#111111] ring-3 ring-[#FFD026]'
              : isDirectlyConnected
              ? 'shadow-[7px_7px_0px_#111111] ring-2 ring-[#FF4D38]'
              : 'shadow-[5px_5px_0px_#111111]'
          }`}
        >
          {/* Corner Push-Pin Anchor sitting on the INNER ALLEY EDGE so strings never cross card text */}
          <button
            ref={(el) => {
              pinRefs.current[item.id] = el;
            }}
            type="button"
            onClick={() => toggleEvidenceNote(item.id)}
            aria-label={`Pin tack for ${title}: click to toggle evidence note`}
            style={{ backgroundColor: item.pinColor }}
            className={`absolute top-2.5 ${
              isRightPin ? 'right-2.5' : 'left-2.5'
            } z-20 w-7 h-7 rounded-full border-[2.5px] border-[#111111] flex items-center justify-center`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FFFDF7]" />
          </button>

          {/* Top Yellow Period Header Bar */}
          <button
            type="button"
            onClick={() => toggleEvidenceNote(item.id)}
            aria-expanded={isNoteOpen}
            className={`w-full bg-[#FFD026] border-b-[3px] border-[#111111] py-2.5 flex items-center justify-between gap-2 text-left hover:bg-[#ffda47] ${
              isRightPin ? 'pl-4 pr-12' : 'pl-12 pr-4'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2 py-0.5 bg-[#111111] text-[#FFD026] font-pixel text-[10px] font-bold">
                {item.yearKey}
              </span>
              <span className="font-mono-code text-xs sm:text-sm font-bold text-[#111111] truncate">
                {item.period}
              </span>
            </div>

            <span
              className={`px-2.5 py-0.5 border-2 border-[#111111] rounded font-pixel text-[9px] font-bold uppercase shrink-0 ${
                isNoteOpen
                  ? 'bg-[#1FD655] text-[#111111]'
                  : 'bg-[#FFFDF7] text-[#111111]'
              }`}
            >
              {isNoteOpen ? 'HIDE NOTE ▲' : 'EVIDENCE ▼'}
            </span>
          </button>

          {/* Card Body */}
          <div className="p-4 sm:p-5 space-y-3">
            <div>
              <span
                style={{
                  backgroundColor: isEducation ? '#19B5FE' : '#FF85B3',
                }}
                className="inline-block px-2.5 py-0.5 border border-[#111111] rounded-full font-pixel text-[9px] font-bold uppercase text-[#111111] mb-1.5"
              >
                {item.type}
              </span>
              <h4 className="font-heading text-lg sm:text-xl font-extrabold text-[#111111] leading-snug">
                {title}
              </h4>
              <p className="font-mono-code text-xs font-bold text-[#111111]/80 mt-0.5">
                {subtitle} • {item.location}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#111111] leading-relaxed font-medium">
              {item.summary}
            </p>

            {/* Skill & Craft Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.highlights.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 bg-[#FFFDF7] border-2 border-[#111111] rounded-full font-mono-code text-[11px] font-bold text-[#111111]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Attached Sticky Note Evidence Flap (Smooth 60fps tracked by requestAnimationFrame) */}
            <AnimatePresence initial={false}>
              {isNoteOpen && (
                <motion.div
                  key="sticky-evidence"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden pt-2"
                >
                  <div className="relative bg-[#FF85B3] border-[2.5px] border-[#111111] rounded-xl p-3.5 shadow-[4px_4px_0px_#111111] space-y-2.5">
                    <div
                      className="w-16 h-3 bg-[#FFFDF7]/80 border border-[#111111] mx-auto -mt-5 mb-1 -rotate-2"
                      aria-hidden="true"
                    />

                    <div className="flex items-center justify-between font-pixel text-[10px] font-bold text-[#111111]">
                      <span className="flex items-center gap-1.5">
                        <IconDocument className="w-3.5 h-3.5" />
                        <span>PINNED FIELD NOTES // DELIVERABLES</span>
                      </span>
                      <span>#{item.id.toUpperCase()}</span>
                    </div>

                    {item.deliverables && item.deliverables.length > 0 && (
                      <ul className="space-y-1.5">
                        {item.deliverables.map((point, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs font-bold text-[#111111] bg-[#FFFDF7] px-2.5 py-2 border-2 border-[#111111] rounded-lg"
                          >
                            <IconCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={`#${item.relatedProjectId || 'projects'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate?.('projects');
                        }}
                        className="brutalist-btn inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-[#FFD026] text-[#111111] border-2 border-[#111111] rounded-lg font-pixel text-[9px] font-bold uppercase"
                      >
                        <IconVhsTape className="w-3.5 h-3.5" />
                        <span>
                          {item.relatedProjectLabel || 'Jump to Project'}
                        </span>
                      </a>

                      <span className="font-script text-lg font-bold text-[#111111]">
                        Verified Track ★
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.article>
    );
  };

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative bg-blueprint-grid border-b-[4px] border-[#111111] py-16 sm:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-8">
        {/* Section Header + Board Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#1FD655] border-[3px] border-[#111111] rounded-full shadow-[6px_6px_0px_#111111] self-start">
            <IconTimeline className="w-5 h-5" />
            <h2
              id="experience-heading"
              className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight"
            >
              Experience & Education (Creator Pinboard)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Filter pinboard cards"
              className="flex items-center gap-1.5"
            >
              {[
                { id: 'all', label: 'All Pins (05)' },
                { id: 'work', label: 'Work Only' },
                { id: 'education', label: 'Education Only' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  aria-pressed={activeFilter === tab.id}
                  className={`px-3 py-2 min-h-[44px] border-2 border-[#111111] rounded-lg font-pixel text-[10px] font-bold uppercase shadow-[3px_3px_0px_#111111] ${
                    activeFilter === tab.id
                      ? 'bg-[#FFD026] text-[#111111]'
                      : 'bg-[#FFFDF7] text-[#111111] hover:bg-[#F2E5C6]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleTraceNext}
              className="brutalist-btn inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] bg-[#FF4D38] text-[#FFFDF7] border-2 border-[#111111] rounded-lg font-pixel text-[10px] font-bold uppercase"
            >
              <IconReboot className="w-3.5 h-3.5" />
              <span>TRACE NEXT PIN ▶</span>
            </button>

            <button
              type="button"
              onClick={() => handleExpandAllNotes(true)}
              className="px-3 py-2 min-h-[44px] bg-[#1FD655] text-[#111111] border-2 border-[#111111] rounded-lg font-pixel text-[10px] font-bold uppercase shadow-[3px_3px_0px_#111111] hover:bg-[#FFD026]"
            >
              OPEN ALL NOTES
            </button>

            <button
              type="button"
              onClick={() => handleExpandAllNotes(false)}
              className="px-3 py-2 min-h-[44px] bg-[#F2E5C6] text-[#111111] border-2 border-[#111111] rounded-lg font-pixel text-[10px] font-bold uppercase shadow-[3px_3px_0px_#111111] hover:bg-[#FF85B3]"
            >
              FOLD NOTES
            </button>
          </div>
        </div>

        {/* =====================================================================
            OPTION 3: CREATOR PINBOARD WITH INTERACTIVE ELASTIC CENTER-ALLEY CORDS
        ===================================================================== */}
        <div className="bg-[#E8C574] border-[4px] border-[#111111] rounded-3xl p-3 sm:p-5 shadow-[12px_12px_0px_#111111]">
          {/* Top Detective Board Status Strip */}
          <div className="bg-[#14181F] text-[#FFFDF7] border-[3px] border-[#111111] rounded-2xl px-4 py-3 mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF4D38] border-2 border-[#FFFDF7]" />
              <span className="font-pixel text-xs sm:text-sm text-[#FFD026]">
                ELASTIC_CORD_BOARD // SWIPE CURSOR ACROSS ANY RED CORD TO PLUCK IT
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {pluckedConnLabel ? (
                <span className="px-2.5 py-1 bg-[#1FD655] text-[#111111] border border-[#111111] rounded font-mono-code text-[11px] font-bold">
                  ★ PLUCKED: {pluckedConnLabel}
                </span>
              ) : (
                activeConnectionLabels.slice(0, 2).map((conn) => (
                  <span
                    key={conn.id}
                    className="px-2.5 py-1 bg-[#FF4D38] text-[#FFFDF7] border border-[#FFFDF7] rounded font-mono-code text-[11px] font-bold"
                  >
                    ★ {conn.label}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Inner Pinboard Canvas with Dedicated Center Alley for Red Cords */}
          <div
            ref={boardRef}
            onMouseMove={handleBoardMouseMove}
            onMouseLeave={handleBoardMouseLeave}
            className="relative bg-[#1B2028] border-[3px] border-[#111111] rounded-2xl px-4 sm:px-6 lg:px-8 py-7 sm:py-9 overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(rgba(242, 229, 198, 0.16) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* 2-Column Pinned Evidence Layout with single Center Alley (never use grid-cols-12 with large gap!) */}
            <div
              className={`relative z-20 grid grid-cols-1 gap-10 items-start ${
                activeFilter === 'all'
                  ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20'
                  : 'max-w-3xl mx-auto'
              }`}
            >
              {/* LEFT BOARD ZONE: Work & Web Experience (Pins on inner RIGHT edge) */}
              {showWork && (
                <div className="min-w-0 space-y-7">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-block px-4 sm:px-5 py-1.5 bg-[#1FD655] border-[3px] border-[#111111] rounded-full shadow-[4px_4px_0px_#111111] -rotate-1">
                      <h3 className="font-script text-xl sm:text-2xl xl:text-3xl font-bold text-[#111111]">
                        Work & Web Experience
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 bg-[#FFD026] border-2 border-[#111111] rounded font-pixel text-[10px] font-bold text-[#111111] shrink-0">
                      PINS ON RIGHT ▶
                    </span>
                  </div>

                  <div className="space-y-8">
                    {workItems.map((item) => renderPinnedCard(item))}
                  </div>
                </div>
              )}

              {/* RIGHT BOARD ZONE: Education & Certifications (Pins on inner LEFT edge) */}
              {showEdu && (
                <div
                  className={`min-w-0 space-y-7 ${
                    activeFilter === 'all' ? 'lg:mt-8' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-1 bg-[#19B5FE] border-2 border-[#111111] rounded font-pixel text-[10px] font-bold text-[#111111] shrink-0">
                      ◀ PINS ON LEFT
                    </span>
                    <div className="inline-block px-4 sm:px-5 py-1.5 bg-[#1FD655] border-[3px] border-[#111111] rounded-full shadow-[4px_4px_0px_#111111] rotate-1">
                      <h3 className="font-script text-xl sm:text-2xl xl:text-3xl font-bold text-[#111111]">
                        Education & Certifications
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {eduItems.map((edu) => renderPinnedCard(edu))}
                  </div>
                </div>
              )}
            </div>

            {/* FOREGROUND 60FPS ELASTIC SVG RED-STRING OVERLAY (z-30, stays in the Center Alley) */}
            <svg
              className="pointer-events-none absolute inset-0 w-full h-full z-30"
              aria-hidden="true"
            >
              {STRING_CONNECTIONS.map((conn) => (
                <g key={conn.id}>
                  {/* Solid dark ink cord casing */}
                  <path
                    ref={(el) => {
                      shadowPathRefs.current[conn.id] = el;
                    }}
                    fill="none"
                    stroke="#111111"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                  {/* Solid Opaque Red / Highlight Yellow Elastic Cord */}
                  <path
                    ref={(el) => {
                      mainPathRefs.current[conn.id] = el;
                    }}
                    fill="none"
                    stroke="#FF4D38"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Midpoint knot dot when active or plucked */}
                  <circle
                    ref={(el) => {
                      knotCircleRefs.current[conn.id] = el;
                    }}
                    r="5.5"
                    fill="#1FD655"
                    stroke="#111111"
                    strokeWidth="2.5"
                    style={{ display: 'none' }}
                  />
                </g>
              ))}

              {/* 3D Push-Pin Caps rendered right over the string ends at 60fps */}
              {allItems.map((item) => (
                <g
                  key={`cap-${item.id}`}
                  ref={(el) => {
                    pinGroupRefs.current[item.id] = el;
                  }}
                >
                  <circle
                    r="11.5"
                    fill="none"
                    stroke="#FF4D38"
                    strokeWidth="2.2"
                  />
                  <circle
                    r="9.5"
                    fill={item.pinColor}
                    stroke="#111111"
                    strokeWidth="2.5"
                  />
                  <circle cx="-2.5" cy="-2.5" r="2.8" fill="#FFFDF7" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
