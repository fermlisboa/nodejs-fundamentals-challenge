import fs from "node:fs/promises";
import { TaskError } from "./errors/TaskErrors.js";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => (this.#database = JSON.parse(data)))
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search) {
      data = data.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].includes(value);
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    } else {
      throw new TaskError("Não existe Task com o ID informado.");
    }
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      const oldItem = this.#database[table][rowIndex];
      const itemUpdated = {
        ...oldItem,
        title: data.title ? data.title : oldItem.title,
        description: data.description ? data.description : oldItem.description,
      };

      this.#database[table].splice(rowIndex, 1);
      this.#database[table].push(itemUpdated);
      this.#persist();
    } else {
      throw new TaskError("Não existe Task com o ID informado.");
    }
  }

  toggleComplete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table][rowIndex].completed_at = this.#database[table][
        rowIndex
      ].completed_at
        ? null
        : new Date().toISOString();
      this.#database[table][rowIndex].updated_at = new Date().toISOString();
      this.#persist();
    } else {
      throw new TaskError("Não existe Task com o ID informado.");
    }
  }
}