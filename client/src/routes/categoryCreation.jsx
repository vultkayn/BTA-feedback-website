import React, { useEffect, useState } from "react";
import Form, { ValidatedInput, validators } from "../components/Form";

import { Box, Button, TextareaAutosize } from "@mui/material";
import { redirect, useActionData, useLocation } from "react-router-dom";

export const action = ({ apiClient }) =>
  async function ({ request }) {
    try {
      const formData = await request.formData();
      let catData = Object.fromEntries(formData);

      let payload = {
        name: catData.name,
        uiRoute: catData.route ?? "",
      };
      if (catData.description) payload.description = catData.description;
      if (payload.uiRoute)
        payload.uiRoute = payload.uiRoute.replace(/^\/+/, "").replaceAll("/", "-");
      console.debug("Creating Category with payload", payload);
      const response = await apiClient.request({
        method: "post",
        url: "/api/practice/category",
        data: payload,
      });

      return redirect(`/practice/${response.data.uri}`);
    } catch (error) {
      console.debug("CategoryCreation failed with", error.response.data);
      if (error.status === 400 && error.response.data.errors)
        return error.response;
      throw error;
    }
  };

// FIXME add auth requirement for this page
export default function CategoryCreationForm() {
  const [errors, setErrors] = useState({});
  const location = useLocation();
  console.log ("location state is", location.state)
  const { from } = location.state;

  console.log("error fields are", errors);

  const err = useActionData();
  useEffect(() => {
    let fieldErrors = {};
    if (err != null) {
      console.log("received errors are", err);
      if (err.status == 400) {
        if (err.data?.errors != null) {
          fieldErrors.name = err.data.errors.name;
          fieldErrors.description = err.data.errors.description;
          fieldErrors.route = err.data.errors.route;
        }
      }
    }
    setErrors(fieldErrors);
  }, [err]);

  return (
    <Form
      method='post'
      reactForm={true}
      id='Login-form'
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}>
      <Box
        display='flex'
        flexDirection='column'
        justifyContent='space-evenly'
        width='min-content'>
        <ValidatedInput
          label='Name:'
          name='name'
          validator={validators.regex(/^[a-zA-Z0-9 _!-]{1,30}$/)}
          margin='normal'
          valid={errors.name == null}
          helperText={errors.name ? errors.name.msg : ""}
          required
        />
        <TextareaAutosize
          label='Description:'
          name='description'
          type='description'
          margin='normal'
          minRows={4}
          valid={errors.description == null}
          helperText={errors.description ? errors.description.msg : ""}
        />
        <ValidatedInput
          label='Route:'
          name='route'
          validator={validators.regex(
            new RegExp("^/([a-zA-Z0-9_+]+/?[a-zA-Z0-9_+]+)*$")
          )}
          margin='normal'
          valid={errors.route == null}
          helperText={errors.route ? errors.route.msg : ""}
          InputProps={{ value: from || "/" }}
          required
        />
      </Box>
      <Button
        className='btn-submit'
        type='submit'
        sx={{
          display: "flex",
          alignSelf: "right",
        }}
        variant='contained'>
        Submit
      </Button>
    </Form>
  );
}
