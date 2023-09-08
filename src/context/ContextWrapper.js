import React, { useReducer, useState, useEffect } from "react";
import GlobalContext from "./GlobalContext";
import dayjs from "dayjs";

const saveEventsReducer = (state, { type, payload }) => {
  switch (type) {
    case "push":
      return [...state, payload];
    case "update":
      return state.map((evt) => (evt.id === payload.id ? payload : evt));
    case "delete":
      return state.filter((evt) => evt.id !== payload.id);
    default:
      throw new Error();
  }
};

const initEvents = () => {
  const storageEvents = localStorage.getItem("savedEvents");
  const parsedEvents = storageEvents ? JSON.parse(storageEvents) : [];
  return parsedEvents;
};

const ContextWrapper = (props) => {
  const [monthIndex, setMonthIndex] = useState(dayjs().month());
  const [daySelected, setDaySelected] = useState(dayjs());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [userTrainingData, setUserTrainingData] = useState({});
  const [trainingType, setTrainingType] = useState("");
  const [trainingCount, setTrainingCount] = useState(0);
  
  const [savedEvents, dispatchCalEvent] = useReducer(
    saveEventsReducer,
    [],
    initEvents
  );

  useEffect(() => {
    // 以下構文でlocalStorageに保存
    // localStorage.setItem('key', 'value')
    localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
  }, [savedEvents]);

  useEffect(() => {
    if (!showEventModal) {
      setSelectedEvent(null);
    }
  }, [showEventModal]);

  return (
    <GlobalContext.Provider
      value={{
        monthIndex,
        setMonthIndex,
        daySelected,
        setDaySelected,
        showEventModal,
        setShowEventModal,
        selectedEvent,
        setSelectedEvent,
        savedEvents,
        dispatchCalEvent,
        userTrainingData,
        setUserTrainingData,
        trainingType,
        setTrainingType,
        trainingCount,
        setTrainingCount,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};

export default ContextWrapper;