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
    },
    endDate: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    website: {
        type: String,
        required: true,
    },
    fandom: {type: String},
    guests: {type: Array}
});

eventSchema.virtual('dateString').get(function() {
    return `${this.startDate} - ${this.endDate}`.trim();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = {Event};

