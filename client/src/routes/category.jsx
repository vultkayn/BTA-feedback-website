import { Typography, Box, Button } from "@mui/material";
import React, { useEffect } from "react";
import { useOutletContext, useLoaderData, Link } from "react-router-dom";

export function CategoryIndexLoader({apiClient}) {
  return async () => {
    const res = await apiClient.request({
      method: "get",
      url: `/api/practice/categories`,
    });
    console.debug("CategoryIndexLoader response:", res);
    return res.data;
  };
}

export function CategoryLoader({apiClient}) {
  return async ({ params }) => {
    const uri = params.uri;
    console.debug ("CategoryLoader uri is", uri);
    if (!uri || uri.length == 0) {
      // FIXME might drop that, should work both case
      const res = await apiClient.request({
        method: "get",
        url: `/api/practice/categories`,
      }).data;
      return res;
    }
    const res = await apiClient.request({
      method: "get",
      url: `/api/practice/category/${uri}`,
    });
    return res?.data ?? null;
  };
}

export default function CategoryPage() {
  const [setBreadcrumbs, setSections, setCurrent] = useOutletContext();
  // const uiPath = useLocation().pathname.replace("/practice/", "");

  const details = useLoaderData ();
  const route = details?.route ?? "";

  console.debug ("Category details are", details);

  /*   const sectionsDummy = [
    {
      title: "Exercises",
      listing: [
        {
          uri: "memory-pointers/exo1",
          name: "Exercise 1",
          solved: false,
          kind: 1,
        },
        {
          uri: "memory-pointers/exercise-2",
          name: "Exercise 2",
          solved: true,
          kind: 1,
        },
        { uri: "pointers/exo3", name: "exo3", solved: false, kind: 1 },
        { uri: "memory/exo4", name: "exo4", solved: true, kind: 1 },
        { uri: "c++/exo12", name: "exo12", solved: false, kind: 1 },
        { uri: "memory/exercise5", name: "exercise5", solved: false, kind: 1 },
        { uri: "memory/exo5", name: "exo5", solved: false, kind: 1 },
        {
          uri: "garbage_collector/exo46",
          name: "exo46",
          solved: false,
          kind: 1,
        },
        { uri: "oop/exo6", name: "exo6", solved: false, kind: 1 },
      ],
    },
    {
      title: "Subcategories",
      listing: [
        { uri: "pointers", name: "pointers", solved: false, kind: 0 }, // FIXME uri should include name too, fix above in the functions too
        { uri: "memory", name: "memory", solved: false, kind: 0 },
        { uri: "oop", name: "oop", solved: true, kind: 0 },
        {
          uri: "garbage_collector",
          name: "garbage collector",
          solved: false,
          kind: 0,
        },
        { uri: "c", name: "c", solved: false, kind: 0 },
        { uri: "c++", name: "c++", solved: false, kind: 0 },
        { uri: "c++-types", name: "types", solved: true, kind: 0 },
        { uri: "pointers", name: "pointers", solved: false, kind: 0 },
        { uri: "memory", name: "memory", solved: false, kind: 0 },
        { uri: "oop", name: "oop", solved: false, kind: 0 },
        {
          uri: "garbage_collector",
          name: "garbage collector",
          solved: false,
          kind: 0,
        },
        { uri: "c2", name: "c", solved: false, kind: 0 },
        { uri: "c++2", name: "c++", solved: false, kind: 0 },
        { uri: "types2", name: "types", solved: false, kind: 0 },
      ],
    },
  ]; */

  useEffect(() => {
    console.debug ("CategoryPage: Within useEffect", details);
    setSections(details?.sections ?? []);
    setBreadcrumbs(uri.endsWith("/") ? uri.slice(0, -1) : uri);
    setCurrent({
      route: route,
      kind: 0, // FIXME
      name: details?.name ?? "",
      description: details?.description ?? "",
    });

  }, [details]);

  if (details === null) return null;

  return (
    <Box>
      <Box
        flexDirection='row'
        display='flex'
        justifyContent='space-between'>
        <Typography
          gutterBottom
          mb={10}
          align='left'
          variant='h3'>
          {details.name}
        </Typography>
        <Button
          component={Link}
          to='/practice/@new'
          sx={{
            flexBasis: "fit-content",
            marginRight: "5vw",
            height: "min-content",
          }}
          variant='contained'>
          <Typography variant='button'>New Category</Typography>
        </Button>
      </Box>
      <Box ml={5}>
        <Typography
          paragraph
          gutterBottom
          variant='body1'
          align='left'>
          {details.description}
        </Typography>
      </Box>
    </Box>
  );
}
