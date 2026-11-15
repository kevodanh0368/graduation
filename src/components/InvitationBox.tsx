import { User } from 'lucide-react';
import { motion } from 'motion/react';
import { type EventSettings, type Invitation } from '../types/invitation';
import { TypingText } from './TypingText';

interface InvitationBoxProps {
  settings: EventSettings;
  invitation: Invitation | null;
  loadingInvite: boolean;
}

export function InvitationBox({
  settings,
  invitation,
  loadingInvite,
}: InvitationBoxProps) {
  const salutationText = invitation?.salutation || 'Trân trọng kính mời';
  const closingMessage =
    invitation?.personalNote ||
    settings.hostMessage ||
    'Cùng nhau, hãy lưu giữ những khoảnh khắc cuối cùng trên hành trình thanh xuân này nhé!';

  return (
    <section
      id="thu-moi"
      className="mx-auto w-full max-w-[900px] px-4 py-[clamp(0.5rem,1.8vh,1.25rem)] sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="relative drop-shadow-[0_0_32px_rgba(56,189,248,0.22)]"
      >
        {/* Điểm sáng góc trên giữa & dưới phải giống hiệu ứng khung kính HUD */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 left-1/2 h-4 w-44 -translate-x-1/2 rounded-full bg-sky-300/45 blur-md"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-2 right-6 h-5 w-24 rounded-full bg-sky-300/40 blur-md"
        />

        {/* Viền phát sáng vát góc bát giác (Chamfered HUD Border) */}
        <div className="hud-chamfer-lg bg-gradient-to-br from-sky-200/80 via-blue-400/35 to-sky-300/80 p-[1.5px]">
          <div className="hud-chamfer-lg-inner relative bg-[#06122E]/90 px-[clamp(1.125rem,4vw,3rem)] py-[clamp(1.35rem,3.5vw,2.5rem)] backdrop-blur-md">
            {/* Lưới mờ bên trong khung Thư mời */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hud-micro-grid opacity-35"
            />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Tiêu đề THƯ MỜI với hai gạch ngang hai bên */}
              <div className="flex w-full max-w-xs items-center justify-center gap-4">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-300/60" />
                <h2 className="font-[family-name:var(--font-display)] text-sm sm:text-lg font-bold tracking-[0.18em] text-white uppercase">
                  THƯ MỜI
                </h2>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-300/60" />
              </div>

              {/* CHỈNH DÒNG LỜI MỞ ĐẦU TẠI ĐÂY */}
              <p className="mt-4 sm:mt-5 text-[clamp(0.9rem,1.8vw,1.125rem)] font-medium text-slate-100">
                {loadingInvite ? 'Đang tải thiệp mời...' : salutationText}
              </p>

              {/* Ô HIỂN THỊ TÊN NGƯỜI ĐƯỢC MỜI (Chỉ đọc — Tên lấy tự động từ link riêng /moi/<id> hoặc ?guest=<id>) */}
              <div className="mt-3 sm:mt-4 w-full max-w-[540px]">
                <div className="hud-chamfer-pill bg-gradient-to-r from-sky-300/75 via-blue-400/50 to-sky-300/75 p-[1.5px] shadow-[0_0_24px_rgba(56,189,248,0.22)]">
                  <div className="hud-chamfer-pill-inner flex min-h-[46px] sm:min-h-[54px] items-center justify-center gap-2.5 sm:gap-3 bg-[#081A40]/95 px-5 sm:px-7 py-2">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-sky-300" />
                    <div className="min-w-0 text-center font-[family-name:var(--font-display)] font-bold text-[clamp(1rem,2.2vw,1.3rem)] tracking-wide text-white break-words">
                      {loadingInvite ? (
                        <span className="text-sm font-medium text-sky-200/80">
                          Đang tải tên khách mời...
                        </span>
                      ) : invitation ? (
                        <TypingText
                          text={invitation.guestName}
                          speedMs={40}
                          delayMs={180}
                          cursorClassName="bg-sky-300"
                        />
                      ) : (
                        /* CHỈNH TÊN HIỂN THỊ MẶC ĐỊNH KHI CHƯA MỞ LINK RIÊNG TẠI ĐÂY */
                        <span>Bạn & Người thân</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CHỈNH NỘI DUNG LỜI MỜI CHÍNH TẠI ĐÂY */}
              <p className="mt-4 sm:mt-6 max-w-md text-sm sm:text-lg leading-relaxed text-slate-100">
                Bạn tới tham dự buổi chụp ảnh kỷ yếu
                <br />
                của <span className="font-semibold text-sky-200">Mai Trung Tú</span> nhé!
              </p>

              {/* Đường kẻ phân cách với ngôi sao 4 cánh */}
              <div className="my-4 sm:my-5 flex w-full max-w-sm items-center justify-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-300/50" />
                <span aria-hidden="true" className="text-sky-200 text-xs sm:text-sm">
                  ✦
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-300/50" />
              </div>

              {/* CHỈNH LỜI NHẮN KẾT THƯ MỜI TẠI ĐÂY */}
              <p className="max-w-lg text-xs sm:text-base italic leading-relaxed text-slate-200/90">
                {closingMessage} <span aria-hidden="true">♡</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
