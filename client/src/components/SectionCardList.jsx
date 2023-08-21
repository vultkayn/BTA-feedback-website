import React, { useEffect } from "react";
import { useFetcher, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import CardListCard from "./CardListCard";
import {
  breakdownURI,
  isExercisesSection,
  isCategoriesSection,
} from "../common/dataFormatting";
import DeleteIcon from "@mui/icons-material/Delete";
import ResponsiveFunction from "./ResponsiveFunctions";

export function SectionResponsiveCard({
  fetcherData,
  sectionObj,
  addDeleteListener = false,
  ...CardListCardProps
}) {
  /*   const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      console.debug ("attempt to load", "/practice/" + sectionObj.uri + "?index");
      fetcher.load("/practice/" + sectionObj.uri + "?index");
    }
  }, [fetcher, sectionObj]); */

  const displayDispatcher = ({ kind, data }) => {
    switch (kind) {
      case "body":
        if (!data.description) return <CircularProgress />;
        else
          return (
            <Typography
              paragraph
              variant='body1'>
              {data.description}
            </Typography>
          );
      case "resume":
        return (
          <Typography
            width='auto'
            variant='subtitle1'>
            {data.name}
          </Typography>
        );
      default:
        return null;
    }
  };
  sectionObj.description ??= fetcherData?.description;
  return (
    <CardListCard
      data={sectionObj}
      displayDispatcher={displayDispatcher}
      {...CardListCardProps}
    />
  );
}

export default function SectionCardList({
  section,
  PaperProps = {},
  addDeleteListener = false,
  sx,
  ...CardListCardProps
}) {
  const navigate = useNavigate();
  const [toDelete, setToDelete] = React.useState([]);

  const deleteFetcher = useFetcher();
  const handleCardDelete = (event, sectionObj) => {
    event.preventDefault();
    setToDelete(toDelete.concat(sectionObj));
  };

  const handleDeleteCancel = (event, sectionObj) => {
    event.preventDefault();
    setToDelete(toDelete.filter((obj) => obj.uri !== sectionObj.uri));
  };

  const handleTouch = (event, sectionObj) => {
    event.preventDefault();
    setToDelete([]);
    navigate("/practice/" + sectionObj.uri);
  };

  const saveDeletion = (e) => {
    e.preventDefault();
    const deleting = toDelete;
    setToDelete([]);
    for (const sectionObj of deleting) {
      if (isCategoriesSection(section))
        deleteFetcher.submit(`/practice/${sectionObj.uri}/@delete`, {
          method: "delete",
        });
      else if (isExercisesSection(section)) {
        const { route, uriName } = breakdownURI(sectionObj.uri, "/");
        deleteFetcher.submit(`/practice/${route}/${uriName}/@delete`, {
          method: "delete",
        });
      }
    }
  };

  return (
    <Paper
      square
      sx={{
        pl: 2,
        pr: 2,
        pt: 5,
        pb: 5,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        justifyContent: "space-around",
        ...sx,
      }}
      elevation={4}>
      <Box
        mr={12}
        display='flex'
        flexDirection='row'
        justifyContent='space-between'>
        <Typography variant='h4'>{section.title}</Typography>
        {addDeleteListener && toDelete.length ? (
          <Button
            onClick={saveDeletion}
            color='error'
            variant='outlined'
            startIcon={<DeleteIcon />}>
            <Typography>Confirm Deletion</Typography>
          </Button>
        ) : null}
      </Box>
      {section.listing.length ? (
        section.listing.map((sectionObj, idx) => (
          <ResponsiveFunction
            key={`card${idx}`}
            fetchFunction={(fetcher) => {
              if (fetcher.state === "idle" && !fetcher.data) {
                console.debug(
                  "attempt to load",
                  "/practice/" + sectionObj.uri + "?index"
                );
                console.log("Attempt to fetch sectionObj", sectionObj)
                fetcher.load("/practice/" + sectionObj.uri + "?index");
              }
            }}>
            <SectionResponsiveCard
              key={`card${idx}`}
              addDeleteListener={addDeleteListener}
              onDelete={handleCardDelete}
              onDeleteCancel={handleDeleteCancel}
              onTouch={handleTouch}
              sectionObj={sectionObj}
              dense
              {...CardListCardProps}
            />
          </ResponsiveFunction>
        ))
      ) : (
        <Typography variant='caption'>No elements were found.</Typography>
      )}
    </Paper>
  );
}
