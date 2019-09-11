import React from "react";

import {
  render,
  waitForElement,
  fireEvent,
  getByText,
  getAllByTestId,
  prettyDOM,
  getByAltText,
  getByPlaceholderText,
  queryByText,
  getByTestId
} from "@testing-library/react";

import Server from "jest-websocket-mock";

import axios from "axios";

import Application from "components/Application";

describe("Application", () => {
  beforeEach(() => {
    //Sets up websocket server and connection on every test
    const server = new Server(process.env.REACT_APP_WEBSOCKET_URL);

    server.on("connection", socket => {
      socket.on("message", data => socket.send(data));
    });
  });

  afterEach(() => {
    //resets server after every test
    Server.clean();
  });

  it("defaults to Monday and changes the schedule when a new day is selected.", () => {
    //Render application
    const { getByText } = render(<Application />);
    //Wait for dayslist to show up and check if days can be changed
    return waitForElement(() => getByText("Monday")).then(() => {
      fireEvent.click(getByText("Tuesday"));
      expect(getByText("Leopold Silvers")).toBeInTheDocument();
    });
  });

  it("loads data, books an interview and reduces the spots remaining for the first day by 1", async () => {
    //Render application
    const { container } = render(<Application />);
    //Wait for content to load
    await waitForElement(() => getByText(container, "Archie Cohen"));
    //Retrieve appointment by TestId
    const appointment = getAllByTestId(container, "appointment")[0];
    //Click Add button
    fireEvent.click(getByAltText(container, "Add"));
    //Add Input Text Lydia Miller-Jones
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" }
    });
    //Add interviewer
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    //Click save
    fireEvent.click(getByText(appointment, "Save"));
    //Expect a saving
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
    //Wait for saving to finish
    await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));
    //Check if correct amount of spots displayed
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "no spots remaining")).toBeInTheDocument();
  });

  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    // 1. Render the Application.
    const { container } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));
    // 3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
    fireEvent.click(getByAltText(appointment, "Delete"));
    // 4. Check that the confirmation message is shown.
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();
    // 5. Click the "Confirm" button on the confirmation.
    fireEvent.click(getByText(appointment, "Confirm"));
    // 6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();
    // 7. Wait until the element with the "Add" button is displayed.
    await waitForElement(() => getByAltText(appointment, "Add"));
    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
  });

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    //Render application
    const { container } = render(<Application />);
    //Wait for content to load
    await waitForElement(() => getByText(container, "Archie Cohen"));
    //Find Archie Cohen's appointment by Test Id
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
    //Click edit
    fireEvent.click(getByAltText(appointment, "Edit"));
    //Wait for Save to show up
    await waitForElement(() => getByText(appointment, "Save"));
    //Change value of input
    fireEvent.change(getByTestId(appointment, "student-name-input"), {
      target: {
        value: "Bob Bobbins"
      }
    });
    //Save change
    fireEvent.click(getByText(appointment, "Save"));
    //Expect Saving sign
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
    //Wait for saving to finish
    await waitForElement(() => getByText(container, "Bob Bobbins"));
    //Check for correct amount of days
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
  });

  it("shows the save error when filing to save an appointment", async () => {
    //Change put value to be rejected
    axios.put.mockRejectedValueOnce();
    //Render application
    const { container } = render(<Application />);
    //Wait for content to load
    await waitForElement(() => getByText(container, "Archie Cohen"));
    //Get first appointment
    const appointment = getAllByTestId(container, "appointment")[0];
    //Add appointment
    fireEvent.click(getByAltText(container, "Add"));
    //Input value Lydia Miller-Jones
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" }
    });
    //Select interviewer
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    //Save
    fireEvent.click(getByText(appointment, "Save"));
    //Expect Saving div to show
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
    //Wait for Error
    await waitForElement(() => getByText(appointment, "Error"));
    //Check that slots did not change for day
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
  });

  it("shows the delete error when failing to delete an existing appointment", async () => {
    //Mock delete route for axios
    axios.delete.mockRejectedValueOnce();
    //Render application
    const { container } = render(<Application />);
    //Wait for content to load
    await waitForElement(() => getByText(container, "Archie Cohen"));
    //Find Archie Cohen's appointment
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
    //Attempt to delete
    fireEvent.click(getByAltText(appointment, "Delete"));
    //Confirm confirm div to show
    expect(
      getByText(appointment, "Are you sure you would like to delete?")
    ).toBeInTheDocument();
    //Click confirm
    fireEvent.click(getByText(appointment, "Confirm"));
    //Check if deleting div shows
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();
    //Wait for Error to show
    await waitForElement(() => getByText(appointment, "Error"));
    //Check that slots did not change for day
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
  });
});
