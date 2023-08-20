import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Tab, Tabs, Box } from "@mui/material";

export default function Navbar({ tabs, BoxProps = {}, ...TabsProps }) {
  const [value, setValue] = useState(tabs[0].props.value);

  const tabsComp = tabs.map((tab) => {
    tab.props.component = NavLink;
    return <Tab key={tab.key} {...tab.props} />;
  });
  
  let boxProps = {
    ...BoxProps,
    component: "nav",
  };
  // BUG potential with BoxProps
  return (
    <Box {...boxProps}>
      <Tabs
        {...TabsProps}
        value={value}
        onChange={(e, newValue) => setValue(newValue)}>
        {tabsComp}
      </Tabs>
    </Box>
  );
}
