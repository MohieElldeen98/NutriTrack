import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDK2Tu8l1Kwr4VfHHWasdzE-DKInjs3NXY",
  authDomain: "nutrition-tracker-3ccdb.firebaseapp.com",
  projectId: "nutrition-tracker-3ccdb",
  storageBucket: "nutrition-tracker-3ccdb.firebasestorage.app",
  messagingSenderId: "530461970857",
  appId: "1:530461970857:web:4e67dc66403d12421234b8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { setPersistence, browserLocalPersistence, browserSessionPersistence };
