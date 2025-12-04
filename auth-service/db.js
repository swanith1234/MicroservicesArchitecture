import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  host: "postgres",
  port: 5432,
  user: "postgres",
  password: "postgrespass",
  database: "postgres"
});
