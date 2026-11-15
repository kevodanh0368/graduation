import { ChevronsDown } from 'lucide-react';
import { motion } from 'motion/react';

export function ScrollCueHud() {
  function handleScrollToRsvp() {
    document.getElementById('xac-nhan')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="mx-auto flex w-full max-w-[900px] justify-center px-4 py-1.5 sm:px-6 sm:py-2 lg:px-8">
      <button
        type="button"
        onClick={handleScrollToRsvp}
        aria-label="Kéo xuống để xác nhận tham dự"
        className="group inline-flex flex-col items-center gap-1 rounded-md px-4 py-1.5 text-sky-200/85 hover:text-sky-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        {/* CHỈNH CHỮ GỢI Ý KÉO XUỐNG TẠI ĐÂY */}
        <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-medium tracking-wider text-sky-200/80 group-hover:text-sky-100">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300" />
          </span>
          <span>Kéo xuống để xác nhận tham dự</span>
        </span>

        <motion.span
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex text-sky-300 drop-shadow-[0_0_8px_rgba(125,211,252,0.7)]"
        >
          <ChevronsDown className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.span>
      </button>
    </div>
  );
}
