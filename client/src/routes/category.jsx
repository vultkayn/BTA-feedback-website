import { Typography, Box, Button } from "@mui/material";
import React, { useEffect } from "react";
import { useOutletContext, useLoaderData, Link } from "react-router-dom";
import useAuth from "../bridge/AuthProvider";

export function RootCategoryLoader({ apiClient }) {
  return async () => {
    const res = await apiClient.request({
      method: "get",
      url: `/api/practice/categories`,
    });
    console.debug("RootCategoryLoader response:", res);
    return res.data;
  };
}

export function CategoryLoader({ apiClient }) {
  return async ({ params }) => {
    const uri = params.uri;
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

  const { identity, isLogged } = useAuth();
  const loggedIn = isLogged(identity);

  const details = useLoaderData();
  const route = details?.route ?? "";

  console.debug("Category details are", details);

  useEffect(() => {
    console.debug("CategoryPage: Within useEffect", details);
    setSections(details?.sections ?? []);
    setBreadcrumbs(details.uri ? details.uri.split("-") : []);
    setCurrent({
      route: route,
      kind: 0,
      name: details.name ?? "",
      uri: details.uri ?? "",
      uriName: details.uriName ?? "",
      description: details?.description ?? "",
      solved: details.solved ?? false,
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
        {loggedIn ? (
          <Button
            component={Link}
            to='/practice/@new'
            state={{from: details.uri}}
            sx={{
              flexBasis: "fit-content",
              marginRight: "5vw",
              height: "min-content",
            }}
            variant='contained'>
            <Typography variant='button'>New Category</Typography>
          </Button>
        ) : null}
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
