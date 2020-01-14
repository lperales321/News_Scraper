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
var collections = ["scrapedData", "savedArticles", "notes"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Retrieve data from the db
app.get("/", function(req, res) {

  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({saved: false}, function(error, data) {
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
          summary,
          saved: false
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
            //res.render("index", {data});
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

// Delete scraped data from mongo db
app.get("/clear", function(req, res) {
    console.log("now here")
    // Delete all scraped articles
    db.scrapedData.remove({
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

// Get a specific article by id, populate it with its note
app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.scrapedData.findOne({ _id: req.params.id })
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, insert it into savedArticles
        db.savedArticles.insert({
            articleId   : dbArticle._id,
            title       : dbArticle.title,
            link        : dbArticle.link,
            articleDate : dbArticle.articleDate,
            author      : dbArticle.author,
            summary     : dbArticle.summary
          },
          function(err, data) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log(err);
            }
            else {
              // Otherwise, log the inserted data
              console.log(data);
              res.render("saved", {data});
            }
          });
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});

// $(document).on("click", ".btn.save", function(){
//     // Empty the notes from the note section
//     //$("#notes").empty();
//     // Save the id from the save tag
//     console.log("here")
//     var thisId = $(this).attr("data-id");
//     console.log(thisId);
  
    // Now make an ajax call for the Article
    // $.ajax({
    //   method: "GET",
    //   url: "/articles/" + thisId
    // })
    //   // With that done, add the note information to the page
    //   .then(function(data) {
    //     console.log(data);
    //     // The title of the article
    //     $("#notes").append("<h2>" + data.title + "</h2>");
    //     // An input to enter a new title
    //     $("#notes").append("<input id='titleinput' name='title' >");
    //     // A textarea to add a new note body
    //     $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
    //     // A button to submit a new note, with the id of the article saved to it
    //     $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
    //     // If there's a note in the article
    //     if (data.note) {
    //       // Place the title of the note in the title input
    //       $("#titleinput").val(data.note.title);
    //       // Place the body of the note in the body textarea
    //       $("#bodyinput").val(data.note.body);
    //     }
    //   });
  //});


// Listen on port
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});