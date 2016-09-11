var CmsLess = ( function($) {
  var config = { 
    contentPath: 'cms-less-content',
    destinationSelector: '#cms-less-destination',
    anchorDelimiter: '-', 
    notFoundPageName: '404',
    eagerLoadPages: [],
    redirects: {}
  }
  
  /* Public Members */
  function Init(options) {
    config = $.extend(config, options);
    // if the path is the PHP back-end path, upgrade it to the corresponding hash path
    var hashPath = hashPathFromStandardPath(window.location.pathname);
    if(hashPath !== false) {
      window.history.replaceState(hashPath, document.title, hashPath);
    }

    // if the site is accessed from a non-upgraded path, the content will be preloaded
    var preloadedPageName = $(config.destinationSelector).data("cms-less-preloaded");
    if(preloadedPageName) {
      afterPageLoad(preloadedPageName);
      preloadedPageName = preloadedPageName == 'index' ? '' : preloadedPageName;
      window.location.hash = "#" + preloadedPageName;
    } else {
      loadContentFromHash();
    }
    $(window).bind('hashchange', loadContentFromHash);
    
    UpgradeLinks();

    Cache.EagerLoad(config.eagerLoadPages);
  }

  function UpgradeLinks() {
    // upgrade all standard (PHP back-end) links to the corresponding hash path
    $("a.cms-less-link").each(function() {
      var link = $(this);
      var pageName = link.attr("href");
      var hashPath = hashPathFromStandardPath(pageName);
      if(hashPath !== false) {
        link.attr("href", hashPath);
      }
    });
  }

  /* Nested Classes */
  var Cache = (function () {
    var pageNotFoundPromise;
    
    var cache = {};
    
    function Get (pageName, handlePageContent) {
      ensureLoaded(pageName); 
      cache[pageName].retrieve(handlePageContent);
    }

    function EagerLoad (pagesToLoad) {
      $.each(pagesToLoad, function (_, pageName) {
        ensureLoaded(pageName);
      });
    }

    function getPageNotFoundResult () {
      if(!pageNotFoundPromise) {
        pageNotFoundPromise = $.get(expandedContentPath(config.notFoundPageName)).then(
          function (page) {
            return new Result(page, 404);
          }, function () {
            // Can't show the 404 page, show something mildly helpful
            var error = $("<div class='error'>Sorry, something wen't wrong when trying to load this page</div>");
            return new Result(error, 500);
          }
        );
      }

      return pageNotFoundPromise;
    }

    function ensureLoaded (pageName) {
      if(!(pageName in cache)) {
        cache[pageName] = new CacheEntry(pageName);
      }
    }

    var Result = function (page, statusCode) {
      this.page = page;
      this.code = statusCode;
    };

    var CacheEntry = function (pageName) {
      this.promise = $.get(expandedContentPath(pageName)).then(
        function (page) {
          return new Result(page, 200);
        }, function () {
          return getPageNotFoundResult();
        }
      )
      
      this.retrieve = function (handlePageContent) {
        this.promise.always(handlePageContent);
      }
    }

    return {
      EagerLoad: EagerLoad,
      Get: Get
    }
  }());

  /* Private Members */
  function loadContent(pageName) {
    beforePageLoad(pageName);
    Cache.Get(pageName, function (result) {
      $(config.destinationSelector).html(result.page);
      if(result.code == 200) {
        markPageAsIndexable(true);
        afterPageLoad(pageName);
      } else {
        markPageAsIndexable(false);
        afterPageLoad(config.notFoundPageName, pageName);
      }
    });
  }

  function markPageAsIndexable(indexable) {
    if(indexable) {
      $("head meta[name='robots']").remove();
    } else {
      $("head").append($("<meta name='robots' content='noindex' />"));
    }
  }

  function beforePageLoad(newPageName) {
    // scroll to the top
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  function afterPageLoad(newPageName, missingPageName) {
    // dispatch an event
    pageChangeEvent = new CustomEvent('cms-less-page-change', { 'detail': { 'pageName': newPageName, 'missingPageName': missingPageName }});
    document.dispatchEvent(pageChangeEvent);
  }

  function expandedContentPath(pageName) {
    return config.contentPath + "/" + pageName + ".html";
  }
  
  function loadContentFromHash() {
    var pageName = extractPageNameFromHash() || 'index';

    if(pageName in config.redirects) {
      window.location.href = "/#" + config.redirects[pageName];
    } else {
      loadContent(pageName);
    }
  }

  function extractPageNameFromHash(hash) {
    hash = hash || window.location.hash
    delimiterIndex = hash.lastIndexOf(config.anchorDelimiter);
    if(delimiterIndex > 0) {
      return hash.slice(1, delimiterIndex);
    } else {
      return hash.slice(1);
    }
  }

  function hashPathFromStandardPath(path) {
    if(path == "/") {
      return '/-#';
    } else if(path.match(/\/[^\/-][^\/]*/)) {
      return '/-#' + path.match(/\/([^\/-][^\/]*)$/)[1];
    } else {
      return false;
    }
  }
  
  return {
    Init : Init,
    PageName : extractPageNameFromHash,
    UpgradeLinks: UpgradeLinks
  };
  
} )( jQuery );
