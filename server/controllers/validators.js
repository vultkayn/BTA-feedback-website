const { param } = require("express-validator");

const {
  routeRegex,
  makeURIName,
} = require("../models/helpers/practice");

const practice = {
  URIParamValidator: param("uri")
    .escape()
    .notEmpty()
    .custom((value) => routeRegex.test(value)),

  nameParamValidator: param("uriName")
    .escape()
    .notEmpty()
    .custom((value) => routeRegex.test(value)),

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

  questionChoicesCustomValidator: (choices, { req }) => {
    if (
      !Array.isArray(choices.arr) /* ||
        req.body.expectedAnswers?.length !== choices?.arr?.length */
    )
      throw new Error(
        "choices should be in similar number than the expected number"
      );
    if (!["Checkbox", "Radio"].includes(choices?.type))
      // FIXME XSS escape this type.
      throw new Error(`a choice has an invalid type of ${type}`);
    for (const cho of choices.arr) {
      const { name, label } = cho;
      name ??= "";
      label ??= "";
      // FIXME XSS -> escape name and label
      if (typeof name !== "string" || name.length <= 0 || name.length > 15)
        throw new Error(`invalid choice name`);
      if (typeof label !== "string" || label.length <= 0 || label.length > 15)
        throw new Error(`invalid choice label`);
    }
    return true;
  },

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
};

module.exports = { practice: practice };
