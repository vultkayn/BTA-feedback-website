import React, { useState, useEffect } from "react";
import Form, { ValidatedInput, validators } from "../components/Form";
import { Link, useActionData } from "react-router-dom";
import { Button, Box, Typography } from "@mui/material";

export default function SignupPage() {
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
      <Box
        display='flex'
        flexDirection='row'
        justifyContent='center'
        alignContent='center'
        flexWrap="wrap"
        pt={6}>
        <Box
          width='80%'
          display='flex'
          justifyContent='end'>

          <Button
            className='btn login-swap-btn'
            size='medium'
            variant='text'
            component={Link}
            to='/account/login'>
            Login
          </Button>
        </Box>
        <Form
          method='post'
          reactForm={true}
          id='Signup-form'
          BoxProps={{
            width: "fit-content",
            minWidth: "30vw",
            display: "flex",
            justifyContent: "space-between"
          }}>
          <Box
            display='flex'
            flexDirection='column'
            justifyContent='space-evenly'>
                        <Typography
            variant='h3'
            paragraph>
            Register
          </Typography>
            <ValidatedInput
              label='UnivID:'
              name='univID'
              validator={validators.length(1, 20)}
              error={errors.univID != null}
              margin='normal'
              fullWidth
              helperText={errors.univID ? errors.univID.msg : ""}
            />
            <ValidatedInput
              label='Password:'
              name='password'
              type='password'
              validator={validators.password}
              error={errors.password != null}
              fullWidth
              helperText={errors.password ? errors.password.msg : ""}
              margin='normal'
            />
            <ValidatedInput
              label='First Name:'
              name='firstName'
              validator={validators.length(1, 15)}
              error={errors.firstName != null}
              fullWidth
              helperText={errors.firstName ? errors.firstName.msg : ""}
              margin='normal'
            />
            <ValidatedInput
              label='Last Name:'
              name='lastName'
              validator={validators.length(1, 15)}
              error={errors.lastName != null}
              fullWidth
              helperText={errors.lastName ? errors.lastName.msg : ""}
              margin='normal'
            />
            <ValidatedInput
              label='Email:'
              name='email'
              type='email'
              validator={validators.email}
              error={errors.email != null}
              fullWidth
              helperText={errors.email ? errors.email.msg : ""}
              margin='normal'
            />
            <ValidatedInput
              label='Promo:'
              name='promo'
              type='text'
              validator={(n, v, setMsg) =>
                (/[0-9]{4}/.test(v) &&
                  parseInt(v) >= 1990 &&
                  parseInt(v) <= 2100) ||
                (setMsg("Promotion should be between 1990 and 2100") && false)
              }
              inputProps={{ inputMode: "numeric", pattern: "[0-9]{4}" }}
              error={errors.promo != null}
              fullWidth
              helperText={errors.promo ? errors.promo.msg : ""}
              margin='normal'
            />
          </Box>
          <Box display="flex" justifyContent="end">
            <Button
              className='btn-submit'
              type='submit'
              variant='contained'>
              Submit
            </Button>
          </Box>
        </Form>
      </Box>
    </>
  );
}
