import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { type EventSettings, type Invitation } from '../types/invitation';

interface CountdownHudProps {
  settings: EventSettings;
  invitation: Invitation | null;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function parseStartTime(timeStr: string): string {
  const match = timeStr.match(/(\d{1,2})\s*[:hH]\s*(\d{2})?/);
  if (!match) return '14:00:00';
  const hh = Math.min(23, Math.max(0, Number(match[1]))).toString().padStart(2, '0');
  const mm = Math.min(59, Math.max(0, Number(match[2] ?? '0'))).toString().padStart(2, '0');
  return `${hh}:${mm}:00`;
}

function calculateRemaining(targetMs: number): TimeRemaining {
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, expired: false };
}

export function CountdownHud({ settings, invitation }: CountdownHudProps) {
  const targetTimestamp = useMemo(() => {
    const datePart = settings.eventDate || '2026-11-29';
    const timeSource = invitation?.customTime || settings.defaultTime || '14:00';
    const timePart = parseStartTime(timeSource);
    const parsed = Date.parse(`${datePart}T${timePart}+07:00`);
    return Number.isNaN(parsed) ? Date.parse('2026-11-29T14:00:00+07:00') : parsed;
  }, [settings.eventDate, settings.defaultTime, invitation?.customTime]);

  const [remaining, setRemaining] = useState<TimeRemaining>(() =>
    calculateRemaining(targetTimestamp)
  );

  useEffect(() => {
    setRemaining(calculateRemaining(targetTimestamp));
    const timer = window.setInterval(() => {
      setRemaining(calculateRemaining(targetTimestamp));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [targetTimestamp]);

  const pad2 = (n: number) => n.toString().padStart(2, '0');

  const blocks = [
    { label: 'Ngày', value: String(remaining.days).padStart(2, '0') },
    { label: 'Giờ', value: pad2(remaining.hours) },
    { label: 'Phút', value: pad2(remaining.minutes) },
    { label: 'Giây', value: pad2(remaining.seconds) },
  ];

  return (
    <section
      aria-label="Đồng hồ đếm ngược đến ngày kỷ yếu"
      className="mx-auto max-w-[820px] px-4 py-3 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
      >
        {/* CHỈNH TIÊU ĐỀ ĐỒNG HỒ ĐẾM NGƯỢC TẠI ĐÂY */}
        <div className="mb-3 flex items-center justify-center gap-3">
          <span className="h-px max-w-[90px] flex-1 bg-gradient-to-r from-transparent to-sky-300/50" />
          <p className="font-[family-name:var(--font-display)] text-xs font-semibold tracking-[0.2em] text-sky-200/90 uppercase">
            ĐẾM NGƯỢC ĐẾN GIỜ HẸN
          </p>
          <span className="h-px max-w-[90px] flex-1 bg-gradient-to-l from-transparent to-sky-300/50" />
        </div>

        {remaining.expired ? (
          <div className="hud-chamfer-md bg-gradient-to-r from-sky-300/60 via-blue-400/35 to-sky-300/60 p-[1.5px]">
            <div className="hud-chamfer-md-inner bg-[#06122E]/90 px-6 py-4 text-center backdrop-blur-md">
              <p className="font-[family-name:var(--font-display)] text-base sm:text-lg font-bold text-sky-200">
                Ngày kỷ yếu đã tới! Hẹn gặp bạn tại điểm hẹn nhé ♡
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {blocks.map((item) => (
              <div
                key={item.label}
                className="hud-chamfer-md bg-gradient-to-br from-sky-300/55 via-blue-400/25 to-sky-300/55 p-[1.5px] drop-shadow-[0_0_16px_rgba(56,189,248,0.14)]"
              >
                <div className="hud-chamfer-md-inner flex flex-col items-center justify-center bg-[#06122E]/90 px-1.5 py-2.5 sm:px-2 sm:py-4 backdrop-blur-md">
                  <span className="font-[family-name:var(--font-display)] text-xl sm:text-4xl font-extrabold tracking-wider text-white tabular-nums drop-shadow-[0_0_14px_rgba(125,211,252,0.4)]">
                    {item.value}
                  </span>
                  <span className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-medium tracking-widest text-sky-200/80 uppercase">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
