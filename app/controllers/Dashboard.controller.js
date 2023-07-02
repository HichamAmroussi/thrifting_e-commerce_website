//-----------------------  Packages -------------------------
const sharp = require('sharp');
const path = require('path');
const { unlink } = require('fs/promises');
//-----------------------  Models ---------------------------
const Article = require('../models/Article.model');
const Order = require('../models/Order.model');

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
    
            // Create Thumbnail
            // Thumbnail File Name
            const thumbFileName = Date.now() + '--thumbnail' + path.extname(req.files[0].filename).toLowerCase();
            // Resize Image0 and Save File with its declared File Name
            await sharp(req.files[0].path)
                .resize({ width: 600 })
                .toFile("public/images/article_images/" + thumbFileName);
    
            // Add Thumbnail Property to Article Object
            articleData["image_thumbnail"] = "/images/article_images/" + thumbFileName;
    
            for(let i = 0; i < req.files.length; i++) {
                // Add Image Property to Article Object
                articleData["image" + i] = "/images/article_images/" + req.files[i].filename;
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
                    // Delete Thumbnail Image from Server
                    await unlink("public" + response["image_thumbnail"]);

                    // Delete Article Images from Server
                    for(let i = 0; i <= 4; i++) {
                        if(response["image" + i]) {
                            // Delete Image
                            await unlink("public" + response["image" + i]);
                        }
                    }

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