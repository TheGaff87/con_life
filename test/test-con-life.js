'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const expect = chai.expect;

const {User} = require('../users/models')
const {Event} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedData() {
    const eventData = [
        {
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
    const userData = {
        'username': 'user1',
        'password' : '$2a$10$wJ0k.ZJOpJi56vLH8/cdwOmnFVbXeZKhUUT3iG8S3gAVFju7GkEIW',
        'events': []
    };
    return User.insertMany(userData), Event.insertMany(eventData);
}

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWJmYzZlNTI0MDgwMGUwZjI4ZWIzOWMwIiwidXNlcm5hbWUiOiJ1c2VyMSIsImV2ZW50cyI6WyI1YmVlZmFiN2QyZWIyMTNlZDJhY2Q0ZDEiLCI1YmVlZmFiN2QyZWIyMTNlZDJhY2Q0Y2YiXX0sImlhdCI6MTU0MzMzMzQ2MSwiZXhwIjoxNTQzOTM4MjYxLCJzdWIiOiJ1c2VyMSJ9.8dkPg-ohI2kv4PbVWNm-uO9znNRgDISaN5LuVFRfJK4'

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
  }
  
  describe('Con Life API', function() {
  
    before(function() {
      return runServer(TEST_DATABASE_URL);
    });
  
    beforeEach(function() {
      return seedData();
    });
  
    afterEach(function() {
      return tearDownDb();
    });
  
    after(function() {
      return closeServer();
    });
  
    //event-related endpoints
    describe('GET /events', function() {
  
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
                'id', 'name', 'startDate', 'endDate', 'location', 'website', 'guests', 'fandom', 'region');
            });
            resEvent = res.body.events[0];
            return Event.findById(resEvent.id);
          })
          .then(function(event) {
  
            expect(resEvent.id).to.equal(event.id);
            expect(resEvent.name).to.equal(event.name);
            expect(resEvent.startDate).to.equal(event.startDate);
            expect(resEvent.endDate).to.equal(event.endDate);
            expect(resEvent.region).to.equal(event.region);
            expect(resEvent.fandom).to.equal(event.fandom);
            expect(resEvent.location).to.equal(event.location);
            expect(resEvent.website).to.equal(event.website);
            expect(resEvent.guests.length).to.equal(event.guests.length);
          });
      });
    });

    describe('GET /events/region/:region', function() {
  
        it('should return all events in selected region', function() {
          let res;
          return chai.request(app)
            .get('/events/region/northeast')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(200);
              expect(res.body.events).to.have.lengthOf.at.least(1);
            })
        });
    
    
        it('should return events with correct fields', function() {
    
          let resEvent;
          let selectedRegion = "northeast";
          return chai.request(app)
            .get('/events/region/' + selectedRegion)
            .then(function(res) {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body.events).to.be.a('array');
              expect(res.body.events).to.have.lengthOf.at.least(1);
    
              res.body.events.forEach(function(event) {
                expect(event).to.be.a('object');
                expect(event).to.include.keys(
                  'id', 'name', 'startDate', 'endDate', 'location', 'website', 'guests', 'fandom', 'region');
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
              expect(resEvent.region).to.equal(selectedRegion);
              expect(resEvent.fandom).to.equal(event.fandom);
              expect(resEvent.website).to.equal(event.website);
              expect(resEvent.guests.length).to.equal(event.guests.length);
            });
        });
      });

      describe('GET /events/fandom/:fandom', function() {
  
        it('should return all events for selected fandom', function() {
          let res;
          return chai.request(app)
            .get('/events/fandom/The 100')
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(200);
              expect(res.body.events).to.have.lengthOf.at.least(1);
            })
        });
    
    
        it('should return events with correct fields', function() {
    
          let resEvent;
          let selectedFandom = 'The 100';
          return chai.request(app)
            .get('/events/fandom/' + selectedFandom)
            .then(function(res) {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body.events).to.be.a('array');
              expect(res.body.events).to.have.lengthOf.at.least(1);
    
              res.body.events.forEach(function(event) {
                expect(event).to.be.a('object');
                expect(event).to.include.keys(
                  'id', 'name', 'startDate', 'endDate', 'location', 'website', 'guests', 'fandom', 'region');
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
              expect(resEvent.region).to.equal(event.region);
              expect(resEvent.fandom).to.equal(selectedFandom);
              expect(resEvent.website).to.equal(event.website);
              expect(resEvent.guests.length).to.equal(event.guests.length);
            });
        });
      });
  
    describe('POST /events', function() {
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
          .set('Authorization', token)
          .send(newEvent)
          .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys(
                'id', 'name', 'startDate', 'endDate', 'location', 'website', 'guests', 'fandom', 'region');
            expect(res.body.id).to.not.be.null;
            return Event.findById(res.body.id);
          })
          .then(function(event) {
            expect(event.name).to.equal(newEvent.name);
            expect(event.startDate).to.equal(newEvent.startDate);
            expect(event.endDate).to.equal(newEvent.endDate);
            expect(event.location).to.equal(newEvent.location);
            expect(event.website).to.equal(newEvent.website);
            expect(event.region).to.equal(newEvent.region);
            expect(event.fandom).to.equal(newEvent.fandom);
          });
      });
    });
  
    describe('PUT /events/eventid', function() {
  
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
              .set('Authorization', token)
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
  
    describe('DELETE /events/:eventid', function() {
      
      it('delete an event by id', function() {
  
        let event;
  
        return Event
          .findOne()
          .then(function(_event) {
            event = _event;
            return chai.request(app).delete(`/events/${event.id}`)
            .set('Authorization', token)
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

    //tests for user-specific event endpoints
    describe('GET /events/:userid', function() {
  
        it('should return document for user', function() {
          let res;
          let username = 'user1'
          return chai.request(app)
            .get('/events/' + username)
            .set('Authorization', token)
            .then(function(_res) {
              res = _res;
              expect(res).to.have.status(200);
              expect(res.body.user).to.have.lengthOf.at.least(1);
            })
        });
    
    
        it('should return correct fields for user', function() {
        let username = 'user1';
          return chai.request(app)
            .get('/events/' + username)
            .set('Authorization', token)
            .then(function(res) {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body.user).to.be.a('array');
              //password is properly disguised
              expect(res.body.user[0]).to.include.keys('events', '_id', 'username', 'password', '__v')
              expect(res.body.user[0].username).to.equal(username);
              
              if(res.body.user[0].events.length > 0) {
    
              res.body.user[0].events.forEach(function(event) {
                expect(event).to.be.a('object');
                expect(event).to.include.keys(
                  'id', 'name', 'startDate', 'endDate', 'location', 'website', 'guests', 'fandom', 'region');
              });
            }
            })
        });
    })

      describe('PUT /api/users/:userId', function () {

          it('should add event to user', function () {
              const updateData = {};

              return Event
                  .findOne()
                  .then(function (event) {
                      updateData.events = event.id;

                return User
                    .findOne()
                    .then(function (user) {
                        updateData.id = user._id;
                        const userId = user._id;

                      return chai.request(app)
                          .put(`/api/users/${userId}`)
                          .set('Authorization', token)
                          .send(updateData)
                  })
                })

                  .then(function (res) {
                      expect(res).to.have.status(204);
                  });
          });
      })
          describe('PUT /events/user/remove/:userId', function() {
  
            it('should remove event from user and return updated user document', function() {
                const updateData = {};

                return Event
                    .findOne()
                    .then(function (event) {
                        updateData.eventId = event.id;
  
                  return User
                      .findOne()
                      .then(function (user) {
                          updateData.id = user._id;
                          const userId = user._id;
  
                        return chai.request(app)
                            .put(`/events/user/remove/${userId}`)
                            .set('Authorization', token)
                            .send(updateData)
                    })
                  })
        
                .then(function(res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.events).to.be.a('array');
                    //password is properly disguised
                    expect(res.body).to.include.keys('events', '_id', 'username', 'password', '__v')
                    
                    if(res.body.events.length > 0) {
          
                    res.body.events.forEach(function(event) {
                      expect(event).to.be.a('object');
                      expect(event).to.include.keys(
                        'id', 'name', 'startDate', 'endDate', 'location', 'website', 'guests', 'fandom', 'region');
                    });
                    }
                })
          });
    })
})
