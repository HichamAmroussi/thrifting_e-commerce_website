const express = require('express');
const mongoose = require('mongoose');
// Models
const Article = require('../models/article');
const Order = require('../models/order');
// Middlewares
const upload = require('../utils/multer');

// Express Router
const router = express.Router();

// Routes
router.get('/', (req, res) => {
    Article.find().sort({ isSold: 1, createdAt: -1 })
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
            
                            res.render('./Shop/index', { title: "Shop", articles: articles, articleCategories: data.articleCategories, category: req.query.category });
                        } else {
                            res.render('./Shop/index', { title: "Shop", articles: response, articleCategories: data.articleCategories, category: undefined });
                        }
                    }
                })
        })
        .catch((err) => console.log(err));
});

router.get('/cart', (req, res) => {
    res.render('./Shop/cart', { title: "Cart" });
})

router.get('/checkout', (req, res) => {
    const wilayas = ["01-Adrar", "02-Chlef", "03-Laghouat", "04-Oum El Bouaghi", "05-Batna", "06-Béjaïa", "07-Biskra", "08-Béchar", "09-Blida", "10-Bouïra", "11-Tamanrasset", "12-Tébessa", "13-Tlemcen", "14-Tiaret", "15-Tizi Ouzou", "16-Alger", "17-Djelfa", "18-Jijel", "19-Sétif", "20-Saïda", "21-Skikda", "22-Sidi Bel Abbès", "23-Annaba", "24-Guelma", "25-Constantine", "26-Médéa", "27-Mostaganem", "28-M'Sila", "29-Mascara", "30-Ouargla", "31-Oran", "32-El Bayadh", "33-Illizi", "34-Bordj Bou Arréridj", "35-Boumerdès", "36-El Tarf", "37-Tindouf", "38-Tissemsilt", "39-El Oued", "40-Khenchela", "41-Souk Ahras", "42-Tipaza", "43-Mila", "44-Aïn Defla", "45-Naâma", "46-Aïn Témouchent", "47-Ghardaïa", "48-Relizane", "49-El M'Ghair", "50-El Menia", "51-Ouled Djellal", "52-Bordj Baji Mokhtar", "53-Béni Abbès", "54-Timimoun", "55-Touggourt", "56-Djanet", "57-In Salah", "58-In Guezzam"];

    res.render('./Shop/checkout', { title: "Checkout", wilayas: wilayas });
})

router.post('/checkout', upload.array('article-images', 3), (req, res) => {
    const order = new Order(req.body);

    order.save()
        .then(async (response) => {
            // Set Sold Property of selected items to true
            const articleIds = JSON.parse(req.body.articles);
            const articleObjectIds = articleIds.map((articleId) => mongoose.Types.ObjectId(articleId));

            await Article.updateMany({ _id: { $in: articleObjectIds } }, { $set: { isSold : true } });

            // Redirect to Shop
            res.json({ redirect: "/" });
        })
        .catch((err) => console.log("err"));
})

router.get('/:id', (req, res) => {
    const id = req.params.id;
    
    Article.findById(id)
        .then((response) => {
            res.render('./Shop/details', { title: response.name, article: response });
        })
        .catch((err) => res.redirect('/qsdlkqsd'));
});

module.exports = router;