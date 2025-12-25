
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace these placeholders with your actual Firebase project configuration
// These should ideally be environment variables for production
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase only if the config is valid
let app;
let auth: any = null;
let db: any = null;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn("Firebase not configured. Using simulated mode.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { auth, db };
