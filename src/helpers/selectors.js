function getAppointmentById(state, id) {
  for (let key in state.appointments) {
    if (state.appointments[key].id === id) {
      return state.appointments[key];
    }
  }
}

export function getAppointmentsForDay(state, day) {
  let tempArr = [];
  let dayObj = state.days.find(filteredDay => filteredDay.name === day);
  if (!dayObj) {
    return tempArr;
  }
  dayObj.appointments.forEach(appointment =>
    tempArr.push(getAppointmentById(state, appointment))
  );
  return tempArr;
}

export function getInterview(state, interview) {
  if (!interview) return null;
  for (let key of Object.keys(state.interviewers)) {
    if (state.interviewers[key].id === interview.interviewer) {
      return {
        interviewer: state.interviewers[key],
        student: interview.student
      };
    }
  }
}

function getInterviewersById(state, id) {
  for (let key in state.interviewers) {
    if (state.interviewers[key].id === id) {
      return state.interviewers[key];
    }
  }
}

export function getInterviewersForDay(state, day) {
  let tempArr = [];
  let dayObj = state.days.find(filteredDay => filteredDay.name === day);
  if (!dayObj) {
    return tempArr;
  }
  dayObj.interviewers.forEach(interviewer =>
    tempArr.push(getInterviewersById(state, interviewer))
  );
  return tempArr;
}
