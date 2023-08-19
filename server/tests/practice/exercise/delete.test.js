const request = require("supertest");
const app = require("../../../app");
const {
  DummyCategory,
  DummyExercise,
  DummyQuestions,
  dumExerciseEndpoint,
  DummyCategoryFullURL,
  DummyExerciseFullURL,
  categoryEndpoint
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
      uiRoute: DummyCategory.uiRoute,
      description: DummyCategory.description,
    });
  // check that DummyCategory is settled
  await request(app)
    .get(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .expect(200)

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
    await request(app)
      .get(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .expect(200)
});

describe(`DELETE ${categoryEndpoint}:uri/ex/` + ":uriName", () => {
  test("delete non-existent exercise", async () => {
    await request(app)
      .get(dumExerciseEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "exercise not found" });
    await request(app)
      .delete(dumExerciseEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .expect(404);
  });

  test("unauthentified - nonexistent", async () => {
    await request(app)
      .get(dumExerciseEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "exercise not found" });
    await request(app)
      .delete(dumExerciseEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(401);
  });

  test("unauthentified - existent", async () => {
    await request(app)
      .get(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .expect(200);
    await request(app)
      .delete(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .expect(401);
    await request(app) // Check Deletion did NOT happen
      .get(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .expect(200);
  });

  test("delete existent", async () => {
    await request(app)
      .get(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .expect(200);
    await request(app)
      .delete(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .expect(200);
    await request(app) // Check Deletion did happen
      .get(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .expect(404, { errors: "exercise not found" });
  });
});


// TEARDOWN

afterAll(async () => {
  await request(app)
    .delete(DummyExerciseFullURL)
    .set("Content-Type", "application/json")
    .set("Cookie", sid_cookie)
  await request(app)
    .get(DummyExerciseFullURL)
    .set("Content-Type", "application/json")
    .expect(404, { errors: "exercise not found" });
  // check that DummyExercise is deleted
  await request(app)
    .delete(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .set("Cookie", sid_cookie)
  // check that DummyCategory is deleted
  await request(app)
    .get(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .expect(404);

  const { MongoStore } = require("../../../db/connection");
  await MongoStore.close();
});
