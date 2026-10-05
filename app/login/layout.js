import { manrope } from '@/lib/fonts';
import s from '../tasks/ui.module.css';

export const metadata = { title: 'Logowanie · Zadania' };

export const viewport = {
  themeColor: '#0e0f13',
  viewportFit: 'cover',
};

export default function LoginLayout({ children }) {
  return <div className={`${s.root} ${manrope.className}`}>{children}</div>;
}
