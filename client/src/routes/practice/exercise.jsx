import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  Box,
  CardContent,
  Typography,
  FormControl,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  ButtonGroup,
  FormGroup,
  Checkbox,
} from "@mui/material";
import Sidebar, {
  CollapsingSidebarSection,
  makeSolvedIcon,
} from "../../components/Sidebar";
import {
  useLoaderData,
  redirect,
  Link,
  Outlet,
  useOutletContext,
} from "react-router-dom";
import axios from "../../bridge/bridge";
import useAuth from "../../bridge/authUtilities";
import { CheckBox } from "@mui/icons-material";
import CardListCard from "../../components/CardListCard";

export const exerciseLoader = async ({ params }) => {
  try {
    const res = await axios.request({
      method: "get",
      url: `/api/practice/category/${params.uri}/ex/${params.uriName}?full`,
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

export const exerciseDeletionAction = async function ({ params }) {
  try {
    if (process.env.DEBUG != null)
      console.debug("Deleting Exercise", `${params.uri}/ex/${params.uriName}`);
    await axios.request({
      method: "delete",
      url: `/api/practice/category/${params.uri}/ex/${params.uriName}`,
    });

    return redirect(`/practice/${params.uri}`);
  } catch (error) {
    if (process.env.DEBUG != null)
      console.debug("ExerciseDeletion failed with", error.response.data);
    throw error;
  }
};

export const questionCreationAction = async function ({ request, params }) {
  try {
    const formData = await request.formData();
    let question = Object.fromEntries(formData);
    if (process.env.DEBUG != null) console.debug("Creating Question", question);
    await axios.request({
      method: "post",
      url: `/api/practice/category/${params.uri}/ex/${params.uriName}/q`,
      data: question,
    });
  } catch (error) {
    if (process.env.DEBUG != null)
      console.debug("QuestionCreation failed with", error.response.data);
    if (error.status === 400 && error.response.data.errors)
      return error.response;
    throw error;
  }
};
export const questionDeletionAction = async function ({ params }) {
  try {
    if (process.env.DEBUG != null)
      console.debug(
        "Deleting Question",
        `${params.uri}/${params.uriName}/${params.qid}`
      );
    const response = await axios.request({
      method: "delete",
      url: `/api/practice/category/${params.uri}/ex/${params.uriName}/q/${params.qid}`,
    });
    return response.data;
  } catch (error) {
    if (process.env.DEBUG != null)
      console.debug("QuestionDeletion failed with", error.response.data);
    if (error.status === 400 && error.response.data.errors)
      return error.response;
    throw error;
  }
};

export function ExerciseProvider() {
  const loaderData = useLoaderData();
  const [exercise, setExercise] = useState({});
  useEffect(() => {
    console.debug("ExercisePAge: Within useEffect loaderData", loaderData);
    if (loaderData && !loaderData.errors) {
      setExercise({
        route: loaderData?.route ?? "",
        kind: 1,
        categoryID: loaderData.category,
        categoryURI: loaderData.categoryURI,
        answer: loaderData.answer,
        lastModified: loaderData.lastModified,
        lastModifiedBy: loaderData.lastModifiedBy,
        name: loaderData.name ?? "",
        uri: loaderData.uri ?? "",
        uriName: loaderData.uriName ?? "",
        description: loaderData?.description ?? "",
        solved: loaderData.solved ?? false,
        questionsIDs: loaderData?.questionsIDs ?? [],
      });
    }
  }, [loaderData, setExercise]);

  return <Outlet context={{ exercise }} />;
}

function produceQContent(question) {
  const produceCheckbox = () => {
    return (
      <FormGroup
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 2,
        }}>
        {question.choices.list.map(({ name, label }) => {
          return (
            <FormControlLabel
              key={name}
              value={name}
              control={<Checkbox />}
              label={label}
            />
          );
        })}
      </FormGroup>
    );
  };

  const produceRadio = () => {
    return (
      <RadioGroup
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
        row
        defaultValue={question.choices.list[0].name}>
        {question.choices.list.map(({ name, label }) => {
          return (
            <FormControlLabel
              key={name}
              value={name}
              control={<Radio />}
              label={label}
            />
          );
        })}
      </RadioGroup>
    );
  };

  const format = question.choices.format;
  const producer =
    format === "checkbox"
      ? produceCheckbox
      : format === "radio"
      ? produceRadio
      : null;

  if (producer === null) throw new Error("Invalid producer found in data");

  return producer();
}

function QuestionCard({ question, index, ...CardListCardProps }) {
  const displayDispatcher = ({ kind, data }) => {
    switch (kind) {
      case "body":
        return produceQContent(question);
      case "resume":
        return (
          <>
            <Typography
              variant='h4'
              gutterBottom>
              {`#${index + 1} ${question.title}`}
            </Typography>
            <Typography variant='body2'>{question.statement}</Typography>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <CardListCard
      id={`q-${index}`}
      data={question}
      displayDispatcher={displayDispatcher}
      {...CardListCardProps}
    />
  );
}

export default function ExercisePage() {
  const { exercise } = useOutletContext();
  const { loggedIn } = useAuth();
  console.debug("Exercise is", exercise);

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
      <Box width='100%'>
        <Box
          flexDirection='row'
          display='flex'
          justifyContent='space-between'>
          <Typography
            gutterBottom
            mb={10}
            align='left'
            variant='h3'
            paragraph>
            {exercise?.name}
            <Typography variant='subtitle1'>
              {exercise?.lastModified &&
                `The ${new Date(exercise.lastModified).toLocaleDateString()}`}
            </Typography>
          </Typography>
          {loggedIn ? (
            <Button
              component={Link}
              to='@update/questions'
              sx={{
                flexBasis: "fit-content",
                marginRight: "5vw",
                height: "min-content",
              }}
              variant='contained'
              color='secondary'>
              <Typography variant='button'>Update Exercise</Typography>
            </Button>
          ) : null}
        </Box>
        <Box>
          <Typography
            paragraph
            gutterBottom
            mb={5}
            ml={5}
            variant='body1'
            align='left'>
            {exercise?.description}
          </Typography>
          <Box
            display='flex'
            width='100%'
            flexDirection='column'
            alignItems='center'
            gap='70px'>
            {exercise?.questionsIDs &&
              exercise.questionsIDs.map((q, idx) => {
                return (
                  <QuestionCard
                    key={q._id}
                    question={q}
                    index={idx}
                    sx={{ width: "min(70%, 70vw)" }}
                  />
                );
              })}
          </Box>
        </Box>
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
            content={exercise?.questionsIDs}
            disableRouting={true}
          />
        </Sidebar>
      </Box>
    </Box>
  );
}
