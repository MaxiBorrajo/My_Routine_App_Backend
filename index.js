//Imports

const server = require("./server");

const { db_connection } = require("./src/config/db_connection");

//Methods

/**
 * Starts server in port establish in enviroment variable PORT,
 * and establish a connection with the database before starts listening
 * @throws {Error} - If cannot connects with database throws an error
 */
function start_server() {
  try {
    // Starts server
    server.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
    db_connection();
  } catch (error) {
    throw error;
  }
}

start_server();
