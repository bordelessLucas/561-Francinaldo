import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function createFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
}

export const app = createFirebaseApp();

function getWebPersistence(): Persistence {
  // Web Auth export — not present in the RN typings used by Metro.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const authModule = require('firebase/auth') as {
    browserLocalPersistence: Persistence;
  };
  return authModule.browserLocalPersistence;
}

function getNativePersistence(): Persistence {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const authModule = require('firebase/auth') as {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  };
  return authModule.getReactNativePersistence(AsyncStorage);
}

function createAuth(): Auth {
  try {
    if (Platform.OS === 'web') {
      return initializeAuth(app, {
        persistence: getWebPersistence(),
      });
    }

    return initializeAuth(app, {
      persistence: getNativePersistence(),
    });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
