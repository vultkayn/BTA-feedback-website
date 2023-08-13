const { Category } = require("../models/categoryModel");
const {
  breakdownURI,
  nameRegex,
  routeRegex,
  nameMaxLength,
  makeURIName,
} = require("../models/helpers/practice");
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
async function findSectionDocs({ category, parentURI, sectionName }) {
  const subRoute = category?.uri ?? parentURI;
  let section = [];
  debug("category is", category);
  switch (sectionName) {
    case "subcategories":
      section = await Category.find({ route: subRoute }).exec();
      break;
    case "exercises":
      if (category === undefined || category === null)
        throw new Error(
          "'exercises' can only be found with a defined category"
        );
      section = await Exercise.find({ category: category._id }).exec();
      break;
    default:
      throw new Error(
        `such sectionName ${sectionName} has not been implemented yet`
      );
  }
  return section;
}
async function getAndPrepareSection({ title, parentURI, name, category }) {
  const sectionDocuments = await findSectionDocs({
    category,
    parentURI,
    sectionName: name,
    name,
  });
  const listing = sectionDocuments
    ? sectionDocuments.map((sub) => {
        return {
          uri: sub.uri,
          name: sub.name,
          kind: sub.kind,
          solved: sub.solved,
        };
      })
    : [];

  return { title, listing };
}

exports.subcategories = [
  validateSanitization,
  async (req, res) => {
    const { route, uriName } = breakdownURI(req.params.uri, "-");
    const category = await Category.findOne({
      route: route,
      uriName: uriName,
    }).exec();

    if (category == null) return res.sendStatus(404);

    const subCats = await findSectionDocs({
      category,
      sectionName: "subcategories",
    }).exec();
    return res.json(subCats);
  },
];

exports.exercises = [
  validateSanitization,
  async (req, res) => {
    const { route, uriName } = breakdownURI(req.params.uri, "-");
    const category = await Category.findOne({
      route: route,
      uriName: uriName,
    }).exec();
    // BUG deal with error if not found.
    const exos = await findSectionDocs({
      category,
      sectionName: "exercises",
    }).exec();
    return res.json(exos);
  },
];

/* List all subcategories of the Root Category.
   That is, list all categories that have "no ancestor".
   No exercises can be listed here.  */
exports.index = async (req, res) => {
  // const indexCategories = await findSectionDocs({parentURI: "", sectionName: "subcategories"});
  const subs = await getAndPrepareSection({
    title: "Subcategories",
    name: "subcategories",
    parentURI: "",
  });
  debug("subsections are", subs);
  return res.json({
    route: "",
    uri: "",
    name: "Categories Index",
    description: "Categories Index descr",
    sections: [subs],
  });
};

/* Retrieve and send details of the Category at the given URI or 404.
details: {
  name: category.name,
  uriName: category.uriName,
  uri: category.uri,
  route: category.route,
  kind: category.kind, (= 0)
  solved: category.solved,
  description: category.description,
  sections: [
    {title, name, listing: []}
  ]
} 
*/
exports.request = [
  validateSanitization,
  async (req, res) => {
    const uri = req.params.uri;
    const { route, uriName } = breakdownURI(uri, "-");
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

    debug("sending uri", category.uri);

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
 *   route
 *    URI of the closest parent Category the new Category should be a part of.
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
  body("name")
    .escape()
    .trim()
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
  body("description").optional().escape(),
  body("route")
    .isString()
    .escape()
    .trim()
    .custom((v) => {
      if (!routeRegex.test(v)) throw new Error("invalid characters");
      return true;
    }),
  validateSanitization,
  async (req, res) => {
    const { name, description, route } = req.body;
    debug("Category.create request:", req.body);
    const uriName = makeURIName(name);

    if (!uriName.length && !route.length) return res.sendStatus(400);

    const match = await Category.findOne({
      route: route,
      uriName: uriName,
    }).exec();
    if (match != null)
      return res.status(400).json({ errors: "category exists already" });

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

    async function subDocsTreeDeletion(category) {
      // delete all subcategories if the route change.
      const subDocs = await findSectionDocs({
        category: cat,
        sectionName: "subcategories",
      });
      if (subDocs.length === 0) return;
      await Promise.all(
        subDocs.forEach(async (sub) => {
          await subDocsTreeDeletion(sub); // to trigger pre('deleteOne') hook
          return await sub.deleteOne();
        })
      );
    }

    let delSubCats = true; // TODO change that for optional deletion functionality
    delSubCats && (await subDocsTreeDeletion(cat));
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

  body("name")
    .optional()
    .escape()
    .trim()
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
  body("route")
    .optional()
    .isString()
    .escape()
    .trim()
    .custom((v) => {
      if (!routeRegex.test(v)) throw new Error("invalid characters");
      return true;
    }),
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
