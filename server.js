'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const cors = require('cors');

mongoose.Promise = global.Promise;

const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const {Event} = require('./models')
const {User} = require('./users/models')

const app = express();

// Logging
app.use(morgan('common'));

app.use(express.static('public'));

app.use(express.json());

app.use(cors());

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

//returns all events
app.get('/events', (req, res) => {
  Event
    .find()
    .sort({startDate: 1})
    .then(events => {
      res.json({
        events: events.map(
          (event) => event.serialize())
      });
    })

    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

//returns events for specified region
app.get('/events/region/:term', (req, res) => {
  Event
    .find({region: req.params.term})
    .sort({startDate: 1})
    .then(events => {
      res.json({
        events: events.map(
          (event) => event.serialize())
      });
    })

  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

//returns events for specified fandom
app.get('/events/fandom', (req, res) => {
  Event
    .distinct("fandom")
    .then(fandom => {
      res.json({fandom});
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
})

app.get('/events/fandom/:term', (req, res) => {
  Event
    .find({fandom: req.params.term})
    .sort({startDate: 1})
    .then(events => {
      res.json({
        events: events.map(
          (event) => event.serialize())
      });
    })

  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

//returns document for user; used to extract userID and user events
app.get('/events/:username', jwtAuth, (req, res) =>{
  User
    .findOne({username: req.params.username})
    .populate({path: 'events', options: {sort: {'startDate': 1}}})
    .then(user => {
      res.json({ user
      });
    })
       
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
  });

//adds new event
app.post('/events', jwtAuth, (req, res) => {
  const requiredFields = ['name', 'startDate', 'endDate', 'location', 'region', 'website', 'fandom'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Event
    .create({
      name: req.body.name,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      location: req.body.location,
      region: req.body.region,
      website: req.body.website,
      fandom: req.body.fandom,
      guests: req.body.guests
    })
    .then(event => res.status(201).json(event.serialize())
  )
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

//adds guests to event
app.put('/events/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path name (${req.params.id}) and request body name ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {guests: req.body.guests};

  Event
    .findByIdAndUpdate(req.params.id, { $push: toUpdate })
    .then(event => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

//adds event to user
app.put('/api/users/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path name (${req.params.id}) and request body name ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {
    events: req.body.events
  };

  User
  .findByIdAndUpdate(req.params.id, { $push: toUpdate })
    .then(user => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

//removes event from user
app.put('/events/user/remove/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path name (${req.params.id}) and request body name ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }
  
  User
    .findById(req.params.id)
    .populate({path: 'events', options: {sort: {'startDate': 1}}})
    .then(user => {
      let newEvents = user.events.filter(event => event.id !== req.body.eventId)
      user.events = newEvents;
      return user.save()
    })
    .then(user => res.json(user));
})

//deletes event from database
app.delete('/events/:id', jwtAuth, (req, res) => {
  Event
    .findByIdAndRemove(req.params.id)
    .then(event => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error'}));
});

let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
