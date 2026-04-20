// Firebase configuration - mock for development
// In production, replace with real Firebase credentials

// Using mock auth for development - no Firebase initialization needed
console.log('[Shadhee] Using mock authentication for development');

export type FirebaseConfig = {
  app: null;
  auth: null;
  db: null;
  storage: null;
};

export const app: null = null;
export const auth: null = null;
export const db: null = null;
export const storage: null = null;

const firebaseConfig: FirebaseConfig = {
  app,
  auth,
  db,
  storage,
};

export default firebaseConfig;
