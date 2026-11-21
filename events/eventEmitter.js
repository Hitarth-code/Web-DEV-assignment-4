// events/eventEmitter.js
const EventEmitter = require('events');

const appEvents = new EventEmitter();

appEvents.on('user_registered', (user) => {
    console.log(`[Event] New user registered: ${user.username} (${user.email})`);
});

appEvents.on('user_login', (user) => {
    console.log(`[Event] User logged in: ${user.username || user.email}`);
});

appEvents.on('note_created', (note) => {
    console.log(`[Event] New note created: "${note.title}" by owner ${note.owner}`);
});

module.exports = appEvents;
