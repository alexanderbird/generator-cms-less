# CmsLess
_the Content Management System that gets out of your way_

**What**

* ultra-lightweight 
* for small static websites
* if JavaScript is enabled, it dynamically loads page content
* if JavaScript isn't enabled, it falls back to a PHP back-end

**Why**

* keep your static site [dry](http://programmer.97things.oreilly.com/wiki/index.php/Don't_Repeat_Yourself)
* WordPress is overkill for a static website

### Requires
* Production:
	* JQuery 2.X 
	* PHP 
	* Apache with mod_rewrite enabled
* Development:
	* Node.js to run code generator 
	* Apache with mod_rewrite enabled 
		* OR browser with CORS enabled

## Get Started
    
    npm install -g yo generator-cms-less
    mkdir your_great_website && cd your_great_website
    yo cms-less 
    
**Stop. This is all you need to know - you now have a template website ready to customize**

## Optional Configuration

    <script type="text/javascript">
      $(function() {
        CmsLess.Init({/* CmsLessConfiguration */});
      });
    </script>
   

The configuration parameter accepts an object with the following options (documented here using [TypeScript](https://www.typescriptlang.org/)'s [Interface declaration syntax](https://basarat.gitbooks.io/typescript/content/docs/types/interfaces.html))


    interface CmsLessConfiguration {
      // Directory containing the page content html files
      contentPath?: string; // default: 'cms-less-content'
      
      // CSS selector for the element that will have its content will be set by CmsLess
      destinationSelector?: string; // default: '#cms-less-destination'
      
      // Delimiter between page name and anchor tag. See Anchors details below
      anchorDelimiter?: string; // default: '-'
      
      // Page to be loaded if a page is not found.
      notFoundPageName?: string; // default: '404'
      
      // Object with "from" page names as keys, and "to" page names as values. See Page Redirection details below
      redirects?: {[from:string]: string}; // default: {}
    	
    	// Pages are loaded immediately and cached in memory. See Eager Loading details below
    	eagerLoadPages?: string[]; // default: []
    }

### Feature Details
#### Anchors
**Yes**, this works with page anchors. 

Anything after the `anchorDelimiter` (default: `-`) in the url hash is ignored when loading the page content. This way, you can still use the hash for page anchors. The only nuisance is that the anchor must now be `<a href='#pagename-anchorname'>Anchor Name</a>` to link to `<div id='pagename-anchorname'>Anchored Stuff</div>`. 

To reiterate, all of the following will load `cms-less-content/foo.html`:

* `example.com/#foo`
* `example.com/#foo-`
* `example.com/#foo-bar`
* `example.com/#foo-baz`

You can test this out by spinning up a new CmsLess website and browsing to the index page. From your web browser's JavaScript console, run `CmsLess.PageName('#somepage-totest')` to see what page name CmsLess extracts from the hash. If you don't provide an argument, it will take the hash from the `window.location.hash` property. 


#### Page Redirection
This feature is especially useful to redirect near-miss URLs. 

As an example of how you could use it: by setting `redirects` to:

    { 
      'common_typo': 'page_you_think_they_meant' 
    }

will redirect `/#common_typo` to `/#page_you_think_they_meant`

#### Eager Loading
Once a page has been visited once in a session, it is cached in memory for quick access if the website visitor visits another page on the site and then later returns. To take full advantage of this speed-boost, provide a list of page names in the `eagerLoadPages` array and these pages will be pre-loaded into memory before the website visitor requests it. Be careful with this option - it gives you the power to load the entire website for every visitor. Is the percieved performance boost worth it? 

## All the Gory Details
    
### Links
**Add the class `cms-less-link` to have standard `/page` links progressively enhanced to the corresponding CmsLess link (`/-#page`)

    <a class="cms-less-link" href="/page">
    	<!-- .cms-less-link tells CmsLess to change this to href="-#page"-->
    	<!--if JavaScript is disabled, /page links to PHP backend -->
    	Link to Page</a>
    
### Content container in index.html

    <div id="cms-less-destination">
    	<span id="cms-less-content-placeholder"><!-- this span is optional. It keeps the footer at least one page height down until the first content is loaded --></span>
    </div>

* if you don't want to use `cms-less-destination`, set a different `destinationSelector` in the Init() configuration - see Configuration notes

### Events
CmsLess dispatches events to inform you about page loading: 

* `cms-less:page-loading`
* `cms-less:page-loaded`

As seen here: 

    $(document).on('cms-less:page-loading', function(e) {
        console.log("Starting to load " + e.originalEvent.detail.pageName);
    });
    
    $(document).on('cms-less:page-loaded', function(e) {
        console.log("Finished loading " + e.originalEvent.detail.pageName);
    });
    

### Read More about the Ajax Website Approach
* [Someone's helpful blog post](https://blog.andyet.com/2015/05/18/lazymorphic-apps-bringing-back-static-web/) describing an AJAX approach to simple websites, with lots of discussion about pros, cons, and alternatives
    
