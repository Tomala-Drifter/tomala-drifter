'use client';
import { useState } from 'react';
import s from '../ui.module.css';
import { cx } from './shared';

function TagRow({ tag, count, onSave, onDelete }) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [emoji, setEmoji] = useState(tag.emoji);
  const [confirming, setConfirming] = useState(false);
  const dirty = name !== tag.name || color !== tag.color || emoji !== tag.emoji;

  return (
    <div className={s.tagRow}>
      <input type="color" className={s.colorInput} value={color} onChange={(e) => setColor(e.target.value)} aria-label="Kolor" />
      <input className={cx(s.field, s.emojiInput)} value={emoji} onChange={(e) => setEmoji(e.target.value)} aria-label="Emoji" />
      <input className={cx(s.field, s.grow)} value={name} onChange={(e) => setName(e.target.value)} aria-label="Nazwa" />
      <span className={s.chipCount}>{count || ''}</span>
      {dirty && <button className={cx(s.btn, s.btnSm, s.btnPrimary)} onClick={() => onSave({ name: tag.name, new_name: name, color, emoji })}>Zapisz</button>}
      {confirming ? (
        <>
          <button className={cx(s.btn, s.btnSm, s.btnGhost)} onClick={() => setConfirming(false)}>Nie</button>
          <button className={cx(s.btn, s.btnSm, s.btnDanger)} onClick={() => onDelete(tag.name)}>Usuń</button>
        </>
      ) : (
        <button className={cx(s.btn, s.btnSm, s.btnGhost)} onClick={() => setConfirming(true)} title="Usuń tag (zostanie zdjęty ze wszystkich zadań)">Usuń</button>
      )}
    </div>
  );
}

export default function TagManager({ tags, counts, onCreate, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#64748b');
  const [emoji, setEmoji] = useState('🏷️');
  const [error, setError] = useState('');

  const wrap = (fn) => async (...a) => {
    setError('');
    try { await fn(...a); } catch (err) { setError(err.message); }
  };

  const create = wrap(async (e) => {
    e.preventDefault();
    await onCreate({ name, color, emoji });
    setName('');
  });

  return (
    <div className={s.card}>
      <h2 className={s.h2} style={{ marginBottom: 4 }}>Tagi</h2>
      <p className={s.muted} style={{ fontSize: '0.8rem', marginBottom: 8 }}>Zmiana nazwy przenosi się na zadania; usunięcie zdejmuje tag z zadań.</p>
      {tags.map((t) => (
        // key includes all fields so the row resets after a save
        <TagRow key={`${t.name}|${t.color}|${t.emoji}`} tag={t} count={counts[t.name]} onSave={wrap(onSave)} onDelete={wrap(onDelete)} />
      ))}
      <form onSubmit={create} className={s.tagRow} style={{ marginTop: 8, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <input type="color" className={s.colorInput} value={color} onChange={(e) => setColor(e.target.value)} aria-label="Kolor nowego tagu" />
        <input className={cx(s.field, s.emojiInput)} value={emoji} onChange={(e) => setEmoji(e.target.value)} aria-label="Emoji nowego tagu" />
        <input className={cx(s.field, s.grow)} value={name} onChange={(e) => setName(e.target.value)} placeholder="nowy tag" required />
        <button type="submit" className={cx(s.btn, s.btnPrimary)}>Dodaj</button>
      </form>
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
}
