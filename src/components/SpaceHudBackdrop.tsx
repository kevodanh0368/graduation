import { Plane } from 'lucide-react';

export function SpaceHudBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Deep Cosmic Navy Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0C2352_0%,#050E27_45%,#020614_100%)]" />

      {/* Subtle Digital Micro Grid */}
      <div className="absolute inset-0 hud-micro-grid opacity-60" />

      {/* Sweeping Glowing Orbital Light Curves & Starlight */}
      <svg
        viewBox="0 0 1440 1200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-80"
      >
        <defs>
          <radialGradient id="nebula-left" cx="15%" cy="55%" r="45%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.22)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </radialGradient>
          <radialGradient id="nebula-right" cx="88%" cy="82%" r="45%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
          <linearGradient id="arc-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
            <stop offset="50%" stopColor="rgba(125, 211, 252, 0.55)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </linearGradient>
        </defs>

        <rect width="1440" height="1200" fill="url(#nebula-left)" />
        <rect width="1440" height="1200" fill="url(#nebula-right)" />

        {/* Orbital curves matching the reference visual */}
        <path
          d="M -120 410 Q 520 560 1560 210"
          fill="none"
          stroke="url(#arc-glow)"
          strokeWidth="1.2"
        />
        <path
          d="M -80 860 Q 680 1050 1540 720"
          fill="none"
          stroke="url(#arc-glow)"
          strokeWidth="1.8"
        />
        <ellipse
          cx="1160"
          cy="520"
          rx="420"
          ry="210"
          transform="rotate(-14 1160 520)"
          fill="none"
          stroke="rgba(96, 165, 250, 0.16)"
          strokeWidth="1"
        />
        <ellipse
          cx="220"
          cy="680"
          rx="340"
          ry="160"
          transform="rotate(18 220 680)"
          fill="none"
          stroke="rgba(96, 165, 250, 0.14)"
          strokeWidth="1"
        />

        {/* Digital HUD pixel squares */}
        <rect x="115" y="420" width="8" height="8" fill="rgba(125, 211, 252, 0.45)" />
        <rect x="132" y="438" width="5" height="5" fill="rgba(125, 211, 252, 0.35)" />
        <rect x="1285" y="460" width="9" height="9" fill="rgba(96, 165, 250, 0.45)" />
        <rect x="1310" y="445" width="5" height="5" fill="rgba(147, 197, 253, 0.5)" />
        <rect x="1190" y="880" width="7" height="7" fill="rgba(125, 211, 252, 0.4)" />

        {/* Subtle star glints */}
        <circle cx="240" cy="180" r="1.5" fill="#E0F2FE" opacity="0.7" />
        <circle cx="1180" cy="210" r="1.8" fill="#BAE6FD" opacity="0.75" />
        <circle cx="960" cy="790" r="1.5" fill="#E0F2FE" opacity="0.65" />
        <circle cx="380" cy="960" r="1.5" fill="#BAE6FD" opacity="0.6" />
      </svg>

      {/* Low-opacity cruising airplane along sky trajectory */}
      <div className="absolute left-0 top-[22%] animate-plane-cruise">
        <div className="flex items-center gap-2 text-sky-300/50">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-sky-300/40" />
          <Plane className="h-4 w-4" strokeWidth={1.6} />
        </div>
      </div>
    </div>
  );
}
