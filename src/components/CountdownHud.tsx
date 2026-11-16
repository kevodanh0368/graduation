import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { parseCountdownTarget } from '../lib/scheduleParser';
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
  const target = useMemo(
    () => parseCountdownTarget(invitation?.customTime, settings),
    [invitation?.customTime, settings]
  );

  const [remaining, setRemaining] = useState<TimeRemaining>(() =>
    calculateRemaining(target.timestampMs)
  );

  useEffect(() => {
    setRemaining(calculateRemaining(target.timestampMs));
    const timer = window.setInterval(() => {
      setRemaining(calculateRemaining(target.timestampMs));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [target.timestampMs]);

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
      className="mx-auto w-full max-w-[900px] px-4 py-[clamp(0.5rem,1.8vh,1.25rem)] sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.16 }}
      >
        {/* CHỈNH TIÊU ĐỀ ĐỒNG HỒ ĐẾM NGƯỢC TẠI ĐÂY */}
        <div className="mb-3 flex flex-col items-center gap-1">
          <div className="flex w-full items-center justify-center gap-3">
            <span className="h-px max-w-[90px] flex-1 bg-gradient-to-r from-transparent to-sky-300/50" />
            <p className="font-[family-name:var(--font-display)] text-xs font-semibold tracking-[0.2em] text-sky-200/90 uppercase">
              ĐẾM NGƯỢC ĐẾN GIỜ HẸN
            </p>
            <span className="h-px max-w-[90px] flex-1 bg-gradient-to-l from-transparent to-sky-300/50" />
          </div>
          <p className="font-mono text-[11px] sm:text-xs text-sky-300/80 tabular-nums">
            Mốc hẹn: {target.time24} · {target.formattedDate}
          </p>
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
                <div className="hud-chamfer-md-inner flex flex-col items-center justify-center bg-[#06122E]/90 px-1.5 py-[clamp(0.6rem,2vw,1.1rem)] sm:px-2 backdrop-blur-md">
                  <span className="font-[family-name:var(--font-display)] text-[clamp(1.35rem,3.8vw,2.35rem)] leading-none font-extrabold tracking-wider text-white tabular-nums drop-shadow-[0_0_14px_rgba(125,211,252,0.4)]">
                    {item.value}
                  </span>
                  <span className="mt-1 text-[10px] sm:text-xs font-medium tracking-widest text-sky-200/80 uppercase">
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
