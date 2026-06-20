import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal - Zeta Data',
  description: 'Manage data packages and orders',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
