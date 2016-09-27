import { EventManager } from "./event_manager"
import { Cache } from "./cache"

module CmsLess {
  var config = { 
    anchorDelimiter: '-', /* ignore hash content to the right of delimiter */ 
    destinationSelector: '#cms-less-destination', /* id of html element to fill with content */
    eagerLoadPages: [], /* list of pages to eager load */

    /* load content from ( contentPath + pathSeparator + pageName + fileExtension ) */
    contentPath: 'cms-less-content',
    pathSeparator: "/",
    fileExtension: ".html",

    indexPageName: "index", /* treat empty page name as indexPageName */
    notFoundPageName: "404", /* load this page name if the actual page can't be found */
    redirects: {}, /* if pageName is in redirects, change pageName to redirects[pageName] */
    serverErrorElement: $("<div class='error'>Sorry, something wen't wrong when trying to load this page</div>") /* if 404 page can't be found */
  }

  /* Not user-configurable */
  var constants = {
    linkSelector: "a.cms-less-link",
    metaIndexableSelector: "head meta[name='robots']",
    metaIndexableElement: $("<meta name='robots' content='noindex' />"),
    preloadedDataName: "cms-less-preloaded",
    urlPrefix: "/-#"
  }
  
  export function Init(options) {
    config = $.extend(config, options);
    Cache.Init(config);

    // if the path is the PHP back-end path, upgrade it to the corresponding hash path
    var hashPath = hashPathFromStandardPath(window.location.pathname);
    if(hashPath !== false) {
      window.history.replaceState(hashPath, document.title, hashPath);
    }

    // if the site is accessed from a non-upgraded path, the content will be preloaded - respond accordingly
    var preloadedPageName = $(config.destinationSelector).data(constants.preloadedDataName);
    if(preloadedPageName) {
      EventManager.Loaded(preloadedPageName);
      preloadedPageName = preloadedPageName == config.indexPageName ? '' : preloadedPageName;
      window.location.hash = "#" + preloadedPageName;
    } else {
      loadContentFromHash();
    }

    // load content when the hash changes
    $(window).on('hashchange', loadContentFromHash);

    // scroll to the top when a page is loaded
    $(document).on(EventManager.EventNames.loading, function (e) {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
    
    upgradeLinks();

    Cache.EagerLoad(config.eagerLoadPages);
  }

  export function PageName(hash?: string) {
    hash = hash || window.location.hash
    var pageName;
    var delimiterIndex = hash.lastIndexOf(config.anchorDelimiter);
    if(delimiterIndex > 0) {
      pageName = hash.slice(1, delimiterIndex);
    } else {
      pageName = hash.slice(1);
    }

    return pageName || config.indexPageName;
  }

  function upgradeLinks(domFragmentSelector?: string) {
    var links;
    if(domFragmentSelector) {
      links = $(domFragmentSelector).find(constants.linkSelector);
    } else {
      links = $(constants.linkSelector);
    }
    // upgrade all standard (PHP back-end) links to the corresponding hash path
    links.each(function() {
      var link = $(this);
      var pageName = link.attr("href");
      var hashPath = hashPathFromStandardPath(pageName);
      if(hashPath !== false) {
        link.attr("href", hashPath);
      }
    });
  }

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
      upgradeLinks(config.destinationSelector);
    });
  }

  function markPageAsIndexable(indexable) {
    if(indexable) {
      $(constants.metaIndexableSelector).remove();
    } else {
      $("head").append(constants.metaIndexableElement);
    }
  }

  function loadContentFromHash() {
    var pageName = PageName();

    if(pageName in config.redirects) {
      window.location.href = constants.urlPrefix + config.redirects[pageName];
    } else {
      loadContent(pageName);
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
}

export = CmsLess;
