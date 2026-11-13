import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portfolioData } from './data/portfolioData';
import CustomCursor from './components/ui/CustomCursor';
import RetroTaskbar from './components/ui/RetroTaskbar';
import HeroDeskSection from './components/sections/HeroDeskSection';
import AboutSection from './components/sections/AboutSection';
import ServicesSection from './components/sections/ServicesSection';
import SkillsSection from './components/sections/SkillsSection';
import ProjectsSection from './components/sections/ProjectsSection';
import ExperienceSection from './components/sections/ExperienceSection';
import ContactSection from './components/sections/ContactSection';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [isBooted, setIsBooted] = useState(false);
  const [activeSection, setActiveSection] = useState('desk');
  const [specsModalOpen, setSpecsModalOpen] = useState(false);

  const lenisRef = useRef(null);
  const scrollVelocityRef = useRef(0);
  const mainContentRef = useRef(null);

  // Initialize Lenis Smooth Scroll + Velocity Skew Effect
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    const skewSetter = mainContentRef.current
      ? gsap.quickTo(mainContentRef.current, 'skewY', {
          duration: 0.25,
          ease: 'power3.out',
        })
      : null;

    let resetTimeout;
    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      scrollVelocityRef.current = e.velocity || 0;
      if (skewSetter) {
        const clampedSkew = Math.max(-1.8, Math.min(1.8, (e.velocity || 0) * 0.06));
        skewSetter(clampedSkew);
        clearTimeout(resetTimeout);
        resetTimeout = setTimeout(() => {
          skewSetter(0);
          scrollVelocityRef.current = 0;
        }, 120);
      }
    });

    const update = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      clearTimeout(resetTimeout);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  // Track active section for RetroTaskbar highlight
  useEffect(() => {
    const sectionIds = [
      'desk',
      'about',
      'services',
      'skills',
      'projects',
      'experience',
      'contact',
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.22 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Close Rationale Modal on Escape key (R-32)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && specsModalOpen) {
        setSpecsModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [specsModalOpen]);

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    const targetEl = document.getElementById(sectionId);
    if (!targetEl) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetEl, { offset: 0 });
    } else {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#2074D4] text-[#111111] relative">
      {/* Context-Aware Custom Retro Cursor */}
      <CustomCursor />

      {/* Section 00: Sticky Retro OS Taskbar */}
      <RetroTaskbar
        activeSection={activeSection}
        isBooted={isBooted}
        onNavigate={handleNavigate}
        onOpenSpecsModal={() => setSpecsModalOpen(true)}
      />

      {/* Main Content Landmark */}
      <main id="main-content">
        {/* Section 01: Hero Creator's Desk & CRT Preloader */}
        <HeroDeskSection
          profile={{
            ...portfolioData.profile,
            systemVersion: portfolioData.meta.systemVersion,
          }}
          isBooted={isBooted}
          onBootComplete={() => setIsBooted(true)}
          onNavigate={handleNavigate}
        />

        {/* Scroll-Velocity Responsive OS World Container */}
        <div ref={mainContentRef} className="will-change-transform">
          {/* Section 02: About Me (Developer ID Card) */}
          <AboutSection
            profile={portfolioData.profile}
            experience={portfolioData.experience}
            education={portfolioData.education}
            skills={portfolioData.skills}
            scrollVelocityRef={scrollVelocityRef}
            onNavigate={handleNavigate}
          />

          {/* Section 03: Services / What I Do (System Modules) */}
          <ServicesSection
            services={portfolioData.services}
            onNavigate={handleNavigate}
          />

          {/* Section 04: Skills & Tech Stack (Control Panel + 2D Physics Box) */}
          <SkillsSection skills={portfolioData.skills} />

          {/* Section 05: Projects (Unified VHS Rack + Sticky Stacking Folder Bento) */}
          <ProjectsSection
            projects={portfolioData.projects}
            scrollVelocityRef={scrollVelocityRef}
          />

          {/* Section 06: Experience & Education (Career Timeline) */}
          <ExperienceSection
            experience={portfolioData.experience}
            education={portfolioData.education}
            onNavigate={handleNavigate}
          />
        </div>
      </main>

      {/* Section 07: Contact & Reboot Footer (Send_Message.exe) */}
      <ContactSection
        profile={portfolioData.profile}
        onRebootToTop={() => handleNavigate('desk')}
        onOpenSpecsModal={() => setSpecsModalOpen(true)}
      />

      {/* Accessible Design Decisions Log Modal (Antislop R-31) */}
      {specsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="specs-modal-title"
          className="fixed inset-0 z-[100] bg-[#111111]/75 flex items-center justify-center p-4"
          onClick={() => setSpecsModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#F2E5C6] border-[4px] border-[#111111] rounded-2xl shadow-[12px_12px_0px_#111111] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#FFD026] border-b-[3px] border-[#111111] px-5 py-3 flex items-center justify-between">
              <h2
                id="specs-modal-title"
                className="font-pixel text-xs sm:text-sm font-bold uppercase text-[#111111]"
              >
                SYSTEM_RATIONALE.TXT // ANTISLOP R-31 LOG
              </h2>
              <button
                type="button"
                onClick={() => setSpecsModalOpen(false)}
                aria-label="Close design rationale dialog"
                className="min-w-[40px] min-h-[40px] bg-[#FF4D38] text-[#FFFDF7] border-2 border-[#111111] rounded font-pixel text-xs font-bold"
              >
                X
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="font-mono-code text-xs font-bold bg-[#FFFDF7] p-3 border-2 border-[#111111] rounded-lg">
                {portfolioData.meta.designRead}
              </p>
              <dl className="space-y-3">
                {Object.entries(portfolioData.meta.decisionsLog).map(
                  ([key, reason]) => (
                    <div
                      key={key}
                      className="p-3 bg-[#FFFDF7] border-2 border-[#111111] rounded-xl"
                    >
                      <dt className="font-pixel text-[11px] font-bold uppercase text-[#1246B5]">
                        Why this {key}?
                      </dt>
                      <dd className="mt-1 text-xs sm:text-sm font-medium text-[#111111]">
                        {reason}
                      </dd>
                    </div>
                  )
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
