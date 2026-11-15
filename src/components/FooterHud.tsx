interface FooterHudProps {
  mode: 'guest' | 'admin';
  hasGuestParam: boolean;
  onResetGuestParam: () => void;
  onSwitchMode: (nextMode: 'guest' | 'admin') => void;
}

export function FooterHud({
  mode,
  hasGuestParam,
  onResetGuestParam,
  onSwitchMode,
}: FooterHudProps) {
  return (
    <footer className="relative z-10 py-8">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
        {/* CHỈNH DÒNG CHÂN TRANG TẠI ĐÂY */}
        <div className="mx-auto flex max-w-md items-center justify-center gap-4 text-xs sm:text-sm text-slate-300">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-300/45" />
          <span className="whitespace-nowrap font-medium tracking-wide">
            Mai Trung Tú • Kỷ yếu 2026
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-300/45" />
        </div>

        {( (mode === 'guest' && hasGuestParam) || mode === 'admin' ) && (
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
            {mode === 'guest' && hasGuestParam && (
              <button
                type="button"
                onClick={onResetGuestParam}
                className="hover:text-sky-300 underline underline-offset-4"
              >
                Xem thiệp mời chung
              </button>
            )}
            {mode === 'admin' && (
              <button
                type="button"
                onClick={() => onSwitchMode('guest')}
                className="hover:text-sky-300 underline underline-offset-4"
              >
                Quay lại thiệp mời
              </button>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
