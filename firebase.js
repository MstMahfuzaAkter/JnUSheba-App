
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpHqBfFq95Yfmaw5VaczyjHVnT_vXBy-c",
  authDomain: "jnusheba.firebaseapp.com",
  projectId: "jnusheba",
  storageBucket: "jnusheba.firebasestorage.app",
  messagingSenderId: "339043031251",
  appId: "1:339043031251:web:8b23d1d04ffc0394b99c26"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth instance
export const auth = getAuth(app);
