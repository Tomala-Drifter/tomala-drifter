import './globals.css';

export const metadata = {
  title: 'Tomasz Pyzik | Student • Consultant • Builder',
  description: 'First-year IBEB student at EUR, President of Rotterdam Consulting Club, exploring fintech and building startups.',
  icons: {
    icon: [{ url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
