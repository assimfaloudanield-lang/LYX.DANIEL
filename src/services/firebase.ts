import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export { onAuthStateChanged };
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user) {
    await syncUserProfile(result.user);
  }
  return result.user;
}

export async function loginWithEmail(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    await syncUserProfile(result.user);
  }
  return result.user;
}

export async function registerWithEmail(email: string, pass: string, name?: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    await syncUserProfile(result.user, name);
  }
  return result.user;
}

export async function resetUserPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  await signOut(auth);
}

export async function syncUserProfile(user: FirebaseUser, customName?: string) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: customName || user.displayName || 'Membro Alpha',
        photoURL: user.photoURL || '',
        plan: 'Membro Alpha',
        voiceStyle: 'natural_balanced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn('Erro ao sincronizar perfil Firestore:', e);
  }
}
