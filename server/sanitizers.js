const debug = require("debug")("server:sanitizers");

const _customValidateSanitization = (validateResultFun) => {
  return (req, res, next) => {
    let errors = validateResultFun(req);
    if (!errors.isEmpty()) {
      debug('validation errors', errors);
      let flattenedErr = {};
      errors.array({ onlyFirstError: true }).forEach((err) => {
        if (err.type == "alternative_grouped") {
          err.nestedErrors.forEach((err) => {
            flattenedErr[err[0].path] = {
              msg: err[0].msg.toLowerCase(),
              location: err[0].location,
            };
          });
        } else {
          flattenedErr[err.path] = {
            msg: err.msg.toLowerCase(),
            location: err.location,
          };
        }
      }),
      (errors = {
          errors: flattenedErr,
          message: "invalid fields",
          status: 400,
        });
      return next(errors);
    }
    return next();
  };
};

exports.customValidateSanitization = _customValidateSanitization;

const { validationResult } = require("express-validator");
exports.validateSanitization = (req, res, next) => {
  return _customValidateSanitization(validationResult)(req, res, next);
};

exports.escapeHTML = require("html-escaper").escape;