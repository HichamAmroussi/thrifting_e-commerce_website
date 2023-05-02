//----------------------- Packages -----------------------
const express = require('express');
const passport = require('passport');
//----------------------- Models -----------------------
const Article = require('../models/article');
const Order = require('../models/order');
//-----------------------  Import Middlewares ----------------------- 
const initializePassport = require('../passport-config');

// Express Router
const router = express.Router();

//-----------------------  Passport Authentification Middleware ----------------------- 
initializePassport(passport);

//----------------------- Routes -----------------------
// Get all Articles
router.get('/articles', (req, res) => {
    if(req.isAuthenticated()) {
        Article
            .find()
                .then((response) => {
                    res.json({ articles: response });
                })
                .catch((err) => console.log(err));
    } else {
        res.send("Access denied.");
    }
});

// Get one Article by id
router.get('/articles/:id', (req, res) => {
    const id = req.params.id;

    Article
        .findById(id)
            .then((response) => {
                res.json({ article: response });
            })
            .catch((err) => console.log(err));
});

// Change isSold property to "false" of one article found by id
router.put('/articles/:id', (req, res) => {
    if(req.isAuthenticated()) {
        const id = req.params.id;

        Article
            .findOneAndUpdate(
                {_id: id},
                {isSold: false},
                (error, data) => {
                    if(error) {
                        console.log(error);
                    } else {
                        res.json({});
                    }
                }
            )

    } else {
        res.send("Access denied.");
    }
});

// Change Price property of one article found by id
router.put('/articles/:id/:price', (req, res) => {
    if(req.isAuthenticated()) {
        const id = req.params.id;
        const newPrice = Number(req.params.price);

        Article
            .findOneAndUpdate(
                {_id: id},
                {price: newPrice},
                (error, data) => {
                    if(error) {
                        console.log(error);
                    } else {
                        res.json({ })
                    }
                }
            )

    } else {
        res.send("Access denied.");
    }
});

// Get all Orders
router.get('/orders', (req, res) => {
    if(req.isAuthenticated()) {
        Order
            .find()
                .then((response) => {
                    res.json({ orders: response });
                })
                .catch((err) => console.log(err));

    } else {
        res.send("Access denied.");
    }
});

// Change isConfirmed property to the opposite initial value of one order found by id
router.put('/orders/:id/:value', (req, res) => {
    if(req.isAuthenticated()) {
        const id = req.params.id;
        const value = (req.params.value === "true");

        Order
            .findOneAndUpdate(
                {_id: id},
                {isConfirmed: !value},
                (error, data) => {
                    if(error) {
                        console.log(error);
                    } else {
                        res.json({ redirect: "/dashboard/orders" });
                    }
                }
            )  
    } else {
        res.send("Access denied.");
    }
});

// Update Dashboard Store Data
router.put('/data/:articles/:total', async (req, res) => {
    if(req.isAuthenticated()) {
        // Order Data
        const numberOfArticles = Number(req.params.articles);
        const total = Number(req.params.total);
        // Get the default mongoDB connection
        const db = require('../app');

        db.collection('data')
            .updateOne(
                {},
                { $inc: { processedOrders: 1, sales: numberOfArticles, totalSales: total } },
                (error, data) => {
                    if(error) {
                        console.log(error);
                    } else {
                        res.json({ redirect: "/dashboard/orders" });
                    }
                }
            )
    } else {
        res.send("Access denied.");
    }
});

// Update Settings
router.put('/settings/:id/:category', (req, res) => {
    if(req.isAuthenticated()) {
        const index = req.params.id;
        let newCategory = req.params.category;
        // Get the default mongoDB connection
        const db = require('../app');

        db.collection('settings')
            .updateOne(
                {},
                { $set: { [`articleCategories.${index}.name`]: newCategory } },
                (error, data) => {
                    if(error) {
                        console.log(error);
                    } else {
                        res.json({ });
                    }
                }
            )

    } else {
        res.send("Access denied.");
    }
});

module.exports = router;