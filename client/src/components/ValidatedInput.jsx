import React, { useState } from "react";
import "./styles/Form.css";
import { TextField } from "@mui/material";

export default function ValidatedInput({
  name,
  id = "",
  className = "",
  bubbleUp = true,
  validator = (name, value, setMsg) => true,
  label = "",
  type = "text",
  helperText = "",
  required = true,
  valid = true,
  onFocus = (e) => {},
  ...rest
}) {
  const [isInvalid, setIsInvalid] = useState(false);
  const [invalidTxt, setInvalidTxt] = useState("Invalid field");

  function handleChange(e) {
    e.preventDefault();
    if (!bubbleUp) e.stopPropagation();
    setInvalidTxt("Invalid field");
    let invalid = required && e.target.value.length < 1;
    invalid =
      invalid ||
      validator(e.target.name, e.target.value, setInvalidTxt) === false;
    setIsInvalid(invalid);
    helperText = (isInvalid && invalidTxt) ? invalidTxt : helperText;
  }

  return (
    <TextField
      name={name}
      id={id}
      label={label}
      className={className}
      type={type}
      onChange={handleChange}
      onFocus={onFocus}
      required={required}
      error={isInvalid || !valid}
      helperText={helperText}
      {...rest}
    />
  );
}


const passwordStrengthValidator = (name, value, setMsg) => {
  let passwordSymbolsClass = "%/_+&!:-(){}.?";
  const pwd = value ?? "";
  if (pwd.length < 8) {
    setMsg("Must be longer than 8 characters");
    return false;
  }
  if (! /[A-Z]/.test (pwd)) {
    setMsg("Must contain at least one uppercase");
    return false;
  }
  if (! /[a-z]/.test (pwd)) {
    setMsg("Must contain at least one lowercase");
    return false;
  }
  if (! /[0-9]/.test (pwd)) {
    setMsg("Must contain at least one number");
    return false;
  }
  if (! /[%/_+&!:\-.?]/.test (pwd)) {
    setMsg(`Must contain at least one of ${passwordSymbolsClass}`);
    return false;
  }
  if (!/[A-Za-z0-9%/_+&!:\-.?]{8,}/.test (pwd)) {
    setMsg("Contains invalid characters.");
    return false;
  }
  return true;
};

const emailValidator = (name, value) => {
  let regex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return regex.test(value);
};

export const validators = {
  regex: (re) => (n, v) => re.test(v),
  email: emailValidator,
  password: passwordStrengthValidator,
  length: (minL, maxL) => (n, v) => v.length > minL && v.length < maxL, 
}