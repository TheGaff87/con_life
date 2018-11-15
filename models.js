"use strict";

const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    startDate: {
        type: String,
        required: true,
        unique: true
    },
    endDate: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true,
        unique: true
    },
    region: {
        type: String,
        required: true,
        unique: true
    },
    website: {
        type: String,
        required: true,
        unique: true
    },
    fandom: {type: String},
    guests: {type: Array}
});

eventSchema.virtual('dateString').get(function() {
    return `${this.startDate} - ${this.endDate}`.trim();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = {Event};

