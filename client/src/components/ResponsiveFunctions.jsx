import React, { useEffect } from "react";
import { useFetcher } from "react-router-dom";

export default function ResponsiveFunction(
  { children, fetchFunction = (fetcher) => {}, ...componentProps },
  ref
) {
  const fetcher = useFetcher();
  useEffect(() => {
    fetchFunction(fetcher);
  }, [fetcher, fetchFunction]);
  return React.cloneElement(children, { fetcherData: fetcher.data });
}


