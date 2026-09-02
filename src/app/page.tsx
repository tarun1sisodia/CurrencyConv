import { redirect } from 'next/navigation';

/** Middleware also rewrites `/` → default locale; this is a safe fallback. */
export default function RootPage() {
  redirect('/en');
}
