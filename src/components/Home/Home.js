import React, {useRef, useState} from 'react';
import macho from "../../images/macho.png";
import TrainingMenu from './TrainingMenu';
import { collection, updateDoc, doc,} from "firebase/firestore";
import { db } from '../..';
import dayjs from "dayjs";
import { goalToNum, goal, gender, frequency } from '../utility/utilitys';

function Home(props) {

  const { userTrainingData, firstFlag, userId } = props;
  const [ testFlag, setTestFlag ] = useState(true);
  const genderRef = useRef(null);
  const trainingRef = useRef(null);
  const targetRef = useRef(null);
  const ageRef = useRef(null);
  const heightRef = useRef(null);
  const weightRef = useRef(null);

  let trainingData = userTrainingData;

  const createMenu =  async(sendData, personalData) => {

    const url = "https://example.com";
    const Today = dayjs(Date.now()).format("YYYY/MM/DD").toString();
  
    fetch(url, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sendData
      }),
    }).then(response => response.json()).then((result) => {

      const data = {
        [Today] : {
          target : result,
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
      }

      updateDoc(doc(db, "TrainingData", userId), {
        TrainingData : data,
        personalData : personalData,
      })

      return data;
    })
  }


  const initSetting = async () => {

    let cnt = 0

    if (heightRef.current.value.trim() === ""){
      alert("身長を入力")
      cnt++;
    }
    if (weightRef.current.value.trim() === ""){
      alert("体重を入力")
      cnt++;
    }
    if (ageRef.current.value.trim() === ""){
      alert("年齢を入力")
      cnt++;
    }

    if (cnt !== 0){
      return 0
    }

    const personalData = {
      height : heightRef.current.value,
      weight : weightRef.current.value,
      age    : ageRef.current.value,
      gender : genderRef.current.value,
      frequency : trainingRef.current.value,
      goal   : targetRef.current.value
    }

    const sendData = {
      Gender : gender[genderRef.current.value],
      Frequency : frequency[trainingRef.current.value],
      Age : ageRef.current.value,
      Goal : goal[targetRef.current.value],
      Height : heightRef.current.value,
      Weight : weightRef.current.value,
      APreviousDayCompletion : 0,
      AWeeklyCompletion : 0,
      APreviousDayTarget : 0,
      LPreviousDayCompletion : 0,
      LWeeklyCompletion : 0,
      LPreviousDayTarget : 0,
      PPreviousDayCompletion : 0,
      PWeeklyCompletion : 0,
      PPreviousDayTarget : 0,
    }

    // trainingData = await createMenu(sendData);
    trainingData = userTrainingData;
    console.log(trainingData)
    updateDoc(doc(db, "TrainingData", userId), {
      personalData : personalData,
    })
    setTestFlag(false);
  }

  return (
    // {firstFlag ? <InitSetting /> :<TrainingMenu userTrainingData={userTrainingData}/>}
    <div className='Main'>

    {/* { testFlag && trainingData === userTrainingData ?  */}
    { firstFlag && trainingData === userTrainingData ? 
      <div className='Form'>
        <form className='wrap'>
        <h2>あなたの事を教えて下さい</h2>
          <label className='InputLabel'>身長 : </label>
          <input type='number' ref={heightRef} ></input>

          <label className='InputLabel'>体重 : </label>
          <input type='number' ref={weightRef} ></input>

          <label className='InputLabel'>年齢 : </label>
          <input type='number' ref={ageRef} required></input>

            <label className='InputLabel'>性別 : </label>
            <select ref={genderRef}>
                <option value={"男"}>男</option>
                <option value={"女"}>女</option>
                <option value={"その他"}>その他</option>
            </select>

            <label className='InputLabel'>運動頻度 : </label>
            <select ref={trainingRef}>
                <option value={"0"}>習慣化している</option>
                <option value={"1"}>偶に運動する（規則性はない）</option>
                <option value={"2"}>全くしない</option>
            </select>

            <label className='InputLabel'>トレーニング目的 : </label>
            <select ref={targetRef}>
                <option value={"筋肉量UP"}>筋肉量UP</option>
                <option value={"ダイエット"}>ダイエット（体重を減らす）</option>
                <option value={"健康維持"}>健康維持</option>
            </select>

            <button className='LoginButton' type='submit' onClick={initSetting}> メニュー生成</button>
        </form>
      </div>
      : 
    
      <div className='StartTraining'>
        <img src={macho} alt='マッチョ' className='TrainingImage'></img>
        <h2>トレーニングを始めましょう!</h2>
        <p className='discription'>
          ボタンを押すとカメラが起動し、<br></br>計測が開始されます。
        </p>
      
      <TrainingMenu userTrainingData={trainingData}/>
    
    
    </div>}
    </div>

  )
}

export default Home



