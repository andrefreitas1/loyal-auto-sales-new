'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Verificar se existe um token no localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </>
  );
} 