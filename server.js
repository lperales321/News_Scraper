// Dependencies
var express = require("express");
var db = require("./models/Article.js");
var mongoose = require("mongoose");

// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";
mongoose.connect(MONGODB_URI);


db.on("error", function(error) {
  console.log("Database Error:", error);
});

var ObjectID = require('mongodb').ObjectID; 

// Scrape data from one site and place it into the mongodb db
app.get("/", function(req, res) {
  // Make a request via axios
  axios.get("https://www.nature.com/natastron/articles").then(function(response) {

    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);

    //For each article class
    $("article").each(function(i, element) {
      //Save the title, link, date, author and summary of current article
      let title = ($(element).children('div').children('h3').children('a').text()).trim();
      let link = "https://www.nature.com" + $(element).children('div').children('h3').children('a').attr('href');
      let articleDate = $(element).children('div').children('p').children('time').text();
      let author = $(element).children('div').children('ul').children('li').children('span').text();
      let summary = $(element).children('div').children('div').children('p').text();

      //If this found element had a title, link, articleDate, author, summary
      if (title && link && articleDate && author && summary) {
        var scrapedArticle = {
          title,
          link,
          articleDate,
          author,
          summary,
          saved: false
        };

        // Insert the data in the scrapedData db
        db.create(scrapedArticle)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
      }
    });
  })
  .catch(error => {
    console.log(error)
  })

  res.redirect("/getAll");

});

// Retrieve data from the db
app.get("/getAll", function(req, res) {

  // Find all results from the scrapedData collection in the db
  db.find({saved: false}, function(error, data) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.render("index", {data});
    }
  });
});

// Retrieve data from the db
app.get("/saved", function(req, res) {

  // Find all results from the scrapedData collection in the db
  db.find({saved: true}, function(error, data) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.render("saved", {data});
    }
  });
});

// Retrieve data from the website
app.get("/scrape", function(req, res) {
  res.redirect("/");
});

// Update data on the db
app.post("/article/:id", function(req, res) {
  let dataId = req.params.id;
  console.log(dataId);

  // Update save article
  db.update({'_id': ObjectID(dataId)}, {$set: {saved: true}}, function(error, data) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      //res.render("index", {saved});
      res.redirect("/saved");
    }
  });
});

// Delete data on the db
app.post("/article/delete/:id", function(req, res) {
  console.log("deleted")

  let dataId = req.params.id;
  console.log(dataId);

  // Update save article
  db.update({'_id': ObjectID(dataId)}, {$set: {saved: false}}, function(error, data) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      //res.render("index", {saved});
      res.redirect("/getAll");
    }
  });
});

// Delete scraped data from mongo db
app.get("/clear", function(req, res) {
    // Delete all scraped articles
    db.remove({
    },
    function(err, deleted) {
    if (err) {
        // Log the error if one is encountered during the query
        console.log(err);
    }
    else {
        // Otherwise, log complete
        console.log("Articles Cleared");
        res.render("index", {})
    }
    });
});

// Listen on port
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});