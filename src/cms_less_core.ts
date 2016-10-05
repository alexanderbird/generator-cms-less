import { Cache } from "./cache"
import { CmsLessConfig } from "./cms_less_config"
import { EventManager } from "./event_manager"

interface CmsLessConstants {
  linkSelector: string,
  metaIndexableSelector: string,
  metaIndexableElement: Element|JQuery,
  preloadedDataName: string,
  urlPrefix: string
}

export module CmsLessCore {
  var config: CmsLessConfig  = { 
    anchorDelimiter: '-',  
    destinationSelector: '#cms-less-destination', 
    eagerLoadPages: [], 

    contentPath: 'cms-less-content',
    pathSeparator: "/",
    fileExtension: ".html",

    indexPageName: "index", 
    notFoundPageName: "404", 
    redirects: {}, 
    serverErrorElement: "<div class='error'>Sorry, something went wrong when trying to load this page</div>" 
  }

  var constants: CmsLessConstants = {
    linkSelector: "a.cms-less-link",
    metaIndexableSelector: "head meta[name='robots']",
    metaIndexableElement: $("<meta name='robots' content='noindex' />"),
    preloadedDataName: "cms-less-preloaded",
    urlPrefix: "/-#"
  }

  var eventDispatcher: EventManager.Dispatcher;
  
  export function Init(options: CmsLessConfig): void {
    eventDispatcher = new EventManager.Dispatcher(this);
    config = $.extend(config, options);
    Cache.Init(config, eventDispatcher);

    // if the path is the PHP back-end path, upgrade it to the corresponding hash path
    var hashPath: string|false = hashPathFromStandardPath(window.location.pathname);
    if(hashPath !== false) {
      window.history.replaceState(hashPath, document.title, hashPath);
    }

    // if the site is accessed from a non-upgraded path, the content will be preloaded - respond accordingly
    var preloadedPageName = $(config.destinationSelector).data(constants.preloadedDataName);
    if(preloadedPageName) {
      eventDispatcher.page.loaded(preloadedPageName);
      preloadedPageName = preloadedPageName == config.indexPageName ? '' : preloadedPageName;
      window.location.hash = "#" + preloadedPageName;
    } else {
      loadContentFromHash();
    }

    // load content when the hash changes
    $(window).on('hashchange', loadContentFromHash);

    // scroll to the top when a page is loaded
    this.on(eventDispatcher.page.loading.eventName, function() {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
    
    upgradeLinks();

    Cache.EagerLoad(config.eagerLoadPages);
  }

  export function PageName(hash?: string): string {
    hash = hash || window.location.hash
    var pageName: string;
    var delimiterIndex: number = hash.lastIndexOf(config.anchorDelimiter);
    if(delimiterIndex > 0) {
      pageName = hash.slice(1, delimiterIndex);
    } else {
      pageName = hash.slice(1);
    }

    return pageName || config.indexPageName;
  }

  function upgradeLinks(domFragmentSelector?: string): void {
    var links: JQuery;
    if(domFragmentSelector) {
      links = $(domFragmentSelector).find(constants.linkSelector);
    } else {
      links = $(constants.linkSelector);
    }
    // upgrade all standard (PHP back-end) links to the corresponding hash path
    links.each(function() {
      var link: JQuery = $(this);
      var pageName: string = link.attr("href");
      var hashPath: string|false = hashPathFromStandardPath(pageName);
      if(hashPath !== false) {
        link.attr("href", hashPath);
      }
    });
  }

  function loadContent(pageName: string): void {
    eventDispatcher.page.loading(pageName);
    Cache.Get(pageName).then(function (result: Cache.Result) {
      $(config.destinationSelector).html(result.html);
      if(result.code == 200) {
        markPageAsIndexable(true);
        eventDispatcher.page.loaded(pageName);
      } else {
        markPageAsIndexable(false);
        eventDispatcher.page.loaded(pageName, config.notFoundPageName);
      }
      upgradeLinks(config.destinationSelector);
    });
  }

  function markPageAsIndexable(indexable: boolean): void {
    if(indexable) {
      $(constants.metaIndexableSelector).remove();
    } else {
      $("head").append(constants.metaIndexableElement);
    }
  }

  function loadContentFromHash(): void {
    var pageName: string = PageName();

    if(pageName in config.redirects) {
      window.location.href = constants.urlPrefix + config.redirects[pageName];
    } else {
      loadContent(pageName);
    }
  }

  function hashPathFromStandardPath(path?: string): string|false {
    if(path == null || path === "/") {
      return constants.urlPrefix;
    } else {
      var match = path.match(/\/([^\/-][^\/]*)$/);
      if(match) {
        return constants.urlPrefix + match[1];
      } else {
        return false;
      }
    }
  }
}
