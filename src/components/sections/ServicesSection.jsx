import React, { useState } from 'react';
import BrutalistCard from '../ui/BrutalistCard';
import { IconModules } from '../ui/RetroIcons';

export default function ServicesSection({ services, onNavigate }) {
  const [expandedMap, setExpandedMap] = useState({
    'Module_01.exe': true,
    'Module_02.exe': true,
    'Module_03.exe': true,
    'Module_04.exe': true,
  });

  const toggleModule = (id) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="relative bg-blueprint-grid border-b-[4px] border-[#111111] py-16 sm:py-24"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Section Header Pill */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#1FD655] border-[3px] border-[#111111] rounded-full shadow-[6px_6px_0px_#111111] self-start">
            <IconModules className="w-5 h-5" />
            <h2
              id="services-heading"
              className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight"
            >
              What I Build (Web Services)
            </h2>
          </div>
          <p className="font-mono-code text-xs sm:text-sm font-bold text-[#FFFDF7] bg-[#111111] px-3 py-1.5 rounded border-2 border-[#FFFDF7] self-start sm:self-auto">
            SYSTEM_MODULES // 04 ACTIVE EXECUTABLES
          </p>
        </div>

        {/* Asymmetric 12-Col Grid (7/5 and 5/7 split so cards vary in hierarchy per R-14) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {services.map((service, index) => {
            const colSpan =
              index === 0 || index === 3 ? 'lg:col-span-7' : 'lg:col-span-5';
            const isExpanded = expandedMap[service.id] !== false;

            return (
              <BrutalistCard
                key={service.id}
                bg=""
                style={{ backgroundColor: service.bg }}
                className={`${colSpan} overflow-hidden p-0 flex flex-col justify-between`}
              >
                {/* Classic OS Window Title Bar */}
                <div
                  style={{ backgroundColor: service.headerBg }}
                  className="border-b-[3px] border-[#111111] px-4 py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-[#111111] inline-block" />
                    <span className="font-pixel text-xs font-bold text-[#111111]">
                      {service.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block px-2 py-0.5 bg-[#FFFDF7] border border-[#111111] font-mono-code text-[10px] font-bold">
                      {service.tag}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleModule(service.id)}
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? `Collapse ${service.title} deliverables`
                          : `Expand ${service.title} deliverables`
                      }
                      className="min-w-[36px] min-h-[36px] px-2 bg-[#FFFDF7] border-2 border-[#111111] font-mono-code text-xs font-bold hover:bg-[#111111] hover:text-[#FFFDF7]"
                    >
                      {isExpanded ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Window Content Body */}
                <div className="p-5 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-[#111111] mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#111111] leading-relaxed font-medium">
                      {service.description}
                    </p>
                  </div>

                  {isExpanded && (
                    <div className="pt-2 border-t-2 border-[#111111]/20">
                      <div className="font-mono-code text-[11px] font-bold uppercase text-[#111111] mb-2">
                        Key Deliverables:
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {service.deliverables.map((item) => (
                          <li
                            key={item}
                            className="px-3 py-2 bg-[#FFFDF7] border-2 border-[#111111] rounded-lg font-heading text-xs font-bold text-[#111111] shadow-[2px_2px_0px_#111111]"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </BrutalistCard>
            );
          })}
        </div>

        {/* Bottom Action Prompt */}
        <div className="mt-10 flex justify-end">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('contact');
            }}
            className="brutalist-btn inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-[#FFD026] text-[#111111] border-[3px] border-[#111111] rounded-xl font-pixel text-xs font-bold uppercase"
          >
            <span>Request Custom Web Scope</span>
          </a>
        </div>
      </div>
    </section>
  );
}
