const { Category } = require("../models/categoryModel");
const {
  breakdownURI,
  makeURIName,
  makeURIRoute,
} = require("../models/helpers/practice");
const { nameValidationChain, routeValidationChain } =
  require("./validators").practice;
const { Exercise } = require("../models/exerciseModel");
const { checkAuth } = require("../passport/authenticate");
const { validateSanitization } = require("../sanitizers");
const { body } = require("express-validator");

const debug = require("debug")("server:practice");

/**
 *
 * @param {Object}
 *  (Category)  .category Category into which we are looking into for the section.
 *  (String)    .parentURI URI of the category we are looking into for the section.
 *  (String)    .sectionName Name of the section we are seeking the documents.
 * @returns (Array) array of documents within the section.
 */
async function findSectionDocs(
  { category, parentURI, sectionName },
  { lean = false }
) {
  const subRoute = category?.uri ?? parentURI;
  let section = [];
  switch (sectionName) {
    case "subcategories":
      section = lean
        ? await Category.find({ route: subRoute }).lean({ virtuals: true, getters: true })
        : await Category.find({ route: subRoute }).exec();
      break;
    case "exercises":
      if (category === undefined || category === null)
        throw new Error(
          "'exercises' can only be found with a defined category"
        );
      section = lean
        ? await Exercise.find({ category: category._id }).lean({
            virtuals: true, getters: true
          }).populate("category")
        : await Exercise.find({ category: category._id }).exec();
      break;
    default:
      throw new Error(
        `such sectionName ${sectionName} has not been implemented yet`
      );
  }
  return section;
}
async function getAndPrepareSection({ title, parentURI, name, category }) {
  const sectionDocuments = await findSectionDocs(
    {
      category,
      parentURI,
      sectionName: name,
      name,
    },
    { lean: true }
  );
  const listing = sectionDocuments
    ? sectionDocuments.map((sub) => {
        let doc = {
          uri: sub.uri,
          uriName: sub.uriName,
          name: sub.name,
          kind: sub.kind,
          solved: sub.solved,
        };
        if (name === "subcategories") doc.route = sub.route;
        else if (name === "exercises") doc.route = sub.uri.split("/")[0];
        return doc;
      })
    : [];

  return { title, name, listing };
}

/** Retrieve a Category's subcategories *details*.
 *  Endpoint of /:uri/subcategories
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category to insert the exercise into.
 *   :full Optional | If set, then
 *
 * RESPONSE
 *  name | User-friendly name of the created Category
 *  uriName | URL-friendly name of the created Category
 *  uri | URI of the created Category
 *  route | Route of the created Category
 *  kind | Kind of a category (i.e 0)
 *  solved | Whether all subcategories and exercises are solved.
 *  description | Description of the requested category.
 *  sections | An array of populated subsections of the requested
 *    category. For a category, this includes an "exercises" subsection
 *    as well as a "subcategories" one.
 *    Section's anatomy is
 *     {
 *      title: may differ, what to display to the user,
 *      name: enum["exercises", "subcategories"],
 *      listing: Array(documents)
 *     }
 *
 * ERRORS:
 *  404 | category not found
 *
 */
exports.subcategoriesDetails = [
  validateSanitization,
  async (req, res) => {
    const { route, uriName } = breakdownURI(req.params.uri, "_");
    const category = await Category.findOne({
      route: route,
      uriName: uriName,
    }).lean({ virtuals: true, getters: true });

    if (category == null)
      return res.status(404).json({ errors: "category not found" });

    // TODO additional functionality would be to return them 20 by 20 e.g.
    const subCats = await Category.find({ route: category.uri }).lean({
      virtuals: true,
      getters: true
    });
    return res.json(subCats);
  },
];

exports.exercises = [
  validateSanitization,
  async (req, res) => {
    const { route, uriName } = breakdownURI(req.params.uri, "_");
    const category = await Category.findOne({
      route: route,
      uriName: uriName,
    }).lean({ virtuals: true });
    if (category == null)
      return res.status(404).json({ errors: "category not found" });

    // BUG deal with error if not found.
    const exos = await findSectionDocs(
      {
        category,
        sectionName: "exercises",
      },
      { lean: true }
    );
    return res.json(exos);
  },
];

/** Given an user-friendly URI, retrieve at most 10 best Category
 *  matches based on their URI closeness to the prefix body.uiURI.
 *  Endpoint of /@find.
 *
 * REQUESTS
 *  BODY
 *   uiURI | User-friendly string of categories' names separated by '/'.
 *
 * RESPONSE
 *  categories Array maxLength(10)
 *    Array of Categories whose uri best matched with body.uiURI.
 *
 * ERRORS
 *  400 | Usual errors for validation failures.
 */
exports.matchCategories = [
  routeValidationChain(body("uiURI").customSanitizer((v) => makeURIRoute(v))),
  validateSanitization,
  async (req, res) => {
    const { route, uriName } = breakdownURI(req.body.uiURI, "_");
    const makeitRegexSafe = (str) =>
      str.replaceAll(/([.+*?^$()[\]\\{}])/g, String.fromCharCode(92) + "$1");
    const uriNamePfxRegex = new RegExp(`^${makeitRegexSafe(uriName)}`);
    // prioritize Categories whose route matches exaclty the one given.
    let query = Category.find({
      route: route,
      uriName: uriNamePfxRegex,
    });
    let categories = await query
      .select("uri name uriName route")
      .sort({ uriName: -1 })
      .limit(10)
      .lean();

    categories ??= [];
    if (categories.length < 10) {
      const uriPfxRegex = new RegExp(
        `^${makeitRegexSafe(route + "_" + uriName)}`
      );
      query = Category.find({ route: uriPfxRegex });
      /* Enlarge search by using the whole uiURI as prefix route.  */
      categories = await query
        .select("uri name uriName route")
        .sort({ route: 1 })
        .limit(10 - categories.length)
        .lean();
    }

    return res.json(categories ?? []);
  },
];

/* List all subcategories of the Root Category.
   That is, list all categories that have "no ancestor".
   No exercises can be listed here.  */
exports.index = async (req, res) => {
  // const indexCategories = await findSectionDocs({parentURI: "", sectionName: "subcategories"});
  const subcategoriesSection = await getAndPrepareSection(
    {
      title: "Subcategories",
      name: "subcategories",
      parentURI: "",
    },
    { lean: true }
  );
  debug("Categories at root are", subcategoriesSection);
  return res.json({
    route: "",
    uri: "",
    name: "Categories Index",
    uriName: "",
    description: "Index of all categories",
    sections: [subcategoriesSection],
  });
};

/**
 * Send a Category's full details and its direct populated subsections.
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category fetch.
 *
 * RESPONSE
 *  name | User-friendly name of the created Category
 *  uriName | URL-friendly name of the created Category
 *  uri | URI of the created Category
 *  route | Route of the created Category
 *  kind | Kind of a category (i.e 0)
 *  solved | Whether all subcategories and exercises are solved.
 *  description | Description of the requested category.
 *  sections | An array of populated subsections of the requested
 *    category. For a category, this includes an "exercises" subsection
 *    as well as a "subcategories" one.
 *    Section's anatomy is
 *     {
 *      title: may differ, what to display to the user,
 *      name: enum["exercises", "subcategories"],
 *      listing: Array(documents)
 *     }
 *
 * ERRORS:
 *  404 | category not found
 *
 */
exports.request = [
  validateSanitization,
  async (req, res) => {
    const uri = req.params.uri;
    const { route, uriName } = breakdownURI(uri, "_");
    debug("request cat", uri, "route is", route, "uriName is", uriName);
    const category = await Category.findOne({
      route: route,
      uriName: uriName,
    }).exec();

    if (category === null)
      return res.status(404).json({ errors: "category not found" });

    let sections = [];
    const subs = await getAndPrepareSection({
      title: "Subcategories",
      category: category,
      name: "subcategories",
    });
    if (subs.listing.length) sections.push(subs);

    const exos = await getAndPrepareSection({
      title: "Exercises",
      name: "exercises",
      category: category,
    });
    if (exos.listing.length) sections.push(exos);

    return res.json({
      name: category.name,
      uriName: category.uriName,
      uri: category.uri,
      route: category.route,
      kind: category.kind,
      solved: category.solved,
      description: category.description,
      sections: sections,
    });
  },
];

/**
 * Create a Category from its most basics components NAME, DESCRIPTION and ROUTE.
 * Future version would require certain rights from the user.
 *
 * REQUESTS
 *  PARAMETERS
 *  BODY
 *   name NotEmpty
 *    User-friendly name of the category to create.
 *   description Optional NotEmpty
 *    Description of the category to create.
 *   uiRoute
 *    User-friendly string of categories' names separated by '/', representing the path
 *    of the closest parent Category the new Category should be a part of.
 *
 * RESPONSE
 *  name | User-friendly name of the created Category
 *  uri | URI of the created Category
 *  route | Route of the created Category
 *
 *
 * ERRORS:
 *  400 | category exists already
 *  404 | category not found
 *
 */
exports.create = [
  // hasAccessRights(ACCESS.W + ),
  checkAuth(),
  nameValidationChain(body("name")),
  body("description").optional().escape(),
  routeValidationChain(body("uiRoute").customSanitizer((v) => makeURIRoute(v))),
  validateSanitization,
  async (req, res) => {
    const { name, description } = req.body;
    const route = req.body.uiRoute;
    debug("Category.create request:", req.body);
    const uriName = makeURIName(name);

    if (!uriName.length && !route.length) return res.sendStatus(400);
    // if (!route.length) route = '/';
    debug("attempt to find", {
      route: route,
      uriName: uriName,
    });
    // inserting under Root is special case
    const match = await Category.findOne({
      route: route,
      uriName: uriName,
    }).exec();
    if (match != null) {
      debug("found category", match);
      return res.status(400).json({ errors: "category exists already" });
    }

    let category = new Category({
      name: name,
      description: description,
      route: route,
      uriName: uriName,
    });
    await category.save();
    return res.json({
      name: category.name,
      uri: category.uri,
      route: category.route,
    });
  },
];

/**
 * Delete from the database the Category specified by URL parameter :uri.
 * At the moment, deletion is recursive.
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category to insert the exercise into.
 *
 * RESPONSE
 *  200
 *
 * ERRORS:
 *  404 | category not found
 *
 */
exports.delete = [
  checkAuth(),
  validateSanitization,
  async (req, res) => {
    const { route, uriName } = breakdownURI(req.params.uri);
    if (req.params.uri.length === 0)
      return res.status(404).json({ errors: "category not found" });
    const cat = await Category.findOne({
      route: route,
      uriName: uriName,
    });
    if (cat == null)
      return res.status(404).json({ errors: "category not found" });
    if (!route?.length && !uriName?.length)
      return res.status(404).json({ errors: "cannot delete root" });

    // async function subDocsTreeDeletion(category) {
    //   // delete all subcategories if the route change.
    //   const subDocs = await findSectionDocs({
    //     category: cat,
    //     sectionName: "subcategories",
    //   });
    //   if (subDocs.length === 0) return;
    //   await Promise.all(
    //     subDocs.map(async (sub) => {
    //       await subDocsTreeDeletion(sub); // to trigger pre('deleteOne') hook
    //       return await sub.deleteOne();
    //     })
    //   );
    // }

    let delSubCats = true;
    if (delSubCats) {
      const reFriendlyUri = cat.uri.replaceAll(
        /([.+*?^$()[\]\\{}])/g,
        String.fromCharCode(92) + "$1"
      );
      const regex = new RegExp(`^${reFriendlyUri}`);
      const subCats = await Category.find({ route: regex }).exec();
      await Promise.all(
        subCats.map(async (doc) => {
          // const exoDoc = await Exercise.deleteMany({category: doc._id}).exec();
          await doc.deleteOne(); // Should call preHook that will delete its exercises too.
        })
      );
    }
    await cat.deleteOne();
    // FIXME for optional functionality, the subcategories should be moved one level up

    return res.sendStatus(200);
  },
];

/**
 * Request's body takes any of the optional
 * {
 *  name,
 *  route,
 *  description
 * }
 *
 * NAME and ROUTE cannot be both empty as we cannot update the Root Category
 * from the api.
 * If any of the above field is given and valid, then the category found by
 * the parameter :URI see its relevant field(s) therefore updated.
 */

exports.update = [
  checkAuth(),

  nameValidationChain(body("name").optional()),
  routeValidationChain(body("route").optional()),
  body("description").optional().escape(),
  validateSanitization,

  async (req, res) => {
    const { route, uriName } = breakdownURI(req.params.uri);
    let updates = { route, uriName };
    if (req.body.description) updates.description = req.body.description;
    if (req.body.name) {
      updates.name = req.body.name;
      updates.uriName = makeURIName(updates.name);
      // FIXME update all current recursive subcategories route
      // use findAndUpdate to update all whose route prefix matched this one previous full route.
    }
    if (req.body.route) {
      updates.route = req.body.route;
      // FIXME update all current recursive subcategories route
      // use findAndUpdate to update all whose route prefix matched this one previous full route.
    }

    if (!updates.uriName.length && !updates.route.length)
      return res.sendStatus(400);

    // Check that we won't override another Category
    if (updates.route != route || updates.uriName != uriName) {
      const override = await Category.findOne({
        route: updates.route,
        uriName: updates.uriName,
      }).exec();
      if (override != null)
        return res.status(400).json({ errors: "cannot override category" });
    }

    const updateStatus = await Category.updateOne(
      { route: route, uriName: uriName },
      updates
    );
    if (!updateStatus.acknowledged) return res.sendStatus(400);
    if (updateStatus.matchedCount === 0) return res.sendStatus(404);

    const updated = await Category.findOne({
      route: updates.route,
      uriName: updates.uriName,
    }).exec();
    updates.uri = updated.uri;
    return res.status(200).send(updates);
  },
];
