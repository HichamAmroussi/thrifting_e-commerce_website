//-----------------------  Packages -------------------------
const mongoose = require('mongoose');
//-----------------------  Models ---------------------------
const Article = require('../models/Article.model');
const Order = require('../models/Order.model');

//----------------------  Functions -------------------------
const shop_index = async (req, res) => {
    try {
        const requestedCategory = req.query.category;
        // Get the default mongoDB connection
        const db = require('../../app');

        // Get Store Settings from DB
        const settings = await db.collection('settings').findOne();

        if (requestedCategory) {
            // Get Articles from DB
            const articles = await Article.find({ isPending: { $ne: true }, category: requestedCategory }).sort({ isSold: 1, createdAt: -1 }).exec();

            res.render('./Shop/index', { title: "Shop", articles: articles, articleCategories: settings.articleCategories, category: requestedCategory });
        } else {
            // Get Articles from DB
            const articles = await Article.find({ isPending: { $ne: true } }).sort({ isSold: 1, createdAt: -1 }).exec();

            res.render('./Shop/index', { title: "Shop", articles: articles, articleCategories: settings.articleCategories, category: undefined });
        }
        
    } catch(err) {
        console.log(err);
    }
}

const shop_article = (req, res) => {
    const id = req.params.id;

    Article.findById(id)
        .then((response) => {
            res.render('./Shop/details', { title: response.name, article: response });
        })
        .catch((err) => res.redirect('/qsdlkqsd'));
}

const shop_cart = (req, res) => {
    res.render('./Shop/cart', { title: "Cart" });
}

const shop_checkout = (req, res) => {
    const wilayas = ["01-Adrar", "02-Chlef", "03-Laghouat", "04-Oum El Bouaghi", "05-Batna", "06-Béjaïa", "07-Biskra", "08-Béchar", "09-Blida", "10-Bouïra", "11-Tamanrasset", "12-Tébessa", "13-Tlemcen", "14-Tiaret", "15-Tizi Ouzou", "16-Alger", "17-Djelfa", "18-Jijel", "19-Sétif", "20-Saïda", "21-Skikda", "22-Sidi Bel Abbès", "23-Annaba", "24-Guelma", "25-Constantine", "26-Médéa", "27-Mostaganem", "28-M'Sila", "29-Mascara", "30-Ouargla", "31-Oran", "32-El Bayadh", "33-Illizi", "34-Bordj Bou Arréridj", "35-Boumerdès", "36-El Tarf", "37-Tindouf", "38-Tissemsilt", "39-El Oued", "40-Khenchela", "41-Souk Ahras", "42-Tipaza", "43-Mila", "44-Aïn Defla", "45-Naâma", "46-Aïn Témouchent", "47-Ghardaïa", "48-Relizane", "49-El M'Ghair", "50-El Menia", "51-Ouled Djellal", "52-Bordj Baji Mokhtar", "53-Béni Abbès", "54-Timimoun", "55-Touggourt", "56-Djanet", "57-In Salah", "58-In Guezzam"];

    res.render('./Shop/checkout', { title: "Checkout", wilayas: wilayas });
}

const shop_create_order = (req, res) => {
    const order = new Order(req.body);

    order.save()
        .then(async () => {
            // Set Sold Property of selected items to true
            const articleIds = JSON.parse(req.body.articles);
            const articleObjectIds = articleIds.map((articleId) => mongoose.Types.ObjectId(articleId));

            await Article.updateMany({ _id: { $in: articleObjectIds } }, { $set: { isSold: true } });

            // Redirect to Shop
            res.json({ redirect: "/" });
        })
        .catch((err) => console.log(err));
}


module.exports = {
    shop_index,
    shop_article,
    shop_cart,
    shop_checkout,
    shop_create_order
};