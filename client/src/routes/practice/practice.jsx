import React, { useEffect } from "react";
import { Outlet, Link as RouterLink } from "react-router-dom";
import "../../components/styles/Sidebar.css";
import Sidebar, {
  CollapsingSidebarSection,
  makeSolvedIcon,
} from "../../components/Sidebar";
import {
  revertURI,
  isExercisesSection,
  isCategoriesSection,
} from "../../common/dataFormatting";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  ListItemButton,
  ListItemIcon,
  Typography,
  Link as MUILink,
} from "@mui/material";
import useAuth from "../../bridge/authUtilities";

function CategorySidebarSection({
  showInsertButton = false,
  section,
  currentURI,
  sx,
}) {
  return (
    <>
      <CollapsingSidebarSection
        content={section.listing}
        title={section.title + (section.listing?.length ? "" : " [none]")}
        makeIcon={makeSolvedIcon}
        makeText={(v, idx) => <Typography>{v.name}</Typography>}
        makeTarget={(v) => v.uri}
        divide
        sx={{ width: "100%", ...sx }}
      />
      {showInsertButton ? (
        <ListItemButton
          component={Link}
          sx={{ justifyContent: "center" }}
          state={{ from: currentURI || "" }}
          to={
            section.name === "subcategories"
              ? "/practice/@new"
              : `/practice/${currentURI}/@new`
          }>
          <ListItemIcon sx={{ minWidth: "min-content" }}>
            {" "}
            <AddIcon htmlColor='blue' />
          </ListItemIcon>
        </ListItemButton>
      ) : null}
    </>
  );
}

export default function PracticeRouteScaffold() {
  const [currentCategory, setCategory] = React.useState({});
  const { loggedIn } = useAuth();

  function getBreadcrumbs() {
    let { uiRoute, name } = revertURI(currentCategory.uri, "_");
    let crumbs = uiRoute ? uiRoute.split("/") : [];
    name && crumbs.push(name);
    return crumbs;
  }
  function shallowDetails(category) {
    let shallow = { ...category };
    delete shallow.sections;
    return shallow;
  }
  let sections = currentCategory?.sections ?? [];
  const breadcrumbs = getBreadcrumbs(currentCategory);
  const isIndex = breadcrumbs.length === 0;

  useEffect(() => {}, [currentCategory]);

  // No sections at all
  if (sections.length === 0)
    sections = [{ title: "Subcategories", name: "subcategories", listing: [] }];
  /* Only one section.  */
  if (sections.length === 1)
    if (isExercisesSection(sections[0]))
      sections.push({
        title: "Subcategories",
        name: "subcategories",
        listing: [],
      });
    else if (!isIndex && isCategoriesSection(sections[0]))
      sections.push({ title: "Exercises", name: "exercises", listing: [] });

  if (process.env.DEBUG != null) console.log("Category sections are", sections);

  return (
    <>
      <Box
        display='flex'
        flexDirection='row'
        gap='20px'
        paddingLeft='10vw'
        maxHeight='90vh'
        sx={{ overflowY: "auto" }}>
        <Sidebar
          elevation={6}
          width='15vw'
          fontSize='15px'>
          {sections.map((section, idx) => {
            return (
              <CategorySidebarSection
                showInsertButton={loggedIn}
                section={section}
                currentURI={currentCategory.uri}
                key={`collapsing:${section.name}`}
                sx={{ width: "100%" }}
              />
            );
          })}
        </Sidebar>
        <Box width='100%'>
          <Breadcrumbs
            maxItems={3}
            sx={{
              marginBottom: "50px",
            }}
            aria-label='breadcrumb'>
            <MUILink
              underline='hover'
              color='inherit'
              component={RouterLink}
              to='/practice?index'>
              Index
            </MUILink>
            {(() => {
              let uri = "/practice/";
              const uriSegments = currentCategory.uri?.split("_") ?? [""];
              return !breadcrumbs.length
                ? null
                : breadcrumbs.map((crumb, idx) => {
                    uri += (idx ? "/" : "") + uriSegments[idx];
                    if (idx < breadcrumbs.length - 1) {
                      return (
                        <MUILink
                          key={`crumb-${crumb}-${idx}`}
                          underline='hover'
                          color='inherit'
                          component={RouterLink}
                          to={`${uri}`}>
                          {crumb}
                        </MUILink>
                      );
                    } else {
                      return (
                        <Typography
                          key={`last-crumb`}
                          color='text.primary'>
                          {crumb}
                        </Typography>
                      );
                    }
                  });
            })()}
          </Breadcrumbs>
          <Outlet
            context={{
              categoryDetails: shallowDetails(currentCategory),
              sections,
              setCategory,
            }}
          />
        </Box>
      </Box>
    </>
  );
}

export { default as ExercisePage } from "./exercise";
export { default as CategoryPage } from "./category";
export {
  default as CategoryCreationPage,
  action as categoryCreationAction,
  categoryDeletionAction,
} from "./createCategory";
export {
  default as ExerciseCreationPage,
  action as exerciseCreationAction,
} from "./ExerciseCreationPage";
export { default as ExerciseUpdatePage } from "./ExerciseUpdatePage";
