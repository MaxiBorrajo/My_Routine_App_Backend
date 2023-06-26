//imports
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();
const morgan = require("morgan");
const cookie_parser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const error_handler_middleware = require("./src/middlewares/error_handler_middleware");
const user_route = require("./src/resources/user/user_route");

//dependencies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cookie_parser());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use("/v1/user", user_route);

//global middlewares
app.use(error_handler_middleware);

//exports
module.exports = app;
