import Link from 'next/link';
import { inter } from '@/lib/fonts';
import '@/app/globals.css';

export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">That URL does not exist.</p>
        <Link className="text-indigo-600 underline" href="/en">
          Back to converter
        </Link>
      </body>
    </html>
  );
}
