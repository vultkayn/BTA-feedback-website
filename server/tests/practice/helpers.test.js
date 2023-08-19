const {
  DummyCategory,
  DummyCategoryUpdated,
  DummyExercise,
  DummyExerciseUpdated,
  DummyQuestions,
} = require("./dummies");

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

describe("check all helpers functions are OK", () => {
  const expectationsCat = [
    DummyCategory,
    DummyCategoryUpdated,
  ];

  const expectationsExo = [
    DummyExercise,
    DummyExerciseUpdated,
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

  test("test regexes", (done) => {
    for (const dummy of expectationsCat) {
      expect(routeRegex.test(dummy.route)).toBe(true);
      expect(routeRegex.test(dummy.uri)).toBe(true);
      expect(routeRegex.test(dummy.uriName)).toBe(true);
      expect(nameRegex.test(dummy.name)).toBe(true);
    }

    for (const dummy of expectationsExo) {
      expect(routeRegex.test(dummy.categoryURI)).toBe(true);
      expect(routeRegex.test(dummy.uriName)).toBe(true);
      expect(nameRegex.test(dummy.name)).toBe(true);
    }

    for (const dummy of DummyQuestions) {
      expect(titleRegex.test(dummy.title)).toBe(true);
    }

    for (const dummy of failures) {
      dummy.route && expect(routeRegex.test(dummy.route)).toBe(false);
      dummy.uri && expect(routeRegex.test(dummy.uri)).toBe(false);
      dummy.uriName && expect(routeRegex.test(dummy.uriName)).toBe(false);
      dummy.name && expect(nameRegex.test(dummy.name)).toBe(false);
    }
    done();
  });

  test("Parse user-friendly name to URL-friendly - makeURIName", () => {
    for (const dummy of expectationsCat) {
      expect(makeURIName(dummy.name)).toStrictEqual(dummy.uriName);
    }
    for (const dummy of expectationsExo) {
      expect(makeURIName(dummy.name)).toStrictEqual(dummy.uriName);
    }
  });

  test("URI construction for URL parameter. - makeCategoryURI", () => {
    for (const dummy of expectationsCat) {
      expect(makeCategoryURI(dummy.route, dummy.uriName)).toStrictEqual(
        dummy.uri
      );
    }
  });

  test("URI construction for URL parameter. - makeExerciseURI", () => {
    for (const dummy of expectationsExo) {
      expect(makeExerciseURI(dummy.categoryURI, dummy.name)).toStrictEqual(
        dummy.uri
      );
    }
  });

  test("Extract parent's route and URL-friendly name out of URI. - breakdownURI", () => {
    for (const dummy of expectationsCat) {
      expect(breakdownURI(dummy.uri)).toStrictEqual({
        route: dummy.route,
        uriName: dummy.uriName,
      });
    }
    for (const dummy of expectationsExo) {
      expect(breakdownURI(dummy.uri, "/")).toStrictEqual({
        route: dummy.categoryURI,
        uriName: dummy.uriName,
      });
    }
  });
});
