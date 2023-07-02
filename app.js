//------------ Packages--------------
require('dotenv/config');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
//-------------- Utils --------------
const store = require('./app/utils/MongoDBSession.util');

//-------------- Routes --------------
const shopRoutes = require('./app/routes/Shop.routes');
const dashboardRoutes = require('./app/routes/Dashboard.routes');
const APIRoutes = require('./app/routes/API.routes');

// Express app
const app = express();

//-------- Connect to MongoDB --------
mongoose.connect(process.env.DB_CONNECTION)
    .then(() => {
        console.log("Connected to the Database");
        app.listen(process.env.PORT);
        console.log("Listening for Requests");

        // Get the default mongoDB connection
        const db = mongoose.connection.db;
        module.exports = db;
    })
    .catch((err) => console.log(err));

//------------- Settings -------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/app/views'));
mongoose.set('strictQuery', true);

//------------ Middlewares -----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
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

//-------------- Routes --------------
app.get('/', (req, res) => res.redirect('/shop'));
//shop routes
app.use('/shop', shopRoutes);
//dashboard routes
app.use('/dashboard', dashboardRoutes);
// API Routes
app.use('/api/json', APIRoutes);

//404 page
app.use((req, res) => {
    res.status(404).render('./Shop/404', { title: "404" });
})