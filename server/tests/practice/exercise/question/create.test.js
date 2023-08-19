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

const insertedQuestion = {
  title: "A new Question sees itself inserted {#new!}",
  statement: "How to describe a comprehensive exercise",
  explanation: "something concise but precise",
  language: "java",
  languageSnippet: `include <iostream>
  int main()
  {
    std::cout << "a certainly not very intuitive function name" << std::endl;
    return 0;
  }`,
  choices: {
    format: "radio",
    list: [
      {
        name: "yes",
        label: "yes",
        answer: true,
      },
      {
        name: "negative",
        label: "Totally not",
        answer: false,
      },
    ],
  },
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

describe("POST exerciceURL/q", () => {
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
        .post(dumExerciseEndpoint + "inexistent/q")
        .set("Content-Type", "application/json")
        .send(insertedQuestion)
        .expect(401);
    });

    test("unauthentified but Exercise exists", async () => {
      await request(app)
        .post(DummyExerciseFullURL + "/q")
        .send(insertedQuestion)
        .set("Content-Type", "application/json")
        .expect(401);
    });

    test("authentified but inexistent Exercise", async () => {
      await request(app)
        .post(dumExerciseEndpoint + "inexistent/q")
        .set("Cookie", sid_cookie)
        .set("Content-Type", "application/json")
        .send(insertedQuestion)
        .expect(404, { errors: "exercise not found" });
    });
  });

  describe("Insert into DummyExercise's", () => {
    test("insert a new question into DummyExercise", async () => {
      await request(app)
        .post(DummyExerciseFullURL + "/q")
        .set("Content-Type", "application/json")
        .set("Cookie", sid_cookie)
        .send(insertedQuestion)
        .expect(200);
    });
    test("verify insertion happened as expected", async () => {
      await request(app)
        .get(DummyExerciseFullURL + "/questions")
        .set("Content-Type", "application/json")
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(DummyQuestions.length + 1);
          const questions = res.body.filter(
            (v) => !DummyExercise.questionsIDs.includes(v._id)
          );
          expect(questions).toHaveLength(1);
          const inserted = questions[0];
          expect(inserted).toHaveProperty("title", insertedQuestion.title);
          expect(inserted).toHaveProperty(
            "statement",
            insertedQuestion.statement
          );
          expect(inserted).toHaveProperty(
            "explanation",
            insertedQuestion.explanation
          );
          expect(inserted).toHaveProperty(
            "language",
            insertedQuestion.language
          );
          expect(inserted).toHaveProperty(
            "languageSnippet",
            insertedQuestion.languageSnippet
          );
          expect(inserted).toHaveProperty(
            "choices.format",
            insertedQuestion.choices.format
          );
          expect(inserted).toHaveProperty("choices.list");
          expect(inserted.choices.list).toBeInstanceOf(Array);
          expect(inserted.choices.list).toHaveLength(insertedQuestion.choices.list.length);
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
