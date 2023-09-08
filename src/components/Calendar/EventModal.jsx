import React, { useContext } from "react";
import { MdDeleteForever, MdClose } from "react-icons/md";
import GlobalContext from "../../context/GlobalContext";
import { Menu } from "../Home/TrainingMenu";

export const EventModal = () => {
  const { daySelected, setShowEventModal, dispatchCalEvent, selectedEvent } =
    useContext(GlobalContext);
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
                  <li key={key} className='TrainingText'>
                    <div className='TrainingTitle'>{value.title}</div>
                      <div className='TrainingCount'>{value.count} 回</div>
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