const { Attempt } = require("../models/attemptModel");
const { Category } = require("../models/categoryModel");
const { Exercise, makeExerciseURI } = require("../models/exerciseModel");
const { Question } = require("../models/questionModel");
const { breakdownURI, makeURIName } = require("../models/helpers/practice");
const userModel = require("../models/userModel");
const { checkAuth } = require("../passport/authenticate");
const { validateSanitization } = require("../sanitizers");
const { body } = require("express-validator");
const debug = require("debug")("server:practice");

const {
  questionsValidator,
  questionCustomValidator,
  nameValidationChain,
  routeValidationChain,
} = require("./validators").practice;

async function getExoDoc(req, { lean = false, leanOptions }) {
  const category = await Category.findOne(breakdownURI(req.params.uri)).lean();
  if (category == null) throw new Error("category not found");

  if (lean)
    return await Exercise.findOne({
      category: category._id,
      uriName: req.params.uriName,
    }).lean(leanOptions);

  return await Exercise.findOne({
    category: category._id,
    uriName: req.params.uriName,
  }).exec();
}

/**
 * Lightweight fetch of an Exercise information
 * without populating its questions (only their IDs are returned).
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category's uri the exercise to retrieve is currently a part of.
 *   :uriName | The URL-friendly name of the exercise to fetch.
 *  QUERY
 *   ?full Optional | If present, then the questions will be populated, as would
 *                    happen by calling /questions.
 *
 * RESPONSE
 *  answer.answers IfAuthentified Array | Array of answers of the user's previous Attempt.
 *  answer.submissionDate IfAuthentified | Date of the last user's Attempt to this Exercise.
 *  category | ID of the Category the retrieved Exercise is part of.
 *  categoryURI | URI of the Category the retrieved Exercise is part of.
 *  description | Retrieved Exercise's description
 *  kind | Kind of an Exercise, should be 1.
 *  lastModified | Modification date.
 *  lastModifiedBy | Author's ID of the modification.
 *  name | User-friendly name of the retrieved Exercise
 *  questionsIDs Array | Array of the fetched Exercise's questions' unique IDs.
 *  solved IfAuthentified | Boolean if Exercise has been solved by the user.
 *  uriName | URL-friendly name of the retrieved Exercise
 *  uri | Client-side URL-friendly uri of the retrieved Exercise
 *
 * ERRORS
 *  404 | category not found
 *  404 | exercise not found
 */
exports.request = [
  validateSanitization,
  async (req, res) => {
    const toBePopulated = ["category"];
    const full = "full" in req.query;
    if (full) toBePopulated.push("questionsIDs");

    const category = await Category.findOne(
      breakdownURI(req.params.uri)
    )?.lean();
    if (category == null)
      return res.status(404).json({ errors: "category not found" });
    const exercise = await Exercise.findOne({
      category: category._id,
      uriName: req.params.uriName,
    })
      ?.lean({ virtuals: true, getters: true })
      ?.populate(toBePopulated);
    if (exercise == null)
      return res.status(404).json({ errors: "exercise not found" });

    let fetched = {
      category: exercise.category._id,
      categoryURI: exercise.category.uri,
      description: exercise.description,
      kind: exercise.kind,
      lastModified: exercise.lastModified,
      lastModifiedBy: exercise.lastModifiedBy,
      name: exercise.name,
      questionsIDs: exercise.questionsIDs,
      uriName: exercise.uriName,
      uri: exercise.uri,
    };

    const user = req.user ? await userModel.findById(req.user.id).exec() : null;
    let attempt = null;
    if (user?._id)
      attempt = await Attempt.findOne({
        exercise: exercise._id,
        by: user._id,
      }).exec();
    fetched.solved = attempt?.solved ?? false;
    if (attempt) {
      fetched.answer = {
        answers: attempt.answers,
        submissionDate: attempt.submissionDate,
        id: attempt._id,
      };
    }
    debug("exercise was found, result is ", fetched);
    return res.json(fetched);
  },
];

/**
 * Create a new Exercise if it doesn't exists under the category specified
 * at URL parameter :uri.
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category to insert the exercise into.
 *  BODY
 *   name NotEmpty
 *    User-friendly name of the exercise to create.
 *   description NotEmpty
 *    Description of the exercise
 *   questions Array NotEmpty
 *    Initial array of questions to create and insert to the created Exercise.
 *
 * RESPONSE
 *  name | User-friendly name of the created Exercise
 *  uriName | URL-friendly name of the created Exercise
 *  uri | Client-side URI of the created Exercise
 *  description | Description of the created Exercise
 *  lastModified | Last modification date of the created Exercise
 *  lastModifiedBy | Author's ID of the last modification of the created Exercise
 *  category | ID of the Category the created Exercise is part of.
 *  categoryURI | URI of the Category the created Exercise is part of.
 *  questionsIDs | ID of the Category the created Exercise is part of.
 *
 * ERRORS
 *  404 | category not found
 *  400 | exercise not found
 *
 */
exports.create = [
  checkAuth(),
  nameValidationChain(body("name")),
  questionsValidator, // TODO add validation of the question objects
  body("description")
    .escape()
    .notEmpty()
    .withMessage("description too short")
    .bail(),
  validateSanitization,

  async (req, res) => {
    const thisURIName = makeURIName(req.body.name);
    const brokeDown = breakdownURI(req.params.uri);
    debug("creating exercise into", { brokeDown, uri: req.params.uri });
    const category = await Category.findOne({
      route: brokeDown.route,
      uriName: brokeDown.uriName,
    }).exec();

    // category wasn't found, then bail out
    if (category == null) {
      return res.status(404).json({ errors: "category not found" });
    }
    // If exercise exists already, bail out.
    const match = await Exercise.findOne({
      category: category._id,
      uriName: thisURIName,
    }).exec();
    if (match != null)
      return res.status(400).json({ errors: "exercise exists already" });

    /* Retrieve user's id
       req.user.id should be coherent since checkAuth validation passed.  */
    const authorID = req.user.id;

    /* Create and insert questions into the database
       from req.body.questions array.  */
    const questionsIDs = await Promise.all(
      req.body.questions.map(async (quest) => {
        const questDoc = new Question({
          title: quest.title,
          statement: quest.statement,
          language: quest.language ?? "",
          languageSnippet: quest.languageSnippet ?? "",
          explanation: quest.explanation ?? "",
          choices: quest.choices,
        });
        const savedDoc = await questDoc.save();
        return savedDoc._id;
      })
    );
    /* Finally create the Exercise.  */
    let exercise = new Exercise({
      name: req.body.name,
      uriName: thisURIName,
      description: req.body.description,
      category: category._id,
      lastModifiedBy: authorID,
      questionsIDs: questionsIDs,
    });
    await exercise.save();
    await exercise.populate("category");

    return res.json({
      name: exercise.name,
      uriName: exercise.uriName,
      uri: makeExerciseURI(category.uri, exercise.name),
      description: exercise.description,
      lastModified: exercise.lastModified,
      lastModifiedBy: exercise.lastModifiedBy,
      category: exercise.category._id,
      categoryURI: category.uri,
      questionsIDs: exercise.questionsIDs,
    });
  },
];

/**
 * Deep deletion of an Exercise. Its attached questions and attempts
 * will be dropped too.
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category to insert the exercise into.
 *   :uriName | The URL-friendly name of the exercise to fetch.
 *
 * RESPONSE
 *  200
 *
 * ERRORS
 *  404 | category not found
 *  404 | exercise not found
 *
 */
exports.delete = [
  checkAuth(),
  validateSanitization,

  async (req, res) => {
    const category = await Category.findOne(
      breakdownURI(req.params.uri)
    ).lean();
    if (category == null)
      return res.status(404).json({ errors: "category not found" });

    const exercise = await Exercise.findOne({
      category: category._id,
      uriName: req.params.uriName,
    }).exec();

    if (exercise == null)
      return res.status(404).json({ errors: "exercise not found" });
    await exercise.deleteOne();
    res.sendStatus(200);
  },
];

/**
 * Update an existing Exercise's basic information.
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category's uri the exercise to update is currently a part of.
 *   :uriName | The URL-friendly name of the exercise to update.
 *  BODY
 *   name NotEmpty Optional
 *    New user-friendly name of the exercise.
 *   description NotEmpty Optional
 *    New description of the exercise.
 *   categoryURI NotEmpty Optional
 *    URI of the category the Exercise should be moved to.
 *
 * RESPONSE
 *  name IfUpdated | User-friendly name of the updated Exercise
 *  uriName IfUpdated | URL-friendly name of the updated Exercise
 *  description IfUpdated | Updated description Exercise
 *  lastModified | Modification date.
 *  lastModifiedBy | Author's ID of the modification.
 *  category | ID of the Category the updated Exercise is part of.
 *  categoryURI | URI of the Category the updated Exercise is part of.
 *
 *
 * ERRORS
 *  400 | cannot override exercise
 *  400 | update failed
 *  404 | category not found
 *  404 | exercise not found
 *  404 | destination category not found
 *
 */
exports.update = [
  checkAuth(),

  nameValidationChain(body("name").optional()),
  body("description").optional().escape().notEmpty(),
  routeValidationChain(body("categoryURI").optional()),
  validateSanitization,

  async (req, res) => {
    const currCategory = await Category.findOne(
      breakdownURI(req.params.uri)
    ).exec();
    let newCategory = currCategory;

    // category wasn't found, then bail out
    if (currCategory == null)
      return res.status(404).json({ errors: "category not found" });

    let updates = {};
    if (req.body.description) updates.description = req.body.description;
    if (req.body.categoryURI) {
      newCategory = await Category.findOne(
        breakdownURI(req.body.categoryURI)
      ).exec();
      // category wasn't found, then bail out
      if (newCategory == null)
        return res
          .status(404)
          .json({ errors: "destination category not found" });
      updates.category = newCategory._id;
    }
    if (req.body.name) {
      updates.name = req.body.name;
      updates.uriName = makeURIName(updates.name);
    }

    /* Retrieve user's id
       req.user.id should be coherent since checkAuth validation passed.  */
    updates.lastModifiedBy = req.user.id;
    updates.lastModified = Date.now;

    const updateStatus = await Exercise.findOneAndUpdate(
      {
        category: currCategory._id,
        uriName: req.params.uriName,
      },
      updates
    ).exec();
    if (!updateStatus.acknowledged)
      return res.status(400).json({ errors: "update failed" });
    if (updateStatus.matchedCount === 0)
      return res.status(404).json({ errors: "exercise not found" });
    return res.json({
      ...updates,
      category: newCategory._id,
      categoryURI: newCategory.uri,
    });
  },
];

/**
 * Insert a new Question into an Exercise.
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category's uri.
 *   :uriName | The URL-friendly name of the exercise.
 *  BODY
 *   title NotEmpty
 *    A concise header title of the question.
 *   statement NotEmpty
 *    A medium-sized statement to explain the question.
 *   explanation NotEmpty
 *    An explanation to show to the user upon answering the question.
 *   language NotEmpty Enum Optional
 *    Comes in pair with body.languageSnippet. The language of the snippet.
 *   languageSnippet NotEmpty Optional
 *    A code block that accompanies the question statement.
 *   choices NotEmpty Object
 *    choices.format NotEmpty Enum("radio", "checkbox")
 *     Format of the choices
 *    choices.list NotEmpty Array
 *     A list of potential answers to the question.
 *      choices.list[].name NotEmpty
 *        The form's name of the answer that will be later used for recognition.
 *      choices.list[].label Defined
 *        A label to show up next to the choice in a form.
 *      choices.list[].answer Boolean
 *        Whether the right answer to this choice is true or false.
 *
 * RESPONSE
 *  qid
 *
 *
 * ERRORS
 *  404 | category not found
 *  404 | exercise not found
 *
 */
exports.addQuest = [
  checkAuth(),
  body().custom((req) => questionCustomValidator(req)),
  validateSanitization,

  async (req, res, next) => {
    const category = await Category.findOne(
      breakdownURI(req.params.uri)
    )?.lean();
    if (category == null)
      return res.status(404).json({ errors: "category not found" });

    let exercise = await Exercise.findOne({
      category: category._id,
      uriName: req.params.uriName,
    }).exec();
    if (exercise == null)
      return res.status(404).json({ errors: "exercise not found" });

    let attributes = {
      title: req.body.title,
      statement: req.body.statement,
      explanation: req.body.explanation,
      choices: req.body.choices,
    };
    if (req.body.language) attributes.language = req.body.language;
    if (req.body.languageSnippet)
      attributes.languageSnippet = req.body.languageSnippet;
    const q = new Question(attributes);
    const qdoc = await q.save();

    let updatedQ = exercise.questionsIDs;
    updatedQ.push(qdoc._id);
    exercise.questionsIDs = updatedQ;
    await exercise.save();
    return res.json({ qid: qdoc._id });
  },
];

/**
 * Update a Question into an Exercise.
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category's uri.
 *   :uriName | The URL-friendly name of the exercise.
 *   :qid | The question's id.
 *  BODY
 *   title NotEmpty Optional
 *    A concise header title of the question.
 *   statement NotEmpty Optional
 *    A medium-sized statement to explain the question.
 *   explanation NotEmpty Optional
 *    An explanation to show to the user upon answering the question.
 *   language NotEmpty Enum Optional
 *    Comes in pair with body.languageSnippet. The language of the snippet.
 *   languageSnippet NotEmpty Optional
 *    A code block that accompanies the question statement.
 *   choices NotEmpty Optional Object
 *    choices.format NotEmpty Optional Enum("radio", "checkbox")
 *     Format of the choices
 *    choices.list NotEmpty Array
 *     A list of potential answers to the question.
 *      choices.list[].name NotEmpty
 *        The form's name of the answer that will be later used for recognition.
 *      choices.list[].label Defined
 *        A label to show up next to the choice in a form.
 *      choices.list[].answer Boolean
 *        Whether the right answer to this choice is true or false.
 *
 * RESPONSE
 *  200
 *
 * ERRORS
 *  404 | category not found
 *  404 | exercise not found
 *  404 | question not found
 *
 */
exports.updateQuest = [
  checkAuth(),
  // FIXME Validation optional of : body().custom((req) => questionCustomValidator(req)),
  validateSanitization,

  async (req, res, next) => {
    const category = await Category.findOne(
      breakdownURI(req.params.uri)
    )?.lean();
    if (category == null)
      return res.status(404).json({ errors: "category not found" });

    let exercise = await Exercise.findOne({
      category: category._id,
      uriName: req.params.uriName,
    }).exec();
    if (exercise == null)
      return res.status(404).json({ errors: "exercise not found" });

    if (!exercise.questionsIDs.includes(req.params.qid))
      return res.status(404).json({ errors: "question not found" });

    let question = await Question.findById(req.params.qid).exec();
    if (question == null)
      // FIXME should therefore remove it from exercise as we detected it was part of it
      return res.status(404).json({ errors: "question not found" });

    exercise.lastModifiedBy = req.user.id;
    exercise.lastModified = Date.now;

    if (req.body.title) question.title = req.body.title;
    if (req.body.statement) question.statement = req.body.statement;
    if (req.body.explanation) question.explanation = req.body.explanation;
    if (req.body.choices) question.choices = req.body.choices;
    if (req.body.language) question.language = req.body.language;
    if (req.body.languageSnippet)
      question.languageSnippet = req.body.languageSnippet;
    try {
      await question.save();
      await exercise.save();
      return res.sendStatus(200);
    } catch (error) {
      return res.status(500).json({ errors: "update failed" });
    }
  },
];

exports.dropQuest = [
  checkAuth(),
  validateSanitization,
  async (req, res) => {
    // FIXME Should update all Attempts made on this exercise
    const category = await Category.findOne(
      breakdownURI(req.params.uri)
    )?.lean();
    if (category == null)
      return res.status(404).json({ errors: "category not found" });

    let exercise = await Exercise.findOne({
      category: category._id,
      uriName: req.params.uriName,
    }).lean();
    if (exercise == null)
      return res.status(404).json({ errors: "exercise not found" });

    if (exercise.questionsIDs.includes(req.params.qid)) {
      const newQArray = exercise.questionsIDs.filter(
        (qid) => qid !== req.params.qid
      );
      exercise.questionsIDs = newQArray;
      await exercise.save();
      await Question.findByIdAndDelete(req.params.qid);
      return res.sendStatus(200);
    }
    return res.status(404).json({ errors: "question not found" });
  },
];

/**
 * Retrieve the populated list of questions of an Exercise.
 *
 * REQUESTS
 *  PARAMETERS
 *   :uri | The category's uri the exercise to retrieve is currently a part of.
 *   :uriName | The URL-friendly name of the exercise to fetch.
 *  BODY
 *   name NotEmpty Optional
 *    New user-friendly name of the exercise.
 *   description NotEmpty Optional
 *    New description of the exercise.
 *   categoryURI NotEmpty Optional
 *    URI of the category the Exercise should be moved to.
 *
 * RESPONSE
 *  <unnamed> Array | Populated Array of the full-on information of
 *                    this Exercise's questions.
 * ERRORS
 *  404 | category not found
 *  404 | exercise not found
 *
 */
exports.questions = [
  validateSanitization,
  async (req, res) => {
    try {
      const exercise = await getExoDoc(req, { lean: true });
      if (exercise == null)
        return res.status(404).json({ errors: "exercise not found" });
      await exercise.populate("questionsIDs");
      return res.json(exercise.questionsIDs);
    } catch (err) {
      return res.status(404).json({ errors: err.message });
    }
  },
];
