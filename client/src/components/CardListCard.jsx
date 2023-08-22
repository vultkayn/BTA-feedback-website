import React from "react";
import { styled } from "@mui/material/styles";

import {
  Card,
  CardContent,
  IconButton,
  CardActionArea,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

/**
 *
 * @param {({kind: 'body' | 'resume', data}) => node} displayDispatcher Takes a kind as its first argument, that will describe which portion of the card needs to be displayed.
 * @returns
 */
export default function CardListCard({
  data = {},
  displayDispatcher = ({ kind, data }) => {},
  addDeleteListener = false,
  immediateDelete = false,
  interactive = true,
  onTouch = (event, data) => {},
  onDeleteCancel = (event, data) => {},
  onDelete = (event, data) => {},
  dense = false,
  sx = {},
  ...CardProps
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [markedDelete, setMarkedDelete] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  let actions = (
    <>
      {addDeleteListener ? (
        <IconButton
          sx={{ display: "block" }}
          onClick={(e) => {
            if (markedDelete) {
              setMarkedDelete(false);
              onDeleteCancel(e, data);
            } else {
              if (!immediateDelete) setMarkedDelete(true);
              onDelete(e, data);
            }
          }}>
          {!markedDelete ? (
            <DeleteForeverIcon htmlColor='red' />
          ) : (
            <RemoveCircleOutlineOutlinedIcon htmlColor='red' />
          )}
        </IconButton>
      ) : null}
      {dense ? (
        <ExpandMore
          expand={expanded}
          sx={{ display: "block" }}
          onClick={(e) => handleExpandClick(e, data)}>
          <ExpandMoreIcon />
        </ExpandMore>
      ) : null}
    </>
  );

  return (
    <Card
      sx={{
        width: "min(100%, 70vw)",
        ...sx,
      }} {...CardProps}>
      {interactive ? (
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "stretch",
            flexDirection: "row",
          }}>
          <CardActionArea
            onClick={(e) => onTouch(e, data)}
            sx={{ display: "inline-block" }}>
            {displayDispatcher({ kind: "resume", data })}
          </CardActionArea>
          {dense || addDeleteListener ? actions : null}
        </CardContent>
      ) : (
        <CardContent>
          {displayDispatcher({ kind: "resume", data })}
          {dense || addDeleteListener ? actions : null}
        </CardContent>
      )}

      <Collapse
        in={expanded || !dense}
        timeout='auto'
        unmountOnExit>
        <CardContent>{displayDispatcher({ kind: "body", data })}</CardContent>
      </Collapse>
    </Card>
  );
}

