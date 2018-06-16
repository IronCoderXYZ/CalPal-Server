const expect = require('expect');
const supertest = require('supertest');
const { ObjectID } = require('mongodb');

const Food = require('../../models/food');
const app = require('../../server');
const { initialFoods, populateFoods } = require('./seed');

beforeEach(populateFoods);

describe('GET /foods', () => {
  it('Should get all foods if provided with a valid author', done => {
    supertest(app)
      .get(`/foods/${initialFoods[0].author.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body[0].name).toBe(initialFoods[0].name);
        expect(res.body[0].calories).toBe(initialFoods[0].calories);
      })
      .end(done);
  });
});
