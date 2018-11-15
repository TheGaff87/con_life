"use strict";

//GET endpoint
function getAllEvents(callbackFn) {
    setTimeout(function(){callbackFn(MOCK_GET_EVENTS)}, 1);
}

function displayAllEvents(data) {
    for (i = 0; i < data.events.length; i++) {
        $(".events").append(
            `
            <article class="js-event">
                <h3><a href="${data.events[i].website}" target="_blank">${data.events[i].name}</a></h3>
                <h3>${data.events[i].dates}</h3>
                <h3>${data.events[i].location}</h3>
                <button type="button" class="js-guest-list"><h4>Celebrity Guests</h4>
                <div class="hidden js-guests-list ${i}">
                    <ul class="${i}"></ul>
                </div></button>
                <div class="edit-event-div">
                    <button type="button" class="edit-event-button">Edit this event</button>
                </div>
                <div class="delete-option-div">
                    <button type="button" class="delete-option-button">Delete this event</button>
                    <div class="delete-event-div hidden">
                        <p>Are you sure you want to delete this event?</p>
                        <button type="submit" class="delete-event-button">Delete event</button>
                </div>
            </article>
            `
        )
        for (a = 0; a < data.events[i].guests.length; a++) {
            $(".events ul" + "." + i).append(`<li>${data.events[i].guests[a]}</li>`);
        }
    }
}

$(".events").on("click", ".js-guest-list", function(event) {
    let currentDiv = $(this).parent().find("div");
    $(currentDiv).toggleClass("hidden");
})

function getAndDisplayAllEvents() {
    $(".events").prop('hidden', false);
    getAllEvents(displayAllEvents);
}

//POST endpoint
$(".add-event").on("click", ".add-event-button", function(event) {
    $(".add-event-form").toggleClass("hidden");
    $(".add-event").append(`
    <form action="/add" method="post" class="add-event-form">
    <label>Event Name
    <input type="text" size="45" name="event-name" placeholder="Enter event name" required>
    </label>
    <label>Event Dates
        <input type="date" name="event-dates" placeholder="YYYY-MM-DD" required>
    </label>
    <label>Event Location
        <input type="text" size="45" name="event-location" placeholder="Enter event location" required>
    </label>
    <label>Event Region
        <select name="regions" required>
            <option value="northeast">Northeast</option>
            <option value="south">South</option>
            <option value="midwest">Midwest</option>
            <option value="west">West</option>
        </select>
    </label>
    <label>Event Website
        <input type="url" size="45" name="event-website" placeholder="Enter event website" required>
    </label>
    <label>Event Fandom
        <input type="text" size="45" name="event-fandom" placeholder="If event is not for a particular fandom, enter 'none'" required>
    </label>
    <label>Event Celebrity Guests
        <textarea rows="4" cols="50" name="event-guests" placeholder="Enter guest names, separated by commas"></textarea>
    </label>
    <button type="submit">Submit Event</button>
  </form>  
    `)
});

//When submit is clicked, event will be added to database
//then do another API call to get updated list

//PUT endpoint
$(".events").on("click", ".edit-event-button", function(event) {
    let currentEl = $(this).parent();
    $(currentEl).append(`
    <form action="/edit" method="post" class="add-event-form">
    <label>Event Dates
        <input type="date" name="event-dates" placeholder="YYYY-MM-DD">
    </label>
    <label>Event Location
        <input type="text" size="45" name="event-location" placeholder="Enter event location">
    </label>
    <label>Event Region
        <select name="regions">
            <option value="northeast">Northeast</option>
            <option value="south">South</option>
            <option value="midwest">Midwest</option>
            <option value="west">West</option>
        </select>
    </label>
    <label>Event Website
        <input type="url" size="45" name="event-website" placeholder="Enter event website">
    </label>
    <label>Event Fandom
        <input type="text" size="45" name="event-fandom" placeholder="If event is not for a particular fandom, enter 'none'">
    </label>
    <label>Event Celebrity Guests
        <textarea rows="4" cols="50" name="event-guests" placeholder="Enter guest names, separated by commas"></textarea>
    </label>
    <button type="submit">Submit Event</button>
  </form>    
    `)
})

//submit button sends updated info to database
//another API call to get full updated list

//DELETE endpoint
$(".events").on("click", ".delete-option-button", function(event) {
    let currentDiv = $(this).parent().children("div");
    $(currentDiv).toggleClass("hidden");
})

//submit triggers event deletion from database
//API call to get updated list

function handleApp() {
    getAndDisplayAllEvents();
}

$(handleApp);