import { motion } from 'motion/react';

export function HeroTitleSection() {
  return (
    <section
      id="trang-chu"
      className="relative mx-auto w-full max-w-[900px] px-4 pt-[clamp(1.25rem,4vh,3rem)] pb-[clamp(0.75rem,2vh,1.75rem)] sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Lớp quét Radar hàng không (SVG circular gradient xoay nhẹ toàn vùng Hero) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden mix-blend-screen opacity-75"
      >
        <svg
          viewBox="0 0 600 600"
          className="h-[min(92vw,500px)] w-[min(92vw,500px)] sm:h-[640px] sm:w-[640px] max-w-none"
        >
          <defs>
            <radialGradient id="hero-radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.08)" />
              <stop offset="65%" stopColor="rgba(56, 189, 248, 0.03)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
            </radialGradient>
            <linearGradient id="hero-radar-wedge" x1="0%" y1="0%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.24)" />
              <stop offset="45%" stopColor="rgba(34, 211, 238, 0.1)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
            </linearGradient>
            <linearGradient id="hero-radar-beam" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.05)" />
              <stop offset="70%" stopColor="rgba(125, 211, 252, 0.45)" />
              <stop offset="100%" stopColor="rgba(186, 230, 253, 0.65)" />
            </linearGradient>
          </defs>

          {/* Vùng nền radar mờ & các vòng đồng tâm HUD */}
          <circle cx="300" cy="300" r="280" fill="url(#hero-radar-glow)" />
          <circle
            cx="300"
            cy="300"
            r="260"
            fill="none"
            stroke="rgba(56, 189, 248, 0.12)"
            strokeWidth="1"
            strokeDasharray="3 9"
          />
          <circle
            cx="300"
            cy="300"
            r="175"
            fill="none"
            stroke="rgba(56, 189, 248, 0.09)"
            strokeWidth="1"
          />
          <circle
            cx="300"
            cy="300"
            r="90"
            fill="none"
            stroke="rgba(56, 189, 248, 0.08)"
            strokeWidth="0.8"
          />

          {/* Trục tâm chữ thập mờ */}
          <line x1="20" y1="300" x2="580" y2="300" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="1" />
          <line x1="300" y1="20" x2="300" y2="580" stroke="rgba(56, 189, 248, 0.06)" strokeWidth="1" />

          {/* Tia quét Radar xoay 360 độ */}
          <g className="animate-radar-sweep" style={{ transformOrigin: '300px 300px' }}>
            <path
              d="M 300 300 L 300 40 A 260 260 0 0 1 525 170 Z"
              fill="url(#hero-radar-wedge)"
            />
            <line
              x1="300"
              y1="300"
              x2="300"
              y2="40"
              stroke="url(#hero-radar-beam)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="395" cy="145" r="2.5" fill="rgba(165, 243, 252, 0.65)" />
            <circle cx="395" cy="145" r="6" fill="rgba(56, 189, 248, 0.2)" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 items-center gap-3 sm:gap-6 md:grid-cols-12">
        {/* Khối Tiêu Đề Chính + Vòng Quỹ Đạo Phát Sáng (Tự chỉnh chữ HTML tại đây) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative md:col-span-8 flex flex-col items-center md:items-start text-center md:text-left md:pl-6"
        >
          {/* Vòng quỹ đạo nghiêng bao quanh chữ KỶ YẾU */}
          <svg
            aria-hidden="true"
            viewBox="0 0 520 190"
            className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 md:translate-x-0 md:-left-4 md:-top-5 w-[min(84vw,430px)] h-auto animate-orbit-drift opacity-90"
          >
            <defs>
              <linearGradient id="title-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(125, 211, 252, 0.15)" />
                <stop offset="50%" stopColor="rgba(125, 211, 252, 0.85)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
              </linearGradient>
            </defs>
            <ellipse
              cx="255"
              cy="96"
              rx="236"
              ry="68"
              transform="rotate(-11 255 96)"
              fill="none"
              stroke="url(#title-orbit)"
              strokeWidth="1.4"
            />
            {/* Ngôi sao sáng trên quỹ đạo */}
            <path
              d="M442 46 L445 55 L454 58 L445 61 L442 70 L439 61 L430 58 L439 55 Z"
              fill="#E0F2FE"
            />
          </svg>

          {/* CHỈNH DÒNG TIÊU ĐỀ NHỎ TẠI ĐÂY */}
          <p className="relative z-10 font-[family-name:var(--font-display)] text-[clamp(0.75rem,1.4vw,1rem)] font-semibold tracking-[0.28em] text-sky-100/90 uppercase">
            THIỆP MỜI
          </p>

          {/* CHỈNH TIÊU ĐỀ CHÍNH KỶ YẾU TẠI ĐÂY */}
          <h1 className="relative z-10 mt-0.5 sm:mt-1 font-[family-name:var(--font-display)] text-[clamp(2.35rem,6.2vw,4.1rem)] leading-[1.06] font-extrabold italic tracking-wide bg-gradient-to-b from-white via-sky-100 to-sky-300 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(96,165,250,0.45)]">
            KỶ YẾU
          </h1>

          {/* CHỈNH CÂU TRÍCH DẪN VIẾT TAY TẠI ĐÂY */}
          <p className="relative z-10 mt-2.5 sm:mt-3 font-[family-name:var(--font-script)] text-[clamp(1.2rem,2.4vw,1.75rem)] leading-snug text-slate-100/95 sm:-rotate-2">
            “Thanh xuân ấy,
            <br />
            chúng ta đã cùng nhau viết nên...”
          </p>
        </motion.div>

        {/* Góc Phải: Dòng Chữ Viết Tay Tiếng Anh (Tự chỉnh chữ HTML tại đây) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-4 flex flex-col items-center md:items-end justify-center"
        >
          <div className="text-center md:text-right sm:-rotate-3">
            {/* CHỈNH DÒNG CHỮ GÓC PHẢI TẠI ĐÂY */}
            <p className="font-[family-name:var(--font-script)] text-[clamp(1.1rem,2.3vw,1.75rem)] leading-tight text-slate-200/85">
              See you{' '}
              <br className="hidden md:inline" />
              at our last chapter <span aria-hidden="true">♡</span>
            </p>
            <svg
              aria-hidden="true"
              viewBox="0 0 220 18"
              className="mx-auto md:ml-auto md:mr-0 mt-1 h-2.5 sm:h-3.5 w-36 sm:w-44 text-sky-200/65"
            >
              <path
                d="M 6 12 Q 110 2 214 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
