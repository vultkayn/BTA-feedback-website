import React, { useState, useEffect } from "react";
import Form, { ValidatedInput, validators } from "../../components/Form";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import {
  Box,
  Button,
  IconButton,
  TextareaAutosize,
  Card,
  CardContent,
} from "@mui/material";
import { redirect, useActionData } from "react-router-dom";
import axios from "../../bridge/bridge";

export const action = async function ({ request, params }) {
  try {
    const formData = await request.formData();
    let exoData = Object.fromEntries(formData);
    exoData.kind = 1;

    const uri = params.uri;
    await axios.request({
      method: "post",
      url: `/api/practice/category/${uri}`,
      data: exoData,
    });
    return redirect(`/practice/${uri}`);
  } catch (error) {
    //  console.debug("client:practice")("ExerciseCreation failed with", error);
    return error.response;
  }
};

export const exerciseDeletionAction = async function ({ params }) {
  try {
    if (process.env.DEBUG == null)
      console.debug("Deleting Exercise", `${params.uri}/ex/${params.uriName}`);
    const response = await axios.request({
      method: "delete",
      url: `/api/practice/category/${params.uri}/ex/${params.uriName}`,
    });

    return redirect(`/practice/${response.data.uri}`);
  } catch (error) {
    console.debug("ExerciseDeletion failed with", error.response.data);
    throw error;
  }
};

function QuestionCreationField({
  qidx,
  addQuestion,
  changeQuestion,
  prefilled = null,
}) {
  let content = prefilled ?? {};
  return (
    <Card
      sx={{
        width: "min(70%, 70vw)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}>
      <CardContent>
        <ValidatedInput
          margin='normal'
          label='Title'
          defaultValue={content.title ?? ""}
          name={`title[${qidx}]`}
          gutterBottom
          fullWidth
        />
        <ValidatedInput
          margin='normal'
          label='Statement'
          defaultValue={content.statement ?? ""}
          name={`statement[${qidx}]`}
          gutterBottom
          fullWidth
        />
        <ValidatedInput
          placeholder='Explanation'
          label='Explanation'
          name={`explanation[${qidx}]`}
          defaultValue={content.explanation ?? ""}
          gutterBottom
          margin='normal'
          minRows={4}
        />
        <IconButton
          aria-label='add question'
          onClick={
            prefilled === null
              ? () => addQuestion(content)
              : () => changeQuestion(content, qidx)
          }>
          <AddCircleOutlineIcon fontSize='large' />
        </IconButton>
      </CardContent>
    </Card>
  );
}

// FIXME add auth requirement for this page
export default function ExerciseCreationForm() {
  const [errors, setErrors] = useState({});
  const [questions, setQuestions] = useState([]);
  const addQuestion = (newQ) => setQuestions([newQ, ...questions]);
  const changeQuestion = (q, idx) => {
    const oldqs = questions.filter((q, i) => i !== idx);
    setQuestions([q, ...oldqs]);
  };

  const err = useActionData();
  useEffect(() => {
    let fieldErrors = {};
    if (err != null) {
      console.error("received errors are", err);
      if (err.status === 400) {
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
          validator={validators.length(1, 20)}
          margin='normal'
          valid={errors.name == null}
          required
        />
        <TextareaAutosize
          placeholder='Description:'
          name='description'
          margin='normal'
          minRows={4}
          valid={errors.description == null}
        />
      </Box>
      {questions.map((q, idx) => {
        return (
          <QuestionCreationField
            key={`newquest-${idx}`}
            qidx={idx}
            changeQuestion={changeQuestion}
            prefilled={q}
          />
        );
      })}
      <QuestionCreationField addQuestion={addQuestion} />
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
