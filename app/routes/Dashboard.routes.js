// Packages
const express = require('express');
const passport = require('passport');
// Controller
const dashboardController = require('../controllers/Dashboard.controller');
// Middlewares
const initializePassport = require('../middleware/PassportConfig.middleware');
const upload = require('../middleware/Multer.middleware');

// Express Router
const router = express.Router();

//-----------------------  Passport Authentification Middleware ----------------------- 
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect('/dashboard/login');
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }

    next();
}

initializePassport(passport);

//----------------------- Routes --------------------------
//------------ Login Routes ------------
router.get('/login', checkNotAuthenticated, dashboardController.dashboard_login);

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/dashboard/login',
    failureFlash: true
}))

router.delete('/logout', dashboardController.dashboard_logout);

//------------ Dashboard Routes ------------
// Index
router.get('/', checkAuthenticated, dashboardController.dashboard_index);
// Manage Articles
router.get('/manage-articles', checkAuthenticated, dashboardController.dashboard_manageArticles);
router.post('/manage-articles', upload.array('article-images', 5), dashboardController.dashboard_create_article);
router.get('/manage-articles/articles', checkAuthenticated, dashboardController.dashboard_articles);
router.delete('/manage-articles/articles/:id', dashboardController.dashboard_delete_article);
// Orders
router.get('/orders', checkAuthenticated, dashboardController.dashboard_orders);
router.delete('/orders/:id', dashboardController.dashboard_delete_order);
// Settings
router.get('/settings', checkAuthenticated, dashboardController.dashboard_settings);

module.exports = router;