import { useEffect, useState } from 'react';

interface TypingTextProps {
  text: string;
  speedMs?: number;
  delayMs?: number;
  className?: string;
  cursorClassName?: string;
  hideCursorWhenDone?: boolean;
}

export function TypingText({
  text,
  speedMs = 34,
  delayMs = 120,
  className = '',
  cursorClassName = 'bg-cyan-400',
  hideCursorWhenDone = false,
}: TypingTextProps) {
  const [displayed, setDisplayed] = useState<string>(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return text;
    }
    return '';
  });

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplayed(text);
      return;
    }

    setDisplayed('');
    let index = 0;
    let intervalId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length && intervalId !== undefined) {
          window.clearInterval(intervalId);
        }
      }, speedMs);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [text, speedMs, delayMs]);

  const isDone = displayed.length >= text.length;

  return (
    <span className={className}>
      {displayed}
      {(!hideCursorWhenDone || !isDone) && (
        <span
          aria-hidden="true"
          className={`ml-1 inline-block h-[0.95em] w-[2px] align-middle animate-cursor-blink ${cursorClassName}`}
        />
      )}
    </span>
  );
}
