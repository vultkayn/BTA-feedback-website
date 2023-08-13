require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("./passport/setup");
var apiRouter = require("./routes/api");
const debug = require("debug")("server:app");
const cors = require("cors");

const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  optionsSuccessStatus: 200,
  credentials: true,
  exposedHeaders: ["set-cookie"],
};

var app = express();

// connect database
const { MongoStore } = require("./db/connection");

// Request formatting and parser middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Session and authentification middlewares
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: process.env.NODE_ENV === 'test',
    cookie: { /* secure: true, */ httpOnly: true, maxAge: 60 * 60 * 1000, sameSite:"none" }, // FIXME XSS
    store: MongoStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Set up routes static, to api endpoint, to the client
app.use(express.static(path.resolve(__dirname, "../client/build")));
app.use("/api", cors(corsOptions), apiRouter);
// send to React client
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

// Error handlers middlewares
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  debug("Request default handled, forward to 404.");
  debug(req);
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  debug("Default handle of", err);
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
