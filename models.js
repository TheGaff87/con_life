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
    image: {type: String},
    guests: {type: Array}
});

eventSchema.methods.serialize = function() {
    return {
        id: this._id,
        name: this.name,
        startDate: this.startDate,
        endDate: this.endDate,
        location: this.location,
        website: this.website,
        region: this.region,
        fandom: this.fandom,
        image: this.image,
        guests: this.guests
    }
}

const Event = mongoose.model('Event', eventSchema);

module.exports = {Event};

