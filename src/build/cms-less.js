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
	var cms_less_core_1 = __webpack_require__(1);
	var wildemitter_1 = __webpack_require__(4);
	var CmsLess = wildemitter_1.WildEmitter.mixin(cms_less_core_1.CmsLessCore);
	module.exports = CmsLess;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var cache_1 = __webpack_require__(2);
	var event_manager_1 = __webpack_require__(3);
	var CmsLessCore;
	(function (CmsLessCore) {
	    var config = {
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
	    };
	    var constants = {
	        linkSelector: "a.cms-less-link",
	        metaIndexableSelector: "head meta[name='robots']",
	        metaIndexableElement: $("<meta name='robots' content='noindex' />"),
	        preloadedDataName: "cms-less-preloaded",
	        urlPrefix: "/-#"
	    };
	    var eventDispatcher;
	    function Init(options) {
	        eventDispatcher = new event_manager_1.EventManager.Dispatcher(this);
	        config = $.extend(config, options);
	        cache_1.Cache.Init(config, eventDispatcher);
	        // if the path is the PHP back-end path, upgrade it to the corresponding hash path
	        var hashPath = hashPathFromStandardPath(window.location.pathname);
	        if (hashPath !== false) {
	            window.history.replaceState(hashPath, document.title, hashPath);
	        }
	        // if the site is accessed from a non-upgraded path, the content will be preloaded - respond accordingly
	        var preloadedPageName = $(config.destinationSelector).data(constants.preloadedDataName);
	        if (preloadedPageName) {
	            eventDispatcher.page.loaded(preloadedPageName);
	            preloadedPageName = preloadedPageName == config.indexPageName ? '' : preloadedPageName;
	            window.location.hash = "#" + preloadedPageName;
	        }
	        else {
	            loadContentFromHash();
	        }
	        // load content when the hash changes
	        $(window).on('hashchange', loadContentFromHash);
	        // scroll to the top when a page is loaded
	        this.on(eventDispatcher.page.loading.eventName, function () {
	            document.body.scrollTop = document.documentElement.scrollTop = 0;
	        });
	        upgradeLinks();
	        cache_1.Cache.EagerLoad(config.eagerLoadPages);
	    }
	    CmsLessCore.Init = Init;
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
	    CmsLessCore.PageName = PageName;
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
	        eventDispatcher.page.loading(pageName);
	        cache_1.Cache.Get(pageName).then(function (result) {
	            $(config.destinationSelector).html(result.html);
	            if (result.code == 200) {
	                markPageAsIndexable(true);
	                eventDispatcher.page.loaded(pageName);
	            }
	            else {
	                markPageAsIndexable(false);
	                eventDispatcher.page.loaded(pageName, config.notFoundPageName);
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
	})(CmsLessCore = exports.CmsLessCore || (exports.CmsLessCore = {}));


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	var Cache;
	(function (Cache) {
	    var Result = (function () {
	        function Result(html, code) {
	            this.html = html;
	            this.code = code;
	        }
	        return Result;
	    }());
	    Cache.Result = Result;
	    var CacheEntry = (function () {
	        function CacheEntry(pageName) {
	            this.promise = $.get(expandedContentPath(pageName)).then(function (html) {
	                return new Result(html, 200);
	            }, function () {
	                return getPageNotFoundResult();
	            });
	        }
	        CacheEntry.prototype.then = function (handlePageContent) {
	            this.promise.always(handlePageContent);
	        };
	        return CacheEntry;
	    }());
	    Cache.CacheEntry = CacheEntry;
	    var cache = {};
	    var config;
	    var eventDispatcher;
	    var pageNotFoundPromise;
	    var pagesToLoad = [];
	    function EagerLoad(_pagesToLoad) {
	        pagesToLoad = _pagesToLoad || [];
	        eagerLoadNextPage();
	    }
	    Cache.EagerLoad = EagerLoad;
	    function Get(pageName) {
	        if (!(pageName in cache)) {
	            eventDispatcher.cache.miss(pageName);
	            cache[pageName] = new CacheEntry(pageName);
	        }
	        else {
	            eventDispatcher.cache.hit(pageName);
	        }
	        return cache[pageName];
	    }
	    Cache.Get = Get;
	    function Init(_config, _eventDispatcher) {
	        config = _config;
	        eventDispatcher = _eventDispatcher;
	    }
	    Cache.Init = Init;
	    function getPageNotFoundResult() {
	        if (!pageNotFoundPromise) {
	            pageNotFoundPromise = $.get(expandedContentPath(config.notFoundPageName)).then(function (html) {
	                return new Result(html, 404);
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
	            Get(page).then(eagerLoadNextPage);
	        }
	    }
	})(Cache = exports.Cache || (exports.Cache = {}));


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	var EventManager;
	(function (EventManager) {
	    var PageData = (function () {
	        function PageData(name, nameOf404Page) {
	            this.name = name;
	            this.nameOf404Page = nameOf404Page;
	            if (this.nameOf404Page) {
	                this.fullName = this.name + " (" + this.nameOf404Page + ")";
	            }
	            else {
	                this.fullName = this.name;
	            }
	        }
	        return PageData;
	    }());
	    EventManager.PageData = PageData;
	    var Dispatcher = (function () {
	        function Dispatcher(emitter) {
	            this.emitter = emitter;
	            this.page = {
	                loading: dispatchableFactory(this, "page:loading"),
	                loaded: dispatchableFactory(this, "page:loaded"),
	            };
	            this.cache = {
	                hit: dispatchableFactory(this, "cache:hit"),
	                miss: dispatchableFactory(this, "cache:miss")
	            };
	        }
	        return Dispatcher;
	    }());
	    EventManager.Dispatcher = Dispatcher;
	    function dispatchableFactory(dispatcher, eventName) {
	        var dispatchable = function (pageName, missingPageName) {
	            dispatcher.emitter.emit(eventName, new PageData(pageName, missingPageName));
	        };
	        dispatchable.eventName = eventName;
	        return dispatchable;
	    }
	})(EventManager = exports.EventManager || (exports.EventManager = {}));


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*
	WildEmitter.js is a slim little event emitter by @henrikjoreteg largely based
	on @visionmedia's Emitter from UI Kit.

	Why? I wanted it standalone.

	I also wanted support for wildcard emitters like this:

	emitter.on('*', function (eventName, other, event, payloads) {

	});

	emitter.on('somenamespace*', function (eventName, payloads) {

	});

	Please note that callbacks triggered by wildcard registered events also get
	the event name as the first argument.
	*/
	"use strict";
	var WildEmitter = (function () {
	    function WildEmitter() {
	    }
	    WildEmitter.mixin = function (object) {
	        _WildEmitter.mixin(object);
	        return object;
	    };
	    return WildEmitter;
	}());
	exports.WildEmitter = WildEmitter;
	var _WildEmitter = function () { };
	_WildEmitter.mixin = function (constructor) {
	    var prototype = constructor.prototype || constructor;
	    prototype.isWildEmitter = true;
	    // Listen on the given `event` with `fn`. Store a group name if present.
	    prototype.on = function (event, groupName, fn) {
	        this.callbacks = this.callbacks || {};
	        var hasGroup = (arguments.length === 3), group = hasGroup ? arguments[1] : undefined, func = hasGroup ? arguments[2] : arguments[1];
	        func._groupName = group;
	        (this.callbacks[event] = this.callbacks[event] || []).push(func);
	        return this;
	    };
	    // Adds an `event` listener that will be invoked a single
	    // time then automatically removed.
	    prototype.once = function (event, groupName, fn) {
	        var self = this, hasGroup = (arguments.length === 3), group = hasGroup ? arguments[1] : undefined, func = hasGroup ? arguments[2] : arguments[1];
	        function on() {
	            self.off(event, on);
	            func.apply(this, arguments);
	        }
	        this.on(event, group, on);
	        return this;
	    };
	    // Unbinds an entire group
	    prototype.releaseGroup = function (groupName) {
	        this.callbacks = this.callbacks || {};
	        var item, i, len, handlers;
	        for (item in this.callbacks) {
	            handlers = this.callbacks[item];
	            for (i = 0, len = handlers.length; i < len; i++) {
	                if (handlers[i]._groupName === groupName) {
	                    //console.log('removing');
	                    // remove it and shorten the array we're looping through
	                    handlers.splice(i, 1);
	                    i--;
	                    len--;
	                }
	            }
	        }
	        return this;
	    };
	    // Remove the given callback for `event` or all
	    // registered callbacks.
	    prototype.off = function (event, fn) {
	        this.callbacks = this.callbacks || {};
	        var callbacks = this.callbacks[event], i;
	        if (!callbacks)
	            return this;
	        // remove all handlers
	        if (arguments.length === 1) {
	            delete this.callbacks[event];
	            return this;
	        }
	        // remove specific handler
	        i = callbacks.indexOf(fn);
	        callbacks.splice(i, 1);
	        if (callbacks.length === 0) {
	            delete this.callbacks[event];
	        }
	        return this;
	    };
	    /// Emit `event` with the given args.
	    // also calls any `*` handlers
	    prototype.emit = function (event) {
	        this.callbacks = this.callbacks || {};
	        var args = [].slice.call(arguments, 1), callbacks = this.callbacks[event], specialCallbacks = this.getWildcardCallbacks(event), i, len, item, listeners;
	        if (callbacks) {
	            listeners = callbacks.slice();
	            for (i = 0, len = listeners.length; i < len; ++i) {
	                if (!listeners[i]) {
	                    break;
	                }
	                listeners[i].apply(this, args);
	            }
	        }
	        if (specialCallbacks) {
	            len = specialCallbacks.length;
	            listeners = specialCallbacks.slice();
	            for (i = 0, len = listeners.length; i < len; ++i) {
	                if (!listeners[i]) {
	                    break;
	                }
	                listeners[i].apply(this, [event].concat(args));
	            }
	        }
	        return this;
	    };
	    // Helper for for finding special wildcard event handlers that match the event
	    prototype.getWildcardCallbacks = function (eventName) {
	        this.callbacks = this.callbacks || {};
	        var item, split, result = [];
	        for (item in this.callbacks) {
	            split = item.split('*');
	            if (item === '*' || (split.length === 2 && eventName.slice(0, split[0].length) === split[0])) {
	                result = result.concat(this.callbacks[item]);
	            }
	        }
	        return result;
	    };
	};
	_WildEmitter.mixin(_WildEmitter);


/***/ }
/******/ ]);