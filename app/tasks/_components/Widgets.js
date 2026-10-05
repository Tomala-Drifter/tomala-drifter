'use client';
import s from '../ui.module.css';
import { cx, dayKey, isOverdue, startOfWeek } from './shared';

function Ring({ value, size = 40, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg className={s.ring} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle className={s.ringTrack} cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
      <circle className={s.ringValue} cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} />
    </svg>
  );
}

// Small summary cards: due today, overdue, and this week's completion ring.
export default function Widgets({ tasks }) {
  const today = dayKey(new Date());
  const weekStart = startOfWeek();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const open = tasks.filter((t) => t.status !== 'done');
  const dueToday = open.filter((t) => t.deadline && dayKey(new Date(t.deadline)) === today).length;
  const overdue = open.filter(isOverdue).length;

  // Done this week vs. everything that was on this week's plate (done + still open and due by Sunday).
  const doneWeek = tasks.filter((t) => t.status === 'done' && t.completed_at && new Date(t.completed_at) >= weekStart).length;
  const openWeek = open.filter((t) => t.deadline && new Date(t.deadline) < weekEnd).length;
  const total = doneWeek + openWeek;
  const pct = total ? doneWeek / total : 0;

  return (
    <div className={s.widgets}>
      <div className={s.widget}>
        <div className={s.widgetNum}>{dueToday}</div>
        <div className={s.widgetLabel}>Dziś</div>
      </div>
      <div className={cx(s.widget, overdue > 0 && s.widgetAlert)}>
        <div className={s.widgetNum}>{overdue}</div>
        <div className={s.widgetLabel}>Zaległe</div>
      </div>
      <div className={cx(s.widget, s.widgetRing)} title={`Ukończone w tym tygodniu: ${doneWeek} z ${total}`}>
        <Ring value={pct} />
        <div style={{ minWidth: 0 }}>
          <div className={s.widgetNum} style={{ fontSize: '1.15rem' }}>{doneWeek}/{total}</div>
          <div className={s.widgetLabel}>tydzień</div>
        </div>
      </div>
    </div>
  );
}
