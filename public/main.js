"use strict";

var MOCK_GET_EVENTS = {
    "events": [
        {
            "name": "ACE Comic Con",
            "sort-date": "2019-01-11",
            "dates": "January 11-12-13, 2019",
            "location": "Glendale, AZ",
            "region": "west",
            "website": "https://aceuniverse.com/",
            "fandom": "mixed",
            "celebrity guests": ["Tom Hiddleston", "David Tennant", "Michael Fassbender", "Krysten Ritter", "Charlie Cox", "Tye Sheridan", "Alexandra Shipp"]
        },
        {
            "name": "Conageddon",
            "sort-date": "2019-03-16",
            "dates": "March 16-17, 2019",
            "location": "Boston, MA",
            "region": "northeast",
            "website": "https://conageddon.com/",
            "celebrity guests": ["Eliza Taylor", "Bob Morley", "Zach McGowan", "Tasya Teles", "Richard Harmon", "Christopher Larkin", "Chelsey Reist", "Luisa D'Oliveira"]
        },
        {
            "name": "Awesome Con",
            "sort-date": "2019-04-26",
            "dates": "April 26-28, 2019",
            "location": "Washington, DC",
            "region": "south",
            "website": "http://awesome-con.com",
            "celebrity guests": ["Brent Spiner", "Jon Bernthal", "Marina Sirtis", "Tim Curry", "Val Kilmer"]
        }
    ]
};

function getAllEvents(callbackFn) {
    console.log("Timeout set");
    setTimeout(function(){callbackFn(MOCK_GET_EVENTS)}, 1);
}

function displayAllEvents(data) {
    console.log("displaying data");
    for (let i=0; i<data.length; i++) {
        $(".results").html(
            `
            <div class="event">
                <p>${data.events[i].name}</p>
            </div>
            `
        );
    }
}

function getAndDisplayAllEvents() {
    console.log("getting and displaying events");
    $(".results").prop('hidden', false);
    getAllEvents(displayAllEvents);
}

$(function() {
    getAndDisplayAllEvents();
})