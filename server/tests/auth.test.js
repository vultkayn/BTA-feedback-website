const request = require('supertest');

const app = require('../app')

const baseUrl = '/api/auth'

describe('POST /login - Log in account', () => {
    let url = baseUrl + '/login'

    test('wrong password', async () => {
        await request(app)
            .post(url)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"password": "January0!", "univID": "priourb"})
            .expect('Content-Type', /json/)
            .expect(401, {errors:{password: "wrong password"}})
    })

    test('user not found', async () => {
        await request(app)
            .post(url)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"password": "nomatter", "univID": "notexisting"})
            .expect('Content-Type', /json/)
            .expect(401, {errors:{univID: "user not found"}})
    })

    test('Successful login - univID', async () => {
        await request(app)
            .post(url)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"password": "January01!", "univID": "priourb"})
            .expect('Content-Type', /json/)
            .expect(200, {univID: "priourb"})
            .expect((res) => {if (! ('set-cookie' in res.headers)) throw new Error('Missing set-cookie')})
          })
          
          test('Successful login - email', async () => {
            await request(app)
            .post(url)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"password": "January01!", "email": "benpr@liu.se"})
            .expect('Content-Type', /json/)
            .expect(200, {univID: "priourb"})
            .expect((res) => {if (! ('set-cookie' in res.headers)) throw new Error('Missing set-cookie')})
          })

    test('Email priority over univID', async () => {
        await request(app)
            .post(url)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({"password": "January01!", "email": "benpr@liu.se", "univID": "benpr438"})
            .expect('Content-Type', /json/)
            .expect(200, {univID: "priourb"})
            .expect((res) => {if (! ('set-cookie' in res.headers)) throw new Error('Missing set-cookie')})
    })

    describe('Sanitization', () => {
        test('Missing ID and email', async () => {
            await request(app)
                .post(url)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send({"password": "January01!"})
                .expect(400, {
                    errors: {
                      univID: {location: "body", msg: "invalid value"},
                      email: {location: "body", msg: "invalid value"}
                }});
        })

        test('Missing password but valid user', async () => {
            await request(app)
                .post(url)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send({ "univID": "priourb"})
                .expect(400, {
                    errors: {
                        password: {msg: "invalid value", location: "body"}
                    }
                });
            })
            
        test('Missing password but invalid user', async () => {
            await request(app)
            .post(url)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({ "univID": "notexistent"})
            .expect(400, {
                errors: {
                    password: {msg: "invalid value", location: "body"}
                }
            });
        })
    })
});


describe('POST / - Create account', () => {
    let url = baseUrl

    let payload = {
        "univID": "benpr438",
        "password": "January02!",
        "firstName": "toto",
        "lastName": "titi",
        "promo": 2024,
        "email": "benpr@liu.se"
        }

    test('user already exists - univID', async () => {
        await request(app)
            .post(url)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({...payload, email: "doesnt@gmail.com"})
            .expect('Content-Type', /json/)
            .expect(400, {errors:{univID: "user already exists"}})
    })

    test('user already exists - email', async () => {
        await request(app)
            .post(url)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send({
                ...payload,
                univID: "doesnt"
            })
            .expect('Content-Type', /json/)
            .expect(400, {errors:{univID: "user already exists"}})
    })

    describe('Sanitization', () => {
        test('Missing ID', async () => {
            await request(app)
                .post(url)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send({...payload, univID:""})
                .expect(400, {
                    errors: {
                        univID: {msg: "invalid value", location: "body"}
                    }
                })
        })

        test('invalid password', async () => {
            await request(app)
                .post(url)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send({
                    ...payload,
                    "password": "nouppercase"
                })
                .expect('Content-Type', /json/)
                .expect(400, {
                    errors: {
                        password: {msg: "invalid value", location: "body"}
                    }
                })
        })
    })
});
