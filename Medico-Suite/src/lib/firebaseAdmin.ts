import admin from 'firebase-admin';
import fs from 'fs';

/**
 * Initialize Firebase Admin SDK
 * Priority:
 * 1) Use FIREBASE_SERVICE_ACCOUNT_JSON env var (full JSON string)
 * 2) Use FIREBASE_SERVICE_ACCOUNT_PATH env var (path to JSON key file)
 * 3) Fail fast with a helpful error (don't fall back silently)
 */

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountJson) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
      });
    } else if (serviceAccountPath) {
      const raw = fs.readFileSync(serviceAccountPath, { encoding: 'utf-8' });
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(raw)),
      });
    } else {
      // Fail fast: instruct developer what's missing instead of falling back silently
      throw new Error(
        'Firebase Admin initialization failed: set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH in your environment (see README).' 
      );
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    // Re-throw so server startup clearly fails with an actionable message
    throw error;
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
