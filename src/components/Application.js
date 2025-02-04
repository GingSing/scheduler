import React from "react";

import "components/Application.scss";

import DayList from "components/DayList";
import Appointment from "components/Appointment";

import {
  getAppointmentsForDay,
  getInterview,
  getInterviewersForDay
} from "../helpers/selectors";

import useApplicationData from "../hooks/useApplicationData";

export default function Application() {
  //pulls functions from useApplicationData
  const {
    state,
    setDay,
    bookInterview,
    cancelInterview
  } = useApplicationData();
  //Gets interviewers for the current day
  const interviewers = getInterviewersForDay(state, state.day);
  //Gets appointments for current day and pushes an appointment object for every appointment
  const appointments = getAppointmentsForDay(state, state.day).map(
    appointment => {
      return (
        <Appointment
          key={appointment.id}
          {...appointment}
          interview={getInterview(state, appointment.interview)}
          interviewers={interviewers}
          bookInterview={bookInterview}
          cancelInterview={cancelInterview}
        />
      );
    }
  );

  return (
    <main className="layout">
      <section className="sidebar">
        <img
          className="sidebar--centered"
          src="images/logo.png"
          alt="Interview Scheduler"
        />
        <hr className="sidebar__separator sidebar--centered" />
        <nav className="sidebar__menu">
          <DayList
            days={state.days}
            day={state.day}
            setDay={day => setDay(day)}
          />
        </nav>
        <img
          className="sidebar__lhl sidebar--centered"
          src="images/lhl.png"
          alt="Lighthouse Labs"
        />
      </section>
      <section className="schedule">
        {appointments}
        <Appointment key="last" time="5pm" />
      </section>
    </main>
  );
}
