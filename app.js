var express = require("express");
var path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
require("dotenv").config({ path: "./config/.env" });

var book_routes = require('./routes/books');

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const HBS = exphbs.create({
  //create customer helper
  helpers: {
    isArray: function (value) {
    return Array.isArray(value);
  },
  json: function(context){
    return JSON.stringify(context);
  }
},
  defaultLayout: "main",
  extname: ".hbs",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
}
});

var url = process.env.URL;
mongoose.connect(url);
let db = mongoose.connection;

// Check connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Check for DB errors
db.on("error", function (err) {
  console.log("DB Error");
});

//ROUTES
//Initialize handlebar as template engine
app.engine(".hbs", HBS.engine);
app.set("view engine", "hbs");

// Define a route to render the index page
app.get("/", (req, res) => {
  res.render("index", { title: "MongoDB App" }); // layout: false to use the raw HTML without additional layout
});

app.use("/books", book_routes)

app.get("*", function (req, res) {
  res.render("error", { title: "Error", message: "Wrong Route" });
});

// Set constant for port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
