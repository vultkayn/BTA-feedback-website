import React, { useEffect } from "react";
import { useFetcher, useNavigate, useParams } from "react-router-dom";
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
import { categoryDeletionAction } from "../routes/practice/createCategory";
import { exerciseDeletionAction } from "../routes/practice/exercise";
import axios from "../bridge/bridge";

export function SectionResponsiveCard({
  fetcherData,
  sectionObj,
  addDeleteListener = false,
  ...CardListCardProps
}) {
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
      addDeleteListener={addDeleteListener}
      {...CardListCardProps}
    />
  );
}

function toDeleteReducer(toDelete, action) {
  switch (action.type) {
    case "delete":
      return toDelete.concat(action.obj);
    case "cancel":
      return toDelete.filter((obj) => obj.uri !== action.obj.uri);
    case "touch":
      return [];
    case "deleteAll":
      return [];
    default:
      break;
  }
}

export default function SectionCardList({
  section,
  setSection,
  PaperProps = {},
  onDelete = (obj, section) => {},
  addDeleteListener = false,
  draggable = false,
  onDragStart = (e, section, sectionObj) => {},
  onDragEnd = (e, section, sectionObj) => {},
  onDragOver = (e, section, sectionObj) => {},
  onDragEnter = (e, section, sectionObj) => {},
  sx,
  ...CardListCardProps
}) {
  const navigate = useNavigate();
  const [toDelete, dispatch] = React.useReducer(toDeleteReducer, []);
  const [deleteAll, setDeleteAll] = React.useState(false);

  const handleTouch = (event, sectionObj) => {
    event.preventDefault();
    dispatch({ type: "touch" });
    navigate("/practice/" + sectionObj.uri);
  };

  useEffect(() => {
    if (deleteAll) {
      const saveDeletion = async (e) => {
        e.preventDefault();
        const deleting = toDelete;
        onDelete(toDelete);
        dispatch({ type: "deleteAll" });
        await Promise.all(
          deleting.map((sectionObj) => {
            if (isCategoriesSection(section))
              return categoryDeletionAction({
                params: { uri: sectionObj.uri },
              });
            else if (isExercisesSection(section)) {
              const { route, uriName } = breakdownURI(sectionObj.uri, "/");
              return exerciseDeletionAction({
                params: { uri: route, uriName },
              });
            }
            return Promise.resolve();
          })
        );
      };
      saveDeletion();
      setDeleteAll(false);
    }
  }, [dispatch, section, toDelete, deleteAll, onDelete]);

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
            onClick={setDeleteAll(true)}
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
                console.log("Attempt to fetch sectionObj", sectionObj);
                fetcher.load("/practice/" + sectionObj.uri + "?index");
              }
            }}>
            <SectionResponsiveCard
              key={`card${idx}`}
              addDeleteListener={addDeleteListener}
              onDelete={(e, sectionObj) =>
                dispatch({ type: "delete", obj: sectionObj })
              }
              onDeleteCancel={(e, sectionObj) =>
                dispatch({ type: "cancel", obj: sectionObj })
              }
              onTouch={handleTouch}
              sectionObj={sectionObj}
              dense
              draggable={draggable}
              onDragStart={(e) => onDragStart(e, section, sectionObj)}
              onDragEnter={(e) => onDragEnter(e, section, sectionObj)}
              onDragEnd={(e) => onDragEnd(e, section, sectionObj)}
              onDragOver={(e) => onDragOver(e, section, sectionObj)}
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
