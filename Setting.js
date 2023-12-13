import React from 'react';
import { CouponData } from './CouponData';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

function Setting() {

  const UserId = localStorage.getItem("UserId")
  const userTrainingData = JSON.parse(localStorage.getItem("userTrainingData"));
  let keyDays = Object.keys(userTrainingData).reverse().reverse()
  let point = 0;

  keyDays.forEach((value, key) => {
    point += userTrainingData[value].training.AbsTraining;
    point += userTrainingData[value].training.LegTraining;
    point += userTrainingData[value].training.PectoralTraining;
  })



  return (
    <div className='Main'>

      <div className='PointBox'>
        <div className='PointBoxWrapper'>
          <div className='InputLabel UserId'>{"　<ID>　"}{UserId}</div>
          <div className='InputLabel'>{"　<保有ポイント>　"}{point} pt </div>
        </div>

        <div className='Pointdiscription'>ポイントを変換</div>

      </div>

      <hr></hr>

      <ul className='CouponBoxWrapper'>
        {CouponData.map((value, key) => {
          return (
            <li key={key} className='CouponBox' onClick={
              () => {
                MySwal.fire({
                  title: "現在実装中です",
                  text: "すみません！間に合いませんでした！",
                  icon: "warning"
                });
              }
            }>
              <img src={value.imageURL} alt={value.alt}></img>
              <div>
                <div className='title'>{value.title}</div>
                <div className='company'>{value.company}</div>
              </div>
            </li>
          )
        })}
      </ul>

    </div>
  )
}

export default Setting
