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
  error = false,
  onFocus = (e) => {},
  ...TextFieldProps
}) {
  const [isInvalid, setIsInvalid] = useState(false);
  const [invalidTxt, setInvalidTxt] = useState("");
  function handleChange(e) {
    // e.preventDefault();
    if (!bubbleUp) e.stopPropagation();
    let invalid = required && e.target.value.length < 1;
    invalid =
      invalid ||
      validator(e.target.name, e.target.value, setInvalidTxt) === false;
    setIsInvalid(invalid);
  }

  let tooltip = isInvalid && invalidTxt ? invalidTxt : helperText;
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
      error={isInvalid || error}
      helperText={tooltip}
      {...TextFieldProps}
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
  if (!/[A-Z]/.test(pwd)) {
    setMsg("Must contain at least one uppercase");
    return false;
  }
  if (!/[a-z]/.test(pwd)) {
    setMsg("Must contain at least one lowercase");
    return false;
  }
  if (!/[0-9]/.test(pwd)) {
    setMsg("Must contain at least one number");
    return false;
  }
  if (!/[%/_+&!:\-.?]/.test(pwd)) {
    setMsg(`Must contain at least one of ${passwordSymbolsClass}`);
    return false;
  }
  if (!/[A-Za-z0-9%/_+&!:\-.?]{8,}/.test(pwd)) {
    setMsg("Contains invalid characters.");
    return false;
  }
  return true;
};


const regexValidator = (re, msg) => (n, v, setMsg) => {
  if (!re.test(v)) {
    if (msg) setMsg(msg);
    return false;
  }
  return true;
}

export const validators = {
  regex: regexValidator,
  email: regexValidator(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
    "invalid email format"),
  password: passwordStrengthValidator,
  length: (minL, maxL) => (n, v, setMsg) => {
    let value = v.trim()
    if (value.length >= minL && value.length <= maxL) return true;
    setMsg(`Length must be between ${minL ?? 0} and ${maxL ?? 'inf'}`);
    return false;
  },
};
