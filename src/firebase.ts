import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

// Firebase solo en el cliente para Auth (login y token). Los datos van siempre por la API: Firestore no se importa.
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);

// Para probar en local sin tocar el proyecto real: VITE_FIREBASE_AUTH_EMULATOR=http://127.0.0.1:9099
const emulador = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR;
if (emulador) connectAuthEmulator(auth, emulador, { disableWarnings: true });
