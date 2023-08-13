import React, { useEffect } from "react";
import { useLoaderData, Outlet, Link as RouterLink } from "react-router-dom";
import "../components/styles/Sidebar.css";
import Sidebar, { SidebarListing, makeSolvedIcon } from "../components/Sidebar";

import { Box, Breadcrumbs, Typography, Link as MUILink } from "@mui/material";

/**
 * @brief Upon creation of an exercise or category,
 * use the user-friendly formatted route and name to produce a database friendly
 * route and name.
 *
 * @param {string} route route at the format cat1/cat2/.../
 * @param {int} kind 0 for a category, 1 for an exercise
 */
export function prepareRouteForServer({ route, name, kind }) {
  const formatRoute = (route) => {
    const routeBeg = route && route.length > 0 && route[0] === "/" ? 1 : 0;
    const routeEnd = // remove ending separator if any.
      route && route.length > 1 && route.endsWith("/")
        ? route.length - 1
        : route.length;
    return route
      .slice(routeBeg, routeEnd)
      .replaceAll(/[^a-zA-Z0-9-+_/]/g, "")
      .replaceAll("-", "_")
      .replaceAll("/", "-");
  };

  const makeURIName = (filteredName) => {
    return filteredName
      .replaceAll(/[^a-zA-Z0-9-+_ ]/g, "")
      .replaceAll("-", "_")
      .replaceAll(" ", "_");
  };

  const pureName = name.toLowerCase().replaceAll(/[^\w ._,+-]/g, "");
  const pureNameURI = makeURIName(pureName);
  const route = formatRoute(route.toLowerCase());

  let sep = null;
  if (kind === 0) sep = route.length === 0 /* root? */ ? "" : "-";
  else if (kind === 1) sep = route.length === 0 /* root? */ ? null : "/"; // no exercises allowed for root, so cannot have empty here
  if (sep === null) sep = ""; //throw new Error(""); // TODO improve the error type

  return { target: route + sep + pureNameURI, route: route, uiName: pureName };
}

function isExercisesSection (section)
{
  return section && section.title === "Exercises";
}

function isCategoriesSection (section)
{
  return section && section.title === "Subcategories";
}

export default function CategoriesListingPage() {
  const [breadcrumbs, setBreadcrumbs] = React.useState("");
  const [sections, setSections] = React.useState([]);
  const [current, setCurrent] = React.useState({});
  const isIndex = breadcrumbs.length === 0;
  /*     {
      title: "Subcategories",
      listing: [
        { uri: "pointers", name: "pointers", solved: false, kind: 0 }, // FIXME uri should include name too, fix above in the functions too
        { uri: "memory", name: "memory", solved: false, kind: 0 },
        { uri: "oop", name: "oop", solved: false, kind: 0 },
        {
          uri: "garbage_collector",
          name: "garbage collector",
          solved: false,
          kind: 0,
        },
        { uri: "c", name: "c", solved: false, kind: 0 },
        { uri: "c++", name: "c++", solved: false, kind: 0 },
        { uri: "types", name: "types", solved: true, kind: 0 },
      ],
    },
  ]); */

  console.log("Category sections are", sections);
  if (sections.length === 0)
    setSections([{ title: "Subcategories", listing: [] }]);
  if (!isIndex && sections.length === 1 && ! isExercisesSection (sections[0]))
    setSections([sections[0], { title: "Exercises", listing: [] }]);
  if (sections.length === 1 && ! isCategoriesSection (sections[0]))
    setSections([sections[0], { title: "Subcategories", listing: [] }]);

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
              <SidebarListing
                key={`${section.title}:${idx}`}
                content={section.listing}
                title={section.title}
                makeIcon={makeSolvedIcon}
                makeTarget={(v) => v.uri}
                inset
                canAdd={!isIndex}
                addTarget={section.title === "Subcategories" ? "/practice/@new" : `/practice/${current.uri}/@new`}
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
                setBreadcrumbs("");
              }}
              to='/practice'>
              Index
            </MUILink>
            {(() => {
              let uri = "/practice/";
              const crumbs = breadcrumbs.split("-");
              return crumbs.length == 0 ||
                (crumbs.length == 1 && crumbs[0] === "")
                ? null
                : crumbs.map((crumb, idx) => {
                    let crumbHint = crumb.replace("_", " ");
                    crumbHint = crumbHint[0].toUpperCase() + crumbHint.slice(1);
                    uri += (idx !== 0 ? "-" : "") + crumb;
                    if (idx < crumbs.length - 1) {
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
