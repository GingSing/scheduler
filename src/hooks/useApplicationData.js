import { useReducer, useEffect } from "react";
import axios from "axios";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const SET_SPOTS = "SET_SPOTS";

let socket;

const reducer = (state, action) => {
  switch (action.type) {
    case SET_DAY: {
      return { ...state, day: action.day };
    }

    case SET_APPLICATION_DATA: {
      return {
        ...state,
        days: action.days,
        appointments: action.appointments,
        interviewers: action.interviewers
      };
    }

    case SET_INTERVIEW: {
      return { ...state, appointments: action.appointments };
    }

    case SET_SPOTS: {
      const days = state.days.map(item => {
        if (item.name === action.dayName) {
          return {
            ...item,
            spots: item.spots + action.value
          };
        }
        return item;
      });

      return {
        ...state,
        days
      };
    }

    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
};

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: [],
    interviewers: []
  });
  const setDay = day => dispatch({ type: SET_DAY, day });
  const bookInterview = (id, interview) => {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment
    };

    socket.send(JSON.stringify({ type: "SET_INTERVIEW", id, interview }));

    return axios.put(`/api/appointments/${id}`, {
      interview
    });
  };

  const cancelInterview = id => {
    socket.send(JSON.stringify({ type: "SET_INTERVIEW", id, interview: null }));
    return axios.delete(`/api/appointments/${id}`);
  };

  useEffect(() => {
    socket = new WebSocket("ws://localhost:8001");

    Promise.all([
      axios.get(`/api/days`),
      axios.get(`/api/appointments`),
      axios.get(`/api/interviewers`)
    ]).then(all => {
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
        dispatch({
          type: SET_SPOTS,
          dayName: state.day,
          value: interview ? -1 : 1
        });
      };
    });

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
