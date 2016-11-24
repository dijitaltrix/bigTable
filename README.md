# SimpleTable
A simple jQuery script to ajaxify a table passing arguments to the backend to handle the heavy lifting

This script will convert a static HTML table to an AJAX table with minimal effort. 
All the processing and rendering is handled on the backend, even the pagination widget! The AJAX calls simply place the rendered HTML wherever you want it to go.

SimpleTable will setup sortable headers and connect a pager to navigate between pages.

Currently there is support for a Bootstrap3 pager, an info box to show number of records returned and total results etc., and the tbody which is where it inserts the raw html passed back from the server.

When the user clicks a sortable header, navigates a page or submits the form SimpleTable will intercept, create a url with the search parameters and pass it back to the server. The server should generate three views in response, the info, the pagre and the table body. It should return those wrapped in JSON for SimpleTable to paste into the page. 

Requires jQuery > 1.11 and FontAwesome for the table header icons, these can be replaced easily in the CSS file

First draft, it's my first jQuery plugin, a little unorthodox but it works for me!


## Setup

Link to the js and css files

## Usage

Add this to your page in your script section:

```javascript
$(function($){
	$(".simpleTable").simpleTable({
		infoContainer: '.st-info',
		pagerContainer: '.st-pager',
		pageSize: 25 
	});
});
```

Add the table like so

```html
<form action="/users" method="post">
	<div class="st-size pull-right form-inline"></div>
	<div class="st-info pull-left"></div>
	<table class="simpleTable table table-condensed table-hover">
		<thead>
			<tr>
				<th>User name</th>
				<th data-sort="false">Roles</th>
				<th data-sort="false">Email</th>
				<th data-name="updated_at">Last login</th>
				<th>Status</th>
			</tr>
		</thead>
		<tfoot>
		</tfoot>
		<tbody>
    </tbody>
	</table>
	<div class="st-pager pull-right"></div>
</form>
```

SimpleTable will look for your table header row (it only supports one row!) and will add a class .st-sortable to each <th> that does not have an attribute of data-sort="false" 

If your 

### Todo
Remove dependency on spinner function - use CSS and FontAwesome

