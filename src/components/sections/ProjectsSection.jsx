import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'framer-motion';
import MarqueeBanner from '../ui/MarqueeBanner';
import {
  IconVhsTape,
  IconGlobe,
  IconCodeRepo,
  IconMonitor,
  IconMobile,
  IconCheck,
  IconArrowUpRight,
  IconReboot,
} from '../ui/RetroIcons';

// Deterministic SVG QR-like Matrix Generator for Project URLs
function ProjectQrCode({ value = 'https://example.com' }) {
  const size = 9;
  const cells = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000003;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isCorner =
        (r < 3 && c < 3) ||
        (r < 3 && c >= size - 3) ||
        (r >= size - 3 && c < 3);
      const bit = isCorner
        ? r === 1 && c === 1
          ? true
          : r === 0 || r === 2 || c === 0 || c === 2
        : ((hash >> ((r * size + c) % 20)) + r * 3 + c * 7) % 2 === 0;
      if (bit) {
        cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#111111" />);
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="68"
      height="68"
      shapeRendering="crispEdges"
      className="w-16 h-16 bg-[#FFFDF7] p-1.5 border-2 border-[#111111] rounded"
      role="img"
      aria-label={`QR code for ${value}`}
    >
      {cells}
    </svg>
  );
}

// 3D Accordion Panel Variants for Option 2 (VCR Deck Slot -> Accordion Folder Unfold)
const folderEnvelopeVariants = {
  collapsed: {
    opacity: 0,
    rotateX: -68,
    scaleY: 0.25,
    y: -36,
    transformOrigin: 'top center',
  },
  unfolded: {
    opacity: 1,
    rotateX: 0,
    scaleY: 1,
    y: 0,
    transformOrigin: 'top center',
    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1],
      when: 'beforeChildren',
      staggerChildren: 0.12,
    },
  },
  exit: {
    opacity: 0,
    rotateX: 45,
    scaleY: 0.65,
    y: -20,
    transformOrigin: 'top center',
    transition: {
      duration: 0.24,
      ease: 'easeIn',
    },
  },
};

const foldCreaseVariants = {
  collapsed: {
    opacity: 0,
    rotateX: -52,
    y: -24,
    transformOrigin: 'top center',
  },
  unfolded: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transformOrigin: 'top center',
    transition: {
      duration: 0.46,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function ProjectsSection({ projects, scrollVelocityRef }) {
  const vhsRackRef = useRef(null);
  const miniTvRef = useRef(null);
  const vcrBridgeRef = useRef(null);
  const tapeRefs = useRef([]);

  const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id || 'project-01');
  const [deckStage, setDeckStage] = useState('loaded'); // 'inserting' | 'unfolding' | 'loaded'
  const [unfoldCycle, setUnfoldCycle] = useState(0);
  const [showAllStacked, setShowAllStacked] = useState(false);

  const [hoveredProject, setHoveredProject] = useState(null);
  const [tapeOffsets, setTapeOffsets] = useState(() => projects.map(() => 0));
  const [copiedHex, setCopiedHex] = useState(null);
  const [viewModes, setViewModes] = useState(() =>
    projects.reduce((acc, p) => {
      acc[p.id] = 'desktop';
      return acc;
    }, {})
  );
  const [previewScrolls, setPreviewScrolls] = useState(() =>
    projects.reduce((acc, p) => {
      acc[p.id] = false;
      return acc;
    }, {})
  );

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];
  const activeIndex = projects.findIndex((p) => p.id === activeProject.id);

  // Floating Mini-CRT Follower using gsap.quickTo
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReduced || isCoarse || !miniTvRef.current) return;

    const xTo = gsap.quickTo(miniTvRef.current, 'x', {
      duration: 0.35,
      ease: 'back.out(1.5)',
    });
    const yTo = gsap.quickTo(miniTvRef.current, 'y', {
      duration: 0.35,
      ease: 'back.out(1.5)',
    });

    const handleRackMove = (e) => {
      xTo(e.clientX + 26);
      yTo(e.clientY - 70);

      // Proximity Wave calculation across VHS spines
      const nextOffsets = tapeRefs.current.map((tapeEl) => {
        if (!tapeEl) return 0;
        const rect = tapeEl.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const dist = Math.abs(e.clientY - centerY);
        if (dist < 42) return 36;
        if (dist < 105) return 18;
        if (dist < 165) return 8;
        return 0;
      });
      setTapeOffsets(nextOffsets);
    };

    const rackEl = vhsRackRef.current;
    if (rackEl) {
      rackEl.addEventListener('mousemove', handleRackMove, { passive: true });
    }
    return () => {
      if (rackEl) {
        rackEl.removeEventListener('mousemove', handleRackMove);
      }
    };
  }, [projects]);

  const handleResetWave = () => {
    setHoveredProject(null);
    setTapeOffsets(projects.map(() => 0));
  };

  // Option 2 Sequence: Pull Tape from Rack -> Insert into VCR Slot -> Accordion Unfold Folder
  const loadTapeIntoVcrDeck = (projectId, shouldScrollToDeck = true) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setShowAllStacked(false);

    if (shouldScrollToDeck && vcrBridgeRef.current) {
      vcrBridgeRef.current.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
      });
    }

    if (prefersReduced) {
      setActiveProjectId(projectId);
      setDeckStage('loaded');
      setUnfoldCycle((c) => c + 1);
      return;
    }

    setDeckStage('inserting');
    setActiveProjectId(projectId);

    setTimeout(() => {
      setDeckStage('unfolding');
      setUnfoldCycle((c) => c + 1);
    }, 320);

    setTimeout(() => {
      setDeckStage('loaded');
    }, 950);
  };

  const handleStepTape = (direction) => {
    const nextIdx = (activeIndex + direction + projects.length) % projects.length;
    loadTapeIntoVcrDeck(projects[nextIdx].id, false);
  };

  const handleCopyHex = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    } catch {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  const renderFolderCaseStudy = (project, index, isAccordionMode = true) => {
    const currentView = viewModes[project.id] || 'desktop';
    const isAutoScrolled = previewScrolls[project.id] || false;
    const stickyTop = 18 + index * 14;

    const CardWrapper = isAccordionMode ? motion.div : 'div';
    const rowProps = isAccordionMode ? { variants: foldCreaseVariants } : {};

    return (
      <article
        key={isAccordionMode ? `${project.id}-${unfoldCycle}` : project.id}
        id={project.id}
        style={!isAccordionMode ? { top: `${stickyTop}px` } : undefined}
        aria-label={`Project ${project.number}: ${project.title}`}
        className={isAccordionMode ? 'relative z-10' : 'sticky z-10 transition-transform duration-300'}
      >
        {/* FOLDER TOP TABS BAR (01 to 05 clickable tabs matching Ref 1) */}
        <div className="flex items-end justify-between gap-2 overflow-x-auto no-scrollbar pr-2">
          <div className="flex items-end gap-1.5">
            {projects.map((tabProj) => {
              const isCurrent = tabProj.id === project.id;
              return (
                <button
                  key={tabProj.id}
                  type="button"
                  onClick={() => loadTapeIntoVcrDeck(tabProj.id, false)}
                  aria-label={`Load Project Tape ${tabProj.number} into VCR Deck`}
                  aria-current={isCurrent ? 'true' : undefined}
                  style={{
                    backgroundColor: isCurrent
                      ? project.folderTabColor
                      : '#E8C574',
                  }}
                  className={`px-6 sm:px-9 py-2.5 min-h-[44px] rounded-t-2xl border-t-[4px] border-x-[4px] border-[#111111] font-bungee text-base sm:text-xl transition-transform ${
                    isCurrent
                      ? 'text-[#111111] translate-y-[3px] z-20'
                      : 'text-[#111111]/75 hover:bg-[#FFD026]'
                  }`}
                >
                  {tabProj.number}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 pb-2">
            <span className="px-3 py-1 bg-[#FFFDF7] border-2 border-[#111111] rounded-full font-pixel text-[10px] font-bold">
              FILE #{project.number} UNFOLDED FROM VCR DECK
            </span>
          </div>
        </div>

        {/* MAIN FOLDER BODY CONTAINER WITH 3D ACCORDION UNFOLD */}
        <motion.div
          variants={isAccordionMode ? folderEnvelopeVariants : undefined}
          initial={isAccordionMode ? 'collapsed' : false}
          animate={isAccordionMode ? 'unfolded' : undefined}
          exit={isAccordionMode ? 'exit' : undefined}
          style={{ perspective: 1400 }}
          className="bg-[#2074D4] bg-blueprint-grid border-[4px] border-[#111111] rounded-b-3xl rounded-tr-3xl shadow-[12px_12px_0px_#111111] p-4 sm:p-7 space-y-6 origin-top"
        >
          {/* Top Paper Fold Crease Bar */}
          <div
            className="flex items-center justify-between px-3 py-1.5 bg-[#E8C574] border-2 border-[#111111] rounded-lg font-mono-code text-[11px] font-bold text-[#111111]"
            aria-hidden="true"
          >
            <span>FOLD_PANEL_01 // IDENTITY & OVERVIEW</span>
            <span>TAPE SOURCE: VHS_{project.number}</span>
          </div>

          {/* ROW 1: Identity Logo Card (Left) + Project Brief, QR & Actions (Right) */}
          <CardWrapper
            {...rowProps}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch origin-top"
          >
            {/* Left Box: 4-Quadrant Pop-Art Project Logo */}
            <div className="lg:col-span-3 bg-[#F2E5C6] border-[3px] border-[#111111] rounded-2xl p-5 shadow-[6px_6px_0px_#111111] flex flex-col items-center justify-center">
              <div className="w-28 h-28 grid grid-cols-2 grid-rows-2 border-[3px] border-[#111111] rounded-2xl overflow-hidden shadow-[4px_4px_0px_#111111]">
                <div
                  style={{ backgroundColor: project.logoColors[0] }}
                  className="flex items-center justify-center font-bungee text-2xl text-[#FFFDF7] border-r-2 border-b-2 border-[#111111]"
                >
                  {project.logoText[0]}
                </div>
                <div
                  style={{ backgroundColor: project.logoColors[1] }}
                  className="flex items-center justify-center border-b-2 border-[#111111]"
                >
                  <IconGlobe className="w-6 h-6" />
                </div>
                <div
                  style={{ backgroundColor: project.logoColors[2] }}
                  className="flex items-center justify-center border-r-2 border-[#111111]"
                >
                  <IconMonitor className="w-6 h-6" />
                </div>
                <div
                  style={{ backgroundColor: project.logoColors[3] }}
                  className="flex items-center justify-center font-bungee text-2xl text-[#111111]"
                >
                  {project.logoText[1]}
                </div>
              </div>
              <span className="mt-3 font-mono-code text-[11px] font-bold text-[#111111]">
                APP ICON // {project.logoText}
              </span>
            </div>

            {/* Right Box: Project Brief + QR Code + Action Buttons */}
            <div className="lg:col-span-9 bg-[#F2E5C6] border-[3px] border-[#111111] rounded-2xl overflow-hidden shadow-[6px_6px_0px_#111111] flex flex-col justify-between">
              <div className="h-4 bg-[#FFD026] border-b-[3px] border-[#111111]" />
              <div className="p-5 sm:p-6 flex flex-col justify-between gap-5 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 bg-[#FFFDF7] border-2 border-[#111111] rounded-full font-pixel text-[10px] font-bold uppercase">
                      {project.badge}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111]">
                      {project.title}
                    </h3>
                    <p className="font-mono-code text-xs font-bold text-[#111111]/80">
                      {project.categoryYear}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-0.5 bg-[#FFD026] border-2 border-[#111111] rounded-md font-mono-code text-xs font-bold text-[#111111]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top-Right QR Code */}
                  <div className="flex items-center gap-3 self-start shrink-0 bg-[#FFFDF7] p-2 border-2 border-[#111111] rounded-xl shadow-[3px_3px_0px_#111111]">
                    <ProjectQrCode value={project.liveUrl} />
                    <div className="text-[10px] font-mono-code font-bold leading-tight max-w-[82px]">
                      SCAN FOR MOBILE URL
                    </div>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-[#111111] leading-relaxed font-medium">
                  {project.challengeSolution}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="brutalist-btn inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-[#FFD026] text-[#111111] border-[2.5px] border-[#111111] rounded-xl font-pixel text-xs font-bold uppercase"
                  >
                    <IconGlobe className="w-4 h-4" />
                    <span>VISIT LIVE SITE</span>
                    <IconArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="brutalist-btn inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-[#FFFDF7] text-[#111111] border-[2.5px] border-[#111111] rounded-xl font-pixel text-xs font-bold uppercase"
                  >
                    <IconCodeRepo className="w-4 h-4" />
                    <span>GITHUB REPO</span>
                  </a>
                </div>
              </div>
            </div>
          </CardWrapper>

          {/* Accordion Fold Crease Divider 02 */}
          <div
            className="border-t-[3px] border-dashed border-[#111111]/60 pt-2 flex items-center justify-between font-mono-code text-[10px] font-bold text-[#FFFDF7]"
            aria-hidden="true"
          >
            <span>▲ FOLD_LINE_02 // DESIGN & TECHNICAL SPECIFICATIONS</span>
            <span>180° FLAT</span>
          </div>

          {/* ROW 2: 3 Design & Technical Spec Cards */}
          <CardWrapper
            {...rowProps}
            className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch origin-top"
          >
            {/* Card 1: TYPOGRAPHY */}
            <div className="md:col-span-4 bg-[#F2E5C6] border-[3px] border-[#111111] rounded-2xl p-5 shadow-[6px_6px_0px_#111111] flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-[#FFFDF7] border-2 border-[#111111] rounded-full font-pixel text-[10px] font-bold uppercase mb-4">
                  TYPOGRAPHY
                </span>
                <div className="space-y-3">
                  <div className="border-b-2 border-[#111111]/20 pb-3">
                    <div className="font-heading text-xl sm:text-2xl font-extrabold text-[#111111] leading-tight">
                      {project.typography.headingFont}
                    </div>
                    <div className="font-mono-code text-xs text-[#111111]/75 mt-0.5">
                      {project.typography.headingWeight} (Headlines)
                    </div>
                  </div>
                  <div>
                    <div className="font-sans text-lg font-bold text-[#111111]">
                      {project.typography.bodyFont}
                    </div>
                    <div className="font-mono-code text-xs text-[#111111]/75">
                      {project.typography.bodyRole}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-[#111111]/20 font-mono-code text-[11px] font-bold">
                Aa Bb Cc Dd // 0123456789
              </div>
            </div>

            {/* Card 2: COLOR PALETTE */}
            <div className="md:col-span-5 bg-[#F2E5C6] border-[3px] border-[#111111] rounded-2xl p-5 shadow-[6px_6px_0px_#111111] flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-block px-3 py-1 bg-[#FFFDF7] border-2 border-[#111111] rounded-full font-pixel text-[10px] font-bold uppercase">
                  COLOR PALETTE
                </span>
                <span className="font-mono-code text-[10px] font-bold text-[#111111]">
                  CLICK SWATCH TO COPY HEX
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 h-36">
                {project.palette.map((swatch) => (
                  <button
                    key={swatch.hex}
                    type="button"
                    data-cursor="hex"
                    data-cursor-label={`[ COPY ${swatch.hex} ]`}
                    onClick={() => handleCopyHex(swatch.hex)}
                    aria-label={`Copy color ${swatch.name} ${swatch.hex} to clipboard`}
                    style={{ backgroundColor: swatch.hex }}
                    className={`h-full border-2 border-[#111111] rounded-xl p-2 flex flex-col justify-between text-left transition-transform hover:-translate-y-1 shadow-[2px_2px_0px_#111111] ${
                      swatch.textDark ? 'text-[#111111]' : 'text-[#FFFDF7]'
                    }`}
                  >
                    <span className="font-heading text-[10px] font-extrabold leading-tight">
                      {swatch.name}
                    </span>
                    <span className="font-mono-code text-[10px] font-bold uppercase">
                      {swatch.hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: HIGHLIGHT & MASCOT */}
            <div className="md:col-span-3 bg-[#F2E5C6] border-[3px] border-[#111111] rounded-2xl p-5 shadow-[6px_6px_0px_#111111] flex flex-col items-center justify-between text-center">
              <span className="inline-block px-3 py-1 bg-[#FFFDF7] border-2 border-[#111111] rounded-full font-pixel text-[10px] font-bold uppercase">
                HIGHLIGHT
              </span>

              <svg
                viewBox="0 0 120 110"
                className="w-24 h-24 my-2 drop-shadow-[4px_4px_0px_#111111]"
                aria-hidden="true"
              >
                <path
                  d="M60 12 C78 12, 96 28, 96 52 C96 74, 82 92, 60 92 C38 92, 24 74, 24 52 C24 28, 42 12, 60 12 Z"
                  fill={project.highlight.mascotColor}
                  stroke="#111111"
                  strokeWidth="3.5"
                />
                <circle cx="48" cy="46" r="4" fill="#111111" />
                <circle cx="72" cy="46" r="4" fill="#111111" />
                <path
                  d="M48 60 Q60 70 72 60"
                  stroke="#111111"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <rect
                  x="36"
                  y="88"
                  width="18"
                  height="12"
                  rx="4"
                  fill="#19B5FE"
                  stroke="#111111"
                  strokeWidth="3"
                />
                <rect
                  x="66"
                  y="88"
                  width="18"
                  height="12"
                  rx="4"
                  fill="#19B5FE"
                  stroke="#111111"
                  strokeWidth="3"
                />
              </svg>

              <div>
                <div className="font-heading text-xs font-extrabold text-[#111111]">
                  {project.highlight.badgeText}
                </div>
                <div className="font-mono-code text-[10px] text-[#111111]/75 mt-0.5">
                  {project.highlight.metricLabel}
                </div>
              </div>
            </div>
          </CardWrapper>

          {/* Accordion Fold Crease Divider 03 */}
          <div
            className="border-t-[3px] border-dashed border-[#111111]/60 pt-2 flex items-center justify-between font-mono-code text-[10px] font-bold text-[#FFFDF7]"
            aria-hidden="true"
          >
            <span>▲ FOLD_LINE_03 // INTERACTIVE BROWSER & UI FLOWS</span>
            <span>LIVE VIEWPORT</span>
          </div>

          {/* ROW 3 & 4: INTERACTIVE WEBSITE MOCKUP BENTO */}
          <CardWrapper
            {...rowProps}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch origin-top"
          >
            {/* Main Interactive Browser Preview (8 cols) */}
            <div className="lg:col-span-8 bg-[#FFFDF7] border-[3px] border-[#111111] rounded-2xl overflow-hidden shadow-[6px_6px_0px_#111111] flex flex-col">
              <div className="bg-[#D6D3CE] border-b-[3px] border-[#111111] px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 rounded-full bg-[#FF4D38] border border-[#111111]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFD026] border border-[#111111]" />
                  <span className="w-3 h-3 rounded-full bg-[#1FD655] border border-[#111111]" />
                  <span className="ml-1 px-2.5 py-1 bg-[#FFFDF7] border-2 border-[#111111] rounded font-mono-code text-[11px] font-bold truncate max-w-[200px] sm:max-w-[280px]">
                    {project.liveUrl}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setViewModes((prev) => ({
                        ...prev,
                        [project.id]: 'desktop',
                      }))
                    }
                    aria-pressed={currentView === 'desktop'}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] border-2 border-[#111111] rounded font-pixel text-[10px] font-bold uppercase ${
                      currentView === 'desktop'
                        ? 'bg-[#FFD026] text-[#111111]'
                        : 'bg-[#FFFDF7] text-[#111111]'
                    }`}
                  >
                    <IconMonitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewModes((prev) => ({
                        ...prev,
                        [project.id]: 'mobile',
                      }))
                    }
                    aria-pressed={currentView === 'mobile'}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] border-2 border-[#111111] rounded font-pixel text-[10px] font-bold uppercase ${
                      currentView === 'mobile'
                        ? 'bg-[#FFD026] text-[#111111]'
                        : 'bg-[#FFFDF7] text-[#111111]'
                    }`}
                  >
                    <IconMobile className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewScrolls((prev) => ({
                        ...prev,
                        [project.id]: !prev[project.id],
                      }))
                    }
                    aria-pressed={isAutoScrolled}
                    className="px-2.5 py-1.5 min-h-[38px] bg-[#1FD655] text-[#111111] border-2 border-[#111111] rounded font-pixel text-[10px] font-bold uppercase hover:bg-[#FFD026]"
                  >
                    {isAutoScrolled ? 'TOP ↑' : 'SCROLL ↓'}
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-[#1B2028] flex-1 flex items-center justify-center">
                <div
                  className={`bg-[#FFFDF7] border-[3px] border-[#111111] rounded-xl overflow-hidden transition-all duration-300 ${
                    currentView === 'mobile'
                      ? 'w-[310px] max-w-full'
                      : 'w-full'
                  }`}
                >
                  <div className="h-[270px] overflow-y-auto p-4 sm:p-5 space-y-4">
                    <div
                      className={`space-y-4 transition-transform duration-700 ease-in-out ${
                        isAutoScrolled ? '-translate-y-28' : 'translate-y-0'
                      }`}
                    >
                      <div
                        style={{ backgroundColor: project.spineBg }}
                        className="p-4 sm:p-5 border-2 border-[#111111] rounded-xl shadow-[4px_4px_0px_#111111]"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-[#FFFDF7] border border-[#111111] font-pixel text-[9px] font-bold">
                            {currentView.toUpperCase()} VIEWPORT
                          </span>
                          <span className="font-mono-code text-[10px] font-bold">
                            [REPLACE WITH SCREENSHOT IN public/]
                          </span>
                        </div>
                        <h4 className="font-heading text-lg sm:text-xl font-extrabold text-[#111111]">
                          {project.previewScreens.heroHeadline}
                        </h4>
                        <p className="font-sans text-xs text-[#111111] mt-1 font-medium">
                          {project.previewScreens.heroSub}
                        </p>
                      </div>

                      <div
                        className={`grid gap-3 ${
                          currentView === 'mobile'
                            ? 'grid-cols-1'
                            : 'grid-cols-3'
                        }`}
                      >
                        {project.previewScreens.cards.map((c) => (
                          <div
                            key={c.title}
                            style={{ backgroundColor: c.bg }}
                            className="p-3 border-2 border-[#111111] rounded-lg shadow-[3px_3px_0px_#111111]"
                          >
                            <div className="font-heading text-xs font-extrabold text-[#111111]">
                              {c.title}
                            </div>
                            <div className="font-mono-code text-[10px] text-[#111111] mt-1">
                              {c.tag}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-[#F2E5C6] border-2 border-[#111111] rounded-lg flex items-center justify-between">
                        <span className="font-mono-code text-xs font-bold text-[#111111]">
                          Interactive Live Prototype Ready
                        </span>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          data-cursor="mockup"
                          className="px-3 py-1 bg-[#FFD026] border border-[#111111] rounded font-pixel text-[10px] font-bold"
                        >
                          OPEN URL ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Companion Feature Cards (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4 justify-between">
              {project.previewScreens.cards.map((feature, fIdx) => (
                <div
                  key={feature.title}
                  style={{ backgroundColor: feature.bg }}
                  className="flex-1 border-[3px] border-[#111111] rounded-2xl p-4 shadow-[6px_6px_0px_#111111] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-[#FFFDF7] border-2 border-[#111111] rounded-full font-pixel text-[10px] font-bold">
                      FEATURE 0{fIdx + 1}
                    </span>
                    <span className="font-mono-code text-[10px] font-bold text-[#111111]">
                      UI FLOW
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-heading text-base font-extrabold text-[#111111]">
                      {feature.title}
                    </h4>
                    <p className="font-mono-code text-xs font-bold text-[#111111]/85 mt-0.5">
                      {feature.tag}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardWrapper>
        </motion.div>
      </article>
    );
  };

  return (
    <section
      id="projects"
      aria-labelledby="projects-vhs-heading"
      className="relative border-b-[4px] border-[#111111]"
    >
      {/* Floating Copy HEX Notification Toast */}
      {copiedHex && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-[90] flex items-center gap-2 px-4 py-2.5 bg-[#1FD655] text-[#111111] border-[3px] border-[#111111] rounded-xl shadow-[6px_6px_0px_#111111] font-pixel text-xs font-bold"
        >
          <IconCheck className="w-4 h-4" />
          <span>HEX COPIED: {copiedHex}</span>
        </div>
      )}

      {/* =====================================================================
          SUB-SECTION 5A: THE VHS RACK (PROJECT SELECTOR)
      ===================================================================== */}
      <div
        ref={vhsRackRef}
        onMouseLeave={handleResetWave}
        className="relative bg-[#1B2028] text-[#FFFDF7] pt-14 sm:pt-20 pb-12 px-4 sm:px-8 overflow-hidden"
      >
        {/* Floating Mini-TV CRT Follower */}
        <div
          ref={miniTvRef}
          aria-hidden="true"
          className={`pointer-events-none fixed top-0 left-0 z-50 w-[260px] transition-opacity duration-200 hidden md:block ${
            hoveredProject ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {hoveredProject && (
            <div className="bg-[#F2E5C6] border-[3px] border-[#111111] rounded-2xl p-2.5 shadow-[8px_8px_0px_#111111]">
              <div className="flex items-center justify-between text-[9px] font-pixel text-[#111111] mb-1.5 px-1">
                <span>MINI-CRT // CH_{hoveredProject.number}</span>
                <span className="px-1.5 py-0.5 bg-[#1FD655] border border-[#111111]">
                  LIVE PREVIEW
                </span>
              </div>
              <div className="relative aspect-[16/10] bg-[#1246B5] border-2 border-[#111111] rounded-lg p-2.5 text-[#FFFDF7] flex flex-col justify-between overflow-hidden">
                <div className="crt-scanlines pointer-events-none absolute inset-0" />
                <div className="relative z-10 flex items-center justify-between">
                  <span
                    style={{ backgroundColor: hoveredProject.spineBg }}
                    className="px-1.5 py-0.5 border border-[#111111] font-pixel text-[9px] font-bold text-[#111111]"
                  >
                    #{hoveredProject.number}
                  </span>
                  <span className="font-mono-code text-[9px] text-[#FFD026]">
                    {hoveredProject.techStack.slice(0, 2).join(' • ')}
                  </span>
                </div>
                <div className="relative z-10 my-auto">
                  <div className="font-heading text-xs font-extrabold leading-snug text-[#FFFDF7]">
                    {hoveredProject.title}
                  </div>
                  <p className="font-mono-code text-[9px] text-[#F2E5C6] mt-1 line-clamp-2">
                    {hoveredProject.previewScreens.heroHeadline}
                  </p>
                </div>
                <div className="relative z-10 text-[9px] font-pixel text-[#FFD026]">
                  CLICK TO INSERT INTO VCR DECK ↓
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD026] text-[#111111] border-2 border-[#111111] rounded-full font-pixel text-[11px] font-bold uppercase mb-3">
                <IconVhsTape className="w-4 h-4" />
                <span>SUB-SECTION 5A // THE VHS ARCHIVE RACK</span>
              </span>
              <h2
                id="projects-vhs-heading"
                className="font-heading text-3xl sm:text-4xl font-extrabold text-[#FFFDF7] tracking-tight"
              >
                Select a VHS Tape to Load Case Study
              </h2>
            </div>
            <p className="font-mono-code text-xs text-[#F2E5C6] max-w-xs">
              Click any VHS tape below: it loads into the VCR Deck Reader at the bottom of the rack and unfolds its Case Study Folder.
            </p>
          </div>

          {/* Stack of VHS Cassette Spines matching Ref 1 */}
          <div className="flex flex-col gap-3.5">
            {projects.map((project, idx) => {
              const isLoadedInDeck = project.id === activeProjectId;
              const waveX = tapeOffsets[idx] || 0;
              const zigZagClass =
                idx % 2 === 0 ? 'sm:ml-0 sm:mr-12' : 'sm:ml-10 sm:mr-2';

              return (
                <button
                  key={project.id}
                  ref={(el) => {
                    tapeRefs.current[idx] = el;
                  }}
                  type="button"
                  data-cursor="vhs"
                  data-cursor-label={`[ INSERT TAPE ${project.number} ]`}
                  onMouseEnter={() => setHoveredProject(project)}
                  onFocus={() => setHoveredProject(project)}
                  onClick={() => loadTapeIntoVcrDeck(project.id, true)}
                  style={{
                    transform: `translate3d(${
                      isLoadedInDeck ? Math.max(waveX, 24) : waveX
                    }px, 0, 0)`,
                  }}
                  className={`group relative w-full ${zigZagClass} min-h-[76px] sm:min-h-[88px] border-[3px] rounded-xl p-2 sm:p-3 shadow-[6px_6px_0px_#000000] transition-all duration-200 ease-out flex items-center justify-between gap-3 text-left ${
                    isLoadedInDeck
                      ? 'bg-[#252D3A] border-[#1FD655] ring-2 ring-[#1FD655]'
                      : 'bg-[#14181F] border-[#111111] hover:border-[#FFD026]'
                  }`}
                >
                  {/* Left VHS Stamp */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-12 h-full border-r-2 border-[#FFFDF7]/15 pr-2 shrink-0">
                    <span className="font-pixel text-[10px] font-bold text-[#F2E5C6] [writing-mode:vertical-rl] rotate-180">
                      {isLoadedInDeck ? 'IN DECK' : 'VHS HI-FI'}
                    </span>
                  </div>

                  {/* Center Colorful Spine Label */}
                  <div
                    style={{ backgroundColor: project.spineBg }}
                    className="flex-1 h-full min-h-[56px] border-[2.5px] border-[#111111] rounded-lg px-3 sm:px-5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.25)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        style={{ backgroundColor: project.spineAccent }}
                        className="px-2.5 py-1 border-2 border-[#111111] rounded font-pixel text-sm sm:text-base font-bold text-[#111111] shrink-0"
                      >
                        {project.number}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bungee text-sm sm:text-xl text-[#111111] tracking-wide truncate">
                          {project.vhsTitle}
                        </div>
                        <div className="font-mono-code text-[10px] sm:text-xs font-bold text-[#111111]/80 truncate">
                          {project.vhsSubtitle}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-1.5 shrink-0">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 bg-[#FFFDF7] border border-[#111111] rounded font-mono-code text-[10px] font-bold text-[#111111]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right VHS Status Pill */}
                  <div className="flex items-center gap-2.5 pl-1 shrink-0" aria-hidden="true">
                    {isLoadedInDeck ? (
                      <span className="px-2.5 py-1 bg-[#1FD655] text-[#111111] border-2 border-[#111111] rounded font-pixel text-[9px] font-bold">
                        LOADED IN VCR ▼
                      </span>
                    ) : (
                      <>
                        <span
                          style={{ backgroundColor: project.spineAccent }}
                          className="w-7 h-7 rounded-full border-2 border-[#111111] flex items-center justify-center font-pixel text-xs font-bold text-[#111111]"
                        >
                          ★
                        </span>
                        <span className="hidden sm:inline font-pixel text-[10px] text-[#FFD026] pr-1">
                          INSERT ↓
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          SUB-SECTION 5B: VCR DECK SLOT BRIDGE + ACCORDION FOLDER SHOWCASE
      ===================================================================== */}
      <div
        ref={vcrBridgeRef}
        className="relative bg-blueprint-grid pb-24 scroll-mt-4"
      >
        <MarqueeBanner
          items={[
            'SELECTED WEB PROJECTS',
            'VCR CASE READER ACTIVE',
            'SELECTED WEB PROJECTS',
            'BENTO SPECIFICATIONS',
          ]}
          bg="bg-[#FFD026]"
          textColor="text-[#111111]"
          tilt="rotate-0"
          scrollVelocityRef={scrollVelocityRef}
        />

        <div className="max-w-[1280px] mx-auto px-3 sm:px-8 pt-10">
          {/* MECHANICAL VCR DECK SLOT BRIDGE (Connects 5A VHS Tapes -> 5B Unfolding Folder) */}
          <div className="bg-[#D6D3CE] border-[4px] border-[#111111] rounded-2xl p-4 sm:p-5 shadow-[10px_10px_0px_#111111] mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Left VCR Status Screen */}
              <div className="lg:col-span-3 bg-[#14181F] text-[#1FD655] border-[3px] border-[#111111] rounded-xl p-3 font-mono-code text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#FFD026]">
                  <span>VCR_DECK // READER_95</span>
                  <span>HI-FI STEREO</span>
                </div>
                <div className="font-pixel text-xs sm:text-sm text-[#1FD655] truncate">
                  {deckStage === 'inserting'
                    ? `INSERTING TAPE #${activeProject.number}...`
                    : deckStage === 'unfolding'
                    ? `UNFOLDING FILE #${activeProject.number}...`
                    : `CH_${activeProject.number} // READY`}
                </div>
                <div className="text-[10px] text-[#F2E5C6]">
                  {showAllStacked
                    ? 'MODE: ALL 05 FOLDERS STACKED'
                    : 'MODE: SINGLE TAPE ACCORDION'}
                </div>
              </div>

              {/* Center Mechanical VCR Cassette Slot (Shows Tape Dropping In) */}
              <div className="lg:col-span-5 bg-[#1B2028] border-[3px] border-[#111111] rounded-xl p-2.5 relative overflow-hidden">
                <div className="text-[9px] font-pixel text-[#F2E5C6]/70 mb-1 flex items-center justify-between px-1">
                  <span>▼ CASSETTE LOADING SLOT</span>
                  <span>LOCKED: TAPE #{activeProject.number}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeProject.id}-${unfoldCycle}`}
                    initial={{ y: -56, scale: 0.9, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 36, scale: 0.94, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 22,
                    }}
                    style={{ backgroundColor: activeProject.spineBg }}
                    className="border-[2.5px] border-[#111111] rounded-lg px-3 py-2 flex items-center justify-between gap-2 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3)]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        style={{ backgroundColor: activeProject.spineAccent }}
                        className="px-2 py-0.5 border-2 border-[#111111] rounded font-pixel text-xs font-bold text-[#111111] shrink-0"
                      >
                        {activeProject.number}
                      </span>
                      <span className="font-bungee text-xs sm:text-sm text-[#111111] truncate">
                        {activeProject.vhsTitle}
                      </span>
                    </div>

                    {/* VHS Reel Wheels */}
                    <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                      <span
                        className={`w-5 h-5 rounded-full bg-[#14181F] border-2 border-[#FFFDF7] flex items-center justify-center ${
                          deckStage !== 'loaded' ? 'animate-spin' : ''
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD026]" />
                      </span>
                      <span
                        className={`w-5 h-5 rounded-full bg-[#14181F] border-2 border-[#FFFDF7] flex items-center justify-center ${
                          deckStage !== 'loaded' ? 'animate-spin' : ''
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD026]" />
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right VCR Transport Controls (Prev / Next / Replay Unfold / Stack All) */}
              <div className="lg:col-span-4 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleStepTape(-1)}
                  aria-label="Load previous VHS project tape"
                  className="brutalist-btn px-3 py-2 min-h-[44px] bg-[#FFFDF7] text-[#111111] border-2 border-[#111111] rounded-xl font-pixel text-[10px] font-bold uppercase"
                >
                  ◀ PREV
                </button>

                <button
                  type="button"
                  onClick={() => handleStepTape(1)}
                  aria-label="Load next VHS project tape"
                  className="brutalist-btn px-3 py-2 min-h-[44px] bg-[#FFD026] text-[#111111] border-2 border-[#111111] rounded-xl font-pixel text-[10px] font-bold uppercase"
                >
                  NEXT ▶
                </button>

                <button
                  type="button"
                  onClick={() => loadTapeIntoVcrDeck(activeProject.id, false)}
                  aria-label="Replay folder unfold animation"
                  className="brutalist-btn inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] bg-[#1FD655] text-[#111111] border-2 border-[#111111] rounded-xl font-pixel text-[10px] font-bold uppercase"
                >
                  <IconReboot className="w-3.5 h-3.5" />
                  <span>UNFOLD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAllStacked((prev) => !prev)}
                  aria-pressed={showAllStacked}
                  className="brutalist-btn px-3 py-2 min-h-[44px] bg-[#FF85B3] text-[#111111] border-2 border-[#111111] rounded-xl font-pixel text-[10px] font-bold uppercase"
                >
                  {showAllStacked ? 'DECK VIEW' : 'STACK ALL 05'}
                </button>
              </div>
            </div>
          </div>

          {/* UNFOLDING FOLDER STAGE (Option 2 Default) OR ALL STACKED FOLDERS */}
          {!showAllStacked ? (
            <AnimatePresence mode="wait">
              {renderFolderCaseStudy(activeProject, activeIndex, true)}
            </AnimatePresence>
          ) : (
            <div className="space-y-16">
              {projects.map((project, idx) =>
                renderFolderCaseStudy(project, idx, false)
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
