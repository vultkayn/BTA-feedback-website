import React, { useState } from "react";
import Form, { ValidatedInput, validators } from "../components/Form";

import { Box, Button, TextareaAutosize } from "@mui/material";
import { prepareRouteForServer } from "./practice";
import { redirect, useActionData } from "react-router-dom";

export const action = ({apiClient}) =>
  async function ({ request }) {
    try {
      const formData = await request.formData();
      let catData = Object.fromEntries(formData);
      catData.kind = 0;
      catData.uri = prepareRouteForServer({
        uri: catData.uri,
        name: catData.name,
        kind: catData.kind,
      }).route;
      await apiClient.request({
        method: "post",
        url: "/api/practice/category",
        data: catData,
      });
      return redirect(`/practice/${catData.uri}`);
    } catch (error) {
      console.debug("CategoryCreation failed with", error);
      return error.response;
    }
  };

// FIXME add auth requirement for this page
export default function CategoryCreationForm() {
  const [valids, setValids] = useState({
    univID: true,
    password: true,
  });

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
        display:'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%"
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
          label='Description:'
          name='description'
          type='description'
          margin='normal'
          minRows={4}
          valid={valids.description}
        />
        <ValidatedInput
          label='Route:'
          name='route'
          validator={validators.length(0, 40)} // FIXME add route validator
          margin='normal'
          valid={valids.route}
          required
        />
      </Box>
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
