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
  makeURIRoute,
  revertURI,
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
      route: "dummyCategory-Parent_d_", // cannot end with category separator '_'
      uri: "dummyCategory-Parent__d_Dummyname+i0sall", // cannot have successive separators '_'
    },
    {
      route: "_dummyCategory-Parent_d", // cannot begin with separator '_'
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

  test("Parse user-friendly name to URL-friendly - makeURIName", () => {
    for (const dummy of expectationsCat) {
      expect(makeURIRoute(dummy.uiRoute)).toStrictEqual(dummy.route);
    }
    for (const dummy of expectationsExo) {
      expect(makeURIRoute(dummy.uiCategoryURI)).toStrictEqual(dummy.categoryURI);
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
  test("An URI-friendly is fully revertable to a User-friendly version - revertURI", () => {
    for (const dummy of expectationsCat) {
      expect(revertURI(dummy.uri)).toStrictEqual({
        uiRoute: dummy.uiRoute,
        name: dummy.name,
      });
    }
    for (const dummy of expectationsExo) {
      expect(revertURI(dummy.uri, "/")).toStrictEqual({
        uiRoute: dummy.uiCategoryURI,
        name: dummy.name,
      });
    }
  });
});
