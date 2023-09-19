import axios from "axios";
import fs from "node:fs/promises";
import { parse } from "csv-parse";

(async () => {
  const contentPath = new URL("../utils/tasks.csv", import.meta.url);
  const content = await fs.readFile(contentPath);

  const parser = parse(content, {
    delimiter: ",",
    from_line: 2,
  });

  const tasks = [];

  for await (const record of parser) {
    await axios
      .post("/tasks", {
        title: record[0],
        description: record[1],
      })
      .then((response) => {
        tasks.push(response.data);
      });
  }

  console.log(tasks);
})();