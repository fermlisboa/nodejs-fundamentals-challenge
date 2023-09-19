import { randomUUID } from "node:crypto";

import { Database } from "./database.js";
import { TaskError } from "./errors/TaskErrors.js";
import { buildRoutePath } from "./middlewares/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.query;

      const searchObj =
        title || description
          ? {
              title: title,
              description: description,
            }
          : null;

      const tasks = database.select("tasks", searchObj);

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({
            message:
              "Para criar uma task o titulo e descrição devem ser informados.",
          })
        );
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const taskCreated = database.insert("tasks", task);

      return res.writeHead(201).end(JSON.stringify(taskCreated));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      try {
        database.delete("tasks", id);
      } catch (error) {
        if (error instanceof TaskError) {
          return res
            .writeHead(error.statusCode)
            .end(JSON.stringify({ message: error.message }));
        }
      }

      return res.writeHead(204).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      try {
        database.update("tasks", id, { title, description });
      } catch (error) {
        if (error instanceof TaskError) {
          return res
            .writeHead(error.statusCode)
            .end(JSON.stringify({ message: error.message }));
        }
      }

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      try {
        database.toggleComplete("tasks", id);
      } catch (error) {
        if (error instanceof TaskError) {
          return res
            .writeHead(error.statusCode)
            .end(JSON.stringify({ message: error.message }));
        }
      }

      return res.writeHead(204).end();
    },
  },
];