'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import s from '../tasks/ui.module.css';
import { cx } from '../tasks/_components/shared';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const password = new FormData(e.target).get('password');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.status === 401 ? 'Złe hasło' : 'Błąd serwera');
      return;
    }
    const next = params.get('next');
    router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/tasks');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className={cx(s.card, s.loginCard)}>
      <div className={s.logo}>
        <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </div>
      <h1 className={s.h1}>Zadania</h1>
      <p className={s.muted} style={{ fontSize: '0.88rem', marginTop: -6 }}>Podaj hasło, żeby kontynuować.</p>
      <input className={s.field} name="password" type="password" placeholder="Hasło" autoFocus required autoComplete="current-password" />
      <button type="submit" disabled={busy} className={cx(s.btn, s.btnPrimary)} style={{ padding: 13 }}>
        {busy ? 'Logowanie…' : 'Zaloguj'}
      </button>
      {error && <p className={s.error} role="alert">{error}</p>}
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className={s.center}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
