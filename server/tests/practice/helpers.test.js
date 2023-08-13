const sectionsDummy = [
  {
    title: "Exercises",
    listing: [
      {
        uri: "memory-pointers/exo1",
        name: "Exercise 1",
        solved: false,
        kind: 1,
      },
      {
        uri: "memory-pointers/exercise-2",
        name: "Exercise 2",
        solved: true,
        kind: 1,
      },
      { uri: "pointers/exo3", name: "exo3", solved: false, kind: 1 },
      { uri: "memory/exo4", name: "exo4", solved: true, kind: 1 },
      { uri: "c++/exo12", name: "exo12", solved: false, kind: 1 },
      { uri: "memory/exercise5", name: "exercise5", solved: false, kind: 1 },
      { uri: "memory/exo5", name: "exo5", solved: false, kind: 1 },
      {
        uri: "garbage_collector/exo46",
        name: "exo46",
        solved: false,
        kind: 1,
      },
      { uri: "oop/exo6", name: "exo6", solved: false, kind: 1 },
    ],
  },
  {
    title: "Subcategories",
    listing: [
      { uri: "pointers", name: "pointers", solved: false, kind: 0 }, // FIXME uri should include name too, fix above in the functions too
      { uri: "memory", name: "memory", solved: false, kind: 0 },
      { uri: "oop", name: "oop", solved: true, kind: 0 },
      {
        uri: "garbage_collector",
        name: "garbage collector",
        solved: false,
        kind: 0,
      },
      { uri: "c", name: "c", solved: false, kind: 0 },
      { uri: "c++", name: "c++", solved: false, kind: 0 },
      { uri: "c++-types", name: "types", solved: true, kind: 0 },
      { uri: "pointers", name: "pointers", solved: false, kind: 0 },
      { uri: "memory", name: "memory", solved: false, kind: 0 },
      { uri: "oop", name: "oop", solved: false, kind: 0 },
      {
        uri: "garbage_collector",
        name: "garbage collector",
        solved: false,
        kind: 0,
      },
      { uri: "c2", name: "c", solved: false, kind: 0 },
      { uri: "c++2", name: "c++", solved: false, kind: 0 },
      { uri: "types2", name: "types", solved: false, kind: 0 },
    ],
  },
];

const DummyCategory = {
  name: "Duper_Dummy-09 SuperTest++",
  uriName: "Duper_Dummy09+SuperTest",
  route: "dummyCategory_Parent",
  uri: "dummyCategory_Parent-Duper_Dummy09+SuperTest",
  description: "Just any other SuperTest category description",
  sections: sectionsDummy,
};

const DummyCategoryUpdated = {
  name: "New name for dummy7-1",
  uriName: "New+name+for+dummy71",
  route: "new_Parent1-newP2",
  uri: "new_Parent1-newP2-New+name+for+dummy71",
  description: "New description",
  sections: sectionsDummy,
};

const DummyExercise = {
  
}

/* Test helpers  */

const {
  makeURIName,
  breakdownURI,
  routeRegex,
  nameRegex,
  titleRegex,
} = require("../../models/helpers/practice");
const { makeCategoryURI } = require("../../models/categoryModel");
const { makeExerciseURI } = require("../../models/exerciseModel");

describe("helpers", () => {
  const expectations = [
    {
      name: DummyCategory.name,
      uriName: DummyCategory.uriName,
      route: DummyCategory.route,
      uri: DummyCategory.uri,
    },
    {
      name: "-Dummy--name- +i0s_all_+",
      uriName: "Dummyname+i0s_all_",
      route: "dummyCategory_Parent",
      uri: "dummyCategory_Parent-Dummyname+i0s_all_",
    },
    {
      name: DummyCategoryUpdated.name,
      uriName: DummyCategoryUpdated.uriName,
      route: DummyCategoryUpdated.route,
      uri: DummyCategoryUpdated.uri,
    },
  ];

  const failures = [
    {
      route: "dummyCategory_Parent-d-", // cannot end with -
      uri: "dummyCategory_Parent--d-Dummyname+i0s_all_", // cannot have successive -
    },
    {
      route: "-dummyCategory_Parent-d", // cannot begin with -
    },
  ];

  test("test regexes", () => {
    for (const dummy of expectations) {
      expect(routeRegex.test(dummy.route)).toBe(true);
      expect(routeRegex.test(dummy.uri)).toBe(true);
      expect(routeRegex.test(dummy.uriName)).toBe(true);
      expect(nameRegex.test(dummy.name)).toBe(true);
      expect(nameRegex.test(dummy.uriName)).toBe(true);
    }

    for (const dummy of failures) {
      dummy.route && expect(routeRegex.test(dummy.route)).toBe(false);
      dummy.uri && expect(routeRegex.test(dummy.uri)).toBe(false);
      dummy.uriName && expect(routeRegex.test(dummy.uriName)).toBe(false);
      dummy.name && expect(nameRegex.test(dummy.name)).toBe(false);
      dummy.uriName && expect(nameRegex.test(dummy.uriName)).toBe(false);
    }
  });

  test("Parse user-friendly name to URL-friendly - makeURIName", () => {
    for (const dummy of expectations) {
      expect(makeURIName(dummy.name)).toStrictEqual(dummy.uriName);
    }
  });

  test("URI construction for URL parameter. - makeCategoryURI", () => {
    for (const dummy of expectations) {
      expect(makeCategoryURI(dummy.route, dummy.uriName)).toStrictEqual(
        dummy.uri
      );
    }
  });

  test("Extract parent's route and URL-friendly name out of URI. - breakdownURI", () => {
    for (const dummy of expectations) {
      expect(breakdownURI(dummy.uri)).toStrictEqual({
        route: dummy.route,
        uriName: dummy.uriName,
      });
    }
  });
});


module.exports = {
  DummyCategory,
  DummyCategoryUpdated
}