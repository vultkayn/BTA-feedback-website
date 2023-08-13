const { body, oneOf } = require('express-validator');

const debug = require("debug")("server:auth");

const passport = require("passport");
const { validateSanitization } = require('../sanitizers');
const User = require('../models/userModel');


function handleAccessFailure (err, req, res, next)
{
  if (err && err.status == 401) {
    return res.status(401).send('/account/login');
  }
  else next(err.errors || err);
}

exports.handleAccessFailure = handleAccessFailure;

exports.checkAuth = ({ onFailure = handleAccessFailure, onSuccess } = {}) =>
  function (req, res, next)
  {
    if (typeof (onFailure) !== "function") onFailure = handleAccessFailure;
    if (typeof (onSuccess) !== "function") onSuccess = (req, res, next) => next();
    debug('in checkAuth\n: req.user is',
      req.user,
      '\nsession is',
      req.session,
      '\nHeaders are:',
      req.headers);
    if (!req.user) return debug("user was not logged") || onFailure({ status: 401, message: "not logged in" }, req, res, next);
    if (req.body.univID && req.body.univID !== req.user.univID
      || req.body.id && req.body.id !== req.user.id) {
        debug("user was logged but identifiers didnt match");
        return onFailure({ status: 401, message: "not logged in" }, req, res, next);
      }
    return onSuccess(req, res, next);
  };

exports.checkAuthAs = (
  { univID,
    id,
    onFailure = handleAccessFailure,
    onSuccess = (req, res, next) => { }
  } = { univID: null, id: null }) =>
  function (req, res, next)
  {
    if (typeof (onFailure) !== "function") onFailure = handleAccessFailure;
    if (typeof (onSuccess) !== "function") onSuccess = (req, res, next) => next();
    if (!req.user || univID === undefined || id === undefined) return onFailure({ status: 401, message: "not logged in" }, req, res, next);
    if (req.user.univID === univID) return onSuccess(req, res, next);
    if (req.user.id === id) return onSuccess(req, res, next);
    return onFailure({ status: 401, message: "not logged in" }, req, res, next);
  }


const passportCall = (name) => (err, req, res, next) =>
{
  debug("In passport call wrapper, [err,next]:", err, next);

  return passport.authenticate(name, function (err, user, info)
  {
    debug("In authenticate", name);
    let errors;
    if (err) errors = err;
    else if (!user) errors = { status: info.status, errors: info.errors || info };

    if (errors) {
      debug("authenticate: errors", errors);
      return next(errors);
    }
    else {
      return req.logIn(user, function (err)
      {
        debug("in logIn");
        if (err) {
          debug("in logIn error");
          return next({ status: err.status, errors: err });
        }
        else {
          return res.status(200).json({ univID: req.user.univID });
        }
      });
    }
  })(req, res, next);
};

exports.connexion = [
  oneOf([body('univID').escape().notEmpty(), body('email').escape().isEmail()]),
  body('password').notEmpty(),
  validateSanitization,
  (req, res, next) =>
  {
    if (req.body.univID === undefined)
      req.body.univID = "noneProvided";
    next();
  },
  this.checkAuth({
    onFailure: passportCall('login'),
    onSuccess: (req, res, next) => { debug("already logged in as", req.user); res.status(200).json({ univID: req.user.univID }); }
  }),
];

exports.signup = [
  body('univID').escape().notEmpty(),
  body('promo').escape().isInt({ max: 2100, min: 1990 }),
  body('lastName').escape().notEmpty(),
  body('firstName').escape().notEmpty(),
  body('email').escape().isEmail(),
  body('password')
    .isStrongPassword({ minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),

  validateSanitization,

  // doesnt handle errors, but do send response if successful after signup.
  this.checkAuth({
    onFailure: passportCall('signup'),
    onSuccess: (req, res, next) => { debug("already logged in as", req.user); res.status(200).json({ univID: req.user.univID }); }
  })
];

// done is a callback that should be provided, function(err: Any, hasAccess: boolean, info?: Any)
// required is a bit field of required access rights.
exports.hasAccessRights = (required, user, done) =>
{
  if (!user)
    return done(null, false, { message: "user not logged in" });
  User.findById(user.id)
    .then(user =>
    {
      if (!user || !user.auth)
        return done(null, false, { message: "user not found" });
      if (user.auth & required !== required)
        return done(null, false, { message: "unsufficient permission" })
      return done(null, true)
    })
    .catch((err) => done(err, false))
}

exports.ACCESS = Object.freeze({
  R: 1,
  W: 2,
  X: 4
});