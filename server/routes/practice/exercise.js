var express = require("express");
var router = express.Router({ caseSensitive: true, mergeParams: true });

const exerciseCtrl = require("../../controllers/exerciseController");
const { param } = require("express-validator");
const { routeValidationChain } = require("../../controllers/validators").practice;

router.post("/", exerciseCtrl.create);
router.use("/:uriName", routeValidationChain(param("uriName")));
router.get("/:uriName", exerciseCtrl.request);
router.delete("/:uriName", exerciseCtrl.delete);
router.put("/:uriName", exerciseCtrl.update);

// questions
router.get("/:uriName/questions", exerciseCtrl.questions);
router.post("/:uriName/q", exerciseCtrl.addQuest);
router.delete("/:uriName/q/:qid", exerciseCtrl.dropQuest);

module.exports = router;
