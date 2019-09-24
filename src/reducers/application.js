export const SET_DAY = "SET_DAY";
export const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
export const SET_INTERVIEW = "SET_INTERVIEW";

export default function reducer(state, action) {
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
      let value;
      const newInterview = action.interview;
      const oldInterview = state.appointments[action.id].interview;
      if (oldInterview && newInterview) {
        value = 0;
      } else {
        value = action.interview ? -1 : 1;
      }

      const days = state.days.map(day => {
        if (day.name === state.day) {
          return {
            ...day,
            spots: day.spots + value
          };
        }
        return day;
      });

      let newAppointment = {
        ...state.appointments[action.id],
        interview: { ...action.interview }
      };

      let newAppointments = {
        ...state.appointments,
        [action.id]: newAppointment
      };
      return { ...state, appointments: newAppointments, days };
    }

    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}
