'use client';
import { useState } from 'react';
import s from '../ui.module.css';
import TaskForm from './TaskForm';
import { IconClock, IconMic, cx, formatDeadline, isOverdue } from './shared';

function TaskItem({ task, tags, tagMap, editing, leaving, onEdit, onCancelEdit, onSave, onToggle, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const done = task.status === 'done';
  const overdue = isOverdue(task);
  const due = formatDeadline(task.deadline);
  const primary = tagMap[task.tags[0]];

  if (editing) {
    return (
      <div id={`task-${task.id}`} className={cx(s.card, s.sheet)}>
        <TaskForm task={task} tags={tags} onSubmit={onSave} onCancel={onCancelEdit} autoFocus />
      </div>
    );
  }

  return (
    <div id={`task-${task.id}`} style={{ '--tag': primary?.color }}
      className={cx(s.task, done && s.taskDone, leaving && s.taskLeaving, expanded && s.taskExpanded)}>
      <button type="button" className={cx(s.check, done && s.checkOn)} onClick={onToggle}
        aria-label={done ? 'Oznacz jako do zrobienia' : 'Oznacz jako zrobione'} aria-pressed={done}>
        <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </button>

      <div className={s.taskBody} onClick={() => { setExpanded((e) => !e); setConfirming(false); }}>
        <div className={s.taskTitle}>{task.title}</div>
        {(due || task.tags.length > 0 || task.source) && (
          <div className={s.taskMeta}>
            {due && (
              <span className={cx(s.tagInline, overdue && s.overdue)}>
                <IconClock width={12} height={12} /> {due}
              </span>
            )}
            {task.tags.map((name) => (
              <span key={name} className={s.tagInline} style={{ '--tag': tagMap[name]?.color }}>
                <span className={s.dot} /> {name}
              </span>
            ))}
            {task.source && !expanded && <IconMic width={12} height={12} aria-label="ma źródło" />}
          </div>
        )}

        {expanded && (
          <div className={s.expandIn} onClick={(e) => e.stopPropagation()}>
            {task.notes && <div className={s.notes}>{task.notes}</div>}
            {task.source && (
              <div className={cx(s.taskMeta, s.tagInline)} style={{ marginTop: 8 }}>
                <IconMic width={12} height={12} /> {task.source}
              </div>
            )}
            <div className={s.taskActions}>
              {confirming ? (
                <>
                  <button className={cx(s.btn, s.btnSm, s.btnGhost)} onClick={() => setConfirming(false)}>Anuluj</button>
                  <button className={cx(s.btn, s.btnSm, s.btnDanger)} onClick={onDelete}>Na pewno usuń</button>
                </>
              ) : (
                <>
                  <button className={cx(s.btn, s.btnSm)} onClick={onEdit}>Edytuj</button>
                  <button className={cx(s.btn, s.btnSm, s.btnDanger)} onClick={() => setConfirming(true)}>Usuń</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TaskList({ tasks, tags, tagMap, editingId, setEditingId, leavingIds, onSave, onToggle, onDelete, empty = 'Brak zadań' }) {
  if (!tasks.length) return <p className={s.empty}>{empty}</p>;
  return (
    <div className={s.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          tags={tags}
          tagMap={tagMap}
          editing={editingId === task.id}
          leaving={leavingIds?.has(task.id)}
          onEdit={() => setEditingId(task.id)}
          onCancelEdit={() => setEditingId(null)}
          onSave={(fields) => onSave(task.id, fields)}
          onToggle={() => onToggle(task)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </div>
  );
}
