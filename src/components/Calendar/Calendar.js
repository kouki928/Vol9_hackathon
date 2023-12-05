import React, { useState, useEffect, useContext } from 'react';
import { getMonth } from './util';
import { Month } from './Month';
import {CalendarHeader} from './CalendarHeader';
import GlobalContext from "../../context/GlobalContext";
import { EventModal } from "./EventModal";
// import { getUserTrainingData } from '../Home/TrainingMenu';

function Calendar(props) {

  const [currentMonth, setCurrentMonth] = useState(getMonth());
  const { monthIndex, showEventModal } = useContext(GlobalContext);
  const {userTrainingData} = props

  // console.log(userTrainingData)

  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
    // setUserTrainingData(getUserTrainingData());
  }, [monthIndex]);

  return (
    <div className='Main'>
      {showEventModal && <EventModal />}
      <div className="h-screen flex flex-col CalendarArea">
        <CalendarHeader />
        <div className="flex flex-1">
          <Month month={currentMonth} userTrainingData={userTrainingData} />
        </div>
      </div>
    </div>
  );
}

export default Calendar
