import React from "react";
import { Outlet } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link, NavLink } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";
import Navbar from "../components/Navbar";
import useAuth from "../bridge/authUtilities";

const TABS = [
  {
    authRequired: false,
    authStrict: false,
    key: "1",
    props: {
      value: "1",
      label: "Practice",
      to: "/practice",
    },
  },
  {
    authRequired: false,
    authStrict: false,
    key: "2",
    props: {
      value: "2",
      label: "Stats",
      to: "/stats",
    },
  },
  {
    authRequired: true,
    authStrict: true,
    key: "3",
    props: {
      value: "3",
      label: "Discussion",
      to: "/chat",
    },
  },
  {
    authRequired: false,
    authStrict: false,
    key: "4",
    props: {
      value: "4",
      label: "Bugs",
      to: "/bugs",
    },
  },
];

export default function Root() {
  const {loggedIn} = useAuth();
  let tabs = TABS.filter(
    (tab) =>
      (tab.authRequired && loggedIn) ||
      (!tab.authRequired && !loggedIn) ||
      (!tab.authRequired && loggedIn && !tab.authStrict)
  );

  console.debug("Rendering Root");

  return (
      <div id='scaffold'>
        <div id='scaffold-header'>
          <AppBar
            position='static'
            color='primary'
            sx={{
              mb: 2,
            }}>
            <Toolbar>
            <Button
            variant="text"
            component={Link}
            to='/'
            >
            <Typography variant='h4' color="white">BTA</Typography>
          </Button>

              <Navbar
                textColor='inherit'
                indicatorColor='white'
                BoxProps={{
                  sx: {
                    width: "100%",
                  },
                }}
                tabs={tabs}
                centered
              />

              {loggedIn ? (
                <ProfileMenu />
              ) : (
                <Button
                  color='inherit'
                  height='minHeight'
                  component={NavLink}
                  to='/account/login'>
                  Login
                </Button>
              )}
            </Toolbar>
          </AppBar>
        </div>

        <div id='scaffold-main'>
          <Outlet />
        </div>
      </div>
  );
}
