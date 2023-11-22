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
import Setting from './components/Coupon/Setting';
// import LiveCamera from './components/TrainingCamera/LiveCamera';
import PoseDetection from './components/TrainingCamera/LiveCamera';
// import firebase from "firebase/firebase";
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
export const app = initializeApp(firebaseConfig);
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

  const createTrainingMenu = () => {
    let Abs = 0;
    let Leg = 0;
    let Pectoral = 0;
    let cnt = 0;
    let days = 0
    let addCount = 0;
    const userTrainingData = JSON.parse(localStorage.getItem("userTrainingData"))
    for (var i=1; i<3; i++){
      let pastday = dayjs().add(-i,"day").format("YYYY/MM/DD").toString()
      if (userTrainingData[pastday] !== undefined){
        days++;
        Abs += userTrainingData[pastday]["target"]["AbsTraining"] + userTrainingData[pastday]["training"]["AbsTraining"];
        Leg += userTrainingData[pastday]["target"]["LegTraining"] + userTrainingData[pastday]["training"]["LegTraining"];
        Pectoral += userTrainingData[pastday]["target"]["PectoralTraining"]  + userTrainingData[pastday]["target"]["PectoralTraining"];

        if (userTrainingData[pastday]["target"]["AbsTraining"] === userTrainingData[pastday]["training"]["AbsTraining"]){
          cnt++;
        }
        if (userTrainingData[pastday]["target"]["LegTraining"] === userTrainingData[pastday]["training"]["LegTraining"]){
          cnt++;
        }
        if (userTrainingData[pastday]["target"]["PectoralTraining"] === userTrainingData[pastday]["training"]["PectoralTraining"]){
          cnt++;
        }
      }
    }

    if (cnt === days*3){
      addCount = 10;
    }else if (cnt > days*2) {
      addCount = 5
    }

    return {
      target : {
        "AbsTraining" : days !== 0 ? Abs / (days*2) | 0 + addCount : 30,
        "LegTraining" : days !== 0 ? Leg / (days*2) | 0 + addCount : 30,
        "PectoralTraining" : days !== 0 ? Pectoral / (days*2) | 0 + addCount : 30,
      },
      training : {
        "AbsTraining" : 0,
        "LegTraining" : 0,
        "PectoralTraining" : 0,
      }
    }
  }

  useEffect(() => {
    const getUserTrainingData = async (UserId) => {
      const TrainingRef = doc(db, "TrainingData", UserId);
      const TrainingSnap = await getDoc(TrainingRef);
    
      if (TrainingSnap.exists()) {
        const result = TrainingSnap.data().TrainingData
        return result;
      } else {
        // docSnap.data() will be undefined in this case
        let base = parseInt(localStorage.getItem("base"))
        const defaultData = {
          TrainingData : {
            [Today] : {
              target : {
                AbsTraining : base,
                LegTraining : base,
                PectoralTraining : base,
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
        await setDoc(doc(UploadCoordinate, UserId), defaultData);
        
        return defaultData.TrainingData
      }
    }

    return async() => {
      if (LoggedIn && !didInit) {
        const result = await getUserTrainingData(UserId);

        if (result[Today] === undefined) {
          
          result[Today] = createTrainingMenu()
      
          await setDoc(doc(collection(db,"TrainingData"), UserId), {TrainingData : result});
        }
        
        setUserTrainingData(result);
        localStorage.setItem("userTrainingData", JSON.stringify(result))
        didInit = true;

        console.log(result)
      }
    }
  }, [LoggedIn, UserId, Today, setUserTrainingData])

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
