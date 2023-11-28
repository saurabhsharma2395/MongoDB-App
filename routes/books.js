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
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const books = require("../models/book");

// Middleware function to load data using Mongoose
const loadBooksData = function (req, res, next) {
  const perPage = 10;
  const page = parseInt(req.query.page) || 1; // Get the requested page number or default to 1

  // Use countDocuments for asynchronous counting
  books.countDocuments().then((totalBooks) => {
    const totalPages = Math.ceil(totalBooks / perPage);

    // Check if the requested page is valid
    if (page < 1 || page > totalPages) {
      return res.status(404).render("error", {
        title: "Error",
        message: "Page not found.",
      });
    }

    books
      .find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .then((foundBooks) => {
        req.booksData = foundBooks;
        req.currentPage = page;

        // Calculate pagination values
        req.prevPage = page > 1 ? page - 1 : null;
        req.nextPage = page < totalPages ? page + 1 : null;

        next();
      })
      .catch((err) => {
        console.error("Error loading books data.", err);
        res.status(500).render("error", {
          title: "Error",
          message: "Error loading books data.",
        });
      });
  });
};

// Function to search for a book by ISBN and render the result
async function searchBookByISBN(isbn, res) {
  try {
    const book = await books.findOne({ ISBN: isbn });

    if (!book) {
      res.render("display_limit", {
        title: "Search Results",
        body: "No book found with the given ISBN.",
      });
    } else {
      res.render("display_limit", {
        title: "Search Results",
        books_handle: [book],
      });
    }
  } catch (err) {
    console.error("Error searching for book: ", err);
    res.status(500).render("error", {
      title: "Error",
      message: "Error searching for book.",
    });
  }
}

// Your route using the middleware
router.route("/all").get(loadBooksData, (req, res) => {
  if (req.xhr) {
    // If it's an AJAX request, send a JSON response
    res.json({
      books_handle: req.booksData,
      prevPage: req.prevPage,
      nextPage: req.nextPage,
    });
  } else {
    // If it's not an AJAX request, render the view
    res.render("display", {
      heading: "All Books",
      books_handle: req.booksData,
      prevPage: req.prevPage,
      nextPage: req.nextPage,
    });
  }
});

router.get("/search/ISBN", (req, res) => {
  res.render("search", {
    parameter: "ISBN",
    route: "/search/ISBN",
  });
});

// Route to handle the form submission and search for the book by ISBN
router.post("/search/ISBN", async (req, res) => {
  const isbn = req.body.var_InputText;
  searchBookByISBN(isbn, res);
});

// GET route to display the author search form
router.get("/search/author", (req, res) => {
  res.render("search", {
    title: "Search Books by Author",
    parameter: "Author",
    route: "/search/author",
  });
});

router.post("/search/author", async (req, res) => {
  try {
    const authorSearch = req.body.var_InputText;
    const books_dat = await books.find({
      author: { $regex: authorSearch, $options: "i" },
    });

    if (books_dat.length === 0) {
      return res.render("display_author", {
        title: "Search Results",
        body: "No books found for the given author.",
      });
    }

    res.render("display_author", {
      title: "Books by Author",
      bookData: books_dat,
      heading: `Books by Author: ${authorSearch}`,
    });
  } catch (err) {
    // Handle errors by rendering the error template
    res.status(500).render("error", {
      title: "Error",
      message: "Error searching for books.",
    });
  }
});

router.get("/search/:ISBN", async (req, res) => {
  const isbn = req.params.ISBN;
  searchBookByISBN(isbn, res);
});

router.get("/insert", (req, res) => {
  res.render("insert_book", { action_type: "/insert" });
});

const bookValidationRules = [
  check("ISBN")
    .isLength({ min: 6, max: 13 })
    .withMessage("ISBN must be between 10 and 13 characters long."),
  check("title").not().isEmpty().withMessage("Title is required."),
  check("author").not().isEmpty().withMessage("Author is required."),
  check("inventory")
    .isInt({ gt: 0 })
    .withMessage("Inventory must be a positive integer."),
  check("category").not().isEmpty().withMessage("Category is required."),
  check("img").not().isEmpty().withMessage("Image Link is required."),
];

router.post("/insert", bookValidationRules, async (req, res) => {
  const errors_list = validationResult(req);
  if (!errors_list.isEmpty()) {
    const formattedErrors = {};
    errors_list.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).render("insert_book", {
      errors: formattedErrors,
      formData: req.body,
    });
  }

  try {
    const newBookData = {
      ISBN: req.body.ISBN,
      title: req.body.title,
      author: req.body.author,
      inventory: req.body.inventory,
      category: req.body.category,
      img: req.body.img,
    };

    const newBook = new books(newBookData);
    await newBook.save();

    res.redirect(`/books/search/${newBookData.ISBN}`);
  } catch (err) {
    console.error("Error adding new book: ", err);
    res.status(500).render("error", {
      title: "Error",
      message: "Error adding new book",
    });
  }
});

router.get("/delete", (req, res) => {
  res.render("search", {
    title: "Delete Book",
    parameter: "ISBN",
    route: "/delete",
  });
});

router.post("/delete", async (req, res) => {
  try {
    const isbn = req.body.var_InputText;
    const result = await books.deleteOne({ ISBN: isbn });

    if (result.deletedCount === 0) {
      return res.render("display_limit", {
        title: "Delete book",
        body: "No records found corresponding to given ISBN",
      });
    }
    res.render("display_limit", {
      title: "Delete book",
      body: "Record successfully deleted.",
    });
  } catch (err) {
    console.error("Error deleting book: ", err);
    res.status(500).render("error", {
      title: "Error",
      message: "Error deleting book",
    });
  }
});

router.get("/update", (req, res) => {
  res.render("search", {
    title: "Update Book",
    parameter: "ISBN",
    route: "/update",
  });
});

router.post("/update", async (req, res) => {
  try {
    const isbn = req.body.var_InputText;
    const book = await books.findOne({ ISBN: isbn });

    if (!book) {
      return res.status(500).render("error", {
        title: "Error",
        message: "No book found with that ISBN.",
      });
    }

    res.render("insert_book", {
      title: "Edit Book",
      formData: book,
      action_type: "/update/version",
    });
  } catch (err) {
    console.error("Error finding book: ", err);
    res.status(500).render("error", {
      title: "Error",
      message: "Error finding book",
    });
  }
});

router.post("/update/version", async (req, res) => {
  try {
    const isbn = req.body.ISBN; // Assuming ISBN is the unique identifier
    const updatedData = {
      title: req.body.title,
      author: req.body.author,
      inventory: req.body.inventory,
      category: req.body.category,
      img: req.body.img,
    };

    await books.findOneAndUpdate({ ISBN: isbn }, updatedData);

    res.render("display_limit", {
      title: "Update book",
      body: "Book successfully updated.",
    });
  } catch (err) {
    console.error("Error updating book: ", err);
    res.status(500).render("error", {
      title: "Error",
      message: "Error updating book",
    });
  }
});

module.exports = router;
