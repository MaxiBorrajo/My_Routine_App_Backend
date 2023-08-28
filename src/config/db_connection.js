//Imports

const pg = require("pg");
const CustomError = require("../utils/custom_error");

//Variables

//With this you can perform operations on the database
const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});

//Methods

/**
 * Establish connection with database
 * @throws {Error} - If it cannot connect with database throws an error.
 */
async function db_connection() {
  try {
    const connection = await pool.connect();
    if (connection._connected) {
      console.log("Database connection successful");
    }
  } catch (error) {
    throw new CustomError(
      `An error has ocurred during connection with database: ${error.message}`,
      500
    );
  }
}

//Exports

module.exports = {
  db_connection,
  pool,
};
