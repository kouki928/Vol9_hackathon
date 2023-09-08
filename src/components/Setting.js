import React, { useState } from 'react';

function Setting() {

  const UserId = localStorage.getItem("UserId");
  const [AbsTraining, setAbsTraining] = useState(0);
  const [LegTraining, setLegTraining] = useState(0);
  const [PectoralTraining, setPectoralTraining] = useState(0);


  return (
    <div className='Main'>
      <div className='setting'>

        <div className='Profile'>
          <p>UserId : {UserId}</p>
        </div>

        <div className='TrainingTarget'>
          <h2 className='TragetTitle'>目標設定</h2>

          <label className='InputLabel'>腹筋 : </label>
          <input type='number' className='TragetInput'
              value={AbsTraining}
              onChange={(event) => setAbsTraining(event.target.value)} required>
          </input>

          <label className='InputLabel'>足筋 : </label>
          <input type='number' className='TargetInput' 
              value={LegTraining}
              onChange={(event) => setLegTraining(event.target.value)} required>
          </input>

          <label className='InputLabel'>胸筋 : </label>
          <input type='number' className='TargetInput' 
              value={PectoralTraining}
              onChange={(event) => setPectoralTraining(event.target.value)} required>
          </input>

        </div>
      </div>
    </div>
  )
}

export default Setting
