var CmsLess = ( function($) {

  var config = { 
    contentPath: 'cms-less-content',
    destinationSelector: '#cms-less-destination',
    anchorDelimiter: '-', 
    notFoundPageName: '404'
  }

  function loadContent(pageName) {
    beforePageLoad(pageName);
    $(config.destinationSelector).load(expandedContentPath(pageName), function(response, status) {
      var actualPageName;
      if(status == 'error') {
        $(config.destinationSelector).load(expandedContentPath(config.notFoundPageName));
        afterPageLoad(config.notFoundPageName);
      } else {
        afterPageLoad(pageName);
      }
    });
  }

  function beforePageLoad(newPageName) {
    // scroll to the top
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  function afterPageLoad(newPageName) {
    // dispatch an event
    pageChangeEvent = new CustomEvent('cms-less-page-change', { 'detail': { pageName: newPageName }});
    document.dispatchEvent(pageChangeEvent);
  }

  function expandedContentPath(pageName) {
    return config.contentPath + "/" + pageName + ".html";
  }
  
  function loadContentFromHash() {
    var pageName = extractPageNameFromHash() || 'index';

    loadContent(pageName);
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
    // if the path has a query parameter, change it to a hash parameter
    if(window.location.href.match(/\?p=.+/)) {
      var pageName = window.location.href.match(/\?p=(.*)$/)[1].split("&")[0];
      window.location.href = "/#" + pageName;
    }

    loadContentFromHash();
    $(window).bind('hashchange', loadContentFromHash);
    
    // progressively enhance links
    $("a[data-cms-less-path]").each(function() {
      var link = $(this);
      link.attr("href", "#" + link.attr("data-cms-less-path"));
    });
  }
  
  return {
    Init : Init,
    PageName : extractPageNameFromHash
  };
  
} )( jQuery );
