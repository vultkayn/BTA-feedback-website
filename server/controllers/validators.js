const { body } = require("express-validator");
const {
  routeRegex,
  nameRegex,
  titleRegex,
  makeURIName,
  nameMaxLength,
} = require("../models/helpers/practice");
const { escapeHTML } = require("../sanitizers");

const debug = require("debug")("server:validators");

const questionChoicesCustomValidator = (choices) => {
  if (choices == null || typeof choices !== "object")
    throw new Error("invalid choices");
  if (!["checkbox", "radio"].includes(choices.format))
    if (!Array.isArray(choices.list))
      throw new Error("choices.list is not an array");
  for (let c of choices.list) {
    c.name = c.name?.trim();
    c.name = escapeHTML(c.name);
    if (!c.name || c.name?.length > 15) throw new Error("invalid choice name");
    c.label = c.label?.trim();
    c.label = escapeHTML(c.label);
    if (!c.label || c.label?.length > 15)
      throw new Error("invalid choice label");
    if (typeof c.answer !== "boolean")
      throw new Error("choice answer must be a boolean");
  }
  return true;
};

const questionCustomValidator = (question) => {
  debug("questionCustomValidator received", question);
  if (question == null || typeof question !== "object")
    throw new Error("invalid question");
  question.title = question.title?.trim();
  question.title = escapeHTML(question.title);
  if (!titleRegex.test(question.title)) throw new Error("invalid title");
  question.statement = question.statement?.trim();
  question.statement = escapeHTML(question.statement);
  if (!question.statement) throw new Error("invalid statement");
  question.explanation = question.explanation?.trim();
  question.explanation = escapeHTML(question.explanation);
  if (!question.explanation) throw new Error("invalid explanation");

  return questionChoicesCustomValidator(question.choices);
};

const practice = {
  /**
   * Middleware to validate that the given User Interface name, once formatted, matches the "name" component of the uri.
   * @param {String} sep Separator used to distinguished the route and the name.
   * @returns True if the given User Interface name "uiName", once formatted, matches the "name" component of the uri.
   */
  nameMatchesURI_p: (getURIName = (req) => {}) => {
    (uiName, { req }) => {
      const uriName = getURIName(req);
      if (uriName !== makeURIName(uiName))
        throw new Error("ill-formed name does not match category uri");
      return true;
    };
  },
  questionsValidator: body("questions")
    .isArray()
    .custom((questions) => {
      for (let q of questions) {
        questionCustomValidator(q);
      }
      return true;
    }),

  questionCustomValidator: questionCustomValidator,
  questionChoicesCustomValidator: questionChoicesCustomValidator,

  questionAnswersCustomValidator: (arr, { req }) => {
    // if (req.body.choices?.arr?.length !== arr.length)
    //   throw new Error(
    //     "expected answers should be in similar number than the choices"
    //   );
    for (const ans of arr) {
      const { name, value } = ans;
      name ??= "";
      value ??= "";
      // FIXME XSS -> escape name and label
      if (typeof name !== "string" || name.length <= 0 || name.length > 15)
        throw new Error(`invalid answer name`);
      if (typeof value !== "string")
        throw new Error(`answer value must be a string`);
    }
    return true;
  },

  nameValidationChain: (location) =>
    location
      .escape()
      .trim()
      .customSanitizer((v) => v.replace(/ {2,}/g, " "))
      .notEmpty()
      .withMessage("name too short")
      .bail()
      .isLength({ max: nameMaxLength })
      .withMessage("name too long")
      .bail()
      .custom((v) => {
        if (!nameRegex.test(v)) throw new Error("invalid characters");
        return true;
      }),

  routeValidationChain: (location) =>
    location
      .isString()
      .escape()
      .trim()
      .custom((v) => {
        console.log("route validation of", v);
        if (!routeRegex.test(v)) throw new Error("invalid characters");
        return true;
      }),
};

module.exports = { practice: practice, escapeHTML: escapeHTML };
