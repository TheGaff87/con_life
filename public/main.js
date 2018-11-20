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
    $(".fandom").val("all");
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
    $(".region").val("all");
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
let token = "";

function accountFollowUp() {
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

function authError() {
    $(".signin-form").before(`
        <p class="incorrect-login">Incorrect username/password</p>
    `)
    $(".username2").val("");
    $(".password2").val("");
}

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
        success: callback,
        error: authError
    })
}

function postValidation(data) {
    token = data.authToken;
    $(".username2").val("");
    $(".password2").val("");
    $(".signin-form").attr("class", "hidden");
    $(".signup-div").attr("class", "hidden");
    $(".signin-div").attr("class", "hidden");
    $(".login").append(`
        <p class="welcome">Welcome, ${username}</p>
        <button type="button" class="signout">Sign out</button>
        <div class="add-event-div">
        <button type="button" class="add-event-button">Add an event</button>
        <form action="/events" method="post" class="add-event-form hidden">
    <label>Name
    <input type="text" size="45" name="event-name" placeholder="Enter event name" required>
    </label>
    <label>Start date
        <input type="date" name="event-start-date" required>
    </label>
    <label>End date
        <input type="date" name="event-end-date" required>
    </label>
    <label>Location
        <input type="text" size="45" name="event-location" placeholder="Enter event location" required>
    </label>
    <label>Region
        <select name="event-region" required>
            <option value="northeast">Northeast</option>
            <option value="south">South</option>
            <option value="midwest">Midwest</option>
            <option value="west">West</option>
            <option value="international">International</option>
        </select>
    </label>
    <label>Website
        <input type="url" size="45" name="event-website" placeholder="Enter event website" required>
    </label>
    <label>Fandom
        <input type="text" size="45" name="event-fandom" placeholder="If event is not for a particular fandom, enter 'none'" required>
    </label>
    <label>Celebrity Guests
        <textarea rows="4" cols="50" name="event-guests" placeholder="Enter guest names, separated by commas"></textarea>
    </label>
    <button type="submit-event">Submit Event</button>
  </form>  
  </div>
    `)
    $(".events").html("");
    getAllEvents(displayAllEventsAuth);
}

function displayAllEventsAuth(data) {
    const events = data.events;
    for (let i = 0; i < events.length; i++) {
        const dates = formatDates(events[i].startDate, events[i].endDate)

        $(".events").append(
            `
            <article class="js-event ${i}">
                <p class="id hidden">${events[i].id}</p>
                <h3><a href="${events[i].website}" target="_blank">${events[i].name}</a></h3>
                <h3>${dates}</h3>
                <h3>${events[i].location}</h3>
                <button type="button" class="js-guest-list"><h4>Celebrity Guests</h4>
                <div class="hidden js-guests-list ${i}">
                    <ul class="${i}"></ul>
                </div>
                <button type="button" class="add-guests">Add guests</button>
                </button>
            </article>
            <article class="my-events">
            </article>
            `
        )
        for (let a = 0; a < events[i].guests.length; a++) {
            $(".events ul" + "." + i).append(`<li>${events[i].guests[a]}</li>`);
        }
        if (moment().format("YYYY/MM/DD") > events[i].startDate) {
            $(".js-event").append(`
                <button type="button" class="delete-event">Delete this event</button>
            `)
        }else if (moment().format("YYYY/MM/DD") < events[i].startDate) {
            $("article" + "." + i).append(`
                <button type="button" class="add-my-events">Add to My Events</button> 
            `)
        }
    }    
}

$(".signin-button").click(function(event) {
    event.preventDefault();
    const user2 = $(".username2").val();
    username = user2;
    const pass2 = $(".password2").val();
    validateAccount(user2, pass2, postValidation);
})

$(".login").on("click", ".signout", function(event) {
    location.reload(true);
})

//POST endpoint; add an event
function addEvent(data, callback) {
    $.ajax({
        url: "/events",
        data: JSON.stringify(data),
        headers: {
            "Authorization": "Bearer " + token
        },
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        success: callback,
        error: addEventError
    })
}

function addEventError() {
    $(".add-event-button").after(`
        <p class="add-error">Event already exists</p>  
    `)
    $(".add-event-form").reset();
}

$(".login").on("click", ".add-event-button", function(event) {
    $(".add-event-form").toggleClass("hidden");
});

$(".login").on("click", ".submit-event", function (event) {
    event.preventDefault();
    const eventData = {
        name: $(".event-name").val(),
        startDate: moment($(".event-start-date").val()).format("YYYY/MM/DD"),
        endDate: moment($(".event-end-date").val()).format("YYYY/MM/DD"),
        location: $(".event-location").val(),
        region: $(".event-region").val(),
        website: $(".event-website").val(),
        fandom: $(".event-fandom").val(),
        guests: $(".event-guests").val().split(",")
    }
    $(".add-event-form").reset();
    $(".add-event-form").attr("class", "hidden");
    addEvent(eventData, getAndDisplayAllFandoms);
    getAllEvents(displayAllEventsAuth);
})

//PUT endpoint
$(".events").on("click", ".add-guests", function(event) {
    let currentEl = $(this).parent();
    $(currentEl).append(`
    <form action="/events" method="put" class="add-event-form">
    <label>Additional Guests
        <textarea rows="4" cols="50" name="event-guests" placeholder="Enter guest names, separated by commas"></textarea>
    </label>
    <button type="submit-guests">Submit Guests</button>
  </form>    
    `)
})

function addGuests(event, callback) {
    $.ajax({
        url: "/events" + event,
        headers: {
            "Authorization": "Bearer " + token
        },
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        success: callback
    })
}

$(".events").on("click", ".submit-guests", function(event) {
    event.preventDefault();
    const eventId = $(this).parent().find("p").attr("class", "id").val();
    console.log(eventId);
    addGuests(eventId, getAllEvents(displayAllEventsAuth))
})

//DELETE endpoint
$(".events").on("click", ".delete-event", function(event) {
    let currentDiv = $(this).parent()
    $(currentDiv).remove();
    handleApp();
})


function handleApp() {
    getAndDisplayAllFandoms();
    getAndDisplayAllEvents();
}

$(handleApp);