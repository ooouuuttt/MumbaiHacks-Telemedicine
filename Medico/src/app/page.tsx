
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AppShell from '@/components/app-shell';
import AuthPage from '@/components/auth-page';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/icons';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-2 mb-4">
          <Logo className="w-8 h-8 animate-pulse" />
          <h1 className="text-2xl font-bold font-headline text-primary">
            Medico
          </h1>
        </div>
        <Skeleton className="w-full max-w-md h-96" />
      </div>
    );
  }

  if (user) {
    return <AppShell user={user} />;
  }

  return <AuthPage onSignIn={(signedInUser) => setUser(signedInUser)} />;
}
