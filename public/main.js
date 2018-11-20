"use strict";

function formatDates(startDate, endDate) {
    return moment(startDate).format("MM/DD/YYYY") + " " + "-" + " " + moment(endDate).format("MM/DD/YYYY");
}

//GET all events
function getAllEvents(callback) {
    $.ajax({
        url: "/events",
        type: "GET",
        dataType: "json",
        success: callback
    });
};

//GET all fandoms
function getAllFandoms(callback) {
    $.ajax({
        url: "/events/fandom",
        type: "GET",
        dataType: "json",
        success: callback
    })
}

function displayAllEvents(data) {
    const events = data.events;
    for (let i = 0; i < events.length; i++) {
        const dates = formatDates(events[i].startDate, events[i].endDate)

        $(".events").append(
            `
            <article class="js-event">
                <p class="id hidden">${events[i].id}</p>
                <h3><a href="${events[i].website}" target="_blank">${events[i].name}</a></h3>
                <h3>${dates}</h3>
                <h3>${events[i].location}</h3>
                <button type="button" class="js-guest-list"><h4>Celebrity Guests</h4>
                <div class="hidden js-guests-list ${i}">
                    <ul class="${i}"></ul>
                </div></button>
            </article>
            `
        )
        for (let a = 0; a < events[i].guests.length; a++) {
            $(".events ul" + "." + i).append(`<li>${events[i].guests[a]}</li>`);
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

$(".signup-notice").click(function(event) {
    $(".signup-form").toggleClass("hidden");
})

$(".signin-notice").click(function(event) {
    $(".signin-form").toggleClass("hidden");
})

//GET--events filtered by region
function filterByRegion(term, callback) {
    $.ajax({
        url: "/events/region/" + term,
        type: "GET",
        dataType: "json",
        success: callback
    });
};

$(".region").change(function() {
    $(".events").html("");
    if ($(".region").val() === "all") {
        getAndDisplayAllEvents();
    }else{
    const region = $(".region").val();
    filterByRegion(region, displayAllEvents)
    }
})

//GET--events filtered by fandom

function displayAllFandoms(data) {
    const fandom = data.fandom;
    for (let i = 0; i < fandom.length; i++) {
        if (fandom[i] !== "none") {
            $(".fandom").append(`
            <option value="${fandom[i]}">${fandom[i]}</option>
            `
            )
        }
    }
}

function getAndDisplayAllFandoms() {
    getAllFandoms(displayAllFandoms);
}

function filterByFandom(term, callback) {
    $.ajax({
        url: "/events/fandom/" + term,
        type: "GET",
        dataType: "json",
        success: callback
    });
};

$(".fandom").change(function() {
    $(".events").html("");
    if ($(".fandom").val() === "all") {
        getAndDisplayAllEvents();
    }else{
    const fandom = $(".fandom").val();
    filterByFandom(fandom, displayAllEvents)
    }
})

//POST endpoint--signup for an account
function createAccount(user, pass, region, callback) {
    $.ajax({
        url: "/api/users",
        data: JSON.stringify({
            username: user,
            password: pass,
            region: region
        }),
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        success: callback
    })
}

let username = "";
let region = "";
let token = "";

function accountFollowUp(data) {
    username = data.username;
    region = data.region;
    $(".username1").val("");
    $(".password1").val("");
    $(".user-region").val("----");
    $(".signup-form").attr("class", "hidden");
}

$(".signup-button").click(function (event) {
    event.preventDefault();
    const user1 = $(".username1").val();
    const pass1 = $(".password1").val();
    const region1 = $(".user-region").val();
    createAccount(user1, pass1, region1, accountFollowUp);
})

//POST endpoint--sign-in to account
function validateAccount(user, pass, callback) {
    $.ajax({
        url: "/api/auth/login",
        data: JSON.stringify({
            username: user,
            password: pass,
        }),
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        success: callback
    })
}

function displayAllEventsAuth()

function postValidation(data) {
    token = data.authToken;
    $(".username2").val("");
    $(".password2").val("");
    $(".signin-form").attr("class", "hidden");
}

$(".signin-button").click(function(event) {
    event.preventDefault();
    const user2 = $(".username2").val();
    const pass2 = $(".password2").val();
    validateAccount(user2, pass2, postValidation);
    $(".signup-div").attr("class", "hidden");
    $(".login").append(`
        <p class="welcome">Welcome, ${username}</p>
        <button type="button" class="add-event">Add an event</button>
    `)
    filterByRegion(region, displayAllEventsAuth);
})

//replace signup/signin with Welcome ___ and signout (add signout functionality); GET request for conventions filtered by user's region; add buttons for add, edit, delete

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
    getAndDisplayAllFandoms();
}

$(handleApp);