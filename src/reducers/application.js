export const SET_DAY = "SET_DAY";
export const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
export const SET_INTERVIEW = "SET_INTERVIEW";
export const SET_SPOTS = "SET_SPOTS";

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
      return { ...state, appointments: action.appointments };
    }

    case SET_SPOTS: {
      //loops through days array to find the correct day object and changes its spots
      const days = state.days.map(day => {
        if (day.name === state.day) {
          return {
            ...day,
            spots: day.spots + action.value
          };
        }
        return day;
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
}
