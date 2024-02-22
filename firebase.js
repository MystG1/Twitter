import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCgsB9gbmC_8tAtxjVbxq1o_Ne60-8Xs0k",
  authDomain: "twitter-2b0e9.firebaseapp.com",
  projectId: "twitter-2b0e9",
  storageBucket: "twitter-2b0e9.appspot.com",
  messagingSenderId: "857231980782",
  appId: "1:857231980782:web:fcb5088454b47b9cc3dbff",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
