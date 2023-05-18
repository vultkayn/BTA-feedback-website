import Scaffold from "../components/Scaffold";
import { AppBar, Toolbar, Typography } from "@mui/material";
import Navbar from "../components/Navbar";
import { NavLink } from "react-router-dom";
import ProfileMenu from "../components/ProfileMenu";



export default function Root () {

  let appbar = <AppBar position="static">
    <Toolbar>
      <Typography
        variant="h4"
        component="div"
        textDecoration="none"
      >
        <NavLink to='/' className={(isActive, isPending) =>
          isActive
            ? 'nav-tab active'
            : isPending
              ? "nav-tab pending"
              : "nav-tab"
        }>
          BTA
        </NavLink>
      </Typography>

      <Navbar
        tabs={[
          {
            key: 1,
            to: '/account/login',
            label: 'Login',
          }
        ]}
        BoxProps={{
          sx: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            width: '100%',
            flexAlign: 'center',
            color: 'white'
          }
        }}
      />

      <ProfileMenu />

    </Toolbar>
  </AppBar>

  return (
      <Scaffold
        header={appbar}
      />
  );
}