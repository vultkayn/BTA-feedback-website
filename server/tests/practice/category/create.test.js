const request = require("supertest");
const app = require("../../../app");

const {
  DummyCategory,
  categoryEndpoint,
  DummyCategoryFullURL,
} = require("../dummies");

const invalidRoute = "isItvalid.";
const emptyName = "";
const invalidName = "isItvalid?";
const nameTooLong = "abcdefghijklsmnopqerzIBIZEYACGNVVCJVFZEIRPYUZRY";

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
});

describe(`POST - Create category`, () => {
  const payload = {
    name: DummyCategory.name,
    route: DummyCategory.route,
    description: DummyCategory.description,
  };

  describe("torture body.name", () => {
    test("empty name", async () => {
      await request(app)
        .post(categoryEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          ...payload,
          name: emptyName,
        })
        .expect((res) => {
          expect(res.body).toHaveProperty("errors.name.msg", "name too short");
        });
    });
    test("regex failure", async () => {
      await request(app)
        .post(categoryEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          ...payload,
          name: invalidName,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty(
            "errors.name.msg",
            "invalid characters"
          );
        });
    });
    test("name too long", async () => {
      await request(app)
        .post(categoryEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          ...payload,
          name: nameTooLong,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty("errors.name.msg", "name too long");
        });
    });
  });

  test("unauthorized", async () => {
    await request(app)
      .post(categoryEndpoint)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(payload)
      .expect(401);
  });

      .expect(200, {
        route: DummyCategory.route,
        uri: DummyCategory.uri,
        name: DummyCategory.name,
  describe("valid creation", () => {
    test("verify Category doesn't exists already", async () =>
      await request(app)
        .get(DummyCategoryFullURL)
        .set("Content-Type", "application/json")
        .expect(404, { errors: "category not found" }));
    test("create DummyCategory", async () =>
      await request(app)
        .post(categoryEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send(payload)
        .expect(200, {
          route: DummyCategory.route,
          uri: DummyCategory.uri,
          name: DummyCategory.name,
        }));
    test("check DummyCategory insertion went as expected", async () =>
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
  });

  describe("creation under Root", () => {
    test("verify Category doesn't exists already", async () =>
      await request(app)
        .get(categoryEndpoint + DummyCategory.uriName)
        .set("Content-Type", "application/json")
        .expect(404, { errors: "category not found" }));
    test("create Category", async () =>
      await request(app)
        .post(categoryEndpoint)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          uiRoute: "",
          name: DummyCategory.name,
        })
        .expect((res) => console.debug(res.body))
        .expect(200, {
          route: "",
          uri: DummyCategory.uriName,
          name: DummyCategory.name,
        }));
    test("check insertion under Root went as expected", async () =>
      await request(app)
        .get(categoryEndpoint + DummyCategory.uriName)
        .set("Content-Type", "application/json")
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toStrictEqual(DummyCategory.name);
          expect(res.body.uriName).toStrictEqual(DummyCategory.uriName);
          expect(res.body.route).toStrictEqual("");
          expect(res.body.uri).toStrictEqual(DummyCategory.uriName);
          expect(res.body.kind).toBe(0);
          expect(res.body.solved).toBeDefined();
          expect(res.body.sections).toBeInstanceOf(Array);
        }));
  });

  test("category already exists", async () => {
    await request(app)
      .get(DummyCategoryFullURL)
      .set("Content-Type", "application/json")
      .expect(200);
    await request(app)
      .post(categoryEndpoint)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send(payload)
      .expect(400, { errors: "category exists already" });
  });

  test("category already exists - tricky", async () => {
    await request(app)
      .post(categoryEndpoint)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send({ ...payload, name: payload.name + "." })
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty(
          "errors.name.msg",
          "invalid characters"
        );
      });
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
  // delete DummyCategory at Root
  await request(app)
    .delete(categoryEndpoint + DummyCategory.uriName)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .set("Cookie", sid_cookie);
  await request(app)
    .get(categoryEndpoint + DummyCategory.uriName)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(404);

  const { MongoStore } = require("../../../db/connection");
  await MongoStore.close();
});
