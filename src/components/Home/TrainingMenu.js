import React, { useContext } from 'react';
import VideocamIcon from '@mui/icons-material/Videocam';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { db } from '../../App';
import { collection, setDoc, doc, getDoc } from "firebase/firestore";


const MySwal = withReactContent(Swal)


function TrainingMenu() {

  const { setTrainingType, setUserTrainingData } = useContext(GlobalContext)  ;

  const Today = dayjs().format("YYYY/MM/DD");
  const UserId = localStorage.getItem("UserId");
  var userTrainingData;
  try {
    userTrainingData = JSON.parse(localStorage.getItem("userTrainingData"))
  }catch(e){
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

    const retn_userData = async () => {
      const result = await getUserTrainingData(UserId);

      if (result[Today] === undefined) {
        
        result[Today] = createTrainingMenu()
    
        await setDoc(doc(collection(db,"TrainingData"), UserId), {TrainingData : result});
      }
      
      setUserTrainingData(result);
      localStorage.setItem("userTrainingData", JSON.stringify(result))
  
      console.log(result)

      return result;
    }

    userTrainingData = retn_userData();
  }

  const TodayData = userTrainingData[Today]

  console.log(TodayData)
  if (TodayData === undefined) {
    return (<></>)
  }
  
  const Menu = [
    {
      title : "上体起こし",
      type  : "AbsTraining",
      count : TodayData["target"]["AbsTraining"] - TodayData["training"]["AbsTraining"],
      link  : "?classification=AbsTraining"
    },
    {
      title : "腕立て伏せ",
      type  : "PectoralTraining",
      count : TodayData["target"]["PectoralTraining"]- TodayData["training"]["PectoralTraining"],
      link  : "?classification=PectoralTraining"
    },
    {
      title : "スクワット",
      type  : "LegTraining",
      count : TodayData["target"]["LegTraining"]- TodayData["training"]["LegTraining"],
      link  : "?classification=LegTraining"
    },
  ]

  return (
    <div className='TrainingMenu'>
        <p>今日のトレーニング : </p>
        <ul>

          {Menu.map((value, key) => {
            return (
              <li key={key} className='TrainingText' onClick={
                () => {
                  setTrainingType(value.type);
                  value.count !== 0 ? window.location.href = `/training${value.link}` : MySwal.fire({
                    title : "完了済み！",
                    text : "今日は別のトレーニングを行いましょう！",
                    icon : "success"
                  });
                }
              }>
                <div className='StartButtonIcon'><VideocamIcon /></div>
                <div className='TrainingTitle'>{value.count !== 0 ? value.title : <s>{value.title}</s>}</div>
                <div className='TrainingCount'>{value.count !== 0 ? <div>残り {value.count} 回</div> : <s>残り {value.count} 回</s>}</div>
                <div className='StartButtonAllow'><KeyboardArrowRightIcon /></div>
              </li>
            )
          })}
        </ul>
    </div>
  )
}

export default TrainingMenu