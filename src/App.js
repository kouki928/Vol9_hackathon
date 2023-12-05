import './App.css';
import React, { useEffect, useContext, } from 'react';
import Sidebar from "./components/Sidebar";
import Calendar from './components/Calendar/Calendar';
import HamburgerMenu from './components/HamburgerMenu';
import Login from './components/Login';
import Home from "./components/Home/Home";
import FooterMenu from './components/FooterMenu';
import Graph from './components/Graph';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Setting from './components/Coupon/Setting';
import PoseDetection from './components/TrainingCamera/LiveCamera';

import GlobalContext from './context/GlobalContext';
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, setDoc, doc, getDoc } from "firebase/firestore";
import dayjs from "dayjs";

import { auth, db } from './index';
import Loading from './components/Loading';



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

function App() {

  const { userId, setUserId, setUserTrainingData, userTrainingData } = useContext(GlobalContext);
  const [user, loading, error] = useAuthState(auth);
  const Today = dayjs(Date.now()).format("YYYY/MM/DD").toString();

  useEffect(() => {

    setUserId(user !== null ? user.uid : "");

    async function getUserTrainingData() {

      const TrainingRef = doc(db, "TrainingData", userId);
      console.log(userId)
      const docRef = await getDoc(TrainingRef);
    
      if (docRef.exists()) {
        const result = await docRef.data().TrainingData;
        return result
      }else{
        console.log("Nothing")
      }
    }

    if (userId !== "") {
      getUserTrainingData().then(result => {
        if (result[Today] === undefined) {
          result[Today] = createTrainingMenu()
          setUserTrainingData(result)
          setDoc(doc(collection(db,"TrainingData"), userId), {TrainingData : result})
        }else{
          setUserTrainingData(result)
        }
      })
    }

    return () => {
      console.log("Anmounted")
    }
  }, [user, loading, error, userId, Today, setUserTrainingData, setUserId])//[LoggedIn, UserId, Today, setUserTrainingData])

  /**ローディング中 ----------------------------------------------------------------- */
  if (loading) {
    return (<Loading></Loading>)
  }

  /** ロード後かつ ログインしていない時 ------------------------------------------------- */
  else if (loading !== true && user === null){
    return (<Login></Login>)
  }

  /* エラー発生時 -------------------------------------------------------------------------*/
  else if (error) {
    return (<>{error}</>)
  }
  
  /* ローディング後かつログインしている時 ---------------------------------------------------- */
  else{

    if (isEmpty(userTrainingData)){
      return (<Loading></Loading>)
    }

    return (
    <>
    <BrowserRouter>
      <HamburgerMenu />
      <div className='App'>
        <Sidebar />
        <Switch>
          <Route exact path="/">
            <Home userTrainingData={userTrainingData} />
          </Route>
          <Route path="/calendar">
            <Calendar userTrainingData={userTrainingData} />
          </Route>
          
          <Route path='/graph'>
            <Graph userTrainingData={userTrainingData}/>
          </Route>
          
          <Route path="/setting">
            <Setting />
          </Route>

          <Route path='/training'>
            {/* <LiveCamera /> */}
            < PoseDetection userTrainingData={userTrainingData} userId={userId}/>
          </Route>
          
        </Switch>
      </div>
      <FooterMenu />
    </BrowserRouter>
    </>
  );}
}


/** createTrainingMenu ----------------------------------------------------------
 * menuを生成し返す関数
 ----------------------------------------------------------------------------- */
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
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0
}

export default App;

// 廃棄コード置き場。どこかで再利用するかもしれない ------------------------------------------------------------------- .

      // const result = await (await getDoc(TrainingRef)).data().TrainingData;
      // return result;
    
      // if (TrainingSnap.exists()) {
      //   const result = TrainingSnap.data().TrainingData
      //   return result;
      // } else {
      //   // docSnap.data() will be undefined in this case
      //   let base = parseInt(localStorage.getItem("base"))
      //   const defaultData = {
      //     TrainingData : {
      //       [Today] : {
      //         target : {
      //           AbsTraining : base,
      //           LegTraining : base,
      //           PectoralTraining : base,
      //         },
      //         training : {
      //           AbsTraining : 0,
      //           LegTraining : 0,
      //           PectoralTraining : 0,
      //         }
      //       }
      //     },
      //   };
    
        // const UploadCoordinate = collection(db, "TrainingData");
        // await setDoc(doc(UploadCoordinate, UserId), defaultData);
        
        // return defaultData.TrainingData
      // }
    // }