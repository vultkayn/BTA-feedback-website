import React, { useState } from "react";
import Form, { ValidatedInput, validators } from "../components/Form";
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

export const action = ({apiClient}) =>
  async function ({ request, params }) {
    try {
      const formData = await request.formData();
      let exoData = Object.fromEntries(formData);
      exoData.kind = 1;

      const uri = params.uri;
      await apiClient.request({
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

function QuestionCreationField({
  qidx,
  addQuestion,
  changeQuestion,
  prefilled = null,
}) {
  let form = prefilled ?? {};
  return (
    <Card
      sx={{
        width: "min(70%, 70vw)",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
      <CardContent>
        <ValidatedInput
          margin='normal'
          label='Title'
          defaultValue={form?.title ?? ""}
          name={`title[${qidx}]`}
          gutterBottom
          fullWidth
        />
        <Box width='100%' mb="15px">
          <TextareaAutosize
            placeholder='Statement'
            name={`statement[${qidx}]`}
            defaultValue={form?.statement ?? ""}
            minRows={4}
          />
        </Box>
        <Box width='100%' mb="15px">
        <TextareaAutosize
          placeholder='Explanation'
          name={`explanation[${qidx}]`}
          defaultValue={form?.explanation ?? ""}
          margin='normal'
          minRows={4}
          />
        </Box>
        <IconButton
          aria-label='add question'
          onClick={
            prefilled === null
              ? () => addQuestion(form)
              : () => changeQuestion(form, qidx)
          }>
          <AddCircleOutlineIcon fontSize='large' />
        </IconButton>
      </CardContent>
    </Card>
  );
}

// FIXME add auth requirement for this page
export default function ExerciseCreationForm() {
  const [valids, setValids] = useState({
    univID: true,
    password: true,
  });

  const [questions, setQuestions] = useState([]);
  const addQuestion = (newQ) => setQuestions([newQ, ...questions]);
  const changeQuestion = (q, idx) => {
    const oldqs = questions.filter((q, i) => i !== idx);
    setQuestions([q, ...oldqs]);
  };
  const err = useActionData();
  if (err !== undefined) {
    if (err.status == 401 && err.data.errors !== undefined) {
      setValids({
        name: !("name" in err.data.errors),
        description: !("description" in err.data.errors),
        route: !("route" in err.data.errors),
      });
    }
  }
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
          valid={valids.name}
          required
        />
        <TextareaAutosize
          placeholder='Description:'
          name='description'
          margin='normal'
          minRows={4}
          valid={valids.description}
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
