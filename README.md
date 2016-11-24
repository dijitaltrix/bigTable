# SimpleTable
A simple jQuery script to ajaxify a table passing arguments to the backend to handle the heavy lifting

This script will convert a static HTML table to an AJAX table with minimal effort. 
All the processing and rendering is handled on the backend, even the pagination widget! The AJAX calls simply place the rendered HTML wherever you want it to go.

Currently there is support for a Bootstrap3 pager, an info box to show number of records returned and total results etc., and the tbody which is where it inserts the raw html passed back from the server.

Requires FontAwesome for the table header sort direction icons. This can be replaced in the CSS

First draft, it's my first jQuery plugin, a little unorthodox but it works for me!

#Todo
Remove dependency on spinner function - use CSS and FontAwesome

