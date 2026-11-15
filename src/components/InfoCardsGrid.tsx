import { Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { type EventSettings, type Invitation } from '../types/invitation';

interface InfoCardsGridProps {
  settings: EventSettings;
  invitation: Invitation | null;
}

export function InfoCardsGrid({ settings, invitation }: InfoCardsGridProps) {
  const venueText = invitation?.customVenue || settings.defaultVenue || 'Sân trường THPT Quang Trung Đống Đa';
  const timeText = invitation?.customTime || settings.defaultTime || '14:00 – 17:00';

  return (
    <section
      id="thong-tin"
      aria-label="Thông tin thời gian, địa điểm và lịch trình"
      className="mx-auto max-w-[820px] px-4 py-4 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.14 }}
        className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3"
      >
        {/* Ô 1: Thời gian (Tự chỉnh chữ HTML tại đây) */}
        <div className="hud-chamfer-md bg-gradient-to-br from-sky-300/55 via-blue-400/30 to-sky-300/55 p-[1.5px] drop-shadow-[0_0_18px_rgba(56,189,248,0.12)]">
          <div className="hud-chamfer-md-inner flex h-full items-center sm:items-start gap-3.5 bg-[#06122E]/90 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-md">
            <Calendar className="h-6 w-6 sm:mt-0.5 sm:h-7 sm:w-7 shrink-0 text-sky-300" strokeWidth={1.6} />
            <div>
              <p className="text-xs font-medium text-slate-300">Thời gian</p>
              <p className="mt-0.5 sm:mt-1 text-sm sm:text-base font-semibold text-white tabular-nums">
                29/11/2026 <span className="sm:hidden text-xs font-normal text-slate-300">(Chủ Nhật)</span>
              </p>
              <p className="hidden sm:block mt-0.5 text-xs text-slate-300">(Chủ Nhật)</p>
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
      </motion.div>
    </section>
  );
}
