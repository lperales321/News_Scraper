// Dependencies
var express = require("express");
var mongojs = require("mongojs");

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
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {

  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      //res.json(found);
      res.render("index", {found});
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {

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
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          title,
          link,
          articleDate,
          author,
          summary
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            //console.log(inserted);
          }
        });
      }
    });
  })
  .catch(error => {
    console.log(error)
  })

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


// Listen on port
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});