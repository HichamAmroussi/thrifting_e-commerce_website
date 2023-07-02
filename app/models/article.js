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
        default: ""
    },
    image2: {
        type: String,
        default: ""
    },
    image3: {
        type: String,
        default: ""
    },
    image4: {
        type: String,
        default: ""
    },
    isSold: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;