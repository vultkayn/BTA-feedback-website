import React, { useState, useEffect } from "react";

import { Box, Typography, Divider } from "@mui/material";
import { Outlet, redirect, useActionData } from "react-router-dom";
import axios from "../../bridge/bridge";
import ResponsiveFunction from "../../components/ResponsiveFunctions";
import {
  ExerciseCreationForm,
  QuestionAddingList,
} from "../../components/ExerciseUpdate";


export const action = async function ({ request, params }) {
  try {
    const formData = await request.formData();
    let exoData = Object.fromEntries(formData);
    exoData.questions ??= [];
    const response = await axios.request({
      method: "post",
      url: `/api/practice/category/${params.uri}/ex`,
      data: exoData,
    });
    return redirect(`../${response.data.uriName}/@update/questions`);
  } catch (error) {
    if (process.env.DEBUG != null)
      console.debug("ExerciseCreation failed with", error.response.data);
    if (error.status === 400 && error.response.data.errors)
      return error.response;
    throw error;
  }
};

// FIXME add auth requirement for this page
export default function ExerciseCreationPage({disabled}) {
  const [errors, setErrors] = useState({});
  const response = useActionData();
  useEffect(() => {
    let fieldErrors = {};
    if (response && response.status >= 300) {
      console.error("received errors are", response);
      if (response.status === 400) {
        if (response.data?.errors != null) {
          fieldErrors.name = response.data.errors.name;
          fieldErrors.description = response.data.errors.description;
        }
      }
    }
    setErrors(fieldErrors);
  }, [response]);


  return (
    <>
      <Typography
        paragraph
        align='left'
        variant='h3'>
        Create a new Exercise
      </Typography>
      <Box
        width='100%'
        display='flex'
        justifyContent='space-between'>
        <Box
          minWidth='20vw'
          display='flex'
          justifyContent='space-around'>
          <ExerciseCreationForm errors={errors} disabled={disabled}/>
          <Divider
            orientation='vertical'
            variant='middle'
            flexItem
          />
        </Box>
        {/* <QuestionAddingList disabled={!exerciseExists} /> */}
        <Outlet />
      </Box>
      {/* Questions List */}
    </>
  );
}
