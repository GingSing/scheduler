import React from "react";
import classNames from "classnames";

import "./InterviewerListItem.scss";

export default function InterviewerListItem(props) {
  let itemClass = classNames({
    interviewers__item: true,
    "interviewers__item--selected": props.selected
  });
  return (
    <li className={itemClass} onClick={props.setInterviewer}>
      <img
        className="interviewers__item-image"
        src={props.avatar}
        alt={props.name}
      />
      {props.selected && props.name}
    </li>
  );
}
