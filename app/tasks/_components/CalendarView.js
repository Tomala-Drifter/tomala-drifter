'use client';
import { useState } from 'react';
import s from '../ui.module.css';
import { IconChevronLeft, IconChevronRight, capitalize, cx, dayKey, startOfWeek } from './shared';

const DAY_NAMES = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
const MAX_PILLS = 2;

// Open tasks first, then by time.
const byDayOrder = (a, b) => (a.status === 'done') - (b.status === 'done') || new Date(a.deadline) - new Date(b.deadline);

function Pill({ task, tagMap }) {
  return (
    <span className={cx(s.pill, task.status === 'done' && s.pillDone)} style={{ '--tag': tagMap[task.tags[0]]?.color }} title={task.title}>
      {task.title}
    </span>
  );
}

function DayNum({ date, selectedKey, todayKey }) {
  const k = dayKey(date);
  return <span className={cx(s.num, k === todayKey && s.numToday, k === selectedKey && s.numSelected)}>{date.getDate()}</span>;
}

function MonthGrid({ cursor, byDay, tagMap, selectedKey, todayKey, onSelect }) {
  const year = cursor.getFullYear();
  const m = cursor.getMonth();
  const offset = (new Date(year, m, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  return (
    <div className={s.calGrid}>
      {DAY_NAMES.map((d) => <div key={d} className={s.dow}>{d}</div>)}
      {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} />)}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, m, i + 1);
        const k = dayKey(date);
        const list = byDay[k] || [];
        return (
          <button key={k} onClick={() => onSelect(date)} aria-pressed={k === selectedKey} aria-label={`${i + 1}, zadań: ${list.length}`}
            className={cx(s.mCell, k === selectedKey && s.mCellSelected)} data-day={k}>
            <DayNum date={date} selectedKey={selectedKey} todayKey={todayKey} />
            {list.slice(0, MAX_PILLS).map((t) => <Pill key={t.id} task={t} tagMap={tagMap} />)}
            {list.length > MAX_PILLS && <span className={s.more}>+{list.length - MAX_PILLS}</span>}
          </button>
        );
      })}
    </div>
  );
}

function WeekList({ cursor, byDay, tagMap, selectedKey, todayKey, onSelect }) {
  const start = startOfWeek(cursor);
  return (
    <div className={s.wList}>
      {DAY_NAMES.map((name, i) => {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const k = dayKey(date);
        const list = byDay[k] || [];
        return (
          <button key={k} onClick={() => onSelect(date)} aria-pressed={k === selectedKey}
            className={cx(s.wRow, k === selectedKey && s.wRowSelected)} data-day={k}>
            <span className={s.wDay}>
              <span className={s.wDow}>{name}</span>
              <DayNum date={date} selectedKey={selectedKey} todayKey={todayKey} />
            </span>
            <span className={s.wTasks}>
              {list.length ? list.map((t) => <Pill key={t.id} task={t} tagMap={tagMap} />) : <span className={s.wEmpty}>—</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function weekTitle(cursor) {
  const a = startOfWeek(cursor);
  const b = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 6);
  const fmt = (d, o) => d.toLocaleDateString('pl-PL', o);
  if (a.getMonth() === b.getMonth()) return `${a.getDate()}–${fmt(b, { day: 'numeric', month: 'short' })}`;
  return `${fmt(a, { day: 'numeric', month: 'short' })} – ${fmt(b, { day: 'numeric', month: 'short' })}`;
}

// Month grid with task pills, or a week list with full titles. `mode` is controlled by the page.
export default function CalendarView({ tasks, tagMap, selected, onSelect, mode, onModeChange }) {
  // cursor = the month (month mode) or any day of the week (week mode) currently shown
  const [cursor, setCursor] = useState(selected);

  const byDay = {};
  for (const t of tasks) if (t.deadline) (byDay[dayKey(new Date(t.deadline))] ||= []).push(t);
  for (const k in byDay) byDay[k].sort(byDayOrder);

  const step = (dir) =>
    setCursor((c) => (mode === 'month' ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : new Date(c.getFullYear(), c.getMonth(), c.getDate() + 7 * dir)));

  const goToday = () => {
    const d = new Date();
    setCursor(d);
    onSelect(d);
  };

  const switchMode = (next) => {
    setCursor(selected); // show the selected day in the new view
    onModeChange(next);
  };

  const props = { cursor, byDay, tagMap, selectedKey: dayKey(selected), todayKey: dayKey(new Date()), onSelect };

  return (
    <div className={s.panel}>
      <div className={s.toolbar}>
        <div className={s.seg} role="tablist" aria-label="Widok kalendarza">
          {[['month', 'Miesiąc'], ['week', 'Tydzień']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={mode === id} className={cx(s.segBtn, mode === id && s.segActive)} onClick={() => switchMode(id)}>
              {label}
            </button>
          ))}
        </div>
        <button className={cx(s.btn, s.btnSm, s.btnGhost)} onClick={goToday}>Dziś</button>
      </div>

      <div className={cx(s.card, s.calCard)}>
        <div className={s.calHeader}>
          <button className={cx(s.btn, s.iconBtn)} onClick={() => step(-1)} aria-label={mode === 'month' ? 'Poprzedni miesiąc' : 'Poprzedni tydzień'}><IconChevronLeft /></button>
          <div className={s.calTitle}>
            {mode === 'month' ? capitalize(cursor.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })) : weekTitle(cursor)}
          </div>
          <button className={cx(s.btn, s.iconBtn)} onClick={() => step(1)} aria-label={mode === 'month' ? 'Następny miesiąc' : 'Następny tydzień'}><IconChevronRight /></button>
        </div>
        <div key={mode} className={s.expandIn}>
          {mode === 'month' ? <MonthGrid {...props} /> : <WeekList {...props} />}
        </div>
      </div>
    </div>
  );
}
