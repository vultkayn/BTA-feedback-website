import React from "react";

import { Form as ReactForm } from "react-router-dom";

// validator shall return false if there IS any issue

const FormBaseProps = {
  method: "post",
  endpoint: null,
  children: {},
  reactForm: false,
  onChange: (e) => {},
  onSubmit: (e) => {},
};

export default function FormBase({
  method,
  endpoint,
  children,
  apiClient,
  reactForm = false,
  onChange = (e) => {},
  onSubmit = null,
  className,
  ...FormBaseProps
}) {
  const klass = `FormBase ${className || ""}`

  if (reactForm)
    return (
      <ReactForm
        method={method}
        onChange={onChange}
        className={klass}
        {...FormBaseProps}>
        {children}
      </ReactForm>
    );

  const handleSubmit =
    onSubmit ??
    (async (e) => {
      try {
        e.preventDefault();
        const request = {
          method: method,
          url: endpoint,
          data: () => new FormData(e.target),
        };
      }
    });

  return (
    <form
      onChange={onChange}
      onSubmit={handleSubmit}
      className={klass}
      {...FormBaseProps}>
      {children}
    </form>
  );
}
