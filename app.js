// Packages
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const methodOverride = require('method-override');
if(process.env.NODE_ENV !== 'production') {
    require('dotenv/config');
}
// Import Routes
const shopRoutes = require('./routes/shopRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const APIRoutes = require('./routes/APIRoutes');

// Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION)
    .then(() => {
        console.log("connected to the database");
        app.listen(process.env.PORT || 3000);
        console.log("Listening for requests");

        // Get the default mongoDB connection
        const db = mongoose.connection.db;
        module.exports = db;
    })
    .catch((err) => console.log(err));

// MongoDB Session
const store = new MongoDBSession({
    uri: process.env.DB_CONNECTION,
    collection: 'sessions'
})

// Settings (Setting ejs as view engine)
app.set('view engine', 'ejs');

// Middlewares
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// API Routes
app.use('/api/json', APIRoutes);

// Routes
app.get('/', (req, res) => {
    res.redirect('/shop');
})

//shop routes
app.use('/shop', shopRoutes);

//dashboard routes
app.use('/dashboard', dashboardRoutes);

//404 page
app.use((req, res) => {
    res.status(404).render('./Shop/404', { title: "404" });
})