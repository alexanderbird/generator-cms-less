# cms-less
Use less CMS on your static web site: a lightweight JavaScript + Ajax "Content Management System" to separate your header and nav from the rest of your site. 

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
          folderPath: 'html'
        });
      });
    </script>

* make sure you use the correct `src`path to cms-less.js in place of `js/lib/cms-less/cms-less.js`

## Configuration
The following options can be configured by passing an associative array to the Init method, as shown above.

| Key | Default | Description |
|-----|---------|-------------|
|`folderPath`|`pages`|Directory containing the page content html files|
