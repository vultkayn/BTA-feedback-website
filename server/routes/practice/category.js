var express = require("express");
var router = express.Router({ caseSensitive: true, mergeParams: true });

const catCtrl = require("../../controllers/categoryController");
const { param } = require("express-validator");
const { routeValidationChain } = require("../../controllers/validators").practice;

router.post("/", catCtrl.create);
router.use("/:uri", routeValidationChain(param("uri")));
router.get("/:uri", catCtrl.request);
router.delete("/:uri", catCtrl.delete);
router.put("/:uri", catCtrl.update);

router.use("/:uri/ex", require("./exercise"));
router.get("/:uri/exercises", catCtrl.exercises);
router.get("/:uri/subcategories", catCtrl.subcategoriesDetails);
router.get("/@find", catCtrl.matchCategories);

module.exports = router;
