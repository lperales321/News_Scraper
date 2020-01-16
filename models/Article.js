// Article model
// ==============

// Require mongoose
var mongoose = require("mongoose");

// Create a schema class using mongoose's schema method
var Schema = mongoose.Schema;

// Create the articleSchema with our schema class
var articleSchema = new Schema({
  // headline, a string, must be entered
  title: {
    type: String,
    required: true
  },
  // url, a string, must be entered
  link: {
    type: String,
    required: true
  },
  // date is just a string
  articleDate: {
    type: Date,
    default: Date.now
  },
  // author, a string
  author: {
    type: String
  },
  // summary, a string
  summary: {
    type: String
  },
  saved: {
    type: Boolean,
    default: false
  }
});

// Create the Article model using the articleSchema
var Article = mongoose.model("Article", articleSchema);

// Export the Article model
module.exports = Article;
