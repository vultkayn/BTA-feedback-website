const debug = require("debug")("server:practice");

/**
 * Define helpers functions for models related to /api/practice/*
 *
 * Such a parsing parameters, sanitizing them and preparing them
 * for persistent storage.
 */

const nameRegex = /^[a-zA-Z0-9-]+([ _]?[a-zA-Z0-9-]+)*$/;
const routeRegex = /^([a-zA-Z0-9-]+([+_]?[a-zA-Z0-9-]+)*)*$/;
const titleRegex = /[\w ?!^.{}[\]#_,+-]{1,100}/;
exports.nameMaxLength = 40;
exports.nameRegex = nameRegex;
exports.routeRegex = routeRegex;
exports.titleRegex = titleRegex;

/**
 *
 * @param {String} uri The full path as given in the request uri.
 * @param {String} sep Separator used to distinguished the route and the name.
 * @returns The extracted route part of the uri, identical to the unique Schema identifier.
 */
const getRouteOffURI = function (uri, sep = "_") {
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
exports.breakdownURI = function (uri, sep = "_") {
  let route = getRouteOffURI(uri, sep);
  const uriName =
    route?.length === uri.length ? uri : uri.replace(route + sep, "");
  // if (! route.length) route = '/'; // For root category
  return { route: route, uriName: uriName };
};

/**
 *
 * @param {String} uiName The name as given in the User Interface, i.e. without much validation and processing
 * @returns uriName = String: A uri friendly formatted name, as could appear suffixed to a route in a URI
 */
exports.makeURIName = function (uiName) {
  if (!nameRegex.test(uiName) || uiName.length > exports.nameMaxLength) {
    debug("uiName was", uiName);
    throw new Error("Invalid user friendly name cannot be casted to uri");
  }
  return uiName.replaceAll(/[^a-zA-Z0-9 -]/g, "").replaceAll(" ", "+");
};

/**
 *
 * @param {String} uiRoute The route as given in the User Interface, i.e. without much validation and processing.
 *  The route segments are ui names separated by '/'.
 * @returns uiRoute = String: A uri friendly formatted name, as could appear suffixed to a route in a URI
 */
exports.makeURIRoute = function (uiRoute) {
  return uiRoute
    .replaceAll(/[^a-zA-Z0-9 /-]/g, "")
    .replaceAll(" ", "+")
    .replaceAll("/", "_")
    .replace(/^_+/, "")
    .replace(/_+$/, "");
};

/** KEEP IN SYNC WITH CLIENT.
 *
 * @param {String} uri The URL-friendly uri.
 *  Segments are uriNames separated by '_'.
 * @param {Optional(String)} sep Either '_' (Category URI) or '/' (Exercise URI).
 * @returns {
 * uiRoute: A user-friendly formatted route, with '/' separator,
 * name: a user-friendly name, last segment of the uri
 * }
 */
exports.revertURI = function (uri, sep = "_") {
  if (!uri) return "";
  const { route, uriName } = exports.breakdownURI(uri, sep);
  return {
    uiRoute: route.replaceAll("_", "/").replaceAll("+", " "),
    name: uriName.replaceAll("+", " "),
  };
};
