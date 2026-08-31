import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Antigravity OpenAI Proxy',
  description: 'High-Performance Universal OpenAI Gateway for Google Antigravity Models',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#09090b', color: '#f4f4f5', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
