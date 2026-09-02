import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: [join(__dirname, '../.env'), join(__dirname, '.env')] });

let app;

if (!admin.apps.length) {
  try {
    let serviceAccount;

    // Option 1: Load from JSON file path
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const filePath = join(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      serviceAccount = JSON.parse(readFileSync(filePath, 'utf8'));
    }
    // Option 2: Load from JSON string env var
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }

    if (serviceAccount) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback: use application default credentials (for Cloud Run / GCP)
      app = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }

    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin init error:', error.message);
    console.warn('⚠️  Running without Firebase Admin — add your service account to .env');
  }
} else {
  app = admin.apps[0];
}

export const db = admin.apps.length ? admin.firestore() : null;
export const auth = admin.apps.length ? admin.auth() : null;
export default admin;
