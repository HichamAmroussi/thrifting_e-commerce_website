//----------------------- Models -----------------------
const Article = require('../models/Article.model');
const Order = require('../models/Order.model');

//----------------------- Functions --------------------
// Get all Articles
const api_get_articles = async (req, res) => {
    try {
        const pending = req.query.p;

        if (req.isAuthenticated()) {
            if(pending) {
                const articles = await Article.find({ isPending: true }).exec();
    
                res.json({ articles: articles });
            } else {
                const articles = await Article.find().exec();
    
                res.json({ articles: articles });
            }
        } else {
            res.send("Access denied.");
        }
    } catch(err) {
        console.log(err);
    }
}

// Get one Article by id
const api_get_article = (req, res) => {
    const id = req.params.id;

    Article
        .findById(id)
        .then((response) => {
            res.json({ article: response });
        })
        .catch((err) => console.log(err));
}

const api_update_articles = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const id = req.params.id;

            // Set Newest Articles as not Newest anymore
            await Article.updateMany({ isPending: false, isNewest: true }, { isNewest: false });
            // Set Pending Articles as not Pending
            await Article.updateMany({ isPending: true }, { isPending: false });

            res.json({});

        } catch(err) {
            console.log(err);
        }
    } else {
        res.send("Access denied.");
    }
}

// Update Article Sold State
const api_update_article_isSold = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const id = req.params.id;

            await Article.findOneAndUpdate({ _id: id }, { isSold: false });

            res.json({});

        } catch(err) {
            console.log(err);
        }
    } else {
        res.send("Access denied.");
    }
}

// Update Article Price
const api_update_article_price = async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const id = req.params.id;
            const newPrice = Number(req.params.price);

            await Article.findOneAndUpdate({ _id: id }, { price: newPrice });

            res.json({});

        } catch(err) {
            console.log(err);
        }

    } else {
        res.send("Access denied.");
    }
}

// Get all Orders
const api_get_orders = (req, res) => {
    if (req.isAuthenticated()) {
        Order
            .find()
                .then((response) => {
                    res.json({ orders: response });
                })
                .catch((err) => console.log(err));

    } else {
        res.send("Access denied.");
    }
}

// Update Order Confirmed Status
const api_update_order_isConfirmed = (req, res) => {
    if (req.isAuthenticated()) {
        const id = req.params.id;
        const orderNewState = (req.params.value === "true");

        Order
            .findOneAndUpdate(
                { _id: id },
                { isConfirmed: orderNewState },
                (error, data) => {
                    if (error) {
                        console.log(error);
                    } else {
                        res.json({});
                    }
                }
            )
    } else {
        res.send("Access denied.");
    }
}

// Update Dashboard Store Data
const api_update_dashboard_data = (req, res) => {
    if (req.isAuthenticated()) {
        // Order Data
        const numberOfArticles = Number(req.params.articles);
        const total = Number(req.params.total);
        // Get the default mongoDB connection
        const db = require('../../app');

        db.collection('data')
            .updateOne(
                {},
                { $inc: { processedOrders: 1, sales: numberOfArticles, totalSales: total } },
                (error, data) => {
                    if (error) {
                        console.log(error);
                    } else {
                        res.json({ redirect: "/dashboard/orders" });
                    }
                }
            )
    } else {
        res.send("Access denied.");
    }
}

// Update Store Settings
const api_update_store_settings = (req, res) => {
    if (req.isAuthenticated()) {
        const index = req.params.id;
        let newCategory = req.params.category;
        // Get the default mongoDB connection
        const db = require('../../app');

        db.collection('settings')
            .updateOne(
                {},
                { $set: { [`articleCategories.${index}.name`]: newCategory } },
                (error, data) => {
                    if (error) {
                        console.log(error);
                    } else {
                        res.json({});
                    }
                }
            )

    } else {
        res.send("Access denied.");
    }
} 

module.exports = {
    api_get_articles,
    api_get_article,
    api_update_articles,
    api_update_article_isSold,
    api_update_article_price,
    api_get_orders,
    api_update_order_isConfirmed,
    api_update_dashboard_data,
    api_update_store_settings
};