# cms-less
Use less CMS on your static web site: a lightweight JavaScript + Ajax "Content Management System" to separate your header and nav from the rest of your site. 

## The Gist Of It
Site content is loaded based on the url hash value using ajax to populate a certain element. 

The goal is to keep your static HTML site [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). 

# Dependancies
* JQuery 2.x

# Install
## 1. Clone into your project
    cd js/lib
    git submodule add https://github.com/alexanderbird/cms-less.git
    mkdir cms-less-content
    cp js/lib/cms-less/404.html cms-less-content
    
## 2. Add to index.html

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

## 3. JQuery? 
If you're not using jQuery 2.x on your project, add it

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    

## Configuration
The following options can be configured by passing an associative array to the Init method, as shown above.

| Key | Default | Description |
|-----|---------|-------------|
|`contentPath`|`cms-less-content`|Directory containing the page content html files|
|`destinationSelector`|`#cms-less-destination`| Css selector for the element that will have its content will be set by CssLess |
|`anchorDelimiter`|`-`|Delimiter between page name and anchor tag. See 'Anchors' below|
|`notFoundPageName`|`404`|Page to be loaded if a page is not found. See 'Page Not Found' below.|


# Other Details
## Anchors
Anything after the `anchorDelimiter` in the hash is ignored when loading the page content. This way, you can still use the hash for page anchors. The only nuisance is that the anchor must now be `<a href='#pagename-anchorname'>Anchor Name</a>` to linke to `<div id='pagename-anchorname'>Anchored Stuff</div>`. 

Because the default `anchorDelimiter` value is being used in this example, the pagename.html file will be loaded. 

If the `anchorDelimiter` value was set to, say, 'rna', then pagename-ancho.html would be loaded. 

## Page Not Found
If the content load fails, then the notFoundPageName content is loaded. A sample 404 page is provided with cms-less: to use it, copy it to your contentPath folder. 

## Developing with CmsLess
### Not working - Cross origin requests not supported
If you are not running a web server locally while developing, you may benefit from [this Stack Overflow question](http://stackoverflow.com/questions/20041656/xmlhttprequest-cannot-load-file-cross-origin-requests-are-only-supported-for-ht). In short, Chrome doesn't allow Cross Origin Requests for local files. So, 

* test in Firefox only, OR
* run a web server locally (WAMP/MAMP/LAMP)

## Redirecting `/path` to `/#path`
### Advantages
* more robust - someone who types in yourdomain.com/path is automatically redirected to yourdomain.com#path
* you can use the built-in CmsLess 404 page for `/invalid-path`

### Setup with apache
Add the following to your .htaccess file: 

    RewriteEngine on

    # Ignore everything in sub-directories - necessary so assets, etc. can still be loaded
    RewriteCond %{REQUEST_URI}    ^/([^/]+)/.*$  [NC]
    RewriteRule .*                -              [L]

    # redirect /path to /#path
    RewriteCond %{REQUEST_URI}    ^/([^/]+)      [NC]
    RewriteRule (.*)              /#%1           [R,NE,L]
    
