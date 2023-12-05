import React from 'react';
import macho from "../../images/macho.png";
import TrainingMenu from './TrainingMenu';

function Home(props) {

  const { userTrainingData } = props;

  return (
    <div className='Main'>
      <div className='StartTraining'>
        <img src={macho} alt='マッチョ' className='TrainingImage'></img>
        <h2>トレーニングを始めましょう!</h2>
        <p className='discription'>
          ボタンを押すとカメラが起動し、<br></br>計測が開始されます。
        </p>
      </div>
      
      <TrainingMenu userTrainingData={userTrainingData}/>
      
    </div>
  )
}

export default Home
