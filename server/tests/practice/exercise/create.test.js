const request = require("supertest");
const app = require("../../../app");
const {
  categoryEndpoint,
  dumExerciseEndpoint,
  DummyCategory,
  DummyExercise,
  DummyQuestions,
  DummyExerciseFullURL,
  DummyCategoryFullURL,
} = require("../dummies");

const emptyName = "";
const invalidName = "isItvalid?";
const nameTooLong = "abcdefghijklsmnopqerzIBIZEYACGNVVCJVFZEIRPYUZRY";

var priourbID = 0;
let sid_cookie = "";

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
      route: DummyCategory.route,
      description: DummyCategory.description,
    });
  // check that DummyCategory is settled
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

describe(`POST`, () => {
  const payload = {
    name: DummyExercise.name,
    questions: DummyQuestions,
    description: DummyExercise.description,
  };

  test("create into inexistent category", async () => {
    await request(app)
      .post(`${categoryEndpoint}inexistent-category/ex/`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send(payload)
      .expect(404, { errors: "category not found" });
  });
  test("create into root category", async () => {
    await request(app)
      .post(`${categoryEndpoint}ex/`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send(payload)
      .expect(404);
  });

  describe("invalid exercise name", () => {
    test("empty name", async () => {
      await request(app)
        .post(dumExerciseEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          ...payload,
          name: emptyName,
        })
        .expect((res) => {
          if (res.body?.errors?.name?.msg !== "name too short")
            throw new Error();
        });
    });
    test("name regex failure", async () => {
      await request(app)
        .post(dumExerciseEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          ...payload,
          name: invalidName,
        })
        .expect(400)
        .expect((res) => {
          if (res.body?.errors?.name?.msg !== "invalid characters")
            throw new Error();
        });
    });
    test("name too long", async () => {
      await request(app)
        .post(dumExerciseEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          ...payload,
          name: nameTooLong,
        })
        .expect(400)
        .expect((res) => {
          if (res.body?.errors?.name?.msg !== "name too long")
            throw new Error();
        });
    });
  });
  describe("invalid description", () => {
    test("empty description", async () => {
      await request(app)
        .post(dumExerciseEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          ...payload,
          description: "",
        })
        .expect((res) => {
          if (res.body?.errors?.description?.msg !== "description too short")
            throw new Error();
        });
    });
  });

  test("unauthorized", async () => {
    await request(app)
      .post(dumExerciseEndpoint)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(payload)
      .expect(401);
  });

  describe("valid creation", () => {
    beforeAll(async () => {
      await request(app)
        .delete(DummyExerciseFullURL)
        .set("Content-Type", "application/json")
        .set("Cookie", sid_cookie);
      await request(app)
        .get(DummyExerciseFullURL)
        .set("Content-Type", "application/json")
        .expect(404, { errors: "exercise not found" });
    });

    // check that DummyExercise is deleted)
    test("check DummyExercise does not exist", async () =>
      await request(app)
        .get(DummyExerciseFullURL)
        .set("Content-Type", "application/json")
        .expect(404, { errors: "exercise not found" }));
    test("create DummyExercise", async () =>
      await request(app)
        .post(dumExerciseEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send(payload)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toStrictEqual(DummyExercise.name);
          expect(res.body.uriName).toStrictEqual(DummyExercise.uriName);
          expect(res.body.description).toStrictEqual(DummyExercise.description);
          expect(res.body.uri).toStrictEqual(DummyExercise.uri);
          expect(res.body.category).toBeDefined();
          expect(res.body.categoryURI).toStrictEqual(DummyExercise.categoryURI);
          expect(res.body.questionsIDs).toBeInstanceOf(Array);
          expect(res.body.questionsIDs.length).toStrictEqual(
            payload.questions.length
          );
          expect(res.body.lastModified).toBeDefined();
          expect(res.body.lastModifiedBy).toBeDefined();

          // populate DummyExercise questionsIDs for later tests
          DummyExercise.questionsIDs = res.body.questionsIDs.sort();
          DummyExercise.category = res.body.category;
          DummyExercise.lastModifiedBy = res.body.lastModifiedBy;
          priourbID = res.body.lastModifiedBy;
        }));
    test("check DummyExercise was correctly created", async () =>
      await request(app)
        .get(DummyExerciseFullURL)
        .set("Content-Type", "application/json")
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toStrictEqual(DummyExercise.name);
          expect(res.body.uriName).toStrictEqual(DummyExercise.uriName);
          expect(res.body.description).toStrictEqual(DummyExercise.description);
          expect(res.body.uri).toStrictEqual(DummyExercise.uri);
          expect(res.body.category).toStrictEqual(DummyExercise.category);
          expect(res.body.categoryURI).toStrictEqual(DummyExercise.categoryURI);
          expect(res.body.kind).toBe(1);
          expect(res.body.solved).toBe(false);
          expect(res.body.questionsIDs.sort()).toEqual(
            DummyExercise.questionsIDs
          );
        }));
  });

  describe("cannot create one that exists already", () => {
    test("check that DummyExercise exists", async () =>
      await request(app)
        .get(DummyExerciseFullURL)
        .set("Content-Type", "application/json")
        .expect(200));
    test("verify DummyExercise cannot be created twice", async () =>
      await request(app)
        .post(dumExerciseEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send(payload)
        .expect(400, { errors: "exercise exists already" }));
  });
});

// TEARDOWN

afterAll(async () => {
  await request(app)
    .delete(DummyExerciseFullURL)
    .set("Content-Type", "application/json")
    .set("Cookie", sid_cookie);
  await request(app)
    .get(DummyExerciseFullURL)
    .set("Content-Type", "application/json")
    .expect(404, { errors: "exercise not found" });
  // check that DummyExercise is deleted
  await request(app)
    .delete(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .set("Cookie", sid_cookie);
  // check that DummyCategory is deleted
  await request(app)
    .get(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .expect(404, { errors: "category not found" });

  const { MongoStore } = require("../../../db/connection");
  await MongoStore.close();
});
