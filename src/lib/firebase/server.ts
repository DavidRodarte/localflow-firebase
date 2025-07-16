import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let app: App;
let auth: Auth;

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (projectId && clientEmail && privateKey) {
  const serviceAccount = {
    projectId,
    clientEmail,
    privateKey,
  };

  if (!getApps().length) {
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    app = getApp();
  }
  auth = getAuth(app);
} else {
  console.warn("Firebase Admin SDK not initialized. Missing environment variables.");
}

// @ts-ignore
export { app, auth };
