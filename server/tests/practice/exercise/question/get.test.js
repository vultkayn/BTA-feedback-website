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
let DummyQuestionsIDs = [];

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
      DummyQuestionsIDs = res.body.questionsIDs;
    });
});

describe("List all DummyExercise questions", () => {
  test("List Dummy's", async () => {
    await request(app)
      .get(DummyExerciseFullURL + "/questions")
      .set("Content-Type", "application/json")
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body).toHaveLength(DummyQuestions.length);
        let ids = [];
        console.debug ("received", res.body);
        for (let q of res.body) {
          ids.push(q._id);
          expect(q).toHaveProperty("title");
          expect(q).toHaveProperty("statement");
          expect(q).toHaveProperty("choices");
          expect(q).toHaveProperty("choices.format");
          expect(q).toHaveProperty("choices.list");
        }
        expect(ids.sort()).toStrictEqual(DummyQuestionsIDs.sort());
      });
  });

  test("inexistent exercise", async () => {
    await request(app)
      .get(`${DummyCategoryFullURL}`)
      .set("Content-Type", "application/json")
      .expect(200);
    await request(app)
      .get(`${DummyCategoryFullURL}/ex/inexistent/questions`)
      .set("Content-Type", "application/json")
      .expect(404, { errors: "exercise not found" });
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
