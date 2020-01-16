# Astronomy Scraper

This application scraps astronomy articles from https://www.nature.com/natastron/articles.

The date of the article, title, authors and a description are scrapped for each article when the page is loaded or when the 'SCRAPE NEW ARTICLES' button is clicked.

Click the 'SAVE ARTICLE' button for any of the articles and they will be displayed when click the 'SAVED ARTICLES' button.

In the 'SAVED ASTRONOMY ARTICLES' page, an article can be deleted and moved back to the scraped articles page.

To clear all articles, click this 'CLEAR ARTICLES' button.

# How It Works
The Mongo database is called 'scraper'.
When all articles are scraped, they are inserted into the 'articles' table with a field called 'saved' set to false. Only these will be pulled on page load.

When the 'SAVE ARTICLE' button is clicked, the 'saved' field is set to true. Only these will be pulled when the SAVED ARTICLES page is loaded.
When the 'DELETE FROM SAVED' button is clicked, the 'saved' field is set to false.

When the 'CLEAR ARTICLES' button is clicked, all records are deleted from the table.

# Packages Installed
* express
* express-handlebars
* mongoose
* cheerio
* axios

# What Is Pending
* Include the Notes button to add a note to the saved article
* Reload the page when saving or deleting an article