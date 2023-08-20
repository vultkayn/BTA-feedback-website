import React from "react";
import "./styles/Sidebar.css";

import { Link } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";

import {
  Box,
  Paper,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from "@mui/material";

export const makeSolvedIcon = (v, idx) => {
  const { solved } = v;
  return solved ? (
    <ListItemIcon sx={{ minWidth: "min-content" }}>
      {" "}
      <CheckCircleIcon htmlColor='green' />
    </ListItemIcon>
  ) : null;
};

export default function Sidebar({
  elevation = 1,
  children,
  variant = "elevation",
  paperProps,
  ...BoxProps
}) {
  const props = {
    height: "100%",
    flexGrow: "auto",
    paddingtop: "10px",
    paddingbot: "10px",
    overflow: "scroll",
    scrollbarwidth: "thin",
    ...BoxProps,
  };

  return (
    <Box {...props}>
      <Paper
        elevation={elevation}
        square
        variant={variant}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
        {...paperProps}>
        {children}
      </Paper>
    </Box>
  );
}

export function CollapsingSidebarSection({
  title = "",
  divide = true,
  canAdd = true,
  addTarget = "",
  content = [],
  onClick = (e, idx) => {},
  makeTarget = (v, idx) => v.name,
  makeText = (v, idx) => v.name,
  makeIcon = (v, idx) => {},
  disableRouting = false,
  inset = false,
  ...ListProps
}) {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [opened, setOpened] = React.useState(true);
  const handleClick = (e, idx) => {
    setSelectedIndex(idx);
    onClick(e, idx);
  };

  const handleCollapse = (e) => setOpened(!opened);

  return (
    <List
      className='Sidebar-content SidebarListing'
      style={{ overflow: "auto" }}
      {...ListProps}>
      {divide ? (
        <Divider variant='middle'>
          {title ? (
            <Chip
              label={title}
              clickable
              color='secondary'
              variant={opened ? "outlined" : "filled"}
              onClick={handleCollapse}
            />
          ) : null}
        </Divider>
      ) : null}
      <Collapse in={opened}>
        {content.map((v, idx) => {
          const text = makeText(v, idx);
          const target = makeTarget(v, idx);

          return (
            <ListItemButton
              component={Link}
              selected={selectedIndex === idx}
              sx={{ justifyContent: "space-between" }}
              onClick={(e) => handleClick(e, idx)}
              key={`${target}-${idx}`}
              to={target}
              reloadDocument={disableRouting}>
              <ListItemText
                primary={text}
                className='SidebarListing-item'
                inset={inset}
                sx={{ overflow: "clip" }}
              />
              {makeIcon(v, idx)}
            </ListItemButton>
          );
        })}
        {canAdd ? (
          <ListItemButton
            component={Link}
            sx={{ justifyContent: "center" }}
            to={addTarget}
            reloadDocument={disableRouting}>
            <ListItemIcon sx={{ minWidth: "min-content" }}>
              {" "}
              <AddIcon htmlColor='blue' />
            </ListItemIcon>
          </ListItemButton>
        ) : null}
      </Collapse>
    </List>
  );
}
