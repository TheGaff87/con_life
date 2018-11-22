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
            expect(res.body.events).to.have.lengthOf.at.least(1);
            return Event.count();
          })
          .then(function(count) {
            expect(res.body.events).to.have.lengthOf(count);
          });
      });
  
  
      it('should return events with correct fields', function() {
  
        let resEvent;
        return chai.request(app)
          .get('/events')
          .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body.events).to.be.a('array');
            expect(res.body.events).to.have.lengthOf.at.least(1);
  
            res.body.events.forEach(function(event) {
              expect(event).to.be.a('object');
              expect(event).to.include.keys(
                'id', 'name', 'startDate', 'endDate', 'location', 'website', 'guests');
            });
            resEvent = res.body.events[0];
            return Event.findById(resEvent.id);
          })
          .then(function(event) {
  
            expect(resEvent.id).to.equal(event.id);
            expect(resEvent.name).to.equal(event.name);
            expect(resEvent.startDate).to.equal(event.startDate);
            expect(resEvent.endDate).to.equal(event.endDate);
            expect(resEvent.location).to.equal(event.location);
            expect(resEvent.website).to.equal(event.website);
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
          .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoidGVzdCIsInJlZ2lvbiI6Im5vcnRoZWFzdCIsImV2ZW50cyI6W119LCJpYXQiOjE1NDI2NjY2MzQsImV4cCI6MTU0MzI3MTQzNCwic3ViIjoidGVzdCJ9.URhqjQfMhH3CqDe9XBOTxjcINocxRq1VIYnXuzXFMiw')
          .send(newEvent)
          .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys(
                'id', 'name', 'startDate', 'endDate', 'location', 'website', 'guests');
            expect(res.body.id).to.not.be.null;
            return Event.findById(res.body.id);
          })
          .then(function(event) {
            expect(event.name).to.equal(newEvent.name);
            expect(event.startDate).to.equal(newEvent.startDate);
            expect(event.endDate).to.equal(newEvent.endDate);
            expect(event.location).to.equal(newEvent.location);
            expect(event.website).to.equal(newEvent.website);
          });
      });
    });
  
    describe('PUT endpoint', function() {
  
      it('should update fields you send over', function() {
        const updateData = {
          guests: "Will Smith",
        };
  
        return Event
          .findOne()
          .then(function(event) {
            updateData.id = event.id;
  
            return chai.request(app)
              .put(`/events/${event.id}`)
              .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoidGVzdCIsInJlZ2lvbiI6Im5vcnRoZWFzdCIsImV2ZW50cyI6W119LCJpYXQiOjE1NDI2NjY2MzQsImV4cCI6MTU0MzI3MTQzNCwic3ViIjoidGVzdCJ9.URhqjQfMhH3CqDe9XBOTxjcINocxRq1VIYnXuzXFMiw')
              .send(updateData);
          })
          .then(function(res) {
            expect(res).to.have.status(204);
  
            return Event.findById(updateData.id);
          })
          .then(function(event) {
            expect(event.guests).to.include(updateData.guests);
          });
      });
    });
  
    describe('DELETE endpoint', function() {
      
      it('delete an event by id', function() {
  
        let event;
  
        return Event
          .findOne()
          .then(function(_event) {
            event = _event;
            return chai.request(app).delete(`/events/${event.id}`)
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoidGVzdCIsInJlZ2lvbiI6Im5vcnRoZWFzdCIsImV2ZW50cyI6W119LCJpYXQiOjE1NDI2NjY2MzQsImV4cCI6MTU0MzI3MTQzNCwic3ViIjoidGVzdCJ9.URhqjQfMhH3CqDe9XBOTxjcINocxRq1VIYnXuzXFMiw')
          })
          .then(function(res) {
            expect(res).to.have.status(204);
            return Event.findById(event.id);
          })
          .then(function(_event) {
            expect(_event).to.be.null;
          });
      });
    });
  });
  