//-----------------------  Models ---------------------------
const Article = require('../models/Article.model');
const Order = require('../models/Order.model');
//-----------------------  Utils ----------------------------
const cloudinary = require('../utils/Cloudinary.util');

//----------------------  Functions -------------------------
//------------ Login Functions ------------
const dashboard_login = (req, res) => {
    res.render('./Dashboard/login', { title: "Log in" });
}

const dashboard_logout = (req, res) => {
    req.logOut(function(err) {
        if (err) { 
            return next(err); 
        }
        
        res.redirect('/dashboard/login');
    });
}

//------------ Dashboard Functions ------------
//------------ Index
const dashboard_index = (req, res) => {
    // Get the default mongoDB connection
    const db = require('../../app');

    db.collection('data').findOne()
        .then((response) => {
            res.render('./Dashboard/dashboard', { title: "Dashboard", data: response });
        })
        .catch((err) => console.log(err));
}

//------------ Manage Articles
const dashboard_manageArticles = (req, res) => {
    // Get the default mongoDB connection
    const db = require('../../app');

    db.collection('settings')
        .findOne((error, data) => {
            if(error) {
                console.log(error);
            } else {
                res.render('./Dashboard/manage-articles', { title: "Manage Articles", articleCategories: data.articleCategories });
            }
        })
}

const dashboard_create_article = async (req, res) => {
    if(req.isAuthenticated()) {
        try {
            const articleData = req.body;
    
            // Uploading the Thumbnail
            const cloudinaryResult = await cloudinary.uploader.upload(req.files[0].path, { width: 600 });
    
            // Add Thumbnail Property to Article Object
            articleData["image_thumbnail"] = cloudinaryResult.secure_url;
            articleData["image_thumbnail_id"] = cloudinaryResult.public_id;
    
            for(let i = 0; i < req.files.length; i++) {
                const cloudinaryResult = await cloudinary.uploader.upload(req.files[i].path);

                // Add Properties to Article
                articleData["image" + i] = cloudinaryResult.secure_url;
                articleData["image" + i + "_id"] = cloudinaryResult.public_id;
            }
    
            // Save Article to Database
            const article = new Article(articleData);
    
            article.save()
                .then((response) => {
                    res.redirect('/dashboard/manage-articles');
                })
                .catch((err) => console.log(err));
    
        } catch(err) {
            console.log(err);
        }
    } else {
        res.redirect('/dashboard/login');
    }
}

const dashboard_articles = async (req, res) => {
    try {
        const requestedCategory = req.query.category;
        // Get the default mongoDB connection
        const db = require('../../app');
        
        // Get Store Settings from DB
        const settings = await db.collection('settings').findOne();

        if(requestedCategory) {
            // Get Articles from DB
            const articles = await Article.find({ category: requestedCategory }).sort({ createdAt: -1 }).exec();

            res.render('./Dashboard/article-list', { title: "Article List", articles: articles, articleCategories: settings.articleCategories, category: requestedCategory });
        } else {
            // Get Articles from DB
            const articles = await Article.find().sort({ createdAt: -1 }).exec();
            
            res.render('./Dashboard/article-list', { title: "Article List", articles: articles, articleCategories: settings.articleCategories, category: undefined });
        }
    } catch(err) {
        console.log(err);
    }
}

const dashboard_delete_article = (req, res) => {
    if(req.isAuthenticated()) {
        const id = req.params.id;

        Article.findByIdAndDelete(id)
            .then(async (response) => {
                try {
                    let imageIds = [];

                    imageIds.push(response["image_thumbnail_id"]);

                    for(let i = 0; i <= 4; i++) {
                        if(response["image" + i + "_id"]) {
                            imageIds.push(response["image" + i + "_id"]);
                        }
                    }

                    // Delete All Images in Cloudinary 
                    await cloudinary.api.delete_resources(imageIds);

                    res.json({ redirect: "/dashboard/manage-articles/articles" });

                } catch(error) {
                    console.error('there was an error:', error.message);
                }
            })
            .catch((err) => console.log(err));

    } else {
        res.redirect('/dashboard/login');
    }
}

//------------ Orders
const dashboard_orders = (req, res) => {
    res.render('./Dashboard/orders', { title: "Orders"});
}

const dashboard_delete_order = (req, res) => {
    if(req.isAuthenticated()) {
        
        const id = req.params.id;

        Order.findByIdAndDelete(id)
            .then(response => {
                res.json({ redirect: "/dashboard/orders" });
            })
            .catch((err) => console.log(err));

    } else {
        res.redirect('/dashboard/login');
    }
}

//------------ Settings
const dashboard_settings = (req, res) => {
    // Get the default mongoDB connection
    const db = require('../../app');

    db.collection('settings')
        .findOne((error, data) => {
            if(error) {
                console.log(error);
            } else {
                res.render('./Dashboard/settings', { title: "Settings", articleCategories: data.articleCategories });
            }
        })
}

module.exports = {
    dashboard_login,
    dashboard_logout,
    dashboard_index,
    dashboard_manageArticles,
    dashboard_create_article,
    dashboard_articles,
    dashboard_delete_article,
    dashboard_orders,
    dashboard_delete_order,
    dashboard_settings
};