import React, {useContext, useEffect, useState} from "react";
import dayjs from "dayjs";
import GlobalContext from "../../context/GlobalContext";

export const Day = (props) => {
  const { day, userTrainingData } = props;
  // const [dayEvents, setDayEvents] = useState([]);
  const { setDaySelected, setShowEventModal, monthIndex } = useContext(GlobalContext);
  // const [todayData, setTodayData] = useState("");

  const todayStringElement = dayjs().format("YYYY/MM/DD").toString()

  // console.log(userTrainingData, day)
  // useEffect(() => {
  //   if (userTrainingData != {}) {
  //     console.log(userTrainingData)
  //   }
  // },[userTrainingData])

  // 今日の日付を色付けする
  const getCurrentDayClass = () => {
    return day.format("DD-MM-YY") === dayjs().format("DD-MM-YY")
      ? "bg-blue-600 text-white rounded-full w-7"
      : "";
  };

  const NoticeElement = (day) => {
    const dayStringElement = dayjs(day).format("YYYY/MM/DD").toString();
    const todayData = userTrainingData[dayStringElement];
    var i = 0;
    
    console.log(todayData, dayStringElement)

    if (todayData === undefined && todayStringElement > dayStringElement){
      return (<p> / </p>)
    }

    if (todayData === undefined && todayStringElement < dayStringElement) {
      return (<p>  </p>)
    }

    if (dayStringElement === todayStringElement) {
      let userDataKeys = ["AbsTraining", "LegTraining", "PectoralTraining"]
      let cnt = 0;
      for (i=0; i < userDataKeys.length; i++){
        if (todayData["target"][userDataKeys[i]] > todayData["training"][userDataKeys[i]]){
          cnt++;
        }
      }
      if (cnt === 0){
        return (<div className="gohi">達成！</div>)
      }
      else{
        return (<div className="gohi">未達成</div>)
      }
    }else if (dayStringElement < todayStringElement){
      let userDataKeys = ["AbsTraining", "LegTraining", "PectoralTraining"]
      let cnt = 0;
      for (i=0; i < userDataKeys.length; i++){
        if (todayData["target"][userDataKeys[i]] > todayData["training"][userDataKeys[i]]){
          cnt++;
        }
      }
      if (cnt === 0){
        return (<div className="CircleGood"></div>)
      }
      else if (cnt === 1){
        return (<div className="CircleNice"></div>)
      }
      else if (cnt === 2){
        return (<div className="Traiangle"></div>)
      }
      else{
        return (<div className="CircleBad"></div>)
      }
    }else{
      return (<p></p>)
    }

  }

  // console.log(userTrainingData, todayData)
  if (userTrainingData == {}){
    return (<></>)
  }

  // 登録データを日付が一致する日に表示
  // useEffect(() => {
  //   const events = savedEvents.filter(
  //     (evt) => dayjs(evt.day).format("DD-MM-YY") === day.format("DD-MM-YY")
  //   );
  //   setDayEvents(events);
  // }, [savedEvents, day]);

  return (
    <>
    <div className="border border-gray-200 flex flex-col CalendarDayBox">
      <header className="flex flex-col items-center CalendarDay" >
        {/* 1行目に曜日を表示 */}
        {/* {rowIdx === 0 && <p className="text-sm mt-1">{day.format("ddd")}</p>} */}
        <p 
          className={`text-sm p-1 my-1 text-center ${getCurrentDayClass()}`}
          id={ (parseInt(day.format("MM"))-1) !== monthIndex%12 ? "DifferentMonth" : ""}
        >
          {day.format("DD")}
        </p>
      </header>
      <div
        className="flex-1 cursor-pointer"
        onClick={() => {
          setDaySelected(day);
          todayStringElement >= dayjs(day).format("YYYY/MM/DD") && userTrainingData[dayjs(day).format("YYYY/MM/DD")] !== undefined
           ? setShowEventModal(true) : setDaySelected(day)
        }}
      >
        <div id={ (parseInt(day.format("MM"))-1) !== monthIndex%12 ? "DifferentMonth" : ""}>
          { NoticeElement(day) }
          {/* { <p className="NoticeCircle"></p> } */}
        </div>
        {/* {dayEvents.map((evt, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedEvent(evt)}
            className={`bg-neutral-200 p-1 mr-3 text-gray-600 text-sm rounded mb-1 truncate`}
          >
            
          </div>
        ))} */}
      </div>
    </div></>
  );
};