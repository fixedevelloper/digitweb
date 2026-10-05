import { redirect } from 'next/navigation';

// Le proxy (src/proxy.ts) renvoie vers /portal/login si la session est absente.
export default function PortalIndexPage() {
  redirect('/portal/dashboard');
}
