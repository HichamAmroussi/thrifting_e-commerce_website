//-----------------------  Packages ----------------------- 
const express = require('express');
const passport = require('passport');
const sharp = require('sharp');
const path = require('path');
const { unlink } = require('fs/promises');
//-----------------------  Models ----------------------- 
const Article = require('../models/article');
const Order = require('../models/order');
//-----------------------  Import Middlewares ----------------------- 
const initializePassport = require('../passport-config');
const upload = require('../utils/multer');

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
        return res.redirect('/dashboard/dashboard');
    }

    next();
}

initializePassport(passport);

//----------------------- Routes --------------------------
router.get('/', (req, res) => {
    res.redirect('/dashboard/dashboard');
})

//------------ Login Routes ------------
router.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('./Dashboard/login', { title: "Log in" });
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/dashboard/dashboard',
    failureRedirect: '/dashboard/login',
    failureFlash: true
}))

router.delete('/logout', (req, res) => {
    req.logOut(function(err) {
        if (err) { 
            return next(err); 
        }
        
        res.redirect('/dashboard/login');
    });
})

//------------ Dashboard Routes ------------
router.get('/dashboard', checkAuthenticated, (req, res) => {
    // Get the default mongoDB connection
    const db = require('../app');

    db.collection('data').findOne()
        .then((response) => {
            res.render('./Dashboard/dashboard', { title: "Dashboard", data: response });
        })
        .catch((err) => console.log(err));
});

router.get('/manage-articles', checkAuthenticated, (req, res) => {
    // Get the default mongoDB connection
    const db = require('../app');

    db.collection('settings')
        .findOne((error, data) => {
            if(error) {
                console.log(error);
            } else {
                res.render('./Dashboard/manage-articles', { title: "Manage Articles", articleCategories: data.articleCategories });
            }
        })
});

router.post('/manage-articles', upload.array('article-images', 5) , async (req, res) => {
    if(req.isAuthenticated()) {
        try {
            const articleData = req.body;
    
            // Create Thumbnail
            // Thumbnail File Name
            const thumbFileName = Date.now() + '--thumbnail' + path.extname(req.files[0].filename).toLowerCase();
            // Resize Image0 and Save File with its declared File Name
            await sharp(req.files[0].path)
                .resize({ width: 600 })
                .toFile("public/article_images/" + thumbFileName);
    
            // Add Thumbnail Property to Article Object
            articleData["image_thumbnail"] = "/article_images/" + thumbFileName;
    
            for(let i = 0; i < req.files.length; i++) {
                // Add Image Property to Article Object
                articleData["image" + i] = "/article_images/" + req.files[i].filename;
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
});

router.get('/manage-articles/articles', checkAuthenticated, (req, res) => {
    Article.find().sort({ createdAt: -1 })
        .then((response) => {
            // Get the default mongoDB connection
            const db = require('../app');

            db.collection('settings')
                .findOne((error, data) => {
                    if(error) {
                        console.log(error);
                    } else {
                        if(req.query.category) {
                            const articles = response.filter((item) => item.category === req.query.category);
            
                            res.render('./Dashboard/article-list', { title: "Article List", articles: articles, articleCategories: data.articleCategories, category: req.query.category });
                        } else {
                            res.render('./Dashboard/article-list', { title: "Article List", articles: response, articleCategories: data.articleCategories, category: undefined });
                        }
                    }
                })
        })
        .catch((err) => console.log(err));
});

router.delete('/manage-articles/articles/:id', (req, res) => {
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

                } catch (error) {
                    console.error('there was an error:', error.message);
                }
            })
            .catch((err) => console.log(err));

    } else {
        res.redirect('/dashboard/login');
    }
})

router.get('/orders', checkAuthenticated,(req, res) => {
    res.render('./Dashboard/orders', { title: "Orders"});
});

router.delete('/orders/:id', (req, res) => {
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
})

router.get('/settings', checkAuthenticated,(req, res) => {
    // Get the default mongoDB connection
    const db = require('../app');

    db.collection('settings')
        .findOne((error, data) => {
            if(error) {
                console.log(error);
            } else {
                res.render('./Dashboard/settings', { title: "Settings", articleCategories: data.articleCategories });
            }
        })
});

module.exports = router;