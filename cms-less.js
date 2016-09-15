var CmsLess = ( function() {
  var config = { 
    anchorDelimiter: '-', 
    contentPath: 'cms-less-content',
    destinationSelector: '#cms-less-destination',
    eagerLoadPages: [],
    fileExtension: ".html",
    indexPageName: "index",
    notFoundPageName: "404",
    pathSeparator: "/",
    redirects: {},
    serverErrorElement: $("<div class='error'>Sorry, something wen't wrong when trying to load this page</div>")
  }

  var constants = {
    linkSelector: "a.cms-less-link",
    metaIndexableSelector: "head meta[name='robots']",
    metaIndexableElement: $("<meta name='robots' content='noindex' />"),
    preloadedDataName: "cms-less-preloaded",
    urlPrefix: "/-#"
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
    var preloadedPageName = $(config.destinationSelector).data(constants.preloadedDataName);
    if(preloadedPageName) {
      EventManager.Loaded(preloadedPageName);
      preloadedPageName = preloadedPageName == config.indexPageName ? '' : preloadedPageName;
      window.location.hash = "#" + preloadedPageName;
    } else {
      loadContentFromHash();
    }

    $(window).on('hashchange', loadContentFromHash);
    $(document).on(EventManager.EventNames.loading, function (e) {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
    
    UpgradeLinks();

    Cache.EagerLoad(config.eagerLoadPages);
  }

  function UpgradeLinks() {
    // upgrade all standard (PHP back-end) links to the corresponding hash path
    $(constants.linkSelector).each(function() {
      var link = $(this);
      var pageName = link.attr("href");
      var hashPath = hashPathFromStandardPath(pageName);
      if(hashPath !== false) {
        link.attr("href", hashPath);
      }
    });
  }

  /* Nested Modules */
  var EventManager = (function () {
    var config = {
      eventNamespace: "cms-less",
      events: {
        loading: "page-loading",
        loaded: "page-loaded"
      }
    }

    // programatically prepend event namespace
    $.each(config.events, function (codeName, stringName) {
      config.events[codeName] = config.eventNamespace + ":" + stringName;
    });

    function PageEventData (pageName, missingPageName) {
      this.detail = {
        pageName: pageName,
        missingPageName: missingPageName
      }
    }

    function Loading (pageName, missingPageName) {
      dispatchPageEvent(config.events.loading, new PageEventData(pageName));
    }

    function Loaded (pageName, missingPageName) {
      dispatchPageEvent(config.events.loaded, new PageEventData(pageName, missingPageName));
    }

    function dispatchPageEvent(eventName, pageEventData) {
      pageChangeEvent = new CustomEvent(eventName, pageEventData);
      document.dispatchEvent(pageChangeEvent);
    }

    return {
      Loaded: Loaded,
      Loading: Loading,
      EventNames: config.events
    }
  }());

  var Cache = (function () {
    var cache = {};

    var pageNotFoundPromise;

    var pagesToLoad = [];
    
    function Get (pageName, handlePageContent) {
      ensureLoaded(pageName).then(handlePageContent);
    }

    function EagerLoad (_pagesToLoad) {
      pagesToLoad = _pagesToLoad || [];
      eagerLoadNextPage();
    }

    function getPageNotFoundResult () {
      if(!pageNotFoundPromise) {
        pageNotFoundPromise = $.get(expandedContentPath(config.notFoundPageName)).then(
          function (page) {
            return new Result(page, 404);
          }, function () {
            // Can't show the 404 page, show something mildly helpful
            var error = config.serverErrorElement;
            return new Result(error, 500);
          }
        );
      }

      return pageNotFoundPromise;
    }

    function eagerLoadNextPage () {
      page = pagesToLoad.pop();
      if(page) {
        ensureLoaded(page).then(eagerLoadNextPage);
      }
    }

    function ensureLoaded (pageName) {
      if(!(pageName in cache)) {
        cache[pageName] = new CacheEntry(pageName);
      }

      return cache[pageName];
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
      
      this.then= function (handlePageContent) {
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
    EventManager.Loading(pageName);
    Cache.Get(pageName, function (result) {
      $(config.destinationSelector).html(result.page);
      if(result.code == 200) {
        markPageAsIndexable(true);
        EventManager.Loaded(pageName);
      } else {
        markPageAsIndexable(false);
        EventManager.Loaded(config.notFoundPageName, pageName);
      }
    });
  }

  function markPageAsIndexable(indexable) {
    if(indexable) {
      $(constants.metaIndexableSelector).remove();
    } else {
      $("head").append(constants.metaIndexableElement);
    }
  }

  function expandedContentPath(pageName) {
    return config.contentPath + config.pathSeparator + pageName + config.fileExtension;
  }
  
  function loadContentFromHash() {
    var pageName = extractPageNameFromHash() || 'index';

    if(pageName in config.redirects) {
      window.location.href = constants.urlPrefix + config.redirects[pageName];
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
      return constants.urlPrefix;
    } else if(path.match(/\/[^\/-][^\/]*/)) {
      return constants.urlPrefix + path.match(/\/([^\/-][^\/]*)$/)[1];
    } else {
      return false;
    }
  }
  
  return {
    Init : Init,
    PageName : extractPageNameFromHash,
    UpgradeLinks: UpgradeLinks
  };
  
}() );
