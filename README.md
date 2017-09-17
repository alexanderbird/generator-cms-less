# CmsLess
_The Ajax Content Management System that gets out of your way_

## What

* oneline deploy to Amazon S3
* ultra-lightweight 
* for small static websites
* runs on standard LAMP stack without dependencies

| Ajax Mode | no JavaScript mode |
|-----------|--------------------|
| ✓ dynamically loads page content | ✓ renders pre-compiled page
| ✓ gracefully downgrades to no JavaScript mode | ✓ gracefully upgrades to Ajax Mode
| ✓ uses url hash to support bookmarking pages |
| ✓ offers page eager-loading to reduce percieved load times
| ✓ only load the parts of the page that change

## Why

For smallish static sites:

* CmsLess is better than a database-based CMS like [**WordPress**](https://wordpress.com/):
	* **Version Control:** it's version controllable, unlike WordPress (unless you do [what the jQuery team does](https://contribute.jquery.org/web-sites/))
	* **Dev:** You like your text editor better than the WordPress editor window
	* **Dev:** Wordpress doesn't have a good workflow for local development
	* **Prod:** Databases are slower than serving static files
	* Etc.
* CmsLess is better than **pure html** - allows reuse of header, nav, etc. so you [don't repeat yourself](http://programmer.97things.oreilly.com/wiki/index.php/Don't_Repeat_Yourself).
* CmsLess might not be better than a website generator like [**Jeckyll**](https://jekyllrb.com/) - **but**:
	* Jeckyll does not provide the performance boost of eager-loading pages or only reloading the content that changes. 

<sub>You may be interested in Henrik Joreteg's [article about all the great ways to build static websites](https://blog.andyet.com/2015/05/18/lazymorphic-apps-bringing-back-static-web/).</sub>


## Quick Start

On your local machine, run the [Yeoman](http://yeoman.io/) generator to set up the skeleton of your site (or to add CmsLess to your existing site). 

    npm install -g yo generator-cms-less
    mkdir your_great_website && cd your_great_website
    yo cms-less 
    
Then customize your site and copy the files to your server. **That's it.**

### Requires
* Production:
	* PHP 
	* Apache with mod_rewrite enabled
	* JQuery 2.X (generated index.html includes jQuery via a CDN)
* Development:
	* Node.js to run code generator 
	* Apache with mod_rewrite enabled 
		* OR browser with CORS enabled, such as Firefox, if you're willing to fiddle a bit

### Architecture in a nutshell
#### Source Layout:
src/
  template.html
  partials/
    404.html
    index.html
    other_page.html
  assets/
    js/
      your_scripts.js
      lib/
        cms-less.min.js
    css/
      your_styles.css
    other_directories/
      whatever.anything
bin/
  build.sh
  deploy.sh

#### Built Layout
build/
 404
 index
 other_page
 -
 js/...
 css/...
 other_directories/...
 _partials/
  _404.html
  _index.html
  _other_page.html

#### Workflow
 - `npm run build` creates the Built Layout from the Source Layout
 - `npm run deploy` creates or updates an S3 bucket with the contents of build/
    - (It's up to you to configure DNS, etc. to point to the S3 bucket)

#### Website Usage
  - non-JavaScript mode:
    - root path `/` url => `index.html` file (which is template.html + partials/index.html
    - `/other_page` url => `other_page` file (which is a file without extension that has template.html + partials/other_page.html)
  - non-JavaScript mode progressively enhanced to JavaScript mode
    - from any page, the links to `/foo` are changed to `/-#foo` (links to JavaScript mode)
  - JavaScript mode
    - `/-` url => `-` file (which is template.html renamed to `-`). CmsLess JavaScript loads `_partials/index.html` content into the template
    - `/-#other_page` url => `_` file (still template.html). CmsLess JavaScript loads `_partials/_other_page.html` content into the template

## Optional Configuration

    <script type="text/javascript">
      $(function() {
        CmsLess.Init({/* CmsLessConfiguration */});
      });
    </script>
   

Refer to the CmsLessConfig interface defined in [cms_less_config.d.ts](src/cms_less_config.d.ts) for a list of accepted configuration options. Note that this file follows the [TypeScript](https://www.typescriptlang.org/) [interface declaration syntax](https://basarat.gitbooks.io/typescript/content/docs/types/interfaces.html).

### Feature Details
#### Anchors
**Yes**, this works with page anchors. 

Anything after the `anchorDelimiter` (default: `-`) in the url hash is ignored when loading the page content. This way, you can still use the hash for page anchors. The only nuisance is that the anchor must now be `<a href='#pagename-anchorname'>Anchor Name</a>` to link to `<div id='pagename-anchorname'>Anchored Stuff</div>`. 

To reiterate, all of the following will load `_partials/foo.html`:

* `example.com/#foo`
* `example.com/#foo-`
* `example.com/#foo-bar`
* `example.com/#foo-baz`

You can test this out by headed over to the [live demo](cms-less.abird.ca) - from your web browser's JavaScript console, run `CmsLess.PageName('#somepage-totest')` to see what page name CmsLess extracts from the hash. If you don't provide an argument, it will take the hash from the `window.location.hash` property. 


#### Page Redirection
This feature is especially useful to redirect near-miss URLs. 

As an example of how you could use it: by setting `redirects` to:

    { 
      'common_typo': 'page_you_think_they_meant' 
    }

will redirect from the `/common_typo` page to `/page_you_think_they_meant`

#### Eager Loading
Once a page has been visited once in a session, it is cached in memory for quick access if the website visitor visits another page on the site and then later returns. To take full advantage of this speed-boost, provide a list of page names in the `eagerLoadPages` array and these pages will be pre-loaded into memory before the website visitor requests it. Be careful with this option - it gives you the power to load the entire website for every visitor. Is the percieved performance boost worth it? 

Note that currently this feature only loads the page text, not any embedded or referenced assets - you'll have to rely on your browser to cache those, and you can't eager-load them with CmsLess. I may add a "deep eager load" down the road. 

## All the Gory Details
    
### Links
Add the class `cms-less-link` to have the `/page` links progressively enhanced to the corresponding CmsLess link (`/-#page`)

    <a class="cms-less-link" href="/page">
    	<!-- .cms-less-link tells CmsLess to change this to href="-#page"-->
    	<!--if JavaScript is disabled, /page links to PHP backend -->
    	Link to Page</a>
    
### Content container in index.html

    <div id="cms-less-destination">
    	<span id="cms-less-content-placeholder"><!-- this span is optional. It keeps the footer at least one page height down until the first content is loaded --></span>
    </div>

If you don't want to use `cms-less-destination`, configure a different `destinationSelector` (see notes about Configuration).

### Events
CmsLess dispatches events: 

* `page:loading`
* `page:loaded`
* `cache:hit`
* `cache:miss`

As seen here: 

    CmsLess.on('page:loading', function(pageData) {
        console.log("Starting to load " + pageData.fullName);
    });

    CmsLess.on('*', function(eventName, pageData) {
      console.log("The " + eventName + " event was fired for the " + pageData.fullName + " page");
    });

    CmsLess.on('cache:*', function(eventName) {
      console.log("The following cache-related event was fired: " + eventName);
    });

The second argument in the callback is an instance of the [EventManager.PageData](src/event_manager.ts) class. 
    

## Contributing

1. During development: `npm run watch` will output the build JavaScript to [src/build](src/build). This is version controlled so you can easily see how changes in the TypeScript have affected the built JavaScript... because who wants to diff a minified js file? 
2. Before commiting: `npm run build` to produce the minified version ready for distribution
