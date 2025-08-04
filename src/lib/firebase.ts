import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "utsav-hisab",
  "appId": "1:374155150209:web:3ec58e4da71b791f2c5e80",
  "storageBucket": "utsav-hisab.firebasestorage.app",
  "apiKey": "AIzaSyDARhaLvnJqDG7mNHvo86ConPn0fpobpzU",
  "authDomain": "utsav-hisab.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "374155150209"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
