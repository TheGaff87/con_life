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

// CORS
/*app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});*/

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/events', (req, res) => {
  Event
    .find()
    .sort({startDate: 1})
    .then(events => {
      res.json(events.map(event => {
        return {
          id: event.id,
          name: event.name,
          dates: event.dateString,
          location: event.location,
          region: event.region,
          website: event.website,
          fandom: event.fandom,
          guests: event.guests
        };
      }))
    })

    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/events/region/:term', (req, res) => {
  Event
    .find({region: req.params.term})
    .sort({startDate: 1})
    .then(events => {
      res.json(events.map(event => {
        return {
          id: event.id,
          name: event.name,
          dates: event.dateString,
          location: event.location,
          region: event.region,
          website: event.website,
          fandom: event.fandom,
          guests: event.guests
        };
      }))
    })

  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

app.get('/events/fandom/:term', (req, res) => {
  Event
    .find({fandom: req.params.term})
    .sort({startDate: 1})
    .then(events => {
      res.json(events.map(event => {
        return {
          id: event.id,
          name: event.name,
          dates: event.dateString,
          location: event.location,
          region: event.region,
          website: event.website,
          fandom: event.fandom,
          guests: event.guests
        };
      }))
    })

  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

app.get('/events/:userid', jwtAuth, (req, res) =>{
  User
    .findById(req.params.userid)
    .then(user => {
      res.json(user.events);
    })
       
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
  });

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
    .then(event => res.status(201).json({
      id: event._id,
      name: event.name,
      dates: `${event.startDate} - ${event.endDate}`,
      location: event.location,
      region: event.region,
      website: event.website,
      fandom: event.fandom,
      guests: event.guests
  }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

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

app.delete('/events/:id', jwtAuth, (req, res) => {
  Event
    .findByIdAndRemove(req.params.id)
    .then(event => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error'}));
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
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
