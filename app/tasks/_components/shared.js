'use client';

export const cx = (...c) => c.filter(Boolean).join(' ');

// Fetch wrapper for our API: JSON in/out, bounces to /login when the session is gone.
export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (res.status === 401) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new Error('unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const pad = (n) => String(n).padStart(2, '0');

// Local calendar day key, e.g. "2026-10-07" (not UTC — avoids tasks shifting a day).
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ISO -> value for <input type="datetime-local"> in local time.
export const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);

// Monday 00:00 of the week containing `d`.
export function startOfWeek(d = new Date()) {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
  return s;
}

// Compact, relative deadline label: "Dziś 12:00", "Jutro", "pt 9 paź", "12 lis 2027".
export function formatDeadline(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const days = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
  const time = d.getHours() === 23 && d.getMinutes() === 59 ? '' : ` ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (days === 0) return `Dziś${time}`;
  if (days === 1) return `Jutro${time}`;
  if (days === -1) return `Wczoraj${time}`;
  const opts = { day: 'numeric', month: 'short' };
  if (days > 1 && days < 7) opts.weekday = 'short';
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
  return d.toLocaleDateString('pl-PL', opts) + time;
}

// Polish style: only the first letter upper-case ("Wtorek, 6 października").
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const isOverdue = (t) => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date();

const svg = (path) =>
  function Icon(props) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        {path}
      </svg>
    );
  };

export const IconList = svg(<><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" /></>);
export const IconCalendar = svg(<><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /></>);
export const IconTag = svg(<><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>);
export const IconLogout = svg(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>);
export const IconChevronLeft = svg(<path d="m15 18-6-6 6-6" />);
export const IconChevronRight = svg(<path d="m9 18 6-6-6-6" />);
export const IconPlus = svg(<path d="M12 5v14M5 12h14" />);
export const IconMic = svg(<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>);
export const IconClock = svg(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
