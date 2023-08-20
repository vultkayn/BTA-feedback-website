import React, { useState, useEffect } from "react";
import Form, { ValidatedInput, validators } from "../components/Form";
import { Link, useActionData } from "react-router-dom";
import { Button, Box } from "@mui/material";

export function SignupPage() {
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
          fieldErrors.firstName = err.data.errors.firstName;
          fieldErrors.lastName = err.data.errors.lastName;
          fieldErrors.email = err.data.errors.email;
          fieldErrors.promo = err.data.errors.promo;
        }
      }
    }
    setErrors(fieldErrors);
  }, [err]);

  return (
    <>
      <Button
        className='btn login-swap-btn'
        variant='text'
        component={Link}
        to='/account/login'>
        Login
      </Button>
      <Form
        method='post'
        reactForm={true}
        endpoint='/api/auth/'
        id='Signup-form'>
        <Box
        display='flex'
        flexDirection='column'
        justifyContent='space-evenly'
        maxWidth="40%">
        <ValidatedInput
          label='UnivID:'
          name='univID'
          valid={errors.univID == null}
          validator={validators.length(1, 20)}
        />
        <ValidatedInput
          label='Password:'
          name='password'
          type='password'
          valid={errors.password == null}
          validator={validators.password}
        />
        <ValidatedInput
          label='First Name:'
          name='firstName'
          valid={errors.firstName == null}
          validator={validators.length(1, 15)}
        />
        <ValidatedInput
          label='Last Name:'
          name='lastName'
          valid={errors.lastName == null}
          validator={validators.length(1, 15)}
        />
        <ValidatedInput
          label='Email:'
          name='email'
          type='email'
          valid={errors.email == null}
          validator={validators.email}
        />
        <ValidatedInput
          label='Promo:'
          name='promo'
          type='text'
          valid={errors.promo == null}
          validator={(n, v, setMsg) =>
            (/[0-9]{4}/.test(v) &&
              parseInt(v) >= 1990 &&
              parseInt(v) <= 2100) ||
            (setMsg("Promotion should be between 1990 and 2100") && false)
          }
          inputProps={{ inputMode: "numeric", pattern: "[0-9]{4}" }}
        />
        <Button
          className='btn-submit'
          variant='contained'
          type='submit'>
          Submit
        </Button>
        </Box>
      </Form>
    </>
  );
}

export function LoginPage() {
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
          valid={errors.univID == null}
          fullWidth
        />
        <ValidatedInput
          label='Password:'
          name='password'
          type='password'
          helperText={errors.password ? errors.password.msg : ""}
          validator={validators.length(1, 30)}
          margin='normal'
          valid={errors.password == null}
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
