//---------------------- Packages ------------------------
const express = require('express');
const passport = require('passport');
//-------------------- Controller ------------------------ 
const apiController = require('../controllers/API.controller');
//-------------------- Middlewares ----------------------- 
const initializePassport = require('../middleware/PassportConfig.middleware');

// Express Router
const router = express.Router();

//--------- Passport Authentication Middleware -----------
initializePassport(passport);

//----------------------- Routes -----------------------
// Get all Articles
router.get('/articles', apiController.api_get_articles);
// Get one Article by id
router.get('/articles/:id', apiController.api_get_article);
// Change isSold property to "false" of one article found by id
router.put('/articles/:id', apiController.api_update_article_isSold);
// Change Price property of one article found by id
router.put('/articles/:id/:price', apiController.api_update_article_price);
// Get all Orders
router.get('/orders', apiController.api_get_orders);
// Change isConfirmed property to the opposite initial value of one order found by id
router.put('/orders/:id/:value', apiController.api_update_order_isConfirmed);
// Update Dashboard Store Data
router.put('/data/:articles/:total', apiController.api_update_dashboard_data);
// Update Settings
router.put('/settings/:id/:category', apiController.api_update_store_settings);

module.exports = router;