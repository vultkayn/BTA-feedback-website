import React, { useEffect } from "react";
import { useLoaderData, Outlet, Link as RouterLink } from "react-router-dom";
import "../components/styles/Sidebar.css";
import Sidebar, {
  CollapsingSidebarSection,
  makeSolvedIcon,
} from "../components/Sidebar";

import { Box, Breadcrumbs, Typography, Link as MUILink } from "@mui/material";
import useAuth from "../bridge/AuthProvider";

function isExercisesSection(section) {
  return section?.name?.toLowerCase() === "exercises";
}

function isCategoriesSection(section) {
  return section?.name?.toLowerCase() === "subcategories";
}

export default function PracticeRouteScaffold() {
  const [breadcrumbs, setBreadcrumbs] = React.useState([]);
  const [sections, setSections] = React.useState([]);
  const [current, setCurrent] = React.useState({});
  const { identity, isLogged } = useAuth();
  const loggedIn = isLogged(identity);
  const isIndex = breadcrumbs.length === 0;

  // No sections at all
  if (sections.length === 0)
    setSections([
      { title: "Subcategories", name: "subcategories", listing: [] },
    ]);
  /* Only one section.  */
  if (sections.length === 1)
    if (isExercisesSection(sections[0]))
      setSections([
        sections[0],
        { title: "Subcategories", name: "subcategories", listing: [] },
      ]);
    else if (!isIndex && isCategoriesSection(sections[0]))
      setSections([
        sections[0],
        { title: "Exercises", name: "exercises", listing: [] },
      ]);
  if (process.env.DEBUG != null)
    console.log("Category sections are", sections);

  return (
    <>
      <Box
        display='flex'
        flexDirection='row'
        gap='20px'
        paddingLeft='10vw'>
        <Sidebar
          width='15vw'
          maxHeight='90vh'
          fontSize='15px'>
          {sections.map((section, idx) => {
            return (
              <CollapsingSidebarSection
                key={`${section.name}:${idx}`}
                content={section.listing}
                title={
                  section.title + (section.listing?.length ? "" : " [none]")
                }
                makeIcon={makeSolvedIcon}
                makeTarget={(v) => v.uri}
                inset
                canAdd={!isIndex && loggedIn}
                addTarget={
                  section.name === "subcategories"
                    ? "/practice/@new"
                    : `/practice/${current.uri}/@new`
                }
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
              onClick={(e) => {
                setBreadcrumbs([]);
              }}
              to='/practice'>
              Index
            </MUILink>
            {(() => {
              let uri = "/practice/";
              return breadcrumbs.length == 0
                ? null
                : breadcrumbs.map((crumb, idx) => {
                    let crumbHint = crumb.replaceAll("+", " ").toLowerCase();
                    uri += (idx !== 0 ? "-" : "") + crumb;
                    if (idx < breadcrumbs.length - 1) {
                      return (
                        <MUILink
                          key={`crumb-${crumb}-${idx}`}
                          underline='hover'
                          color='inherit'
                          component={RouterLink}
                          to={`${uri}`}>
                          {crumbHint}
                        </MUILink>
                      );
                    } else {
                      return (
                        <Typography
                          key={`last-crumb`}
                          color='text.primary'>
                          {crumbHint}
                        </Typography>
                      );
                    }
                  });
            })()}
          </Breadcrumbs>
          <Outlet context={[setBreadcrumbs, setSections, setCurrent]} />
        </Box>
      </Box>
    </>
  );
}

export { default as ExercisePage } from "./exercise";
export { default as CategoryPage } from "./category";
