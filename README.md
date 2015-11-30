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
    
## 2. Add to index.html

    <script src="js/lib/cms-less/cms-less.js"></script>
    <script type="text/javascript">
      $(function() {
        CmsLess.Init({
          contentPath: 'html'
        });
      });
    </script>

* make sure you use the correct `src`path to cms-less.js in place of `js/lib/cms-less/cms-less.js`

## Configuration
The following options can be configured by passing an associative array to the Init method, as shown above.

| Key | Default | Description |
|-----|---------|-------------|
|`contentPath`|`cms-less-content`|Directory containing the page content html files|
|`destinationSelector`|`#cms-less-destination`| Css selector for the element that will have its content will be set by CssLess |
|`anchorDelimiter`|`-`|Delimiter between page name and anchor tag. See 'Anchors' below|

# Other Details
## Anchors
Anything after the `anchorDelimiter` in the hash is ignored when loading the page content. This way, you can still use the hash for page anchors. The only nuisance is that the anchor must now be `<a href='#pagename-anchorname'>Anchor Name</a>` to linke to `<div id='pagename-anchorname'>Anchored Stuff</div>`. 

Because the default `anchorDelimiter` value is being used in this example, the pagename.html file will be loaded. 

If the `anchorDelimiter` value was set to, say, 'rna', then pagename-ancho.html would be loaded. 