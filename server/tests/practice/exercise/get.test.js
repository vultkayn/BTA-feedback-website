const request = require("supertest");
const app = require("../../../app");
const {
  DummyCategory,
  DummyExercise,
  DummyQuestions,
  dumExerciseEndpoint,
  DummyCategoryFullURL,
  DummyExerciseFullURL,
  categoryEndpoint,
} = require("../dummies");

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
    .expect(200);

  // ensure DummyExercise exists
  await request(app)
    .post(dumExerciseEndpoint)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Cookie", sid_cookie)
    .send({
      name: DummyExercise.name,
      questions: DummyQuestions,
      description: DummyExercise.description,
    })
    .expect(200)
    .expect((res) => {
      DummyExercise.questionsIDs = res.body.questionsIDs;
    });
});

describe(`GET ${categoryEndpoint}:uri/ex/:uriName`, () => {
  test("shallow Dummy details", async () => {
    await request(app)
      .get(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toStrictEqual(DummyExercise.name);
        expect(res.body.uriName).toStrictEqual(DummyExercise.uriName);
        expect(res.body.description).toStrictEqual(DummyExercise.description);
        expect(res.body.uri).toStrictEqual(DummyExercise.uri);
        expect(res.body.category).toBeDefined();
        expect(res.body.categoryURI).toStrictEqual(DummyExercise.categoryURI);
        expect(res.body.kind).toBe(1);
        expect(res.body.solved).toBe(false);
        expect(res.body).toHaveProperty("questionsIDs");
        expect(res.body).toHaveProperty("lastModified");
        expect(res.body).toHaveProperty("lastModifiedBy");
      })
      .expect((res) => {
        expect(res.body.questionsIDs).toBeInstanceOf(Array);
        expect(res.body.questionsIDs).toHaveLength(DummyQuestions.length);
        let ids = [];
        for (let q of res.body.questionsIDs) {
          ids.push(q);
        }
        expect(ids.sort()).toStrictEqual(DummyExercise.questionsIDs.sort());
      });
  });

  test("inexistent exercise", async () => {
    await request(app)
      .get(dumExerciseEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "exercise not found" });
  });
});

describe(`GET full details`, () => {
  test("full Dummy details (query variable 'full' defined)", async () => {
    await request(app)
      .get(DummyExerciseFullURL + "?full")
      .set("Content-Type", "application/json")
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toStrictEqual(DummyExercise.name);
        expect(res.body.uriName).toStrictEqual(DummyExercise.uriName);
        expect(res.body.description).toStrictEqual(DummyExercise.description);
        expect(res.body.uri).toStrictEqual(DummyExercise.uri);
        expect(res.body.category).toBeDefined();
        expect(res.body.categoryURI).toStrictEqual(DummyExercise.categoryURI);
        expect(res.body.kind).toBe(1);
        expect(res.body.solved).toBe(false);
        expect(res.body).toHaveProperty("questionsIDs");
        expect(res.body).toHaveProperty("lastModified");
        expect(res.body).toHaveProperty("lastModifiedBy");
      })
      .expect((res) => {
        expect(res.body.questionsIDs).toBeInstanceOf(Array);
        expect(res.body.questionsIDs).toHaveLength(DummyQuestions.length);
        let ids = [];
        console.debug("received questions", res.body.questionsIDs);
        for (let q of res.body.questionsIDs) {
          ids.push(q._id);
          expect(q).toHaveProperty("title");
          expect(q).toHaveProperty("statement");
          expect(q).toHaveProperty("choices");
          expect(q).toHaveProperty("choices.format");
          expect(q).toHaveProperty("choices.list");
        }
        expect(ids.sort()).toStrictEqual(DummyExercise.questionsIDs.sort());
      });
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
    .expect(404);

  const { MongoStore } = require("../../../db/connection");
  await MongoStore.close();
});
