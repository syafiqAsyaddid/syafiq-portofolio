import React, { useEffect, useRef, useState } from 'react';
import {
  IconWindowFlag,
  IconMonitor,
  IconUserCard,
  IconModules,
  IconControlSliders,
  IconVhsTape,
  IconTimeline,
  IconMail,
  IconReboot,
} from './RetroIcons';

const NAV_ITEMS = [
  { id: 'desk', label: 'Desk', href: '#desk', Icon: IconMonitor },
  { id: 'about', label: 'About', href: '#about', Icon: IconUserCard },
  { id: 'services', label: 'Services', href: '#services', Icon: IconModules },
  { id: 'skills', label: 'Skills', href: '#skills', Icon: IconControlSliders },
  { id: 'projects', label: 'Projects', href: '#projects', Icon: IconVhsTape },
  { id: 'experience', label: 'Experience', href: '#experience', Icon: IconTimeline },
  { id: 'contact', label: 'Contact', href: '#contact', Icon: IconMail },
];

export default function RetroTaskbar({
  activeSection = 'desk',
  isBooted = true,
  onNavigate,
  onOpenSpecsModal,
}) {
  const [clock, setClock] = useState('');
  const [startOpen, setStartOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && startOpen) {
        setStartOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setStartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [startOpen]);

  return (
    <header
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${
        isBooted ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <nav
        aria-label="Retro OS System Taskbar"
        ref={menuRef}
        className="relative bg-[#D6D3CE] border-t-[3px] border-[#111111] px-2 sm:px-4 py-1.5 shadow-[0_-4px_0px_#111111]"
      >
        {/* Start Menu Popup */}
        {startOpen && (
          <div
            role="dialog"
            aria-label="Start Menu"
            className="absolute bottom-full left-2 mb-2 w-72 bg-[#D6D3CE] border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] flex overflow-hidden"
          >
            <div className="w-9 bg-[#1246B5] text-[#FFFDF7] flex items-end justify-center py-3 border-r-[2px] border-[#111111]">
              <span className="font-pixel text-xs tracking-widest uppercase [writing-mode:vertical-rl] rotate-180">
                RETRO_OS v26
              </span>
            </div>
            <div className="flex-1 p-2 space-y-1">
              <div className="px-2 py-1 text-[11px] font-mono-code font-bold text-[#111111]/70 border-b border-[#111111]/20">
                SYSTEM SHORTCUTS
              </div>
              {NAV_ITEMS.map(({ id, label, href, Icon }) => (
                <a
                  key={id}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    setStartOpen(false);
                    onNavigate(id);
                  }}
                  className="flex items-center gap-2.5 px-2.5 py-2 min-h-[44px] rounded text-xs font-heading font-bold text-[#111111] hover:bg-[#FFD026] border border-transparent hover:border-[#111111]"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>Open {label}</span>
                </a>
              ))}
              <div className="border-t-2 border-[#111111] pt-1 mt-1 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setStartOpen(false);
                    onOpenSpecsModal?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 min-h-[44px] rounded text-left text-xs font-heading font-bold text-[#111111] hover:bg-[#1FD655] border border-transparent hover:border-[#111111]"
                >
                  <IconModules className="w-4 h-4 shrink-0" />
                  <span>System Architecture & Rationale</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartOpen(false);
                    onNavigate('desk');
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 min-h-[44px] rounded text-left text-xs font-heading font-bold text-[#111111] hover:bg-[#FF4D38] hover:text-[#FFFDF7] border border-transparent hover:border-[#111111]"
                >
                  <IconReboot className="w-4 h-4 shrink-0" />
                  <span>Reboot to Top CRT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2">
          {/* Start Button + Section Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setStartOpen((prev) => !prev)}
              aria-expanded={startOpen}
              aria-haspopup="dialog"
              className={`flex items-center gap-2 px-3 py-1.5 min-h-[44px] font-pixel text-xs font-bold uppercase shrink-0 ${
                startOpen ? 'retro-bevel-active bg-[#FFD026]' : 'retro-bevel hover:bg-[#FFD026]'
              }`}
            >
              <IconWindowFlag className="w-4 h-4" />
              <span>Start</span>
            </button>

            <div className="h-6 w-[2px] bg-[#111111]/30 mx-0.5 shrink-0" aria-hidden="true" />

            {NAV_ITEMS.map(({ id, label, href, Icon }) => {
              const isActive = activeSection === id;
              return (
                <a
                  key={id}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(id);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[44px] text-xs font-heading font-bold shrink-0 transition-colors ${
                    isActive
                      ? 'retro-bevel-active bg-[#FFD026] text-[#111111]'
                      : 'retro-bevel hover:bg-[#F2E5C6] text-[#111111]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline">{label}</span>
                </a>
              );
            })}
          </div>

          {/* System Status Tray & Live Clock */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('contact');
              }}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 min-h-[44px] bg-[#F2E5C6] border-2 border-[#111111] text-[11px] font-mono-code font-bold text-[#111111] hover:bg-[#1FD655]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full bg-[#1FD655] border border-[#111111]"
                aria-hidden="true"
              />
              <span>AVAILABLE FOR WORK</span>
            </a>

            <div
              className="retro-bevel-active px-2.5 py-1.5 min-h-[44px] flex items-center bg-[#FFFDF7] font-mono-code text-xs font-bold text-[#111111]"
              aria-label={`System time ${clock}`}
            >
              {clock || '10:30 AM'}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
