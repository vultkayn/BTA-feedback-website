import React from "react";
import "./styles/Sidebar.css";
import { styled } from "@mui/material/styles";

import { Link } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  Box,
  Paper,
  Collapse,
  Badge,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItem,
  Divider,
  Chip,
} from "@mui/material";

const InnerBadge = styled((props) => {
  const { offsetX, offsetY, ...other } = props;
  return <Badge {...other} />;
})(({ theme, offsetX, offsetY }) => ({
  transform: `translate(${offsetX ?? "-2px"}, ${offsetY ?? "2px"})`,
}));

export const makeSolvedIcon = (v, idx) => {
  const { solved } = v;
  return solved ? (
    <ListItemIcon sx={{ minWidth: "min-content" }}>
      {" "}
      <CheckCircleIcon
        fontSize='small'
        htmlColor='green'
      />
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
    padding: "10px",
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

function CollapsingSidebarItem({
  onClick = (e, idx) => {},
  target = "",
  text = "",
  icon = null,
  showIcon = true,
  ...ListButtonProps
}) {
  const item = (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        onClick={onClick}
        to={target}
        {...ListButtonProps}>
        <ListItemText
          primary={text}
          className='SidebarListing-item'
        />
      </ListItemButton>
    </ListItem>
  );

  if (showIcon)
    return (
      <Badge
        badgeContent={icon}
        sx={{ width: "inherit" }}
        offsetX="-10px"
        offsetY="10px"
        >
        {item}
      </Badge>
    );
  else return item;
}

export function CollapsingSidebarSection({
  title = "",
  divide = true,
  variant = "outlined",
  content = [],
  onClick = (e, idx) => {},
  makeTarget = (v, idx) => v.name,
  makeText = (v, idx) => v.name,
  makeIcon = (v, idx) => {},
  showIcon = true,
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
      <Collapse
        in={opened}
        timeout='auto'>
        {content.map((v, idx) => {
          return (
            <>
              {idx > 0 && variant === "outlined" && (
                <Divider
                  variant='middle'
                  flexItem
                />
              )}
              <CollapsingSidebarItem
                key={`item-${idx}`}
                icon={makeIcon(v, idx)}
                showIcon={showIcon}
                text={makeText(v, idx)}
                selected={selectedIndex === idx}
                onClick={(e) => handleClick(e, idx)}
                target={makeTarget(v, idx)}
                reloadDocument={disableRouting}
                sx={{ justifyContent: "space-between", width: "100%" }}
              />
            </>
          );
        })}
      </Collapse>
    </List>
  );
}
