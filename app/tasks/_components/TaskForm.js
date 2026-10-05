'use client';
import { useState } from 'react';
import s from '../ui.module.css';
import { cx, fromLocalInput, toLocalInput } from './shared';

// Used both for adding (no `task`) and editing an existing task.
export default function TaskForm({ task, tags, defaultDeadline, onSubmit, onCancel, autoFocus }) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [deadline, setDeadline] = useState(toLocalInput(task?.deadline ?? defaultDeadline));
  const [selected, setSelected] = useState(task?.tags ?? []);
  const [source, setSource] = useState(task?.source ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const toggle = (name) => setSelected((x) => (x.includes(name) ? x.filter((n) => n !== name) : [...x, name]));

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError('');
    try {
      await onSubmit({ title: title.trim(), notes, deadline: fromLocalInput(deadline), tags: selected, source: source.trim() || null });
      if (!task) {
        setTitle(''); setNotes(''); setDeadline(toLocalInput(defaultDeadline)); setSelected([]); setSource('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.form}>
      <input className={s.field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Co trzeba zrobić?" required autoFocus={autoFocus} />
      <textarea className={s.field} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notatki…" rows={2} />
      <div className={s.row}>
        <label className={s.label}>
          Termin
          <input className={s.field} type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
        <label className={s.label}>
          Źródło (np. nagranie Plaud)
          <input className={s.field} value={source} onChange={(e) => setSource(e.target.value)} placeholder="—" />
        </label>
      </div>
      <div className={cx(s.chips, s.chipsWrap)}>
        {tags.map((t) => (
          <button type="button" key={t.name} onClick={() => toggle(t.name)} style={{ '--tag': t.color }}
            className={cx(s.chip, selected.includes(t.name) && s.chipActive)} aria-pressed={selected.includes(t.name)}>
            <span className={s.dot} />
            {t.emoji} {t.name}
          </button>
        ))}
      </div>
      {error && <p className={s.error}>{error}</p>}
      <div className={s.formActions}>
        {onCancel && <button type="button" onClick={onCancel} className={cx(s.btn, s.btnGhost)}>Anuluj</button>}
        <button type="submit" disabled={busy} className={cx(s.btn, s.btnPrimary)}>
          {busy ? 'Zapisywanie…' : task ? 'Zapisz' : 'Dodaj'}
        </button>
      </div>
    </form>
  );
}
