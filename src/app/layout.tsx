import type { ReactNode } from 'react';

/**
 * Root pass-through. The locale layout owns <html> and <body>.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
