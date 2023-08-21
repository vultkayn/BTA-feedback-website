import React, { useEffect, useState } from "react";
import Form, { ValidatedInput, validators } from "../../components/Form";

import { Box, Button, Typography } from "@mui/material";
import {
  redirect,
  useActionData,
  useLocation,
} from "react-router-dom";
import { revertURI } from "../../common/dataFormatting";
import "./styles/CategoryCreation.css";
import axios from "../../bridge/bridge"

export const action = async function ({ request }) {
  try {
    const formData = await request.formData();
    let catData = Object.fromEntries(formData);

    let payload = {
      name: catData.name,
      uiRoute: catData.route ?? "",
    };
    if (catData.description) payload.description = catData.description;
    if (payload.uiRoute) payload.uiRoute = payload.uiRoute.replace(/^\/+/, "");
    console.debug("Creating Category with payload", payload);
    const response = await axios.request({
      method: "post",
      url: "/api/practice/category",
      data: payload,
    });

    return redirect(`/practice/${response.data.uri}`);
  } catch (error) {
    if (process.env.DEBUG != null)
      console.debug("CategoryCreation failed with", error.response.data);
    if (error.status === 400 && error.response.data.errors)
      return error.response;
    throw error;
  }
};

export const categoryDeletionAction = async function ({ params }) {
  try {
    if (process.env.DEBUG == null)
      console.debug("Deleting Category", `${params.uri}`);
    const response = await axios.request({
      method: "delete",
      url: `/api/practice/category/${params.uri}`,
    });

    return redirect(`/practice/${response.data.uri}`);
  } catch (error) {
    console.debug("CategoryDeletion failed with", error.response.data);
    throw error;
  }
};

// FIXME add auth requirement for this page
export default function CategoryCreationForm() {
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const { uiRoute: fromRoute, name: fromName } = revertURI(
    location.state?.from,
    "_"
  );
  const from = "/" + (fromRoute && fromRoute + "/") + (fromName ?? "");
  const err = useActionData();
  useEffect(() => {
    let fieldErrors = {};
    if (err != null) {
      console.error("received errors are", err);
      if (err.status === 400) {
        if (err.data?.errors != null) {
          fieldErrors.name = err.data.errors.name;
          fieldErrors.route = err.data.errors.route;
          fieldErrors.description = err.data.errors.description;
        }
      }
    }
    setErrors(fieldErrors);
  }, [err]);


  return (
    <Box>
      <Form
        method='post'
        reactForm={true}
        id='Login-form'
        FormBaseProps={{ className: "CategoryCreationForm" }}
        BoxProps={{ alignContent: "center", pt: "5vh" }}>
        <Box>
          <Typography
            paragraph
            align='right'
            variant='h3'>
            Create a new Category
          </Typography>
        </Box>
        <ValidatedInput
          label='Name:'
          name='name'
          validator={validators.regex(
            /^[a-zA-Z0-9 -]{1,30}$/,
            "Only alphanumeric, space, or hyphen"
          )}
          spellCheck='true'
          margin='normal'
          error={errors.name != null}
          helperText={errors.name ? errors.name.msg : ""}
          required
        />
        <ValidatedInput
          label='Description:'
          multiline
          name='description'
          margin='normal'
          minRows={4}
          spellCheck='true'
          error={errors.description != null}
          helperText={errors.description ? errors.description.msg : ""}
          placeholder='Enter a description'
          fullWidth
        />
        <ValidatedInput
          label='Route:'
          name='route'
          validator={validators.regex(
            new RegExp("^/?([a-zA-Z0-9 -]+/?)*$"),
            "alphanumeric, space, or hyphen separated by /"
          )}
          margin='normal'
          error={errors.route != null}
          helperText={errors.route ? errors.route.msg : ""}
          InputProps={{ defaultValue: from || "/" }}
          required
        />
        <Box
          alignSelf='end'
          mt='2em'>
          <Button
            className='btn-submit'
            type='submit'
            size='medium'
            variant='contained'>
            Submit
          </Button>
        </Box>
      </Form>
    </Box>
  );
}
