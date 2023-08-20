
/** KEEP IN SYNC WITH SERVER. */

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
 * @param {String} uri The full path as given in the request uri.
 * @param {String} sep Separator used to distinguished the route and the name.
 * @returns {route, uriName} The route as the unique identifier in the Schema, and the name part of the uri.
 */
export const breakdownURI = function (uri, sep = "_") {
  let route = getRouteOffURI(uri, sep);
  const uriName =
    route?.length === uri.length ? uri : uri.replace(route + sep, "");
  // if (! route.length) route = '/'; // For root category
  return { route: route, uriName: uriName };
};


/*
 * @param {String} uri The URL-friendly uri.
 *  Segments are uriNames separated by '_'.
 * @param {Optional(String)} sep Either '_' (Category URI) or '/' (Exercise URI).
 * @returns {
* uiRoute: A user-friendly formatted route, with '/' separator,
* name: a user-friendly name, last segment of the uri
* }
*/
export const revertURI = function (uri, sep = "_") {
 if (!uri) return {uiRoute: "", name: ""};
 const { route, uriName } = breakdownURI(uri, sep);
 return {
   uiRoute: route.replaceAll("_", "/").replaceAll("+", " "),
   name: uriName.replaceAll("+", " "),
 };
};


export function isExercisesSection(section) {
  return section?.name?.toLowerCase() === "exercises";
}

export function isCategoriesSection(section) {
  return section?.name?.toLowerCase() === "subcategories";
}
