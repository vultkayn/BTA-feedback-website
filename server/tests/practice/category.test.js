const request = require("supertest");
const app = require("../../app");
const baseUrl = "/api/practice";

const {DummyCategory, DummyCategoryUpdated} = require("./helpers.test");

const invalidRoute = "isItvalid.";
const xssRoute = "<script<b>>blabla</b>";
const emptyName = "";
const invalidName = "isItvalid?";
const xssName = "<script<b>>blabla</b>";
const nameTooLong = "abcdefghijklsmnopqerzIBIZEYACGNVVCJVFZEIRPYUZRY";
const xssDescription = "<script<b>>blabla</b>";

function checkSection(section, name) {
  if (section == null) throw new Error("section is null or undefined");

  if (!("title" in section)) throw new Error("missing section title");
  if (section.title !== name)
    throw new Error(`expected title '${name}' got '${section.title}'`);
  if (!Array.isArray(section.listing))
    throw new Error("missing section listing");
}

function checkCategory(res) {
  if (typeof res.body.uri !== "string") throw new Error("missing uri");
  if (typeof res.body.route !== "string") throw new Error("missing route");
  if (!Array.isArray(res.body.sections)) throw new Error("missing sections");
  if (res.body.sections.length === 0) throw new Error("no subsections");
  if (typeof res.body.name !== "string" || res.body.name.length === 0)
    throw new Error("missing name");
  if ("description" in res.body && typeof res.body.description !== "string")
    throw new Error("missing description");
}

test("GET /categories - List categories at root", async () => {
  let url = baseUrl + "/categories";
  await request(app)
    .get(url)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .expect(200)
    .expect(function (res) {
      checkCategory(res);
      checkSection(res.body.sections[0], "Subcategories");
    });
});

describe(`POST ${baseUrl}/category - Create category`, () => {
  const url = baseUrl + "/category";
  const payload = {
    name: DummyCategory.name,
    route: DummyCategory.route,
    description: DummyCategory.description,
  };
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

  describe("invalid route", () => {
    /*     test("obvious xss", async () => {
      await request(app)
        .post(url)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set('Cookie', sid_cookie)
        .send({
          ...payload,
          route: xssRoute,
        })
        .expect(400, { errors: { route: "invalid characters" } });
    }); */
    test("regex failure", async () => {
      await request(app)
        .post(url)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set("Cookie", sid_cookie)
        .send({
          ...payload,
          route: invalidRoute,
        })
        .expect((res) => {
          if (res.body?.errors?.route?.msg !== "invalid characters")
            throw new Error();
        });
    });
  });
  describe("invalid name", () => {
    /*     test("obvious xss", async () => {
      await request(app)
        .post(url)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .set('Cookie', sid_cookie)
        .send({
          ...payload,
          name: xssName,
        })
        .expect(400, { errors: { name: "invalid characters" } });
    }); */
    test("empty name", async () => {
      await request(app)
        .post(url)
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
        .post(url)
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
        .post(url)
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
    /*     test("obvious xss", async () => {
          await request(app)
            .post(url)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .set('Cookie', sid_cookie)
            .send({
              ...payload,
              description: xssDescription,
            })
            .expect(400, { errors: { description: "invalid characters" } });
        }); */
  });

  test("unauthorized", async () => {
    await request(app)
      .post(url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .send(payload)
      .expect(401);
  });

  test("valid", async () => {
    await request(app)
      .get(baseUrl + "/category/" + DummyCategory.uri)
      .set("Content-Type", "application/json")
      .expect(404, { errors: "category not found" });
    await request(app)
      .post(url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send(payload)
      .expect(200, {
        route: DummyCategory.route,
        uri: DummyCategory.uri,
        name: DummyCategory.name,
      });
    await request(app)
      .get(baseUrl + "/category/" + DummyCategory.uri)
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

  test("category already exists", async () => {
    await request(app)
      .get(baseUrl + "/category/" + DummyCategory.uri)
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
      .post(url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send(payload)
      .expect(400, { errors: "category exists already" });
  });

  test("category already exists - tricky", async () => {
    await request(app)
      .post(url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set("Cookie", sid_cookie)
      .send({ ...payload, name: payload.name + "." })
      .expect(400)
      .expect((res) => {
        if (res.body?.errors?.name?.msg !== "invalid characters")
          throw new Error();
      });
  });
});

describe(`GET ${baseUrl}/category/:uri`, () => {
  const url = baseUrl + "/category/";

  test("get existent", async () => {
    await request(app)
      .get(url + DummyCategory.uri)
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

  test("get inexistent", async () => {
    await request(app)
      .get(url + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "category not found" });
  });
});

describe(`PUT ${baseUrl}/category/:uri`, () => {
  const url = baseUrl + "/category/";
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

  test("unauthentified - existent", async () => {
    await request(app)
      .get(baseUrl + "/category/" + DummyCategory.uri)
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
      .put(url + DummyCategory.uri)
      .set("Content-Type", "application/json")
      .expect(401);
    await request(app)
      .get(baseUrl + "/category/" + DummyCategory.uri)
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
      .put(url + "inexistent")
      .set("Content-Type", "application/json")
      .expect(401);
  });

  test("check spurious parameters are ignored", async () => {
    await request(app)
      .get(baseUrl + "/category/" + DummyCategory.uri)
      .set("Content-Type", "application/json")
      .expect(200);
    await request(app)
      .put(url + DummyCategory.uri)
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
      .get(baseUrl + "/category/" + DummyCategory.uri)
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

  test("valid", async () => {
    await request(app)
      .get(baseUrl + "/category/" + DummyCategory.uri)
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
      .put(url + DummyCategory.uri)
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
      });
    await request(app)
      .get(baseUrl + "/category/" + DummyCategory.uri)
      .set("Content-Type", "application/json")
      .expect(404);
    await request(app)
      .get(baseUrl + "/category/" + DummyCategoryUpdated.uri)
      .set("Content-Type", "application/json")
      .expect(200);
  });

  test("doesn't override another", async () => {
    // create temproray dummy
    await request(app)
      .post(baseUrl + "/category/")
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .send({
        name: DummyCategory.name,
        route: DummyCategory.route,
        description: DummyCategory.description,
      })
      .expect(200);

    // Overriding oneself isn't overriding.
    await request(app)
      .put(url + DummyCategory.uri)
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .send ({
        name: DummyCategory.name,
        route: DummyCategory.route,
      })
      .expect(200);

    // Going on with Update would override DummyCategoryUpdated
    await request(app)
      .put(url + DummyCategory.uri)
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .send ({
        name: DummyCategoryUpdated.name,
        route: DummyCategoryUpdated.route,
        description: DummyCategoryUpdated.description,
      })
      .expect(400, { errors: "cannot override category" });

    // Check that neither FROM nor TO were updated
    await request(app)
      .get(baseUrl + "/category/" + DummyCategory.uri)
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
      .get(baseUrl + "/category/" + DummyCategoryUpdated.uri)
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
      });

    // Cleanup mess
    await request(app)
      .delete(url + DummyCategory.uri)
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .expect(200);
  });
});

describe(`DELETE ${baseUrl}/category/:uri`, () => {
  const url = baseUrl + "/category/";
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

  test("delete non-existent category", async () => {
    await request(app)
      .get(baseUrl + "/category/" + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "category not found" });
    await request(app)
      .delete(url + "inexistent")
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .expect(404);
  });

  test("unauthentified - nonexistent", async () => {
    await request(app)
      .get(baseUrl + "/category/" + "inexistent")
      .set("Content-Type", "application/json")
      .expect(404, { errors: "category not found" });
    await request(app)
      .delete(url + "inexistent")
      .set("Content-Type", "application/json")
      .expect(401);
  });

  test("unauthentified - existent", async () => {
    await request(app)
      .get(baseUrl + "/category/" + DummyCategoryUpdated.uri)
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
      });
    await request(app)
      .delete(url + DummyCategoryUpdated.uri)
      .set("Content-Type", "application/json")
      .expect(401);
    await request(app) // Check Deletion did NOT happen
      .get(baseUrl + "/category/" + DummyCategoryUpdated.uri)
      .set("Content-Type", "application/json")
      .expect(200);
  });

  test("delete existent", async () => {
    await request(app)
      .get(baseUrl + "/category/" + DummyCategoryUpdated.uri)
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
      });
    await request(app)
      .delete(url + DummyCategoryUpdated.uri)
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .expect(200);
    await request(app) // Check Deletion did happen
      .get(baseUrl + "/category/" + DummyCategoryUpdated.uri)
      .set("Content-Type", "application/json")
      .expect(404, { errors: "category not found" });
  });

  test("delete root", async () => {
    await request(app)
      .delete(url)
      .set("Content-Type", "application/json")
      .set("Cookie", sid_cookie)
      .expect(404);
  });
});

