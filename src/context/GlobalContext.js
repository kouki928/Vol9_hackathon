import React from "react";

const GlobalContext = React.createContext({
  monthIndex: 0,
  setMonthIndex: (index) => {},
  daySelected: null,
  setDaySelected: (day) => {},
  showEventModal: false,
  setShowEventModal: () => {},
  savedEvents: [],
  dispatchCalEvent: ({ type, payload }) => {},
  selectedEvent: null,
  setSelectedEvent: () => {},
  userTrainingData : {},
  setUserTrainingData : () => {},
  trainingType : "",
  setTrainingType : () => {},
  trainingCount : 0,
  setTrainingCount : () => {},
  userId : "",
  setUserId : () => {},
});

export default GlobalContext;