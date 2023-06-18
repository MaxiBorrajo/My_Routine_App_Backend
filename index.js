//imports
const server = require("./server");

//methods

/**
 * Starts server in port establish in enviroment variable PORT,
 * and establish a connection with the database before starts listening.
 * @throws {Error} - If cannot connects with database throws an error.
 */
function start_server() {
  // Starts server
  server.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
}

start_server();