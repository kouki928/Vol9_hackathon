import React from 'react';
import macho from "../../images/macho.png";
import TrainingMenu from './TrainingMenu';


function Home() {

  return (
    <div className='Main'>
      <div className='StartTraining'>
        <img src={macho} alt='マッチョ' className='TrainingImage'></img>
        <h2>トレーニングを始めましょう!</h2>
        <p className='discription'>
          ボタンを押すとカメラが起動し、計測が開始されます。
        </p>
        {/* <div className='StartButton' onClick={() => {window.location.pathname = "/training"}}>
          <div className='StartButtonIcon'><VideocamIcon /></div>
          <div className='StartButtonTitle'>トレーニング</div>
          <div className='StartButtonAllow'><KeyboardArrowRightIcon /></div>
        </div> */}
      </div>
      
      <TrainingMenu />
      
    </div>
  )
}

export default Home
