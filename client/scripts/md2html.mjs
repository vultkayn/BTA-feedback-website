import { read } from "to-vfile";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import fs from "node:fs";
import path from "node:path";

import minimist from "minimist";

var argv = minimist(process.argv.slice(2));

console.log(argv);

async function parse() {
  let p = argv.path;
  const basename = path.basename(p, ".md");
  const output = basename + ".html";

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(await read("public/docs/" + p));


  fs.writeFile("public/docs/" + output, String(file), function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("The file was saved!");
  });
}

parse();
