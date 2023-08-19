const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { Exercise } = require("./exerciseModel");

const { routeRegex, nameRegex, breakdownURI, nameMaxLength } = require("./helpers/practice");



const CategorySchema = new Schema(
  {
    route: {
      type: String,
      validate: {
        validator: function (v) {
          return routeRegex.test(v);
        },
        message: "Invalid format of the category route",
      },
      trim: true,
    },
    name: {
      type: String,
      validate: {
        validator: (v) => {
          return nameRegex.test(v);
        },
        message: "Invalid format of the name",
      },
      maxLength: nameMaxLength,
      required: [true, "Category name required"],
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
    description: String,
  },
  {
    toJSON: { virtuals: true },
  }
);

/****HELPERS****/



function makeCategoryURI (route, uriName)
{
  if (route.length === 0)
    return uriName;
  return route + "-" + uriName;
}

/************ VIRTUALS ********************/

CategorySchema.virtual("kind").get(() => 0);
CategorySchema.virtual("solved").get(() => true);
CategorySchema.virtual("uri")
  .get(function () {
    return makeCategoryURI(this.route, this.uriName);
  })
  .set(function (uri) {
    const { route, uriName } = breakdownURI(uri, "-");
    this.route = route;
    this.uriName = uriName;
  });

CategorySchema.virtual("progress").get(function () {
  // check exercises 'solved'
  return [0, 50];
});

CategorySchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    return await Exercise.deleteMany({ category: this._id });
  }
);
// CategorySchema.pre('deleteOne', {document: true, query: false}, async function () {
//   return await Exercise.deleteMany({category: this._id});
// });


/**********EXPORTS********* */

exports.Category = mongoose.model("Category", CategorySchema);

/****** DEBUG & TESTS PURPOSES **********/

if (process.env.NODE_ENV === "test") {
  exports.makeCategoryURI = makeCategoryURI;
}
