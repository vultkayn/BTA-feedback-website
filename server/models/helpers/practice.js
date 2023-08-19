const debug = require("debug")("server:practice");

/**
 * Define helpers functions for models related to /api/practice/*
 *
 * Such a parsing parameters, sanitizing them and preparing them
 * for persistent storage.
 */

const nameRegex = /^[a-zA-Z0-9 _+-]{1,30}$/;
const routeRegex = /^([a-zA-Z0-9_+]+-?[a-zA-Z0-9_+]+)*$/;
const titleRegex = /[\w ?!^.{}[\]#_,+-]{1,60}/;
exports.nameMaxLength = 30;
exports.nameRegex = nameRegex;
exports.routeRegex = routeRegex;
exports.titleRegex = titleRegex;

/**
 *
 * @param {String} uri The full path as given in the request uri.
 * @param {String} sep Separator used to distinguished the route and the name.
 * @returns The extracted route part of the uri, identical to the unique Schema identifier.
 */
const getRouteOffURI = function (uri, sep = "-") {
  if (!uri) return uri;
  const lastSepPos = uri.lastIndexOf(sep);
  if (lastSepPos === -1) return "";
  return uri.slice(0, lastSepPos);
};

/**
 *
 * @param {String} uri The full path as given in the request uri.
 * @param {String} sep Separator used to distinguished the route and the name.
 * @returns {route, uriName} The route as the unique identifier in the Schema, and the name part of the uri.
 */
exports.breakdownURI = function (uri, sep = "-") {
  const route = getRouteOffURI(uri, sep);
  const uriName =
    route?.length === uri.length ? uri : uri.replace(route + sep, "");
  return { route: route, uriName: uriName };
};

/**
 *
 * @param {String} uiName The name as given in the User Interface, i.e. without much validation and processing
 * @returns uriName = String: A uri friendly formatted name, as could appear suffixed to a route in a URI
 */
exports.makeURIName = function (uiName) {
  const makeURIName = (filteredName) => {
    return filteredName
      .replaceAll(/[^a-zA-Z0-9-+_ ]/g, "")
      .replaceAll("-", "")
      .replaceAll("+", "")
      .replaceAll(" ", "+");
  };
  if (!nameRegex.test(uiName))
  {
    debug("uiName was", uiName);
    throw new Error("Invalid user friendly name cannot be casted to uri");
  }
  return makeURIName(uiName);
};
