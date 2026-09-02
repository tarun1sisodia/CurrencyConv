import localFont from 'next/font/local';

/** Self-hosted Inter variable font (display: swap) to keep LCP independent of Google. */
export const inter = localFont({
  src: '../fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
});
