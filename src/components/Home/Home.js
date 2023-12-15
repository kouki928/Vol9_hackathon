import React, {useRef, useState, useEffect} from 'react';
import macho from "../../images/macho.png";
import TrainingMenu from './TrainingMenu';
import { collection, doc, setDoc, updateDoc} from "firebase/firestore";
import { db } from '../..';
import dayjs from "dayjs";
import { goalToNum, goal, gender, frequency } from '../utility/utilitys';
import { Today } from '@mui/icons-material';
import Swal from 'sweetalert2';

function Home(props) {

  const { userTrainingData, firstFlag, userId, personalData, weights} = props;
  const [ testFlag, setTestFlag ] = useState(firstFlag);
  const genderRef = useRef(null);
  const trainingRef = useRef(null);
  const targetRef = useRef(null);
  const ageRef = useRef(null);
  const heightRef = useRef(null);
  const weightRef = useRef(null);

  let trainingData;

  useEffect(() => {
    if (!testFlag) {
      trainingData = userTrainingData;
    }
  })

  const createMenu =  async(sendData, personalData) => {

    console.log(sendData, personalData)

    const Today = dayjs(Date.now()).format("YYYY/MM/DD").toString();

    const url = "https://vol9-hackathon-predictionapi.onrender.com/target/"
    fetch(url, {
      method : "POST",
      headers: {
        "Content-Type": "application/json",
        "accept" : "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body : JSON.stringify(sendData),
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

      setDoc(doc(collection(db, "TrainingData"), userId), {
        TrainingData : {
          [Today] : data
        },
        personalData : personalData,
        weights : {
          [Today] : weightRef.current.value
        }
      })

      trainingData = { [Today] : data }

    }).then(() => {
      setTestFlag(false)
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

    console.log(personalData)

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

    // trainingData = userTrainingData;
    // console.log(trainingData)
    // updateDoc(doc(collection(db, "TrainingData"), userId), {
    //   personalData : personalData,
    // })
    // setTestFlag(false);

    await createMenu(sendData, personalData).catch((error) => {
      console.log(error)
    })

  }

  const getWeight = async () => {

    Swal.fire({
      title: "計測しますか?",
      text: "乗り終えたら「開始」を押してください。",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText : "戻る",
      confirmButtonText: "開始"
      
    }).then((result) => {
      if (result.isConfirmed) {

        const ip = "192.168.0.9"
        // const url = `http://${ip}:8000/`
        const url = "https://2bd4-240b-c020-4c2-bb06-2927-b74-2999-6ee3.ngrok-free.app/"

        fetch(url, {
            method : "GET",
            credentials: 'include',
        }).then(response => response.json()).then(response => {

          console.log(weights)

          const Today = dayjs(Date.now()).format("YYYY/MM/DD").toString();
          const weight = response.weight;
          personalData.weight = weight;
          weights[Today] = weight

          console.log(weights)

          updateDoc(doc(collection(db, "TrainingData"), userId), {
            personalData : personalData,
            weights : weights
          })

          Swal.fire({
            title: "計測完了！",
            text: `${weight} g でした。`,
            icon: "success"
          });

        }).catch(e => {
            console.log(e)
        })
        
      }
    });

    
  }

  console.log("OK?")

  return (
    // {firstFlag ? <InitSetting /> :<TrainingMenu userTrainingData={userTrainingData}/>}
    <div className='Main'>

    {/* { testFlag && trainingData === userTrainingData ?  */}
    { testFlag ? 
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

            <button className='LoginButton' type='button' onClick={initSetting}> メニュー生成</button>
        </form>
      </div>
      : 
    
      <div className='StartTraining'>
        <img src={macho} alt='マッチョ' className='TrainingImage'></img>
        <h2>トレーニングを始めましょう!</h2>
        <p className='discription'>
          ボタンを押すとカメラが起動し、<br></br>計測が開始されます。
        </p>
      
      <TrainingMenu userTrainingData={userTrainingData}/>
      <button onClick={getWeight} className='getWeight'>体重測定</button>

    
    </div>}
    </div>

  )
}

export default Home



