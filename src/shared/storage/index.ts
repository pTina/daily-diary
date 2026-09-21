import type { StorageAdapter } from './adapter';
import { firestoreAdapter } from './firestoreAdapter';

export const storage: StorageAdapter = firestoreAdapter;
