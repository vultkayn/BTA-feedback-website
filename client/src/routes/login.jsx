import React, { useState, useEffect } from "react";
import Form, { ValidatedInput, validators } from "../components/Form";
import { Link, useActionData } from "react-router-dom";
import { Button, Box } from "@mui/material";



export default function LoginPage() {
  const [errors, setErrors] = useState({});

  const err = useActionData();
  useEffect(() => {
    let fieldErrors = {};
    if (err != null) {
      console.log("received errors are", err);
      if (err.status === 400) {
        if (err.data?.errors != null) {
          fieldErrors.univID = err.data.errors.univID;
          fieldErrors.password = err.data.errors.password;
        }
      }
    }
    setErrors(fieldErrors);
  }, [err]);

  return (
    <Box
      display='flex'
      flexDirection='row'
      justifyContent='space-evenly'>
      <Button
        className='btn login-swap-btn'
        variant='text'
        component={Link}
        to='/account/signup'>
        Signup
      </Button>

      <Form
        method='post'
        reactForm={true}
        id='Login-form'>
        <ValidatedInput
          label='UnivID:'
          name='univID'
          helperText={errors.univID ? errors.univID.msg : ""}
          validator={validators.length(1, 20)}
          margin='normal'
          error={errors.univID != null}
          fullWidth
        />
        <ValidatedInput
          label='Password:'
          name='password'
          type='password'
          helperText={errors.password ? errors.password.msg : ""}
          validator={validators.length(1, 30)}
          margin='normal'
          error={errors.password != null}
          fullWidth
        />
        <Box justifySelf='right'>
          <Button
            className='btn-submit'
            type='submit'
            variant='contained'>
            Submit
          </Button>
        </Box>
      </Form>
    </Box>
  );
}
