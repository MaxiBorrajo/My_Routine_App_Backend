const pg = require("pg");

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function db_connection() {
  const connection = await pool.connect();
  if (connection._connected) {
    console.log("Database connection successful");
  } else {
    throw Error("An error has ocurred during connection with database");
  }
}

module.exports = {
  db_connection,
  pool,
};
