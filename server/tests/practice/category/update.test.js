const request = require("supertest");
const app = require("../../../app");

const {
  DummyCategory,
  DummyCategoryUpdated,
  categoryEndpoint,
  DummyCategoryFullURL,
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
  await request(app)
    .get(DummyCategoryFullURL)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
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

  // ensure DummyCategoryUpdate does NOT exist
  await request(app)
    .get(categoryEndpoint + DummyCategoryUpdated.uri)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(404);
});

describe("PUT - Update category" , () => {
  test("unauthentified - existent", async () => {
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
    await request(app)
      .put(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .expect(401);
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

  test("unauthentified - inexistent", async () => {
    await request(app)
      .put(categoryEndpoint + "inexistent")
      .set("Content-Type", "application/json")
      .expect(401);
  });

  test("check spurious parameters are ignored", async () => {
    await request(app)
      .put(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .send({ uriName: "must be ignored", uri: "must be ignored" })
      .expect(200)
      .expect((res) => {
        expect(res.body.uriName).toStrictEqual(DummyCategory.uriName);
        expect(res.body.route).toStrictEqual(DummyCategory.route);
        expect(res.body.uri).toStrictEqual(DummyCategory.uri);
      });
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

  describe("valid update", () => {
    test("update Dummy to DummyUpdated", async () =>
      await request(app)
        .put(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          name: DummyCategoryUpdated.name,
          route: DummyCategoryUpdated.route,
          description: DummyCategoryUpdated.description,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toStrictEqual(DummyCategoryUpdated.name);
          expect(res.body.uriName).toStrictEqual(DummyCategoryUpdated.uriName);
          expect(res.body.route).toStrictEqual(DummyCategoryUpdated.route);
          expect(res.body.uri).toStrictEqual(DummyCategoryUpdated.uri);
          expect(res.body.description).toStrictEqual(
            DummyCategoryUpdated.description
          );
        }));
    test("check Dummy URL not found", async () =>
      await request(app) //
        .get(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .expect(404));
    test("check DummyUpdated now exists", async () =>
      await request(app)
        .get(categoryEndpoint + DummyCategoryUpdated.uri)
        .set("Content-Type", "application/json")
        .expect(200));
  });

  describe("update never overrides a category", () => {
    // setup create temporary dummy
    beforeAll(async () => {
      await request(app)
        .post(categoryEndpoint)
        .set("Content-Type", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          name: DummyCategory.name,
          route: DummyCategory.route,
          description: DummyCategory.description,
        });
      await request(app).get(DummyCategoryFullURL).expect(200);
    });

    test("Overriding oneself isn't an override", async () =>
      await request(app)
        .put(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          name: DummyCategory.name,
          route: DummyCategory.route,
        })
        .expect(200));

    // Going on with Update would override DummyCategoryUpdated
    test("override DummyCategoryUpdated with DummyCategory", async () =>
      await request(app)
        .put(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          name: DummyCategoryUpdated.name,
          route: DummyCategoryUpdated.route,
          description: DummyCategoryUpdated.description,
        })
        .expect(400, { errors: "cannot override category" }));

    test("Check DummyCategory was left untouched", async () =>
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
        }));
    test("Check DummyCategoryUpdated was left untouched", async () =>
      await request(app)
        .get(categoryEndpoint + DummyCategoryUpdated.uri)
        .set("Content-Type", "application/json")
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toStrictEqual(DummyCategoryUpdated.name);
          expect(res.body.uriName).toStrictEqual(DummyCategoryUpdated.uriName);
          expect(res.body.route).toStrictEqual(DummyCategoryUpdated.route);
          expect(res.body.uri).toStrictEqual(DummyCategoryUpdated.uri);
          expect(res.body.description).toStrictEqual(
            DummyCategoryUpdated.description
          );
          expect(res.body.kind).toBe(0);
          expect(res.body.solved).toBeDefined();
          expect(res.body.sections).toBeInstanceOf(Array);
        }));
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
  // delete DummyCategoryUpdated
  await request(app)
    .delete(categoryEndpoint + DummyCategoryUpdated.uri)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Cookie", sid_cookie);
  await request(app)
    .get(categoryEndpoint + DummyCategoryUpdated.uri)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(404);

  // const { MongoStore } = require("../../../db/connection");
  // await MongoStore.close();
});
