const mongoose = require("mongoose");
const { Schema } = mongoose;

const AttemptSchema = new Schema(
  {
    submissionDate: { type: Date, default: Date.now, required: true },
    answers: [
      {
        question: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        values: [
          {
            name: { type: String, required: true, maxLength: 15 },
            value: String,
          },
        ],
      },
    ],
    exercise: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Exercise",
    },

    by: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { toJSON: { virtuals: true } }
);

AttemptSchema.virtual("solved").get(function () {
  return false; // FIXME virtual solved for attempts ?
});

exports.Attempt = mongoose.model("Attempt", AttemptSchema);
