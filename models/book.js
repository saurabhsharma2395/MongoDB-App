let mongoose = require("mongoose");

let bookSchema = mongoose.Schema({
    ISBN: {
        type: String,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    inventory: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
});


let books = module.exports = mongoose.model("book", bookSchema);