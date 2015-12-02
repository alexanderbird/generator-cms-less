var CmsLess = ( function($) {

  var config = { 
    contentPath: 'cms-less-content',
    destinationSelector: '#cms-less-destination',
    anchorDelimiter: '-', 
    notFoundPageName: '404'
  }

  function loadContent(pageName) {
    $(config.destinationSelector).load(expandedContentPath(pageName), function(response, status) {
      if(status == 'error') {
        $(config.destinationSelector).load(expandedContentPath(config.notFoundPageName));
      }
    });
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
      return hash.slice(2, delimiterIndex);
    } else {
      return hash.slice(2);
    }
  }
  
  function Init(options) {
    config = $.extend(config, options);
    loadContentFromHash();
    $(window).bind('hashchange', loadContentFromHash);
  }
  
  return {
    Init : Init,
    PageName : extractPageNameFromHash
  };
  
} )( jQuery );
