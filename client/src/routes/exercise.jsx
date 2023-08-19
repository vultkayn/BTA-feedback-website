import React from "react";
import {
  Card,
  Box,
  CardContent,
  Typography,
  FormControl,
  Container,
  Button,
} from "@mui/material";
import Sidebar, { SidebarListing, makeSolvedIcon } from "../components/Sidebar";
import { useLoaderData, useOutletContext } from "react-router-dom";

export const loader = (authHook) =>
  async function ({ params }) {
    const { uri, id } = params;
    const res = authHook.send({
      method: "get",
      url: "/api/practice/exercise/" + uri + "/" + id, // FIXME
    });

    if (res.data) return res;
  };

function produceQContent(question) {
  const produceCheckbox = () => {
    return question.choices.arr.map(({ name, label }) => {
    });
  };

  const produceRadio = () => {
    return question.choices.arr.map(({ name, label }) => {
    });
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
  const details = useLoaderData();
  const route = details?.route ?? "";

  console.log("Exercice details are", details);

/*   const details = {
    kind: 1, // 0 for catgs, 1 for exercises
    route: "memory-pointers/", // object route, from root supercategory /.
    solved: false,
    progress: 4
    ,

    // Exercises specific infos:
    questions: [
      {
        id: 3,
        solved: true,
        title: "I am a question",
        subject: "There are 10 kind of people.",
        language: "cpp",
        languageSnippet: "",
        choices: {
          type: "checkbox",
          arr: [
            {
              name: "choice1",
              label: "",
            },
          ],
        },
      },
      {
        id: 4,
        solved: false,
        title: "Yet another one",
        subject: "How many bite the dust?",
        choices: {
          type: "checkbox",
          arr: [
            {
              name: "choice1",
              label: "",
            },
          ],
        },
      },
      {
        id: 6,
        solved: false,
        title: "Yet another one",
        subject: "How many bite the dust?",
        choices: {
          type: "checkbox",
          arr: [
            {
              name: "choice1",
              label: "",
            },
          ],
        },
      },
      {
        id: 22,
        solved: false,
        title: "Yet another one",
        subject: "How many bite the dust?",
        choices: {
          type: "checkbox",
          arr: [
            {
              name: "choice1",
              label: "",
            },
          ],
        },
      },
      {
        id: 14,
        solved: false,
        title: "Yet another one",
        subject: "How many bite the dust?",
        choices: {
          type: "checkbox",
          arr: [
            {
              name: "choice1",
              label: "",
            },
          ],
        },
      },
      {
        id: 17,
        solved: false,
        title: "Yet another one",
        subject: "How many bite the dust?",
        choices: {
          type: "checkbox",
          arr: [
            {
              name: "choice1",
              label: "",
            },
          ],
        },
      },
      {
        id: 18,
        solved: true,
        title: "Yet another one",
        subject: "How many bite the dust?",
        choices: {
          type: "checkbox",
          arr: [
            {
              name: "choice1",
              label: "",
            },
          ],
        },
      },
      {
        id: 74,
        solved: false,
        title: "Yet another one",
        subject: "How many bite the dust?",
        choices: {
          type: "checkbox",
          arr: [
            {
              name: "choice1",
              label: "",
            },
          ],
        },
      },
    ], // used to fetch the questions
    nbAttempts: 0,
    lastAttemptDate: "2023-05-14",
  };
 */
  const handleClickSidebar = (e, idx) => {
    console.log("click sidebar on", idx);
    if (0 <= idx && idx < details.questions.length) {
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
        {details.questions.map((q, idx) => {
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
          <SidebarListing
            divide={false}
            makeIcon={makeSolvedIcon}
            onClick={handleClickSidebar}
            makeText={(v, idx) => `Question ${idx + 1}`}
            makeTarget={(v, idx) => `#q-${idx}`}
            content={details.questions}
            disableRouting={true}
          />
        </Sidebar>
      </Box>
    </Box>
  );
}
