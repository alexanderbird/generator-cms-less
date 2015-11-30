var CmsLess = ( function($) {

  var config = { 
    contentPath: 'cms-less-content',
    destinationSelector: '#cms-less-destination',
    anchorDelimiter: '-'
  }

  function loadContent(pageName) {
    $(config.destinationSelector).load(config.contentPath + "/" + pageName + ".html")
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
    loadContentFromHash();
    $(window).bind('hashchange', loadContentFromHash);
  }
  
  return {
    Init : Init
  };
  
} )( jQuery );
