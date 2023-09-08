import './App.css';
import React, { useEffect, useContext} from 'react';
import Sidebar from "./components/Sidebar";
import Calendar from './components/Calendar/Calendar';
import HamburgerMenu from './components/HamburgerMenu';
import Login from './components/Login';
import Home from "./components/Home/Home";
import FooterMenu from './components/FooterMenu';
import Graph from './components/Graph';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Setting from './components/Setting';
// import LiveCamera from './components/TrainingCamera/LiveCamera';
import PoseDetection from './components/TrainingCamera/LiveCamera';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import GlobalContext from './context/GlobalContext';
import { collection, setDoc, doc, getDoc } from "firebase/firestore";
import dayjs from "dayjs";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqQZh3zE_1UH4rKx88PyjMRieV9t-7A3g",
  authDomain: "vol-9-hackathon.firebaseapp.com",
  projectId: "vol-9-hackathon",
  storageBucket: "vol-9-hackathon.appspot.com",
  messagingSenderId: "204890033321",
  appId: "1:204890033321:web:b3f60102c800c8c49e2db8",
  measurementId: "G-Z8G55SP15Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
let didInit = false;

function App() {

  const { setUserTrainingData } = useContext(GlobalContext);

  const Auth = () => {
    const res = localStorage.length >= 2 ? true : false;
    if (!res) {
        return res;
    }
    if (localStorage.getItem("Login") !== "yes") {
        return false;
    }

    return true;
  }
  
  const LoggedIn = Auth();
  const UserId = localStorage.getItem("UserId");
  const Today = dayjs(Date.now()).format("YYYY/MM/DD").toString();

  useEffect(() => {
    const getUserTrainingData = async (UserId) => {
      const TrainingRef = doc(db, "TrainingData", UserId);
      const TrainingSnap = await getDoc(TrainingRef);
    
      if (TrainingSnap.exists()) {
        const result = TrainingSnap.data().TrainingData
        return result;
      } else {
        // docSnap.data() will be undefined in this case
        
        const defaultData = {
          TrainingData : {
            [Today] : {
              target : {
                AbsTraining : 30,
                LegTraining : 30,
                PectoralTraining : 30,
              },
              training : {
                AbsTraining : 0,
                LegTraining : 0,
                PectoralTraining : 0,
              }
            }
          },
        };
    
        const UploadCoordinate = collection(db, "TrainingData");
        console.log(defaultData, didInit);
        await setDoc(doc(UploadCoordinate, UserId), defaultData);
        
        return defaultData
      }
    }

    return async() => {
      if (LoggedIn && !didInit) {
        const result = await getUserTrainingData(UserId);

        if (result[Today] === undefined) {
          result[Today] = {
            target : {
              "AbsTraining" : 30,
              "LegTraining" : 30,
              "PectoralTraining" : 30,
            },
            training : {
              "AbsTraining" : 0,
              "LegTraining" : 0,
              "PectoralTraining" : 0,
            }
          }
          await setDoc(doc(collection(db,"TrainingData"), UserId), result);
        }
        
        
        setUserTrainingData(result);
        console.log(result)

        didInit = true;
      }
    }
  }, [LoggedIn, UserId, setUserTrainingData])

  return (
    <>
      {LoggedIn ? <BrowserRouter>
      <HamburgerMenu />
      <div className='App'>
        <Sidebar />
        <Switch>
          <Route exact path="/">
            <Home
            val="てすと"
             />
          </Route>
          <Route path="/calendar">
            <Calendar />
          </Route>
          
          <Route path='/graph'>
            <Graph />
          </Route>
          
          <Route path="/setting">
            <Setting />
          </Route>

          <Route path='/training'>
            {/* <LiveCamera /> */}
            < PoseDetection />
          </Route>
          
        </Switch>
      </div>
      <FooterMenu />
    </BrowserRouter> : <Login />}
    </>
  );
}

export default App;
