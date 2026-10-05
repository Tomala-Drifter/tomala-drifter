// Wall-clock <-> UTC helpers for the app's home time zone (used by the API and scripts).

export const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Europe/Amsterdam';

// Offset (ms) of `tz` from UTC at instant `ts`.
function tzOffset(ts, tz) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(ts)).map((p) => [p.type, p.value])
  );
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - ts;
}

// Interprets a wall-clock time (y, m 1-12, d, h, min) in `tz` and returns a Date.
export function zonedTimeToDate(y, m, d, h = 0, min = 0, tz = APP_TIMEZONE) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  let ts = guess - tzOffset(guess, tz);
  ts = guess - tzOffset(ts, tz); // second pass settles DST transitions
  return new Date(ts);
}

const NAIVE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?)?$/;

// Parses a deadline string. Values with Z/offset are absolute; naive values
// ("2026-10-08T23:59" or date-only "2026-10-08" = end of that day) are read in APP_TIMEZONE.
export function parseDeadline(str) {
  const m = NAIVE_RE.exec(str.trim());
  if (!m) return new Date(str);
  const [, y, mo, d, h, min] = m.map(Number);
  return h === undefined || Number.isNaN(h) ? zonedTimeToDate(y, mo, d, 23, 59) : zonedTimeToDate(y, mo, d, h, min);
}
