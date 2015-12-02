# CmsLess
_the Content Management System that gets out of your way_

* ultra-lightweight 
* dynamically load page content based on url hash
* keep static web sites [DRY](http://programmer.97things.oreilly.com/wiki/index.php/Don't_Repeat_Yourself)
* because WordPress is a great hammer but not every website is a nail
* implements Google's [hash bang notation](https://developers.google.com/webmasters/ajax-crawling/docs/learn-more) so SEO is not compromised

### Requires
* JQuery 2.X 
* PHP (optional, for [SEO hash-bang support](#seo))
* Apache with mod_rewrite enabled (optional, for [SEO hash-bang support](#seo))

---

1. [Quick Start](#QuickStart)
2. [More Details](#MoreDetails)
3. [Install](#Install)

# <a name="QuickStart"></a>Quick Start
_index.html:_

    <html>
      <body>
        <!-- USING CmsLess: -->
        <h1>Site Header</h1>
        <p>And other content that belongs on every page</p>
        <a href="#!one-page">One Page</a>
        <div id="cms-less-destination">
        	<!-- will be populated from cms-less-content/pagename.html -->
        	<!-- 	where the pagename is the hash up to the last hyphen -->
        	<!-- 	and if there is no hash, pagename is 'index' -->
        	<!-- 	and if the page can't be loaded, the pagename is '404' -->
       </div>
       
       <!-- SETUP for CmsLess: -->
       <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
       <script src="js/lib/cms-less/cms-less.js"></script>
       <script type="text/javascript">
         $(function() {
           CmsLess.Init({
             configurationOptions: 'see documentation'
           });
         });
       </script>
     </body>
   	</html>
   	
* there are two `index.html` files: 
	* `index.html` contains all the content common to all pages (header, nav, library includes)
	* `cms-less-content/index.html` contains the content to be shown for both example.com/#index and example.com/
* individual pages:
	* accessed from: `example.com/#!pagename`
	* content stored in: `cms-less-content/pagename.html`
* See [demo site](https://github.com/alexanderbird/cms-less-demo) (it's not live anywhere yet...)
   	
# <a name="MoreDetails"></a>More Details
## What Goes Where
* `index.html`
	* loads jQuery and CmsLess
	* initializes and (optionally) configures CmsLess
	* all the **content that must appear on every page**
* `cms-less-content/` (or whatever you've chosen as your [content path](#Configuration))
	* one html file for each page
	* the contents of that file will be [load](http://api.jquery.com/load/)ed into the `#cms-less-destination` element
* `cms-less-content/foobar.html`
	* **will be shown for example.com/#foobar**
* `cms-less-content/404.html `
	* will be shown when a page cannot be found (example.com/#missing)

## <a name="Anchors"></a>About Anchors
**Yes**, this works with page anchors. 

Anything after the `anchorDelimiter` (default: `-`) in the url hash is ignored when loading the page content. This way, you can still use the hash for page anchors. The only nuisance is that the anchor must now be `<a href='#!pagename-anchorname'>Anchor Name</a>` to link to `<div id='pagename-anchorname'>Anchored Stuff</div>`. 

To reiterate, all of the following will load `cms-less-content/foo.html`:

* `example.com/#!foo`
* `example.com/#!foo-`
* `example.com/#!foo-bar`
* `example.com/#!foo-baz`

You can test this out by [installing CmsLess](#Install) on your web site and browsing to the index page. From your web browser's JavaScript console, run `CmsLess.PageName('#somepage-totest')` to see what page name CmsLess extracts from the hash. If you don't provide an argument, it will take the hash from the `window.location.hash` property. 

## Without a web server
**Sort-of**. [Some browsers protect from cross origin requests](http://stackoverflow.com/questions/20041656/xmlhttprequest-cannot-load-file-cross-origin-requests-are-only-supported-for-ht) when you're viewing the file direct from your local machine. This means that when CmsLess tries to load page content, the browser blocks the request (there's an error message shown in the developer console, and nothing shown on the web page).

### Your options:
Use Firefox, run a local web server, or muck about with the [Chrome workaround](http://stackoverflow.com/questions/18586921/how-to-launch-html-using-chrome-at-allow-file-access-from-files-mode) to get it working. 

If you're trying to get Chrome to work, you should note that me and [this guy on Stack Overflow](http://stackoverflow.com/questions/20041656/xmlhttprequest-cannot-load-file-cross-origin-requests-are-only-supported-for-ht) weren't able to get it to work

I prefer the local server option, and I like to know that if I have to check something quickly without starting up the server, I can always use Firefox. 

## <a name='seo'></a>SEO
**Yes,** SEO is not compromised by using the hash for navigation. Google crawlers see our hash-bang links (`<a href='#!pagename'>`) and index `?_escaped_fragment_=pagename` in stead of `#!pagename`. In search results, you see `#!pagename` - [which is something relatively new for Google to support](https://developers.google.com/webmasters/ajax-crawling/docs/learn-more) of how to make AJAX applications crawlable. 

###In short:
* There is a PHP backend does nothing if you're not a robot
* If you're a robot it generates pages on the server side instead of the client side
	* It follows the same rules as the JavaScript front end

### During development
* You can ignore the PHP back end 
	* it does not display any content that the front end does not
	* it only displays the content for a different url scheme

### In production
Check that your site is doing what it should: 

|URL|Content |
|---|--------|
| yourdomain.com/?_escaped_fragment_= | index page |
| yourdomain.com/?_escaped_fragment_=somepage | somepage page |
| yourdomain.com/?_escaped_fragment_=missing_page | 404 |

As per [Google's specs](https://developers.google.com/webmasters/ajax-crawling/docs/specification). 


## Read More
* [Someone's helpful blog post](https://blog.andyet.com/2015/05/18/lazymorphic-apps-bringing-back-static-web/) describing an AJAX approach to simple websites, with lots of discussion about pros, cons, and alternatives

---

# <a name="Install"></a>Install
1. [Clone](#clone)
2. [Call from index.html](#addToIndex)
3. [Check dependancies](#checkDependancies)
4. [Move a few files around](#moveOrSoftlink)
5. [Configure](#Configuration) (optional)

## <a name="clone"></a>1. Clone into your project
    cd js/lib
    git submodule add https://github.com/alexanderbird/cms-less.git
    mkdir cms-less-content
    cp js/lib/cms-less/404.html cms-less-content
    
## <a name="addToIndex"></a>2. Add to index.html

    <div id="cms-less-destination"></div>
    <script src="js/lib/cms-less/cms-less.js"></script>
    <script type="text/javascript">
      $(function() {
        CmsLess.Init({
          contentPath: 'custom/content/path'
        });
      });
    </script>

* make sure you use the correct `src`path to cms-less.js in place of `js/lib/cms-less/cms-less.js`
* if you don't want to use `cms-less-destination`, set a different `destinationSelector` - see Configuration notes

## <a name="checkDependancies"></a>3. Dependancies (JQuery)
CmsLess relies on JQuery. If you're not using jQuery 2.x on your project, add it

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    
## <a name="moveOrSoftlink"></a>4. Move/Softlink Files
In short, everything in the [`move-elsewhere`](move-elsewhere) folder belongs elsewhere. You can move it directly to where it belongs, or create a symbolic link (`ln -s original/file target/file`) so you don't have to move it again if you update CmsLess. 

|file|where it belongs|purpose|
|----|----------------|-------|
|.htaccess|project root|<ul><li>redirects /path to /#!path </li><li>redirects the Google bot to crawlers.php for seo</li></ul> |
|crawlers.php|content folder|Does the same as the AJAX, but server side for the Google bot using the url parameter instead of the hash|
|404.html|content folder|Displays when an invalid page is accessed.|
    

## <a name="Configuration"></a>Configuration
The following options can be configured by passing an associative array to the Init method, as shown above.

| Key | Default | Description |
|-----|---------|-------------|
|`contentPath`|`cms-less-content`|Directory containing the page content html files|
|`destinationSelector`|`#cms-less-destination`| Css selector for the element that will have its content will be set by CssLess |
|`anchorDelimiter`|`-`|Delimiter between page name and anchor tag. See [Anchors](#Anchors)|
|`notFoundPageName`|`404`|Page to be loaded if a page is not found. See [Page Not Found](#PageNotFound).|


# Other Install Details

## <a name="PageNotFound"></a>Page Not Found
If the content load fails, then the notFoundPageName content is loaded. (See also: [Usage](#Usage).) A sample 404 page is provided with cms-less: to use it, copy it to your contentPath folder. 


    
    
    

    
