const mongoose = require("mongoose");
const { Schema } = mongoose;

const { titleRegex } = require("./helpers/practice");

const QuestionSchema = new Schema({
  title: {
    type: String,
    required: true,
    minLength: [1, "Cannot have an empty title"],
    maxLength: 60,
    validate: {
      validator: (v) => {
        return titleRegex.test(v);
      },
      message: "Invalid format of the title",
    },
  },
  statement: {
    type: String,
    required: true,
    minLength: [1, "Cannot have an empty statement"],
    maxLength: [255, "Statement too long"],
  },
  explanation: { required: true, type: String, maxLength: 255 },
  language: {
    type: String,
    enum: ["", "cpp", "c", "java", "bta", "javascript", "python"],
    lowercase: true,
  },
  languageSnippet: { type: String, maxLength: 1000 },
  choices: {
    format: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["checkbox", "radio"],
      default: "checkbox",
    },
    list: [
      {
        name: { type: String, required: true, maxLength: 15 },
        label: { type: String, required: true, maxLength: 15 },
        answer: { type: Boolean, required: true },
      },
    ],
  },
});

exports.Question = mongoose.model("Question", QuestionSchema);
