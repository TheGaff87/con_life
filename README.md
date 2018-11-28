# Con Life

A crowd-sourced database for fan conventions across the United States and around the world. All users can view events. Users who create an account can add events, updates guests for upcoming events, and save events to their own collection.

## Link to live app: 
https://con-life.herokuapp.com/#

## Screenshots:

### Screenshot of landing page: ![Landing page](/screenshots/landing_page.png)

### Screenshot of events page: ![Events page](/screenshots/events_page.png)

### Screenshot of events page after login: ![Events page logged in](/screenshots/events_page_auth.png)

### Screenshot of saved events page (only accessible when logged in): ![Saved events](/screenshots/saved_events.png)

### Screenshot of 'Add Event' form (only accessible when logged in: ![Add Event form](/screenshots/add_event.png)

## Technologies used: 
HTML5/CSS3/JavaScript/jQuery/Node/Express/Mocha/Chai

## API Documentation
### POST request to '/api/users/':
Used to create new user account. Expects a JSON object containing a string username and a password between 5 and 72 characters. Creates user account and returns a JSON object containing username.

### POST request to '/api/auth/login':
Used to create authToken for existing user account. Expects a JSON object containing previously created username and password. Returns JSON object containing "authToken" that must be included as a header for all requests to protected endpoints.

### GET request to '/events':
Returns JSON object containing all events

### GET request to '/events/region/:term':
Expects parameter containing requested region. Returns JSON object containing all events in the selected region.

### GET request to '/events/fandom/:term':
Expects parameter containing requested fandom. Returns JSON object containing all events for the selected fandom.

### GET request to '/events/:username' (requires authToken):
Expects parameter containing username. Returns document for selected user, including their saved events.

### POST request to '/events' (requires authToken):
Used to add new event. Expects JSON object containing all required fields ('name', 'startDate', 'endDate', 'fandom', 'region', 'location', 'website'.) Gives response status of 201 when successful.

### PUT request to '/events/:id' (requires authToken):
Used to add guests to existing event. Expects parameter containing event ID and JSON object containing event ID as well as a 'guests' key with an array of names as the value. Yields response status 204 when successful.

### PUT request to '/api/users/:id' (requires authToken):
Used to add saved events to user. Expects parameter containing userID and a JSON object containing user ID as well as an 'events' key with a value of the event ID(s) to be added. Yields response status of 204 when successful.

### PUT request to '/events/user/remove/:id' (requires authToken):
Used to remove saved events from user. Expects parameter containing userID and a JSON object containing user ID as well as an 'eventId' key with a value of the event ID(s) to be removed. Returns updated user document.

### DELETE request to '/events/:id' (requires authToken):
Used to delete events from database. Expects parameter containing eventID to be deleted. Yields response status 204 when successful.



