var CmsLess =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var event_manager_1 = __webpack_require__(1);
	var cache_1 = __webpack_require__(2);
	var CmsLess;
	(function (CmsLess) {
	    var config = {
	        anchorDelimiter: '-',
	        destinationSelector: '#cms-less-destination',
	        eagerLoadPages: [],
	        /* load content from ( contentPath + pathSeparator + pageName + fileExtension ) */
	        contentPath: 'cms-less-content',
	        pathSeparator: "/",
	        fileExtension: ".html",
	        indexPageName: "index",
	        notFoundPageName: "404",
	        redirects: {},
	        serverErrorElement: $("<div class='error'>Sorry, something wen't wrong when trying to load this page</div>") /* if 404 page can't be found */
	    };
	    /* Not user-configurable */
	    var constants = {
	        linkSelector: "a.cms-less-link",
	        metaIndexableSelector: "head meta[name='robots']",
	        metaIndexableElement: $("<meta name='robots' content='noindex' />"),
	        preloadedDataName: "cms-less-preloaded",
	        urlPrefix: "/-#"
	    };
	    function Init(options) {
	        config = $.extend(config, options);
	        cache_1.Cache.Init(config);
	        // if the path is the PHP back-end path, upgrade it to the corresponding hash path
	        var hashPath = hashPathFromStandardPath(window.location.pathname);
	        if (hashPath !== false) {
	            window.history.replaceState(hashPath, document.title, hashPath);
	        }
	        // if the site is accessed from a non-upgraded path, the content will be preloaded - respond accordingly
	        var preloadedPageName = $(config.destinationSelector).data(constants.preloadedDataName);
	        if (preloadedPageName) {
	            event_manager_1.EventManager.Loaded(preloadedPageName);
	            preloadedPageName = preloadedPageName == config.indexPageName ? '' : preloadedPageName;
	            window.location.hash = "#" + preloadedPageName;
	        }
	        else {
	            loadContentFromHash();
	        }
	        // load content when the hash changes
	        $(window).on('hashchange', loadContentFromHash);
	        // scroll to the top when a page is loaded
	        $(document).on(event_manager_1.EventManager.EventNames.loading, function (e) {
	            document.body.scrollTop = document.documentElement.scrollTop = 0;
	        });
	        upgradeLinks();
	        cache_1.Cache.EagerLoad(config.eagerLoadPages);
	    }
	    CmsLess.Init = Init;
	    function PageName(hash) {
	        hash = hash || window.location.hash;
	        var pageName;
	        var delimiterIndex = hash.lastIndexOf(config.anchorDelimiter);
	        if (delimiterIndex > 0) {
	            pageName = hash.slice(1, delimiterIndex);
	        }
	        else {
	            pageName = hash.slice(1);
	        }
	        return pageName || config.indexPageName;
	    }
	    CmsLess.PageName = PageName;
	    function upgradeLinks(domFragmentSelector) {
	        var links;
	        if (domFragmentSelector) {
	            links = $(domFragmentSelector).find(constants.linkSelector);
	        }
	        else {
	            links = $(constants.linkSelector);
	        }
	        // upgrade all standard (PHP back-end) links to the corresponding hash path
	        links.each(function () {
	            var link = $(this);
	            var pageName = link.attr("href");
	            var hashPath = hashPathFromStandardPath(pageName);
	            if (hashPath !== false) {
	                link.attr("href", hashPath);
	            }
	        });
	    }
	    function loadContent(pageName) {
	        event_manager_1.EventManager.Loading(pageName);
	        cache_1.Cache.Get(pageName, function (result) {
	            $(config.destinationSelector).html(result.page);
	            if (result.code == 200) {
	                markPageAsIndexable(true);
	                event_manager_1.EventManager.Loaded(pageName);
	            }
	            else {
	                markPageAsIndexable(false);
	                event_manager_1.EventManager.Loaded(config.notFoundPageName, pageName);
	            }
	            upgradeLinks(config.destinationSelector);
	        });
	    }
	    function markPageAsIndexable(indexable) {
	        if (indexable) {
	            $(constants.metaIndexableSelector).remove();
	        }
	        else {
	            $("head").append(constants.metaIndexableElement);
	        }
	    }
	    function loadContentFromHash() {
	        var pageName = PageName();
	        if (pageName in config.redirects) {
	            window.location.href = constants.urlPrefix + config.redirects[pageName];
	        }
	        else {
	            loadContent(pageName);
	        }
	    }
	    function hashPathFromStandardPath(path) {
	        if (path == "/") {
	            return constants.urlPrefix;
	        }
	        else if (path.match(/\/[^\/-][^\/]*/)) {
	            return constants.urlPrefix + path.match(/\/([^\/-][^\/]*)$/)[1];
	        }
	        else {
	            return false;
	        }
	    }
	})(CmsLess || (CmsLess = {}));
	module.exports = CmsLess;


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	var PageEventData = (function () {
	    function PageEventData(pageName, missingPageName) {
	        this.detail = {
	            pageName: pageName,
	            missingPageName: missingPageName
	        };
	    }
	    return PageEventData;
	}());
	var EventManager;
	(function (EventManager) {
	    EventManager.EventNames = {
	        loading: "cms-less:page-loading",
	        loaded: "cms-less:page-loaded"
	    };
	    function Loading(pageName, missingPageName) {
	        dispatchPageEvent(EventManager.EventNames.loading, new PageEventData(pageName));
	    }
	    EventManager.Loading = Loading;
	    function Loaded(pageName, missingPageName) {
	        dispatchPageEvent(EventManager.EventNames.loaded, new PageEventData(pageName, missingPageName));
	    }
	    EventManager.Loaded = Loaded;
	    function dispatchPageEvent(eventName, pageEventData) {
	        var pageChangeEvent = new CustomEvent(eventName, pageEventData);
	        document.dispatchEvent(pageChangeEvent);
	    }
	})(EventManager = exports.EventManager || (exports.EventManager = {}));


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	var Result = (function () {
	    function Result(page, code) {
	        this.page = page;
	        this.code = code;
	    }
	    return Result;
	}());
	;
	var Cache;
	(function (Cache) {
	    var cache = {};
	    var config;
	    var pageNotFoundPromise;
	    var pagesToLoad = [];
	    function EagerLoad(_pagesToLoad) {
	        pagesToLoad = _pagesToLoad || [];
	        eagerLoadNextPage();
	    }
	    Cache.EagerLoad = EagerLoad;
	    function Get(pageName, handlePageContent) {
	        ensureLoaded(pageName).then(handlePageContent);
	    }
	    Cache.Get = Get;
	    function Init(_config) {
	        config = _config;
	    }
	    Cache.Init = Init;
	    function getPageNotFoundResult() {
	        if (!pageNotFoundPromise) {
	            pageNotFoundPromise = $.get(expandedContentPath(config.notFoundPageName)).then(function (page) {
	                return new Result(page, 404);
	            }, function () {
	                // Can't show the 404 page, show something mildly helpful
	                var error = config.serverErrorElement;
	                return new Result(error, 500);
	            });
	        }
	        return pageNotFoundPromise;
	    }
	    function expandedContentPath(pageName) {
	        return config.contentPath + config.pathSeparator + pageName + config.fileExtension;
	    }
	    function eagerLoadNextPage() {
	        var page = pagesToLoad.pop();
	        if (page) {
	            ensureLoaded(page).then(eagerLoadNextPage);
	        }
	    }
	    function ensureLoaded(pageName) {
	        if (!(pageName in cache)) {
	            cache[pageName] = new CacheEntry(pageName);
	        }
	        return cache[pageName];
	    }
	    var CacheEntry = (function () {
	        function CacheEntry(pageName) {
	            this.promise = $.get(expandedContentPath(pageName)).then(function (page) {
	                return new Result(page, 200);
	            }, function () {
	                return getPageNotFoundResult();
	            });
	        }
	        CacheEntry.prototype.then = function (handlePageContent) {
	            this.promise.always(handlePageContent);
	        };
	        return CacheEntry;
	    }());
	})(Cache = exports.Cache || (exports.Cache = {}));


/***/ }
/******/ ]);