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
  // ensure DummyCategoryUpdated exists
  await request(app)
    .post(categoryEndpoint)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Cookie", sid_cookie)
    .send({
      name: DummyCategoryUpdated.name,
      uiRoute: DummyCategoryUpdated.uiRoute,
      description: DummyCategoryUpdated.description,
    });
  await request(app)
    .get(DummyCategoryUpdatedFullURL)
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

describe(`DELETE`, () => {
  describe("delete non-existent category", () => {
    test("check category is non-existent", async () =>
      await request(app)
        .get(categoryEndpoint + "inexistent")
        .set("Content-Type", "application/json")
        .expect(404, { errors: "category not found" }));
    test("attempt to delete - 404", async () =>
      await request(app)
        .delete(categoryEndpoint + "inexistent")
        .set("Content-Type", "application/json")
        .set("Cookie", sid_cookie)
        .expect(404));
  });

  describe("unauthentified - nonexistent", () => {
    test("check category is non-existent", async () =>
      await request(app)
        .get(categoryEndpoint + "inexistent")
        .set("Content-Type", "application/json")
        .expect(404, { errors: "category not found" }));
    test("attempt to delete - 401", async () =>
      await request(app)
        .delete(categoryEndpoint + "inexistent")
        .set("Content-Type", "application/json")
        .expect(401));
  });

  describe("unauthentified - existent", () => {
    test("verify existence", async () =>
      await request(app)
        .get(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .expect(200));
    test("attempt to delete - 401", async () =>
      await request(app)
        .delete(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .expect(401));
    test("check still there", async () =>
      await request(app) // Check Deletion did NOT happen
        .get(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .expect(200));
  });

  describe("delete existent", () => {
    test("verify existence", async () =>
      await request(app)
        .get(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .expect(200));
    test("verify child existence", async () =>
      await request(app)
        .get(ChildCategory.fullURL)
        .set("Content-Type", "application/json")
        .expect(200));
    test("delete it - 200", async () =>
      await request(app)
        .delete(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .set("Cookie", sid_cookie)
        .expect(200));
    test("verify deleted", async () =>
      await request(app) // Check Deletion did happen
        .get(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .expect(404, { errors: "category not found" }));
    test("verify subcategories were also deleted", async () =>
      await request(app)
        .get(ChildCategory.fullURL)
        .set("Content-Type", "application/json")
        .expect(404, { errors: "category not found" }));
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
