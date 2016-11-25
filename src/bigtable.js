;(function($) {

	$.fn.bigTable = function(options) {

		// set defaults.
		var settings = $.extend({
			// the table, get pagination size
			table: $(this),
			// form to use, get url action and method
			form: $(this).parent('form'),
			// size of results to fetch
			pageSize: 25,
			// pager container to display links
			pagerContainer: '.bt-pager',
			// result summary information
			infoContainer: '.bt-info',	
			// page size input (must be able to call val())
			pageSizeChooser: '.bt-size',
			
			// last item to stop me worrying about commas
			z: null
			
		}, options );

		// store reference to self for use in functions
		var self = this;
		// check a transfer is not already in progress
		var transfer = false;
		// set column sort order priority
		var priority = 1;
		// set page clicked in pagination
		var requestedPage = null;
		// form data field object
		var data = {};

		function init() {
			tableHeaderCellHandler();
			pageSizeHandler();
			setPage(getQueryParam(window.location.search, 'page'));
			getData();
			settings.form.on('submit', function(e) {
				e.preventDefault();  //prevent form from submitting
				getData();
			});
		}

		// init
		init();
		
		// set/get the fetching data state
		function gettingData(bool) {
			
			// set state
			if (bool !== undefined) {
				// console.log("Setting transfer to "+bool);
				transfer = bool;
				
				if (transfer === 1) {
					// set pointer to timer
					$("body").css("cursor", "progress");
					
					// set table state disabled
					// disable table headers
					self.children('thead').children('tr').children('.bt-sortable').each(function() {
						$(this).prop('disabled', true);
					});
					// disable pagination
					self.parent('form').find(settings.pagerContainer).find('a').each(function() {
						$(this).prop('disabled', true);
					});
					// disable search button
					self.parent('form').find('button[type="submit"]').each(function() {
						$(this).prop('disabled', true);
					});
					
				} else {
					// release pointer timer
					$("body").css("cursor", "default");

					// set table state enabled
					
					// enable table headers
					self.children('thead').children('tr').children('.bt-sortable').each(function() {
						$(this).prop('disabled', false);
					});
					// enable pagination
					self.parent('form').find(settings.pagerContainer).find('a').each(function() {
						$(this).prop('disabled', false);
					});
					// enable search button
					self.parent('form').find('button[type="submit"]').each(function() {
						$(this).prop('disabled', false);
					});
				
				}
				
				return;
			}
			
			// return state
			// console.log("Returning transfer "+transfer);
			return transfer;
			
		}
		
		// get next priority index used for column sort ordering
		function getPriority() {
			return priority++;
		}
		
		// get current page (from url)
		function getPage() {
			return requestedPage;
			
		}
		
		// return the columns sort order
		function getSort() {
			var out;
			var pos;
			var field;
			var headers = [];
			self.children('thead').children('tr').children('.bt-sortable').each(function() {
				if ($(this).data('sort-priority') !== undefined) {
					// get position of sort order, to set order by in correct sequence
					pos = $(this).data('sort-priority');
					// get field name for table, set from data-name attribute or text
					if ($(this).data('sort-name') !== undefined) {
						field = $(this).data('sort-name');
					} else {
						field = $(this).text().toLowerCase().replace(/ /, '_');
					}
					// get sort direct from data-sort attribute
					if ($(this).data('sort-dir') === 'desc') {
						field+= ':desc';
					} else {
						field+= ':asc';
					}
					headers[pos] = field;
				}
			});

			// console.log(headers);
			// sort header (not necessary?)
			
			// return formatted sort order and dir for each column
			out = '';
			for (var i in headers) {
				out+= headers[i]+",";
			}
			
			// trim trailing ,
			return out.slice(0, -1);
			
		}
		
		// set requestedPage - would be great to update URL too
		function setPage(page) {
			requestedPage = page;
			// window.location.hash = setQueryParam(window.location.search, 'page', page);
		}
		
		// set responsive data tags
		function setResponsive() {
			if (self.attr('data-responsive')) {
				var headers = [];
				// get header text values
				self.find('thead').children('tr').find('th').each(function(i){
					headers[i] = $(this).text();
				});
				// place header text in <td> data-title attribute
				self.children('tbody').children('tr').each(function() {
					$(this).find('td').each(function(i) {
						if ($(this).text()) {
							$(this).attr('data-title', headers[i]);
						}
					});
				});
			}
		}
		
		// merge additional form input to data
		function addFormData() {
			// console.log("called addFormData");
			$(settings.form).find(':input').each(function(){
				// console.log("addFormData: "+$(this).attr('name'));
				if ($(this).attr('name') !== undefined) {
					// exclude .bt_size, need ! in_array()
					if ($(this).attr('name') !== settings.pageSizeChooser) {
						// console.log("adding");
						data+= "&"+$(this).serialize();
					}
				}
			});
			
			// console.log(data);
			
		}
		
		// setup handler to intercept bigTable header clicks
		function tableHeaderCellHandler() {
			// foreach header with data attr sortable
			// 		store column data in headers
			//		add to header, add class (with icon), add attr data-sort-dir
			// 		set handler on each item
			self.children('thead').children('tr').children('th[data-sort!="false"]').each(function() {
				$(this).addClass('st-sortable');

				// cycle through three states, null, asc, desc
				// we should 
				$(this).on('click', function() {
					while ( ! gettingData()) {
						switch ($(this).data('sort-dir')) {
							case 'asc':
								$(this).data('sort-dir', 'desc').removeClass('st-sorted st-sorted-asc').addClass('st-sorted st-sorted-desc');
							break;
							case 'desc':
								$(this).data('sort-dir', null).data('sort-priority', null).removeClass('st-sorted st-sorted-desc').addClass('st-sortable');
							break;
							default:
								$(this).data('sort-dir', 'asc').data('sort-priority', getPriority()).removeClass('st-sorted st-sorted-desc').addClass('st-sorted st-sorted-asc');
						}

						// this should call on a timeout to allow user to cycle through sort states
						// however set timeout just stops the next sort click from registering 
						getData();
					}

				});

			});
			
		}
		
		// setup handler to intercept results size select toggle
		function pageSizeHandler() {
			self.parent('form').find(settings.pageSizeChooser).find('select').on('change', function() {
				settings.pageSize = $(this).val();
				getData();
			});
			
		}

		// setup handler to intercept bigTable pagination links
		function pagerLinkHandler() {
			self.parent('form').find(settings.pagerContainer).find('a').each(function() {
				$(this).on('click', function(e) {
					e.preventDefault();
					setPage(getQueryParam($(this).attr('href'), 'page'));
					$(this).spinner('on');
					getData();
					return false;
				});
			});
			
		}
		
		// call remote data url then call render with the data
		function getData() {
			var url;
			var form;
			
			// fetch should be a function to stop/allow state changes on table
			
			if ( ! gettingData()) {
				// set fetching so we don't race
				gettingData(true);
				// set timeout delay before we fetch data
			
				// fetch form
				form = settings.form;
				// create url to fetch data with
				url = form.attr('action');
				
				// init and add bigTable fields, 
				// page size, page number
				// sort columns and other form fields
				// getting late 
				data = 'size='+settings.pageSize;
				data+= '&page='+getPage();
				data+= '&sort='+getSort();
				
				// add user form fields to data
				addFormData();
			
				$.ajax({
					url: url,
					method: form.attr('method'),
					data: data,
					dataType: 'json'

				}).done(function(response) {
					if (response.view) {
						render(response);
					}
					
				}).fail(function() {
				}).always(function() {
					gettingData(false);
				});
				
			}
			
		}
		
		// paste fetched data into table
		function render(response) {
			// view may have separate parts to be updated
			
			// update info
			if (response.view.info) {
				// console.log('updating info');
				self.parents('form').find(settings.infoContainer).html(response.view.info);
			}
			// update pager
			if (response.view.pager) {
				// console.log('updating pager');
				self.parents('form').find(settings.pagerContainer).html(response.view.pager);
			} else {
				self.parents('form').find(settings.pagerContainer).html('');
			}
			// update table tbody
			if (response.view.tbody) {
				// console.log('updating tbody');
				self.find('tbody').html(response.view.tbody);
			} else {
				self.find('tbody').html('');
			}
			
			// set pager handler
			pagerLinkHandler();
			
			// set responsive 
			setResponsive();

		}
		
		// get a url parameter
		function getQueryParam(uri, key) {
		    key = key.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		    var regex = new RegExp('[\\?&]' + key + '=([^&#]*)');
		    var results = regex.exec(uri);
		    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
		}
		
		// set a url parameter
		// thanks to answer by http://stackoverflow.com/users/209568/adam
		// function setQueryParam(uri, key, value) {
		// 	var re = new RegExp("([?&])" + key + "=.*?(&|#|$)", "i");
		// 	if (uri.match(re)) {
		// 		return uri.replace(re, '$1' + key + "=" + value + '$2');
		// 	} else {
		// 		var hash =  '';
		// 		if ( uri.indexOf('#') !== -1 ){
		// 			hash = uri.replace(/.*#/, '#');
		// 			uri = uri.replace(/#.*/, '');
		// 		}
		// 		var separator = uri.indexOf('?') !== -1 ? "&" : "?";
		// 		return uri + separator + key + "=" + value + hash;
		// 	}
		// }

	};

}( jQuery ));
