import React, { forwardRef } from "react";
import Form from "./Form";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { IconButton, Card, CardContent, CardActions, Typography } from "@mui/material";
import { CancelOutlined } from "@mui/icons-material";

const FormCard = forwardRef(function FormCard(
  {
    idx,
    component = Form,
    componentProps = null,
    focused = false,
    headerText = null,
    hasAddButton = false,
    children = false,
    noDeleteButton = false,
    onAddAction = (e, { idx }) => {},
    onDeleteAction = (e, { idx }) => {},
    error = false,
    onChange = (e, { idx }) => {},
    disabled = false,
    sx = {},
  },
  ref
) {
  let styles = {
    display: "flex",
    flexDirection: "column",
    ...sx,
  }; 
  let Inner = component;
  if (focused)
    styles.boxShadow =
      "0px 4px 2px -2px rgba(0,0,200,0.2),0px 2px 4px 0px rgba(0,0,200,0.14),0px 2px 5px 0px rgba(0,0,200,0.12)";
  else if (error)
    styles.boxShadow =
      "0px 4px 2px -2px rgba(200,0,0,0.2),0px 2px 4px 0px rgba(200,0,0,0.14),0px 2px 5px 0px rgba(200,0,0,0.12)";
  return (
    <Card
      sx={styles}
      ref={ref}>
      <CardActions
        disableSpacing
        sx={{ alignSelf: "end" }}>
          {headerText && <Typography>{headerText}</Typography>}
          
        {!noDeleteButton && !disabled && (
          <IconButton
            aria-label='drop question'
            onClick={(e) => onDeleteAction(e, { idx })}>
            <CancelOutlined
              htmlColor='red'
              fontSize='large'
            />
          </IconButton>
        )}
        {hasAddButton && !disabled && (
          <IconButton
            aria-label='add question'
            onClick={(e) => onAddAction(e, { idx })}>
            <AddCircleOutlineIcon
              htmlColor='green'
              fontSize='large'
            />
          </IconButton>
        )}
      </CardActions>

      <CardContent>
        <Inner disabled={disabled} onChange={(e) => onChange(e, { idx })} {...componentProps}>{children}</Inner>
      </CardContent>
    </Card>
  );
});

export default FormCard;
