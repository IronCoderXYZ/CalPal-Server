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

describe('POST /foods', () => {
  it('Should add a new food with valid data', done => {
    const name = 'Testfood';
    const calories = 99999999;
    const author = initialFoods[0].author;

    supertest(app)
      .post('/foods')
      .send({ name, calories, author })
      .expect(200)
      .expect(response => {
        expect(response.body.name).toBe(name);
        expect(response.body.calories).toBe(calories);
        expect(response.body.author).toBe(author.toHexString());
      })
      .end((error, response) => {
        if (error) return done(error);
        Food.find({ name })
          .then(foods => {
            expect(foods.length).toBe(1);
            expect(foods[0].name).toBe(name);
            expect(foods[0].calories).toBe(calories);
            expect(foods[0].author).toBe(author.toHexString());
            done();
          })
          .catch(error => done(error));
      });
  });

  it('Should not add a new food with invalid data', done => {
    supertest(app)
      .post('/foods')
      .send({})
      .expect(400)
      .end((error, response) => {
        if (error) return done(error);
        Food.find()
          .then(foods => {
            // Expect length of 2 since initialFoods from seed has 2 items
            expect(foods.length).toBe(2);
            done();
          })
          .catch(error => done(error));
      });
  });
});

describe('PATCH /foods/:id', () => {
  it('Should update a food', done => {
    const newCalories = 250;
    const newName = 'Chicken Update';
    const hexId = initialFoods[0]._id.toHexString();

    supertest(app)
      .patch(`/foods/${hexId}`)
      .send({ name: newName, calories: newCalories })
      .expect(200)
      .expect(res => {
        expect(res.body.food.name).toBe(newName);
        expect(res.body.food.calories).toBe(newCalories);
      })
      .end(done);
  });
});

describe('DELETE /foods/:id', () => {
  it('Should remove a food', done => {
    const hexId = initialFoods[1]._id.toHexString();

    supertest(app)
      .delete(`/foods/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.food._id).toBe(hexId);
      })
      .end((error, response) => {
        if (error) return done(error);
        Food.findById(hexId)
          .then(food => {
            console.log(food);
            expect(food).toBeFalsy();
            done();
          })
          .catch(error => done(error));
      });
  });
});
