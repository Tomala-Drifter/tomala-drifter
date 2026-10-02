import './globals.css';

export const metadata = {
  title: 'Tomasz Pyzik | Student • Consultant • Builder',
  description: 'First-year IBEB student at EUR, President of Rotterdam Consulting Club, exploring fintech and building startups.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
