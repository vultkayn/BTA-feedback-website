import React, { useState } from "react";
import {
  Outlet,
  useActionData,
  useLoaderData,
  useOutletContext,
} from "react-router-dom";

import Form, { validators, ValidatedInput } from "../components/Form";

import { Button } from "@mui/material";
// import Dashboard from "../components/Dashboard";

export function Dashboard({ user }) {
  return <div>dashboard</div>;
}

function ProfileForm({ user, errors, editing = false, onEdit = (e) => {} }) {
  const [valids, setValids] = useState({
    password: true,
    firstName: true,
    lastName: true,
    email: true,
  });

  if (errors !== undefined) {
    setValids({
      password: !("password" in errors),
      firstName: !("firstName" in errors),
      lastName: !("lastName" in errors),
      email: !("email" in errors),
    });
  }

  const inputs = (
    <>
      <ValidatedInput
        label='UnivID:'
        name='univID'
        defaultValue={user.univID}
        InputProps={{ readOnly: true, disabled: !editing }}
        variant={editing ? "filled" : "outlined"}
      />
      <ValidatedInput
        label='Password:'
        name='password'
        type='password'
        defaultValue='password'
        valid={valids.password}
        validator={validators.password}
        InputProps={{ disabled: !editing }}
      />
      <ValidatedInput
        label='First Name:'
        name='firstName'
        defaultValue={user.firstName}
        valid={valids.firstName}
        validator={validators.length(1, 15)}
        InputProps={{ disabled: !editing }}
      />
      <ValidatedInput
        label='Last Name:'
        name='lastName'
        valid={valids.lastName}
        defaultValue={user.lastName}
        validator={validators.length(1, 15)}
        InputProps={{ disabled: !editing }}
      />
      <ValidatedInput
        label='Email:'
        name='email'
        type='email'
        defaultValue={user.email}
        valid={valids.email}
        validator={validators.email}
        InputProps={{ disabled: !editing }}
      />
      <ValidatedInput
        label='Promo:'
        name='promo'
        type='text'
        defaultValue={user.promo}
        InputProps={{ readOnly: true, disabled: !editing }}
        variant={editing ? "filled" : "outlined"}
      />
    </>
  );

  if (editing) {
    return (
      <Form
        method='post'
        reactForm={true}
        toApi={true}>
        {inputs}
        <Button
          className='btn-submit'
          variant='contained'
          type='submit'>
          Submit
        </Button>
      </Form>
    );
  }

  return <div>{inputs}</div>;
}

export function ProfilePage () {
  const user = useLoaderData ();

  return (
    <>
      <Dashboard user={user} />
      <Outlet context={{ user }} />
    </>
  );
}

export function EditProfilePage() {
  const { user } = useOutletContext();
  const [editing, setEditing] = useState(false);
  const errors = useActionData();

  if (!editing) {
    return (
      <>
        <ProfileForm
          user={user}
          errors={undefined}
          editing={false}
        />
        <Button
          className='btn-edit'
          variant='contained'
          onClick={(e) => setEditing(true)}
          color='secondary'>
          Edit
        </Button>
      </>
    );
  }

  return (
    <ProfileForm
      user={user}
      errors={errors && errors.errors}
      editing={editing}
    />
  );
}
