import { type EventSettings } from '../types/invitation';

export interface ParsedCountdownTarget {
  isoDate: string; // YYYY-MM-DD
  time24: string; // HH:mm
  timestampMs: number;
  formattedDate: string; // DD/MM/YYYY
  weekdayLabel: string; // Chủ Nhật, Thứ Hai, ...
  sourceKind: 'exact' | 'period' | 'default';
}

const VIETNAMESE_WEEKDAYS = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

function formatIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getWeekdayLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00+07:00`);
  if (Number.isNaN(parsed.getTime())) return 'Chủ Nhật';
  // Use UTC day of shifted +07:00 midday timestamp so local browser TZ never shifts the weekday
  const vnDate = new Date(parsed.getTime() + 7 * 60 * 60 * 1000);
  return VIETNAMESE_WEEKDAYS[vnDate.getUTCDay()] ?? 'Chủ Nhật';
}

function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return '29/11/2026';
  return `${d}/${m}/${y}`;
}

function extractDateAndStrip(
  text: string,
  fallbackIsoDate: string
): { isoDate: string; strippedText: string } {
  const baseYear = Number(fallbackIsoDate.slice(0, 4)) || 2026;
  let resolvedIso: string | null = null;
  let working = text;

  // 1. YYYY-MM-DD
  working = working.replace(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/g, (full, yStr, mStr, dStr) => {
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    if (isValidCalendarDate(y, m, d)) {
      if (!resolvedIso) resolvedIso = formatIsoDate(y, m, d);
      return ' ';
    }
    return full;
  });

  // 2. DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  working = working.replace(
    /\b(\d{1,2})[./-](\d{1,2})[./-](20\d{2})\b/g,
    (full, dStr, mStr, yStr) => {
      const d = Number(dStr);
      const m = Number(mStr);
      const y = Number(yStr);
      if (isValidCalendarDate(y, m, d)) {
        if (!resolvedIso) resolvedIso = formatIsoDate(y, m, d);
        return ' ';
      }
      return full;
    }
  );

  // 3. DD/MM (slash-separated without year — never used for time in Vietnamese)
  working = working.replace(/\b(\d{1,2})\/(\d{1,2})\b/g, (full, dStr, mStr) => {
    const d = Number(dStr);
    const m = Number(mStr);
    if (isValidCalendarDate(baseYear, m, d)) {
      if (!resolvedIso) resolvedIso = formatIsoDate(baseYear, m, d);
      return ' ';
    }
    return full;
  });

  return {
    isoDate: resolvedIso ?? fallbackIsoDate,
    strippedText: working,
  };
}

function normalizeHourWithPeriod(
  rawHour: number,
  periodHint: string | undefined
): number {
  const hint = (periodHint || '').toLowerCase();
  if (/(pm|p\.m\.|chiều|chieu|tối|toi|đêm|dem)/.test(hint)) {
    if (rawHour >= 1 && rawHour <= 11) {
      return rawHour + 12;
    }
    if (rawHour === 12 && /(đêm|dem)/.test(hint)) {
      return 0;
    }
    return rawHour;
  }
  if (/(am|a\.m\.|sáng|sang)/.test(hint)) {
    if (rawHour === 12) return 0;
    return rawHour;
  }
  if (/(trưa|trua)/.test(hint)) {
    if (rawHour >= 1 && rawHour <= 3) return rawHour + 12;
    return rawHour;
  }
  return rawHour;
}

function extractEarliestMinutes(text: string): { minutes: number; kind: 'exact' | 'period' } | null {
  const clauses = text
    .split(/[,;|\n&]|\bhoặc\b|\bhoac\b|\bvà\b|\bva\b/i)
    .map((c) => c.trim())
    .filter(Boolean);

  const candidateMinutes: number[] = [];

  for (const clause of clauses) {
    const clausePeriodMatch = clause.match(
      /\b(sáng|sang|am|a\.m\.|trưa|trua|chiều|chieu|pm|p\.m\.|tối|toi|đêm|dem)\b/i
    );
    const clausePeriod = clausePeriodMatch?.[1];

    // Range start without unit on the first number, e.g. "9 - 11h" or "8 - 10:30"
    const bareRangeRegex =
      /(?:^|[^\d:.hHgG])(\d{1,2})\s*[-–—~]\s*\d{1,2}\s*(?::\d{2}|[hHgG]|giờ|gio)/gi;
    for (const m of clause.matchAll(bareRangeRegex)) {
      const rawH = Number(m[1]);
      if (rawH >= 0 && rawH <= 23) {
        const hh = normalizeHourWithPeriod(rawH, clausePeriod);
        if (hh >= 0 && hh <= 23) {
          candidateMinutes.push(hh * 60);
        }
      }
    }

    // "9h rưỡi", "9 rưỡi", "9 giờ rưỡi" (consume before explicitRegex so "9h" doesn't also push HH:00)
    const ruoiRegex =
      /(\d{1,2})\s*(?:[hHgG]|giờ|gio)?\s*rưỡi(?:\s*(sáng|sang|trưa|trua|chiều|chieu|tối|toi|đêm|dem))?/gi;
    const clauseWithoutRuoi = clause.replace(ruoiRegex, (full, hStr, periodStr) => {
      const rawH = Number(hStr);
      if (rawH >= 0 && rawH <= 23) {
        const hh = normalizeHourWithPeriod(rawH, periodStr ?? clausePeriod);
        if (hh >= 0 && hh <= 23) {
          candidateMinutes.push(hh * 60 + 30);
          return ' ';
        }
      }
      return full;
    });

    // Explicit time tokens: 09:30, 9:15, 9h30, 9h, 9g15, 9 giờ 30, 9.30
    const explicitRegex =
      /(\d{1,2})\s*(?::(\d{2})|\.(?=\d{2}\b)(\d{2})|[hHgG](?:\s*(\d{2}))?|(?:giờ|gio)(?:\s*(\d{1,2}))?)(?:\s*(am|pm|a\.m\.|p\.m\.|sáng|sang|trưa|trua|chiều|chieu|tối|toi|đêm|dem))?/gi;
    for (const m of clauseWithoutRuoi.matchAll(explicitRegex)) {
      const rawH = Number(m[1]);
      const mmStr = m[2] ?? m[3] ?? m[4] ?? m[5];
      const rawM = mmStr !== undefined ? Number(mmStr) : 0;
      if (rawH >= 0 && rawH <= 23 && rawM >= 0 && rawM <= 59) {
        const hh = normalizeHourWithPeriod(rawH, m[6] ?? clausePeriod);
        if (hh >= 0 && hh <= 23) {
          candidateMinutes.push(hh * 60 + rawM);
        }
      }
    }

    // Bare "9 AM" / "2 PM"
    const amPmRegex = /\b(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)\b/gi;
    for (const m of clause.matchAll(amPmRegex)) {
      const rawH = Number(m[1]);
      if (rawH >= 1 && rawH <= 12) {
        const hh = normalizeHourWithPeriod(rawH, m[2]);
        if (hh >= 0 && hh <= 23) {
          candidateMinutes.push(hh * 60);
        }
      }
    }
  }

  if (candidateMinutes.length > 0) {
    const earliest = Math.min(...candidateMinutes);
    return { minutes: earliest, kind: 'exact' };
  }

  // Fallback for non-numeric schedule labels like "Cả ngày", "Buổi sáng", "Buổi chiều", "Buổi tối"
  const lower = text.toLowerCase();
  if (/(cả\s*ngày|ca\s*ngay|all\s*day|full|nguyên\s*ngày|sáng|sang|linh\s*hoạt|tự\s*do)/.test(lower)) {
    return { minutes: 8 * 60, kind: 'period' };
  }
  if (/(trưa|trua)/.test(lower)) {
    return { minutes: 11 * 60 + 30, kind: 'period' };
  }
  if (/(chiều|chieu)/.test(lower)) {
    return { minutes: 13 * 60 + 30, kind: 'period' };
  }
  if (/(tối|toi|đêm|dem)/.test(lower)) {
    return { minutes: 18 * 60 + 30, kind: 'period' };
  }

  return null;
}

export function parseCountdownTarget(
  customTime: string | undefined,
  settings: Pick<EventSettings, 'eventDate' | 'defaultTime'>
): ParsedCountdownTarget {
  const baseIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(settings.eventDate || '')
    ? settings.eventDate
    : '2026-11-29';

  const primaryInput = (customTime || '').trim();
  const { isoDate, strippedText } = extractDateAndStrip(primaryInput, baseIsoDate);

  let parsedTime = primaryInput ? extractEarliestMinutes(strippedText) : null;
  let sourceKind: 'exact' | 'period' | 'default' = parsedTime?.kind ?? 'default';

  if (!parsedTime) {
    const fallbackInput = (settings.defaultTime || '14:00').trim();
    const { strippedText: fallbackStripped } = extractDateAndStrip(fallbackInput, isoDate);
    parsedTime = extractEarliestMinutes(fallbackStripped);
    sourceKind = 'default';
  }

  const totalMins = parsedTime?.minutes ?? 14 * 60;
  const hh = Math.floor(totalMins / 60)
    .toString()
    .padStart(2, '0');
  const mm = (totalMins % 60).toString().padStart(2, '0');
  const time24 = `${hh}:${mm}`;

  const parsedMs = Date.parse(`${isoDate}T${time24}:00+07:00`);
  const timestampMs = Number.isNaN(parsedMs)
    ? Date.parse('2026-11-29T14:00:00+07:00')
    : parsedMs;

  return {
    isoDate,
    time24,
    timestampMs,
    formattedDate: formatDisplayDate(isoDate),
    weekdayLabel: getWeekdayLabel(isoDate),
    sourceKind,
  };
}
