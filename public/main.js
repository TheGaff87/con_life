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
            <article class="js-event ${i}">
                <p class="id hidden">${events[i].id}</p>
                <h3><a href="${events[i].website}" target="_blank">${events[i].name}</a></h3>
                <h3>${dates}</h3>
                <h3>${events[i].location}</h3>
                <button type="button" class="js-guest-list" data-featherlight="#guestlist${i}">
                <h4>Celebrity Guests</h4>
                <div class="hidden js-guests-list ${i}" id="guestlist${i}">
                    <h4>${events[i].name} Celebrity Guests</h4>
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

/*$("main").on("click", ".js-guest-list", function(event) {
    let currentDiv = $(this).parent().find(".js-guests-list");
    $(currentDiv).toggleClass("hidden");
})*/

function getAndDisplayAllEvents() {
    $(".events").prop("hidden", false);
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
    $(".fandom").html(`<option value="all">All</option>`);
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

/*$("main").on("click", "input[required]", function(event) {
    $(this).focusout(function() {
        if($(this).val() === "") {
            $(this).before(`
                <p class="required">This field is required</p>
            `)
        }else if ($(this).val() !== "") {
            $(this).prev("p").html("");
        }
    })
})*/

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
        success: callback,
        error: signupError
    })
}

function signupError() {
    $(".signup-form").before(`
        <p class="incorrect-login">Invalid selection for username/password</p>
    `)
    $(".username1").val("");
    $(".password1").val("");
    $(".user-region").val("----")
}

let username = "";
let userId = "";
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
        <p class="welcome">Welcome, <span class="username-notice">${username}</span></p>
        <button type="button" class="signout">Sign out</button>
        <div class="add-event-div">
        <button type="button" class="add-event-button">Add an event</button>
        <form action="/" method="post" class="add-event-form hidden">
    <label>Name <span class="required">(required)</span>
    <input type="text" size="45" name="event-name" class="event-name" placeholder="Enter event name" required>
    </label>
    <label>Start date <span class="required">(required)</span>
        <input type="date" name="event-start-date" class="event-start-date" required>
    </label>
    <label>End date <span class="required">(required)</span>
        <input type="date" name="event-end-date" class="event-end-date" required>
    </label>
    <label>Location <span class="required">(required)</span>
        <input type="text" size="45" name="event-location" class=" event-location" placeholder="Enter event location" required>
    </label>
    <label>Region <span class="required">(required)</span>
        <select name="event-region" class="event-region" required>
            <option value="northeast">Northeast</option>
            <option value="south">South</option>
            <option value="midwest">Midwest</option>
            <option value="west">West</option>
            <option value="international">International</option>
        </select>
    </label>
    <label>Website <span class="required">(required)</span>
        <input type="url" size="45" name="event-website" class="event-website" placeholder="Enter event website" required>
    </label>
    <label>Fandom <span class="required">(required)</span>
        <input type="text" size="45" name="event-fandom" class="event-fandom" placeholder="If event is not for a particular fandom, enter 'none'" required>
    </label>
    <label>Celebrity Guests
        <textarea rows="4" cols="50" name="event-guests" class="event-guests" placeholder="Enter guest names, separated by commas"></textarea>
    </label>
    <button type="submit" class="submit-event">Submit Event</button>
  </form>  
  </div>
    `)
    $(".events").html("");
    getMyEvents(username, displayMyEvents);
}

function displayAllEventsAuth(data) {
    const events = data.events;
    for (let i = 0; i < events.length; i++) {
        const dates = formatDates(events[i].startDate, events[i].endDate)

        $(".events").append(
            `
            <article class="js-event ${i} col-12">
                <p class="id hidden">${events[i].id}</p>
                <h3><a href="${events[i].website}" target="_blank">${events[i].name}</a></h3>
                <h3>${dates}</h3>
                <h3>${events[i].location}</h3>
                <button type="button" class="js-guest-list" data-featherlight="#guestauth${i}">
                <h4>Celebrity Guests</h4></button>
                <div class="hidden js-guests-list ${i} "id="guestauth${i}">
                    <h4>${events[i].name} Celebrity Guests</h4>
                    <ul class="${i}"></ul>
                <button type="button" class="add-guests">Add guests</button>
                <form action="/events" method="post" class="add-guest-form hidden">
                <p class="id hidden">${events[i].id}</p>
                <label>
        <textarea rows="4" cols="50" name="new-guests" class="new-guests" placeholder="Enter guest names, separated by commas"></textarea>
        </label>
        <button type="submit" class="submit-guests">Submit Guests</button>
        </form>
        </div>
            </article>
            `
        )
        for (let a = 0; a < events[i].guests.length; a++) {
            $(".events ul" + "." + i).append(`<li>${events[i].guests[a]}</li>`);
        }
        if (moment().format("YYYY/MM/DD") > events[i].startDate) {
            $(".events .js-event" + "." + i).append(`
                <button type="button" class="delete-option" data-featherlight="#delete${i}">Delete this event</button>
                <div class="delete-confirm hidden" id="delete${i}">
                <p class="id hidden">${events[i].id}</p>
                <p class="delete-confirm-p">Are you sure you want to delete this event?</p>
                <button type="button" class="delete-event">Permanently delete this event</button>
                </div>
            `)
        }else if (moment().format("YYYY/MM/DD") < events[i].startDate && $(".my-events p").text().indexOf(events[i].id) == -1) {
            $(".events" + " " + "article" + "." + i).append(`
                <button type="button" class="add-my-events">Add to My Events</button> 
            `)
        }
    } 
}

function getMyEvents(user, callback) {
    $.ajax({
        url: "/events/" + user,
        headers: {
            "Authorization": "Bearer " + token
        },
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        success: callback
    })
}

function displayMyEvents(data) {
    if (data.user[0]._id !== undefined) {
        userId = data.user[0]._id;
    }
        $(".my-events").prop("hidden", false);
        const events = data.user[0].events;
        if (events.length > 0) {
            $(".my-events").append(`<h2 class="my-events-h2">My Events</h2>`)
        }
        for (let i = 0; i < events.length; i++) {
            const dates = formatDates(events[i].startDate, events[i].endDate)
    
            $(".my-events").append(
                `
                <article class="js-event ${i}">
                    <p class="id hidden">${events[i]._id}</p>
                    <h3><a href="${events[i].website}" target="_blank">${events[i].name}</a></h3>
                    <h3>${dates}</h3>
                    <h3>${events[i].location}</h3>
                    <button type="button" class="js-guest-list" data-featherlight="#myevent${i}">
                    <h4>Celebrity Guests</h4>
                    <div class="hidden js-guests-list ${i}" id="myevent${i}">
                    <h4>${events[i].name} Celebrity Guests</h4>
                        <ul class="${i}"></ul>
                    </div>
                    </button>
                    <button type="button" class="remove-event-option" data-featherlight="#remove${i}">Remove from My Events</button>
                    <div class="remove-confirm hidden" id="remove${i}">
                    <p class="id hidden">${events[i]._id}</p>
                    <p class="remove-confirm-p">Are you sure you want to remove this event?</p>
                    <button type="button" class="remove-event">Remove this event</button>
                    </div>
                </article>
                `
            )
            for (let a = 0; a < events[i].guests.length; a++) {
                $(".my-events ul" + "." + i).append(`<li>${events[i].guests[a]}</li>`);
          }
    }
    getAllEvents(displayAllEventsAuth);
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
    $(".add-event-form").trigger("reset");
}

$(".login").on("click", ".add-event-button", function(event) {
    $(".add-event-form").toggleClass("hidden");
});

function getFandomsAndEventsAuth() {
    getAndDisplayAllFandoms();
    getAllEvents(displayAllEventsAuth);
}

$(".login").on("click", ".submit-event", function (event) {
    event.preventDefault();
    if ($(".add-event-form").find("input[required]").val() === "") {
        $(".add-event-form").before(`<p class="required enter-all"> Please enter all required fields</p>`)
        $(".add-event-form").trigger("reset");
    }else{
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
    $(".add-event-form").trigger("reset");
    $(".enter-all").html("");
    $(".add-event-form").attr("class", "hidden");
    $(".events").html("")
    addEvent(eventData, getFandomsAndEventsAuth);
    }
})

//PUT endpoint; add guests to event
$("body").on("click", ".add-guests", function(event) {
    const currentForm = $(this).parent().find("form");
    console.log(currentForm);
    $(currentForm).toggleClass("hidden"); 
})

function addGuests(event, data, callback) {
    $.ajax({
        url: "/events/" + event,
        data: JSON.stringify(data),
        headers: {
            "Authorization": "Bearer " + token
        },
        type: "PUT",
        dataType: "json",
        contentType: "application/json",
        success: callback
    })
}

$("body").on("click", ".submit-guests", function(event) {
    event.preventDefault();
    $(".featherlight-close").click();
    if ($(this).parent().find("textarea").val() !== "") {
    const eventId = $(this).parent().children("p").text();
    const currentEl = $(this).parent().find("textarea");
    const eventData = {
        id: eventId,
        guests: $(currentEl).val().split(",")
    }
    $(".events").html("");
    $(".my-events").html("");
    addGuests(eventId, eventData, getAndDisplayAllFandoms);
    getMyEvents(username, displayMyEvents);
    }
})

//PUT endpoint; add event to user
function addEventUser(user, data, callback) {
    $.ajax({
        url: "/api/users/" + user,
        data: JSON.stringify(data),
        headers: {
            "Authorization": "Bearer " + token
        },
        type: "PUT",
        dataType: "json",
        contentType: "application/json",
        success: callback
    })
}

$(".events").on("click", ".add-my-events", function(event) {
    const eventId = $(this).parents("article").children("p").text();
    const userData = {
        id: userId,
        events: eventId
    };
    addEventUser(userId, userData, reloadUserEvents);
})

function reloadUserEvents() {
    $(".my-events").html("");
    $(".events").html("");
    getMyEvents(username, displayMyEvents);
}

//PUT endpoint; remove event from user
function removeEventUser(user, data, callback) {
    $.ajax({
        url: "/events/user/remove/" + user,
        data: JSON.stringify(data),
        headers: {
            "Authorization": "Bearer " + token
        },
        type: "PUT",
        dataType: "json",
        contentType: "application/json",
        success: callback
    })
}

$("body").on("click", ".remove-event", function(event) {
    $(".featherlight-close").click();
    const idEvent = $(this).parent().find(".id").text();
    const userData = {
        id: userId,
        eventId: idEvent
    };
    removeEventUser(userId, userData, reloadUserEvents)
})

//DELETE endpoint; delete event
function deleteEvent(event, callback) {
    $.ajax({
        url: "/events/" + event,
        headers: {
            "Authorization": "Bearer " + token
        },
        type: "DELETE",
        dataType: "json",
        contentType: "application/json",
        success: callback
    })
}

/*$("body").on("click", ".delete-option", function(event) {
    $(this).parent().find(".delete-confirm").removeClass("hidden");
})*/

$("body").on("click", ".delete-event", function(event) {
    $(".featherlight-close").click();
    const eventId = $(this).parent().find(".id").text();
    $(".events").html("");
    deleteEvent(eventId, getFandomsAndEventsAuth)
})


function handleApp() {
    getAndDisplayAllFandoms();
    getAndDisplayAllEvents();
}

$(handleApp);