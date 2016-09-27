class Result {
  constructor(
    public page,
    public code
  ) {}
};

export module Cache {
  var cache = {};

  var config;

  var pageNotFoundPromise;

  var pagesToLoad = [];
  
  export function EagerLoad (_pagesToLoad) {
    pagesToLoad = _pagesToLoad || [];
    eagerLoadNextPage();
  }

  export function Get (pageName, handlePageContent) {
    ensureLoaded(pageName).then(handlePageContent);
  }

  export function Init (_config) {
    config = _config;
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

  function expandedContentPath(pageName) {
    return config.contentPath + config.pathSeparator + pageName + config.fileExtension;
  }
  
  function eagerLoadNextPage () {
    var page = pagesToLoad.pop();
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

  class CacheEntry {
    promise: Promise;

    constructor(pageName) {
      this.promise = $.get(expandedContentPath(pageName)).then(
        function (page) {
          return new Result(page, 200);
        }, function () {
          return getPageNotFoundResult();
        }
      )
    }

    public then(handlePageContent) { 
      this.promise.always(handlePageContent);
    } 
  }
}
