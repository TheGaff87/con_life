'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {Event} = require('../models')

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  region: {type: String},
  events: [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}],
});

UserSchema.methods.serialize = function() {
  return {
    id: this._id,
    username: this.username,
    region: this.region,
    events: this.events || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User};
