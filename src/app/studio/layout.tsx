import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sanity Studio',
  description: 'Content management for Eternal Capsule',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 