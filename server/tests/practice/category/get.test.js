const request = require("supertest");
const app = require("../../../app");

const {
  DummyCategory,
  categoryEndpoint,
  DummyCategoryFullURL,
  practiceEndpoint,
  DummyExercise,
  DummyExerciseUpdated,
  DummyQuestions,
} = require("../dummies");

let sid_cookie = "";
const ChildCategory = {
  name: "child category",
  uriName: "child+category",
  route: DummyCategory.uri,
  uiRoute: "/dummy-Category Parent/Duper-Dummy-09 SuperTest/",
  uri: DummyCategory.uri + "_child+category",
  description: "this is a subcategory of DummyCategory",
  fullURL: DummyCategoryFullURL + "_child+category",
};

beforeAll(async () => {
  await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send({
      univID: "priourb",
      password: "January01!",
    })
    .expect(function (res) {
      sid_cookie = res.headers["set-cookie"];
    });

  // ensure DummyCategory exists
  await request(app)
    .post(categoryEndpoint)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Cookie", sid_cookie)
    .send({
      name: DummyCategory.name,
      uiRoute: DummyCategory.uiRoute,
      description: DummyCategory.description,
    });
  await request(app)
    .get(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(200);
  // ensure ChildCategory exists
  await request(app)
    .post(categoryEndpoint)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Cookie", sid_cookie)
    .send({
      name: ChildCategory.name,
      uiRoute: ChildCategory.uiRoute,
      description: ChildCategory.description,
    });
  await request(app)
    .get(ChildCategory.fullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(200);
});

function checkSection(section, name) {
  if (section == null) throw new Error("section is null or undefined");

  if (!("title" in section)) throw new Error("missing section title");
  if (section.title !== name)
    throw new Error(`expected title '${name}' got '${section.title}'`);
  if (!Array.isArray(section.listing))
    throw new Error("missing section listing");
}

function checkCategory(res) {
  if (typeof res.body.uri !== "string") throw new Error("missing uri");
  if (typeof res.body.route !== "string") throw new Error("missing route");
  if (!Array.isArray(res.body.sections)) throw new Error("missing sections");
  if (res.body.sections.length === 0) throw new Error("no subsections");
  if (typeof res.body.name !== "string" || res.body.name.length === 0)
    throw new Error("missing name");
  if ("description" in res.body && typeof res.body.description !== "string")
    throw new Error("missing description");
}

test("GET /api/practice/categories - List categories at root", async () => {
  await request(app)
    .get(practiceEndpoint + "categories")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(200)
    .expect(function (res) {
      checkCategory(res);
      checkSection(res.body.sections[0], "Subcategories");
    });
});

describe(`GET /api/practice/category/:uri`, () => {
  test("get existent", async () => {
    await request(app)
      .get(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toStrictEqual(DummyCategory.name);
        expect(res.body.uriName).toStrictEqual(DummyCategory.uriName);
        expect(res.body.route).toStrictEqual(DummyCategory.route);
        expect(res.body.uri).toStrictEqual(DummyCategory.uri);
        expect(res.body.description).toStrictEqual(DummyCategory.description);
        expect(res.body.kind).toBe(0);
        expect(res.body.solved).toBeDefined();
        expect(res.body.sections).toBeInstanceOf(Array);
      });
  });

  test("get inexistent", async () => {
    await request(app)
      .get(categoryEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "category not found" });
  });
});

describe(`GET /api/practice/category/:uri/exercises`, () => {
  beforeAll(async () => {
    // populate some exercises
    await request(app)
      .post(`${DummyCategoryFullURL}/ex/`)
      .set("Cookie", sid_cookie)
      .set("Content-Type", "application/json")
      .send({
        name: DummyExercise.name,
        description: DummyExercise.description,
        questions: DummyQuestions,
      });
    await request(app)
      .get(`${DummyCategoryFullURL}/ex/${DummyExercise.uriName}`)
      .expect(200);

    await request(app)
      .post(`${DummyCategoryFullURL}/ex/`)
      .set("Cookie", sid_cookie)
      .set("Content-Type", "application/json")
      .send({
        name: DummyExerciseUpdated.name,
        description: DummyExerciseUpdated.description,
        questions: DummyQuestions,
      });
    await request(app)
      .get(`${DummyCategoryFullURL}/ex/${DummyExerciseUpdated.uriName}`)
      .expect(200);

    await request(app)
      .post(`${ChildCategory.fullURL}/ex/`)
      .set("Cookie", sid_cookie)
      .set("Content-Type", "application/json")
      .send({
        name: DummyExercise.name,
        description: DummyExercise.description,
        questions: DummyQuestions,
      });
    await request(app)
      .get(`${ChildCategory.fullURL}/ex/${DummyExercise.uriName}`)
      .expect(200);
  });

  describe("list exercises under category", () => {
    test("check that we get all exercices", async () =>
      await request(app)
        .get(DummyCategoryFullURL + "/exercises")
        .set("Content-Type", "application/json")
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(2);
          console.log("received Exercises are", res.body);
        }));
    test("listing inexistent category returns 404", async () => {
      await request(app)
        .get(categoryEndpoint + "inexistent/exercises")
        .set("Content-Type", "application/json")
        .expect(404, { errors: "category not found" });
    });
  });

  afterAll(async () => {
    // cleanup exercises
    await request(app)
      .delete(`${DummyCategoryFullURL}/ex/${DummyExercise.uriName}`)
      .set("Cookie", sid_cookie)
      .set("Content-Type", "application/json");
    await request(app)
      .get(`${DummyCategoryFullURL}/ex/${DummyExercise.uriName}`)
      .expect(404);

    await request(app)
      .delete(`${DummyCategoryFullURL}/ex/${DummyExerciseUpdated.uriName}`)
      .set("Cookie", sid_cookie)
      .set("Content-Type", "application/json");
    await request(app)
      .get(`${DummyCategoryFullURL}/ex/${DummyExerciseUpdated.uriName}`)
      .expect(404);

    await request(app)
      .delete(`${ChildCategory.fullURL}/ex/${DummyExercise.uriName}`)
      .set("Cookie", sid_cookie)
      .set("Content-Type", "application/json");
    await request(app)
      .get(`${ChildCategory.fullURL}/ex/${DummyExercise.uriName}`)
      .expect(404);
  });
});

afterAll(async () => {
  // delete DummyCategory
  await request(app)
    .delete(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Cookie", sid_cookie);
  await request(app)
    .get(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(404);
  // delete ChildCategory
  await request(app)
    .delete(ChildCategory.fullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Cookie", sid_cookie);
  await request(app)
    .get(ChildCategory.fullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(404);

  // const { MongoStore } = require("../../../db/connection");
  // await MongoStore.close();
});
