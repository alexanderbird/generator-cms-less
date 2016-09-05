var CmsLess = ( function($) {

  var config = { 
    contentPath: 'cms-less-content',
    destinationSelector: '#cms-less-destination',
    anchorDelimiter: '-', 
    notFoundPageName: '404',
    redirects: {}
  }

  function loadContent(pageName) {
    beforePageLoad(pageName);
    $(config.destinationSelector).load(expandedContentPath(pageName), function(response, status) {
      var actualPageName;
      if(status == 'error') {
        $(config.destinationSelector).load(expandedContentPath(config.notFoundPageName));
        markPageAsIndexable(false);
        afterPageLoad(config.notFoundPageName, pageName);
      } else {
        markPageAsIndexable(true);
        afterPageLoad(pageName);
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
      preloadedPageName = preloadedPageName == 'index' ? '' : preloadedPageName;
      window.location.hash = "#" + preloadedPageName;
    } else {
      loadContentFromHash();
    }
    $(window).bind('hashchange', loadContentFromHash);
    
    // upgrade all standard (PHP back-end) links to the corresponding hash path
    $("a.cms-less-link").each(function() {
      var link = $(this);
      var hashPath = hashPathFromStandardPath($(this).attr("href"));
      if(hashPath !== false) {
        link.attr("href", hashPath);
      }
    });
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
    PageName : extractPageNameFromHash
  };
  
} )( jQuery );
