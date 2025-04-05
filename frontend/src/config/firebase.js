import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyD9kSN1Ac-6Tu6ghI7wxkHbrHO2UacF2ls",
    authDomain: "rlreactnative-6a1e3.firebaseapp.com",
    projectId: "rlreactnative-6a1e3",
    storageBucket: "rlreactnative-6a1e3.firebasestorage.app",
    messagingSenderId: "1070419234838",
    appId: "1:1070419234838:web:2109d2c644075cae292537"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const configureGoogleSignIn = () => {
    GoogleSignin.configure({ 
      webClientId: '1070419234838-s92ldi7eko6m5naoc50vf1hel9ma994o.apps.googleusercontent.com',
      offlineAccess: true,
    });
  };

export { auth, app};