const express = require('express');
// Controller
const shopController = require('../controllers/Shop.controller');

// Express Router
const router = express.Router();

// Routes
router.get('/', shopController.shop_index);
router.get('/cart', shopController.shop_cart)
router.get('/checkout', shopController.shop_checkout)
router.post('/checkout', shopController.shop_create_order);
router.get('/:id', shopController.shop_article);

module.exports = router;