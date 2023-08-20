import { Typography, Box, Button } from "@mui/material";
import React, { useEffect } from "react";
import { useOutletContext, useLoaderData, Link } from "react-router-dom";
import useAuth from "../../bridge/authUtilities";
import axios from "../../bridge/bridge";
import SectionCardList from "../../components/SectionCardList";

export const rootCategoryLoader = async () => {
    try {
      const res = await axios.request({
        method: "get",
        url: `/api/practice/categories`,
      });
      if (process.env.DEBUG != null)
        console.debug("RootCategoryLoader response data:", res.data);
      return res.data;
    } catch (error) {
      if (process.env.DEBUG != null)
        console.debug("RootCategoryLoader failed with", error.response.data);
      throw error;
    }
  };

export const categoryLoader = async ({ params }) => {
    try {
      const res = await axios.request({
        method: "get",
        url: `/api/practice/category/${params.uri}`,
      });
      if (process.env.DEBUG != null)
        console.debug("CategoryLoader received data", res?.data);
      return res.data;
    } catch (error) {
      if (process.env.DEBUG != null)
        console.debug("CategoryLoader failed with", error.response.data);
      throw error;
    }
  };

export default function CategoryPage() {
  const { categoryDetails, sections, setCategory } = useOutletContext();
  const { loggedIn } = useAuth();
  const loaderData = useLoaderData();

  useEffect(() => {
    console.debug("CategoryPage: Within useEffect loaderData", loaderData);
    setCategory({
      route: loaderData?.route ?? "",
      kind: 0,
      name: loaderData.name ?? "",
      uri: loaderData.uri ?? "",
      uriName: loaderData.uriName ?? "",
      description: loaderData?.description ?? "",
      solved: loaderData.solved ?? false,
      sections: loaderData?.sections ?? [],
    });
  }, [loaderData, setCategory]);

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
          {categoryDetails.name}
        </Typography>
        {loggedIn ? (
          <Button
            component={Link}
            to='/practice/@new'
            state={{ from: categoryDetails.uri }}
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
      <Box>
        <Typography
          paragraph
          gutterBottom
          mb={5}
          ml={5}
          variant='body1'
          align='left'>
          {categoryDetails.description}
        </Typography>
        {sections.map((section) => (
          <Box
            key={section.name}
            mb={5}>
            <SectionCardList
              section={section}
              addDeleteListener={loggedIn}
              sx={{ maxWidth: "70%" }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
