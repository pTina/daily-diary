import { auth } from '@/shared/lib/firebase';
import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getRedirectResult,
  linkWithPopup,
  linkWithRedirect,
  onAuthStateChanged,
  setPersistence,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

const googleProvider = () => new GoogleAuthProvider();

function prefersRedirectSignIn() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return iOS || /Android/i.test(ua);
}

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

export async function completeGoogleRedirect() {
  await getRedirectResult(auth);
}

export async function signInWithGoogle() {
  const provider = googleProvider();
  const current = auth.currentUser;

  if (prefersRedirectSignIn()) {
    if (current?.isAnonymous) {
      await linkWithRedirect(current, provider);
      return;
    }
    await signInWithRedirect(auth, provider);
    return;
  }

  try {
    await signInWithGooglePopup(current, provider);
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      (error.code === 'auth/popup-blocked' ||
        error.code === 'auth/operation-not-supported-in-this-environment')
    ) {
      if (current?.isAnonymous) {
        await linkWithRedirect(current, provider);
        return;
      }
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
}

async function signInWithGooglePopup(current: User | null, provider: GoogleAuthProvider) {
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
