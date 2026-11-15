import { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { submitGuestRsvp, submitPublicRsvp } from '../lib/firebase';
import {
  FIELD_LIMITS,
  type Invitation,
} from '../types/invitation';

interface RsvpActionBlockProps {
  invitation: Invitation | null;
}

export function RsvpActionBlock({ invitation }: RsvpActionBlockProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [choice, setChoice] = useState<'attending' | 'declined'>('attending');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publicSubmitted, setPublicSubmitted] = useState<{
    guestName: string;
    rsvpStatus: 'attending' | 'declined';
    guestMessage: string;
  } | null>(null);

  async function handlePersonalizedSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invitation) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await submitGuestRsvp(invitation.id, choice, 0, message);
    } catch {
      setErrorMsg('Không thể lưu xác nhận lúc này. Vui lòng thử lại sau giây lát.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublicSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fallbackName = 'Khách mời';
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await submitPublicRsvp({
        guestName: fallbackName,
        groupLabel: 'Trang chung',
        rsvpStatus: choice,
        companionCount: 0,
        guestMessage: message,
      });
      setPublicSubmitted({
        guestName: 'bạn',
        rsvpStatus: choice,
        guestMessage: message.trim(),
      });
    } catch {
      setErrorMsg('Không thể gửi xác nhận lúc này. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  const isPersonalizedConfirmed = invitation && invitation.rsvpStatus !== 'pending';
  const confirmedData = isPersonalizedConfirmed
    ? {
        guestName: invitation.guestName,
        rsvpStatus: invitation.rsvpStatus as 'attending' | 'declined',
        guestMessage: invitation.guestMessage,
      }
    : publicSubmitted;

  return (
    <section id="xac-nhan" className="mx-auto max-w-[920px] px-4 pt-5 pb-8 sm:px-6">
      {/* Nút Xác nhận tham dự hình lục giác phát sáng */}
      <div className="flex flex-col items-center">
        <div className="flex w-full max-w-md items-center justify-center gap-4">
          <span className="hidden sm:block h-px flex-1 bg-gradient-to-r from-transparent to-sky-300/40" />
          <button
            type="button"
            onClick={() => setFormOpen((prev) => !prev)}
            className="group hud-chamfer-pill bg-gradient-to-r from-sky-200 via-blue-400 to-sky-200 p-[1.5px] shadow-[0_0_26px_rgba(96,165,250,0.45)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <span className="hud-chamfer-pill-inner flex min-h-[48px] items-center justify-center gap-3 bg-[#091D48] px-8 py-2.5 text-sm sm:text-base font-semibold text-white group-hover:bg-[#0D2760] transition-colors whitespace-nowrap">
              <CheckCircle2 className="h-5 w-5 text-sky-200" />
              <span>
                {confirmedData ? 'Đã gửi phản hồi' : 'Xác nhận tham dự'}
              </span>
              <ArrowRight className="h-4 w-4 text-sky-200 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
          <span className="hidden sm:block h-px flex-1 bg-gradient-to-l from-transparent to-sky-300/40" />
        </div>

        {/* CHỈNH DÒNG HẸN GẶP BẠN TẠI ĐÂY */}
        <div className="mt-4 flex w-full max-w-md items-center justify-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-300/35" />
          <p className="text-xs sm:text-sm italic text-slate-200/90 whitespace-nowrap">
            Hẹn gặp bạn tại buổi kỷ yếu của mình nhé! <span aria-hidden="true">♡</span>
          </p>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-300/35" />
        </div>
      </div>

      {/* Khung Xác Nhận Nhanh (Chỉ chọn Có đi được / Không + Lời nhắn tùy chọn) */}
      {(formOpen || confirmedData) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto mt-6 max-w-[580px]"
        >
          <div className="hud-chamfer-md bg-gradient-to-br from-sky-300/55 via-blue-400/30 to-sky-300/55 p-[1.5px]">
            <div className="hud-chamfer-md-inner bg-[#06122E]/95 p-5 sm:p-7 backdrop-blur-md">
              {confirmedData ? (
                <div className="text-center">
                  {confirmedData.rsvpStatus === 'attending' ? (
                    <CheckCircle2 className="mx-auto h-8 w-8 text-sky-300" />
                  ) : (
                    <XCircle className="mx-auto h-8 w-8 text-slate-400" />
                  )}

                  <h3 className="mt-2.5 font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold text-white">
                    {confirmedData.rsvpStatus === 'attending'
                      ? 'Đã xác nhận tham dự'
                      : 'Đã ghi nhận không thể tham dự'}
                  </h3>

                  <p className="mt-1.5 text-sm text-slate-300">
                    Cảm ơn{' '}
                    <span className="font-semibold text-sky-200">
                      {confirmedData.guestName}
                    </span>{' '}
                    đã phản hồi lại cho Mai Trung Tú!
                  </p>

                  {confirmedData.guestMessage && (
                    <p className="mt-3 border-t border-sky-400/15 pt-3 text-sm italic text-slate-200">
                      “{confirmedData.guestMessage}”
                    </p>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={invitation ? handlePersonalizedSubmit : handlePublicSubmit}
                  className="space-y-4"
                >
                  <p className="text-center text-xs sm:text-sm text-slate-300">
                    Phản hồi cho khách mời:{' '}
                    <span className="font-semibold text-sky-200">
                      {invitation ? invitation.guestName : 'Bạn & Người thân'}
                    </span>
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setChoice('attending')}
                      className={`min-h-[44px] flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
                        choice === 'attending'
                          ? 'border-sky-300 bg-sky-400/20 text-white'
                          : 'border-slate-700 bg-[#030A1C] text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4 text-sky-300" />
                      <span>Mình sẽ tham dự</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChoice('declined')}
                      className={`min-h-[44px] flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                        choice === 'declined'
                          ? 'border-slate-400 bg-slate-800 text-white'
                          : 'border-slate-700 bg-[#030A1C] text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Không tham dự được</span>
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="rsvp-wish"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Lời nhắn / Lời chúc (không bắt buộc)
                    </label>
                    <textarea
                      id="rsvp-wish"
                      rows={2}
                      maxLength={FIELD_LIMITS.guestMessage}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Gửi lời chúc ngắn cho Mai Trung Tú..."
                      className="mt-1.5 w-full rounded-md border border-sky-400/30 bg-[#030A1C] px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-300 focus:outline-none"
                    />
                  </div>

                  {errorMsg && (
                    <p role="alert" className="text-sm text-rose-400">
                      {errorMsg}
                    </p>
                  )}

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="min-h-[44px] w-full sm:w-auto sm:min-w-[200px] rounded-md bg-sky-400 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-300 disabled:opacity-60 transition-colors"
                    >
                      {submitting ? 'Đang gửi...' : 'Gửi xác nhận'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Chữ viết tay góc dưới trái giống mẫu (Tự chỉnh chữ HTML tại đây) */}
      <div className="mt-8 sm:mt-10 flex justify-start pl-2 sm:pl-4">
        <div className="-rotate-2 sm:-rotate-3">
          <p className="font-[family-name:var(--font-script)] text-xl sm:text-[1.8rem] leading-tight text-slate-100/90">
            Cùng nhau,
            <br />
            đến hết thanh xuân.
          </p>
          <svg
            aria-hidden="true"
            viewBox="0 0 210 16"
            className="mt-1 h-2.5 sm:h-3 w-36 sm:w-44 text-sky-200/70"
          >
            <path
              d="M 4 12 Q 105 3 204 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
