import React, { useContext } from "react";
import { MdDeleteForever, MdClose } from "react-icons/md";
import GlobalContext from "../../context/GlobalContext";
import dayjs from "dayjs";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Pie } from 'react-chartjs-2';

// ChartJS.register(ArcElement, Tooltip, Legend);

export const EventModal = (props) => {
  const { daySelected, setShowEventModal, dispatchCalEvent, selectedEvent } =
    useContext(GlobalContext);

  const { userTrainingData } = props
  
  // const [title, setTitle] = useState(selectedEvent ? selectedEvent.title : "");

  // const handleSubmit = (e) => {
  //   // クリック時に送信するというdefaultの動作をキャンセルする
  //   e.preventDefault();
  //   const calendarEvent = {
  //     title: title,
  //     day: daySelected.valueOf(),
  //     id: selectedEvent ? selectedEvent.id : Date.now(),
  //   };
  //   if (selectedEvent) {
  //     dispatchCalEvent({ type: "update", payload: calendarEvent });
  //   } else {
  //     dispatchCalEvent({ type: "push", payload: calendarEvent });
  //   }
  //   setShowEventModal(false);
  // };

  if (userTrainingData == {}){
    return (<></>)
  }

  const TodayData = userTrainingData[dayjs(daySelected).format("YYYY/MM/DD")]
  
  const Menu = [

    {
      title : "上体起こし",
      type  : "AbsTraining",
      count : TodayData["training"]["AbsTraining"],
      target: TodayData["target"]["AbsTraining"],
    },
    {
      title : "腕立て伏せ",
      type  : "PectoralTraining",
      count : TodayData["training"]["PectoralTraining"],
      target: TodayData["target"]["PectoralTraining"],

    },
    {
      title : "スクワット",
      type  : "LegTraining",
      target: TodayData["target"]["LegTraining"],
      count : TodayData["training"]["LegTraining"],
    },
  ]

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center">
      <form className="bg-white rounded-lg shadow-2xl w-1/4 CalendarModalForm">
        <header className="bg-gray-100 px-4 py-2 flex justify-end">
          <div className="text-gray-400">
            {selectedEvent && (
                <button
                    onClick={() => {
                    dispatchCalEvent({ type: "delete", payload: selectedEvent });
                    setShowEventModal(false);
                    }}
                >
                    <MdDeleteForever />
                </button>
            )}
            <button onClick={() => setShowEventModal(false)}>
              <MdClose />
            </button>
          </div>
        </header>
        <div className="p-3">
          <div className="grid grid-cols-1/5 items-end gap-y-7">
            <div> </div>
            <h2 className="ModalTitle">{daySelected.format("MMMM DD")}日 のメニュー</h2>
            {/* <input
              type="text"
              name="title"
              placeholder="Add title"
              value={title}
              required
              className="pt-3 border-0 text-gray-600 text-xl font-semibold pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setTitle(e.target.value)}
            /> */}

            <ul>
              {Menu.map((value, key) => {
                return (
                  <li key={key} className="CalendarTrainingText">
                    <div className='ModalListWrapper'>
                      <div className='TrainingTitle'>{value.title}</div>
                      <div className='TrainingCount'>{value.count} / {value.target} 回</div>
                    </div>
                    <div> 達成率 : <progress max="100" value={value.count / value.target * 100 | 0}>{value.count / value.target * 100 | 0}%</progress></div>
                  </li>
                )
              })}
            </ul>

          </div>
        </div>
      </form>
    </div>
  );
};