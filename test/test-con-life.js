'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Event} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
    const seedData = [
        {
            'id': '5beb5ca5d2eb213ed2acbaac',
            'name': 'ACE Comic Con',
            'startDate': '01/11/2019',
            'endDate': '01/13/2019',
            'location': 'Glendale, AZ',
            'region': 'west',
            'website': 'https://aceuniverse.com/',
            'fandom': 'none',
            'guests': [
                'Tom Hiddleston',
                'David Tennant',
                'Michael Fassbender',
                'Krysten Ritter',
                'Charlie Cox',
                'Tye Sheridan',
                'Alexandra Shipp'
            ]
        },
        {
            'id': '5beb5ca5d2eb213ed2acbaaa',
            'name': 'Conageddon',
            'startDate': '03/16/2019',
            'endDate': '03/17/2019',
            'location': 'Boston, MA',
            'region': 'northeast',
            'website': 'https://conageddon.com/',
            'fandom': 'The 100',
            'guests': [
                'Eliza Taylor',
                'Bob Morley',
                'Zach McGowan',
                'Tasya Teles',
                'Richard Harmon',
                'Christopher Larkin',
                'Chelsey Reist',
                'Luisa D\'Oliveira'
            ]
        },
        {
            'id': '5beb5ca5d2eb213ed2acbaab',
            'name': 'Awesome Con',
            'startDate': '04/26/2019 - 04/28/2019',
            'endDate': '04/28/2019',
            'location': 'Washington, DC',
            'region': 'south',
            'website': 'http://awesome-con.com',
            'fandom': 'none',
            'guests': [
                'Brent Spiner',
                'Jon Bernthal',
                'Marina Sirtis',
                'Tim Curry',
                'Val Kilmer'
            ]
        }
    ];
    return Event.insertMany(seedData);
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
  }
  
  describe('Con Life API', function() {
  
    // we need each of these hook functions to return a promise
    // otherwise we'd need to call a `done` callback. `runServer`,
    // `seedRestaurantData` and `tearDownDb` each return a promise,
    // so we return the value returned by these function calls.
    before(function() {
      return runServer(TEST_DATABASE_URL);
    });
  
    beforeEach(function() {
      return seedBlogData();
    });
  
    afterEach(function() {
      return tearDownDb();
    });
  
    after(function() {
      return closeServer();
    });
  
    describe('GET endpoint', function() {
  
      it('should return all events in database', function() {
        let res;
        return chai.request(app)
          .get('/events')
          .then(function(_res) {
            res = _res;
            expect(res).to.have.status(200);
            expect(res.body).to.have.lengthOf.at.least(1);
            return Event.count();
          })
          .then(function(count) {
            expect(res.body).to.have.lengthOf(count);
          });
      });
  
  
      it('should return events with correct fields', function() {
  
        let resEvent;
        return chai.request(app)
          .get('/events')
          .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body).to.have.lengthOf.at.least(1);
  
            res.body.forEach(function(event) {
              expect(event).to.be.a('object');
              expect(event).to.include.keys(
                'id', 'name', 'dates', 'location', 'region', 'website', 'fandom', 'guests');
            });
            resEvent = res.body[0];
            return Event.findById(resEvent.id);
          })
          .then(function(event) {
  
            expect(resEvent.id).to.equal(event.id);
            expect(resEvent.name).to.equal(event.name);
            expect(resEvent.dates).to.equal(`${event.startDate} - ${event.endDate}`);
            expect(resEvent.location).to.equal(event.location);
            expect(resEvent.region).to.equal(event.region);
            expect(resEvent.website).to.equal(event.website);
            expect(resEvent.fandom).to.equal(event.fandom);
            expect(resEvent.guests.length).to.equal(event.guests.length);
          });
      });
    });
  
    describe('POST endpoint', function() {
      it('should add a new event', function() {
  
        const newEvent = {
            "name": "Rhode Island Comic Con",
            "startDate": "11/01/2018",
            "endDate": "11/03/2018",
            "location": "Providence, RI",
            "region": "northeast",
            "website": "http://www.ricomiccon.com/",
            "fandom": "none"
        };
  
        return chai.request(app)
          .post('/events')
          .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoidGVzdCIsInJlZ2lvbiI6IiIsImV2ZW50cyI6W119LCJpYXQiOjE1NDIzMjEzODAsImV4cCI6MTU0MjkyNjE4MCwic3ViIjoidGVzdCJ9.M6u5AOOug6dmvUFqU1crGyQwZt0OzNvJXMjI6ohCyzU')
          .send(newEvent)
          .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys(
                'id', 'name', 'dates', 'location', 'region', 'website', 'fandom');
            expect(res.body.id).to.not.be.null;
            return Event.findById(res.body.id);
          })
          .then(function(event) {
            expect(event.name).to.equal(newEvent.name);
            expect(event.dates).to.equal(newEvent.dates);
            expect(event.location).to.equal(newEvent.location);
            expect(event.region).to.equal(newEvent.region);
            expect(event.website).to.equal(newEvent.website);
            expect(event.fandom).to.equal(newEvent.fandom);
          });
      });
    });
  
    /*describe('PUT endpoint', function() {
  
      it('should update fields you send over', function() {
        const updateData = {
          title: 'fofofofofofofof',
        };
  
        return BlogPost
          .findOne()
          .then(function(post) {
            updateData.id = post.id;
  
            // make request then inspect it to make sure it reflects
            // data we sent
            return chai.request(app)
              .put(`/posts/${post.id}`)
              .send(updateData);
          })
          .then(function(res) {
            expect(res).to.have.status(204);
  
            return BlogPost.findById(updateData.id);
          })
          .then(function(post) {
            expect(post.title).to.equal(updateData.title);
          });
      });
    });
  
    describe('DELETE endpoint', function() {
      
      it('delete a blogpost by id', function() {
  
        let blogpost;
  
        return BlogPost
          .findOne()
          .then(function(_blogpost) {
            blogpost = _blogpost;
            return chai.request(app).delete(`/posts/${blogpost.id}`);
          })
          .then(function(res) {
            expect(res).to.have.status(204);
            return BlogPost.findById(blogpost.id);
          })
          .then(function(_blogpost) {
            expect(_blogpost).to.be.null;
          });
      });
    });*/
  });
  