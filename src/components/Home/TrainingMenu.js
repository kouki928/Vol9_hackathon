import React, { useContext } from 'react';
import VideocamIcon from '@mui/icons-material/Videocam';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import GlobalContext from '../../context/GlobalContext';

function TrainingMenu() {

  const { setTrainingType } = useContext(GlobalContext)

  return (
    <div className='TrainingMenu'>
        <p>今日のトレーニング : </p>
        <ul>
          {Menu.map((value, key) => {
            return (
              <li key={key} className='TrainingText' onClick={
                () => {
                  setTrainingType(value.title);
                  window.location.pathname = `/training`;
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


export const Menu = [
    {
        title : "腹筋",
        type  : "AbsTraining",
        count : 30,
    },
    {
        title : "胸筋",
        type  : "PectoralTraining",
        count : 30,
    },
    {
        title : "足筋",
        type  : "LegTraining",
        count : 50,
    },
]