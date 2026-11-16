import { Calendar, Clock, MapPin, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { parseCountdownTarget } from '../lib/scheduleParser';
import { type EventSettings, type Invitation } from '../types/invitation';

interface InfoCardsGridProps {
  settings: EventSettings;
  invitation: Invitation | null;
}

export function InfoCardsGrid({ settings, invitation }: InfoCardsGridProps) {
  const venueText = invitation?.customVenue || settings.defaultVenue || 'Sân trường THPT Quang Trung Đống Đa';
  const timeText = invitation?.customTime || settings.defaultTime || '14:00 – 17:00';
  const target = parseCountdownTarget(invitation?.customTime, settings);

  return (
    <section
      id="thong-tin"
      aria-label="Thông tin thời gian, địa điểm, lịch trình và liên hệ"
      className="mx-auto w-full max-w-[900px] px-4 py-[clamp(0.5rem,1.8vh,1.25rem)] sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.14 }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
      >
        {/* Ô 1: Thời gian (Tự chỉnh chữ HTML tại đây) */}
        <div className="hud-chamfer-md bg-gradient-to-br from-sky-300/55 via-blue-400/30 to-sky-300/55 p-[1.5px] drop-shadow-[0_0_18px_rgba(56,189,248,0.12)]">
          <div className="hud-chamfer-md-inner flex h-full items-center sm:items-start gap-3.5 bg-[#06122E]/90 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-md">
            <Calendar className="h-6 w-6 sm:mt-0.5 sm:h-7 sm:w-7 shrink-0 text-sky-300" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-medium text-slate-300">Thời gian</p>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base font-semibold text-white tabular-nums">
                {target.formattedDate} <span className="sm:hidden text-xs font-normal text-slate-300">({target.weekdayLabel})</span>
              </p>
              <p className="hidden sm:block mt-0.5 text-xs text-slate-300">({target.weekdayLabel})</p>
            </div>
          </div>
        </div>

        {/* Ô 2: Địa điểm (Tự chỉnh chữ HTML tại đây hoặc cập nhật trong Admin) */}
        <div className="hud-chamfer-md bg-gradient-to-br from-sky-300/55 via-blue-400/30 to-sky-300/55 p-[1.5px] drop-shadow-[0_0_18px_rgba(56,189,248,0.12)]">
          <div className="hud-chamfer-md-inner flex h-full items-center sm:items-start gap-3.5 bg-[#06122E]/90 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-md">
            <MapPin className="h-6 w-6 sm:mt-0.5 sm:h-7 sm:w-7 shrink-0 text-sky-300" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-medium text-slate-300">Địa điểm</p>
              <p className="mt-0.5 sm:mt-1 text-sm font-semibold leading-snug text-white">
                {venueText}
              </p>
            </div>
          </div>
        </div>

        {/* Ô 3: Lịch trình dự kiến / Thời gian mời riêng */}
        <div className="hud-chamfer-md bg-gradient-to-br from-sky-300/55 via-blue-400/30 to-sky-300/55 p-[1.5px] drop-shadow-[0_0_18px_rgba(56,189,248,0.12)]">
          <div className="hud-chamfer-md-inner flex h-full items-center sm:items-start gap-3.5 bg-[#06122E]/90 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-md">
            <Clock className="h-6 w-6 sm:mt-0.5 sm:h-7 sm:w-7 shrink-0 text-sky-300" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-medium text-slate-300">Lịch trình dự kiến</p>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base font-semibold text-white tabular-nums">
                {timeText}
              </p>
            </div>
          </div>
        </div>

        {/* Ô 4: Số điện thoại liên hệ (Tự chỉnh số HTML tại đây) */}
        <a
          href="tel:0338392009"
          className="group block hud-chamfer-md bg-gradient-to-br from-sky-300/55 via-blue-400/30 to-sky-300/55 p-[1.5px] drop-shadow-[0_0_18px_rgba(56,189,248,0.12)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <div className="hud-chamfer-md-inner flex h-full items-center sm:items-start gap-3.5 bg-[#06122E]/90 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-md group-hover:bg-[#08193D]/95 transition-colors">
            <Phone className="h-6 w-6 sm:mt-0.5 sm:h-7 sm:w-7 shrink-0 text-sky-300" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-medium text-slate-300">Liên hệ</p>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base font-semibold text-white tabular-nums group-hover:text-sky-200 transition-colors">
                0338392009
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Mai Trung Tú (Nhấn để gọi)</p>
            </div>
          </div>
        </a>
      </motion.div>
    </section>
  );
}
