import { manrope } from '@/lib/fonts';
import s from '../tasks/ui.module.css';

const UPDATED = '2026-10-15';
const EMAIL = 'pyzik.tomek@gmail.com';
const PERMISSIONS_URL = 'https://myaccount.google.com/permissions';
const POLICY_URL = 'https://developers.google.com/terms/api-services-user-data-policy';

export const metadata = {
  title: 'Polityka prywatności · Privacy Policy — Hermes',
  description: 'Polityka prywatności prywatnej aplikacji Hermes Tomasza Pyzika. Privacy policy of Tomasz Pyzik’s private Hermes app.',
};

export const viewport = {
  themeColor: '#0e0f13',
  viewportFit: 'cover',
};

const content = {
  pl: {
    lang: 'pl',
    heading: 'Polityka prywatności',
    updated: 'Ostatnia aktualizacja',
    sections: [
      ['Administrator', <>Administratorem i jedynym użytkownikiem aplikacji jest Tomasz Pyzik. Kontakt: <Mail />.</>],
      ['Czym jest Hermes', 'Hermes to aplikacja OAuth będąca prywatnym asystentem AI, używanym wyłącznie przez Tomasza Pyzika do dostępu do jego własnego Gmaila, Kalendarza Google, Dysku Google, Dokumentów i Arkuszy. Aplikacja nie jest udostępniana innym osobom.'],
      ['Jak używane są dane', 'Dane z tych usług są używane wyłącznie do wykonywania poleceń Tomasza — np. odczytu wiadomości i przygotowywania szkiców maili, obsługi kalendarza oraz pracy z dokumentami. Dane nie są sprzedawane, nie są udostępniane osobom trzecim, nie są wykorzystywane do reklam ani do trenowania modeli AI.'],
      ['Przechowywanie', 'Dane nie są trwale kopiowane poza serwer Tomasza. Tokeny dostępu OAuth są przechowywane na jego serwerze.'],
      ['Cofnięcie dostępu', <>Dostęp aplikacji można w każdej chwili cofnąć na stronie <Ext href={PERMISSIONS_URL}>myaccount.google.com/permissions</Ext>.</>],
      ['Zgodność z zasadami Google', <>Korzystanie z danych otrzymanych z Google API jest zgodne z <Ext href={POLICY_URL}>Google API Services User Data Policy</Ext>, w tym z wymogami Limited Use.</>],
    ],
  },
  en: {
    lang: 'en',
    heading: 'Privacy Policy',
    updated: 'Last updated',
    sections: [
      ['Controller', <>The controller and sole user of this app is Tomasz Pyzik. Contact: <Mail />.</>],
      ['What Hermes is', 'Hermes is an OAuth app that serves as a private AI assistant, used exclusively by Tomasz Pyzik to access his own Gmail, Google Calendar, Google Drive, Docs and Sheets. The app is not offered to anyone else.'],
      ['How data is used', 'Data from these services is used only to carry out Tomasz’s requests — e.g. reading emails and drafting replies, managing his calendar and working with documents. Data is not sold, not shared with third parties, and not used for advertising or to train AI models.'],
      ['Storage', 'Data is not permanently copied outside of Tomasz’s server. OAuth access tokens are stored on his server.'],
      ['Revoking access', <>Access can be revoked at any time at <Ext href={PERMISSIONS_URL}>myaccount.google.com/permissions</Ext>.</>],
      ['Compliance with Google policies', <>Use of information received from Google APIs adheres to the <Ext href={POLICY_URL}>Google API Services User Data Policy</Ext>, including the Limited Use requirements.</>],
    ],
  },
};

function Mail() {
  return <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent)' }}>{EMAIL}</a>;
}

function Ext({ href, children }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>{children}</a>;
}

function Policy({ id, t }) {
  return (
    <section id={id} lang={t.lang} className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 22 }}>
      <div>
        <h2 className={s.h1}>{t.heading}</h2>
        <p className={s.muted} style={{ fontSize: '0.82rem', marginTop: 4 }}>{t.updated}: {UPDATED}</p>
      </div>
      {t.sections.map(([title, body]) => (
        <div key={title}>
          <h3 className={s.h2}>{title}</h3>
          <p className={s.muted} style={{ fontSize: '0.92rem', lineHeight: 1.6, marginTop: 4 }}>{body}</p>
        </div>
      ))}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className={`${s.root} ${manrope.className}`}>
      <main className={s.app} style={{ maxWidth: 760 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h1 className={s.h1}>Hermes</h1>
          <nav style={{ display: 'flex', gap: 6 }}>
            <a href="#pl" className={`${s.btn} ${s.btnSm}`}>Polski</a>
            <a href="#en" className={`${s.btn} ${s.btnSm}`}>English</a>
          </nav>
        </header>
        <Policy id="pl" t={content.pl} />
        <Policy id="en" t={content.en} />
      </main>
    </div>
  );
}
