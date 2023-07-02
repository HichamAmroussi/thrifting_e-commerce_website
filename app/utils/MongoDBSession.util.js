const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);

const store = new MongoDBSession({
    uri: process.env.DB_CONNECTION,
    collection: 'sessions'
})

module.exports = store;