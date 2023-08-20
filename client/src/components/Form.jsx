import React from "react";
import { Box } from "@mui/material";
import "./styles/Form.css";
import FormBase from "./FormBase";

export default function Form({
  method,
  endpoint,
  children,
  reactForm = false,
  onChange = (e) => {},
  onSubmit = null,
  BoxProps,
  FormBaseProps,
}) {
  const boxProps = {
    display: "flex",
    justifyContent: "space-around",
    flexDirection: "column",
    flexWrap: "wrap",
    ...BoxProps,
  };

  return (
    <Box
      {...boxProps}>
      <FormBase
        {...FormBaseProps}
        onSubmit={onSubmit}
        reactForm={reactForm}
        onChange={onChange}
        endpoint={endpoint}
        method={method}>
        {children}
      </FormBase>
    </Box>
  );
}

export { default as ValidatedInput, validators } from "./ValidatedInput";
export { FormBase };
