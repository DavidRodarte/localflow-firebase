
import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

let app: App;
let auth: Auth;
let db: Firestore;
let storage: Storage;

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (projectId && clientEmail && privateKey && storageBucket) {
  const serviceAccount = {
    projectId,
    clientEmail,
    privateKey,
  };

  if (!getApps().length) {
    app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: storageBucket,
    });
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.warn("Firebase Admin SDK not initialized. Missing environment variables.");
}

// @ts-ignore
export { app, auth, db, storage };
