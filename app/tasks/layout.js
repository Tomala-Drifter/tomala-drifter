import { manrope } from '@/lib/fonts';
import s from './ui.module.css';
import RegisterSW from './_components/RegisterSW';

export const metadata = {
  title: 'Zadania',
  appleWebApp: { capable: true, title: 'Zadania', statusBarStyle: 'black-translucent' },
};

export const viewport = {
  themeColor: '#0e0f13',
  viewportFit: 'cover',
};

export default function TasksLayout({ children }) {
  return (
    <div className={`${s.root} ${manrope.className}`}>
      {children}
      <RegisterSW />
    </div>
  );
}
