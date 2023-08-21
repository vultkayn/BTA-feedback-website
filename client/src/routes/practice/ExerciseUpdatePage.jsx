import React, { useState } from "react";

import { Box, Typography, Divider } from "@mui/material";
import {
  useRouteLoaderData,
  useParams,
  Outlet,
  useOutletContext,
  useFetcher,
} from "react-router-dom";
import axios from "../../bridge/bridge";
import { ExerciseCreationForm } from "../../components/ExerciseUpdate";

// FIXME add auth requirement for this page
export default function ExerciseUpdatePage({ readOnly }) {
  let { exercise } = useOutletContext();
  exercise ??= {};
  const errors = exercise.errors ?? {};

  return (
    <>
      <Typography
        paragraph
        align='left'
        variant='h3'>
        Update {exercise.name}
      </Typography>
      <Box
        width='100%'
        display='flex'
        justifyContent='space-between'>
        <Box
          minWidth='20vw'
          display='flex'
          justifyContent='space-around'>
          <ExerciseCreationForm
            exercise={exercise}
            errors={errors}
            readOnly={readOnly}
          />
          <Divider
            orientation='vertical'
            variant='middle'
            flexItem
          />
        </Box>
        <Outlet context={{questions: exercise.questionsIDs}}/>
      </Box>
      {/* Questions List */}
    </>
  );
}
