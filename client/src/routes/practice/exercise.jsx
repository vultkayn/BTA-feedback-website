import React from "react";
import {
  Card,
  Box,
  CardContent,
  Typography,
  FormControl,
  Button,
} from "@mui/material";
import Sidebar, {
  CollapsingSidebarSection,
  makeSolvedIcon,
} from "../../components/Sidebar";
import { useLoaderData } from "react-router-dom";
import axios from "../../bridge/bridge"

export const exerciseLoader = async ({ params }) => {
  try {
    const res = await axios.request({
      method: "get",
      url: `/api/practice/category/${params.uri}/ex/${params.uriName}`,
    });
    if (process.env.DEBUG != null)
      console.debug("ExerciseLoader received data", res?.data);
    return res.data;
  } catch (error) {
    if (process.env.DEBUG != null)
      console.debug("ExerciseLoader failed with", error.response.data);
    if (error.status === 400 && error.response.data.errors)
      return error.response;
    throw error;
  }
};

function produceQContent(question) {
  const produceCheckbox = () => {
    return question.choices.arr.map(({ name, label }) => {});
  };

  const produceRadio = () => {
    return question.choices.arr.map(({ name, label }) => {});
  };

  const type = question.choices.type;
  const producer =
    type === "checkbox"
      ? produceCheckbox
      : type === "radio"
      ? produceRadio
      : null;

  if (producer === null) throw new Error("Invalid producer found in data");

  return producer();
}

function QuestionCard({ question, index }) {
  return (
    <Card
      id={`q-${index}`}
      sx={{ width: "min(70%, 70vw)" }}>
      <CardContent>
        <Typography
          variant='h4'
          gutterBottom>
          {`#${index + 1} ${question.title}`}
        </Typography>
        <Typography variant='body2'>{question.subject}</Typography>
        {produceQContent(question)}
      </CardContent>
    </Card>
  );
}

export default function ExercisePage() {
  const exercise = useLoaderData();
  console.debug("Exercice exercise are", exercise);

  const handleClickSidebar = (e, idx) => {
    console.debug("click sidebar on", idx);
    if (0 <= idx && idx < exercise.questionsIDs.length) {
      const target = `q-${idx}`;
      const element = document.getElementById(target);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box
      display='flex'
      width='100%'
      flexDirection='row'
      gap='20px'
      marginBottom='40px'>
      <Box
        display='flex'
        width='100%'
        flexDirection='column'
        alignItems='center'
        gap='70px'>
        {exercise.questionsIDs.map((q, idx) => {
          return (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
            />
          );
        })}
      </Box>
      <Box
        width='min(15%, 10vw)'
        display='flex'
        flexDirection='column'
        alignItems='center'
        gap='20px'>
        <FormControl>
          <Button
            type='submit'
            color='error'
            variant='outlined'>
            Reset
          </Button>
        </FormControl>
        <Sidebar
          variant='outlined'
          width='100%'
          maxHeight='60vh'
          fontSize='15px'
          className='scrolling-area scroll-right'>
          <CollapsingSidebarSection
            divide={false}
            makeIcon={makeSolvedIcon}
            onClick={handleClickSidebar}
            makeText={(v, idx) => `Question ${idx + 1}`}
            makeTarget={(v, idx) => `#q-${idx}`}
            content={exercise.questionsIDs}
            disableRouting={true}
          />
        </Sidebar>
      </Box>
    </Box>
  );
}
