const request = require('supertest');
const app = require('../app')

const baseUrl = '/api/users'

describe('GET / - Get user information', () =>
{
  let url = baseUrl;
  let sid_cookie = "";

  beforeAll(async () =>
  {
    await request(app)
      .post("/api/auth/login")
      .set('Content-Type', 'application/json')
      .send({
        "univID": "priourb",
        "password": "January01!"
      })
      .expect(function (res)
      {
        sid_cookie = res.headers["set-cookie"]
      })
  });


  test('No Session', async () =>
  {
    await request(app)
      .get(url)
      .set('Accept', 'application/json')
      .expect(401)
  });

  test('Logged in', async () =>
  {
    await request(app)
      .get(url)
      .set('Cookie', sid_cookie)
      .set('Accept', 'application/json')
      .expect(200, {
        univID: "priourb",
        email: "benpr@liu.se",
        firstName: "ben",
        lastName: "pr",
        promo: 2024,
      })
  });
})

describe('PUT / - Update account', () =>
{
  let url = baseUrl;
  let sid_cookie = "";

  beforeAll(async () =>
  {
    await request(app)
      .post("/api/auth/login")
      .set('Content-Type', 'application/json')
      .send({
        "univID": "priourb",
        "password": "January01!"
      })
      .expect(function (res)
      {
        sid_cookie = res.headers["set-cookie"]
      })
  });


  describe("Auth failure", () =>
  {
    test('No session', async () =>
    {
      await request(app)
        .put(url)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({
          "univID": "priourb"
        })
        .expect(401)
    })

    test('Mismatching session and ID', async () =>
    {
      await request(app)
        .put(url)
        .set('Content-Type', 'application/json')
        .set('Cookie', sid_cookie)
        .set('Accept', 'application/json')
        .send({
          "univID": "benpr438"
        })
        .expect(401)
    });
  });

  test('Logged in', async () =>
  {
    await request(app)
      .put(url)
      .set('Content-Type', 'application/json')
      .set('Cookie', sid_cookie)
      .set('Accept', 'application/json')
      .send({
        "univID": "priourb"
      })
      .expect(200)
  });
})