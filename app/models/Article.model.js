const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image_thumbnail: {
        type: String,
        required: true
    },
    image0: {
        type: String,
        required: true
    },
    image1: {
        type: String,
    },
    image2: {
        type: String,
    },
    image3: {
        type: String,
    },
    image4: {
        type: String,
    },
    isSold: {
        type: Boolean,
        default: false,
        required: true
    },
    isPending: {
        type: Boolean,
        default: true,
        required: true
    },
    isNewest: {
        type: Boolean,
        default: true,
        required: true
    }
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;