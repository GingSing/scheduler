import { useReducer, useEffect } from "react";
import axios from "axios";

import reducer, {
  SET_DAY,
  SET_APPLICATION_DATA,
  SET_INTERVIEW,
  SET_SPOTS
} from "reducers/application";

let socket;

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: [],
    interviewers: []
  });
  const setDay = day => dispatch({ type: SET_DAY, day });
  const bookInterview = (id, interview) => {
    return axios
      .put(`/api/appointments/${id}`, {
        interview
      })
      .then(() =>
        socket.send(JSON.stringify({ type: "SET_INTERVIEW", id, interview }))
      );
  };

  const cancelInterview = id => {
    return axios
      .delete(`/api/appointments/${id}`)
      .then(() =>
        socket.send(
          JSON.stringify({ type: "SET_INTERVIEW", id, interview: null })
        )
      );
  };

  useEffect(() => {
    socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    Promise.all([
      axios.get(`/api/days`),
      axios.get(`/api/appointments`),
      axios.get(`/api/interviewers`)
    ])
      .then(all => {
        const [days, appointments, interviewers] = all;
        dispatch({
          type: SET_APPLICATION_DATA,
          days: days.data,
          appointments: appointments.data,
          interviewers: interviewers.data
        });
        socket.onmessage = data => {
          let { id, interview } = JSON.parse(data.data);
          let newAppointment = {
            ...appointments.data[id],
            interview: { ...interview }
          };

          let newAppointments = {
            ...appointments.data,
            [id]: newAppointment
          };
          dispatch({ type: SET_INTERVIEW, appointments: newAppointments });
          if (
            (appointments.data[id].interview && interview) ||
            (!appointments.data[id].interview && !interview)
          ) {
            dispatch({
              type: SET_SPOTS,
              dayName: state.day,
              value: 0
            });
          } else {
            dispatch({
              type: SET_SPOTS,
              dayName: state.day,
              value: interview ? -1 : 1
            });
          }
        };
      })
      .catch(err => err);

    return () => {
      socket.close();
    };
  }, []);

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview
  };
}
