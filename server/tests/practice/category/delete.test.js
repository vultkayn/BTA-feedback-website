const request = require("supertest");
const app = require("../../../app");

const {
  DummyCategory,
  DummyCategoryUpdated,
  categoryEndpoint,
  DummyCategoryFullURL,
  DummyCategoryUpdatedFullURL,
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
      route: DummyCategory.route,
      description: DummyCategory.description,
    });
  await request(app)
    .get(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(200);
});

describe(`DELETE`, () => {
  test("delete non-existent category", async () => {
    await request(app)
      .get(categoryEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "category not found" });
    await request(app)
      .delete(categoryEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .expect(404);
  });

  test("unauthentified - nonexistent", async () => {
    await request(app)
      .get(categoryEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "category not found" });
    await request(app)
      .delete(categoryEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(401);
  });

  test("unauthentified - existent", async () => {
    await request(app)
      .get(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .expect(200);
    await request(app)
      .delete(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .expect(401);
    await request(app) // Check Deletion did NOT happen
      .get(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .expect(200);
  });

  test("delete existent", async () => {
    await request(app)
      .get(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .expect(200);
    await request(app)
      .delete(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .expect(200);
    await request(app) // Check Deletion did happen
      .get(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .expect(404, { errors: "category not found" });
  });

  test(`delete root`, async () => {
    await request(app)
      .delete(categoryEndpoint)
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .expect(404);
  });
});

afterAll(async () => {
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
  // delete DummyCategoryUpdated
  await request(app)
    .delete(DummyCategoryUpdatedFullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Cookie", sid_cookie);
  await request(app)
    .get(DummyCategoryUpdatedFullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(404);
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

  // const { MongoStore } = require("../../../db/connection");
  // await MongoStore.close();
});
