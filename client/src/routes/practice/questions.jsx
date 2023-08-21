import React, { useEffect, useState } from "react";

import { useParams, useOutletContext } from "react-router-dom";
import axios from "../../bridge/bridge";
import { QuestionAddingList } from "../../components/ExerciseUpdate";
import { questionDeletionAction } from "./exercise";

const createQuestion = async (question, { params }) => {
  if (!Array.isArray(question?.choices?.list)) return;
  if (!question?.title) return;
  if (!question?.statement) return;
  if (!question?.explanation) return;
  let lastChoice = question.choices.list[question.choices.list.length - 1];
  if (!lastChoice.label || !lastChoice.name)
    question.choices.list.splice(question.choices.list.length - 1, 1);
  try {
    if (process.env.DEBUG != null) console.debug("Creating Question", question);
    const response = await axios.request({
      method: "post",
      url: `/api/practice/category/${params.uri}/ex/${params.uriName}/q`,
      data: question,
    });
    question._id = response.data.qid;
  } catch (error) {
    if (process.env.DEBUG != null)
      console.debug("QuestionCreation failed with", error.response.data);
    throw error;
  }
};

const updateQuestion = async (question, { params }) => {
  if (!Array.isArray(question?.choices?.list)) return;
  if (!question?.title) return;
  if (!question?.statement) return;
  if (!question?.explanation) return;
  let lastChoice = question.choices.list[question.choices.list.length - 1];
  if (!lastChoice.label || !lastChoice.name)
    question.choices.list.splice(question.choices.list.length - 1, 1);
  try {
    if (process.env.DEBUG != null) console.debug("Updating Question", question);
    await axios.request({
      method: "put",
      url: `/api/practice/category/${params.uri}/ex/${params.uriName}/q/${params.qid}`,
      data: question,
    });
  } catch (error) {
    if (process.env.DEBUG != null)
      console.debug("QuestionUpdate failed with", error.response.data);
    throw error;
  }
};

export default function QuestionUpdater() {
  let context = useOutletContext();
  const params = useParams();
  const [questions, setQuestions] = useState([]);
  const [lastQuestion, setLastQuestion] = useState({});

  let handleNew = async (e) => {
    console.log("handling new of", lastQuestion);
    let question = { ...lastQuestion };
    try {
      await createQuestion(question, { params });
      setQuestions(questions.concat([question]));
      setLastQuestion({});
    } catch (error) {
      return;
    }
  };

  useEffect(() => {
    if (context?.questions != null) setQuestions(context.questions);
  }, [context]);

  const handleDrop = (idx) => async (e) => {
    if (idx === -1) return setLastQuestion({});
    if (idx < 0) throw new Error("invalid question idx");
    let question = questions[idx];
    if (question?._id == null) throw new Error("question must have _id");
    try {
      await questionDeletionAction({ params: {...params, qid: question._id} });
      let newQ = [...questions];
      newQ.splice(idx, 1);
      setQuestions(newQ);
    } catch (error) {
      let q = { ...question };
      q.errors = error.response?.errors ?? null;
      let newQ = [...questions];
      newQ[idx] = q;
      setQuestions(newQ);
    }
  };

  const handleClickAway = (idx) => async (e) => {
    console.log("handleclcikaway", idx)
    if (idx === -1) return setLastQuestion({});
    if (idx < 0) throw new Error("invalid question idx");
    let question = questions[idx];
    if (question?._id == null) throw new Error("question must have _id");

    try {
      await updateQuestion({params: {...params, qid: question._id}})
    } catch (error) {
      let q = { ...question };
      q.errors = error.response?.errors ?? null;
      let newQ = [...questions];
      newQ[idx] = q;
      setQuestions(newQ);
    }
  };

  return (
    <QuestionAddingList
      questions={questions}
      setQuestions={setQuestions}
      setLastQuestion={setLastQuestion}
      lastQuestion={lastQuestion}
      onNew={handleNew}
      onDrop={handleDrop}
      onFocusOut={handleClickAway}
    />
  );
}
