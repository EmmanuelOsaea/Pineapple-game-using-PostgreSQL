import pg from "pg";
import { dbConfig } from "./config.js";

export const pool = new pg.Pool(dbConfig);

pool.on("error", (err) => {
  console.error("Unexpected PG client error", err);
});
