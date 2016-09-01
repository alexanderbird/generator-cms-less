# CmsLess
_the Content Management System that gets out of your way_

* ultra-lightweight 
* dynamically load page content based on url hash
* keep static web sites [DRY](http://programmer.97things.oreilly.com/wiki/index.php/Don't_Repeat_Yourself)
* because WordPress is a great hammer but not every website is a nail
* falls back to a short PHP script so Google's crawlers can see each page

### Requires
* JQuery 2.X 
* PHP (optional, fall back for non-js browsers and search engine crawlers)
* Apache with mod_rewrite enabled (optional, makes the site more forgiving)



**Want to get started quickly? Check out the [CmsLess Boilerplate](https://github.com/alexanderbird/cms-less-boilerplate) repo for example usage, or view it live at http://cms-less.abird.ca** (but you should be warned, it's only a technical demo. The site is completely unstyled and has no interesting content.)

## <a name="Install"></a>Install
1. [Clone](#clone)
2. [Call from index.html](#addToIndex)
3. [Check dependancies](#checkDependancies)
4. [Move a few files around](#moveOrSoftlink)
5. [Configure](#Configuration) (optional)
6. Read about [all the gory details](#gore) (optional)

### <a name="clone"></a>1. Clone into your project
    cd js/lib
    git submodule add https://github.com/alexanderbird/cms-less.git
    mkdir cms-less-content
    cp js/lib/cms-less/404.html cms-less-content
    
### <a name="addToIndex"></a>2. Add to index.html

    <a class="cms-less-link" href="/p/page">
    	<!-- .cms-less-link tells CmsLess to change this to href="#page"-->
    	<!--if js disabled, /p/page links to php backend -->
    	Link to Page</a>
    <div id="cms-less-destination">
    	<span id="cms-less-content-placeholder"><!-- avoid FOUC --></span>
    </div>
    <script src="/js/lib/cms-less/cms-less.js"></script>
    <script type="text/javascript">
      $(function() {
        CmsLess.Init();
      });
    </script>

* make sure you use the correct `src`path to cms-less.js in place of `js/lib/cms-less/cms-less.js`
* if you don't want to use `cms-less-destination`, set a different `destinationSelector` in the Init() configuration - see Configuration notes

### 3. Dependancies (JQuery)
CmsLess relies on JQuery 2.x. 

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    
### <a name="moveOrSoftlink"></a>4. Move/Softlink Files
In short, everything in the [`move-elsewhere`](move-elsewhere) folder belongs elsewhere. You can move it directly to where it belongs, or create a symbolic link (`ln -s original/file target/file`) so you don't have to move it again if you update CmsLess. 

|file|where it belongs|purpose|
|----|----------------|-------|
|.htaccess|project root|<ul><li>redirects /path to /#path </li><li>redirects the Google bot to crawlers.php for seo</li></ul> |
|404.html|content folder|Displays when an invalid page is accessed.|
|crawlers.php|content folder|Does the same as the AJAX, but server side for the Google bot using the url parameter instead of the hash|
|crawler-helpers/|content folder|php utilities used by crawlers.php|

### <a name="Configuration"></a>Configuration
The following options can be configured by passing an associative array to the Init method, as shown above.

| Key | Default | Description |
|-----|---------|-------------|
|`contentPath`|`cms-less-content`|Directory containing the page content html files|
|`destinationSelector`|`#cms-less-destination`| Css selector for the element that will have its content will be set by CssLess |
|`anchorDelimiter`|`-`|Delimiter between page name and anchor tag. See [Anchors](#Anchors)|
|`notFoundPageName`|`404`|Page to be loaded if a page is not found. See [Page Not Found](#PageNotFound).|
|`redirects`|`{}`|Object with "from" page names as keys, and "to" page names as values. See details below|

#### Page Redirection
This feature is especially useful to redirect near-miss URLs. 

As an example of how you could use it: by setting `redirects` to:

    { 
      'common_typo': 'page_you_think_they_meant' 
    }

will redirect `/#common_typo` to `/#page_you_think_they_meant`

## <a name="gore"></a>All the Gory Details

### <a name="Anchors"></a>About Anchors
**Yes**, this works with page anchors. 

Anything after the `anchorDelimiter` (default: `-`) in the url hash is ignored when loading the page content. This way, you can still use the hash for page anchors. The only nuisance is that the anchor must now be `<a href='#pagename-anchorname'>Anchor Name</a>` to link to `<div id='pagename-anchorname'>Anchored Stuff</div>`. 

To reiterate, all of the following will load `cms-less-content/foo.html`:

* `example.com/#foo`
* `example.com/#foo-`
* `example.com/#foo-bar`
* `example.com/#foo-baz`

You can test this out by [installing CmsLess](#Install) on your web site and browsing to the index page. From your web browser's JavaScript console, run `CmsLess.PageName('#somepage-totest')` to see what page name CmsLess extracts from the hash. If you don't provide an argument, it will take the hash from the `window.location.hash` property. 

## Updating UI on page change
CmsLess dispatches the `cms-less-page-change` event when the new page has loaded. 

    $(document).bind('cms-less-page-change', function(e) {
        console.log("The current page is " + e.originalEvent.detail.pageName);
    });
    
 Note: currently this event is not dispatched for the first page load if there is no url hash. It's a bug, and I really can't figure out what's causing it. I welcome pull requests or feedback :)
    
## Avoiding the footer [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content) (Flash Of Unstyled Content)
Or rather, "Flash of Empty Page Before Content Loads" - if you have any footer or anything, you'll see it at the top of the screen before the page content pushes it down to the bottom. It's jarring. Avoid this by adding: 

To /index.html

    <span id='cms-less-content-placeholder'/>
 
To stylesheet

    #cms-less-content-placeholder {
      display: block;
      height: 100vh;
    }
    
Before the first page is loaded the placeholder pushes the footer off the screen. When the first page is loaded, it replaces the placeholder span. 

## <a name='seo'></a>SEO
**Yes,** CmsLess won't trash your SEO, if you do the following: 

1. Link to `href=?p=pagename`
2. In your `a` element, add `data-cms-less-path="pagename"`
  - CmsLess will convert your links from `?p=` to `#` when it is initialized -- and will leave your links in the `?p=` if JavaScript is not enabled

### In short:
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
| yourdomain.com/?p= | index page |
| yourdomain.com/?p=somepage | somepage page |
| yourdomain.com/?p=missing_page | 404 |

### Prettying up the `/?p=page_name`
CmsLess uses the JavaScript [history.replaceState](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_replaceState()_method) function to change `/?p=page_name` to `/#page_name` without redirecting. 

### <a name="PageNotFound"></a>Page Not Found
If the content load fails, then the notFoundPageName content is loaded. A sample 404 page is provided with cms-less: to use it, copy it to your contentPath folder. 

Note: with this configured, CmsLess does't serve anything from the root directory other than index.html

## Development
Run it behind a web server, because it doesn't work well with file:/// protocol because of browser security things. File:/// works with Firefox, though. 

## Read More about the Ajax Website Approach
* [Someone's helpful blog post](https://blog.andyet.com/2015/05/18/lazymorphic-apps-bringing-back-static-web/) describing an AJAX approach to simple websites, with lots of discussion about pros, cons, and alternatives
    
