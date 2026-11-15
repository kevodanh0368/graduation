import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Music, ShieldCheck } from 'lucide-react';

interface NavbarHudProps {
  mode: 'guest' | 'admin';
  activeSection: string;
  onSwitchMode: (nextMode: 'guest' | 'admin') => void;
  onNavigateSection: (sectionId: string) => void;
}

export function NavbarHud({
  mode,
  activeSection,
  onSwitchMode,
  onNavigateSection,
}: NavbarHudProps) {
  const [musicOn, setMusicOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
      }
    };
  }, []);

  function toggleAmbientMusic() {
    if (musicOn) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setMusicOn(false);
      return;
    }

    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      // Soft nostalgic piano-like pentatonic chime loop
      const notes = [523.25, 659.25, 783.99, 987.77, 783.99, 659.25];
      let step = 0;
      const playNote = () => {
        if (!audioCtxRef.current) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[step % notes.length], now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.035, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.5);
        step += 1;
      };

      playNote();
      timerRef.current = window.setInterval(playNote, 1500);
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  }

  const navItems = [
    { id: 'trang-chu', label: 'Trang chủ' },
    { id: 'thu-moi', label: 'Thư mời' },
    { id: 'thong-tin', label: 'Thông tin' },
    { id: 'xac-nhan', label: 'Xác nhận tham dự' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-sky-400/25 bg-[#030B20]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Biểu tượng mũ tốt nghiệp + Tên chủ nhân thiệp mời (Tự chỉnh chữ ở đây) */}
        <button
          type="button"
          onClick={() => {
            onSwitchMode('guest');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2.5 text-sm sm:text-base font-semibold tracking-wide text-slate-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm"
        >
          <GraduationCap className="h-5 w-5 text-sky-300" strokeWidth={1.75} />
          <span>Mai Trung Tú</span>
        </button>

        {/* Zone 2: 5 liên kết điều hướng chính */}
        <nav
          aria-label="Điều hướng thiệp mời"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-medium text-slate-300"
        >
          {navItems.map((item) => {
            const isActive = mode === 'guest' && activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateSection(item.id)}
                className={`relative py-2 whitespace-nowrap shrink-0 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm ${
                  isActive ? 'text-white font-semibold' : ''
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[9px] h-[2px] bg-gradient-to-r from-transparent via-sky-300 to-transparent shadow-[0_0_10px_rgba(125,211,252,0.9)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Âm nhạc nền (nút quay lại chỉ hiện khi đang ở /admin) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleAmbientMusic}
            aria-label={musicOn ? 'Tắt nhạc nền nhẹ' : 'Bật nhạc nền nhẹ'}
            title={musicOn ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
              musicOn
                ? 'border-sky-400/60 bg-sky-400/15 text-sky-300'
                : 'border-transparent text-slate-300 hover:border-sky-400/30 hover:text-white'
            }`}
          >
            <Music className="h-4 w-4" />
          </button>

          {mode === 'admin' && (
            <>
              <span aria-hidden="true" className="h-4 w-px bg-slate-700" />
              <button
                type="button"
                onClick={() => onSwitchMode('guest')}
                aria-label="Quay lại thiệp mời"
                title="Xem Thiệp Mời"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-sky-400/70 bg-sky-400/20 px-2.5 py-1.5 text-xs font-medium text-sky-200 whitespace-nowrap shrink-0 transition-colors hover:bg-sky-400/30"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
                <span>Thiệp mời</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
