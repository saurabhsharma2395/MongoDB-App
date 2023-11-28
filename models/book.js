/******************************************************************************
 *
 *	ITE5315 – Assignment 4
 *	I declare that this assignment is my own work in accordance with Humber Academic Policy.
 *	No part of this assignment has been copied manually or electronically from any other source
 *	(including web sites) or distributed to other students.
 *
 *	Name: Saurabh Sharma 	Student ID: N01543808	Date: November 27, 2023
 *
 *
 ******************************************************************************/
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