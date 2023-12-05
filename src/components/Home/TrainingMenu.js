import React, { useContext, useEffect, useState } from 'react';
import VideocamIcon from '@mui/icons-material/Videocam';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import GlobalContext from '../../context/GlobalContext';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Loading from '../Loading';


const MySwal = withReactContent(Swal)


function TrainingMenu(props) {

  const { userTrainingData } = props;

  const { setTrainingType, userId } = useContext(GlobalContext);

  const Today = dayjs().format("YYYY/MM/DD");
  const todayData = userTrainingData[Today]
  const Menu = [
    {
      title : "上体起こし",
      type  : "AbsTraining",
      count : todayData["target"]["AbsTraining"] - todayData["training"]["AbsTraining"],
      link  : "?classification=AbsTraining"
    },
    {
      title : "腕立て伏せ",
      type  : "PectoralTraining",
      count : todayData["target"]["PectoralTraining"] - todayData["training"]["PectoralTraining"],
      link  : "?classification=PectoralTraining"
    },
    {
      title : "スクワット",
      type  : "LegTraining",
      count : todayData["target"]["LegTraining"] - todayData["training"]["LegTraining"],
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
