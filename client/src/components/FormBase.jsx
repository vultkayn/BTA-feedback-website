import React from "react";
import "./styles/Form.css";

import { Form as ReactForm } from "react-router-dom";

// validator shall return false if there IS any issue

const FormBaseProps = {
  method: "post",
  endpoint: null,
  children: {},
  reactForm: false,
  onChange: (e) => {},
  onSubmit: (e) => {},
  onError: (err) => {},
  toApi: true,
};

export default function FormBase({
  method,
  endpoint,
  children,
  apiClient,
  reactForm = false,
  onChange = (e) => {},
  onSubmit = null,
  FormBaseProps
}) {

  if (reactForm)
    return (
      <ReactForm
        method={method}
        onChange={onChange}
        {...FormBaseProps}>
        {children}
      </ReactForm>
    );

  const handleSubmit = onSubmit ?? (async (e) => {
    try {
      e.preventDefault();
      const request = {
        method: method,
        url: endpoint,
        data: () => new FormData(e.target)
      }
      const response = await apiClient.request(request);
      console.debug("Form response is", response);
    } catch (err) {
      return Promise.reject(err);
    }
  });

  return (
    <form
      onChange={onChange}
      onSubmit={handleSubmit}>
      {children}
    </form>
  );
}
