import { LoginPage } from '@/pages/LoginPage';
import { completeGoogleRedirect, initAuthPersistence, subscribeAuth } from '@/shared/lib/auth';
import { queryClient } from '@/shared/lib/queryClient';
import { clearStorageCache, subscribeUserData } from '@/shared/storage/firestoreAdapter';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseGate>{children}</FirebaseGate>
    </QueryClientProvider>
  );
}

function FirebaseGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    let stopData = () => {};
    let stopAuth = () => {};
    let cancelled = false;

    void (async () => {
      try {
        await initAuthPersistence();
        await completeGoogleRedirect();
      } catch (caught) {
        if (!cancelled) {
          setLoginError(caught instanceof Error ? caught.message : '로그인에 실패했습니다.');
        }
      }

      if (cancelled) return;

      stopAuth = subscribeAuth((user) => {
        stopData();
        clearStorageCache();
        void queryClient.removeQueries({ queryKey: ['tasks'] });
        void queryClient.removeQueries({ queryKey: ['groups'] });
        void queryClient.removeQueries({ queryKey: ['settings'] });

        if (!user) {
          setSignedIn(false);
          setReady(true);
          return;
        }

        try {
          stopData = subscribeUserData(() => {
            void queryClient.invalidateQueries({ queryKey: ['tasks'] });
            void queryClient.invalidateQueries({ queryKey: ['groups'] });
            void queryClient.invalidateQueries({ queryKey: ['settings'] });
          });
          setSignedIn(true);
          setReady(true);
          setError(null);
          setLoginError(null);
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : 'Firebase 연결에 실패했습니다.');
          setReady(true);
        }
      });
    })();

    return () => {
      cancelled = true;
      stopAuth();
      stopData();
    };
  }, []);

  if (error) {
    return (
      <div className="grid h-full place-items-center bg-canvas px-6 text-center text-sm text-muted">
        {error}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="grid h-full place-items-center bg-canvas text-sm text-muted">불러오는 중</div>
    );
  }

  if (!signedIn) {
    return <LoginPage initialError={loginError} />;
  }

  return children;
}
