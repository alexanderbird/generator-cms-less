var CmsLess = ( function($) {

  var config = { 
    folderPath: 'pages'
  }
  
  function Init(options) {
    config = $.extend(config, options);
    alert( config.folderPath );
  }
  
  return {
    Init : Init,
  };
  
} )( jQuery );
