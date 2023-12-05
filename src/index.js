import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ContextWrapper from "./context/ContextWrapper";
// import { useAuthContext } from './context/userContext';
import { AuthProvider } from './context/userContext';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";



/** Firebase 設定 ---------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCqQZh3zE_1UH4rKx88PyjMRieV9t-7A3g",
  authDomain: "vol-9-hackathon.firebaseapp.com",
  projectId: "vol-9-hackathon",
  storageBucket: "vol-9-hackathon.appspot.com",
  messagingSenderId: "204890033321",
  appId: "1:204890033321:web:b3f60102c800c8c49e2db8",
  measurementId: "G-Z8G55SP15Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ContextWrapper>
        <App />
      </ContextWrapper>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
