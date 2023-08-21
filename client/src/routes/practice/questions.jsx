import React, { useEffect, useState } from "react";

import { useParams, useOutletContext } from "react-router-dom";
import axios from "../../bridge/bridge";
import { QuestionAddingList } from "../../components/ExerciseUpdate";
import { questionDeletionAction } from "./exercise";

export default function QuestionUpdater() {
  let context = useOutletContext();
  const params = useParams();
  const [questions, setQuestions] = useState([]);
  const [lastQuestion, setLastQuestion] = useState({});

  let handleNew = async (e) => {
    console.log("handling new of", lastQuestion)
    let question = {...lastQuestion};
    if (!Array.isArray(question?.choices?.list)) return;
    if (!question?.title) return;
    if (!question?.statement) return;
    if (!question?.explanation) return;
    question.choices.list.splice(question.choices.list.length-1, 1); 
    try {
      if (process.env.DEBUG != null)
        console.debug("Creating Question", question);
      const response = await axios.request({
        method: "post",
        url: `/api/practice/category/${params.uri}/ex/${params.uriName}/q`,
        data: question,
      });
      question._id = response.data.qid;
      setQuestions(questions.concat([question]));
      setLastQuestion({});
    } catch (error) {
      if (process.env.DEBUG != null)
        console.debug("QuestionCreation failed with", error.response.data);
    }
  };

  useEffect(() => {
    if (context?.questions != null) setQuestions(context.questions);
  }, [context]);

  const handleDrop = (idx) => async (e) => {
    if (idx === -1)
      return setLastQuestion({})
    
    let question = questions[idx];
    if (idx < 0 || question._id == null) return;
    try {
      await questionDeletionAction({ ...params, qid: question._id });
      let newQ = [...questions];
      newQ.splice(idx, 1);
      setQuestions(newQ);
    } catch (error) {
      let q = { ...question };
      q.errors = error.response?.errors ?? null;
      let newQ = [...questions];
      newQ[idx] = q;
      setQuestions(newQ);
      return;
    }
  };

  const handleClickAway = (question) => async (e) => {
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
