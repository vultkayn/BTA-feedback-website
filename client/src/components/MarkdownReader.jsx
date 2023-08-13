import React, { useEffect, useState } from "react";
import axios from "axios";

import { Container, Skeleton, Typography, Grid } from "@mui/material";
import DOMPurify from "dompurify";

export default function MarkdownReader({ name }) {
  const [done, setDone] = useState(false);
  const [file, setFile] = useState(null);
  let html = '/pages/' + name + ".html";

  useEffect(() => {
    async function parse() {
      try
      {
        const fil = await axios.get(html);
        const purified = await DOMPurify.sanitize(fil.data);
        setDone(true);
        setFile(purified); // FIXME improve with a steam (see axios responseType="stream")
      }
      catch (err) {
        console.error ("MarkdownReader failed to get", html);
      }
    }
    parse();
    return () => {
      setFile(null);
      setDone(false);
    };
  }, [name]);

  if (done === false)
    return (
      <Grid
        container
        spacing={8}>
        <Grid
          item
          md>
          <Typography
            component='div'
            key='h2'
            variant='h2'>
            <Skeleton />
          </Typography>
        </Grid>
        <Grid
          item
          md>
          <Skeleton
            variant='rectangular'
            width='80%'
            height={250}
          />
        </Grid>
      </Grid>
    );
  if (done === null) throw new Error("Impossible to parse " + html);


    // BUG Trivial XSS, ask how to do otherwise. 
  return (
    <Container sx={{textAlign:"left"}}>
      <div dangerouslySetInnerHTML={{ __html: file }}></div>
    </Container>
  );
}
