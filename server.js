//imports
require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cookie_parser = require("cookie-parser");
const cors = require("cors");
const error_handler_middleware = require("./src/middlewares/error_handler_middleware");


//dependencies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cookie_parser());

//routes

//global middlewares
app.use(error_handler_middleware);

//exports
module.exports = app;
