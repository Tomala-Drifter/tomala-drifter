'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import s from './ui.module.css';
import TaskForm from './_components/TaskForm';
import TaskList from './_components/TaskList';
import CalendarView from './_components/CalendarView';
import TagManager from './_components/TagManager';
import Widgets from './_components/Widgets';
import { IconCalendar, IconList, IconLogout, IconPlus, IconTag, api, capitalize, cx, dayKey } from './_components/shared';

const TABS = [
  { id: 'zadania', label: 'Zadania', Icon: IconList },
  { id: 'kalendarz', label: 'Kalendarz', Icon: IconCalendar },
  { id: 'tagi', label: 'Tagi', Icon: IconTag },
];

const LEAVE_MS = 700; // matches .taskLeaving (0.35s delay + 0.35s slide)

export default function TasksPage() {
  const [tab, setTab] = useState('zadania');
  const [tasks, setTasks] = useState(null);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState([]); // selected tag names (OR)
  const [showDone, setShowDone] = useState(false);
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [calMode, setCalMode] = useState(null); // 'week' on phones, 'month' on desktop (set on mount)
  const dayPanelRef = useRef(null);
  const [leavingIds, setLeavingIds] = useState(() => new Set());
  const leaveTimers = useRef({});

  const load = useCallback(async () => {
    try {
      const [t, g] = await Promise.all([api('/api/tasks'), api('/api/tags')]);
      setTasks(t);
      setTags(g);
      setError('');
    } catch (err) {
      setError(`Nie udało się wczytać danych: ${err.message}`);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setCalMode(window.matchMedia('(min-width: 900px)').matches ? 'month' : 'week');
  }, []);

  const selectDay = (d) => {
    setSelectedDay(d);
    setAdding(false);
    setEditingId(null);
    // bring the day's task list into view if it sits below the fold (week view on phones)
    requestAnimationFrame(() => {
      const el = dayPanelRef.current;
      if (el && el.getBoundingClientRect().top > window.innerHeight - 160) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Tab lives in the URL hash so the back button and reloads keep it.
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.slice(1);
      setTab(TABS.some((t) => t.id === h) ? h : 'zadania');
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const switchTab = (id) => {
    if (id === tab) return;
    window.location.hash = id;
    setEditingId(null);
    setAdding(false);
    window.scrollTo({ top: 0 });
  };

  // Every mutation goes to the API and then reloads — the database is the only source of truth.
  // Errors are re-thrown so forms can show them inline.
  const mutate = (fn) => async (...args) => {
    try {
      await fn(...args);
    } finally {
      await load();
    }
  };
  const reportErrors = (fn) => (...args) => fn(...args).catch((err) => setError(`Operacja nie powiodła się: ${err.message}`));

  const addTask = mutate(async (fields) => {
    await api('/api/tasks', { method: 'POST', body: fields });
    setAdding(false);
  });
  const saveTask = mutate(async (id, fields) => {
    await api(`/api/tasks/${id}`, { method: 'PATCH', body: fields });
    setEditingId(null);
  });
  const deleteTask = reportErrors(mutate((id) => api(`/api/tasks/${id}`, { method: 'DELETE' })));

  // Optimistic toggle so the checkbox animates instantly; a task checked off while
  // done ones are hidden stays briefly on screen and slides out.
  const toggleTask = reportErrors(mutate(async (task) => {
    const status = task.status === 'done' ? 'todo' : 'done';
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status, completed_at: status === 'done' ? new Date().toISOString() : null } : t)));
    if (status === 'done') {
      clearTimeout(leaveTimers.current[task.id]);
      setLeavingIds((x) => new Set(x).add(task.id));
      leaveTimers.current[task.id] = setTimeout(() => {
        setLeavingIds((x) => { const n = new Set(x); n.delete(task.id); return n; });
      }, LEAVE_MS);
    }
    await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: { status } });
  }));

  const createTag = mutate((tag) => api('/api/tags', { method: 'POST', body: tag }));
  const saveTag = mutate(async (tag) => {
    await api('/api/tags', { method: 'PATCH', body: tag });
    if (tag.new_name && tag.new_name !== tag.name) setFilter((f) => f.map((x) => (x === tag.name ? tag.new_name.trim().toLowerCase() : x)));
  });
  const deleteTag = mutate(async (name) => {
    await api(`/api/tags?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
    setFilter((f) => f.filter((x) => x !== name));
  });

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const tagMap = useMemo(() => Object.fromEntries(tags.map((t) => [t.name, t])), [tags]);
  const all = tasks || [];
  const matchesFilter = (t) => !filter.length || t.tags.some((x) => filter.includes(x));

  const listTasks = all.filter((t) => matchesFilter(t) && (showDone || t.status !== 'done' || leavingIds.has(t.id)));
  const calendarTasks = all.filter(matchesFilter);
  const selectedKey = dayKey(selectedDay);
  const dayTasks = calendarTasks
    .filter((t) => t.deadline && dayKey(new Date(t.deadline)) === selectedKey)
    .sort((a, b) => (a.status === 'done') - (b.status === 'done') || new Date(a.deadline) - new Date(b.deadline));

  const openCounts = useMemo(() => {
    const c = {};
    for (const t of tasks || []) if (t.status !== 'done') for (const x of t.tags) c[x] = (c[x] || 0) + 1;
    return c;
  }, [tasks]);

  const toggleFilter = (name) => setFilter((f) => (f.includes(name) ? f.filter((x) => x !== name) : [...f, name]));
  const doneCount = all.filter((t) => t.status === 'done').length;
  const loading = tasks === null && !error;

  const listProps = {
    tags, tagMap, editingId, setEditingId, leavingIds,
    onSave: saveTask, onToggle: toggleTask, onDelete: deleteTask,
  };

  const filterChips = (
    <div className={s.chips}>
      {tags.map((t) => (
        <button key={t.name} onClick={() => toggleFilter(t.name)} style={{ '--tag': t.color }}
          className={cx(s.chip, filter.includes(t.name) && s.chipActive)} aria-pressed={filter.includes(t.name)}>
          <span className={s.dot} />
          {t.name}
          {openCounts[t.name] > 0 && <span className={s.chipCount}>{openCounts[t.name]}</span>}
        </button>
      ))}
      {filter.length > 0 && <button className={cx(s.chip)} onClick={() => setFilter([])}>✕ wyczyść</button>}
    </div>
  );

  // end of the selected day, used as default deadline when adding from the calendar
  const selectedDeadline = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), 23, 59).toISOString();

  return (
    <div className={s.app}>
      <header className={s.header}>
        <div>
          <div className={s.hello}>{capitalize(new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }))}</div>
          <h1 className={s.h1}>{TABS.find((t) => t.id === tab).label}</h1>
        </div>
        <button className={cx(s.btn, s.iconBtn)} onClick={logout} aria-label="Wyloguj" title="Wyloguj"><IconLogout /></button>
      </header>

      <nav className={s.tabs} aria-label="Sekcje">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => switchTab(id)} className={cx(s.tab, tab === id && s.tabActive)} aria-current={tab === id ? 'page' : undefined}>
            <Icon /> {label}
          </button>
        ))}
      </nav>

      {error && (
        <div className={s.banner} role="alert">
          <span>{error}</span>
          <button className={cx(s.btn, s.btnSm)} onClick={load}>Ponów</button>
        </div>
      )}

      {tab === 'zadania' && (
        <section key="zadania" className={s.panel}>
          <Widgets tasks={all} />

          <div className={s.toolbar}>
            <button className={cx(s.btn, s.btnGhost, s.btnSm)} onClick={() => setShowDone((v) => !v)} aria-pressed={showDone}>
              {showDone ? 'Ukryj zrobione' : `Pokaż zrobione (${doneCount})`}
            </button>
            <button className={cx(s.btn, adding ? s.btnGhost : s.btnPrimary)} onClick={() => { setAdding((a) => !a); setEditingId(null); }}>
              {adding ? 'Zamknij' : <><IconPlus width={16} height={16} /> Dodaj</>}
            </button>
          </div>

          {adding && (
            <div className={cx(s.card, s.sheet)}>
              <TaskForm tags={tags} onSubmit={addTask} autoFocus />
            </div>
          )}

          {filterChips}

          {loading ? <p className={s.empty}>Wczytywanie…</p> : (
            <TaskList tasks={listTasks} {...listProps} empty={filter.length ? 'Brak zadań z tymi tagami' : 'Wszystko zrobione 🎉'} />
          )}
        </section>
      )}

      {tab === 'kalendarz' && (
        <section key="kalendarz" className={s.panel}>
          {filter.length > 0 && filterChips}
          {calMode && (
            <CalendarView tasks={calendarTasks} tagMap={tagMap} selected={selectedDay} onSelect={selectDay} mode={calMode} onModeChange={setCalMode} />
          )}
          <div className={cx(s.panel, s.dayPanel)} key={selectedKey} ref={dayPanelRef}>
            <div className={s.toolbar}>
              <h2 className={s.h2}>
                {capitalize(selectedDay.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }))}
              </h2>
              <button className={cx(s.btn, s.btnSm, adding ? s.btnGhost : s.btnPrimary)} onClick={() => setAdding((a) => !a)}>
                {adding ? 'Zamknij' : <><IconPlus width={14} height={14} /> Dodaj</>}
              </button>
            </div>
            {adding && (
              <div className={cx(s.card, s.sheet)}>
                <TaskForm tags={tags} defaultDeadline={selectedDeadline} onSubmit={addTask} autoFocus />
              </div>
            )}
            {loading ? <p className={s.empty}>Wczytywanie…</p> : (
              <TaskList tasks={dayTasks} {...listProps} leavingIds={null} empty="Nic na ten dzień" />
            )}
          </div>
        </section>
      )}

      {tab === 'tagi' && (
        <section key="tagi" className={s.panel}>
          <TagManager tags={tags} counts={openCounts} onCreate={createTag} onSave={saveTag} onDelete={deleteTag} />
        </section>
      )}
    </div>
  );
}
