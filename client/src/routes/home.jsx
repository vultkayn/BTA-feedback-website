import React from "react";

import './styles/home.css';

import MarkdownReader from "../components/MarkdownReader";

export default function Home () {
  const [docPage, setDocPage] = React.useState("home");
  console.debug ("Rendering Home");
  return (
    <div className="App">
      <MarkdownReader name={docPage} />
    </div>
  );
}