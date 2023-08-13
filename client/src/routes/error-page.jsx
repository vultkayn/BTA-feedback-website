import React from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import "./styles/error.css";

import { Typography, Box } from "@mui/material";

export default function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Box id='error-page'>
        <Typography
          variant='h2'
          gutterBottom
          marginBottom='10vh'
          fontFamily='Monospace'>
          Oops! Error {error?.status ?? "'Unknown Status'"}
        </Typography>
        <div>
          <Typography variant='body1'>
            Sorry, an unexpected error has occurred.
          </Typography>
          <Typography
            color='#444'
            fontWeight='200'
            fontStyle='oblique'>
            {(error.statusText || error.message) ??
              "An internal error has occurred."}
          </Typography>
        </div>
      </Box>
    );
  }
  return (
    <Box id='error-page'>
      <Typography
        variant='h2'
        gutterBottom
        marginBottom='10vh'
        fontFamily='Monospace'>
        Oops! Error {error?.status ?? "'Unknown Status'"}
      </Typography>
      <div>
        <Typography variant='body1'>
          Sorry, an unexpected error has occurred.
        </Typography>
        <Typography
          color='#444'
          fontWeight='200'
          fontStyle='oblique'>
          {(error.statusText || error.message) ??
            "An internal error has occurred."}
        </Typography>
      </div>
    </Box>
  );
}
