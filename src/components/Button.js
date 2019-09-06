import React from "react";
import classNames from 'classnames';

import "./Button.scss";

export default function Button(props) {

   let buttonClass = classNames({
      "button": true,
      "button--confirm": props.confirm,
      "button--danger": props.danger
   });
 
   return <button className={buttonClass} disabled={props.disabled} onClick={props.onClick}>{props.children}</button>;
}
 