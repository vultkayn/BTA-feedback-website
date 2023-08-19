const request = require("supertest");
const app = require("../../../../app");
const {
  DummyCategory,
  DummyExercise,
  DummyQuestions,
  dumExerciseEndpoint,
  DummyCategoryFullURL,
  DummyExerciseFullURL,
  categoryEndpoint,
} = require("../../dummies");

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
    });
  await request(app)
    .get(DummyExerciseFullURL)
    .set("Content-Type", "application/json")
    .expect(200)
    .expect((res) => {
      DummyExercise.questionsIDs = res.body.questionsIDs.sort();
    });
});

describe("DELETE exerciceURL/q/:qID", () => {
  describe("test shortcomings", () => {
    afterEach(async () => {
      // verify that Exercise's questions were left untouched
      await request(app)
        .get(DummyExerciseFullURL + "/questions")
        .set("Content-Type", "application/json")
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(DummyQuestions.length);
          let ids = [];
          for (let q of res.body) {
            ids.push(q._id);
          }
          expect(ids.sort()).toStrictEqual(DummyExercise.questionsIDs.sort());
        });
    });

    test("unauthentified but inexistent Exercise", async () => {
      await request(app)
        .delete(dumExerciseEndpoint + "inexistent/q/" + DummyExercise.questionsIDs[0])
        .set("Content-Type", "application/json")
        .expect(401);
    });

    test("unauthentified but Question exists", async () => {
      await request(app)
        .delete(DummyExerciseFullURL + "/q/" + DummyExercise.questionsIDs[0])
        .set("Content-Type", "application/json")
        .expect(401);
    });

    test("authentified but inexistent Question", async () => {
      await request(app)
        .delete(dumExerciseEndpoint + "inexistent/q/" + "70007")
        .set("Cookie", sid_cookie)
        .set("Content-Type", "application/json")
        .expect(404, { errors: "exercise not found" });
    });
  });

  describe("Delete from DummyExercise's", () => {
    test("delete a question", async () => {
      await request(app)
        .delete(DummyExerciseFullURL + "/q/" + DummyExercise.questionsIDs[0])
        .set("Content-Type", "application/json")
        .set("Cookie", sid_cookie)
        .expect(200);
    });
    test("verify deletion happened as expected", async () => {
      await request(app)
        .get(DummyExerciseFullURL + "/questions")
        .set("Content-Type", "application/json")
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(DummyQuestions.length - 1);
        });
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

  const { MongoStore } = require("../../../../db/connection");
  await MongoStore.close();
});
