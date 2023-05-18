import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Tab, Tabs, Box } from '@mui/material';


export default function Navbar ({ tabs, className = '', BoxProps = {} }) {
  const [value, setValue] = useState(0);
  const [active, setActive] = useState(0);

  const handleClick = (e) => {
    setActive(e.currentTarget);
  }

  const tabsComp = tabs.map((tab) =>
    <Tab key={tab.key}
      label={tab.label}
      component={NavLink}
      to={tab.to}
      onClick={handleClick}
      className={'new-tab' /* TODO active ? pending */}
    />
  );

  let props = {
    ...BoxProps,
    component: "nav",
    className:`Navbar ${className}`
  }
  // BUG potential with BoxProps
  return (
    <Box {...props}>
      <Tabs value={value} textColor="secondary" onChange={(e, newValue) => setValue(newValue)}>
        {tabsComp}
      </Tabs>
    </Box>
  );
}