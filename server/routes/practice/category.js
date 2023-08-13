var express = require("express");
var router = express.Router();

const catCtrl = require("../../controllers/categoryController");
const { URIParamValidator } = require("../../controllers/validators").practice;

router.post("/", catCtrl.create);
router.use("/:uri", URIParamValidator);
router.get("/:uri", catCtrl.request);
router.delete("/:uri", catCtrl.delete);
router.put("/:uri", catCtrl.update);

router.get("/:uri/exercises", catCtrl.exercises);
router.get("/:uri/subcategories", catCtrl.subcategories);

router.use("/:uri/ex/", require("./exercise"));

module.exports = router;
