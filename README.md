# bigTable

A lightweight jQuery script with delusions of grandeur which converts a static HTML table into an AJAX table with minimal effort. 


bigTable can ajaxify a plain HTML table by passing arguments via an AJAX POST to the backend which handles the heavy lifting. bigTable sets up sortable headers and connects the pager links by adding handlers which intercept the events necessry to load the table data.

All the processing and rendering is handled on the backend, even the pagination widget! The AJAX calls simply place the rendered HTML wherever you want it to go.


It does not 'cache' the received html rows, every action will result in a call to the server to grab the html for display. There are historic reasons the code is setup this way, hence my need to keep the whole thing as close to plain HTML as possible.

Currently there is support for a Bootstrap3 pager, an info box to show number of records returned and total results etc., and the tbody which is where it inserts the raw html passed back from the server.

When the user clicks a sortable header, navigates a page or submits the form bigTable will intercept, create a url with the search parameters and pass it back to the server. The server should generate three views in response, the info, the pager and the table body. It should return those wrapped in JSON for bigTable to paste into the page. 

Requires jQuery > 1.11 and FontAwesome for the table header icons, these can be replaced easily in the CSS file

First draft, it's my first jQuery plugin, a little unorthodox but it works for me!


## Setup

Requires jQuery > 1.11.
Optionally requires FontAwesome and Bootstrap3 to make it pretty

In your head place the link to the stylesheet
```html
<link media="all" type="text/css" rel="stylesheet" href="/vendor/bigtable/bigtable.css">
```

Ideally before the closing </body> tag place the link to the script
```html
<script src="/vendor/bigtable/bigtable.js"></script>
```

## Usage

Add this to your page in your script section:

```javascript
$(function($){
	$(".bigTable").bigTable();
});
```

Add the table like so

```html
<form action="/users" method="post">
	<div class="st-size pull-right form-inline">
    <div class="form-group">
      <label class="control-label">Items to show</label>
      <select class="form-control">
        <option value="15">15</option>
        <option value="25" selected="selected">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>
	<div class="st-info pull-left">
    <!-- Results summary info will be placed here -->
  </div>
	<table class="bigTable table table-condensed table-hover">
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
      <!-- table rows will be placed here -->
    </tbody>
	</table>
	<div class="st-pager pull-right"></div>
</form>
```

bigTable will look for your table header row (it only supports one row!) and will add a class .bt-sortable to each <th> that does not have an attribute of data-sort="false" 

If your table header labels do not match your schema, use the data-name attribute as in the example to override the text.

## Very basic example of the server code
```php
<?php

# Laravel 

class UsersController {

  public function getIndex() {
    return View::make('users/index');
  }
  
  public function postIndex() {
    
    # get models using index scope which creates our db query 
    $items = User::index()->paginate(Input::get('size'));
    
    $response = [
      'status' => 'ok',
      'view' => [
        'info' => null,
        'pager' => null,
        'tbody' => null,
      ],
    ];
    
    # render user rows to view
    foreach ($items as $item) {
      $response['view']['tbody'].= View::make('users/index-table-row', ['user'=>$item])->render();
    }
    
    # add table summary info
    $response['view']['info'] = sprintf('Showing %d-%d of $d', $items->getFrom(), $items->getTo(), $items->getTotal()); 
    
    # add pager, must use trim() with Laravel links() method
    $response['view']['pager'] = trim($items->links());
  
    # return as JSON
    return Response::json($response, 200);
  
  }

}
```

I have two view files, one sets up the whole index page, the other is a partial view just containing the table row including the <tr></tr> tags.




### Todo
Add support for dropping columns at lower resolutions to make it more 'responsive'
