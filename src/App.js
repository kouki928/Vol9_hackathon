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
import { Tensor, InferenceSession } from 'onnxjs';
import { goal, gender, frequency } from './components/utility/utilitys';




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

  const createMenu = async (result, userId) => {
    const personalData = result.personalData;
    const trainingData = result.TrainingData;
    var i = 0;
  
    /**直近7日間のトレーニングデータを取得し、各種目ごとに配列で整形 */
    let WeekAbsTrainingData = [];
    let WeekLegTrainingData = [];
    let WeekPectoralTrainingData = [];
    let TodayTrainingData = trainingData[dayjs().format("YYYY/MM/DD")]["training"];
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
    let TodayTargetData = trainingData[dayjs().format("YYYY/MM/DD")]["target"];
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

    const Today = dayjs(Date.now()).format("YYYY/MM/DD").toString();

    parsonSelection(sendData).then(result => {
      console.log(result)
    }).catch(error => {
      console.log(error)
    })

    const data = {
      target : {
        AbsTraining : 0,
        LegTraining : 0,
        PectoralTraining : 0,
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

    

    // result.TrainingData[Today] = data;

    // setUserTrainingData(result.TrainingData)
    // setDoc(doc(collection(db,"TrainingData"), userId), {
    //   TrainingData : result.TrainingData,
    //   personalData : result.personalData
    // })
  
  }

  useEffect(() => {

    setUserId(user !== null ? user.uid : "");

    if (userId !== ""){
      getUserTrainingData().then(result => {

        if (result === false) {
          setFirstFlag(true)
        }

        else if (result.TrainingData[Today] === undefined) {
          result.TrainingData[Today] = createTrainingMenu(result.TrainingData);
          // result.TrainingData[Today] = await createMenu(result)
          setUserTrainingData(result)
          setDoc(doc(collection(db,"TrainingData"), userId), {
            TrainingData : result.TrainingData,
            personalData : result.personalData
          })
        }else{
          createMenu(result)
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
            <Home userTrainingData={userTrainingData.TrainingData} firstFlag={firstFlag} userId={userId} />
          </Route>
          <Route path="/calendar">
            <Calendar userTrainingData={userTrainingData.TrainingData} />
          </Route>
          
          <Route path='/graph'>
            <Graph userTrainingData={userTrainingData.TrainingData}/>
          </Route>
          
          <Route path="/setting">
            <Setting />
          </Route>
          
          <Route path="/user">
            <UserPage personalData={userTrainingData.personalData} userId={userId}/>
          </Route>

          <Route path='/training'>
            {/* <LiveCamera /> */}
            < PoseDetection userTrainingData={userTrainingData.TrainingData} userId={userId}/>
          </Route>
          
        </Switch>
      </div>
      <FooterMenu />
    </BrowserRouter>
    </>
  );}
}


const parsonSelection = async (data) => {
  // 目標BMIに基づく理想体重の算出
  const goal_bmi = {
      "Male": { "MuscleStrength": 25.0, "WeightLoss": 22.0, "HealthMaintenance": 24.0 },
      "Female": { "MuscleStrength": 23.0, "WeightLoss": 20.0, "HealthMaintenance": 22.0 }
  };

  // 辞書から必要な情報を取得
  const Gender = data["Gender"];
  const Frequency = data["Frequency"];
  const Age = parseInt(data["Age"]);
  const Goal = data["Goal"];
  const Height = parseInt(data["Height"]);
  const Weight = parseFloat(data["Weight"]);

  // 目標BMIから理想体重を計算
  const ideal_bmi = goal_bmi[Gender][Goal];
  const idealWeight = Math.round(ideal_bmi * (Height / 100) ** 2, 1);

  // 文字列を数値に置換
  const gender_mapping = { "Male": 1, "Female": 2, "Other": 3 };
  const goal_mapping = { "MuscleStrength": 1, "WeightLoss": 2, "HealthMaintenance": 3 };
  const frequency_mapping = { "Low": 1, "Moderate": 2, "High": 3 };
  const mappedGender = gender_mapping[Gender] || Gender;
  const mappedGoal = goal_mapping[Goal] || Goal;
  const mappedFrequency = frequency_mapping[Frequency] || Frequency;

  // 部位ごとの目標回数を格納するオブジェクト
  const TargetRepsDict = {};

  // ALPを数値に変換
  const APreviousDayCompletion = parseFloat(data["APreviousDayCompletion"]);
  const AWeeklyCompletion = parseFloat(data["AWeeklyCompletion"]);
  const APreviousDayTarget = parseFloat(data["APreviousDayTarget"]);
  const LPreviousDayCompletion = parseFloat(data["LPreviousDayCompletion"]);
  const LWeeklyCompletion = parseFloat(data["LWeeklyCompletion"]);
  const LPreviousDayTarget = parseFloat(data["LPreviousDayTarget"]);
  const PPreviousDayCompletion = parseFloat(data["PPreviousDayCompletion"]);
  const PWeeklyCompletion = parseFloat(data["PWeeklyCompletion"]);
  const PPreviousDayTarget = parseFloat(data["PPreviousDayTarget"]);

  // 新しいデータの構築
  const new_data = new Float32Array([mappedGender, mappedFrequency, Age, mappedGoal, Height, Weight, idealWeight, APreviousDayCompletion, AWeeklyCompletion, APreviousDayTarget, LPreviousDayCompletion, LWeeklyCompletion, LPreviousDayTarget, PPreviousDayCompletion, PWeeklyCompletion, PPreviousDayTarget]);

  // 予測＆格納
  // const keys = ["A", "L", "P"];
  const keys = ["A"]
  for (const key of keys) {
      // ONNXモデルのダウンロード
      // const path = "src/models/userInfo_Amodel.onnx"
      const modelFile = `./models/userInfo_${key}model.onnx`;
      // const modelResponse = await fetch(modelFile);
      // const modelBuffer = await modelResponse.arrayBuffer();
      // const modelData = new Uint8Array(modelBuffer);

      // console.log(modelBuffer)

      // ONNXモデルのセッションの初期化
      // const session = new InferenceSession({ backendHint: 'webgl' });
      const session = new InferenceSession()
      await session.loadModel("./models/userInfo_Pmodel.onnx");
      console.log("Ok")
      const inputs = [
        new Tensor(new_data, "float32", [1,16]),
      ];

      const outputMap = await session.run(inputs);
      const outputTensor = outputMap.values().next().value;
      console.log(outputTensor)


      // await session.loadModel(modelData);

      // await session.loadModel(modelFile);

      // const inputTensor = new Tensor(new_data, 'float32', [1, 16]);
      // const res = await session.run([inputTensor]);

      // console.log(res)
      

      // エラー発生個所
      // session.loadModel(modelFile).then(() => {
      //   const inputTensor = new Tensor(new_data, 'float32', [1, 16]);
      // // 推論の実行
      //   session.run([inputTensor])
      //   .then((outputData) => {
      //     console.log(outputData)
      //     return outputData
      //   })
      // }).catch(error => {
      //   console.log(error)
      // })
  
      // 入力データのTensorの作成
      

      // 推論結果を格納
      // const category_mapping = { "A": "AbsTraining", "L": "LegTraining", "P": "PectoralTraining" };
      // TargetRepsDict[category_mapping[key]] = outputData.values().next().value.data[0];
  }
  // return TargetRepsDict;
}

// テストの実行
// parsonSelection(sendData).then(result => console.log(result));



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