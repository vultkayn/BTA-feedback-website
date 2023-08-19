const request = require("supertest");
const app = require("../../app");
const {
  DummyCategory,
  DummyCategoryUpdated,
  DummyExercise,
  DummyQuestions,
  DummyExerciseFullURL,
} = require("./dummies");

const catEndPoint = "/api/practice/category/";
const dumExerciseEndpoint = `${catEndPoint}${DummyCategory.uri}/ex/`;

const emptyName = "";
const invalidName = "isItvalid?";
const nameTooLong = "abcdefghijklsmnopqerzIBIZEYACGNVVCJVFZEIRPYUZRY";

const descriptionXSS = "<b>can you</b>def?";

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
    .post(catEndPoint)
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
    .get(catEndPoint + DummyCategory.uri)
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

  test(`${catEndPoint}inexistent_category/ex/`, async () => {
    await request(app)
      .post(`${catEndPoint}inexistent-category/ex/`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send(payload)
      .expect(404, { errors: "category not found" });
  });
  test(`${catEndPoint}ex/`, async () => {
    await request(app)
      .post(`${catEndPoint}ex/`)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send(payload)
      .expect(404);
  });

  describe("invalid name", () => {
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
    test("regex failure", async () => {
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

  test("valid creation", async () => {
    console.debug ("at @", dumExerciseEndpoint);
    await request(app)
      .get(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .expect(404, { errors: "exercise not found" });
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
      });
    // await request(app)
    //   .get(DummyExerciseFullURL)
    //   .set("Content-Type", "application/json")
    //   .expect(200)
    //   .expect((res) => {
    //     expect(res.body.name).toStrictEqual(DummyExercise.name);
    //     expect(res.body.uriName).toStrictEqual(DummyExercise.uriName);
    //     expect(res.body.description).toStrictEqual(DummyExercise.description);
    //     expect(res.body.uri).toStrictEqual(DummyExercise.uri);
    //     expect(res.body.category).toStrictEqual(DummyExercise.category);
    //     expect(res.body.categoryURI).toStrictEqual(DummyExercise.categoryURI);
    //     expect(res.body.kind).toBe(1);
    //     expect(res.body.solved).toBe(false);
    //     expect(res.body.questionsIDs.sort()).toEqual(
    //       DummyExercise.questionsIDs
    //     );
    //   });
  });

  test("exercise already exists", async () => {
    await request(app)
      .get(DummyExerciseFullURL)
      .set("Content-Type", "application/json")
      .expect(200);
    await request(app)
      .post(dumExerciseEndpoint)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send(payload)
      .expect(400, { errors: "exercise exists already" });
  });
});

describe(`GET ${catEndPoint}:uri/ex/:uriName`, () => {
  test("get existent", async () => {
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
        expect(res.body.questionsIDs?.sort()).toEqual(
          DummyExercise.questionsIDs
        );
        expect(res.body.lastModified).toBeDefined();
        expect(res.body.lastModifiedBy).toBe(priourbID);
      });
  });

  test("get inexistent", async () => {
    await request(app)
      .get(dumExerciseEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "exercise not found" });
  });
});

describe(`DELETE ${catEndPoint}:uri/ex/` + ":uriName", () => {
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

test("teardown", async () => {
  await request(app)
    .delete(catEndPoint + DummyCategory.uri)
    .set("Content-Type", "application/json")
    .set("Cookie", sid_cookie)
    .expect(200)
  // check that DummyCategory is deleted
  await request(app)
    .get(catEndPoint + DummyCategory.uri)
    .set("Content-Type", "application/json")
    .expect(404)

  const { MongoStore } = require("../../db/connection");
  await MongoStore.close()
});
