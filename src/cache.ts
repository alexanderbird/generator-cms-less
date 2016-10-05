import { CmsLessConfig } from "./cms_less_config"
import { EventManager } from "./event_manager"

interface CacheStorage {
  [pageName:string]: Cache.CacheEntry 
}

export module Cache {
  export class Result {
    constructor(
      public html: string,
      public code: number
    ) {}
  }

  export class CacheEntry {
    promise: JQueryPromise<Result>;

    constructor(pageName: string) {
      this.promise = $.get(expandedContentPath(pageName)).then(
        function (html) {
          return new Result(html, 200);
        }, function () {
          return getPageNotFoundResult();
        }
      )
    }

    public then(handlePageContent: (result: Result) => void) { 
      this.promise.always(handlePageContent);
    } 
  }

  var cache: CacheStorage = {};

  var config: CmsLessConfig;

  var eventDispatcher: EventManager.Dispatcher;

  var pageNotFoundPromise: JQueryPromise<Result>;

  var pagesToLoad: string[] = [];
  
  export function EagerLoad(_pagesToLoad: string[]): void {
    pagesToLoad = _pagesToLoad || [];
    eagerLoadNextPage();
  }

  export function Get(pageName: string): CacheEntry {
    if(!(pageName in cache)) {
      eventDispatcher.cache.miss(pageName);
      cache[pageName] = new CacheEntry(pageName);
    } else {
      eventDispatcher.cache.hit(pageName);
    }

    return cache[pageName];
  }

  export function Init (_config: CmsLessConfig, _eventDispatcher: EventManager.Dispatcher): void {
    config = _config;
    eventDispatcher = _eventDispatcher;
  }

  function getPageNotFoundResult (): JQueryPromise<Result> {
    if(!pageNotFoundPromise) {
      pageNotFoundPromise = $.get(expandedContentPath(config.notFoundPageName)).then(
        function (html): Cache.Result {
          return new Result(html, 404);
        }, function (): Cache.Result {
          // Can't show the 404 page, show something mildly helpful
          var error = config.serverErrorElement;
          return new Result(error, 500);
        }
      );
    }

    return pageNotFoundPromise;
  }

  function expandedContentPath(pageName: string): string {
    return config.contentPath + config.pathSeparator + pageName + config.fileExtension;
  }
  
  function eagerLoadNextPage (): void {
    var page = pagesToLoad.pop();
    if(page) {
      Get(page).then(eagerLoadNextPage);
    }
  }
}
