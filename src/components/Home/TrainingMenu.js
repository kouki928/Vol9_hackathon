import React, { useContext } from 'react';
import VideocamIcon from '@mui/icons-material/Videocam';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';

function TrainingMenu() {

  const { setTrainingType, userTrainingData } = useContext(GlobalContext)  

  if (userTrainingData === {}){
    return (<></>)
  }

  const TodayData = userTrainingData[dayjs().format("YYYY/MM/DD")]

  if (TodayData === undefined) {
    return (<></>)
  }
  
  const Menu = [
    {
      title : "腹筋",
      type  : "AbsTraining",
      count : TodayData["target"]["AbsTraining"],
      link  : "?classification=AbsTraining"
    },
    {
      title : "胸筋",
      type  : "PectoralTraining",
      count : TodayData["target"]["PectoralTraining"],
      link  : "?classification=PectoralTraining"
    },
    {
      title : "足筋",
      type  : "LegTraining",
      count : TodayData["target"]["LegTraining"],
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
                  window.location.href = `/training${value.link}`;
                }
              }>
                <div className='StartButtonIcon'><VideocamIcon /></div>
                <div className='TrainingTitle'>{value.title}</div>
                <div className='TrainingCount'>{value.count} 回</div>
                <div className='StartButtonAllow'><KeyboardArrowRightIcon /></div>
              </li>
            )
          })}
        </ul>
    </div>
  )
}

export default TrainingMenu