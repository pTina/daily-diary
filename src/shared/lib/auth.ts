import { auth } from '@/shared/lib/firebase';
import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  linkWithPopup,
  onAuthStateChanged,
  setPersistence,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

const googleProvider = () => new GoogleAuthProvider();

export async function initAuthPersistence() {
  await setPersistence(auth, browserLocalPersistence);
}

export function subscribeAuth(onUser: (user: User | null) => void) {
  return onAuthStateChanged(auth, onUser);
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [ready, setReady] = useState(Boolean(auth.currentUser));

  useEffect(() => {
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setReady(true);
    });
  }, []);

  return { user, ready };
}

export function requireUid() {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('로그인이 필요합니다.');
  }
  return uid;
}

export function isGoogleUser(user: User | null) {
  return Boolean(user?.providerData.some((provider) => provider.providerId === 'google.com'));
}

export async function signInWithGoogle() {
  const provider = googleProvider();
  const current = auth.currentUser;

  if (current?.isAnonymous) {
    try {
      await linkWithPopup(current, provider);
      return;
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/credential-already-in-use') {
        const credential = GoogleAuthProvider.credentialFromError(error);
        if (credential) {
          await signInWithCredential(auth, credential);
          return;
        }
      }
      throw error;
    }
  }

  await signInWithPopup(auth, provider);
}

export function logOut() {
  return signOut(auth);
}
