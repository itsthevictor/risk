import { notFound } from 'next/navigation';

// Unmatched paths under a locale render app/[lang]/not-found.tsx inside the layout.
export default function CatchAll() {
  notFound();
}
