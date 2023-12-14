import './App.css';
import React, { useEffect, useContext, useState} from 'react';
import Sidebar from "./components/Sidebar";
import Calendar from './components/Calendar/Calendar';
import HamburgerMenu from './components/HamburgerMenu';
import Login from './components/Login';
import Home from "./components/Home/Home";
import FooterMenu from './components/FooterMenu';
import Graph from './components/Graph';
import UserPage from './components/UserPage';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Setting from './components/Coupon/Setting';
import PoseDetection from './components/TrainingCamera/LiveCamera';

import GlobalContext from './context/GlobalContext';
import { useAuthState } from "react-firebase-hooks/auth"
import { collection, setDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import dayjs from "dayjs";

import { auth, db } from './index';
import Loading from './components/Loading';
import { goal, gender, frequency } from './components/utility/utilitys';

// import { getData } from '../public/model';

// getData()



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

function App() {

  const { userId, setUserId, setUserTrainingData, userTrainingData } = useContext(GlobalContext);
  const [user, loading, error] = useAuthState(auth);
  const [ firstFlag, setFirstFlag ] = useState(false);
  const [complite , setComplite] = useState(false);
  const Today = dayjs(Date.now()).format("YYYY/MM/DD").toString();

  const [parentStyle, setParentStyle] = useState(false);

  const handleStyleChange = (newStyle) => {
    setParentStyle(newStyle);
  };

  async function getUserTrainingData() {

    const TrainingRef = doc(db, "TrainingData", userId);
    const docRef = await getDoc(TrainingRef);
  
    if (docRef.exists()) {
      const result = docRef.data();
      return result
    
    // 存在しない = さっき登録したばかりのユーザー
    }else{
      return false
    }
  }

  

  useEffect(() => {

    const parsonSelection = async (data, result) => {
      // 目標BMIに基づく理想体重の算出
      console.log(data, "!!Error!!")
    
      const url = "https://vol9-hackathon-predictionapi.onrender.com/target/"
      fetch(url, {
        method : "POST",
        headers: {
          "Content-Type": "application/json",
          "accept" : "application/json"
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body : JSON.stringify(data),
      }).then(response => response.json()).then((response) => {
        console.log(response)
    
        const data = {
          target : {
            AbsTraining : response.AbsTraining,
            LegTraining : response.LegTraining,
            PectoralTraining : response.PectoralTraining,
          },
          training : {
            AbsTraining : 0,
            LegTraining : 0,
            PectoralTraining : 0,
          },
          totalTime : {
            AbsTraining : 0,
            LegTraining : 0,
            PectoralTraining : 0
          }
        }
        
        console.log(result)
        result.TrainingData[Today] = data;
        // result.weights[Today] = result.weights[dayjs().add(-1, "day").format("YYYY/MM/DD")] === undefined ?
        // result.personalData.weight : result.weights[dayjs().add(-1, "day").format("YYYY/MM/DD")]
        result.weights[Today] = result.personalData.weight
        setUserTrainingData(result)
        console.log(result)
        setDoc(doc(collection(db,"TrainingData"), userId), {
          TrainingData : result.TrainingData,
          personalData : result.personalData,
          weights      : result.weights,
        }).catch(error => {
          console.log(error)
        })
        
      })
    
      // 新しいデータの構築
      // const new_data = new Float32Array([mappedGender, mappedFrequency, Age, mappedGoal, Height, Weight, idealWeight, APreviousDayCompletion, AWeeklyCompletion, APreviousDayTarget, LPreviousDayCompletion, LWeeklyCompletion, LPreviousDayTarget, PPreviousDayCompletion, PWeeklyCompletion, PPreviousDayTarget]);
    
      // 予測＆格納
    
    }

    const createMenu = async (result) => {
      const personalData = result.personalData;
      const trainingData = result.TrainingData;
      var i = 0;
    
      /**直近7日間のトレーニングデータを取得し、各種目ごとに配列で整形 */
      let WeekAbsTrainingData = [];
      let WeekLegTrainingData = [];
      let WeekPectoralTrainingData = [];
      // let TodayTrainingData = trainingData[dayjs().format("YYYY/MM/DD")]["training"];
      let TodayTrainingData;
      for (i = 0; i < 7; i++) {
          if (trainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")] !== undefined) {
              TodayTrainingData = trainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")]["training"];
              WeekAbsTrainingData.push(TodayTrainingData["AbsTraining"]);
              WeekLegTrainingData.push(TodayTrainingData["LegTraining"]);
              WeekPectoralTrainingData.push(TodayTrainingData["PectoralTraining"]);
          } else {
              WeekAbsTrainingData.push(0);
              WeekLegTrainingData.push(0);
              WeekPectoralTrainingData.push(0);
          }
      }
    
      // 直近7日間の目標回数を取得し、各種目ごとに配列に整形
      let WeekAbsTargetData = [];
      let WeekLegTargetData = [];
      let WeekPectoralTargetData = [];
      // let TodayTargetData = trainingData[dayjs().format("YYYY/MM/DD")]["target"];
      let TodayTargetData;

      for (i = 0; i < 7; i++) {
          if (trainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")] !== undefined) {
              TodayTargetData = trainingData[dayjs().add(-i, "day").format("YYYY/MM/DD")]["target"];
              WeekAbsTargetData.push(TodayTargetData["AbsTraining"]);
              WeekLegTargetData.push(TodayTargetData["LegTraining"]);
              WeekPectoralTargetData.push(TodayTargetData["PectoralTraining"]);
          } else {
              WeekAbsTargetData.push(0);
              WeekLegTargetData.push(0);
              WeekPectoralTargetData.push(0);
          }
      }
    
    
      const sendData = {
        Gender : gender[personalData.gender],
        Frequency : frequency[personalData.frequency],
        Age : personalData.age,
        Goal : goal[personalData.goal],
        Height : personalData.height,
        Weight : personalData.weight,
        APreviousDayCompletion : 
        WeekAbsTargetData[0] !== 0 ? WeekAbsTrainingData[0] / WeekAbsTargetData[0] : 0,
        AWeeklyCompletion : 
        sum(WeekAbsTargetData) !== 0 ? sum(WeekAbsTrainingData) / sum(WeekAbsTargetData) : 0,
        APreviousDayTarget : WeekAbsTargetData[0],
        LPreviousDayCompletion :
        WeekLegTargetData[0] !== 0 ? WeekLegTrainingData[0] / WeekLegTargetData[0] : 0,
        LWeeklyCompletion : 
        sum(WeekLegTargetData) !== 0 ? sum(WeekLegTrainingData) / sum(WeekLegTargetData) : 0,
        LPreviousDayTarget : WeekLegTargetData[0],
        PPreviousDayCompletion :
        WeekPectoralTargetData[0] !== 0 ? WeekPectoralTrainingData[0] / WeekPectoralTargetData[0] : 0,
        PWeeklyCompletion :
        sum(WeekPectoralTargetData) !== 0 ? sum(WeekPectoralTrainingData) / sum(WeekPectoralTargetData) : 0,
        PPreviousDayTarget : WeekPectoralTargetData[0],
      }
  
      parsonSelection(sendData, result)
    
    }

    setUserId(user !== null ? user.uid : "");

    if (userId !== ""){
      getUserTrainingData().then(result => {

        if (result === false) {
          setFirstFlag(true)
        }

        else if (result.TrainingData[Today] === undefined) {
          // result.TrainingData[Today] = createTrainingMenu(result.TrainingData);
          createMenu(result)

        }else{
          // createMenu(result)
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

    console.log(firstFlag)

    if (isEmpty(userTrainingData) && !firstFlag){
      return (<Loading></Loading>)
    }

    return (
    <>
    <BrowserRouter>
      {parentStyle ? <></> : <HamburgerMenu userId={userId} /> }
      <div className='App'>
        <Sidebar userId={userId}/>
        <Switch>
          <Route exact path="/">
            <Home userTrainingData={userTrainingData.TrainingData} firstFlag={firstFlag} userId={userId}
            personalData={userTrainingData.personalData} weights={userTrainingData.weights} />
          </Route>
          <Route path="/calendar">
            <Calendar userTrainingData={userTrainingData.TrainingData} />
          </Route>
          
          <Route path='/graph'>
            <Graph userTrainingData={userTrainingData.TrainingData} personalData={userTrainingData.personalData}
            weights={userTrainingData.weights}/>
          </Route>
          
          <Route path="/setting">
            <Setting userId={userId} userTrainingData={userTrainingData.TrainingData} />
          </Route>
          
          <Route path="/user">
            <UserPage personalData={userTrainingData.personalData} userId={userId} weights={userTrainingData.weights}/>
          </Route>

          <Route path='/training'>
            {/* <LiveCamera /> */}
            < PoseDetection userTrainingData={userTrainingData.TrainingData} userId={userId} onChangeStyle={handleStyleChange} />
          </Route>
          
        </Switch>
      </div>
      {parentStyle ? <></> : <FooterMenu />}
    </BrowserRouter>
    </>
  );}
}



const sum = (arr) => {
  const result = arr.reduce(function(sum, element){
    return sum + element;
  }, 0);

  return result;
}


/** createTrainingMenu ----------------------------------------------------------
 * menuを生成し返す関数
 ----------------------------------------------------------------------------- */
const createTrainingMenu = (userTrainingData) => {
  let Abs = 0;
  let Leg = 0;
  let Pectoral = 0;
  let cnt = 0;
  let days = 0
  let addCount = 0;
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
    },
    totalTime : {
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