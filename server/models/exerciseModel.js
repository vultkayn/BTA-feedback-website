const mongoose = require("mongoose");
const { Schema } = mongoose;

const {
  routeRegex,
  nameRegex,
  makeURIName,
} = require("../models/helpers/practice");
const debug = require("debug")("server:practice");
const { Question } = require("./questionModel");
const { Attempt } = require("./attemptModel");

const ExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [1, "Cannot have an empty name"],
      maxLength: 30,
      validate: {
        validator: (v) => {
          return nameRegex.test(v);
        },
        message: "Invalid format of the name",
      },
    },
    uriName: {
      type: String,
      required: true,
      validate: {
        validator: (v) => {
          return routeRegex.test(v);
        },
        message: "Invalid format of the uri name",
      },
    },
    description: { type: String, required: true },
    lastModified: { type: Date, default: Date.now, required: true },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionsIDs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

function makeExerciseURI(categoryURI, uiName) {
  return categoryURI + "/" + makeURIName(uiName);
}

ExerciseSchema.virtual("kind").get(() => 1);
ExerciseSchema.virtual("solved").get(() => false);
ExerciseSchema.virtual("uri").get(function () {
  return makeExerciseURI(this.category.uri, this.name);
});

ExerciseSchema.pre("deleteOne", { document: true }, async function () {
  // Runs when you call `doc.deleteOne()`
  debug("calling deleteOne preHook");
  await Promise.all(
    this.questionsIDs.map(async (qid) => await Question.findByIdAndDelete(qid))
  );

  await Attempt.deleteMany({ exercise: this._id });
});

exports.Exercise = mongoose.model("Exercise", ExerciseSchema);
exports.makeExerciseURI = makeExerciseURI;
