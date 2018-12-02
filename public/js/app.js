webpackJsonp([5],[
/* 0 */,
/* 1 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(22)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(14);
module.exports = __webpack_require__(37);


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App_vue__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__App_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__router__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_buefy__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_buefy___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_buefy__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__layouts_Default_vue__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__layouts_Default_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__layouts_Default_vue__);
/* eslint-disable no-unused-vars */







__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_3_buefy___default.a);

__WEBPACK_IMPORTED_MODULE_0_vue___default.a.component('default-layout', __WEBPACK_IMPORTED_MODULE_4__layouts_Default_vue___default.a);

__WEBPACK_IMPORTED_MODULE_0_vue___default.a.config.productionTip = false;

var app = new __WEBPACK_IMPORTED_MODULE_0_vue___default.a({
  el: '#app',
  router: __WEBPACK_IMPORTED_MODULE_2__router__["a" /* default */],
  render: function render(h) {
    return h(__WEBPACK_IMPORTED_MODULE_1__App_vue___default.a);
  }
});

/***/ }),
/* 15 */,
/* 16 */,
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(18)
/* template */
var __vue_template__ = __webpack_require__(19)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/js/App.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-f348271a", Component.options)
  } else {
    hotAPI.reload("data-v-f348271a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//

var defaultLayout = 'default';

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'App',
  computed: {
    layout: function layout() {
      return (this.$route.meta.layout || defaultLayout) + '-layout';
    }
  }
});

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [_c(_vm.layout, { tag: "component" }, [_c("router-view")], 1)],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-f348271a", module.exports)
  }
}

/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router__ = __webpack_require__(21);



__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]({
  mode: 'history',
  base: Object({"MIX_PUSHER_APP_KEY":"","MIX_PUSHER_APP_CLUSTER":"mt1","NODE_ENV":"development"}).BASE_URL,
  routes: [{
    path: '/',
    name: 'home',
    component: function component() {
      return __webpack_require__.e/* import() */(0).then(__webpack_require__.bind(null, 58));
    }
  }, {
    path: '/about',
    name: 'about',
    component: function component() {
      return __webpack_require__.e/* import() */(3).then(__webpack_require__.bind(null, 59));
    }
  }, {
    path: '/register',
    name: 'register',
    component: function component() {
      return __webpack_require__.e/* import() */(1).then(__webpack_require__.bind(null, 60));
    }
  }, {
    path: '/login',
    name: 'login',
    component: function component() {
      return __webpack_require__.e/* import() */(2).then(__webpack_require__.bind(null, 61));
    }
  }]
}));

/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/*!
  * vue-router v3.0.2
  * (c) 2018 Evan You
  * @license MIT
  */
/*  */

function assert (condition, message) {
  if (!condition) {
    throw new Error(("[vue-router] " + message))
  }
}

function warn (condition, message) {
  if ("development" !== 'production' && !condition) {
    typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
  }
}

function isError (err) {
  return Object.prototype.toString.call(err).indexOf('Error') > -1
}

function extend (a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
  return a
}

var View = {
  name: 'RouterView',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render: function render (_, ref) {
    var props = ref.props;
    var children = ref.children;
    var parent = ref.parent;
    var data = ref.data;

    // used by devtools to display a router-view badge
    data.routerView = true;

    // directly use parent context's createElement() function
    // so that components rendered by router-view can resolve named slots
    var h = parent.$createElement;
    var name = props.name;
    var route = parent.$route;
    var cache = parent._routerViewCache || (parent._routerViewCache = {});

    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    var depth = 0;
    var inactive = false;
    while (parent && parent._routerRoot !== parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++;
      }
      if (parent._inactive) {
        inactive = true;
      }
      parent = parent.$parent;
    }
    data.routerViewDepth = depth;

    // render previous view if the tree is inactive and kept-alive
    if (inactive) {
      return h(cache[name], data, children)
    }

    var matched = route.matched[depth];
    // render empty node if no matched route
    if (!matched) {
      cache[name] = null;
      return h()
    }

    var component = cache[name] = matched.components[name];

    // attach instance registration hook
    // this will be called in the instance's injected lifecycle hooks
    data.registerRouteInstance = function (vm, val) {
      // val could be undefined for unregistration
      var current = matched.instances[name];
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val;
      }
    }

    // also register instance in prepatch hook
    // in case the same component instance is reused across different routes
    ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
      matched.instances[name] = vnode.componentInstance;
    };

    // resolve props
    var propsToPass = data.props = resolveProps(route, matched.props && matched.props[name]);
    if (propsToPass) {
      // clone to prevent mutation
      propsToPass = data.props = extend({}, propsToPass);
      // pass non-declared props as attrs
      var attrs = data.attrs = data.attrs || {};
      for (var key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key];
          delete propsToPass[key];
        }
      }
    }

    return h(component, data, children)
  }
}

function resolveProps (route, config) {
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route)
    case 'boolean':
      return config ? route.params : undefined
    default:
      if (true) {
        warn(
          false,
          "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
          "expecting an object, function or boolean."
        );
      }
  }
}

/*  */

var encodeReserveRE = /[!'()*]/g;
var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
var commaRE = /%2C/g;

// fixed encodeURIComponent which is more conformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
var encode = function (str) { return encodeURIComponent(str)
  .replace(encodeReserveRE, encodeReserveReplacer)
  .replace(commaRE, ','); };

var decode = decodeURIComponent;

function resolveQuery (
  query,
  extraQuery,
  _parseQuery
) {
  if ( extraQuery === void 0 ) extraQuery = {};

  var parse = _parseQuery || parseQuery;
  var parsedQuery;
  try {
    parsedQuery = parse(query || '');
  } catch (e) {
    "development" !== 'production' && warn(false, e.message);
    parsedQuery = {};
  }
  for (var key in extraQuery) {
    parsedQuery[key] = extraQuery[key];
  }
  return parsedQuery
}

function parseQuery (query) {
  var res = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res
  }

  query.split('&').forEach(function (param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = decode(parts.shift());
    var val = parts.length > 0
      ? decode(parts.join('='))
      : null;

    if (res[key] === undefined) {
      res[key] = val;
    } else if (Array.isArray(res[key])) {
      res[key].push(val);
    } else {
      res[key] = [res[key], val];
    }
  });

  return res
}

function stringifyQuery (obj) {
  var res = obj ? Object.keys(obj).map(function (key) {
    var val = obj[key];

    if (val === undefined) {
      return ''
    }

    if (val === null) {
      return encode(key)
    }

    if (Array.isArray(val)) {
      var result = [];
      val.forEach(function (val2) {
        if (val2 === undefined) {
          return
        }
        if (val2 === null) {
          result.push(encode(key));
        } else {
          result.push(encode(key) + '=' + encode(val2));
        }
      });
      return result.join('&')
    }

    return encode(key) + '=' + encode(val)
  }).filter(function (x) { return x.length > 0; }).join('&') : null;
  return res ? ("?" + res) : ''
}

/*  */

var trailingSlashRE = /\/?$/;

function createRoute (
  record,
  location,
  redirectedFrom,
  router
) {
  var stringifyQuery$$1 = router && router.options.stringifyQuery;

  var query = location.query || {};
  try {
    query = clone(query);
  } catch (e) {}

  var route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query: query,
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQuery$$1),
    matched: record ? formatMatch(record) : []
  };
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery$$1);
  }
  return Object.freeze(route)
}

function clone (value) {
  if (Array.isArray(value)) {
    return value.map(clone)
  } else if (value && typeof value === 'object') {
    var res = {};
    for (var key in value) {
      res[key] = clone(value[key]);
    }
    return res
  } else {
    return value
  }
}

// the starting route that represents the initial state
var START = createRoute(null, {
  path: '/'
});

function formatMatch (record) {
  var res = [];
  while (record) {
    res.unshift(record);
    record = record.parent;
  }
  return res
}

function getFullPath (
  ref,
  _stringifyQuery
) {
  var path = ref.path;
  var query = ref.query; if ( query === void 0 ) query = {};
  var hash = ref.hash; if ( hash === void 0 ) hash = '';

  var stringify = _stringifyQuery || stringifyQuery;
  return (path || '/') + stringify(query) + hash
}

function isSameRoute (a, b) {
  if (b === START) {
    return a === b
  } else if (!b) {
    return false
  } else if (a.path && b.path) {
    return (
      a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query)
    )
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query) &&
      isObjectEqual(a.params, b.params)
    )
  } else {
    return false
  }
}

function isObjectEqual (a, b) {
  if ( a === void 0 ) a = {};
  if ( b === void 0 ) b = {};

  // handle null value #1566
  if (!a || !b) { return a === b }
  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every(function (key) {
    var aVal = a[key];
    var bVal = b[key];
    // check nested equality
    if (typeof aVal === 'object' && typeof bVal === 'object') {
      return isObjectEqual(aVal, bVal)
    }
    return String(aVal) === String(bVal)
  })
}

function isIncludedRoute (current, target) {
  return (
    current.path.replace(trailingSlashRE, '/').indexOf(
      target.path.replace(trailingSlashRE, '/')
    ) === 0 &&
    (!target.hash || current.hash === target.hash) &&
    queryIncludes(current.query, target.query)
  )
}

function queryIncludes (current, target) {
  for (var key in target) {
    if (!(key in current)) {
      return false
    }
  }
  return true
}

/*  */

// work around weird flow bug
var toTypes = [String, Object];
var eventTypes = [String, Array];

var Link = {
  name: 'RouterLink',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render: function render (h) {
    var this$1 = this;

    var router = this.$router;
    var current = this.$route;
    var ref = router.resolve(this.to, current, this.append);
    var location = ref.location;
    var route = ref.route;
    var href = ref.href;

    var classes = {};
    var globalActiveClass = router.options.linkActiveClass;
    var globalExactActiveClass = router.options.linkExactActiveClass;
    // Support global empty active class
    var activeClassFallback = globalActiveClass == null
      ? 'router-link-active'
      : globalActiveClass;
    var exactActiveClassFallback = globalExactActiveClass == null
      ? 'router-link-exact-active'
      : globalExactActiveClass;
    var activeClass = this.activeClass == null
      ? activeClassFallback
      : this.activeClass;
    var exactActiveClass = this.exactActiveClass == null
      ? exactActiveClassFallback
      : this.exactActiveClass;
    var compareTarget = location.path
      ? createRoute(null, location, null, router)
      : route;

    classes[exactActiveClass] = isSameRoute(current, compareTarget);
    classes[activeClass] = this.exact
      ? classes[exactActiveClass]
      : isIncludedRoute(current, compareTarget);

    var handler = function (e) {
      if (guardEvent(e)) {
        if (this$1.replace) {
          router.replace(location);
        } else {
          router.push(location);
        }
      }
    };

    var on = { click: guardEvent };
    if (Array.isArray(this.event)) {
      this.event.forEach(function (e) { on[e] = handler; });
    } else {
      on[this.event] = handler;
    }

    var data = {
      class: classes
    };

    if (this.tag === 'a') {
      data.on = on;
      data.attrs = { href: href };
    } else {
      // find the first <a> child and apply listener and href
      var a = findAnchor(this.$slots.default);
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false;
        var aData = a.data = extend({}, a.data);
        aData.on = on;
        var aAttrs = a.data.attrs = extend({}, a.data.attrs);
        aAttrs.href = href;
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on;
      }
    }

    return h(this.tag, data, this.$slots.default)
  }
}

function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
  // don't redirect when preventDefault called
  if (e.defaultPrevented) { return }
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) { return }
  // don't redirect if `target="_blank"`
  if (e.currentTarget && e.currentTarget.getAttribute) {
    var target = e.currentTarget.getAttribute('target');
    if (/\b_blank\b/i.test(target)) { return }
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault();
  }
  return true
}

function findAnchor (children) {
  if (children) {
    var child;
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      if (child.tag === 'a') {
        return child
      }
      if (child.children && (child = findAnchor(child.children))) {
        return child
      }
    }
  }
}

var _Vue;

function install (Vue) {
  if (install.installed && _Vue === Vue) { return }
  install.installed = true;

  _Vue = Vue;

  var isDef = function (v) { return v !== undefined; };

  var registerInstance = function (vm, callVal) {
    var i = vm.$options._parentVnode;
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal);
    }
  };

  Vue.mixin({
    beforeCreate: function beforeCreate () {
      if (isDef(this.$options.router)) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, '_route', this._router.history.current);
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
      }
      registerInstance(this, this);
    },
    destroyed: function destroyed () {
      registerInstance(this);
    }
  });

  Object.defineProperty(Vue.prototype, '$router', {
    get: function get () { return this._routerRoot._router }
  });

  Object.defineProperty(Vue.prototype, '$route', {
    get: function get () { return this._routerRoot._route }
  });

  Vue.component('RouterView', View);
  Vue.component('RouterLink', Link);

  var strats = Vue.config.optionMergeStrategies;
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
}

/*  */

var inBrowser = typeof window !== 'undefined';

/*  */

function resolvePath (
  relative,
  base,
  append
) {
  var firstChar = relative.charAt(0);
  if (firstChar === '/') {
    return relative
  }

  if (firstChar === '?' || firstChar === '#') {
    return base + relative
  }

  var stack = base.split('/');

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  if (!append || !stack[stack.length - 1]) {
    stack.pop();
  }

  // resolve relative path
  var segments = relative.replace(/^\//, '').split('/');
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    if (segment === '..') {
      stack.pop();
    } else if (segment !== '.') {
      stack.push(segment);
    }
  }

  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('');
  }

  return stack.join('/')
}

function parsePath (path) {
  var hash = '';
  var query = '';

  var hashIndex = path.indexOf('#');
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex);
    path = path.slice(0, hashIndex);
  }

  var queryIndex = path.indexOf('?');
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1);
    path = path.slice(0, queryIndex);
  }

  return {
    path: path,
    query: query,
    hash: hash
  }
}

function cleanPath (path) {
  return path.replace(/\/\//g, '/')
}

var isarray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

/**
 * Expose `pathToRegexp`.
 */
var pathToRegexp_1 = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}
pathToRegexp_1.parse = parse_1;
pathToRegexp_1.compile = compile_1;
pathToRegexp_1.tokensToFunction = tokensToFunction_1;
pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

/*  */

// $flow-disable-line
var regexpCompileCache = Object.create(null);

function fillParams (
  path,
  params,
  routeMsg
) {
  try {
    var filler =
      regexpCompileCache[path] ||
      (regexpCompileCache[path] = pathToRegexp_1.compile(path));
    return filler(params || {}, { pretty: true })
  } catch (e) {
    if (true) {
      warn(false, ("missing param for " + routeMsg + ": " + (e.message)));
    }
    return ''
  }
}

/*  */

function createRouteMap (
  routes,
  oldPathList,
  oldPathMap,
  oldNameMap
) {
  // the path list is used to control path matching priority
  var pathList = oldPathList || [];
  // $flow-disable-line
  var pathMap = oldPathMap || Object.create(null);
  // $flow-disable-line
  var nameMap = oldNameMap || Object.create(null);

  routes.forEach(function (route) {
    addRouteRecord(pathList, pathMap, nameMap, route);
  });

  // ensure wildcard routes are always at the end
  for (var i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0]);
      l--;
      i--;
    }
  }

  return {
    pathList: pathList,
    pathMap: pathMap,
    nameMap: nameMap
  }
}

function addRouteRecord (
  pathList,
  pathMap,
  nameMap,
  route,
  parent,
  matchAs
) {
  var path = route.path;
  var name = route.name;
  if (true) {
    assert(path != null, "\"path\" is required in a route configuration.");
    assert(
      typeof route.component !== 'string',
      "route config \"component\" for path: " + (String(path || name)) + " cannot be a " +
      "string id. Use an actual component instead."
    );
  }

  var pathToRegexpOptions = route.pathToRegexpOptions || {};
  var normalizedPath = normalizePath(
    path,
    parent,
    pathToRegexpOptions.strict
  );

  if (typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive;
  }

  var record = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    instances: {},
    name: name,
    parent: parent,
    matchAs: matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props: route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props }
  };

  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (true) {
      if (route.name && !route.redirect && route.children.some(function (child) { return /^\/?$/.test(child.path); })) {
        warn(
          false,
          "Named Route '" + (route.name) + "' has a default child route. " +
          "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
          "the default child route will not be rendered. Remove the name from " +
          "this route and use the name of the default child route for named " +
          "links instead."
        );
      }
    }
    route.children.forEach(function (child) {
      var childMatchAs = matchAs
        ? cleanPath((matchAs + "/" + (child.path)))
        : undefined;
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
    });
  }

  if (route.alias !== undefined) {
    var aliases = Array.isArray(route.alias)
      ? route.alias
      : [route.alias];

    aliases.forEach(function (alias) {
      var aliasRoute = {
        path: alias,
        children: route.children
      };
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/' // matchAs
      );
    });
  }

  if (!pathMap[record.path]) {
    pathList.push(record.path);
    pathMap[record.path] = record;
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record;
    } else if ("development" !== 'production' && !matchAs) {
      warn(
        false,
        "Duplicate named routes definition: " +
        "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
      );
    }
  }
}

function compileRouteRegex (path, pathToRegexpOptions) {
  var regex = pathToRegexp_1(path, [], pathToRegexpOptions);
  if (true) {
    var keys = Object.create(null);
    regex.keys.forEach(function (key) {
      warn(!keys[key.name], ("Duplicate param keys in route with path: \"" + path + "\""));
      keys[key.name] = true;
    });
  }
  return regex
}

function normalizePath (path, parent, strict) {
  if (!strict) { path = path.replace(/\/$/, ''); }
  if (path[0] === '/') { return path }
  if (parent == null) { return path }
  return cleanPath(((parent.path) + "/" + path))
}

/*  */

function normalizeLocation (
  raw,
  current,
  append,
  router
) {
  var next = typeof raw === 'string' ? { path: raw } : raw;
  // named target
  if (next.name || next._normalized) {
    return next
  }

  // relative params
  if (!next.path && next.params && current) {
    next = extend({}, next);
    next._normalized = true;
    var params = extend(extend({}, current.params), next.params);
    if (current.name) {
      next.name = current.name;
      next.params = params;
    } else if (current.matched.length) {
      var rawPath = current.matched[current.matched.length - 1].path;
      next.path = fillParams(rawPath, params, ("path " + (current.path)));
    } else if (true) {
      warn(false, "relative params navigation requires a current route.");
    }
    return next
  }

  var parsedPath = parsePath(next.path || '');
  var basePath = (current && current.path) || '/';
  var path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : basePath;

  var query = resolveQuery(
    parsedPath.query,
    next.query,
    router && router.options.parseQuery
  );

  var hash = next.hash || parsedPath.hash;
  if (hash && hash.charAt(0) !== '#') {
    hash = "#" + hash;
  }

  return {
    _normalized: true,
    path: path,
    query: query,
    hash: hash
  }
}

/*  */



function createMatcher (
  routes,
  router
) {
  var ref = createRouteMap(routes);
  var pathList = ref.pathList;
  var pathMap = ref.pathMap;
  var nameMap = ref.nameMap;

  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap);
  }

  function match (
    raw,
    currentRoute,
    redirectedFrom
  ) {
    var location = normalizeLocation(raw, currentRoute, false, router);
    var name = location.name;

    if (name) {
      var record = nameMap[name];
      if (true) {
        warn(record, ("Route with name '" + name + "' does not exist"));
      }
      if (!record) { return _createRoute(null, location) }
      var paramNames = record.regex.keys
        .filter(function (key) { return !key.optional; })
        .map(function (key) { return key.name; });

      if (typeof location.params !== 'object') {
        location.params = {};
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (var key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key];
          }
        }
      }

      if (record) {
        location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
        return _createRoute(record, location, redirectedFrom)
      }
    } else if (location.path) {
      location.params = {};
      for (var i = 0; i < pathList.length; i++) {
        var path = pathList[i];
        var record$1 = pathMap[path];
        if (matchRoute(record$1.regex, location.path, location.params)) {
          return _createRoute(record$1, location, redirectedFrom)
        }
      }
    }
    // no match
    return _createRoute(null, location)
  }

  function redirect (
    record,
    location
  ) {
    var originalRedirect = record.redirect;
    var redirect = typeof originalRedirect === 'function'
      ? originalRedirect(createRoute(record, location, null, router))
      : originalRedirect;

    if (typeof redirect === 'string') {
      redirect = { path: redirect };
    }

    if (!redirect || typeof redirect !== 'object') {
      if (true) {
        warn(
          false, ("invalid redirect option: " + (JSON.stringify(redirect)))
        );
      }
      return _createRoute(null, location)
    }

    var re = redirect;
    var name = re.name;
    var path = re.path;
    var query = location.query;
    var hash = location.hash;
    var params = location.params;
    query = re.hasOwnProperty('query') ? re.query : query;
    hash = re.hasOwnProperty('hash') ? re.hash : hash;
    params = re.hasOwnProperty('params') ? re.params : params;

    if (name) {
      // resolved named direct
      var targetRecord = nameMap[name];
      if (true) {
        assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
      }
      return match({
        _normalized: true,
        name: name,
        query: query,
        hash: hash,
        params: params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect
      var rawPath = resolveRecordPath(path, record);
      // 2. resolve params
      var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query: query,
        hash: hash
      }, undefined, location)
    } else {
      if (true) {
        warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
      }
      return _createRoute(null, location)
    }
  }

  function alias (
    record,
    location,
    matchAs
  ) {
    var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
    var aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    });
    if (aliasedMatch) {
      var matched = aliasedMatch.matched;
      var aliasedRecord = matched[matched.length - 1];
      location.params = aliasedMatch.params;
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }

  function _createRoute (
    record,
    location,
    redirectedFrom
  ) {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom, router)
  }

  return {
    match: match,
    addRoutes: addRoutes
  }
}

function matchRoute (
  regex,
  path,
  params
) {
  var m = path.match(regex);

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = regex.keys[i - 1];
    var val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];
    if (key) {
      // Fix #1994: using * with props: true generates a param named 0
      params[key.name || 'pathMatch'] = val;
    }
  }

  return true
}

function resolveRecordPath (path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}

/*  */

var positionStore = Object.create(null);

function setupScroll () {
  // Fix for #1585 for Firefox
  // Fix for #2195 Add optional third attribute to workaround a bug in safari https://bugs.webkit.org/show_bug.cgi?id=182678
  window.history.replaceState({ key: getStateKey() }, '', window.location.href.replace(window.location.origin, ''));
  window.addEventListener('popstate', function (e) {
    saveScrollPosition();
    if (e.state && e.state.key) {
      setStateKey(e.state.key);
    }
  });
}

function handleScroll (
  router,
  to,
  from,
  isPop
) {
  if (!router.app) {
    return
  }

  var behavior = router.options.scrollBehavior;
  if (!behavior) {
    return
  }

  if (true) {
    assert(typeof behavior === 'function', "scrollBehavior must be a function");
  }

  // wait until re-render finishes before scrolling
  router.app.$nextTick(function () {
    var position = getScrollPosition();
    var shouldScroll = behavior.call(router, to, from, isPop ? position : null);

    if (!shouldScroll) {
      return
    }

    if (typeof shouldScroll.then === 'function') {
      shouldScroll.then(function (shouldScroll) {
        scrollToPosition((shouldScroll), position);
      }).catch(function (err) {
        if (true) {
          assert(false, err.toString());
        }
      });
    } else {
      scrollToPosition(shouldScroll, position);
    }
  });
}

function saveScrollPosition () {
  var key = getStateKey();
  if (key) {
    positionStore[key] = {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  }
}

function getScrollPosition () {
  var key = getStateKey();
  if (key) {
    return positionStore[key]
  }
}

function getElementPosition (el, offset) {
  var docEl = document.documentElement;
  var docRect = docEl.getBoundingClientRect();
  var elRect = el.getBoundingClientRect();
  return {
    x: elRect.left - docRect.left - offset.x,
    y: elRect.top - docRect.top - offset.y
  }
}

function isValidPosition (obj) {
  return isNumber(obj.x) || isNumber(obj.y)
}

function normalizePosition (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : window.pageXOffset,
    y: isNumber(obj.y) ? obj.y : window.pageYOffset
  }
}

function normalizeOffset (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : 0,
    y: isNumber(obj.y) ? obj.y : 0
  }
}

function isNumber (v) {
  return typeof v === 'number'
}

function scrollToPosition (shouldScroll, position) {
  var isObject = typeof shouldScroll === 'object';
  if (isObject && typeof shouldScroll.selector === 'string') {
    var el = document.querySelector(shouldScroll.selector);
    if (el) {
      var offset = shouldScroll.offset && typeof shouldScroll.offset === 'object' ? shouldScroll.offset : {};
      offset = normalizeOffset(offset);
      position = getElementPosition(el, offset);
    } else if (isValidPosition(shouldScroll)) {
      position = normalizePosition(shouldScroll);
    }
  } else if (isObject && isValidPosition(shouldScroll)) {
    position = normalizePosition(shouldScroll);
  }

  if (position) {
    window.scrollTo(position.x, position.y);
  }
}

/*  */

var supportsPushState = inBrowser && (function () {
  var ua = window.navigator.userAgent;

  if (
    (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
    ua.indexOf('Mobile Safari') !== -1 &&
    ua.indexOf('Chrome') === -1 &&
    ua.indexOf('Windows Phone') === -1
  ) {
    return false
  }

  return window.history && 'pushState' in window.history
})();

// use User Timing api (if present) for more accurate key precision
var Time = inBrowser && window.performance && window.performance.now
  ? window.performance
  : Date;

var _key = genKey();

function genKey () {
  return Time.now().toFixed(3)
}

function getStateKey () {
  return _key
}

function setStateKey (key) {
  _key = key;
}

function pushState (url, replace) {
  saveScrollPosition();
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  var history = window.history;
  try {
    if (replace) {
      history.replaceState({ key: _key }, '', url);
    } else {
      _key = genKey();
      history.pushState({ key: _key }, '', url);
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url);
  }
}

function replaceState (url) {
  pushState(url, true);
}

/*  */

function runQueue (queue, fn, cb) {
  var step = function (index) {
    if (index >= queue.length) {
      cb();
    } else {
      if (queue[index]) {
        fn(queue[index], function () {
          step(index + 1);
        });
      } else {
        step(index + 1);
      }
    }
  };
  step(0);
}

/*  */

function resolveAsyncComponents (matched) {
  return function (to, from, next) {
    var hasAsync = false;
    var pending = 0;
    var error = null;

    flatMapComponents(matched, function (def, _, match, key) {
      // if it's a function and doesn't have cid attached,
      // assume it's an async component resolve function.
      // we are not using Vue's default async resolving mechanism because
      // we want to halt the navigation until the incoming component has been
      // resolved.
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true;
        pending++;

        var resolve = once(function (resolvedDef) {
          if (isESModule(resolvedDef)) {
            resolvedDef = resolvedDef.default;
          }
          // save resolved on async factory in case it's used elsewhere
          def.resolved = typeof resolvedDef === 'function'
            ? resolvedDef
            : _Vue.extend(resolvedDef);
          match.components[key] = resolvedDef;
          pending--;
          if (pending <= 0) {
            next();
          }
        });

        var reject = once(function (reason) {
          var msg = "Failed to resolve async component " + key + ": " + reason;
          "development" !== 'production' && warn(false, msg);
          if (!error) {
            error = isError(reason)
              ? reason
              : new Error(msg);
            next(error);
          }
        });

        var res;
        try {
          res = def(resolve, reject);
        } catch (e) {
          reject(e);
        }
        if (res) {
          if (typeof res.then === 'function') {
            res.then(resolve, reject);
          } else {
            // new syntax in Vue 2.3
            var comp = res.component;
            if (comp && typeof comp.then === 'function') {
              comp.then(resolve, reject);
            }
          }
        }
      }
    });

    if (!hasAsync) { next(); }
  }
}

function flatMapComponents (
  matched,
  fn
) {
  return flatten(matched.map(function (m) {
    return Object.keys(m.components).map(function (key) { return fn(
      m.components[key],
      m.instances[key],
      m, key
    ); })
  }))
}

function flatten (arr) {
  return Array.prototype.concat.apply([], arr)
}

var hasSymbol =
  typeof Symbol === 'function' &&
  typeof Symbol.toStringTag === 'symbol';

function isESModule (obj) {
  return obj.__esModule || (hasSymbol && obj[Symbol.toStringTag] === 'Module')
}

// in Webpack 2, require.ensure now also returns a Promise
// so the resolve/reject functions may get called an extra time
// if the user uses an arrow function shorthand that happens to
// return that Promise.
function once (fn) {
  var called = false;
  return function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    if (called) { return }
    called = true;
    return fn.apply(this, args)
  }
}

/*  */

var History = function History (router, base) {
  this.router = router;
  this.base = normalizeBase(base);
  // start with a route object that stands for "nowhere"
  this.current = START;
  this.pending = null;
  this.ready = false;
  this.readyCbs = [];
  this.readyErrorCbs = [];
  this.errorCbs = [];
};

History.prototype.listen = function listen (cb) {
  this.cb = cb;
};

History.prototype.onReady = function onReady (cb, errorCb) {
  if (this.ready) {
    cb();
  } else {
    this.readyCbs.push(cb);
    if (errorCb) {
      this.readyErrorCbs.push(errorCb);
    }
  }
};

History.prototype.onError = function onError (errorCb) {
  this.errorCbs.push(errorCb);
};

History.prototype.transitionTo = function transitionTo (location, onComplete, onAbort) {
    var this$1 = this;

  var route = this.router.match(location, this.current);
  this.confirmTransition(route, function () {
    this$1.updateRoute(route);
    onComplete && onComplete(route);
    this$1.ensureURL();

    // fire ready cbs once
    if (!this$1.ready) {
      this$1.ready = true;
      this$1.readyCbs.forEach(function (cb) { cb(route); });
    }
  }, function (err) {
    if (onAbort) {
      onAbort(err);
    }
    if (err && !this$1.ready) {
      this$1.ready = true;
      this$1.readyErrorCbs.forEach(function (cb) { cb(err); });
    }
  });
};

History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
    var this$1 = this;

  var current = this.current;
  var abort = function (err) {
    if (isError(err)) {
      if (this$1.errorCbs.length) {
        this$1.errorCbs.forEach(function (cb) { cb(err); });
      } else {
        warn(false, 'uncaught error during route navigation:');
        console.error(err);
      }
    }
    onAbort && onAbort(err);
  };
  if (
    isSameRoute(route, current) &&
    // in the case the route map has been dynamically appended to
    route.matched.length === current.matched.length
  ) {
    this.ensureURL();
    return abort()
  }

  var ref = resolveQueue(this.current.matched, route.matched);
    var updated = ref.updated;
    var deactivated = ref.deactivated;
    var activated = ref.activated;

  var queue = [].concat(
    // in-component leave guards
    extractLeaveGuards(deactivated),
    // global before hooks
    this.router.beforeHooks,
    // in-component update hooks
    extractUpdateHooks(updated),
    // in-config enter guards
    activated.map(function (m) { return m.beforeEnter; }),
    // async components
    resolveAsyncComponents(activated)
  );

  this.pending = route;
  var iterator = function (hook, next) {
    if (this$1.pending !== route) {
      return abort()
    }
    try {
      hook(route, current, function (to) {
        if (to === false || isError(to)) {
          // next(false) -> abort navigation, ensure current URL
          this$1.ensureURL(true);
          abort(to);
        } else if (
          typeof to === 'string' ||
          (typeof to === 'object' && (
            typeof to.path === 'string' ||
            typeof to.name === 'string'
          ))
        ) {
          // next('/') or next({ path: '/' }) -> redirect
          abort();
          if (typeof to === 'object' && to.replace) {
            this$1.replace(to);
          } else {
            this$1.push(to);
          }
        } else {
          // confirm transition and pass on the value
          next(to);
        }
      });
    } catch (e) {
      abort(e);
    }
  };

  runQueue(queue, iterator, function () {
    var postEnterCbs = [];
    var isValid = function () { return this$1.current === route; };
    // wait until async components are resolved before
    // extracting in-component enter guards
    var enterGuards = extractEnterGuards(activated, postEnterCbs, isValid);
    var queue = enterGuards.concat(this$1.router.resolveHooks);
    runQueue(queue, iterator, function () {
      if (this$1.pending !== route) {
        return abort()
      }
      this$1.pending = null;
      onComplete(route);
      if (this$1.router.app) {
        this$1.router.app.$nextTick(function () {
          postEnterCbs.forEach(function (cb) { cb(); });
        });
      }
    });
  });
};

History.prototype.updateRoute = function updateRoute (route) {
  var prev = this.current;
  this.current = route;
  this.cb && this.cb(route);
  this.router.afterHooks.forEach(function (hook) {
    hook && hook(route, prev);
  });
};

function normalizeBase (base) {
  if (!base) {
    if (inBrowser) {
      // respect <base> tag
      var baseEl = document.querySelector('base');
      base = (baseEl && baseEl.getAttribute('href')) || '/';
      // strip full URL origin
      base = base.replace(/^https?:\/\/[^\/]+/, '');
    } else {
      base = '/';
    }
  }
  // make sure there's the starting slash
  if (base.charAt(0) !== '/') {
    base = '/' + base;
  }
  // remove trailing slash
  return base.replace(/\/$/, '')
}

function resolveQueue (
  current,
  next
) {
  var i;
  var max = Math.max(current.length, next.length);
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i)
  }
}

function extractGuards (
  records,
  name,
  bind,
  reverse
) {
  var guards = flatMapComponents(records, function (def, instance, match, key) {
    var guard = extractGuard(def, name);
    if (guard) {
      return Array.isArray(guard)
        ? guard.map(function (guard) { return bind(guard, instance, match, key); })
        : bind(guard, instance, match, key)
    }
  });
  return flatten(reverse ? guards.reverse() : guards)
}

function extractGuard (
  def,
  key
) {
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    def = _Vue.extend(def);
  }
  return def.options[key]
}

function extractLeaveGuards (deactivated) {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}

function extractUpdateHooks (updated) {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
}

function bindGuard (guard, instance) {
  if (instance) {
    return function boundRouteGuard () {
      return guard.apply(instance, arguments)
    }
  }
}

function extractEnterGuards (
  activated,
  cbs,
  isValid
) {
  return extractGuards(activated, 'beforeRouteEnter', function (guard, _, match, key) {
    return bindEnterGuard(guard, match, key, cbs, isValid)
  })
}

function bindEnterGuard (
  guard,
  match,
  key,
  cbs,
  isValid
) {
  return function routeEnterGuard (to, from, next) {
    return guard(to, from, function (cb) {
      next(cb);
      if (typeof cb === 'function') {
        cbs.push(function () {
          // #750
          // if a router-view is wrapped with an out-in transition,
          // the instance may not have been registered at this time.
          // we will need to poll for registration until current route
          // is no longer valid.
          poll(cb, match.instances, key, isValid);
        });
      }
    })
  }
}

function poll (
  cb, // somehow flow cannot infer this is a function
  instances,
  key,
  isValid
) {
  if (
    instances[key] &&
    !instances[key]._isBeingDestroyed // do not reuse being destroyed instance
  ) {
    cb(instances[key]);
  } else if (isValid()) {
    setTimeout(function () {
      poll(cb, instances, key, isValid);
    }, 16);
  }
}

/*  */

var HTML5History = (function (History$$1) {
  function HTML5History (router, base) {
    var this$1 = this;

    History$$1.call(this, router, base);

    var expectScroll = router.options.scrollBehavior;
    var supportsScroll = supportsPushState && expectScroll;

    if (supportsScroll) {
      setupScroll();
    }

    var initLocation = getLocation(this.base);
    window.addEventListener('popstate', function (e) {
      var current = this$1.current;

      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      var location = getLocation(this$1.base);
      if (this$1.current === START && location === initLocation) {
        return
      }

      this$1.transitionTo(location, function (route) {
        if (supportsScroll) {
          handleScroll(router, route, current, true);
        }
      });
    });
  }

  if ( History$$1 ) HTML5History.__proto__ = History$$1;
  HTML5History.prototype = Object.create( History$$1 && History$$1.prototype );
  HTML5History.prototype.constructor = HTML5History;

  HTML5History.prototype.go = function go (n) {
    window.history.go(n);
  };

  HTML5History.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      pushState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      replaceState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.ensureURL = function ensureURL (push) {
    if (getLocation(this.base) !== this.current.fullPath) {
      var current = cleanPath(this.base + this.current.fullPath);
      push ? pushState(current) : replaceState(current);
    }
  };

  HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
    return getLocation(this.base)
  };

  return HTML5History;
}(History));

function getLocation (base) {
  var path = decodeURI(window.location.pathname);
  if (base && path.indexOf(base) === 0) {
    path = path.slice(base.length);
  }
  return (path || '/') + window.location.search + window.location.hash
}

/*  */

var HashHistory = (function (History$$1) {
  function HashHistory (router, base, fallback) {
    History$$1.call(this, router, base);
    // check history fallback deeplinking
    if (fallback && checkFallback(this.base)) {
      return
    }
    ensureSlash();
  }

  if ( History$$1 ) HashHistory.__proto__ = History$$1;
  HashHistory.prototype = Object.create( History$$1 && History$$1.prototype );
  HashHistory.prototype.constructor = HashHistory;

  // this is delayed until the app mounts
  // to avoid the hashchange listener being fired too early
  HashHistory.prototype.setupListeners = function setupListeners () {
    var this$1 = this;

    var router = this.router;
    var expectScroll = router.options.scrollBehavior;
    var supportsScroll = supportsPushState && expectScroll;

    if (supportsScroll) {
      setupScroll();
    }

    window.addEventListener(supportsPushState ? 'popstate' : 'hashchange', function () {
      var current = this$1.current;
      if (!ensureSlash()) {
        return
      }
      this$1.transitionTo(getHash(), function (route) {
        if (supportsScroll) {
          handleScroll(this$1.router, route, current, true);
        }
        if (!supportsPushState) {
          replaceHash(route.fullPath);
        }
      });
    });
  };

  HashHistory.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      pushHash(route.fullPath);
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(location, function (route) {
      replaceHash(route.fullPath);
      handleScroll(this$1.router, route, fromRoute, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HashHistory.prototype.go = function go (n) {
    window.history.go(n);
  };

  HashHistory.prototype.ensureURL = function ensureURL (push) {
    var current = this.current.fullPath;
    if (getHash() !== current) {
      push ? pushHash(current) : replaceHash(current);
    }
  };

  HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    return getHash()
  };

  return HashHistory;
}(History));

function checkFallback (base) {
  var location = getLocation(base);
  if (!/^\/#/.test(location)) {
    window.location.replace(
      cleanPath(base + '/#' + location)
    );
    return true
  }
}

function ensureSlash () {
  var path = getHash();
  if (path.charAt(0) === '/') {
    return true
  }
  replaceHash('/' + path);
  return false
}

function getHash () {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var index = href.indexOf('#');
  return index === -1 ? '' : decodeURI(href.slice(index + 1))
}

function getUrl (path) {
  var href = window.location.href;
  var i = href.indexOf('#');
  var base = i >= 0 ? href.slice(0, i) : href;
  return (base + "#" + path)
}

function pushHash (path) {
  if (supportsPushState) {
    pushState(getUrl(path));
  } else {
    window.location.hash = path;
  }
}

function replaceHash (path) {
  if (supportsPushState) {
    replaceState(getUrl(path));
  } else {
    window.location.replace(getUrl(path));
  }
}

/*  */

var AbstractHistory = (function (History$$1) {
  function AbstractHistory (router, base) {
    History$$1.call(this, router, base);
    this.stack = [];
    this.index = -1;
  }

  if ( History$$1 ) AbstractHistory.__proto__ = History$$1;
  AbstractHistory.prototype = Object.create( History$$1 && History$$1.prototype );
  AbstractHistory.prototype.constructor = AbstractHistory;

  AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
      this$1.index++;
      onComplete && onComplete(route);
    }, onAbort);
  };

  AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
      onComplete && onComplete(route);
    }, onAbort);
  };

  AbstractHistory.prototype.go = function go (n) {
    var this$1 = this;

    var targetIndex = this.index + n;
    if (targetIndex < 0 || targetIndex >= this.stack.length) {
      return
    }
    var route = this.stack[targetIndex];
    this.confirmTransition(route, function () {
      this$1.index = targetIndex;
      this$1.updateRoute(route);
    });
  };

  AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    var current = this.stack[this.stack.length - 1];
    return current ? current.fullPath : '/'
  };

  AbstractHistory.prototype.ensureURL = function ensureURL () {
    // noop
  };

  return AbstractHistory;
}(History));

/*  */



var VueRouter = function VueRouter (options) {
  if ( options === void 0 ) options = {};

  this.app = null;
  this.apps = [];
  this.options = options;
  this.beforeHooks = [];
  this.resolveHooks = [];
  this.afterHooks = [];
  this.matcher = createMatcher(options.routes || [], this);

  var mode = options.mode || 'hash';
  this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false;
  if (this.fallback) {
    mode = 'hash';
  }
  if (!inBrowser) {
    mode = 'abstract';
  }
  this.mode = mode;

  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base);
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback);
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base);
      break
    default:
      if (true) {
        assert(false, ("invalid mode: " + mode));
      }
  }
};

var prototypeAccessors = { currentRoute: { configurable: true } };

VueRouter.prototype.match = function match (
  raw,
  current,
  redirectedFrom
) {
  return this.matcher.match(raw, current, redirectedFrom)
};

prototypeAccessors.currentRoute.get = function () {
  return this.history && this.history.current
};

VueRouter.prototype.init = function init (app /* Vue component instance */) {
    var this$1 = this;

  "development" !== 'production' && assert(
    install.installed,
    "not installed. Make sure to call `Vue.use(VueRouter)` " +
    "before creating root instance."
  );

  this.apps.push(app);

  // main app already initialized.
  if (this.app) {
    return
  }

  this.app = app;

  var history = this.history;

  if (history instanceof HTML5History) {
    history.transitionTo(history.getCurrentLocation());
  } else if (history instanceof HashHistory) {
    var setupHashListener = function () {
      history.setupListeners();
    };
    history.transitionTo(
      history.getCurrentLocation(),
      setupHashListener,
      setupHashListener
    );
  }

  history.listen(function (route) {
    this$1.apps.forEach(function (app) {
      app._route = route;
    });
  });
};

VueRouter.prototype.beforeEach = function beforeEach (fn) {
  return registerHook(this.beforeHooks, fn)
};

VueRouter.prototype.beforeResolve = function beforeResolve (fn) {
  return registerHook(this.resolveHooks, fn)
};

VueRouter.prototype.afterEach = function afterEach (fn) {
  return registerHook(this.afterHooks, fn)
};

VueRouter.prototype.onReady = function onReady (cb, errorCb) {
  this.history.onReady(cb, errorCb);
};

VueRouter.prototype.onError = function onError (errorCb) {
  this.history.onError(errorCb);
};

VueRouter.prototype.push = function push (location, onComplete, onAbort) {
  this.history.push(location, onComplete, onAbort);
};

VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
  this.history.replace(location, onComplete, onAbort);
};

VueRouter.prototype.go = function go (n) {
  this.history.go(n);
};

VueRouter.prototype.back = function back () {
  this.go(-1);
};

VueRouter.prototype.forward = function forward () {
  this.go(1);
};

VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
  var route = to
    ? to.matched
      ? to
      : this.resolve(to).route
    : this.currentRoute;
  if (!route) {
    return []
  }
  return [].concat.apply([], route.matched.map(function (m) {
    return Object.keys(m.components).map(function (key) {
      return m.components[key]
    })
  }))
};

VueRouter.prototype.resolve = function resolve (
  to,
  current,
  append
) {
  var location = normalizeLocation(
    to,
    current || this.history.current,
    append,
    this
  );
  var route = this.match(location, current);
  var fullPath = route.redirectedFrom || route.fullPath;
  var base = this.history.base;
  var href = createHref(base, fullPath, this.mode);
  return {
    location: location,
    route: route,
    href: href,
    // for backwards compat
    normalizedTo: location,
    resolved: route
  }
};

VueRouter.prototype.addRoutes = function addRoutes (routes) {
  this.matcher.addRoutes(routes);
  if (this.history.current !== START) {
    this.history.transitionTo(this.history.getCurrentLocation());
  }
};

Object.defineProperties( VueRouter.prototype, prototypeAccessors );

function registerHook (list, fn) {
  list.push(fn);
  return function () {
    var i = list.indexOf(fn);
    if (i > -1) { list.splice(i, 1); }
  }
}

function createHref (base, fullPath, mode) {
  var path = mode === 'hash' ? '#' + fullPath : fullPath;
  return base ? cleanPath(base + '/' + path) : path
}

VueRouter.install = install;
VueRouter.version = '3.0.2';

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter);
}

/* harmony default export */ __webpack_exports__["a"] = (VueRouter);


/***/ }),
/* 22 */
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

/*! Buefy v0.7.1 | MIT License | github.com/buefy/buefy */ 
(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory(__webpack_require__(2));
	else if(typeof define === 'function' && define.amd)
		define(["vue"], factory);
	else if(typeof exports === 'object')
		exports["Buefy"] = factory(require("vue"));
	else
		root["Buefy"] = factory(root["Vue"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_22__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 68);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// this module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate
    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _defineProperty = __webpack_require__(100);

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (obj, key, value) {
  if (key in obj) {
    (0, _defineProperty2.default)(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return setOptions; });
var config = {
    defaultContainerElement: null,
    defaultIconPack: 'mdi',
    defaultDialogConfirmText: null,
    defaultDialogCancelText: null,
    defaultSnackbarDuration: 3500,
    defaultToastDuration: 2000,
    defaultTooltipType: 'is-primary',
    defaultTooltipAnimated: false,
    defaultInputAutocomplete: 'on',
    defaultDateFormatter: null,
    defaultDateParser: null,
    defaultDateCreator: null,
    defaultDayNames: null,
    defaultMonthNames: null,
    defaultFirstDayOfWeek: null,
    defaultUnselectableDaysOfWeek: null,
    defaultTimeFormatter: null,
    defaultTimeParser: null,
    defaultModalScroll: null,
    defaultDatepickerMobileNative: true,
    defaultTimepickerMobileNative: true,
    defaultNoticeQueue: true,
    defaultInputHasCounter: true
};

/* harmony default export */ __webpack_exports__["a"] = (config);

var setOptions = function setOptions(options) {
    config = options;
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(104),
  /* template */
  __webpack_require__(105),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(34)('wks');
var uid = __webpack_require__(25);
var Symbol = __webpack_require__(8).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(87), __esModule: true };

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = getValueByPath;
/* harmony export (immutable) */ __webpack_exports__["c"] = indexOf;
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return isMobile; });
/* harmony export (immutable) */ __webpack_exports__["e"] = removeElement;
/* harmony export (immutable) */ __webpack_exports__["a"] = escapeRegExpChars;
/**
 * Get value of an object property/path even if it's nested
 */
function getValueByPath(obj, path) {
    var value = path.split('.').reduce(function (o, i) {
        return o[i];
    }, obj);
    return value;
}

/**
 * Extension of indexOf method by equality function if specified
 */
function indexOf(array, obj, fn) {
    if (!array) return -1;

    if (!fn || typeof fn !== 'function') return array.indexOf(obj);

    for (var i = 0; i < array.length; i++) {
        if (fn(array[i], obj)) {
            return i;
        }
    }

    return -1;
}

/**
 * Mobile detection
 * https://www.abeautifulsite.net/detecting-mobile-devices-with-javascript
 */
var isMobile = {
    Android: function Android() {
        return typeof window !== 'undefined' && window.navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function BlackBerry() {
        return typeof window !== 'undefined' && window.navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function iOS() {
        return typeof window !== 'undefined' && window.navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function Opera() {
        return typeof window !== 'undefined' && window.navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function Windows() {
        return typeof window !== 'undefined' && window.navigator.userAgent.match(/IEMobile/i);
    },
    any: function any() {
        return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
    }
};

function removeElement(el) {
    if (typeof el.remove !== 'undefined') {
        el.remove();
    } else if (typeof el.parentNode !== 'undefined') {
        el.parentNode.removeChild(el);
    }
}

/**
 * Escape regex characters
 * http://stackoverflow.com/a/6969486
 */
function escapeRegExpChars(value) {
    if (!value) return value;

    // eslint-disable-next-line
    return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(15);
var IE8_DOM_DEFINE = __webpack_require__(46);
var toPrimitive = __webpack_require__(29);
var dP = Object.defineProperty;

exports.f = __webpack_require__(10) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(19)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 11 */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_config__ = __webpack_require__(2);


/* harmony default export */ __webpack_exports__["a"] = ({
    props: {
        size: String,
        expanded: Boolean,
        loading: Boolean,
        rounded: Boolean,
        icon: String,
        iconPack: String,
        // Native options to use in HTML5 validation
        autocomplete: String,
        maxlength: [Number, String]
    },
    data: function data() {
        return {
            isValid: true,
            isFocused: false,
            newIconPack: this.iconPack || __WEBPACK_IMPORTED_MODULE_0__utils_config__["a" /* default */].defaultIconPack
        };
    },

    computed: {
        /**
         * Find parent Field, max 3 levels deep.
         */
        parentField: function parentField() {
            var parent = this.$parent;
            for (var i = 0; i < 3; i++) {
                if (parent && !parent.$data._isField) {
                    parent = parent.$parent;
                }
            }
            return parent;
        },


        /**
         * Get the type prop from parent if it's a Field.
         */
        statusType: function statusType() {
            if (!this.parentField) return;
            if (!this.parentField.newType) return;
            if (typeof this.parentField.newType === 'string') {
                return this.parentField.newType;
            } else {
                for (var key in this.parentField.newType) {
                    if (this.parentField.newType[key]) {
                        return key;
                    }
                }
            }
        },


        /**
         * Get the message prop from parent if it's a Field.
         */
        statusMessage: function statusMessage() {
            if (!this.parentField) return;

            return this.parentField.newMessage;
        },


        /**
         * Fix icon size for inputs, large was too big
         */
        iconSize: function iconSize() {
            switch (this.size) {
                case 'is-small':
                    return this.size;
                case 'is-medium':
                    return;
                case 'is-large':
                    return this.newIconPack === 'mdi' ? 'is-medium' : '';
            }
        }
    },
    methods: {
        /**
         * Focus method that work dynamically depending on the component.
         */
        focus: function focus() {
            var _this = this;

            if (this.$data._elementRef === undefined) return;

            this.$nextTick(function () {
                return _this.$el.querySelector(_this.$data._elementRef).focus();
            });
        },
        onBlur: function onBlur($event) {
            this.isFocused = false;
            this.$emit('blur', $event);
            this.checkHtml5Validity();
        },
        onFocus: function onFocus($event) {
            this.isFocused = true;
            this.$emit('focus', $event);
        },


        /**
         * Check HTML5 validation, set isValid property.
         * If validation fail, send 'is-danger' type,
         * and error message to parent if it's a Field.
         */
        checkHtml5Validity: function checkHtml5Validity() {
            if (this.$refs[this.$data._elementRef] === undefined) return;

            var el = this.$el.querySelector(this.$data._elementRef);

            var type = null;
            var message = null;
            var isValid = true;
            if (!el.checkValidity()) {
                type = 'is-danger';
                message = el.validationMessage;
                isValid = false;
            }
            this.isValid = isValid;

            if (this.parentField) {
                // Set type only if not defined
                if (!this.parentField.type) {
                    this.parentField.newType = type;
                }
                // Set message only if not defined
                if (!this.parentField.message) {
                    this.parentField.newMessage = message;
                }
            }

            return this.isValid;
        }
    }
});

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(69), __esModule: true };

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(9);
var createDesc = __webpack_require__(20);
module.exports = __webpack_require__(10) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(18);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(49);
var defined = __webpack_require__(31);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(8);
var core = __webpack_require__(6);
var ctx = __webpack_require__(45);
var hide = __webpack_require__(14);
var has = __webpack_require__(11);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_22__;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(48);
var enumBugKeys = __webpack_require__(35);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = true;


/***/ }),
/* 25 */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),
/* 26 */
/***/ (function(module, exports) {

exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(103),
  /* template */
  __webpack_require__(106),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(126),
  /* template */
  __webpack_require__(127),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(18);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),
/* 30 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),
/* 31 */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),
/* 32 */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(34)('keys');
var uid = __webpack_require__(25);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(6);
var global = __webpack_require__(8);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(24) ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),
/* 35 */
/***/ (function(module, exports) {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),
/* 36 */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(31);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $at = __webpack_require__(79)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(53)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var def = __webpack_require__(9).f;
var has = __webpack_require__(11);
var TAG = __webpack_require__(4)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

exports.f = __webpack_require__(4);


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(8);
var core = __webpack_require__(6);
var LIBRARY = __webpack_require__(24);
var wksExt = __webpack_require__(40);
var defineProperty = __webpack_require__(9).f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(118),
  /* template */
  __webpack_require__(119),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(120),
  /* template */
  __webpack_require__(121),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(122),
  /* template */
  __webpack_require__(125),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(71);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(10) && !__webpack_require__(19)(function () {
  return Object.defineProperty(__webpack_require__(47)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(18);
var document = __webpack_require__(8).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(11);
var toIObject = __webpack_require__(16);
var arrayIndexOf = __webpack_require__(73)(false);
var IE_PROTO = __webpack_require__(33)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(30);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(32);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(76),
  /* template */
  __webpack_require__(107),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _iterator = __webpack_require__(77);

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = __webpack_require__(5);

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LIBRARY = __webpack_require__(24);
var $export = __webpack_require__(17);
var redefine = __webpack_require__(54);
var hide = __webpack_require__(14);
var Iterators = __webpack_require__(21);
var $iterCreate = __webpack_require__(80);
var setToStringTag = __webpack_require__(39);
var getPrototypeOf = __webpack_require__(83);
var ITERATOR = __webpack_require__(4)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(14);


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(15);
var dPs = __webpack_require__(81);
var enumBugKeys = __webpack_require__(35);
var IE_PROTO = __webpack_require__(33)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(47)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(82).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(84);
var global = __webpack_require__(8);
var hide = __webpack_require__(14);
var Iterators = __webpack_require__(21);
var TO_STRING_TAG = __webpack_require__(4)('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = __webpack_require__(48);
var hiddenKeys = __webpack_require__(35).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(97), __esModule: true };

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(99);
var ITERATOR = __webpack_require__(4)('iterator');
var Iterators = __webpack_require__(21);
module.exports = __webpack_require__(6).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(108),
  /* template */
  __webpack_require__(109),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(137),
  /* template */
  __webpack_require__(138),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 62 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export isSSR */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return HTMLElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return File; });
// Polyfills for SSR

var isSSR = typeof window === 'undefined';

var HTMLElement = isSSR ? Object : window.HTMLElement;
var File = isSSR ? Object : window.File;

/***/ }),
/* 63 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_icon_Icon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_icon_Icon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_icon_Icon__);



/* harmony default export */ __webpack_exports__["a"] = ({
    components: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()({}, __WEBPACK_IMPORTED_MODULE_1__components_icon_Icon___default.a.name, __WEBPACK_IMPORTED_MODULE_1__components_icon_Icon___default.a),
    props: {
        active: {
            type: Boolean,
            default: true
        },
        title: String,
        closable: {
            type: Boolean,
            default: true
        },
        type: String,
        hasIcon: Boolean,
        size: String,
        iconPack: String,
        iconSize: String,
        autoClose: {
            type: Boolean,
            default: false
        },
        duration: {
            type: Number,
            default: 5000
        }
    },
    data: function data() {
        return {
            isActive: this.active
        };
    },

    watch: {
        active: function active(value) {
            this.isActive = value;
        },
        isActive: function isActive(value) {
            if (value) {
                this.setAutoClose();
            } else {
                if (this.timer) {
                    clearTimeout(this.timer);
                }
            }
        }
    },
    computed: {
        /**
         * Icon name (MDI) based on type.
         */
        icon: function icon() {
            switch (this.type) {
                case 'is-info':
                    return 'information';
                case 'is-success':
                    return 'check-circle';
                case 'is-warning':
                    return 'alert';
                case 'is-danger':
                    return 'alert-circle';
                default:
                    return null;
            }
        }
    },
    methods: {
        /**
         * Close the Message and emit events.
         */
        close: function close() {
            this.isActive = false;
            this.$emit('close');
            this.$emit('update:active', false);
        },

        /**
         * Set timer to auto close message
         */
        setAutoClose: function setAutoClose() {
            var _this = this;

            if (this.autoClose) {
                this.timer = setTimeout(function () {
                    if (_this.isActive) {
                        _this.close();
                    }
                }, this.duration);
            }
        }
    },
    mounted: function mounted() {
        this.setAutoClose();
    }
});

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(149),
  /* template */
  __webpack_require__(150),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 65 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__helpers__ = __webpack_require__(7);



/* harmony default export */ __webpack_exports__["a"] = ({
    props: {
        type: {
            type: String,
            default: 'is-dark'
        },
        message: String,
        duration: Number,
        queue: {
            type: Boolean,
            default: undefined
        },
        position: {
            type: String,
            default: 'is-top',
            validator: function validator(value) {
                return ['is-top-right', 'is-top', 'is-top-left', 'is-bottom-right', 'is-bottom', 'is-bottom-left'].indexOf(value) > -1;
            }
        },
        container: String
    },
    data: function data() {
        return {
            isActive: false,
            parentTop: null,
            parentBottom: null,
            newContainer: this.container || __WEBPACK_IMPORTED_MODULE_0__config__["a" /* default */].defaultContainerElement
        };
    },

    computed: {
        correctParent: function correctParent() {
            switch (this.position) {
                case 'is-top-right':
                case 'is-top':
                case 'is-top-left':
                    return this.parentTop;

                case 'is-bottom-right':
                case 'is-bottom':
                case 'is-bottom-left':
                    return this.parentBottom;
            }
        },
        transition: function transition() {
            switch (this.position) {
                case 'is-top-right':
                case 'is-top':
                case 'is-top-left':
                    return {
                        enter: 'fadeInDown',
                        leave: 'fadeOut'
                    };
                case 'is-bottom-right':
                case 'is-bottom':
                case 'is-bottom-left':
                    return {
                        enter: 'fadeInUp',
                        leave: 'fadeOut'
                    };
            }
        }
    },
    methods: {
        shouldQueue: function shouldQueue() {
            var queue = this.queue !== undefined ? this.queue : __WEBPACK_IMPORTED_MODULE_0__config__["a" /* default */].defaultNoticeQueue;

            if (!queue) return false;

            return this.parentTop.childElementCount > 0 || this.parentBottom.childElementCount > 0;
        },
        close: function close() {
            var _this = this;

            clearTimeout(this.timer);
            this.isActive = false;

            // Timeout for the animation complete before destroying
            setTimeout(function () {
                _this.$destroy();
                Object(__WEBPACK_IMPORTED_MODULE_1__helpers__["e" /* removeElement */])(_this.$el);
            }, 150);
        },
        showNotice: function showNotice() {
            var _this2 = this;

            if (this.shouldQueue()) {
                // Call recursively if should queue
                setTimeout(function () {
                    return _this2.showNotice();
                }, 250);
                return;
            }
            this.correctParent.insertAdjacentElement('afterbegin', this.$el);
            this.isActive = true;

            if (!this.indefinite) {
                this.timer = setTimeout(function () {
                    return _this2.close();
                }, this.newDuration);
            }
        },
        setupContainer: function setupContainer() {
            this.parentTop = document.querySelector('.notices.is-top');
            this.parentBottom = document.querySelector('.notices.is-bottom');

            if (this.parentTop && this.parentBottom) return;

            if (!this.parentTop) {
                this.parentTop = document.createElement('div');
                this.parentTop.className = 'notices is-top';
            }

            if (!this.parentBottom) {
                this.parentBottom = document.createElement('div');
                this.parentBottom.className = 'notices is-bottom';
            }

            var container = document.querySelector(this.newContainer) || document.body;

            container.appendChild(this.parentTop);
            container.appendChild(this.parentBottom);

            if (this.newContainer) {
                this.parentTop.classList.add('has-custom-container');
                this.parentBottom.classList.add('has-custom-container');
            }
        }
    },
    beforeMount: function beforeMount() {
        this.setupContainer();
    },
    mounted: function mounted() {
        this.showNotice();
    }
});

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(176),
  /* template */
  __webpack_require__(177),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(185),
  /* template */
  __webpack_require__(186),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 68 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
var components_namespaceObject = {};
__webpack_require__.d(components_namespaceObject, "Autocomplete", function() { return autocomplete; });
__webpack_require__.d(components_namespaceObject, "Checkbox", function() { return components_checkbox; });
__webpack_require__.d(components_namespaceObject, "Collapse", function() { return collapse; });
__webpack_require__.d(components_namespaceObject, "Datepicker", function() { return datepicker; });
__webpack_require__.d(components_namespaceObject, "Dialog", function() { return dialog; });
__webpack_require__.d(components_namespaceObject, "Dropdown", function() { return dropdown; });
__webpack_require__.d(components_namespaceObject, "Field", function() { return field; });
__webpack_require__.d(components_namespaceObject, "Icon", function() { return icon; });
__webpack_require__.d(components_namespaceObject, "Input", function() { return input; });
__webpack_require__.d(components_namespaceObject, "Loading", function() { return loading; });
__webpack_require__.d(components_namespaceObject, "Message", function() { return components_message; });
__webpack_require__.d(components_namespaceObject, "Modal", function() { return modal; });
__webpack_require__.d(components_namespaceObject, "Notification", function() { return notification; });
__webpack_require__.d(components_namespaceObject, "Pagination", function() { return pagination; });
__webpack_require__.d(components_namespaceObject, "Radio", function() { return components_radio; });
__webpack_require__.d(components_namespaceObject, "Select", function() { return components_select; });
__webpack_require__.d(components_namespaceObject, "Snackbar", function() { return snackbar; });
__webpack_require__.d(components_namespaceObject, "Switch", function() { return components_switch; });
__webpack_require__.d(components_namespaceObject, "Table", function() { return table; });
__webpack_require__.d(components_namespaceObject, "Tabs", function() { return tabs; });
__webpack_require__.d(components_namespaceObject, "Tag", function() { return tag; });
__webpack_require__.d(components_namespaceObject, "Taginput", function() { return taginput; });
__webpack_require__.d(components_namespaceObject, "Timepicker", function() { return timepicker; });
__webpack_require__.d(components_namespaceObject, "Toast", function() { return toast; });
__webpack_require__.d(components_namespaceObject, "Tooltip", function() { return tooltip; });
__webpack_require__.d(components_namespaceObject, "Upload", function() { return upload; });

// EXTERNAL MODULE: ./node_modules/babel-runtime/core-js/object/assign.js
var object_assign = __webpack_require__(13);
var assign_default = /*#__PURE__*/__webpack_require__.n(object_assign);

// EXTERNAL MODULE: ./src/scss/buefy-build.scss
var buefy_build = __webpack_require__(75);
var buefy_build_default = /*#__PURE__*/__webpack_require__.n(buefy_build);

// EXTERNAL MODULE: ./src/components/autocomplete/Autocomplete.vue
var Autocomplete = __webpack_require__(51);
var Autocomplete_default = /*#__PURE__*/__webpack_require__.n(Autocomplete);

// CONCATENATED MODULE: ./src/utils/plugins.js

var use = function use(plugin) {
    if (typeof window !== 'undefined' && window.Vue) {
        window.Vue.use(plugin);
    }
};

var registerComponent = function registerComponent(Vue, component) {
    Vue.component(component.name, component);
};

var registerComponentProgrammatic = function registerComponentProgrammatic(Vue, property, component) {
    Vue.prototype[property] = component;
};
// CONCATENATED MODULE: ./src/components/autocomplete/index.js




var Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Autocomplete_default.a);
    }
};

use(Plugin);

/* harmony default export */ var autocomplete = (Plugin);


// EXTERNAL MODULE: ./src/components/checkbox/Checkbox.vue
var Checkbox = __webpack_require__(60);
var Checkbox_default = /*#__PURE__*/__webpack_require__.n(Checkbox);

// EXTERNAL MODULE: ./src/components/checkbox/CheckboxButton.vue
var CheckboxButton = __webpack_require__(110);
var CheckboxButton_default = /*#__PURE__*/__webpack_require__.n(CheckboxButton);

// CONCATENATED MODULE: ./src/components/checkbox/index.js





var checkbox_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Checkbox_default.a);
        registerComponent(Vue, CheckboxButton_default.a);
    }
};

use(checkbox_Plugin);

/* harmony default export */ var components_checkbox = (checkbox_Plugin);


// EXTERNAL MODULE: ./src/components/collapse/Collapse.vue
var Collapse = __webpack_require__(113);
var Collapse_default = /*#__PURE__*/__webpack_require__.n(Collapse);

// CONCATENATED MODULE: ./src/components/collapse/index.js




var collapse_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Collapse_default.a);
    }
};

use(collapse_Plugin);

/* harmony default export */ var collapse = (collapse_Plugin);


// EXTERNAL MODULE: ./src/components/datepicker/Datepicker.vue
var Datepicker = __webpack_require__(116);
var Datepicker_default = /*#__PURE__*/__webpack_require__.n(Datepicker);

// CONCATENATED MODULE: ./src/components/datepicker/index.js




var datepicker_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Datepicker_default.a);
    }
};

use(datepicker_Plugin);

/* harmony default export */ var datepicker = (datepicker_Plugin);


// EXTERNAL MODULE: external {"commonjs":"vue","commonjs2":"vue","amd":"vue","root":"Vue"}
var external___commonjs___vue___commonjs2___vue___amd___vue___root___Vue__ = __webpack_require__(22);
var external___commonjs___vue___commonjs2___vue___amd___vue___root___Vue___default = /*#__PURE__*/__webpack_require__.n(external___commonjs___vue___commonjs2___vue___amd___vue___root___Vue__);

// EXTERNAL MODULE: ./src/components/dialog/Dialog.vue
var Dialog = __webpack_require__(135);
var Dialog_default = /*#__PURE__*/__webpack_require__.n(Dialog);

// CONCATENATED MODULE: ./src/components/dialog/index.js






function dialog_open(propsData) {
    var vm = typeof window !== 'undefined' && window.Vue ? window.Vue : external___commonjs___vue___commonjs2___vue___amd___vue___root___Vue___default.a;
    var DialogComponent = vm.extend(Dialog_default.a);
    return new DialogComponent({
        el: document.createElement('div'),
        propsData: propsData
    });
}

var DialogProgrammatic = {
    alert: function alert(params) {
        var message = void 0;
        if (typeof params === 'string') message = params;
        var defaultParam = {
            canCancel: false,
            message: message
        };
        var propsData = assign_default()(defaultParam, params);
        return dialog_open(propsData);
    },
    confirm: function confirm(params) {
        var defaultParam = {};
        var propsData = assign_default()(defaultParam, params);
        return dialog_open(propsData);
    },
    prompt: function prompt(params) {
        var defaultParam = {
            hasInput: true,
            confirmText: 'Done'
        };
        var propsData = assign_default()(defaultParam, params);
        return dialog_open(propsData);
    }
};

var dialog_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Dialog_default.a);
        registerComponentProgrammatic(Vue, '$dialog', DialogProgrammatic);
    }
};

use(dialog_Plugin);

/* harmony default export */ var dialog = (dialog_Plugin);


// EXTERNAL MODULE: ./src/components/dropdown/Dropdown.vue
var Dropdown = __webpack_require__(42);
var Dropdown_default = /*#__PURE__*/__webpack_require__.n(Dropdown);

// EXTERNAL MODULE: ./src/components/dropdown/DropdownItem.vue
var DropdownItem = __webpack_require__(43);
var DropdownItem_default = /*#__PURE__*/__webpack_require__.n(DropdownItem);

// CONCATENATED MODULE: ./src/components/dropdown/index.js





var dropdown_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Dropdown_default.a);
        registerComponent(Vue, DropdownItem_default.a);
    }
};

use(dropdown_Plugin);

/* harmony default export */ var dropdown = (dropdown_Plugin);


// EXTERNAL MODULE: ./src/components/field/Field.vue
var Field = __webpack_require__(44);
var Field_default = /*#__PURE__*/__webpack_require__.n(Field);

// CONCATENATED MODULE: ./src/components/field/index.js




var field_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Field_default.a);
    }
};

use(field_Plugin);

/* harmony default export */ var field = (field_Plugin);


// EXTERNAL MODULE: ./src/components/icon/Icon.vue
var Icon = __webpack_require__(3);
var Icon_default = /*#__PURE__*/__webpack_require__.n(Icon);

// CONCATENATED MODULE: ./src/components/icon/index.js




var icon_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Icon_default.a);
    }
};

use(icon_Plugin);

/* harmony default export */ var icon = (icon_Plugin);


// EXTERNAL MODULE: ./src/components/input/Input.vue
var Input = __webpack_require__(27);
var Input_default = /*#__PURE__*/__webpack_require__.n(Input);

// CONCATENATED MODULE: ./src/components/input/index.js




var input_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Input_default.a);
    }
};

use(input_Plugin);

/* harmony default export */ var input = (input_Plugin);


// EXTERNAL MODULE: ./src/components/loading/Loading.vue
var Loading = __webpack_require__(140);
var Loading_default = /*#__PURE__*/__webpack_require__.n(Loading);

// CONCATENATED MODULE: ./src/components/loading/index.js






var LoadingProgrammatic = {
    open: function open(params) {
        var defaultParam = {
            programmatic: true
        };
        var propsData = assign_default()(defaultParam, params);

        var vm = typeof window !== 'undefined' && window.Vue ? window.Vue : external___commonjs___vue___commonjs2___vue___amd___vue___root___Vue___default.a;
        var LoadingComponent = vm.extend(Loading_default.a);
        return new LoadingComponent({
            el: document.createElement('div'),
            propsData: propsData
        });
    }
};

var loading_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Loading_default.a);
        registerComponentProgrammatic(Vue, '$loading', LoadingProgrammatic);
    }
};

use(loading_Plugin);

/* harmony default export */ var loading = (loading_Plugin);


// EXTERNAL MODULE: ./src/components/message/Message.vue
var Message = __webpack_require__(143);
var Message_default = /*#__PURE__*/__webpack_require__.n(Message);

// CONCATENATED MODULE: ./src/components/message/index.js




var message_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Message_default.a);
    }
};

use(message_Plugin);

/* harmony default export */ var components_message = (message_Plugin);


// EXTERNAL MODULE: ./src/components/modal/Modal.vue
var Modal = __webpack_require__(61);
var Modal_default = /*#__PURE__*/__webpack_require__.n(Modal);

// CONCATENATED MODULE: ./src/components/modal/index.js






var ModalProgrammatic = {
    open: function open(params) {
        var content = void 0;
        var parent = void 0;
        if (typeof params === 'string') content = params;

        var defaultParam = {
            programmatic: true,
            content: content
        };
        if (params.parent) {
            parent = params.parent;
            delete params.parent;
        }
        var propsData = assign_default()(defaultParam, params);

        var vm = typeof window !== 'undefined' && window.Vue ? window.Vue : external___commonjs___vue___commonjs2___vue___amd___vue___root___Vue___default.a;
        var ModalComponent = vm.extend(Modal_default.a);
        return new ModalComponent({
            parent: parent,
            el: document.createElement('div'),
            propsData: propsData
        });
    }
};

var modal_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Modal_default.a);
        registerComponentProgrammatic(Vue, '$modal', ModalProgrammatic);
    }
};

use(modal_Plugin);

/* harmony default export */ var modal = (modal_Plugin);


// EXTERNAL MODULE: ./src/components/notification/Notification.vue
var Notification = __webpack_require__(146);
var Notification_default = /*#__PURE__*/__webpack_require__.n(Notification);

// CONCATENATED MODULE: ./src/components/notification/index.js




var notification_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Notification_default.a);
    }
};

use(notification_Plugin);

/* harmony default export */ var notification = (notification_Plugin);


// EXTERNAL MODULE: ./src/components/pagination/Pagination.vue
var Pagination = __webpack_require__(64);
var Pagination_default = /*#__PURE__*/__webpack_require__.n(Pagination);

// CONCATENATED MODULE: ./src/components/pagination/index.js




var pagination_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Pagination_default.a);
    }
};

use(pagination_Plugin);

/* harmony default export */ var pagination = (pagination_Plugin);


// EXTERNAL MODULE: ./src/components/radio/Radio.vue
var Radio = __webpack_require__(151);
var Radio_default = /*#__PURE__*/__webpack_require__.n(Radio);

// EXTERNAL MODULE: ./src/components/radio/RadioButton.vue
var RadioButton = __webpack_require__(154);
var RadioButton_default = /*#__PURE__*/__webpack_require__.n(RadioButton);

// CONCATENATED MODULE: ./src/components/radio/index.js





var radio_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Radio_default.a);
        registerComponent(Vue, RadioButton_default.a);
    }
};

use(radio_Plugin);

/* harmony default export */ var components_radio = (radio_Plugin);


// EXTERNAL MODULE: ./src/components/select/Select.vue
var Select = __webpack_require__(28);
var Select_default = /*#__PURE__*/__webpack_require__.n(Select);

// CONCATENATED MODULE: ./src/components/select/index.js




var select_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Select_default.a);
    }
};

use(select_Plugin);

/* harmony default export */ var components_select = (select_Plugin);


// EXTERNAL MODULE: ./src/components/snackbar/Snackbar.vue
var Snackbar = __webpack_require__(157);
var Snackbar_default = /*#__PURE__*/__webpack_require__.n(Snackbar);

// CONCATENATED MODULE: ./src/components/snackbar/index.js






var SnackbarProgrammatic = {
    open: function open(params) {
        var message = void 0;
        if (typeof params === 'string') message = params;

        var defaultParam = {
            type: 'is-success',
            position: 'is-bottom-right',
            message: message
        };
        var propsData = assign_default()(defaultParam, params);

        var vm = typeof window !== 'undefined' && window.Vue ? window.Vue : external___commonjs___vue___commonjs2___vue___amd___vue___root___Vue___default.a;
        var SnackbarComponent = vm.extend(Snackbar_default.a);
        return new SnackbarComponent({
            el: document.createElement('div'),
            propsData: propsData
        });
    }
};

var snackbar_Plugin = {
    install: function install(Vue) {
        registerComponentProgrammatic(Vue, '$snackbar', SnackbarProgrammatic);
    }
};

use(snackbar_Plugin);

/* harmony default export */ var snackbar = (snackbar_Plugin);


// EXTERNAL MODULE: ./src/components/switch/Switch.vue
var Switch = __webpack_require__(160);
var Switch_default = /*#__PURE__*/__webpack_require__.n(Switch);

// CONCATENATED MODULE: ./src/components/switch/index.js




var switch_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Switch_default.a);
    }
};

use(switch_Plugin);

/* harmony default export */ var components_switch = (switch_Plugin);


// EXTERNAL MODULE: ./src/components/table/Table.vue
var Table = __webpack_require__(163);
var Table_default = /*#__PURE__*/__webpack_require__.n(Table);

// EXTERNAL MODULE: ./src/components/table/TableColumn.vue
var TableColumn = __webpack_require__(66);
var TableColumn_default = /*#__PURE__*/__webpack_require__.n(TableColumn);

// CONCATENATED MODULE: ./src/components/table/index.js





var table_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Table_default.a);
        registerComponent(Vue, TableColumn_default.a);
    }
};

use(table_Plugin);

/* harmony default export */ var table = (table_Plugin);


// EXTERNAL MODULE: ./src/components/tabs/Tabs.vue
var Tabs = __webpack_require__(179);
var Tabs_default = /*#__PURE__*/__webpack_require__.n(Tabs);

// EXTERNAL MODULE: ./src/components/tabs/TabItem.vue
var TabItem = __webpack_require__(182);
var TabItem_default = /*#__PURE__*/__webpack_require__.n(TabItem);

// CONCATENATED MODULE: ./src/components/tabs/index.js





var tabs_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Tabs_default.a);
        registerComponent(Vue, TabItem_default.a);
    }
};

use(tabs_Plugin);

/* harmony default export */ var tabs = (tabs_Plugin);


// EXTERNAL MODULE: ./src/components/tag/Tag.vue
var Tag = __webpack_require__(67);
var Tag_default = /*#__PURE__*/__webpack_require__.n(Tag);

// EXTERNAL MODULE: ./src/components/tag/Taglist.vue
var Taglist = __webpack_require__(187);
var Taglist_default = /*#__PURE__*/__webpack_require__.n(Taglist);

// CONCATENATED MODULE: ./src/components/tag/index.js





var tag_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Tag_default.a);
        registerComponent(Vue, Taglist_default.a);
    }
};

use(tag_Plugin);

/* harmony default export */ var tag = (tag_Plugin);


// EXTERNAL MODULE: ./src/components/taginput/Taginput.vue
var Taginput = __webpack_require__(190);
var Taginput_default = /*#__PURE__*/__webpack_require__.n(Taginput);

// CONCATENATED MODULE: ./src/components/taginput/index.js




var taginput_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Taginput_default.a);
    }
};

use(taginput_Plugin);

/* harmony default export */ var taginput = (taginput_Plugin);


// EXTERNAL MODULE: ./src/components/timepicker/Timepicker.vue
var Timepicker = __webpack_require__(193);
var Timepicker_default = /*#__PURE__*/__webpack_require__.n(Timepicker);

// CONCATENATED MODULE: ./src/components/timepicker/index.js




var timepicker_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Timepicker_default.a);
    }
};

use(timepicker_Plugin);

/* harmony default export */ var timepicker = (timepicker_Plugin);


// EXTERNAL MODULE: ./src/components/toast/Toast.vue
var Toast = __webpack_require__(196);
var Toast_default = /*#__PURE__*/__webpack_require__.n(Toast);

// CONCATENATED MODULE: ./src/components/toast/index.js






var ToastProgrammatic = {
    open: function open(params) {
        var message = void 0;
        if (typeof params === 'string') message = params;

        var defaultParam = { message: message };
        var propsData = assign_default()(defaultParam, params);

        var vm = typeof window !== 'undefined' && window.Vue ? window.Vue : external___commonjs___vue___commonjs2___vue___amd___vue___root___Vue___default.a;
        var ToastComponent = vm.extend(Toast_default.a);
        return new ToastComponent({
            el: document.createElement('div'),
            propsData: propsData
        });
    }
};

var toast_Plugin = {
    install: function install(Vue) {
        registerComponentProgrammatic(Vue, '$toast', ToastProgrammatic);
    }
};

use(toast_Plugin);

/* harmony default export */ var toast = (toast_Plugin);


// EXTERNAL MODULE: ./src/components/tooltip/Tooltip.vue
var Tooltip = __webpack_require__(199);
var Tooltip_default = /*#__PURE__*/__webpack_require__.n(Tooltip);

// CONCATENATED MODULE: ./src/components/tooltip/index.js




var tooltip_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Tooltip_default.a);
    }
};

use(tooltip_Plugin);

/* harmony default export */ var tooltip = (tooltip_Plugin);


// EXTERNAL MODULE: ./src/components/upload/Upload.vue
var Upload = __webpack_require__(202);
var Upload_default = /*#__PURE__*/__webpack_require__.n(Upload);

// CONCATENATED MODULE: ./src/components/upload/index.js




var upload_Plugin = {
    install: function install(Vue) {
        registerComponent(Vue, Upload_default.a);
    }
};

use(upload_Plugin);

/* harmony default export */ var upload = (upload_Plugin);


// CONCATENATED MODULE: ./src/components/index.js




























// EXTERNAL MODULE: ./src/utils/config.js
var config = __webpack_require__(2);

// CONCATENATED MODULE: ./src/index.js









var Buefy = {
    install: function install(Vue) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // Options
        Object(config["b" /* setOptions */])(assign_default()(config["a" /* default */], options));
        // Components
        for (var componentKey in components_namespaceObject) {
            Vue.use(components_namespaceObject[componentKey]);
        }
        // Config component
        var BuefyProgrammatic = {
            setOptions: function setOptions(options) {
                Object(config["b" /* setOptions */])(assign_default()(config["a" /* default */], options));
            }
        };
        registerComponentProgrammatic(Vue, '$buefy', BuefyProgrammatic);
    }
};

use(Buefy);

/* harmony default export */ var src = __webpack_exports__["default"] = (Buefy);

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(70);
module.exports = __webpack_require__(6).Object.assign;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.3.1 Object.assign(target, source)
var $export = __webpack_require__(17);

$export($export.S + $export.F, 'Object', { assign: __webpack_require__(72) });


/***/ }),
/* 71 */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = __webpack_require__(23);
var gOPS = __webpack_require__(36);
var pIE = __webpack_require__(26);
var toObject = __webpack_require__(37);
var IObject = __webpack_require__(49);
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || __webpack_require__(19)(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(16);
var toLength = __webpack_require__(50);
var toAbsoluteIndex = __webpack_require__(74);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(32);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),
/* 75 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 76 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_get_iterator__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_get_iterator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_get_iterator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_helpers__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_FormElementMixin__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__input_Input__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__input_Input___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__input_Input__);



//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BAutocomplete',
    components: __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_defineProperty___default()({}, __WEBPACK_IMPORTED_MODULE_5__input_Input___default.a.name, __WEBPACK_IMPORTED_MODULE_5__input_Input___default.a),
    mixins: [__WEBPACK_IMPORTED_MODULE_4__utils_FormElementMixin__["a" /* default */]],
    inheritAttrs: false,
    props: {
        value: [Number, String],
        data: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        field: {
            type: String,
            default: 'value'
        },
        keepFirst: Boolean,
        clearOnSelect: Boolean,
        openOnFocus: Boolean
    },
    data: function data() {
        return {
            selected: null,
            hovered: null,
            isActive: false,
            newValue: this.value,
            isListInViewportVertically: true,
            hasFocus: false,
            _isAutocomplete: true,
            _elementRef: 'input'
        };
    },

    computed: {
        /**
         * White-listed items to not close when clicked.
         * Add input, dropdown and all children.
         */
        whiteList: function whiteList() {
            var whiteList = [];
            whiteList.push(this.$refs.input.$el.querySelector('input'));
            whiteList.push(this.$refs.dropdown);
            // Add all chidren from dropdown
            if (this.$refs.dropdown !== undefined) {
                var children = this.$refs.dropdown.querySelectorAll('*');
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = __WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_get_iterator___default()(children), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var child = _step.value;

                        whiteList.push(child);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }

            return whiteList;
        },


        /**
         * Check if exists default slot
         */
        hasDefaultSlot: function hasDefaultSlot() {
            return !!this.$scopedSlots.default;
        },


        /**
         * Check if exists "empty" slot
         */
        hasEmptySlot: function hasEmptySlot() {
            return !!this.$slots.empty;
        },


        /**
         * Check if exists "header" slot
         */
        hasHeaderSlot: function hasHeaderSlot() {
            return !!this.$slots.header;
        }
    },
    watch: {
        /**
         * When dropdown is toggled, check the visibility to know when
         * to open upwards.
         */
        isActive: function isActive(active) {
            var _this = this;

            if (active) {
                this.calcDropdownInViewportVertical();
            } else {
                this.$nextTick(function () {
                    return _this.setHovered(null);
                });
                // Timeout to wait for the animation to finish before recalculating
                setTimeout(function () {
                    _this.calcDropdownInViewportVertical();
                }, 100);
            }
        },


        /**
         * When updating input's value
         *   1. Emit changes
         *   2. If value isn't the same as selected, set null
         *   3. Close dropdown if value is clear or else open it
         */
        newValue: function newValue(value) {
            this.$emit('input', value);
            // Check if selected is invalid
            var currentValue = this.getValue(this.selected);
            if (currentValue && currentValue !== value) {
                this.setSelected(null, false);
            }
            // Close dropdown if input is clear or else open it
            if (this.hasFocus && (!this.openOnFocus || value)) {
                this.isActive = !!value;
            }
        },


        /**
         * When v-model is changed:
         *   1. Update internal value.
         *   2. If it's invalid, validate again.
         */
        value: function value(_value) {
            this.newValue = _value;
            !this.isValid && this.$refs.input.checkHtml5Validity();
        },


        /**
         * Select first option if "keep-first
         */
        data: function data(value) {
            // Keep first option always pre-selected
            if (this.keepFirst) {
                this.selectFirstOption(value);
            }
        }
    },
    methods: {
        /**
         * Set which option is currently hovered.
         */
        setHovered: function setHovered(option) {
            if (option === undefined) return;

            this.hovered = option;
        },


        /**
         * Set which option is currently selected, update v-model,
         * update input value and close dropdown.
         */
        setSelected: function setSelected(option) {
            var _this2 = this;

            var closeDropdown = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (option === undefined) return;

            this.selected = option;
            this.$emit('select', this.selected);
            if (this.selected !== null) {
                this.newValue = this.clearOnSelect ? '' : this.getValue(this.selected);
            }
            closeDropdown && this.$nextTick(function () {
                _this2.isActive = false;
            });
        },


        /**
         * Select first option
         */
        selectFirstOption: function selectFirstOption(options) {
            var _this3 = this;

            this.$nextTick(function () {
                if (options.length) {
                    // If has visible data or open on focus, keep updating the hovered
                    if (_this3.openOnFocus || _this3.newValue !== '' && _this3.hovered !== options[0]) {
                        _this3.setHovered(options[0]);
                    }
                } else {
                    _this3.setHovered(null);
                }
            });
        },


        /**
         * Enter key listener.
         * Select the hovered option.
         */
        enterPressed: function enterPressed() {
            if (this.hovered === null) return;
            this.setSelected(this.hovered);
        },


        /**
         * Tab key listener.
         * Select hovered option if it exists, close dropdown, then allow
         * native handling to move to next tabbable element.
         */
        tabPressed: function tabPressed() {
            if (this.hovered === null) {
                this.isActive = false;
                return;
            }
            this.setSelected(this.hovered);
        },


        /**
         * Close dropdown if clicked outside.
         */
        clickedOutside: function clickedOutside(event) {
            if (this.whiteList.indexOf(event.target) < 0) this.isActive = false;
        },


        /**
         * Return display text for the input.
         * If object, get value from path, or else just the value.
         * If hightlight, find the text with regex and make bold.
         */
        getValue: function getValue(option) {
            var isHighlight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (!option) return;

            var value = (typeof option === 'undefined' ? 'undefined' : __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof___default()(option)) === 'object' ? Object(__WEBPACK_IMPORTED_MODULE_3__utils_helpers__["b" /* getValueByPath */])(option, this.field) : option;

            var escapedValue = typeof this.newValue === 'string' ? Object(__WEBPACK_IMPORTED_MODULE_3__utils_helpers__["a" /* escapeRegExpChars */])(this.newValue) : this.newValue;
            var regex = new RegExp('(' + escapedValue + ')', 'gi');

            return isHighlight ? value.replace(regex, '<b>$1</b>') : value;
        },


        /**
         * Calculate if the dropdown is vertically visible when activated,
         * otherwise it is openened upwards.
         */
        calcDropdownInViewportVertical: function calcDropdownInViewportVertical() {
            var _this4 = this;

            this.$nextTick(function () {
                /**
                 * this.$refs.dropdown may be undefined
                 * when Autocomplete is conditional rendered
                 */
                if (_this4.$refs.dropdown === undefined) return;

                var rect = _this4.$refs.dropdown.getBoundingClientRect();

                _this4.isListInViewportVertically = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
            });
        },


        /**
         * Arrows keys listener.
         * If dropdown is active, set hovered option, or else just open.
         */
        keyArrows: function keyArrows(direction) {
            var sum = direction === 'down' ? 1 : -1;
            if (this.isActive) {
                var index = this.data.indexOf(this.hovered) + sum;
                index = index > this.data.length - 1 ? this.data.length : index;
                index = index < 0 ? 0 : index;

                this.setHovered(this.data[index]);

                var list = this.$refs.dropdown.querySelector('.dropdown-content');
                var element = list.querySelectorAll('.dropdown-item:not(.is-disabled)')[index];

                if (!element) return;

                var visMin = list.scrollTop;
                var visMax = list.scrollTop + list.clientHeight - element.clientHeight;

                if (element.offsetTop < visMin) {
                    list.scrollTop = element.offsetTop;
                } else if (element.offsetTop >= visMax) {
                    list.scrollTop = element.offsetTop - list.clientHeight + element.clientHeight;
                }
            } else {
                this.isActive = true;
            }
        },


        /**
         * Focus listener.
         * If value is the same as selected, select all text.
         */
        focused: function focused(event) {
            if (this.getValue(this.selected) === this.newValue) {
                this.$el.querySelector('input').select();
            }
            if (this.openOnFocus) {
                this.isActive = true;
                if (this.keepFirst) {
                    this.selectFirstOption(this.data);
                }
            }
            this.hasFocus = true;
            this.$emit('focus', event);
        },


        /**
         * Blur listener.
        */
        onBlur: function onBlur(event) {
            this.hasFocus = false;
            this.$emit('blur', event);
        }
    },
    created: function created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('click', this.clickedOutside);
            window.addEventListener('resize', this.calcDropdownInViewportVertical);
        }
    },
    beforeDestroy: function beforeDestroy() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('click', this.clickedOutside);
            window.removeEventListener('resize', this.calcDropdownInViewportVertical);
        }
    }
});

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(78), __esModule: true };

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(38);
__webpack_require__(56);
module.exports = __webpack_require__(40).f('iterator');


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(32);
var defined = __webpack_require__(31);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var create = __webpack_require__(55);
var descriptor = __webpack_require__(20);
var setToStringTag = __webpack_require__(39);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(14)(IteratorPrototype, __webpack_require__(4)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(9);
var anObject = __webpack_require__(15);
var getKeys = __webpack_require__(23);

module.exports = __webpack_require__(10) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

var document = __webpack_require__(8).document;
module.exports = document && document.documentElement;


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(11);
var toObject = __webpack_require__(37);
var IE_PROTO = __webpack_require__(33)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var addToUnscopables = __webpack_require__(85);
var step = __webpack_require__(86);
var Iterators = __webpack_require__(21);
var toIObject = __webpack_require__(16);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(53)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),
/* 85 */
/***/ (function(module, exports) {

module.exports = function () { /* empty */ };


/***/ }),
/* 86 */
/***/ (function(module, exports) {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(88);
__webpack_require__(94);
__webpack_require__(95);
__webpack_require__(96);
module.exports = __webpack_require__(6).Symbol;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// ECMAScript 6 symbols shim
var global = __webpack_require__(8);
var has = __webpack_require__(11);
var DESCRIPTORS = __webpack_require__(10);
var $export = __webpack_require__(17);
var redefine = __webpack_require__(54);
var META = __webpack_require__(89).KEY;
var $fails = __webpack_require__(19);
var shared = __webpack_require__(34);
var setToStringTag = __webpack_require__(39);
var uid = __webpack_require__(25);
var wks = __webpack_require__(4);
var wksExt = __webpack_require__(40);
var wksDefine = __webpack_require__(41);
var enumKeys = __webpack_require__(90);
var isArray = __webpack_require__(91);
var anObject = __webpack_require__(15);
var isObject = __webpack_require__(18);
var toIObject = __webpack_require__(16);
var toPrimitive = __webpack_require__(29);
var createDesc = __webpack_require__(20);
var _create = __webpack_require__(55);
var gOPNExt = __webpack_require__(92);
var $GOPD = __webpack_require__(93);
var $DP = __webpack_require__(9);
var $keys = __webpack_require__(23);
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  __webpack_require__(57).f = gOPNExt.f = $getOwnPropertyNames;
  __webpack_require__(26).f = $propertyIsEnumerable;
  __webpack_require__(36).f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !__webpack_require__(24)) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(14)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

var META = __webpack_require__(25)('meta');
var isObject = __webpack_require__(18);
var has = __webpack_require__(11);
var setDesc = __webpack_require__(9).f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !__webpack_require__(19)(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

// all enumerable object keys, includes symbols
var getKeys = __webpack_require__(23);
var gOPS = __webpack_require__(36);
var pIE = __webpack_require__(26);
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(30);
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = __webpack_require__(16);
var gOPN = __webpack_require__(57).f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

var pIE = __webpack_require__(26);
var createDesc = __webpack_require__(20);
var toIObject = __webpack_require__(16);
var toPrimitive = __webpack_require__(29);
var has = __webpack_require__(11);
var IE8_DOM_DEFINE = __webpack_require__(46);
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = __webpack_require__(10) ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};


/***/ }),
/* 94 */
/***/ (function(module, exports) {



/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(41)('asyncIterator');


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(41)('observable');


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(56);
__webpack_require__(38);
module.exports = __webpack_require__(98);


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(15);
var get = __webpack_require__(59);
module.exports = __webpack_require__(6).getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(30);
var TAG = __webpack_require__(4)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(101), __esModule: true };

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(102);
var $Object = __webpack_require__(6).Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

var $export = __webpack_require__(17);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !__webpack_require__(10), 'Object', { defineProperty: __webpack_require__(9).f });


/***/ }),
/* 103 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__icon_Icon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__icon_Icon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__icon_Icon__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_config__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_FormElementMixin__ = __webpack_require__(12);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BInput',
    components: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()({}, __WEBPACK_IMPORTED_MODULE_1__icon_Icon___default.a.name, __WEBPACK_IMPORTED_MODULE_1__icon_Icon___default.a),
    mixins: [__WEBPACK_IMPORTED_MODULE_3__utils_FormElementMixin__["a" /* default */]],
    inheritAttrs: false,
    props: {
        value: [Number, String],
        type: {
            type: String,
            default: 'text'
        },
        passwordReveal: Boolean,
        hasCounter: {
            type: Boolean,
            default: function _default() {
                return __WEBPACK_IMPORTED_MODULE_2__utils_config__["a" /* default */].defaultInputHasCounter;
            }
        }
    },
    data: function data() {
        return {
            newValue: this.value,
            newType: this.type,
            newAutocomplete: this.autocomplete || __WEBPACK_IMPORTED_MODULE_2__utils_config__["a" /* default */].defaultInputAutocomplete,
            isPasswordVisible: false,
            _elementRef: this.type === 'textarea' ? 'textarea' : 'input'
        };
    },

    computed: {
        rootClasses: function rootClasses() {
            return [this.iconPosition, this.size, {
                'is-expanded': this.expanded,
                'is-loading': this.loading,
                'is-clearfix': !this.hasMessage
            }];
        },
        inputClasses: function inputClasses() {
            return [this.statusType, this.size, { 'is-rounded': this.rounded }];
        },
        hasIconRight: function hasIconRight() {
            return this.passwordReveal || this.loading || this.statusType;
        },


        /**
         * Position of the icon or if it's both sides.
         */
        iconPosition: function iconPosition() {
            if (this.icon && this.hasIconRight) {
                return 'has-icons-left has-icons-right';
            } else if (!this.icon && this.hasIconRight) {
                return 'has-icons-right';
            } else if (this.icon) {
                return 'has-icons-left';
            }
        },


        /**
         * Icon name (MDI) based on the type.
         */
        statusTypeIcon: function statusTypeIcon() {
            switch (this.statusType) {
                case 'is-success':
                    return 'check';
                case 'is-danger':
                    return 'alert-circle';
                case 'is-info':
                    return 'information';
                case 'is-warning':
                    return 'alert';
            }
        },


        /**
         * Check if have any message prop from parent if it's a Field.
         */
        hasMessage: function hasMessage() {
            return !!this.statusMessage;
        },


        /**
         * Current password-reveal icon name.
         */
        passwordVisibleIcon: function passwordVisibleIcon() {
            return !this.isPasswordVisible ? 'eye' : 'eye-off';
        },

        /**
         * Get value length
         */
        valueLength: function valueLength() {
            if (typeof this.newValue === 'string') {
                return this.newValue.length;
            } else if (typeof this.newValue === 'number') {
                return this.newValue.toString().length;
            }
            return 0;
        }
    },
    watch: {
        /**
         * When v-model is changed:
         *   1. Set internal value.
         *   2. If it's invalid, validate again.
         */
        value: function value(_value) {
            this.newValue = _value;
        },


        /**
         * Update user's v-model and validate again whenever
         * internal value is changed.
         */
        newValue: function newValue(value) {
            this.$emit('input', value);
            !this.isValid && this.checkHtml5Validity();
        }
    },
    methods: {
        /**
         * Toggle the visibility of a password-reveal input
         * by changing the type and focus the input right away.
         */
        togglePasswordVisibility: function togglePasswordVisibility() {
            var _this = this;

            this.isPasswordVisible = !this.isPasswordVisible;
            this.newType = this.isPasswordVisible ? 'text' : 'password';

            this.$nextTick(function () {
                _this.$refs.input.focus();
            });
        },


        /**
         * Input's 'input' event listener, 'nextTick' is used to prevent event firing
         * before ui update, helps when using masks (Cleavejs and potentially others).
         */
        onInput: function onInput(event) {
            var _this2 = this;

            this.$nextTick(function () {
                _this2.newValue = event.target.value;
            });
        }
    }
});

/***/ }),
/* 104 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_config__ = __webpack_require__(2);
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BIcon',
    props: {
        type: [String, Object],
        pack: String,
        icon: String,
        size: String,
        customSize: String,
        customClass: String,
        both: Boolean // This is used internally to show both MDI and FA icon
    },
    computed: {
        /**
         * Internal icon name based on the pack.
         * If pack is 'fa', gets the equivalent FA icon name of the MDI,
         * internal icons are always MDI.
         */
        newIcon: function newIcon() {
            if (!this.both) {
                if (this.newPack === 'mdi') {
                    return this.newPack + '-' + this.icon;
                } else {
                    return 'fa-' + this.icon;
                }
            }

            return this.newPack === 'mdi' ? this.newPack + '-' + this.icon : 'fa-' + this.getEquivalentIconOf(this.icon);
        },
        newPack: function newPack() {
            return this.pack || __WEBPACK_IMPORTED_MODULE_0__utils_config__["a" /* default */].defaultIconPack;
        },
        newType: function newType() {
            if (!this.type) return;

            var splitType = [];
            if (typeof this.type === 'string') {
                splitType = this.type.split('-');
            } else {
                for (var key in this.type) {
                    if (this.type[key]) {
                        splitType = key.split('-');
                        break;
                    }
                }
            }
            if (splitType.length <= 1) return;

            return 'has-text-' + splitType[1];
        },
        newCustomSize: function newCustomSize() {
            return this.customSize || this.customSizeByPack;
        },
        customSizeByPack: function customSizeByPack() {
            var defaultSize = this.newPack === 'mdi' ? 'mdi-24px' : 'fa-lg';
            var mediumSize = this.newPack === 'mdi' ? 'mdi-36px' : 'fa-2x';
            var largeSize = this.newPack === 'mdi' ? 'mdi-48px' : 'fa-3x';
            switch (this.size) {
                case 'is-small':
                    return;
                case 'is-medium':
                    return mediumSize;
                case 'is-large':
                    return largeSize;
                default:
                    return defaultSize;
            }
        }
    },
    methods: {
        /**
         * Equivalent FA icon name of the MDI.
         */
        getEquivalentIconOf: function getEquivalentIconOf(value) {
            switch (value) {
                case 'check':
                    return 'check';
                case 'information':
                    return 'info-circle';
                case 'check-circle':
                    return 'check-circle';
                case 'alert':
                    return 'exclamation-triangle';
                case 'alert-circle':
                    return 'exclamation-circle';
                case 'arrow-up':
                    return 'arrow-up';
                case 'chevron-right':
                    return 'angle-right';
                case 'chevron-left':
                    return 'angle-left';
                case 'chevron-down':
                    return 'angle-down';
                case 'eye':
                    return 'eye';
                case 'eye-off':
                    return 'eye-slash';
                case 'menu-down':
                    return 'caret-down';
                case 'menu-up':
                    return 'caret-up';
                default:
                    return value;
            }
        }
    }
});

/***/ }),
/* 105 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "icon",
    class: [_vm.newType, _vm.size]
  }, [_c('i', {
    class: [_vm.newPack, _vm.newIcon, _vm.newCustomSize, _vm.customClass]
  })])
},staticRenderFns: []}

/***/ }),
/* 106 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "control",
    class: _vm.rootClasses
  }, [(_vm.type !== 'textarea') ? _c('input', _vm._b({
    ref: "input",
    staticClass: "input",
    class: _vm.inputClasses,
    attrs: {
      "type": _vm.newType,
      "autocomplete": _vm.newAutocomplete,
      "maxlength": _vm.maxlength
    },
    domProps: {
      "value": _vm.newValue
    },
    on: {
      "input": _vm.onInput,
      "blur": _vm.onBlur,
      "focus": _vm.onFocus
    }
  }, 'input', _vm.$attrs, false)) : _c('textarea', _vm._b({
    ref: "textarea",
    staticClass: "textarea",
    class: _vm.inputClasses,
    attrs: {
      "maxlength": _vm.maxlength
    },
    domProps: {
      "value": _vm.newValue
    },
    on: {
      "input": _vm.onInput,
      "blur": _vm.onBlur,
      "focus": _vm.onFocus
    }
  }, 'textarea', _vm.$attrs, false)), _vm._v(" "), (_vm.icon) ? _c('b-icon', {
    staticClass: "is-left",
    attrs: {
      "icon": _vm.icon,
      "pack": _vm.iconPack,
      "size": _vm.iconSize
    }
  }) : _vm._e(), _vm._v(" "), (!_vm.loading && (_vm.passwordReveal || _vm.statusType)) ? _c('b-icon', {
    staticClass: "is-right",
    class: {
      'is-clickable': _vm.passwordReveal
    },
    attrs: {
      "icon": _vm.passwordReveal ? _vm.passwordVisibleIcon : _vm.statusTypeIcon,
      "pack": _vm.iconPack,
      "size": _vm.iconSize,
      "type": !_vm.passwordReveal ? _vm.statusType : 'is-primary',
      "both": ""
    },
    nativeOn: {
      "click": function($event) {
        _vm.togglePasswordVisibility($event)
      }
    }
  }) : _vm._e(), _vm._v(" "), (_vm.maxlength && _vm.hasCounter && _vm.type !== 'number') ? _c('small', {
    staticClass: "help counter",
    class: {
      'is-invisible': !_vm.isFocused
    }
  }, [_vm._v("\n        " + _vm._s(_vm.valueLength) + " / " + _vm._s(_vm.maxlength) + "\n    ")]) : _vm._e()], 1)
},staticRenderFns: []}

/***/ }),
/* 107 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "autocomplete control",
    class: {
      'is-expanded': _vm.expanded
    }
  }, [_c('b-input', _vm._b({
    ref: "input",
    attrs: {
      "size": _vm.size,
      "loading": _vm.loading,
      "rounded": _vm.rounded,
      "icon": _vm.icon,
      "icon-pack": _vm.iconPack,
      "maxlength": _vm.maxlength,
      "autocomplete": "off"
    },
    on: {
      "focus": _vm.focused,
      "blur": _vm.onBlur
    },
    nativeOn: {
      "keyup": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "esc", 27, $event.key)) { return null; }
        $event.preventDefault();
        _vm.isActive = false
      },
      "keydown": [function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "tab", 9, $event.key)) { return null; }
        _vm.tabPressed($event)
      }, function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key)) { return null; }
        $event.preventDefault();
        _vm.enterPressed($event)
      }, function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "up", 38, $event.key)) { return null; }
        $event.preventDefault();
        _vm.keyArrows('up')
      }, function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "down", 40, $event.key)) { return null; }
        $event.preventDefault();
        _vm.keyArrows('down')
      }]
    },
    model: {
      value: (_vm.newValue),
      callback: function($$v) {
        _vm.newValue = $$v
      },
      expression: "newValue"
    }
  }, 'b-input', _vm.$attrs, false)), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.isActive && (_vm.data.length > 0 || _vm.hasEmptySlot || _vm.hasHeaderSlot)),
      expression: "isActive && (data.length > 0 || hasEmptySlot || hasHeaderSlot)"
    }],
    ref: "dropdown",
    staticClass: "dropdown-menu",
    class: {
      'is-opened-top': !_vm.isListInViewportVertically
    }
  }, [_c('div', {
    staticClass: "dropdown-content"
  }, [(_vm.hasHeaderSlot) ? _c('div', {
    staticClass: "dropdown-item"
  }, [_vm._t("header")], 2) : _vm._e(), _vm._v(" "), _vm._l((_vm.data), function(option, index) {
    return _c('a', {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: (_vm.isActive),
        expression: "isActive"
      }],
      key: index,
      staticClass: "dropdown-item",
      class: {
        'is-hovered': option === _vm.hovered
      },
      on: {
        "click": function($event) {
          _vm.setSelected(option)
        }
      }
    }, [(_vm.hasDefaultSlot) ? _vm._t("default", null, {
      option: option,
      index: index
    }) : _c('span', {
      domProps: {
        "innerHTML": _vm._s(_vm.getValue(option, true))
      }
    })], 2)
  }), _vm._v(" "), (_vm.data.length === 0 && _vm.hasEmptySlot) ? _c('div', {
    staticClass: "dropdown-item is-disabled"
  }, [_vm._t("empty")], 2) : _vm._e()], 2)])])], 1)
},staticRenderFns: []}

/***/ }),
/* 108 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BCheckbox',
    props: {
        value: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        nativeValue: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        indeterminate: Boolean,
        type: String,
        disabled: Boolean,
        required: Boolean,
        name: String,
        size: String,
        trueValue: {
            type: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
            default: true
        },
        falseValue: {
            type: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
            default: false
        }
    },
    data: function data() {
        return {
            newValue: this.value
        };
    },

    computed: {
        computedValue: {
            get: function get() {
                return this.newValue;
            },
            set: function set(value) {
                this.newValue = value;
                this.$emit('input', value);
            }
        }
    },
    watch: {
        /**
         * When v-model change, set internal value.
         */
        value: function value(_value) {
            this.newValue = _value;
        }
    }
});

/***/ }),
/* 109 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('label', {
    ref: "label",
    staticClass: "b-checkbox checkbox",
    class: [_vm.size, {
      'is-disabled': _vm.disabled
    }],
    attrs: {
      "disabled": _vm.disabled,
      "tabindex": _vm.disabled ? false : 0
    },
    on: {
      "keydown": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key) && _vm._k($event.keyCode, "space", 32, $event.key)) { return null; }
        $event.preventDefault();
        _vm.$refs.label.click()
      }
    }
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.computedValue),
      expression: "computedValue"
    }],
    attrs: {
      "type": "checkbox",
      "disabled": _vm.disabled,
      "required": _vm.required,
      "name": _vm.name,
      "true-value": _vm.trueValue,
      "false-value": _vm.falseValue
    },
    domProps: {
      "indeterminate": _vm.indeterminate,
      "value": _vm.nativeValue,
      "checked": Array.isArray(_vm.computedValue) ? _vm._i(_vm.computedValue, _vm.nativeValue) > -1 : _vm._q(_vm.computedValue, _vm.trueValue)
    },
    on: {
      "change": function($event) {
        var $$a = _vm.computedValue,
          $$el = $event.target,
          $$c = $$el.checked ? (_vm.trueValue) : (_vm.falseValue);
        if (Array.isArray($$a)) {
          var $$v = _vm.nativeValue,
            $$i = _vm._i($$a, $$v);
          if ($$el.checked) {
            $$i < 0 && (_vm.computedValue = $$a.concat([$$v]))
          } else {
            $$i > -1 && (_vm.computedValue = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
          }
        } else {
          _vm.computedValue = $$c
        }
      }
    }
  }), _vm._v(" "), _c('span', {
    staticClass: "check",
    class: _vm.type
  }), _vm._v(" "), _c('span', {
    staticClass: "control-label"
  }, [_vm._t("default")], 2)])
},staticRenderFns: []}

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(111),
  /* template */
  __webpack_require__(112),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 111 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BCheckboxButton',
    props: {
        value: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        nativeValue: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        disabled: Boolean,
        name: String,
        size: String,
        type: {
            type: String,
            default: 'is-primary'
        }
    },
    data: function data() {
        return {
            newValue: this.value
        };
    },

    computed: {
        computedValue: {
            get: function get() {
                return this.newValue;
            },
            set: function set(value) {
                this.newValue = value;
                this.$emit('input', value);
            }
        },
        checked: function checked() {
            if (Array.isArray(this.newValue)) {
                return this.newValue.indexOf(this.nativeValue) >= 0;
            }
            return this.newValue === this.nativeValue;
        }
    },
    watch: {
        /**
         * When v-model change, set internal value.
         */
        value: function value(_value) {
            this.newValue = _value;
        }
    }
});

/***/ }),
/* 112 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "control"
  }, [_c('label', {
    ref: "label",
    staticClass: "b-checkbox checkbox button",
    class: [_vm.checked ? _vm.type : null, _vm.size, {
      'is-disabled': _vm.disabled
    }],
    attrs: {
      "disabled": _vm.disabled,
      "tabindex": _vm.disabled ? false : 0
    },
    on: {
      "keydown": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key) && _vm._k($event.keyCode, "space", 32, $event.key)) { return null; }
        $event.preventDefault();
        _vm.$refs.label.click()
      }
    }
  }, [_vm._t("default"), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.computedValue),
      expression: "computedValue"
    }],
    attrs: {
      "type": "checkbox",
      "disabled": _vm.disabled,
      "name": _vm.name
    },
    domProps: {
      "value": _vm.nativeValue,
      "checked": Array.isArray(_vm.computedValue) ? _vm._i(_vm.computedValue, _vm.nativeValue) > -1 : (_vm.computedValue)
    },
    on: {
      "change": function($event) {
        var $$a = _vm.computedValue,
          $$el = $event.target,
          $$c = $$el.checked ? (true) : (false);
        if (Array.isArray($$a)) {
          var $$v = _vm.nativeValue,
            $$i = _vm._i($$a, $$v);
          if ($$el.checked) {
            $$i < 0 && (_vm.computedValue = $$a.concat([$$v]))
          } else {
            $$i > -1 && (_vm.computedValue = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
          }
        } else {
          _vm.computedValue = $$c
        }
      }
    }
  })], 2)])
},staticRenderFns: []}

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(114),
  /* template */
  __webpack_require__(115),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 114 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BCollapse',
    props: {
        open: {
            type: Boolean,
            default: true
        },
        animation: {
            type: String,
            default: 'fade'
        }
    },
    data: function data() {
        return {
            isOpen: this.open
        };
    },

    watch: {
        open: function open(value) {
            this.isOpen = value;
        }
    },
    methods: {
        /**
         * Toggle and emit events
         */
        toggle: function toggle() {
            this.isOpen = !this.isOpen;
            this.$emit('update:open', this.isOpen);
            this.$emit(this.isOpen ? 'open' : 'close');
        }
    }
});

/***/ }),
/* 115 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "collapse"
  }, [_c('div', {
    staticClass: "collapse-trigger",
    on: {
      "click": _vm.toggle
    }
  }, [_vm._t("trigger", null, {
    open: _vm.isOpen
  })], 2), _vm._v(" "), _c('transition', {
    attrs: {
      "name": _vm.animation
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.isOpen),
      expression: "isOpen"
    }],
    staticClass: "collapse-content"
  }, [_vm._t("default")], 2)])], 1)
},staticRenderFns: []}

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(117),
  /* template */
  __webpack_require__(134),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 117 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_FormElementMixin__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_helpers__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_config__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__input_Input__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__input_Input___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__input_Input__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__field_Field__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__field_Field___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__field_Field__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__select_Select__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__select_Select___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__select_Select__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__icon_Icon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__icon_Icon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__icon_Icon__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__DatepickerTable__ = __webpack_require__(128);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__DatepickerTable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__DatepickerTable__);


var _components;

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//













/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BDatepicker',
    components: (_components = {}, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_10__DatepickerTable___default.a.name, __WEBPACK_IMPORTED_MODULE_10__DatepickerTable___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_6__input_Input___default.a.name, __WEBPACK_IMPORTED_MODULE_6__input_Input___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_7__field_Field___default.a.name, __WEBPACK_IMPORTED_MODULE_7__field_Field___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_8__select_Select___default.a.name, __WEBPACK_IMPORTED_MODULE_8__select_Select___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_9__icon_Icon___default.a.name, __WEBPACK_IMPORTED_MODULE_9__icon_Icon___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown___default.a.name, __WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem___default.a.name, __WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem___default.a), _components),
    mixins: [__WEBPACK_IMPORTED_MODULE_1__utils_FormElementMixin__["a" /* default */]],
    inheritAttrs: false,
    props: {
        value: Date,
        dayNames: {
            type: Array,
            default: function _default() {
                if (Array.isArray(__WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDayNames)) {
                    return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDayNames;
                } else {
                    return ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'S'];
                }
            }
        },
        monthNames: {
            type: Array,
            default: function _default() {
                if (Array.isArray(__WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultMonthNames)) {
                    return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultMonthNames;
                } else {
                    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                }
            }
        },
        firstDayOfWeek: {
            type: Number,
            default: function _default() {
                if (typeof __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultFirstDayOfWeek === 'number') {
                    return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultFirstDayOfWeek;
                } else {
                    return 0;
                }
            }
        },
        inline: Boolean,
        minDate: Date,
        maxDate: Date,
        focusedDate: Date,
        placeholder: String,
        editable: Boolean,
        disabled: Boolean,
        unselectableDates: Array,
        unselectableDaysOfWeek: {
            type: Array,
            default: function _default() {
                return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultUnselectableDaysOfWeek;
            }
        },
        selectableDates: Array,
        dateFormatter: {
            type: Function,
            default: function _default(date) {
                if (typeof __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDateFormatter === 'function') {
                    return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDateFormatter(date);
                } else {
                    var yyyyMMdd = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
                    var d = new Date(yyyyMMdd);
                    return d.toLocaleDateString();
                }
            }
        },
        dateParser: {
            type: Function,
            default: function _default(date) {
                if (typeof __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDateParser === 'function') {
                    return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDateParser(date);
                } else {
                    return new Date(Date.parse(date));
                }
            }
        },
        dateCreator: {
            type: Function,
            default: function _default() {
                if (typeof __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDateCreator === 'function') {
                    return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDateCreator();
                } else {
                    return new Date();
                }
            }
        },
        mobileNative: {
            type: Boolean,
            default: function _default() {
                return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDatepickerMobileNative;
            }
        },
        position: String,
        events: Array,
        indicators: {
            type: String,
            default: 'dots'
        }
    },
    data: function data() {
        var focusedDate = this.value || this.focusedDate || this.dateCreator();

        return {
            dateSelected: this.value,
            focusedDateData: {
                month: focusedDate.getMonth(),
                year: focusedDate.getFullYear()
            },
            _elementRef: 'input',
            _isDatepicker: true
        };
    },

    computed: {
        /*
        * Returns an array of years for the year dropdown. If earliest/latest
        * dates are set by props, range of years will fall within those dates.
        */
        listOfYears: function listOfYears() {
            var latestYear = this.maxDate ? this.maxDate.getFullYear() : Math.max(this.dateCreator().getFullYear(), this.focusedDateData.year) + 3;

            var earliestYear = this.minDate ? this.minDate.getFullYear() : 1900;

            var arrayOfYears = [];
            for (var i = earliestYear; i <= latestYear; i++) {
                arrayOfYears.push(i);
            }

            return arrayOfYears.reverse();
        },
        isFirstMonth: function isFirstMonth() {
            if (!this.minDate) return false;
            var dateToCheck = new Date(this.focusedDateData.year, this.focusedDateData.month);
            var date = new Date(this.minDate.getFullYear(), this.minDate.getMonth());
            return dateToCheck <= date;
        },
        isLastMonth: function isLastMonth() {
            if (!this.maxDate) return false;
            var dateToCheck = new Date(this.focusedDateData.year, this.focusedDateData.month);
            var date = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth());
            return dateToCheck >= date;
        },
        isMobile: function isMobile() {
            return this.mobileNative && __WEBPACK_IMPORTED_MODULE_2__utils_helpers__["d" /* isMobile */].any();
        }
    },
    watch: {
        /*
        * Emit input event with selected date as payload, set isActive to false.
        * Update internal focusedDateData
        */
        dateSelected: function dateSelected(value) {
            var currentDate = !value ? this.dateCreator() : value;
            this.focusedDateData = {
                month: currentDate.getMonth(),
                year: currentDate.getFullYear()
            };
            this.$emit('input', value);
            if (this.$refs.dropdown) {
                this.$refs.dropdown.isActive = false;
            }
        },


        /**
         * When v-model is changed:
         *   1. Update internal value.
         *   2. If it's invalid, validate again.
         */
        value: function value(_value) {
            this.dateSelected = _value;

            !this.isValid && this.$refs.input.checkHtml5Validity();
        },
        focusedDate: function focusedDate(value) {
            if (value) {
                this.focusedDateData = {
                    month: value.getMonth(),
                    year: value.getFullYear()
                };
            }
        },


        /*
        * Emit input event on month and/or year change
        */
        'focusedDateData.month': function focusedDateDataMonth(value) {
            this.$emit('change-month', value);
        },
        'focusedDateData.year': function focusedDateDataYear(value) {
            this.$emit('change-year', value);
        }
    },
    methods: {
        /*
        * Emit input event with selected date as payload for v-model in parent
        */
        updateSelectedDate: function updateSelectedDate(date) {
            this.dateSelected = date;
        },


        /*
        * Parse string into date
        */
        onChange: function onChange(value) {
            var date = this.dateParser(value);
            if (date && !isNaN(date)) {
                this.dateSelected = date;
            } else {
                // Force refresh input value when not valid date
                this.dateSelected = null;
                this.$refs.input.newValue = this.dateSelected;
            }
        },


        /*
        * Format date into string
        */
        formatValue: function formatValue(value) {
            if (value && !isNaN(value)) {
                return this.dateFormatter(value);
            } else {
                return null;
            }
        },


        /*
        * Either decrement month by 1 if not January or decrement year by 1
        * and set month to 11 (December)
        */
        decrementMonth: function decrementMonth() {
            if (this.disabled) return;

            if (this.focusedDateData.month > 0) {
                this.focusedDateData.month -= 1;
            } else {
                this.focusedDateData.month = 11;
                this.focusedDateData.year -= 1;
            }
        },


        /*
        * Either increment month by 1 if not December or increment year by 1
        * and set month to 0 (January)
        */
        incrementMonth: function incrementMonth() {
            if (this.disabled) return;

            if (this.focusedDateData.month < 11) {
                this.focusedDateData.month += 1;
            } else {
                this.focusedDateData.month = 0;
                this.focusedDateData.year += 1;
            }
        },


        /*
        * Format date into string 'YYYY-MM-DD'
        */
        formatYYYYMMDD: function formatYYYYMMDD(value) {
            var date = new Date(value);
            if (value && !isNaN(date)) {
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                return year + '-' + ((month < 10 ? '0' : '') + month) + '-' + ((day < 10 ? '0' : '') + day);
            }
            return '';
        },


        /*
        * Parse date from string
        */
        onChangeNativePicker: function onChangeNativePicker(event) {
            var date = event.target.value;
            this.dateSelected = date ? new Date(date.replace(/-/g, '/')) : null;
        }
    }
});

/***/ }),
/* 118 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_get_iterator__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_get_iterator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_get_iterator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_symbol__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_symbol__);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BDropdown',
    props: {
        value: {
            type: [String, Number, Boolean, Object, Array, __WEBPACK_IMPORTED_MODULE_1_babel_runtime_core_js_symbol___default.a, Function],
            default: null
        },
        disabled: Boolean,
        hoverable: Boolean,
        inline: Boolean,
        position: {
            type: String,
            validator: function validator(value) {
                return ['is-top-right', 'is-top-left', 'is-bottom-left'].indexOf(value) > -1;
            }
        },
        mobileModal: {
            type: Boolean,
            default: true
        }
    },
    data: function data() {
        return {
            selected: this.value,
            isActive: false,
            _isDropdown: true // Used internally by DropdownItem
        };
    },

    computed: {
        rootClasses: function rootClasses() {
            return [this.position, {
                'is-disabled': this.disabled,
                'is-hoverable': this.hoverable,
                'is-inline': this.inline,
                'is-active': this.isActive || this.inline,
                'is-mobile-modal': this.isMobileModal
            }];
        },
        isMobileModal: function isMobileModal() {
            return this.mobileModal && !this.inline && !this.hoverable;
        }
    },
    watch: {
        /**
         * When v-model is changed set the new selected item.
         */
        value: function value(_value) {
            this.selected = _value;
        },


        /**
         * Emit event when isActive value is changed.
         */
        isActive: function isActive(value) {
            this.$emit('active-change', value);
        }
    },
    methods: {
        /**
         * Click listener from DropdownItem.
         *   1. Set new selected item.
         *   2. Emit input event to update the user v-model.
         *   3. Close the dropdown.
         */
        selectItem: function selectItem(value) {
            if (this.selected !== value) {
                this.$emit('change', value);
                this.selected = value;
            }
            this.$emit('input', value);
            this.isActive = false;
        },


        /**
         * White-listed items to not close when clicked.
         */
        isInWhiteList: function isInWhiteList(el) {
            if (el === this.$refs.dropdownMenu) return true;
            if (el === this.$refs.trigger) return true;
            // All chidren from dropdown
            if (this.$refs.dropdownMenu !== undefined) {
                var children = this.$refs.dropdownMenu.querySelectorAll('*');
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_get_iterator___default()(children), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var child = _step.value;

                        if (el === child) {
                            return true;
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            // All children from trigger
            if (this.$refs.trigger !== undefined) {
                var _children = this.$refs.trigger.querySelectorAll('*');
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_get_iterator___default()(_children), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var _child = _step2.value;

                        if (el === _child) {
                            return true;
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }

            return false;
        },


        /**
         * Close dropdown if clicked outside.
         */
        clickedOutside: function clickedOutside(event) {
            if (this.inline) return;

            if (!this.isInWhiteList(event.target)) this.isActive = false;
        },


        /**
         * Toggle dropdown if it's not disabled.
         */
        toggle: function toggle() {
            var _this = this;

            if (this.disabled || this.hoverable) return;

            if (!this.isActive) {
                // if not active, toggle after clickOutside event
                // this fixes toggling programmatic
                this.$nextTick(function () {
                    _this.isActive = !_this.isActive;
                });
            } else {
                this.isActive = !this.isActive;
            }
        }
    },
    created: function created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('click', this.clickedOutside);
        }
    },
    beforeDestroy: function beforeDestroy() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('click', this.clickedOutside);
        }
    }
});

/***/ }),
/* 119 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "dropdown",
    class: _vm.rootClasses
  }, [(!_vm.inline) ? _c('div', {
    ref: "trigger",
    staticClass: "dropdown-trigger",
    attrs: {
      "role": "button"
    },
    on: {
      "click": _vm.toggle
    }
  }, [_vm._t("trigger")], 2) : _vm._e(), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [(_vm.isMobileModal) ? _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.isActive),
      expression: "isActive"
    }],
    staticClass: "background"
  }) : _vm._e()]), _vm._v(" "), _c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: ((!_vm.disabled && (_vm.isActive || _vm.hoverable)) || _vm.inline),
      expression: "(!disabled && (isActive || hoverable)) || inline"
    }],
    ref: "dropdownMenu",
    staticClass: "dropdown-menu"
  }, [_c('div', {
    staticClass: "dropdown-content"
  }, [_vm._t("default")], 2)])])], 1)
},staticRenderFns: []}

/***/ }),
/* 120 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BDropdownItem',
    props: {
        value: {
            type: [String, Number, Boolean, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a, Function],
            default: null
        },
        separator: Boolean,
        disabled: Boolean,
        custom: Boolean,
        paddingless: Boolean,
        hasLink: Boolean
    },
    computed: {
        anchorClasses: function anchorClasses() {
            return {
                'is-disabled': this.$parent.disabled || this.disabled,
                'is-paddingless': this.paddingless,
                'is-active': this.value !== null && this.value === this.$parent.selected
            };
        },
        itemClasses: function itemClasses() {
            return {
                'dropdown-item': !this.hasLink,
                'is-disabled': this.disabled,
                'is-paddingless': this.paddingless,
                'is-active': this.value !== null && this.value === this.$parent.selected,
                'has-link': this.hasLink
            };
        },

        /**
         * Check if item can be clickable.
         */
        isClickable: function isClickable() {
            return !this.$parent.disabled && !this.separator && !this.disabled && !this.custom;
        }
    },
    methods: {
        /**
         * Click listener, select the item.
         */
        selectItem: function selectItem() {
            if (!this.isClickable) return;

            this.$parent.selectItem(this.value);
            this.$emit('click');
        }
    },
    created: function created() {
        if (!this.$parent.$data._isDropdown) {
            this.$destroy();
            throw new Error('You should wrap bDropdownItem on a bDropdown');
        }
    }
});

/***/ }),
/* 121 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return (_vm.separator) ? _c('hr', {
    staticClass: "dropdown-divider"
  }) : (!_vm.custom && !_vm.hasLink) ? _c('a', {
    staticClass: "dropdown-item",
    class: _vm.anchorClasses,
    on: {
      "click": _vm.selectItem
    }
  }, [_vm._t("default")], 2) : _c('div', {
    class: _vm.itemClasses,
    on: {
      "click": _vm.selectItem
    }
  }, [_vm._t("default")], 2)
},staticRenderFns: []}

/***/ }),
/* 122 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__FieldBody__ = __webpack_require__(123);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__FieldBody___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__FieldBody__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BField',
    components: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()({}, __WEBPACK_IMPORTED_MODULE_1__FieldBody___default.a.name, __WEBPACK_IMPORTED_MODULE_1__FieldBody___default.a),
    props: {
        type: [String, Object],
        label: String,
        labelFor: String,
        message: [String, Array, Object],
        grouped: Boolean,
        groupMultiline: Boolean,
        position: String,
        expanded: Boolean,
        horizontal: Boolean,
        addons: {
            type: Boolean,
            default: true
        },
        customClass: String
    },
    data: function data() {
        return {
            newType: this.type,
            newMessage: this.message,
            fieldLabelSize: null,
            _isField: true // Used internally by Input and Select
        };
    },

    computed: {
        rootClasses: function rootClasses() {
            return [this.newPosition, {
                'is-expanded': this.expanded,
                'is-grouped-multiline': this.groupMultiline,
                'is-horizontal': this.horizontal
            }];
        },

        /**
         * Correct Bulma class for the side of the addon or group.
         *
         * This is not kept like the others (is-small, etc.),
         * because since 'has-addons' is set automatically it
         * doesn't make sense to teach users what addons are exactly.
         */
        newPosition: function newPosition() {
            if (this.position === undefined) return;

            var position = this.position.split('-');
            if (position.length < 1) return;

            var prefix = this.grouped ? 'is-grouped-' : 'has-addons-';

            if (this.position) return prefix + position[1];
        },

        /**
         * Formatted message in case it's an array
         * (each element is separated by <br> tag)
         */
        formattedMessage: function formattedMessage() {
            if (typeof this.newMessage === 'string') {
                return this.newMessage;
            } else {
                var messages = [];
                if (Array.isArray(this.newMessage)) {
                    this.newMessage.forEach(function (message) {
                        if (typeof message === 'string') {
                            messages.push(message);
                        } else {
                            for (var key in message) {
                                if (message[key]) {
                                    messages.push(key);
                                }
                            }
                        }
                    });
                } else {
                    for (var key in this.newMessage) {
                        if (this.newMessage[key]) {
                            messages.push(key);
                        }
                    }
                }
                return messages.filter(function (m) {
                    if (m) return m;
                }).join(' <br> ');
            }
        }
    },
    watch: {
        /**
         * Set internal type when prop change.
         */
        type: function type(value) {
            this.newType = value;
        },


        /**
         * Set internal message when prop change.
         */
        message: function message(value) {
            this.newMessage = value;
        }
    },
    methods: {
        /**
         * Field has addons if there are more than one slot
         * (element / component) in the Field.
         * Or is grouped when prop is set.
         * Is a method to be called when component re-render.
         */
        fieldType: function fieldType() {
            if (this.grouped) return 'is-grouped';

            var renderedNode = 0;
            if (this.$slots.default) {
                renderedNode = this.$slots.default.reduce(function (i, node) {
                    return node.tag ? i + 1 : i;
                }, 0);
            }
            if (renderedNode > 1 && this.addons && !this.horizontal) {
                return 'has-addons';
            }
        }
    },
    mounted: function mounted() {
        if (this.horizontal) {
            // Bulma docs: .is-normal for any .input or .button
            var elements = this.$el.querySelectorAll('.input, .select, .button, .textarea');
            if (elements.length > 0) {
                this.fieldLabelSize = 'is-normal';
            }
        }
    }
});

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(124),
  /* template */
  null,
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 124 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BFieldBody',
    props: {
        message: {
            type: String
        },
        type: {
            type: String
        }
    },
    render: function render(createElement) {
        var _this = this;

        return createElement('div', { attrs: { 'class': 'field-body' } }, this.$slots.default.map(function (element) {
            // skip returns and comments
            if (!element.tag) {
                return element;
            }
            if (_this.message) {
                return createElement('b-field', { attrs: { message: _this.message, 'type': _this.type } }, [element]);
            }
            return createElement('b-field', { attrs: { 'type': _this.type } }, [element]);
        }));
    }
});

/***/ }),
/* 125 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field",
    class: [_vm.rootClasses, _vm.fieldType()]
  }, [(_vm.horizontal) ? _c('div', {
    staticClass: "field-label",
    class: [_vm.customClass, _vm.fieldLabelSize]
  }, [(_vm.label) ? _c('label', {
    staticClass: "label",
    attrs: {
      "for": _vm.labelFor
    }
  }, [_vm._v("\n            " + _vm._s(_vm.label) + "\n        ")]) : _vm._e()]) : [(_vm.label) ? _c('label', {
    staticClass: "label",
    class: _vm.customClass,
    attrs: {
      "for": _vm.labelFor
    }
  }, [_vm._v("\n            " + _vm._s(_vm.label) + "\n        ")]) : _vm._e()], _vm._v(" "), (_vm.horizontal) ? _c('b-field-body', {
    attrs: {
      "message": _vm.newMessage ? _vm.formattedMessage : '',
      "type": _vm.newType
    }
  }, [_vm._t("default")], 2) : [_vm._t("default")], _vm._v(" "), (_vm.newMessage && !_vm.horizontal) ? _c('p', {
    staticClass: "help",
    class: _vm.newType,
    domProps: {
      "innerHTML": _vm._s(_vm.formattedMessage)
    }
  }) : _vm._e()], 2)
},staticRenderFns: []}

/***/ }),
/* 126 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__icon_Icon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__icon_Icon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__icon_Icon__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_FormElementMixin__ = __webpack_require__(12);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BSelect',
    components: __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default()({}, __WEBPACK_IMPORTED_MODULE_2__icon_Icon___default.a.name, __WEBPACK_IMPORTED_MODULE_2__icon_Icon___default.a),
    mixins: [__WEBPACK_IMPORTED_MODULE_3__utils_FormElementMixin__["a" /* default */]],
    inheritAttrs: false,
    props: {
        value: {
            type: [String, Number, Boolean, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a, Function],
            default: null
        },
        placeholder: String,
        multiple: Boolean,
        nativeSize: [String, Number]
    },
    data: function data() {
        return {
            selected: this.value,
            _elementRef: 'select'
        };
    },

    computed: {
        computedValue: {
            get: function get() {
                return this.selected;
            },
            set: function set(value) {
                this.selected = value;
                this.$emit('input', value);
                !this.isValid && this.checkHtml5Validity();
            }
        },
        spanClasses: function spanClasses() {
            return [this.size, this.statusType, {
                'is-fullwidth': this.expanded,
                'is-loading': this.loading,
                'is-multiple': this.multiple,
                'is-rounded': this.rounded,
                'is-empty': this.selected === null
            }];
        }
    },
    watch: {
        /**
         * When v-model is changed:
         *   1. Set the selected option.
         *   2. If it's invalid, validate again.
         */
        value: function value(_value) {
            this.selected = _value;
            !this.isValid && this.checkHtml5Validity();
        }
    }
});

/***/ }),
/* 127 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "control",
    class: {
      'is-expanded': _vm.expanded, 'has-icons-left': _vm.icon
    }
  }, [_c('span', {
    staticClass: "select",
    class: _vm.spanClasses
  }, [_c('select', _vm._b({
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.computedValue),
      expression: "computedValue"
    }],
    ref: "select",
    attrs: {
      "multiple": _vm.multiple,
      "size": _vm.nativeSize
    },
    on: {
      "blur": function($event) {
        _vm.$emit('blur', $event) && _vm.checkHtml5Validity()
      },
      "focus": function($event) {
        _vm.$emit('focus', $event)
      },
      "change": function($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function(o) {
          return o.selected
        }).map(function(o) {
          var val = "_value" in o ? o._value : o.value;
          return val
        });
        _vm.computedValue = $event.target.multiple ? $$selectedVal : $$selectedVal[0]
      }
    }
  }, 'select', _vm.$attrs, false), [(_vm.placeholder) ? [(_vm.computedValue == null) ? _c('option', {
    attrs: {
      "selected": "",
      "disabled": "",
      "hidden": ""
    },
    domProps: {
      "value": null
    }
  }, [_vm._v("\n                    " + _vm._s(_vm.placeholder) + "\n                ")]) : _vm._e()] : _vm._e(), _vm._v(" "), _vm._t("default")], 2)]), _vm._v(" "), (_vm.icon) ? _c('b-icon', {
    staticClass: "is-left",
    attrs: {
      "icon": _vm.icon,
      "pack": _vm.iconPack,
      "size": _vm.iconSize
    }
  }) : _vm._e()], 1)
},staticRenderFns: []}

/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(129),
  /* template */
  __webpack_require__(133),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 129 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__DatepickerTableRow__ = __webpack_require__(130);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__DatepickerTableRow___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__DatepickerTableRow__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BDatepickerTable',
    components: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()({}, __WEBPACK_IMPORTED_MODULE_1__DatepickerTableRow___default.a.name, __WEBPACK_IMPORTED_MODULE_1__DatepickerTableRow___default.a),
    props: {
        value: Date,
        dayNames: Array,
        monthNames: Array,
        firstDayOfWeek: Number,
        events: Array,
        indicators: String,
        minDate: Date,
        maxDate: Date,
        focused: Object,
        disabled: Boolean,
        dateCreator: Function,
        unselectableDates: Array,
        unselectableDaysOfWeek: Array,
        selectableDates: Array
    },
    computed: {
        visibleDayNames: function visibleDayNames() {
            var visibleDayNames = [];
            var index = this.firstDayOfWeek;
            while (visibleDayNames.length < this.dayNames.length) {
                var currentDayName = this.dayNames[index % this.dayNames.length];
                visibleDayNames.push(currentDayName);
                index++;
            }
            return visibleDayNames;
        },
        hasEvents: function hasEvents() {
            return this.events && this.events.length;
        },


        /*
        * Return array of all events in the specified month
        */
        eventsInThisMonth: function eventsInThisMonth() {
            if (!this.events) return [];

            var monthEvents = [];

            for (var i = 0; i < this.events.length; i++) {
                var event = this.events[i];

                if (!event.hasOwnProperty('date')) {
                    event = { date: event };
                }
                if (!event.hasOwnProperty('type')) {
                    event.type = 'is-primary';
                }
                if (event.date.getMonth() === this.focused.month && event.date.getFullYear() === this.focused.year) {
                    monthEvents.push(event);
                }
            }

            return monthEvents;
        }
    },
    methods: {
        /*
        * Emit input event with selected date as payload for v-model in parent
        */
        updateSelectedDate: function updateSelectedDate(date) {
            this.$emit('input', date);
        },


        /*
        * Return array of all days in the week that the startingDate is within
        */
        weekBuilder: function weekBuilder(startingDate, month, year) {
            var thisMonth = new Date(year, month);

            var thisWeek = [];

            var dayOfWeek = new Date(year, month, startingDate).getDay();

            var end = dayOfWeek >= this.firstDayOfWeek ? dayOfWeek - this.firstDayOfWeek : 7 - this.firstDayOfWeek + dayOfWeek;

            var daysAgo = 1;
            for (var i = 0; i < end; i++) {
                thisWeek.unshift(new Date(thisMonth.getFullYear(), thisMonth.getMonth(), startingDate - daysAgo));
                daysAgo++;
            }

            thisWeek.push(new Date(year, month, startingDate));

            var daysForward = 1;
            while (thisWeek.length < 7) {
                thisWeek.push(new Date(year, month, startingDate + daysForward));
                daysForward++;
            }

            return thisWeek;
        },


        /*
        * Return array of all weeks in the specified month
        */
        weeksInThisMonth: function weeksInThisMonth(month, year) {
            var weeksInThisMonth = [];
            var daysInThisMonth = new Date(year, month + 1, 0).getDate();

            var startingDay = 1;

            while (startingDay <= daysInThisMonth + 6) {
                var newWeek = this.weekBuilder(startingDay, month, year);
                var weekValid = false;

                newWeek.forEach(function (day) {
                    if (day.getMonth() === month) {
                        weekValid = true;
                    }
                });

                if (weekValid) {
                    weeksInThisMonth.push(newWeek);
                }

                startingDay += 7;
            }

            return weeksInThisMonth;
        },
        eventsInThisWeek: function eventsInThisWeek(week, index) {
            if (!this.eventsInThisMonth.length) return [];

            var weekEvents = [];

            var weeksInThisMonth = [];
            weeksInThisMonth = this.weeksInThisMonth(this.focused.month, this.focused.year);

            for (var d = 0; d < weeksInThisMonth[index].length; d++) {
                for (var e = 0; e < this.eventsInThisMonth.length; e++) {
                    var eventsInThisMonth = this.eventsInThisMonth[e].date.getTime();
                    if (eventsInThisMonth === weeksInThisMonth[index][d].getTime()) {
                        weekEvents.push(this.eventsInThisMonth[e]);
                    }
                }
            }

            return weekEvents;
        }
    }
});

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(131),
  /* template */
  __webpack_require__(132),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 131 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BDatepickerTableRow',
    props: {
        selectedDate: Date,
        week: {
            type: Array,
            required: true
        },
        month: {
            type: Number,
            required: true
        },
        minDate: Date,
        maxDate: Date,
        disabled: Boolean,
        unselectableDates: Array,
        unselectableDaysOfWeek: Array,
        selectableDates: Array,
        events: Array,
        indicators: String,
        dateCreator: Function
    },
    methods: {
        /*
        * Check that selected day is within earliest/latest params and
        * is within this month
        */
        selectableDate: function selectableDate(day) {
            var validity = [];

            if (this.minDate) {
                validity.push(day >= this.minDate);
            }

            if (this.maxDate) {
                validity.push(day <= this.maxDate);
            }

            validity.push(day.getMonth() === this.month);

            if (this.selectableDates) {
                for (var i = 0; i < this.selectableDates.length; i++) {
                    var enabledDate = this.selectableDates[i];
                    if (day.getDate() === enabledDate.getDate() && day.getFullYear() === enabledDate.getFullYear() && day.getMonth() === enabledDate.getMonth()) {
                        return true;
                    } else {
                        validity.push(false);
                    }
                }
            }

            if (this.unselectableDates) {
                for (var _i = 0; _i < this.unselectableDates.length; _i++) {
                    var disabledDate = this.unselectableDates[_i];
                    validity.push(day.getDate() !== disabledDate.getDate() || day.getFullYear() !== disabledDate.getFullYear() || day.getMonth() !== disabledDate.getMonth());
                }
            }

            if (this.unselectableDaysOfWeek) {
                for (var _i2 = 0; _i2 < this.unselectableDaysOfWeek.length; _i2++) {
                    var dayOfWeek = this.unselectableDaysOfWeek[_i2];
                    validity.push(day.getDay() !== dayOfWeek);
                }
            }

            return validity.indexOf(false) < 0;
        },


        /*
        * Emit select event with chosen date as payload
        */
        emitChosenDate: function emitChosenDate(day) {
            if (this.disabled) return;

            if (this.selectableDate(day)) {
                this.$emit('select', day);
            }
        },
        eventsDateMatch: function eventsDateMatch(day) {
            if (!this.events.length) return false;

            var dayEvents = [];

            for (var i = 0; i < this.events.length; i++) {
                if (this.events[i].date.getDay() === day.getDay()) {
                    dayEvents.push(this.events[i]);
                }
            }

            if (!dayEvents.length) {
                return false;
            }

            return dayEvents;
        },


        /*
        * Build classObject for cell using validations
        */
        classObject: function classObject(day) {
            function dateMatch(dateOne, dateTwo) {
                // if either date is null or undefined, return false
                if (!dateOne || !dateTwo) {
                    return false;
                }

                return dateOne.getDate() === dateTwo.getDate() && dateOne.getFullYear() === dateTwo.getFullYear() && dateOne.getMonth() === dateTwo.getMonth();
            }

            return {
                'is-selected': dateMatch(day, this.selectedDate),
                'is-today': dateMatch(day, this.dateCreator()),
                'is-selectable': this.selectableDate(day) && !this.disabled,
                'is-unselectable': !this.selectableDate(day) || this.disabled
            };
        }
    }
});

/***/ }),
/* 132 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "datepicker-row"
  }, [_vm._l((_vm.week), function(day, index) {
    return [(_vm.selectableDate(day) && !_vm.disabled) ? _c('a', {
      key: index,
      staticClass: "datepicker-cell",
      class: [_vm.classObject(day), {
        'has-event': _vm.eventsDateMatch(day)
      }, _vm.indicators],
      attrs: {
        "role": "button",
        "href": "#",
        "disabled": _vm.disabled
      },
      on: {
        "click": function($event) {
          $event.preventDefault();
          _vm.emitChosenDate(day)
        },
        "keydown": [function($event) {
          if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key)) { return null; }
          $event.preventDefault();
          _vm.emitChosenDate(day)
        }, function($event) {
          if (!('button' in $event) && _vm._k($event.keyCode, "space", 32, $event.key)) { return null; }
          $event.preventDefault();
          _vm.emitChosenDate(day)
        }]
      }
    }, [_vm._v("\n            " + _vm._s(day.getDate()) + "\n\n            "), (_vm.eventsDateMatch(day)) ? _c('div', {
      staticClass: "events"
    }, _vm._l((_vm.eventsDateMatch(day)), function(event, index) {
      return _c('div', {
        key: index,
        staticClass: "event",
        class: event.type
      })
    })) : _vm._e()]) : _c('div', {
      key: index,
      staticClass: "datepicker-cell",
      class: _vm.classObject(day)
    }, [_vm._v("\n            " + _vm._s(day.getDate()) + "\n        ")])]
  })], 2)
},staticRenderFns: []}

/***/ }),
/* 133 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('section', {
    staticClass: "datepicker-table"
  }, [_c('header', {
    staticClass: "datepicker-header"
  }, _vm._l((_vm.visibleDayNames), function(day, index) {
    return _c('div', {
      key: index,
      staticClass: "datepicker-cell"
    }, [_vm._v("\n            " + _vm._s(day) + "\n        ")])
  })), _vm._v(" "), _c('div', {
    staticClass: "datepicker-body",
    class: {
      'has-events': _vm.hasEvents
    }
  }, _vm._l((_vm.weeksInThisMonth(_vm.focused.month, _vm.focused.year)), function(week, index) {
    return _c('b-datepicker-table-row', {
      key: index,
      attrs: {
        "selected-date": _vm.value,
        "week": week,
        "month": _vm.focused.month,
        "min-date": _vm.minDate,
        "max-date": _vm.maxDate,
        "disabled": _vm.disabled,
        "unselectable-dates": _vm.unselectableDates,
        "unselectable-days-of-week": _vm.unselectableDaysOfWeek,
        "selectable-dates": _vm.selectableDates,
        "events": _vm.eventsInThisWeek(week, index),
        "indicators": _vm.indicators,
        "date-creator": _vm.dateCreator
      },
      on: {
        "select": _vm.updateSelectedDate
      }
    })
  }))])
},staticRenderFns: []}

/***/ }),
/* 134 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "datepicker control",
    class: [_vm.size, {
      'is-expanded': _vm.expanded
    }]
  }, [(!_vm.isMobile || _vm.inline) ? _c('b-dropdown', {
    ref: "dropdown",
    attrs: {
      "position": _vm.position,
      "disabled": _vm.disabled,
      "inline": _vm.inline
    }
  }, [(!_vm.inline) ? _c('b-input', _vm._b({
    ref: "input",
    attrs: {
      "slot": "trigger",
      "autocomplete": "off",
      "value": _vm.formatValue(_vm.dateSelected),
      "placeholder": _vm.placeholder,
      "size": _vm.size,
      "icon": _vm.icon,
      "icon-pack": _vm.iconPack,
      "rounded": _vm.rounded,
      "loading": _vm.loading,
      "disabled": _vm.disabled,
      "readonly": !_vm.editable
    },
    on: {
      "focus": function($event) {
        _vm.$emit('focus', $event)
      },
      "blur": function($event) {
        _vm.$emit('blur', $event) && _vm.checkHtml5Validity()
      }
    },
    nativeOn: {
      "change": function($event) {
        _vm.onChange($event.target.value)
      }
    },
    slot: "trigger"
  }, 'b-input', _vm.$attrs, false)) : _vm._e(), _vm._v(" "), _c('b-dropdown-item', {
    attrs: {
      "disabled": _vm.disabled,
      "custom": ""
    }
  }, [_c('header', {
    staticClass: "datepicker-header"
  }, [(_vm.$slots.header !== undefined && _vm.$slots.header.length) ? [_vm._t("header")] : _c('div', {
    staticClass: "pagination field is-centered",
    class: _vm.size
  }, [(!_vm.isFirstMonth && !_vm.disabled) ? _c('a', {
    staticClass: "pagination-previous",
    attrs: {
      "role": "button",
      "href": "#",
      "disabled": _vm.disabled
    },
    on: {
      "click": function($event) {
        $event.preventDefault();
        _vm.decrementMonth($event)
      },
      "keydown": [function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key)) { return null; }
        $event.preventDefault();
        _vm.decrementMonth($event)
      }, function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "space", 32, $event.key)) { return null; }
        $event.preventDefault();
        _vm.decrementMonth($event)
      }]
    }
  }, [_c('b-icon', {
    attrs: {
      "icon": "chevron-left",
      "pack": _vm.iconPack,
      "both": "",
      "type": "is-primary is-clickable"
    }
  })], 1) : _vm._e(), _vm._v(" "), _c('a', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (!_vm.isLastMonth && !_vm.disabled),
      expression: "!isLastMonth && !disabled"
    }],
    staticClass: "pagination-next",
    attrs: {
      "role": "button",
      "href": "#",
      "disabled": _vm.disabled
    },
    on: {
      "click": function($event) {
        $event.preventDefault();
        _vm.incrementMonth($event)
      },
      "keydown": [function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key)) { return null; }
        $event.preventDefault();
        _vm.incrementMonth($event)
      }, function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "space", 32, $event.key)) { return null; }
        $event.preventDefault();
        _vm.incrementMonth($event)
      }]
    }
  }, [_c('b-icon', {
    attrs: {
      "icon": "chevron-right",
      "pack": _vm.iconPack,
      "both": "",
      "type": "is-primary is-clickable"
    }
  })], 1), _vm._v(" "), _c('div', {
    staticClass: "pagination-list"
  }, [_c('b-field', [_c('b-select', {
    attrs: {
      "disabled": _vm.disabled,
      "size": _vm.size
    },
    model: {
      value: (_vm.focusedDateData.month),
      callback: function($$v) {
        _vm.$set(_vm.focusedDateData, "month", $$v)
      },
      expression: "focusedDateData.month"
    }
  }, _vm._l((_vm.monthNames), function(month, index) {
    return _c('option', {
      key: month,
      domProps: {
        "value": index
      }
    }, [_vm._v("\n                                    " + _vm._s(month) + "\n                                ")])
  })), _vm._v(" "), _c('b-select', {
    attrs: {
      "disabled": _vm.disabled,
      "size": _vm.size
    },
    model: {
      value: (_vm.focusedDateData.year),
      callback: function($$v) {
        _vm.$set(_vm.focusedDateData, "year", $$v)
      },
      expression: "focusedDateData.year"
    }
  }, _vm._l((_vm.listOfYears), function(year) {
    return _c('option', {
      key: year,
      domProps: {
        "value": year
      }
    }, [_vm._v("\n                                    " + _vm._s(year) + "\n                                ")])
  }))], 1)], 1)])], 2), _vm._v(" "), _c('b-datepicker-table', {
    attrs: {
      "day-names": _vm.dayNames,
      "month-names": _vm.monthNames,
      "first-day-of-week": _vm.firstDayOfWeek,
      "min-date": _vm.minDate,
      "max-date": _vm.maxDate,
      "focused": _vm.focusedDateData,
      "disabled": _vm.disabled,
      "unselectable-dates": _vm.unselectableDates,
      "unselectable-days-of-week": _vm.unselectableDaysOfWeek,
      "selectable-dates": _vm.selectableDates,
      "events": _vm.events,
      "indicators": _vm.indicators,
      "date-creator": _vm.dateCreator
    },
    on: {
      "close": function($event) {
        _vm.$refs.dropdown.isActive = false
      }
    },
    model: {
      value: (_vm.dateSelected),
      callback: function($$v) {
        _vm.dateSelected = $$v
      },
      expression: "dateSelected"
    }
  }), _vm._v(" "), (_vm.$slots.default !== undefined && _vm.$slots.default.length) ? _c('footer', {
    staticClass: "datepicker-footer"
  }, [_vm._t("default")], 2) : _vm._e()], 1)], 1) : _c('b-input', _vm._b({
    ref: "input",
    attrs: {
      "type": "date",
      "autocomplete": "off",
      "value": _vm.formatYYYYMMDD(_vm.value),
      "placeholder": _vm.placeholder,
      "size": _vm.size,
      "icon": _vm.icon,
      "icon-pack": _vm.iconPack,
      "loading": _vm.loading,
      "max": _vm.formatYYYYMMDD(_vm.maxDate),
      "min": _vm.formatYYYYMMDD(_vm.minDate),
      "disabled": _vm.disabled,
      "readonly": false
    },
    on: {
      "focus": function($event) {
        _vm.$emit('focus', $event)
      },
      "blur": function($event) {
        _vm.$emit('blur', $event) && _vm.checkHtml5Validity()
      }
    },
    nativeOn: {
      "change": function($event) {
        _vm.onChangeNativePicker($event)
      }
    }
  }, 'b-input', _vm.$attrs, false))], 1)
},staticRenderFns: []}

/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(136),
  /* template */
  __webpack_require__(139),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 136 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__icon_Icon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__icon_Icon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__icon_Icon__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__modal_Modal__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__modal_Modal___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__modal_Modal__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_config__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_helpers__ = __webpack_require__(7);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BDialog',
    components: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()({}, __WEBPACK_IMPORTED_MODULE_1__icon_Icon___default.a.name, __WEBPACK_IMPORTED_MODULE_1__icon_Icon___default.a),
    extends: __WEBPACK_IMPORTED_MODULE_2__modal_Modal___default.a,
    props: {
        title: String,
        message: String,
        icon: String,
        iconPack: String,
        hasIcon: Boolean,
        type: {
            type: String,
            default: 'is-primary'
        },
        size: String,
        confirmText: {
            type: String,
            default: function _default() {
                return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDialogConfirmText ? __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDialogConfirmText : 'OK';
            }
        },
        cancelText: {
            type: String,
            default: function _default() {
                return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDialogCancelText ? __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultDialogCancelText : 'Cancel';
            }
        },
        hasInput: Boolean, // Used internally to know if it's prompt
        inputAttrs: {
            type: Object,
            default: function _default() {
                return {};
            }
        },
        onConfirm: {
            type: Function,
            default: function _default() {}
        },
        focusOn: {
            type: String,
            default: 'confirm'
        }
    },
    data: function data() {
        var prompt = this.hasInput ? this.inputAttrs.value || '' : '';

        return {
            prompt: prompt,
            isActive: false,
            validationMessage: ''
        };
    },

    computed: {
        /**
         * Icon name (MDI) based on the type.
         */
        iconByType: function iconByType() {
            switch (this.type) {
                case 'is-info':
                    return 'information';
                case 'is-success':
                    return 'check-circle';
                case 'is-warning':
                    return 'alert';
                case 'is-danger':
                    return 'alert-circle';
                default:
                    return null;
            }
        },
        showCancel: function showCancel() {
            return this.cancelOptions.indexOf('button') >= 0;
        }
    },
    methods: {
        /**
         * If it's a prompt Dialog, validate the input.
         * Call the onConfirm prop (function) and close the Dialog.
         */
        confirm: function confirm() {
            var _this = this;

            if (this.$refs.input !== undefined) {
                if (!this.$refs.input.checkValidity()) {
                    this.validationMessage = this.$refs.input.validationMessage;
                    this.$nextTick(function () {
                        return _this.$refs.input.select();
                    });
                    return;
                }
            }

            this.onConfirm(this.prompt);
            this.close();
        },


        /**
         * Close the Dialog.
         */
        close: function close() {
            var _this2 = this;

            this.isActive = false;
            // Timeout for the animation complete before destroying
            setTimeout(function () {
                _this2.$destroy();
                Object(__WEBPACK_IMPORTED_MODULE_4__utils_helpers__["e" /* removeElement */])(_this2.$el);
            }, 150);
        }
    },
    beforeMount: function beforeMount() {
        var _this3 = this;

        // Insert the Dialog component in body tag
        this.$nextTick(function () {
            document.body.appendChild(_this3.$el);
        });
    },
    mounted: function mounted() {
        var _this4 = this;

        this.isActive = true;

        if (typeof this.inputAttrs.required === 'undefined') {
            this.$set(this.inputAttrs, 'required', true);
        }

        this.$nextTick(function () {
            // Handle which element receives focus
            if (_this4.hasInput) {
                _this4.$refs.input.focus();
            } else if (_this4.focusOn === 'cancel' && _this4.showCancel) {
                _this4.$refs.cancelButton.focus();
            } else {
                _this4.$refs.confirmButton.focus();
            }
        });
    }
});

/***/ }),
/* 137 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_helpers__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_config__ = __webpack_require__(2);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BModal',
    props: {
        active: Boolean,
        component: [Object, Function],
        content: String,
        programmatic: Boolean,
        props: Object,
        events: Object,
        width: {
            type: [String, Number],
            default: 960
        },
        hasModalCard: Boolean,
        animation: {
            type: String,
            default: 'zoom-out'
        },
        canCancel: {
            type: [Array, Boolean],
            default: function _default() {
                return ['escape', 'x', 'outside', 'button'];
            }
        },
        onCancel: {
            type: Function,
            default: function _default() {}
        },
        scroll: {
            type: String,
            default: function _default() {
                return __WEBPACK_IMPORTED_MODULE_1__utils_config__["a" /* default */].defaultModalScroll ? __WEBPACK_IMPORTED_MODULE_1__utils_config__["a" /* default */].defaultModalScroll : 'clip';
            },
            validator: function validator(value) {
                return ['clip', 'keep'].indexOf(value) >= 0;
            }
        }
    },
    data: function data() {
        return {
            isActive: this.active || false,
            savedScrollTop: null,
            newWidth: typeof this.width === 'number' ? this.width + 'px' : this.width
        };
    },

    computed: {
        cancelOptions: function cancelOptions() {
            return typeof this.canCancel === 'boolean' ? this.canCancel ? ['escape', 'x', 'outside', 'button'] : [] : this.canCancel;
        },
        showX: function showX() {
            return this.cancelOptions.indexOf('x') >= 0;
        }
    },
    watch: {
        active: function active(value) {
            this.isActive = value;
        },
        isActive: function isActive() {
            this.handleScroll();
        }
    },
    methods: {
        handleScroll: function handleScroll() {
            if (typeof window === 'undefined') return;

            if (this.scroll === 'clip') {
                if (this.isActive) {
                    document.documentElement.classList.add('is-clipped');
                } else {
                    document.documentElement.classList.remove('is-clipped');
                }
                return;
            }

            this.savedScrollTop = !this.savedScrollTop ? document.documentElement.scrollTop : this.savedScrollTop;

            if (this.isActive) {
                document.body.classList.add('is-noscroll');
            } else {
                document.body.classList.remove('is-noscroll');
            }

            if (this.isActive) {
                document.body.style.top = '-' + this.savedScrollTop + 'px';
                return;
            }

            document.documentElement.scrollTop = this.savedScrollTop;
            document.body.style.top = null;
            this.savedScrollTop = null;
        },


        /**
         * Close the Modal if canCancel and call the onCancel prop (function).
         */
        cancel: function cancel(method) {
            if (this.cancelOptions.indexOf(method) < 0) return;

            this.onCancel.apply(null, arguments);
            this.close();
        },


        /**
         * Call the onCancel prop (function).
         * Emit events, and destroy modal if it's programmatic.
         */
        close: function close() {
            var _this = this;

            this.$emit('close');
            this.$emit('update:active', false);

            // Timeout for the animation complete before destroying
            if (this.programmatic) {
                this.isActive = false;
                setTimeout(function () {
                    _this.$destroy();
                    Object(__WEBPACK_IMPORTED_MODULE_0__utils_helpers__["e" /* removeElement */])(_this.$el);
                }, 150);
            }
        },


        /**
         * Keypress event that is bound to the document.
         */
        keyPress: function keyPress(event) {
            // Esc key
            if (this.isActive && event.keyCode === 27) this.cancel('escape');
        }
    },
    created: function created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('keyup', this.keyPress);
        }
    },
    beforeMount: function beforeMount() {
        // Insert the Modal component in body tag
        // only if it's programmatic
        this.programmatic && document.body.appendChild(this.$el);
    },
    mounted: function mounted() {
        if (this.programmatic) this.isActive = true;else if (this.isActive) this.handleScroll();
    },
    beforeDestroy: function beforeDestroy() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('keyup', this.keyPress);
            // reset scroll
            document.documentElement.classList.remove('is-clipped');
            var savedScrollTop = !this.savedScrollTop ? document.documentElement.scrollTop : this.savedScrollTop;
            document.body.classList.remove('is-noscroll');
            document.documentElement.scrollTop = savedScrollTop;
            document.body.style.top = null;
        }
    }
});

/***/ }),
/* 138 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('transition', {
    attrs: {
      "name": _vm.animation
    }
  }, [(_vm.isActive) ? _c('div', {
    staticClass: "modal is-active"
  }, [_c('div', {
    staticClass: "modal-background",
    on: {
      "click": function($event) {
        _vm.cancel('outside')
      }
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "animation-content",
    class: {
      'modal-content': !_vm.hasModalCard
    },
    style: ({
      maxWidth: _vm.newWidth
    })
  }, [(_vm.component) ? _c(_vm.component, _vm._g(_vm._b({
    tag: "component",
    on: {
      "close": _vm.close
    }
  }, 'component', _vm.props, false), _vm.events)) : (_vm.content) ? _c('div', {
    domProps: {
      "innerHTML": _vm._s(_vm.content)
    }
  }) : _vm._t("default")], 2), _vm._v(" "), (_vm.showX) ? _c('button', {
    staticClass: "modal-close is-large",
    attrs: {
      "type": "button"
    },
    on: {
      "click": function($event) {
        _vm.cancel('x')
      }
    }
  }) : _vm._e()]) : _vm._e()])
},staticRenderFns: []}

/***/ }),
/* 139 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('transition', {
    attrs: {
      "name": _vm.animation
    }
  }, [(_vm.isActive) ? _c('div', {
    staticClass: "dialog modal is-active",
    class: _vm.size
  }, [_c('div', {
    staticClass: "modal-background",
    on: {
      "click": function($event) {
        _vm.cancel('outside')
      }
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "modal-card animation-content"
  }, [(_vm.title) ? _c('header', {
    staticClass: "modal-card-head"
  }, [_c('p', {
    staticClass: "modal-card-title"
  }, [_vm._v(_vm._s(_vm.title))])]) : _vm._e(), _vm._v(" "), _c('section', {
    staticClass: "modal-card-body",
    class: {
      'is-titleless': !_vm.title, 'is-flex': _vm.hasIcon
    }
  }, [_c('div', {
    staticClass: "media"
  }, [(_vm.hasIcon) ? _c('div', {
    staticClass: "media-left"
  }, [_c('b-icon', {
    attrs: {
      "icon": _vm.icon ? _vm.icon : _vm.iconByType,
      "pack": _vm.iconPack,
      "type": _vm.type,
      "both": !_vm.icon,
      "size": "is-large"
    }
  })], 1) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "media-content"
  }, [_c('p', {
    domProps: {
      "innerHTML": _vm._s(_vm.message)
    }
  }), _vm._v(" "), (_vm.hasInput) ? _c('div', {
    staticClass: "field"
  }, [_c('div', {
    staticClass: "control"
  }, [_c('input', _vm._b({
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.prompt),
      expression: "prompt"
    }],
    ref: "input",
    staticClass: "input",
    class: {
      'is-danger': _vm.validationMessage
    },
    domProps: {
      "value": (_vm.prompt)
    },
    on: {
      "keyup": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key)) { return null; }
        _vm.confirm($event)
      },
      "input": function($event) {
        if ($event.target.composing) { return; }
        _vm.prompt = $event.target.value
      }
    }
  }, 'input', _vm.inputAttrs, false))]), _vm._v(" "), _c('p', {
    staticClass: "help is-danger"
  }, [_vm._v(_vm._s(_vm.validationMessage))])]) : _vm._e()])])]), _vm._v(" "), _c('footer', {
    staticClass: "modal-card-foot"
  }, [(_vm.showCancel) ? _c('button', {
    ref: "cancelButton",
    staticClass: "button",
    on: {
      "click": function($event) {
        _vm.cancel('button')
      }
    }
  }, [_vm._v("\n                    " + _vm._s(_vm.cancelText) + "\n                ")]) : _vm._e(), _vm._v(" "), _c('button', {
    ref: "confirmButton",
    staticClass: "button",
    class: _vm.type,
    on: {
      "click": _vm.confirm
    }
  }, [_vm._v("\n                    " + _vm._s(_vm.confirmText) + "\n                ")])])])]) : _vm._e()])
},staticRenderFns: []}

/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(141),
  /* template */
  __webpack_require__(142),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 141 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_helpers__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_ssr__ = __webpack_require__(62);
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BLoading',
    props: {
        active: Boolean,
        programmatic: Boolean,
        container: [Object, Function, __WEBPACK_IMPORTED_MODULE_1__utils_ssr__["b" /* HTMLElement */]],
        isFullPage: {
            type: Boolean,
            default: true
        },
        animation: {
            type: String,
            default: 'fade'
        },
        canCancel: {
            type: Boolean,
            default: false
        },
        onCancel: {
            type: Function,
            default: function _default() {}
        }
    },
    data: function data() {
        return {
            isActive: this.active || false
        };
    },

    watch: {
        active: function active(value) {
            this.isActive = value;
        }
    },
    methods: {
        /**
         * Close the Modal if canCancel.
         */
        cancel: function cancel() {
            if (!this.canCancel || !this.isActive) return;

            this.close();
        },

        /**
         * Emit events, and destroy modal if it's programmatic.
         */
        close: function close() {
            var _this = this;

            this.onCancel.apply(null, arguments);
            this.$emit('close');
            this.$emit('update:active', false);

            // Timeout for the animation complete before destroying
            if (this.programmatic) {
                this.isActive = false;
                setTimeout(function () {
                    _this.$destroy();
                    Object(__WEBPACK_IMPORTED_MODULE_0__utils_helpers__["e" /* removeElement */])(_this.$el);
                }, 150);
            }
        },

        /**
         * Keypress event that is bound to the document.
         */
        keyPress: function keyPress(event) {
            // Esc key
            if (event.keyCode === 27) this.cancel();
        }
    },
    created: function created() {
        if (typeof window !== 'undefined') {
            document.addEventListener('keyup', this.keyPress);
        }
    },
    beforeMount: function beforeMount() {
        // Insert the Loading component in body tag
        // only if it's programmatic
        if (this.programmatic) {
            if (!this.container) {
                document.body.appendChild(this.$el);
            } else {
                this.isFullPage = false;
                this.container.appendChild(this.$el);
            }
        }
    },
    mounted: function mounted() {
        if (this.programmatic) this.isActive = true;
    },
    beforeDestroy: function beforeDestroy() {
        if (typeof window !== 'undefined') {
            document.removeEventListener('keyup', this.keyPress);
        }
    }
});

/***/ }),
/* 142 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('transition', {
    attrs: {
      "name": _vm.animation
    }
  }, [(_vm.isActive) ? _c('div', {
    staticClass: "loading-overlay is-active",
    class: {
      'is-full-page': _vm.isFullPage
    }
  }, [_c('div', {
    staticClass: "loading-background",
    on: {
      "click": _vm.cancel
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "loading-icon"
  })]) : _vm._e()])
},staticRenderFns: []}

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(144),
  /* template */
  __webpack_require__(145),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 144 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_MessageMixin_js__ = __webpack_require__(63);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BMessage',
    mixins: [__WEBPACK_IMPORTED_MODULE_0__utils_MessageMixin_js__["a" /* default */]],
    data: function data() {
        return {
            newIconSize: this.iconSize || this.size || 'is-large'
        };
    }
});

/***/ }),
/* 145 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [(_vm.isActive) ? _c('article', {
    staticClass: "message",
    class: [_vm.type, _vm.size]
  }, [(_vm.title) ? _c('header', {
    staticClass: "message-header"
  }, [_c('p', [_vm._v(_vm._s(_vm.title))]), _vm._v(" "), (_vm.closable) ? _c('button', {
    staticClass: "delete",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.close
    }
  }) : _vm._e()]) : _vm._e(), _vm._v(" "), _c('section', {
    staticClass: "message-body"
  }, [_c('div', {
    staticClass: "media"
  }, [(_vm.icon && _vm.hasIcon) ? _c('div', {
    staticClass: "media-left"
  }, [_c('b-icon', {
    class: _vm.type,
    attrs: {
      "icon": _vm.icon,
      "pack": _vm.iconPack,
      "both": "",
      "size": _vm.newIconSize
    }
  })], 1) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "media-content"
  }, [_vm._t("default")], 2)])])]) : _vm._e()])
},staticRenderFns: []}

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(147),
  /* template */
  __webpack_require__(148),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 147 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_MessageMixin_js__ = __webpack_require__(63);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BNotification',
    mixins: [__WEBPACK_IMPORTED_MODULE_0__utils_MessageMixin_js__["a" /* default */]]
});

/***/ }),
/* 148 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('transition', {
    attrs: {
      "name": "fade"
    }
  }, [(_vm.isActive) ? _c('article', {
    staticClass: "notification",
    class: _vm.type
  }, [(_vm.closable) ? _c('button', {
    staticClass: "delete",
    attrs: {
      "type": "button"
    },
    on: {
      "click": _vm.close
    }
  }) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "media"
  }, [(_vm.icon && _vm.hasIcon) ? _c('div', {
    staticClass: "media-left"
  }, [_c('b-icon', {
    attrs: {
      "icon": _vm.icon,
      "pack": _vm.iconPack,
      "both": "",
      "size": "is-large"
    }
  })], 1) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "media-content"
  }, [_vm._t("default")], 2)])]) : _vm._e()])
},staticRenderFns: []}

/***/ }),
/* 149 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__icon_Icon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__icon_Icon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__icon_Icon__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BPagination',
    components: __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()({}, __WEBPACK_IMPORTED_MODULE_1__icon_Icon___default.a.name, __WEBPACK_IMPORTED_MODULE_1__icon_Icon___default.a),
    props: {
        total: [Number, String],
        perPage: {
            type: [Number, String],
            default: 20
        },
        current: {
            type: [Number, String],
            default: 1
        },
        size: String,
        simple: Boolean,
        rounded: Boolean,
        order: String,
        iconPack: String
    },
    computed: {
        rootClasses: function rootClasses() {
            return [this.order, this.size, {
                'is-simple': this.simple,
                'is-rounded': this.rounded
            }];
        },


        /**
         * Total page size (count).
         */
        pageCount: function pageCount() {
            return Math.ceil(this.total / this.perPage);
        },


        /**
         * First item of the page (count).
         */
        firstItem: function firstItem() {
            var firstItem = this.current * this.perPage - this.perPage + 1;
            return firstItem >= 0 ? firstItem : 0;
        },


        /**
         * Check if previous button is available.
         */
        hasPrev: function hasPrev() {
            return this.current > 1;
        },


        /**
         * Check if first page button should be visible.
         */
        hasFirst: function hasFirst() {
            return this.current >= 3;
        },


        /**
         * Check if first ellipsis should be visible.
         */
        hasFirstEllipsis: function hasFirstEllipsis() {
            return this.current >= 4;
        },


        /**
         * Check if last page button should be visible.
         */
        hasLast: function hasLast() {
            return this.current <= this.pageCount - 2;
        },


        /**
         * Check if last ellipsis should be visible.
         */
        hasLastEllipsis: function hasLastEllipsis() {
            return this.current < this.pageCount - 2 && this.current <= this.pageCount - 3;
        },


        /**
         * Check if next button is available.
         */
        hasNext: function hasNext() {
            return this.current < this.pageCount;
        },


        /**
         * Get near pages, 1 before and 1 after the current.
         * Also add the click event to the array.
         */
        pagesInRange: function pagesInRange() {
            var _this = this;

            if (this.simple) return;

            var left = Math.max(1, this.current - 1);
            var right = Math.min(this.current + 1, this.pageCount);

            var pages = [];

            var _loop = function _loop(i) {
                pages.push({
                    number: i,
                    isCurrent: _this.current === i,
                    click: function click(event) {
                        if (_this.current === i) return;
                        _this.$emit('change', i);
                        _this.$emit('update:current', i);

                        // Set focus on element to keep tab order
                        _this.$nextTick(function () {
                            return event.target.focus();
                        });
                    }
                });
            };

            for (var i = left; i <= right; i++) {
                _loop(i);
            }
            return pages;
        }
    },
    watch: {
        /**
         * If current page is trying to be greater than page count, set to last.
         */
        pageCount: function pageCount(value) {
            if (this.current > value) this.last();
        }
    },
    methods: {
        /**
         * Previous button click listener.
         */
        prev: function prev() {
            if (!this.hasPrev) return;
            this.$emit('change', this.current - 1);
            this.$emit('update:current', this.current - 1);
        },


        /**
         * First button click listener.
         */
        first: function first() {
            this.$emit('change', 1);
            this.$emit('update:current', 1);
        },


        /**
         * Last button click listener.
         */
        last: function last() {
            this.$emit('change', this.pageCount);
            this.$emit('update:current', this.pageCount);
        },


        /**
         * Next button click listener.
         */
        next: function next() {
            if (!this.hasNext) return;
            this.$emit('change', this.current + 1);
            this.$emit('update:current', this.current + 1);
        }
    }
});

/***/ }),
/* 150 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "pagination",
    class: _vm.rootClasses
  }, [_c('a', {
    staticClass: "pagination-previous",
    attrs: {
      "role": "button",
      "href": "#",
      "disabled": !_vm.hasPrev
    },
    on: {
      "click": function($event) {
        $event.preventDefault();
        _vm.prev($event)
      }
    }
  }, [_c('b-icon', {
    attrs: {
      "icon": "chevron-left",
      "pack": _vm.iconPack,
      "both": ""
    }
  })], 1), _vm._v(" "), _c('a', {
    staticClass: "pagination-next",
    attrs: {
      "role": "button",
      "href": "#",
      "disabled": !_vm.hasNext
    },
    on: {
      "click": function($event) {
        $event.preventDefault();
        _vm.next($event)
      }
    }
  }, [_c('b-icon', {
    attrs: {
      "icon": "chevron-right",
      "pack": _vm.iconPack,
      "both": ""
    }
  })], 1), _vm._v(" "), (!_vm.simple) ? _c('ul', {
    staticClass: "pagination-list"
  }, [(_vm.hasFirst) ? _c('li', [_c('a', {
    staticClass: "pagination-link",
    attrs: {
      "role": "button",
      "href": "#"
    },
    on: {
      "click": function($event) {
        $event.preventDefault();
        _vm.first($event)
      }
    }
  }, [_vm._v("\n                1\n            ")])]) : _vm._e(), _vm._v(" "), (_vm.hasFirstEllipsis) ? _c('li', [_c('span', {
    staticClass: "pagination-ellipsis"
  }, [_vm._v("…")])]) : _vm._e(), _vm._v(" "), _vm._l((_vm.pagesInRange), function(page) {
    return _c('li', {
      key: page.number
    }, [_c('a', {
      staticClass: "pagination-link",
      class: {
        'is-current': page.isCurrent
      },
      attrs: {
        "role": "button",
        "href": "#"
      },
      on: {
        "click": function($event) {
          $event.preventDefault();
          page.click($event)
        }
      }
    }, [_vm._v("\n                " + _vm._s(page.number) + "\n            ")])])
  }), _vm._v(" "), (_vm.hasLastEllipsis) ? _c('li', [_c('span', {
    staticClass: "pagination-ellipsis"
  }, [_vm._v("…")])]) : _vm._e(), _vm._v(" "), (_vm.hasLast) ? _c('li', [_c('a', {
    staticClass: "pagination-link",
    attrs: {
      "role": "button",
      "href": "#"
    },
    on: {
      "click": function($event) {
        $event.preventDefault();
        _vm.last($event)
      }
    }
  }, [_vm._v("\n                " + _vm._s(_vm.pageCount) + "\n            ")])]) : _vm._e()], 2) : _vm._e(), _vm._v(" "), (_vm.simple) ? _c('small', {
    staticClass: "info"
  }, [(_vm.perPage == 1) ? [_vm._v("\n            " + _vm._s(_vm.firstItem) + " / " + _vm._s(_vm.total) + "\n        ")] : [_vm._v("\n            " + _vm._s(_vm.firstItem) + "-" + _vm._s(Math.min(_vm.current * _vm.perPage, _vm.total)) + " / " + _vm._s(_vm.total) + "\n        ")]], 2) : _vm._e()])
},staticRenderFns: []}

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(152),
  /* template */
  __webpack_require__(153),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 152 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BRadio',
    props: {
        value: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        nativeValue: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        type: String,
        disabled: Boolean,
        required: Boolean,
        name: String,
        size: String
    },
    data: function data() {
        return {
            newValue: this.value
        };
    },

    computed: {
        computedValue: {
            get: function get() {
                return this.newValue;
            },
            set: function set(value) {
                this.newValue = value;
                this.$emit('input', value);
            }
        }
    },
    watch: {
        /**
         * When v-model change, set internal value.
         */
        value: function value(_value) {
            this.newValue = _value;
        }
    }
});

/***/ }),
/* 153 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('label', {
    ref: "label",
    staticClass: "b-radio radio",
    class: [_vm.size, {
      'is-disabled': _vm.disabled
    }],
    attrs: {
      "disabled": _vm.disabled,
      "tabindex": _vm.disabled ? false : 0
    },
    on: {
      "keydown": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key) && _vm._k($event.keyCode, "space", 32, $event.key)) { return null; }
        $event.preventDefault();
        _vm.$refs.label.click()
      }
    }
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.computedValue),
      expression: "computedValue"
    }],
    attrs: {
      "type": "radio",
      "disabled": _vm.disabled,
      "required": _vm.required,
      "name": _vm.name
    },
    domProps: {
      "value": _vm.nativeValue,
      "checked": _vm._q(_vm.computedValue, _vm.nativeValue)
    },
    on: {
      "change": function($event) {
        _vm.computedValue = _vm.nativeValue
      }
    }
  }), _vm._v(" "), _c('span', {
    staticClass: "check",
    class: _vm.type
  }), _vm._v(" "), _c('span', {
    staticClass: "control-label"
  }, [_vm._t("default")], 2)])
},staticRenderFns: []}

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(155),
  /* template */
  __webpack_require__(156),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 155 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BRadioButton',
    props: {
        value: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        nativeValue: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        type: {
            type: String,
            default: 'is-primary'
        },
        disabled: Boolean,
        name: String,
        size: String
    },
    data: function data() {
        return {
            newValue: this.value
        };
    },

    computed: {
        computedValue: {
            get: function get() {
                return this.newValue;
            },
            set: function set(value) {
                this.newValue = value;
                this.$emit('input', value);
            }
        }
    },
    watch: {
        /**
         * When v-model change, set internal value.
         */
        value: function value(_value) {
            this.newValue = _value;
        }
    }
});

/***/ }),
/* 156 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "control"
  }, [_c('label', {
    ref: "label",
    staticClass: "b-radio radio button",
    class: [_vm.newValue === _vm.nativeValue ? _vm.type : null, _vm.size],
    attrs: {
      "disabled": _vm.disabled,
      "tabindex": _vm.disabled ? false : 0
    },
    on: {
      "keydown": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key) && _vm._k($event.keyCode, "space", 32, $event.key)) { return null; }
        $event.preventDefault();
        _vm.$refs.label.click()
      }
    }
  }, [_vm._t("default"), _vm._v(" "), _c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.computedValue),
      expression: "computedValue"
    }],
    attrs: {
      "type": "radio",
      "disabled": _vm.disabled,
      "name": _vm.name
    },
    domProps: {
      "value": _vm.nativeValue,
      "checked": _vm._q(_vm.computedValue, _vm.nativeValue)
    },
    on: {
      "change": function($event) {
        _vm.computedValue = _vm.nativeValue
      }
    }
  })], 2)])
},staticRenderFns: []}

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(158),
  /* template */
  __webpack_require__(159),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 158 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_config__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_NoticeMixin_js__ = __webpack_require__(65);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BSnackbar',
    mixins: [__WEBPACK_IMPORTED_MODULE_1__utils_NoticeMixin_js__["a" /* default */]],
    props: {
        actionText: {
            type: String,
            default: 'OK'
        },
        onAction: {
            type: Function,
            default: function _default() {}
        },
        indefinite: {
            type: Boolean,
            default: false
        }
    },
    data: function data() {
        return {
            newDuration: this.duration || __WEBPACK_IMPORTED_MODULE_0__utils_config__["a" /* default */].defaultSnackbarDuration
        };
    },

    methods: {
        /**
         * Click listener.
         * Call action prop before closing (from Mixin).
         */
        action: function action() {
            this.onAction();
            this.close();
        }
    }
});

/***/ }),
/* 159 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('transition', {
    attrs: {
      "enter-active-class": _vm.transition.enter,
      "leave-active-class": _vm.transition.leave
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.isActive),
      expression: "isActive"
    }],
    staticClass: "snackbar",
    class: [_vm.type, _vm.position]
  }, [_c('p', {
    staticClass: "text"
  }, [_vm._v(_vm._s(_vm.message))]), _vm._v(" "), (_vm.actionText) ? _c('div', {
    staticClass: "action",
    class: _vm.type,
    on: {
      "click": _vm.action
    }
  }, [_c('button', {
    staticClass: "button is-dark"
  }, [_vm._v(_vm._s(_vm.actionText))])]) : _vm._e()])])
},staticRenderFns: []}

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(161),
  /* template */
  __webpack_require__(162),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 161 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BSwitch',
    props: {
        value: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        nativeValue: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        disabled: Boolean,
        type: String,
        name: String,
        size: String,
        trueValue: {
            type: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
            default: true
        },
        falseValue: {
            type: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
            default: false
        }
    },
    data: function data() {
        return {
            newValue: this.value,
            isMouseDown: false
        };
    },

    computed: {
        computedValue: {
            get: function get() {
                return this.newValue;
            },
            set: function set(value) {
                this.newValue = value;
                this.$emit('input', value);
            }
        }
    },
    watch: {
        /**
         * When v-model change, set internal value.
         */
        value: function value(_value) {
            this.newValue = _value;
        }
    }
});

/***/ }),
/* 162 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('label', {
    ref: "label",
    staticClass: "switch",
    class: [_vm.size, {
      'is-disabled': _vm.disabled
    }],
    attrs: {
      "disabled": _vm.disabled,
      "tabindex": _vm.disabled ? false : 0
    },
    on: {
      "keydown": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "enter", 13, $event.key) && _vm._k($event.keyCode, "space", 32, $event.key)) { return null; }
        $event.preventDefault();
        _vm.$refs.label.click()
      },
      "mousedown": function($event) {
        _vm.isMouseDown = true
      },
      "mouseup": function($event) {
        _vm.isMouseDown = false
      },
      "mouseout": function($event) {
        _vm.isMouseDown = false
      },
      "blur": function($event) {
        _vm.isMouseDown = false
      }
    }
  }, [_c('input', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: (_vm.computedValue),
      expression: "computedValue"
    }],
    attrs: {
      "type": "checkbox",
      "disabled": _vm.disabled,
      "name": _vm.name,
      "true-value": _vm.trueValue,
      "false-value": _vm.falseValue
    },
    domProps: {
      "value": _vm.nativeValue,
      "checked": Array.isArray(_vm.computedValue) ? _vm._i(_vm.computedValue, _vm.nativeValue) > -1 : _vm._q(_vm.computedValue, _vm.trueValue)
    },
    on: {
      "click": function($event) {
        $event.stopPropagation();
      },
      "change": function($event) {
        var $$a = _vm.computedValue,
          $$el = $event.target,
          $$c = $$el.checked ? (_vm.trueValue) : (_vm.falseValue);
        if (Array.isArray($$a)) {
          var $$v = _vm.nativeValue,
            $$i = _vm._i($$a, $$v);
          if ($$el.checked) {
            $$i < 0 && (_vm.computedValue = $$a.concat([$$v]))
          } else {
            $$i > -1 && (_vm.computedValue = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
          }
        } else {
          _vm.computedValue = $$c
        }
      }
    }
  }), _vm._v(" "), _c('span', {
    staticClass: "check",
    class: [{
      'is-elastic': _vm.isMouseDown && !_vm.disabled
    }, _vm.type]
  }), _vm._v(" "), _c('span', {
    staticClass: "control-label"
  }, [_vm._t("default")], 2)])
},staticRenderFns: []}

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(164),
  /* template */
  __webpack_require__(178),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 164 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_toConsumableArray__ = __webpack_require__(165);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_toConsumableArray___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_toConsumableArray__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_helpers__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__checkbox_Checkbox__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__checkbox_Checkbox___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__checkbox_Checkbox__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__icon_Icon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__icon_Icon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__icon_Icon__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pagination_Pagination__ = __webpack_require__(64);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pagination_Pagination___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__pagination_Pagination__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__TableMobileSort__ = __webpack_require__(173);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__TableMobileSort___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__TableMobileSort__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__TableColumn__ = __webpack_require__(66);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__TableColumn___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__TableColumn__);



var _components;

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//










/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BTable',
    components: (_components = {}, __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_3__checkbox_Checkbox___default.a.name, __WEBPACK_IMPORTED_MODULE_3__checkbox_Checkbox___default.a), __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_4__icon_Icon___default.a.name, __WEBPACK_IMPORTED_MODULE_4__icon_Icon___default.a), __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_5__pagination_Pagination___default.a.name, __WEBPACK_IMPORTED_MODULE_5__pagination_Pagination___default.a), __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_6__TableMobileSort___default.a.name, __WEBPACK_IMPORTED_MODULE_6__TableMobileSort___default.a), __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_7__TableColumn___default.a.name, __WEBPACK_IMPORTED_MODULE_7__TableColumn___default.a), _components),
    props: {
        data: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        columns: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        bordered: Boolean,
        striped: Boolean,
        narrowed: Boolean,
        hoverable: Boolean,
        loading: Boolean,
        detailed: Boolean,
        checkable: Boolean,
        selected: Object,
        focusable: Boolean,
        customIsChecked: Function,
        isRowCheckable: {
            type: Function,
            default: function _default() {
                return true;
            }
        },
        checkedRows: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        mobileCards: {
            type: Boolean,
            default: true
        },
        defaultSort: [String, Array],
        defaultSortDirection: {
            type: String,
            default: 'asc'
        },
        paginated: Boolean,
        currentPage: {
            type: Number,
            default: 1
        },
        perPage: {
            type: [Number, String],
            default: 20
        },
        paginationSimple: Boolean,
        paginationSize: String,
        backendSorting: Boolean,
        rowClass: {
            type: Function,
            default: function _default() {
                return '';
            }
        },
        openedDetailed: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        hasDetailedVisible: {
            type: Function,
            default: function _default() {
                return true;
            }
        },
        detailKey: {
            type: String,
            default: ''
        },
        backendPagination: Boolean,
        total: {
            type: [Number, String],
            default: 0
        },
        iconPack: String
    },
    data: function data() {
        return {
            getValueByPath: __WEBPACK_IMPORTED_MODULE_2__utils_helpers__["b" /* getValueByPath */],
            newColumns: [].concat(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_toConsumableArray___default()(this.columns)),
            visibleDetailRows: this.openedDetailed,
            newData: this.data,
            newDataTotal: this.backendPagination ? this.total : this.data.length,
            newCheckedRows: [].concat(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_toConsumableArray___default()(this.checkedRows)),
            newCurrentPage: this.currentPage,
            currentSortColumn: {},
            isAsc: true,
            firstTimeSort: true, // Used by first time initSort
            _isTable: true // Used by TableColumn
        };
    },

    computed: {
        tableClasses: function tableClasses() {
            return {
                'is-bordered': this.bordered,
                'is-striped': this.striped,
                'is-narrow': this.narrowed,
                'has-mobile-cards': this.mobileCards,
                'is-hoverable': (this.hoverable || this.focusable) && this.visibleData.length
            };
        },


        /**
         * Splitted data based on the pagination.
         */
        visibleData: function visibleData() {
            if (!this.paginated) return this.newData;

            var currentPage = this.newCurrentPage;
            var perPage = this.perPage;

            if (this.newData.length <= perPage) {
                return this.newData;
            } else {
                var start = (currentPage - 1) * perPage;
                var end = parseInt(start, 10) + parseInt(perPage, 10);
                return this.newData.slice(start, end);
            }
        },


        /**
         * Check if all rows in the page are checked.
         */
        isAllChecked: function isAllChecked() {
            var _this = this;

            var validVisibleData = this.visibleData.filter(function (row) {
                return _this.isRowCheckable(row);
            });
            if (validVisibleData.length === 0) return false;
            var isAllChecked = validVisibleData.some(function (currentVisibleRow) {
                return Object(__WEBPACK_IMPORTED_MODULE_2__utils_helpers__["c" /* indexOf */])(_this.newCheckedRows, currentVisibleRow, _this.customIsChecked) < 0;
            });
            return !isAllChecked;
        },


        /**
         * Check if all rows in the page are checkable.
         */
        isAllUncheckable: function isAllUncheckable() {
            var _this2 = this;

            var validVisibleData = this.visibleData.filter(function (row) {
                return _this2.isRowCheckable(row);
            });
            return validVisibleData.length === 0;
        },


        /**
         * Check if has any sortable column.
         */
        hasSortablenewColumns: function hasSortablenewColumns() {
            return this.newColumns.some(function (column) {
                return column.sortable;
            });
        },


        /**
         * Return total column count based if it's checkable or expanded
         */
        columnCount: function columnCount() {
            var count = this.newColumns.length;
            count += this.checkable ? 1 : 0;
            count += this.detailed ? 1 : 0;

            return count;
        }
    },
    watch: {
        /**
         * When data prop change:
         *   1. Update internal value.
         *   2. Reset newColumns (thead), in case it's on a v-for loop.
         *   3. Sort again if it's not backend-sort.
         *   4. Set new total if it's not backend-paginated.
         */
        data: function data(value) {
            var _this3 = this;

            // Save newColumns before resetting
            var newColumns = this.newColumns;

            this.newColumns = [];
            this.newData = value;

            // Prevent table from being headless, data could change and created hook
            // on column might not trigger
            this.$nextTick(function () {
                if (!_this3.newColumns.length) _this3.newColumns = newColumns;
            });

            if (!this.backendSorting) {
                this.sort(this.currentSortColumn, true);
            }
            if (!this.backendPagination) {
                this.newDataTotal = value.length;
            }
        },


        /**
         * When Pagination total change, update internal total
         * only if it's backend-paginated.
         */
        total: function total(newTotal) {
            if (!this.backendPagination) return;

            this.newDataTotal = newTotal;
        },


        /**
         * When checkedRows prop change, update internal value without
         * mutating original data.
         */
        checkedRows: function checkedRows(rows) {
            this.newCheckedRows = [].concat(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_toConsumableArray___default()(rows));
        },
        columns: function columns(value) {
            this.newColumns = [].concat(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_toConsumableArray___default()(value));
        },


        /**
         * When newColumns change, call initSort only first time (For example async data).
         */
        newColumns: function newColumns(_newColumns) {
            if (_newColumns.length && this.firstTimeSort) {
                this.initSort();
                this.firstTimeSort = false;
            } else if (_newColumns.length) {
                if (this.currentSortColumn.field) {
                    for (var i = 0; i < _newColumns.length; i++) {
                        if (_newColumns[i].field === this.currentSortColumn.field) {
                            this.currentSortColumn = _newColumns[i];
                            break;
                        }
                    }
                }
            }
        },


        /**
        * When the user wants to control the detailed rows via props.
        * Or wants to open the details of certain row with the router for example.
        */
        openedDetailed: function openedDetailed(expandedRows) {
            this.visibleDetailRows = expandedRows;
        },
        currentPage: function currentPage(newVal) {
            this.newCurrentPage = newVal;
        }
    },
    methods: {
        /**
         * Sort an array by key without mutating original data.
         * Call the user sort function if it was passed.
         */
        sortBy: function sortBy(array, key, fn, isAsc) {
            var sorted = [];
            // Sorting without mutating original data
            if (fn && typeof fn === 'function') {
                sorted = [].concat(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_toConsumableArray___default()(array)).sort(function (a, b) {
                    return fn(a, b, isAsc);
                });
            } else {
                sorted = [].concat(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_toConsumableArray___default()(array)).sort(function (a, b) {
                    // Get nested values from objects
                    var newA = Object(__WEBPACK_IMPORTED_MODULE_2__utils_helpers__["b" /* getValueByPath */])(a, key);
                    var newB = Object(__WEBPACK_IMPORTED_MODULE_2__utils_helpers__["b" /* getValueByPath */])(b, key);

                    // sort boolean type
                    if (typeof newA === 'boolean' && typeof newB === 'boolean') {
                        return isAsc ? newA - newB : newB - newA;
                    }

                    if (!newA && newA !== 0) return 1;
                    if (!newB && newB !== 0) return -1;
                    if (newA === newB) return 0;

                    newA = typeof newA === 'string' ? newA.toUpperCase() : newA;
                    newB = typeof newB === 'string' ? newB.toUpperCase() : newB;

                    return isAsc ? newA > newB ? 1 : -1 : newA > newB ? -1 : 1;
                });
            }

            return sorted;
        },


        /**
         * Sort the column.
         * Toggle current direction on column if it's sortable
         * and not just updating the prop.
         */
        sort: function sort(column) {
            var updatingData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (!column || !column.sortable) return;

            if (!updatingData) {
                this.isAsc = column === this.currentSortColumn ? !this.isAsc : this.defaultSortDirection.toLowerCase() !== 'desc';
            }
            if (!this.firstTimeSort) {
                this.$emit('sort', column.field, this.isAsc ? 'asc' : 'desc');
            }
            if (!this.backendSorting) {
                this.newData = this.sortBy(this.newData, column.field, column.customSort, this.isAsc);
            }
            this.currentSortColumn = column;
        },


        /**
         * Check if the row is checked (is added to the array).
         */
        isRowChecked: function isRowChecked(row) {
            return Object(__WEBPACK_IMPORTED_MODULE_2__utils_helpers__["c" /* indexOf */])(this.newCheckedRows, row, this.customIsChecked) >= 0;
        },


        /**
         * Remove a checked row from the array.
         */
        removeCheckedRow: function removeCheckedRow(row) {
            var index = Object(__WEBPACK_IMPORTED_MODULE_2__utils_helpers__["c" /* indexOf */])(this.newCheckedRows, row, this.customIsChecked);
            if (index >= 0) {
                this.newCheckedRows.splice(index, 1);
            }
        },


        /**
         * Header checkbox click listener.
         * Add or remove all rows in current page.
         */
        checkAll: function checkAll() {
            var _this4 = this;

            var isAllChecked = this.isAllChecked;
            this.visibleData.forEach(function (currentRow) {
                _this4.removeCheckedRow(currentRow);
                if (!isAllChecked) {
                    if (_this4.isRowCheckable(currentRow)) {
                        _this4.newCheckedRows.push(currentRow);
                    }
                }
            });

            this.$emit('check', this.newCheckedRows);
            this.$emit('check-all', this.newCheckedRows);

            // Emit checked rows to update user variable
            this.$emit('update:checkedRows', this.newCheckedRows);
        },


        /**
         * Row checkbox click listener.
         * Add or remove a single row.
         */
        checkRow: function checkRow(row) {
            if (!this.isRowChecked(row)) {
                this.newCheckedRows.push(row);
            } else {
                this.removeCheckedRow(row);
            }

            this.$emit('check', this.newCheckedRows, row);

            // Emit checked rows to update user variable
            this.$emit('update:checkedRows', this.newCheckedRows);
        },


        /**
         * Row click listener.
         * Emit all necessary events.
         */
        selectRow: function selectRow(row, index) {
            this.$emit('click', row);

            if (this.selected === row) return;

            // Emit new and old row
            this.$emit('select', row, this.selected);

            // Emit new row to update user variable
            this.$emit('update:selected', row);
        },


        /**
         * Paginator change listener.
         */
        pageChanged: function pageChanged(page) {
            this.newCurrentPage = page > 0 ? page : 1;
            this.$emit('page-change', this.newCurrentPage);
            this.$emit('update:currentPage', this.newCurrentPage);
        },


        /**
         * Toggle to show/hide details slot
         */
        toggleDetails: function toggleDetails(obj) {
            var found = this.isVisibleDetailRow(obj);

            if (found) {
                this.closeDetailRow(obj);
                this.$emit('details-close', obj);
            } else {
                this.openDetailRow(obj);
                this.$emit('details-open', obj);
            }

            // Syncs the detailed rows with the parent component
            this.$emit('update:openedDetailed', this.visibleDetailRows);
        },
        openDetailRow: function openDetailRow(obj) {
            var index = this.handleDetailKey(obj);
            this.visibleDetailRows.push(index);
        },
        closeDetailRow: function closeDetailRow(obj) {
            var index = this.handleDetailKey(obj);
            var i = this.visibleDetailRows.indexOf(index);
            this.visibleDetailRows.splice(i, 1);
        },
        isVisibleDetailRow: function isVisibleDetailRow(obj) {
            var index = this.handleDetailKey(obj);
            var result = this.visibleDetailRows.indexOf(index) >= 0;
            return result;
        },


        /**
        * When the detailKey is defined we use the object[detailKey] as index.
        * If not, use the object reference by default.
        */
        handleDetailKey: function handleDetailKey(index) {
            var key = this.detailKey;
            return !key.length ? index : index[key];
        },
        checkPredefinedDetailedRows: function checkPredefinedDetailedRows() {
            var defaultExpandedRowsDefined = this.openedDetailed.length > 0;
            if (defaultExpandedRowsDefined && !this.detailKey.length) {
                throw new Error('If you set a predefined opened-detailed, you must provide a unique key using the prop "detail-key"');
            }
        },


        /**
         * Check if footer slot has custom content.
         */
        hasCustomFooterSlot: function hasCustomFooterSlot() {
            if (this.$slots.footer.length > 1) return true;

            var tag = this.$slots.footer[0].tag;
            if (tag !== 'th' && tag !== 'td') return false;

            return true;
        },


        /**
         * Check if bottom-left slot exists.
         */
        hasBottomLeftSlot: function hasBottomLeftSlot() {
            return typeof this.$slots['bottom-left'] !== 'undefined';
        },


        /**
         * Table arrow keys listener, change selection.
         */
        pressedArrow: function pressedArrow(pos) {
            if (!this.visibleData.length) return;

            var index = this.visibleData.indexOf(this.selected) + pos;

            // Prevent from going up from first and down from last
            index = index < 0 ? 0 : index > this.visibleData.length - 1 ? this.visibleData.length - 1 : index;

            this.selectRow(this.visibleData[index]);
        },


        /**
         * Focus table element if has selected prop.
         */
        focus: function focus() {
            if (!this.focusable) return;

            this.$el.querySelector('table').focus();
        },


        /**
         * Initial sorted column based on the default-sort prop.
         */
        initSort: function initSort() {
            var _this5 = this;

            if (!this.defaultSort) return;

            var sortField = '';
            var sortDirection = this.defaultSortDirection;

            if (Array.isArray(this.defaultSort)) {
                sortField = this.defaultSort[0];
                if (this.defaultSort[1]) {
                    sortDirection = this.defaultSort[1];
                }
            } else {
                sortField = this.defaultSort;
            }

            this.newColumns.forEach(function (column) {
                if (column.field === sortField) {
                    _this5.isAsc = sortDirection.toLowerCase() !== 'desc';
                    _this5.sort(column, true);
                }
            });
        }
    },

    mounted: function mounted() {
        this.checkPredefinedDetailedRows();
    }
});

/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _from = __webpack_require__(166);

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  } else {
    return (0, _from2.default)(arr);
  }
};

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = { "default": __webpack_require__(167), __esModule: true };

/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(38);
__webpack_require__(168);
module.exports = __webpack_require__(6).Array.from;


/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ctx = __webpack_require__(45);
var $export = __webpack_require__(17);
var toObject = __webpack_require__(37);
var call = __webpack_require__(169);
var isArrayIter = __webpack_require__(170);
var toLength = __webpack_require__(50);
var createProperty = __webpack_require__(171);
var getIterFn = __webpack_require__(59);

$export($export.S + $export.F * !__webpack_require__(172)(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});


/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(15);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

// check on default Array iterator
var Iterators = __webpack_require__(21);
var ITERATOR = __webpack_require__(4)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $defineProperty = __webpack_require__(9);
var createDesc = __webpack_require__(20);

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};


/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

var ITERATOR = __webpack_require__(4)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(174),
  /* template */
  __webpack_require__(175),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 174 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__select_Select__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__select_Select___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__select_Select__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__icon_Icon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__icon_Icon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__icon_Icon__);


var _components;

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BTableMobileSort',
    components: (_components = {}, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_1__select_Select___default.a.name, __WEBPACK_IMPORTED_MODULE_1__select_Select___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_2__icon_Icon___default.a.name, __WEBPACK_IMPORTED_MODULE_2__icon_Icon___default.a), _components),
    props: {
        currentSortColumn: Object,
        isAsc: Boolean,
        columns: Array
    },
    data: function data() {
        return {
            mobileSort: this.currentSortColumn
        };
    },

    watch: {
        mobileSort: function mobileSort(column) {
            if (this.currentSortColumn === column) return;

            this.$emit('sort', column);
        },
        currentSortColumn: function currentSortColumn(column) {
            this.mobileSort = column;
        }
    },
    methods: {
        sort: function sort() {
            this.$emit('sort', this.mobileSort);
        }
    }
});

/***/ }),
/* 175 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "field table-mobile-sort"
  }, [_c('div', {
    staticClass: "field has-addons"
  }, [_c('b-select', {
    attrs: {
      "expanded": ""
    },
    model: {
      value: (_vm.mobileSort),
      callback: function($$v) {
        _vm.mobileSort = $$v
      },
      expression: "mobileSort"
    }
  }, _vm._l((_vm.columns), function(column, index) {
    return (column.sortable) ? _c('option', {
      key: index,
      domProps: {
        "value": column
      }
    }, [_vm._v("\n                " + _vm._s(column.label) + "\n            ")]) : _vm._e()
  })), _vm._v(" "), _c('div', {
    staticClass: "control"
  }, [_c('button', {
    staticClass: "button is-primary",
    on: {
      "click": _vm.sort
    }
  }, [_c('b-icon', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.currentSortColumn === _vm.mobileSort),
      expression: "currentSortColumn === mobileSort"
    }],
    class: {
      'is-desc': !_vm.isAsc
    },
    attrs: {
      "icon": "arrow-up",
      "size": "is-small",
      "both": ""
    }
  })], 1)])], 1)])
},staticRenderFns: []}

/***/ }),
/* 176 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol__);

//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BTableColumn',
    props: {
        label: String,
        customKey: [String, Number],
        field: String,
        meta: [String, Number, Boolean, Function, Object, Array, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_core_js_symbol___default.a],
        width: [Number, String],
        numeric: Boolean,
        centered: Boolean,
        sortable: Boolean,
        visible: {
            type: Boolean,
            default: true
        },
        customSort: Function,
        internal: Boolean // Used internally by Table
    },
    data: function data() {
        return {
            newKey: this.customKey || this.label
        };
    },

    computed: {
        rootClasses: function rootClasses() {
            return {
                'has-text-right': this.numeric && !this.centered,
                'has-text-centered': this.centered
            };
        }
    },
    methods: {
        addRefToTable: function addRefToTable() {
            var _this = this;

            if (!this.$parent.$data._isTable) {
                this.$destroy();
                throw new Error('You should wrap bTableColumn on a bTable');
            }

            if (this.internal) return;

            // Since we're using scoped prop the columns gonna be multiplied,
            // this finds when to stop based on the newKey property.
            var repeated = this.$parent.newColumns.some(function (column) {
                return column.newKey === _this.newKey;
            });
            !repeated && this.$parent.newColumns.push(this);
        }
    },
    beforeMount: function beforeMount() {
        this.addRefToTable();
    },
    beforeUpdate: function beforeUpdate() {
        this.addRefToTable();
    },
    beforeDestroy: function beforeDestroy() {
        var index = this.$parent.newColumns.map(function (column) {
            return column.newKey;
        }).indexOf(this.newKey);
        if (index >= 0) {
            this.$parent.newColumns.splice(index, 1);
        }
    }
});

/***/ }),
/* 177 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return (_vm.visible) ? _c('td', {
    class: _vm.rootClasses,
    attrs: {
      "data-label": _vm.label
    }
  }, [_c('span', [_vm._t("default")], 2)]) : _vm._e()
},staticRenderFns: []}

/***/ }),
/* 178 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "b-table",
    class: {
      'is-loading': _vm.loading
    }
  }, [(_vm.mobileCards && _vm.hasSortablenewColumns) ? _c('b-table-mobile-sort', {
    attrs: {
      "current-sort-column": _vm.currentSortColumn,
      "is-asc": _vm.isAsc,
      "columns": _vm.newColumns
    },
    on: {
      "sort": function (column) { return _vm.sort(column); }
    }
  }) : _vm._e(), _vm._v(" "), _c('div', {
    staticClass: "table-wrapper"
  }, [_c('table', {
    staticClass: "table",
    class: _vm.tableClasses,
    attrs: {
      "tabindex": !_vm.focusable ? false : 0
    },
    on: {
      "keydown": [function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "up", 38, $event.key)) { return null; }
        $event.preventDefault();
        _vm.pressedArrow(-1)
      }, function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "down", 40, $event.key)) { return null; }
        $event.preventDefault();
        _vm.pressedArrow(1)
      }]
    }
  }, [(_vm.newColumns.length) ? _c('thead', [_c('tr', [(_vm.detailed) ? _c('th', {
    attrs: {
      "width": "40px"
    }
  }) : _vm._e(), _vm._v(" "), (_vm.checkable) ? _c('th', {
    staticClass: "checkbox-cell"
  }, [_c('b-checkbox', {
    attrs: {
      "value": _vm.isAllChecked,
      "disabled": _vm.isAllUncheckable
    },
    nativeOn: {
      "change": function($event) {
        _vm.checkAll($event)
      }
    }
  })], 1) : _vm._e(), _vm._v(" "), _vm._l((_vm.newColumns), function(column, index) {
    return (column.visible || column.visible === undefined) ? _c('th', {
      key: index,
      class: {
        'is-current-sort': _vm.currentSortColumn === column,
          'is-sortable': column.sortable
      },
      style: ({
        width: column.width + 'px'
      }),
      on: {
        "click": function($event) {
          $event.stopPropagation();
          _vm.sort(column)
        }
      }
    }, [_c('div', {
      staticClass: "th-wrap",
      class: {
        'is-numeric': column.numeric,
          'is-centered': column.centered
      }
    }, [(_vm.$scopedSlots.header) ? _vm._t("header", null, {
      column: column,
      index: index
    }) : [_vm._v(_vm._s(column.label))], _vm._v(" "), _c('b-icon', {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: (_vm.currentSortColumn === column),
        expression: "currentSortColumn === column"
      }],
      class: {
        'is-desc': !_vm.isAsc
      },
      attrs: {
        "icon": "arrow-up",
        "pack": _vm.iconPack,
        "both": "",
        "size": "is-small"
      }
    })], 2)]) : _vm._e()
  })], 2)]) : _vm._e(), _vm._v(" "), (_vm.visibleData.length) ? _c('tbody', [_vm._l((_vm.visibleData), function(row, index) {
    return [_c('tr', {
      key: index,
      class: [_vm.rowClass(row, index), {
        'is-selected': row === _vm.selected,
        'is-checked': _vm.isRowChecked(row)
      }],
      on: {
        "click": function($event) {
          _vm.selectRow(row)
        },
        "dblclick": function($event) {
          _vm.$emit('dblclick', row)
        }
      }
    }, [(_vm.detailed) ? _c('td', {
      staticClass: "chevron-cell"
    }, [(_vm.hasDetailedVisible(row)) ? _c('a', {
      attrs: {
        "role": "button"
      },
      on: {
        "click": function($event) {
          $event.stopPropagation();
          _vm.toggleDetails(row)
        }
      }
    }, [_c('b-icon', {
      class: {
        'is-expanded': _vm.isVisibleDetailRow(row)
      },
      attrs: {
        "icon": "chevron-right",
        "pack": _vm.iconPack,
        "both": ""
      }
    })], 1) : _vm._e()]) : _vm._e(), _vm._v(" "), (_vm.checkable) ? _c('td', {
      staticClass: "checkbox-cell"
    }, [_c('b-checkbox', {
      attrs: {
        "disabled": !_vm.isRowCheckable(row),
        "value": _vm.isRowChecked(row)
      },
      nativeOn: {
        "change": function($event) {
          _vm.checkRow(row)
        }
      }
    })], 1) : _vm._e(), _vm._v(" "), (_vm.$scopedSlots.default) ? _vm._t("default", null, {
      row: row,
      index: index
    }) : _vm._l((_vm.newColumns), function(column) {
      return _c('BTableColumn', _vm._b({
        key: column.field,
        attrs: {
          "internal": ""
        }
      }, 'BTableColumn', column, false), [(column.renderHtml) ? _c('span', {
        domProps: {
          "innerHTML": _vm._s(_vm.getValueByPath(row, column.field))
        }
      }) : [_vm._v("\n                                    " + _vm._s(_vm.getValueByPath(row, column.field)) + "\n                                ")]], 2)
    })], 2), _vm._v(" "), (_vm.detailed && _vm.isVisibleDetailRow(row)) ? _c('tr', {
      staticClass: "detail"
    }, [_c('td', {
      attrs: {
        "colspan": _vm.columnCount
      }
    }, [_c('div', {
      staticClass: "detail-container"
    }, [_vm._t("detail", null, {
      row: row,
      index: index
    })], 2)])]) : _vm._e()]
  })], 2) : _c('tbody', [_c('tr', {
    staticClass: "is-empty"
  }, [_c('td', {
    attrs: {
      "colspan": _vm.columnCount
    }
  }, [_vm._t("empty")], 2)])]), _vm._v(" "), (_vm.$slots.footer !== undefined) ? _c('tfoot', [_c('tr', {
    staticClass: "table-footer"
  }, [(_vm.hasCustomFooterSlot()) ? _vm._t("footer") : _c('th', {
    attrs: {
      "colspan": _vm.columnCount
    }
  }, [_vm._t("footer")], 2)], 2)]) : _vm._e()])]), _vm._v(" "), ((_vm.checkable && _vm.hasBottomLeftSlot()) || _vm.paginated) ? _c('div', {
    staticClass: "level"
  }, [_c('div', {
    staticClass: "level-left"
  }, [_vm._t("bottom-left")], 2), _vm._v(" "), _c('div', {
    staticClass: "level-right"
  }, [(_vm.paginated) ? _c('div', {
    staticClass: "level-item"
  }, [_c('b-pagination', {
    attrs: {
      "icon-pack": _vm.iconPack,
      "total": _vm.newDataTotal,
      "per-page": _vm.perPage,
      "simple": _vm.paginationSimple,
      "size": _vm.paginationSize,
      "current": _vm.newCurrentPage
    },
    on: {
      "change": _vm.pageChanged
    }
  })], 1) : _vm._e()])]) : _vm._e()], 1)
},staticRenderFns: []}

/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(180),
  /* template */
  __webpack_require__(181),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 180 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// EXTERNAL MODULE: ./node_modules/babel-runtime/helpers/defineProperty.js
var defineProperty = __webpack_require__(1);
var defineProperty_default = /*#__PURE__*/__webpack_require__.n(defineProperty);

// EXTERNAL MODULE: ./src/components/icon/Icon.vue
var Icon = __webpack_require__(3);
var Icon_default = /*#__PURE__*/__webpack_require__.n(Icon);

// CONCATENATED MODULE: ./src/utils/SlotComponent.js
/* harmony default export */ var SlotComponent = ({
    name: 'BSlotComponent',
    props: {
        component: {
            type: Object,
            required: true
        },
        name: {
            type: String,
            default: 'default'
        },
        tag: {
            type: String,
            default: 'div'
        },
        event: {
            type: String,
            default: 'hook:updated'
        }
    },
    methods: {
        refresh: function refresh() {
            this.$forceUpdate();
        },
        isVueComponent: function isVueComponent() {
            return this.component && this.component._isVue;
        }
    },
    created: function created() {
        if (this.isVueComponent()) {
            this.component.$on(this.event, this.refresh);
        }
    },
    beforeDestroy: function beforeDestroy() {
        if (this.isVueComponent()) {
            this.component.$off(this.event, this.refresh);
        }
    },
    render: function render(h) {
        if (this.isVueComponent()) {
            var slots = this.component.$slots[this.name];
            return h(this.tag, {}, slots);
        }
    }
});
// CONCATENATED MODULE: ./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/selector.js?type=script&index=0!./src/components/tabs/Tabs.vue


var _components;

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ var Tabs = __webpack_exports__["default"] = ({
    name: 'BTabs',
    components: (_components = {}, defineProperty_default()(_components, Icon_default.a.name, Icon_default.a), defineProperty_default()(_components, SlotComponent.name, SlotComponent), _components),
    props: {
        value: Number,
        expanded: Boolean,
        type: String,
        size: String,
        position: String,
        animated: {
            type: Boolean,
            default: true
        }
    },
    data: function data() {
        return {
            activeTab: this.value || 0,
            tabItems: [],
            contentHeight: 0,
            _isTabs: true // Used internally by TabItem
        };
    },

    computed: {
        navClasses: function navClasses() {
            return [this.type, this.size, this.position, {
                'is-fullwidth': this.expanded,
                'is-toggle-rounded is-toggle': this.type === 'is-toggle-rounded'
            }];
        }
    },
    watch: {
        /**
         * When v-model is changed set the new active tab.
         */
        value: function value(_value) {
            this.changeTab(_value);
        },


        /**
         * When tab-items are updated, set active one.
         */
        tabItems: function tabItems() {
            if (this.tabItems.length) {
                this.tabItems[this.activeTab].isActive = true;
            }
        }
    },
    methods: {
        /**
         * Change the active tab and emit change event.
         */
        changeTab: function changeTab(newIndex) {
            if (this.activeTab === newIndex) return;

            this.tabItems[this.activeTab].deactivate(this.activeTab, newIndex);
            this.tabItems[newIndex].activate(this.activeTab, newIndex);
            this.activeTab = newIndex;
            this.$emit('change', newIndex);
        },


        /**
         * Tab click listener, emit input event and change active tab.
         */
        tabClick: function tabClick(value) {
            this.$emit('input', value);
            this.changeTab(value);
        }
    },
    mounted: function mounted() {
        if (this.tabItems.length) {
            this.tabItems[this.activeTab].isActive = true;
        }
    }
});

/***/ }),
/* 181 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "b-tabs",
    class: {
      'is-fullwidth': _vm.expanded
    }
  }, [_c('nav', {
    staticClass: "tabs",
    class: _vm.navClasses
  }, [_c('ul', _vm._l((_vm.tabItems), function(tabItem, index) {
    return _c('li', {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: (tabItem.visible),
        expression: "tabItem.visible"
      }],
      key: index,
      class: {
        'is-active': _vm.activeTab === index, 'is-disabled': tabItem.disabled
      }
    }, [_c('a', {
      on: {
        "click": function($event) {
          _vm.tabClick(index)
        }
      }
    }, [(tabItem.$slots.header) ? [_c('b-slot-component', {
      attrs: {
        "component": tabItem,
        "name": "header",
        "tag": "span"
      }
    })] : [(tabItem.icon) ? _c('b-icon', {
      attrs: {
        "icon": tabItem.icon,
        "pack": tabItem.iconPack,
        "size": _vm.size
      }
    }) : _vm._e(), _vm._v(" "), _c('span', [_vm._v(_vm._s(tabItem.label))])]], 2)])
  }))]), _vm._v(" "), _c('section', {
    staticClass: "tab-content"
  }, [_vm._t("default")], 2)])
},staticRenderFns: []}

/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(183),
  /* template */
  __webpack_require__(184),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 183 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BTabItem',
    props: {
        label: String,
        icon: String,
        iconPack: String,
        disabled: Boolean,
        visible: {
            type: Boolean,
            default: true
        }
    },
    data: function data() {
        return {
            isActive: false,
            transitionName: null
        };
    },

    methods: {
        /**
         * Activate tab, alter animation name based on the index.
         */
        activate: function activate(oldIndex, index) {
            if (!this.$parent.animated) {
                this.transitionName = null;
            } else {
                this.transitionName = index < oldIndex ? 'slide-next' : 'slide-prev';
            }
            this.isActive = true;
        },


        /**
         * Deactivate tab, alter animation name based on the index.
         */
        deactivate: function deactivate(oldIndex, index) {
            if (!this.$parent.animated) {
                this.transitionName = null;
            } else {
                this.transitionName = index < oldIndex ? 'slide-next' : 'slide-prev';
            }
            this.isActive = false;
        }
    },
    created: function created() {
        if (!this.$parent.$data._isTabs) {
            this.$destroy();
            throw new Error('You should wrap bTabItem on a bTabs');
        }
        this.$parent.tabItems.push(this);
    },
    beforeDestroy: function beforeDestroy() {
        var index = this.$parent.tabItems.indexOf(this);
        if (index >= 0) {
            this.$parent.tabItems.splice(index, 1);
        }
    }
});

/***/ }),
/* 184 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('transition', {
    attrs: {
      "name": _vm.transitionName
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.isActive && _vm.visible),
      expression: "isActive && visible"
    }],
    staticClass: "tab-item"
  }, [_vm._t("default")], 2)])
},staticRenderFns: []}

/***/ }),
/* 185 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BTag',
    props: {
        attached: Boolean,
        closable: Boolean,
        type: String,
        size: String,
        rounded: Boolean,
        disabled: Boolean,
        ellipsis: Boolean,
        tabstop: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        /**
         * Emit close event when delete button is clicked
         * or delete key is pressed.
         */
        close: function close() {
            if (this.disabled) return;

            this.$emit('close');
        }
    }
});

/***/ }),
/* 186 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return (_vm.attached && _vm.closable) ? _c('div', {
    staticClass: "tags has-addons"
  }, [_c('span', {
    staticClass: "tag",
    class: [_vm.type, _vm.size, {
      'is-rounded': _vm.rounded
    }]
  }, [_c('span', {
    class: {
      'has-ellipsis': _vm.ellipsis
    }
  }, [_vm._t("default")], 2)]), _vm._v(" "), _c('a', {
    staticClass: "tag is-delete",
    class: [_vm.size, {
      'is-rounded': _vm.rounded
    }],
    attrs: {
      "role": "button",
      "tabindex": _vm.tabstop ? 0 : false,
      "disabled": _vm.disabled
    },
    on: {
      "click": function($event) {
        _vm.close()
      },
      "keyup": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "delete", [8, 46], $event.key)) { return null; }
        $event.preventDefault();
        _vm.close()
      }
    }
  })]) : _c('span', {
    staticClass: "tag",
    class: [_vm.type, _vm.size, {
      'is-rounded': _vm.rounded
    }]
  }, [_c('span', {
    class: {
      'has-ellipsis': _vm.ellipsis
    }
  }, [_vm._t("default")], 2), _vm._v(" "), (_vm.closable) ? _c('a', {
    staticClass: "delete is-small",
    attrs: {
      "role": "button",
      "disabled": _vm.disabled,
      "tabindex": _vm.tabstop ? 0 : false
    },
    on: {
      "click": function($event) {
        _vm.close()
      },
      "keyup": function($event) {
        if (!('button' in $event) && _vm._k($event.keyCode, "delete", [8, 46], $event.key)) { return null; }
        $event.preventDefault();
        _vm.close()
      }
    }
  }) : _vm._e()])
},staticRenderFns: []}

/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(188),
  /* template */
  __webpack_require__(189),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 188 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BTaglist',
    props: {
        attached: Boolean
    }
});

/***/ }),
/* 189 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "tags",
    class: {
      'has-addons': _vm.attached
    }
  }, [_vm._t("default")], 2)
},staticRenderFns: []}

/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(191),
  /* template */
  __webpack_require__(192),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 191 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_helpers__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__tag_Tag__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__tag_Tag___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__tag_Tag__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__autocomplete_Autocomplete__ = __webpack_require__(51);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__autocomplete_Autocomplete___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__autocomplete_Autocomplete__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils_FormElementMixin__ = __webpack_require__(12);



var _components;

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BTaginput',
    components: (_components = {}, __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_4__autocomplete_Autocomplete___default.a.name, __WEBPACK_IMPORTED_MODULE_4__autocomplete_Autocomplete___default.a), __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_3__tag_Tag___default.a.name, __WEBPACK_IMPORTED_MODULE_3__tag_Tag___default.a), _components),
    mixins: [__WEBPACK_IMPORTED_MODULE_5__utils_FormElementMixin__["a" /* default */]],
    inheritAttrs: false,
    props: {
        value: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        data: {
            type: Array,
            default: function _default() {
                return [];
            }
        },
        type: String,
        rounded: {
            type: Boolean,
            default: false
        },
        attached: {
            type: Boolean,
            default: false
        },
        maxtags: {
            type: [Number, String],
            required: false
        },
        field: {
            type: String,
            default: 'value'
        },
        autocomplete: Boolean,
        disabled: Boolean,
        ellipsis: Boolean,
        closable: {
            type: Boolean,
            default: true
        },
        confirmKeyCodes: {
            type: Array,
            default: function _default() {
                return [13, 188, 9];
            }
        },
        removeOnKeys: {
            type: Array,
            default: function _default() {
                return [8];
            }
        },
        allowNew: Boolean,
        onPasteSeparators: {
            type: Array,
            default: function _default() {
                return [','];
            }
        },
        beforeAdding: {
            type: Function,
            default: function _default() {
                return true;
            }
        },
        allowDuplicates: {
            type: Boolean,
            default: false
        }
    },
    data: function data() {
        return {
            tags: this.value || [],
            newTag: '',
            _elementRef: 'input',
            _isTaginput: true
        };
    },

    computed: {
        rootClasses: function rootClasses() {
            return {
                'is-expanded': this.expanded
            };
        },
        containerClasses: function containerClasses() {
            return {
                'is-focused': this.isFocused,
                'is-focusable': this.hasInput
            };
        },
        valueLength: function valueLength() {
            return this.newTag.trim().length;
        },
        defaultSlotName: function defaultSlotName() {
            return this.hasDefaultSlot ? 'default' : 'dontrender';
        },
        emptySlotName: function emptySlotName() {
            return this.hasEmptySlot ? 'empty' : 'dontrender';
        },
        hasDefaultSlot: function hasDefaultSlot() {
            return !!this.$scopedSlots.default;
        },
        hasEmptySlot: function hasEmptySlot() {
            return !!this.$slots.empty;
        },


        /**
         * Show the input field if a maxtags hasn't been set or reached.
         */
        hasInput: function hasInput() {
            return this.maxtags == null || this.tagsLength < this.maxtags;
        },
        tagsLength: function tagsLength() {
            return this.tags.length;
        },


        /**
         * If Taginput has onPasteSeparators prop,
         * returning new RegExp used to split pasted string.
         */
        separatorsAsRegExp: function separatorsAsRegExp() {
            var sep = this.onPasteSeparators;

            return sep.length ? new RegExp(sep.map(function (s) {
                return s ? s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : null;
            }).join('|'), 'g') : null;
        }
    },
    watch: {
        /**
         * When v-model is changed set internal value.
         */
        value: function value(_value) {
            this.tags = _value;
        },
        newTag: function newTag(value) {
            this.$emit('typing', value.trim());
        },
        hasInput: function hasInput() {
            if (!this.hasInput) this.onBlur();
        }
    },
    methods: {
        addTag: function addTag(tag) {
            var tagToAdd = tag || this.newTag.trim();

            if (tagToAdd) {
                if (!this.autocomplete) {
                    var reg = this.separatorsAsRegExp;
                    if (reg && tagToAdd.match(reg)) {
                        tagToAdd.split(reg).map(function (t) {
                            return t.trim();
                        }).filter(function (t) {
                            return t.length !== 0;
                        }).map(this.addTag);
                        return;
                    }
                }

                // Add the tag input if it is not blank
                // or previously added (if not allowDuplicates).
                var add = !this.allowDuplicates ? this.tags.indexOf(tagToAdd) === -1 : true;
                if (add && this.beforeAdding(tagToAdd)) {
                    this.tags.push(tagToAdd);
                    this.$emit('input', this.tags);
                    this.$emit('add', tagToAdd);
                }
            }

            this.newTag = '';
        },
        getNormalizedTagText: function getNormalizedTagText(tag) {
            if ((typeof tag === 'undefined' ? 'undefined' : __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_typeof___default()(tag)) === 'object') {
                return Object(__WEBPACK_IMPORTED_MODULE_2__utils_helpers__["b" /* getValueByPath */])(tag, this.field);
            }

            return tag;
        },
        customOnBlur: function customOnBlur($event) {
            // Add tag on-blur if not select only
            if (!this.autocomplete) this.addTag();

            this.onBlur($event);
        },
        onSelect: function onSelect(option) {
            var _this = this;

            if (!option) return;

            this.addTag(option);
            this.$nextTick(function () {
                _this.newTag = '';
            });
        },
        removeTag: function removeTag(index) {
            var tag = this.tags.splice(index, 1)[0];
            this.$emit('input', this.tags);
            this.$emit('remove', tag);
            return tag;
        },
        removeLastTag: function removeLastTag() {
            if (this.tagsLength > 0) {
                this.removeTag(this.tagsLength - 1);
            }
        },
        keydown: function keydown(event) {
            if (this.removeOnKeys.indexOf(event.keyCode) !== -1 && !this.newTag.length) {
                this.removeLastTag();
            }
            // Stop if is to accept select only
            if (this.autocomplete && !this.allowNew) return;

            if (this.confirmKeyCodes.indexOf(event.keyCode) >= 0) {
                event.preventDefault();
                this.addTag();
            }
        }
    }
});

/***/ }),
/* 192 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "taginput control",
    class: _vm.rootClasses
  }, [_c('div', {
    staticClass: "taginput-container",
    class: [_vm.statusType, _vm.size, _vm.containerClasses],
    attrs: {
      "disabled": _vm.disabled
    },
    on: {
      "click": function($event) {
        _vm.hasInput && _vm.focus($event)
      }
    }
  }, [_vm._l((_vm.tags), function(tag, index) {
    return _c('b-tag', {
      key: index,
      attrs: {
        "type": _vm.type,
        "size": _vm.size,
        "rounded": _vm.rounded,
        "attached": _vm.attached,
        "tabstop": false,
        "disabled": _vm.disabled,
        "ellipsis": _vm.ellipsis,
        "closable": _vm.closable
      },
      on: {
        "close": function($event) {
          _vm.removeTag(index)
        }
      }
    }, [_vm._v("\n            " + _vm._s(_vm.getNormalizedTagText(tag)) + "\n        ")])
  }), _vm._v(" "), (_vm.hasInput) ? _c('b-autocomplete', _vm._b({
    ref: "autocomplete",
    attrs: {
      "data": _vm.data,
      "field": _vm.field,
      "icon": _vm.icon,
      "icon-pack": _vm.iconPack,
      "maxlength": _vm.maxlength,
      "has-counter": false,
      "size": _vm.size,
      "disabled": _vm.disabled,
      "loading": _vm.loading,
      "keep-first": ""
    },
    on: {
      "focus": _vm.onFocus,
      "blur": _vm.customOnBlur,
      "select": _vm.onSelect
    },
    nativeOn: {
      "keydown": function($event) {
        _vm.keydown($event)
      }
    },
    scopedSlots: _vm._u([{
      key: _vm.defaultSlotName,
      fn: function(props) {
        return [_vm._t("default", null, {
          option: props.option,
          index: props.index
        })]
      }
    }]),
    model: {
      value: (_vm.newTag),
      callback: function($$v) {
        _vm.newTag = $$v
      },
      expression: "newTag"
    }
  }, 'b-autocomplete', _vm.$attrs, false), [_c('template', {
    slot: _vm.emptySlotName
  }, [_vm._t("empty")], 2)], 2) : _vm._e()], 2), _vm._v(" "), (_vm.maxtags || _vm.maxlength) ? _c('p', {
    staticClass: "help counter"
  }, [(_vm.maxlength && _vm.valueLength > 0) ? [_vm._v("\n            " + _vm._s(_vm.valueLength) + " / " + _vm._s(_vm.maxlength) + "\n        ")] : (_vm.maxtags) ? [_vm._v("\n            " + _vm._s(_vm.tagsLength) + " / " + _vm._s(_vm.maxtags) + "\n        ")] : _vm._e()], 2) : _vm._e()])
},staticRenderFns: []}

/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(194),
  /* template */
  __webpack_require__(195),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 194 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_FormElementMixin__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_helpers__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_config__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem__ = __webpack_require__(43);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__input_Input__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__input_Input___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__input_Input__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__field_Field__ = __webpack_require__(44);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__field_Field___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__field_Field__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__select_Select__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__select_Select___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__select_Select__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__icon_Icon__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__icon_Icon___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__icon_Icon__);


var _components;

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//












var AM = 'AM';
var PM = 'PM';
var HOUR_FORMAT_24 = '24';
var HOUR_FORMAT_12 = '12';

var formatNumber = function formatNumber(value) {
    return (value < 10 ? '0' : '') + value;
};

var timeFormatter = function timeFormatter(date, vm) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var am = false;
    if (vm.hourFormat === HOUR_FORMAT_12) {
        am = hours < 12;
        if (hours > 12) {
            hours -= 12;
        } else if (hours === 0) {
            hours = 12;
        }
    }
    return formatNumber(hours) + ':' + formatNumber(minutes) + (vm.hourFormat === HOUR_FORMAT_12 ? ' ' + (am ? AM : PM) : '');
};

var timeParser = function timeParser(date, vm) {
    if (date) {
        var dateString = date;
        var am = false;
        if (vm.hourFormat === HOUR_FORMAT_12) {
            var dateString12 = date.split(' ');
            dateString = dateString12[0];
            am = dateString12[1] === AM;
        }
        var time = dateString.split(':');
        var hours = parseInt(time[0], 10);
        var minutes = parseInt(time[1], 10);
        if (isNaN(hours) || hours < 0 || hours > 23 || vm.hourFormat === HOUR_FORMAT_12 && (hours < 1 || hours > 12) || isNaN(minutes) || minutes < 0 || minutes > 59) {
            return null;
        }
        var d = null;
        if (vm.dateSelected && !isNaN(vm.dateSelected)) {
            d = new Date(vm.dateSelected);
        } else {
            d = new Date();
            d.setMilliseconds(0);
            d.setSeconds(0);
        }
        d.setMinutes(minutes);
        if (vm.hourFormat === HOUR_FORMAT_12) {
            if (am && hours === 12) {
                hours = 0;
            } else if (!am && hours !== 12) {
                hours += 12;
            }
        }
        d.setHours(hours);
        return d;
    }
    return null;
};

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BTimepicker',
    components: (_components = {}, __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_6__input_Input___default.a.name, __WEBPACK_IMPORTED_MODULE_6__input_Input___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_7__field_Field___default.a.name, __WEBPACK_IMPORTED_MODULE_7__field_Field___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_8__select_Select___default.a.name, __WEBPACK_IMPORTED_MODULE_8__select_Select___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_9__icon_Icon___default.a.name, __WEBPACK_IMPORTED_MODULE_9__icon_Icon___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown___default.a.name, __WEBPACK_IMPORTED_MODULE_4__dropdown_Dropdown___default.a), __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_defineProperty___default()(_components, __WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem___default.a.name, __WEBPACK_IMPORTED_MODULE_5__dropdown_DropdownItem___default.a), _components),
    mixins: [__WEBPACK_IMPORTED_MODULE_1__utils_FormElementMixin__["a" /* default */]],
    inheritAttrs: false,
    props: {
        value: Date,
        inline: Boolean,
        minTime: Date,
        maxTime: Date,
        placeholder: String,
        editable: Boolean,
        disabled: Boolean,
        hourFormat: {
            type: String,
            default: HOUR_FORMAT_24,
            validator: function validator(value) {
                return value === HOUR_FORMAT_24 || value === HOUR_FORMAT_12;
            }
        },
        incrementMinutes: {
            type: Number,
            default: 1
        },
        timeFormatter: {
            type: Function,
            default: function _default(date, vm) {
                if (typeof __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultTimeFormatter === 'function') {
                    return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultTimeFormatter(date);
                } else {
                    return timeFormatter(date, vm);
                }
            }
        },
        timeParser: {
            type: Function,
            default: function _default(date, vm) {
                if (typeof __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultTimeParser === 'function') {
                    return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultTimeParser(date);
                } else {
                    return timeParser(date, vm);
                }
            }
        },
        mobileNative: {
            type: Boolean,
            default: function _default() {
                return __WEBPACK_IMPORTED_MODULE_3__utils_config__["a" /* default */].defaultTimepickerMobileNative;
            }
        },
        position: String,
        unselectableTimes: Array
    },
    data: function data() {
        return {
            dateSelected: this.value,
            hoursSelected: null,
            minutesSelected: null,
            meridienSelected: null,
            _elementRef: 'input',
            _isTimepicker: true
        };
    },

    computed: {
        hours: function hours() {
            var hours = [];
            var numberOfHours = this.isHourFormat24 ? 24 : 12;
            for (var i = 0; i < numberOfHours; i++) {
                var value = i;
                var label = value;
                if (!this.isHourFormat24) {
                    value = i + 1;
                    label = value;
                    if (this.meridienSelected === AM) {
                        if (value === 12) {
                            value = 0;
                        }
                    } else if (this.meridienSelected === PM) {
                        if (value !== 12) {
                            value += 12;
                        }
                    }
                }
                hours.push({
                    label: formatNumber(label),
                    value: value
                });
            }
            return hours;
        },
        minutes: function minutes() {
            var minutes = [];
            for (var i = 0; i < 60; i += this.incrementMinutes) {
                minutes.push({
                    label: formatNumber(i),
                    value: i
                });
            }
            return minutes;
        },
        meridiens: function meridiens() {
            return [AM, PM];
        },
        isMobile: function isMobile() {
            return this.mobileNative && __WEBPACK_IMPORTED_MODULE_2__utils_helpers__["d" /* isMobile */].any();
        },
        isHourFormat24: function isHourFormat24() {
            return this.hourFormat === HOUR_FORMAT_24;
        }
    },
    watch: {
        hourFormat: function hourFormat(value) {
            if (this.hoursSelected !== null) {
                this.meridienSelected = this.hoursSelected >= 12 ? PM : AM;
            }
        },


        /**
        * Emit input event with selected date as payload.
        */
        dateSelected: function dateSelected(value) {
            this.$emit('input', value);
        },


        /**
         * When v-model is changed:
         *   1. Update internal value.
         *   2. If it's invalid, validate again.
         */
        value: function value(_value) {
            this.updateInternalState(_value);
            this.dateSelected = _value;

            !this.isValid && this.$refs.input.checkHtml5Validity();
        }
    },
    methods: {
        onMeridienChange: function onMeridienChange(value) {
            if (this.hoursSelected !== null) {
                if (value === PM) {
                    if (this.hoursSelected === 0) {
                        this.hoursSelected = 12;
                    } else {
                        this.hoursSelected += 12;
                    }
                } else if (value === AM) {
                    if (this.hoursSelected === 12) {
                        this.hoursSelected = 0;
                    } else {
                        this.hoursSelected -= 12;
                    }
                }
            }
            this.updateDateSelected(this.hoursSelected, this.minutesSelected, value);
        },
        onHoursChange: function onHoursChange(value) {
            this.updateDateSelected(parseInt(value, 10), this.minutesSelected, this.meridienSelected);
        },
        onMinutesChange: function onMinutesChange(value) {
            this.updateDateSelected(this.hoursSelected, parseInt(value, 10), this.meridienSelected);
        },
        updateDateSelected: function updateDateSelected(hours, minutes, meridiens) {
            if (hours != null && minutes != null && (!this.isHourFormat24 && meridiens !== null || this.isHourFormat24)) {
                if (this.dateSelected && !isNaN(this.dateSelected)) {
                    this.dateSelected = new Date(this.dateSelected);
                } else {
                    this.dateSelected = new Date();
                    this.dateSelected.setMilliseconds(0);
                    this.dateSelected.setSeconds(0);
                }
                this.dateSelected.setHours(hours);
                this.dateSelected.setMinutes(minutes);
            }
        },
        updateInternalState: function updateInternalState(value) {
            if (value) {
                this.hoursSelected = value.getHours();
                this.minutesSelected = value.getMinutes();
                this.meridienSelected = value.getHours() >= 12 ? PM : AM;
            } else {
                this.hoursSelected = null;
                this.minutesSelected = null;
                this.meridienSelected = AM;
            }
        },
        isHourDisabled: function isHourDisabled(hour) {
            var _this = this;

            var disabled = false;
            if (this.minTime) {
                var minHours = this.minTime.getHours();
                disabled = hour < minHours;
            }
            if (this.maxTime) {
                if (!disabled) {
                    var maxHours = this.maxTime.getHours();
                    disabled = hour > maxHours;
                }
            }
            if (this.unselectableTimes) {
                if (!disabled) {
                    if (this.minutesSelected !== null) {
                        var unselectable = this.unselectableTimes.filter(function (time) {
                            return time.getHours() === hour && time.getMinutes() === _this.minutesSelected;
                        });
                        disabled = unselectable.length > 0;
                    } else {
                        var _unselectable = this.unselectableTimes.filter(function (time) {
                            return time.getHours() === hour;
                        });
                        disabled = _unselectable.length === this.minutes.length;
                    }
                }
            }
            return disabled;
        },
        isMinuteDisabled: function isMinuteDisabled(minute) {
            var _this2 = this;

            var disabled = false;
            if (this.hoursSelected !== null) {
                if (this.isHourDisabled(this.hoursSelected)) {
                    disabled = true;
                } else {
                    if (this.minTime) {
                        var minHours = this.minTime.getHours();
                        var minMinutes = this.minTime.getMinutes();
                        disabled = this.hoursSelected === minHours && minute < minMinutes;
                    }
                    if (this.maxTime) {
                        if (!disabled) {
                            var maxHours = this.maxTime.getHours();
                            var _minMinutes = this.maxTime.getMinutes();
                            disabled = this.hoursSelected === maxHours && minute > _minMinutes;
                        }
                    }
                }
                if (this.unselectableTimes) {
                    if (!disabled) {
                        var unselectable = this.unselectableTimes.filter(function (time) {
                            return time.getHours() === _this2.hoursSelected && time.getMinutes() === minute;
                        });
                        disabled = unselectable.length > 0;
                    }
                }
            }
            return disabled;
        },


        /*
        * Parse string into date
        */
        onChange: function onChange(value) {
            var date = this.timeParser(value, this);
            this.updateInternalState(date);
            if (date && !isNaN(date)) {
                this.dateSelected = date;
            } else {
                // Force refresh input value when not valid date
                this.dateSelected = null;
                this.$refs.input.newValue = this.dateSelected;
            }
        },


        /*
        * Format date into string
        */
        formatValue: function formatValue(value) {
            if (value && !isNaN(value)) {
                return this.timeFormatter(value, this);
            } else {
                return null;
            }
        },


        /*
        * Close dropdown time picker
        */
        close: function close() {
            if (this.$refs.dropdown) {
                this.$refs.dropdown.isActive = false;
            }
        },


        /*
        * Format date into string 'HH-MM-SS'
        */
        formatHHMMSS: function formatHHMMSS(value) {
            var date = new Date(value);
            if (value && !isNaN(date)) {
                var hours = date.getHours();
                var minutes = date.getMinutes();
                return formatNumber(hours) + ':' + formatNumber(minutes) + ':00';
            }
            return '';
        },


        /*
        * Parse time from string
        */
        onChangeNativePicker: function onChangeNativePicker(event) {
            var date = event.target.value;
            if (date) {
                if (this.dateSelected && !isNaN(this.dateSelected)) {
                    this.dateSelected = new Date(this.dateSelected);
                } else {
                    this.dateSelected = new Date();
                    this.dateSelected.setMilliseconds(0);
                    this.dateSelected.setSeconds(0);
                }
                var time = date.split(':');
                this.dateSelected.setHours(parseInt(time[0], 10));
                this.dateSelected.setMinutes(parseInt(time[1], 10));
            } else {
                this.dateSelected = null;
            }
        }
    },
    mounted: function mounted() {
        this.updateInternalState(this.value);
    }
});

/***/ }),
/* 195 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "timepicker control",
    class: [_vm.size, {
      'is-expanded': _vm.expanded
    }]
  }, [(!_vm.isMobile || _vm.inline) ? _c('b-dropdown', {
    ref: "dropdown",
    attrs: {
      "position": _vm.position,
      "disabled": _vm.disabled,
      "inline": _vm.inline
    }
  }, [(!_vm.inline) ? _c('b-input', _vm._b({
    ref: "input",
    attrs: {
      "slot": "trigger",
      "autocomplete": "off",
      "value": _vm.formatValue(_vm.dateSelected),
      "placeholder": _vm.placeholder,
      "size": _vm.size,
      "icon": _vm.icon,
      "icon-pack": _vm.iconPack,
      "loading": _vm.loading,
      "disabled": _vm.disabled,
      "readonly": !_vm.editable,
      "rounded": _vm.rounded
    },
    on: {
      "focus": function($event) {
        _vm.$emit('focus', $event)
      },
      "blur": function($event) {
        _vm.$emit('blur', $event) && _vm.checkHtml5Validity()
      }
    },
    nativeOn: {
      "change": function($event) {
        _vm.onChange($event.target.value)
      }
    },
    slot: "trigger"
  }, 'b-input', _vm.$attrs, false)) : _vm._e(), _vm._v(" "), _c('b-dropdown-item', {
    attrs: {
      "disabled": _vm.disabled,
      "custom": ""
    }
  }, [_c('b-field', {
    attrs: {
      "grouped": "",
      "position": "is-centered"
    }
  }, [_c('b-select', {
    attrs: {
      "disabled": _vm.disabled,
      "placeholder": "00"
    },
    nativeOn: {
      "change": function($event) {
        _vm.onHoursChange($event.target.value)
      }
    },
    model: {
      value: (_vm.hoursSelected),
      callback: function($$v) {
        _vm.hoursSelected = $$v
      },
      expression: "hoursSelected"
    }
  }, _vm._l((_vm.hours), function(hour) {
    return _c('option', {
      key: hour.value,
      attrs: {
        "disabled": _vm.isHourDisabled(hour.value)
      },
      domProps: {
        "value": hour.value
      }
    }, [_vm._v("\n                        " + _vm._s(hour.label) + "\n                    ")])
  })), _vm._v(" "), _c('span', {
    staticClass: "control is-colon"
  }, [_vm._v(":")]), _vm._v(" "), _c('b-select', {
    attrs: {
      "disabled": _vm.disabled,
      "placeholder": "00"
    },
    nativeOn: {
      "change": function($event) {
        _vm.onMinutesChange($event.target.value)
      }
    },
    model: {
      value: (_vm.minutesSelected),
      callback: function($$v) {
        _vm.minutesSelected = $$v
      },
      expression: "minutesSelected"
    }
  }, _vm._l((_vm.minutes), function(minute) {
    return _c('option', {
      key: minute.value,
      attrs: {
        "disabled": _vm.isMinuteDisabled(minute.value)
      },
      domProps: {
        "value": minute.value
      }
    }, [_vm._v("\n                        " + _vm._s(minute.label) + "\n                    ")])
  })), _vm._v(" "), (!_vm.isHourFormat24) ? _c('b-select', {
    attrs: {
      "disabled": _vm.disabled
    },
    nativeOn: {
      "change": function($event) {
        _vm.onMeridienChange($event.target.value)
      }
    },
    model: {
      value: (_vm.meridienSelected),
      callback: function($$v) {
        _vm.meridienSelected = $$v
      },
      expression: "meridienSelected"
    }
  }, _vm._l((_vm.meridiens), function(meridien) {
    return _c('option', {
      key: meridien,
      domProps: {
        "value": meridien
      }
    }, [_vm._v("\n                        " + _vm._s(meridien) + "\n                    ")])
  })) : _vm._e()], 1), _vm._v(" "), (_vm.$slots.default !== undefined && _vm.$slots.default.length) ? _c('footer', {
    staticClass: "timepicker-footer"
  }, [_vm._t("default")], 2) : _vm._e()], 1)], 1) : _c('b-input', _vm._b({
    ref: "input",
    attrs: {
      "type": "time",
      "autocomplete": "off",
      "value": _vm.formatHHMMSS(_vm.value),
      "placeholder": _vm.placeholder,
      "size": _vm.size,
      "icon": _vm.icon,
      "icon-pack": _vm.iconPack,
      "loading": _vm.loading,
      "max": _vm.formatHHMMSS(_vm.maxTime),
      "min": _vm.formatHHMMSS(_vm.minTime),
      "disabled": _vm.disabled,
      "readonly": false
    },
    on: {
      "focus": function($event) {
        _vm.$emit('focus', $event)
      },
      "blur": function($event) {
        _vm.$emit('blur', $event) && _vm.checkHtml5Validity()
      }
    },
    nativeOn: {
      "change": function($event) {
        _vm.onChangeNativePicker($event)
      }
    }
  }, 'b-input', _vm.$attrs, false))], 1)
},staticRenderFns: []}

/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(197),
  /* template */
  __webpack_require__(198),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 197 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_config__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_NoticeMixin_js__ = __webpack_require__(65);
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BToast',
    mixins: [__WEBPACK_IMPORTED_MODULE_1__utils_NoticeMixin_js__["a" /* default */]],
    data: function data() {
        return {
            newDuration: this.duration || __WEBPACK_IMPORTED_MODULE_0__utils_config__["a" /* default */].defaultToastDuration
        };
    }
});

/***/ }),
/* 198 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('transition', {
    attrs: {
      "enter-active-class": _vm.transition.enter,
      "leave-active-class": _vm.transition.leave
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (_vm.isActive),
      expression: "isActive"
    }],
    staticClass: "toast",
    class: [_vm.type, _vm.position]
  }, [_c('div', {
    domProps: {
      "innerHTML": _vm._s(_vm.message)
    }
  })])])
},staticRenderFns: []}

/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(200),
  /* template */
  __webpack_require__(201),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 200 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_config__ = __webpack_require__(2);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BTooltip',
    props: {
        active: {
            type: Boolean,
            default: true
        },
        type: String,
        label: String,
        position: {
            type: String,
            default: 'is-top',
            validator: function validator(value) {
                return ['is-top', 'is-bottom', 'is-left', 'is-right'].indexOf(value) > -1;
            }
        },
        always: Boolean,
        animated: Boolean,
        square: Boolean,
        dashed: Boolean,
        multilined: Boolean,
        size: {
            type: String,
            default: 'is-medium'
        }
    },
    computed: {
        newType: function newType() {
            return this.type || __WEBPACK_IMPORTED_MODULE_0__utils_config__["a" /* default */].defaultTooltipType;
        },
        newAnimated: function newAnimated() {
            return this.animated || __WEBPACK_IMPORTED_MODULE_0__utils_config__["a" /* default */].defaultTooltipAnimated;
        }
    }
});

/***/ }),
/* 201 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    class: [_vm.newType, _vm.position, _vm.size, {
      'tooltip': _vm.active,
      'is-square': _vm.square,
      'is-animated': _vm.newAnimated,
      'is-always': _vm.always,
      'is-multiline': _vm.multilined,
      'is-dashed': _vm.dashed
    }],
    attrs: {
      "data-label": _vm.label
    }
  }, [_vm._t("default")], 2)
},staticRenderFns: []}

/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

var Component = __webpack_require__(0)(
  /* script */
  __webpack_require__(203),
  /* template */
  __webpack_require__(204),
  /* styles */
  null,
  /* scopeId */
  null,
  /* moduleIdentifier (server only) */
  null
)

module.exports = Component.exports


/***/ }),
/* 203 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_FormElementMixin__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_ssr__ = __webpack_require__(62);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'BUpload',
    mixins: [__WEBPACK_IMPORTED_MODULE_0__utils_FormElementMixin__["a" /* default */]],
    inheritAttrs: false,
    props: {
        value: {
            type: [Object, Function, __WEBPACK_IMPORTED_MODULE_1__utils_ssr__["a" /* File */], Array]
        },
        multiple: Boolean,
        disabled: Boolean,
        accept: String,
        dragDrop: Boolean,
        type: {
            type: String,
            default: 'is-primary'
        },
        native: {
            type: Boolean,
            default: false
        }
    },
    data: function data() {
        return {
            newValue: this.value,
            dragDropFocus: false,
            _elementRef: 'input'
        };
    },

    watch: {
        /**
         * When v-model is changed:
         *   1. Set internal value.
         *   2. Reset input value if array is empty
         *   3. If it's invalid, validate again.
         */
        value: function value(_value) {
            this.newValue = _value;
            if (!this.newValue || Array.isArray(this.newValue) && this.newValue.length === 0) {
                this.$refs.input.value = null;
            }
            !this.isValid && !this.dragDrop && this.checkHtml5Validity();
        }
    },
    methods: {

        /**
         * Listen change event on input type 'file',
         * emit 'input' event and validate
         */
        onFileChange: function onFileChange(event) {
            if (this.disabled || this.loading) return;
            if (this.dragDrop) {
                this.updateDragDropFocus(false);
            }
            var value = event.target.files || event.dataTransfer.files;
            if (value && value.length) {
                if (!this.multiple) {
                    // only one element in case drag drop mode and isn't multiple
                    if (this.dragDrop && value.length !== 1) return false;else {
                        var file = value[0];
                        if (this.checkType(file)) {
                            this.newValue = file;
                        }
                    }
                } else {
                    // always new values if native or undefined local
                    if (this.native || !this.newValue) {
                        this.newValue = [];
                    }
                    for (var i = 0; i < value.length; i++) {
                        var _file = value[i];
                        if (this.checkType(_file)) {
                            this.newValue.push(_file);
                        }
                    }
                }
            }
            this.$emit('input', this.newValue);
            !this.dragDrop && this.checkHtml5Validity();
        },


        /**
         * Listen drag-drop to update internal variable
         */
        updateDragDropFocus: function updateDragDropFocus(focus) {
            if (!this.disabled && !this.loading) {
                this.dragDropFocus = focus;
            }
        },


        /**
         * Check mime type of file
         */
        checkType: function checkType(file) {
            if (!this.accept) return true;
            var types = this.accept.split(',');
            if (types.length === 0) return true;
            var valid = false;
            for (var i = 0; i < types.length && !valid; i++) {
                var type = types[i].trim();
                if (type) {
                    if (type.substring(0, 1) === '.') {
                        // check extension
                        var extIndex = file.name.lastIndexOf('.');
                        if (extIndex >= 0 && file.name.substring(extIndex) === type) {
                            valid = true;
                        }
                    } else {
                        // check mime type
                        if (file.type.match(type)) {
                            valid = true;
                        }
                    }
                }
            }
            return valid;
        }
    }
});

/***/ }),
/* 204 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('label', {
    staticClass: "upload control"
  }, [(!_vm.dragDrop) ? [_vm._t("default")] : _c('div', {
    staticClass: "upload-draggable",
    class: [_vm.type, {
      'is-loading': _vm.loading,
      'is-disabled': _vm.disabled,
      'is-hovered': _vm.dragDropFocus
    }],
    on: {
      "dragover": function($event) {
        $event.preventDefault();
        _vm.updateDragDropFocus(true)
      },
      "dragleave": function($event) {
        $event.preventDefault();
        _vm.updateDragDropFocus(false)
      },
      "dragenter": function($event) {
        $event.preventDefault();
        _vm.updateDragDropFocus(true)
      },
      "drop": function($event) {
        $event.preventDefault();
        _vm.onFileChange($event)
      }
    }
  }, [_vm._t("default")], 2), _vm._v(" "), _c('input', _vm._b({
    ref: "input",
    attrs: {
      "type": "file",
      "multiple": _vm.multiple,
      "accept": _vm.accept,
      "disabled": _vm.disabled
    },
    on: {
      "change": _vm.onFileChange
    }
  }, 'input', _vm.$attrs, false))], 2)
},staticRenderFns: []}

/***/ })
/******/ ]);
});

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(25)
/* template */
var __vue_template__ = __webpack_require__(36)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/js/layouts/Default.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6a25d30d", Component.options)
  } else {
    hotAPI.reload("data-v-6a25d30d", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_Layout_FooterBar_vue__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_Layout_FooterBar_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_Layout_FooterBar_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_Layout_HeaderBar_vue__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_Layout_HeaderBar_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_Layout_HeaderBar_vue__);
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'DefaultLayout',
  components: { FooterBar: __WEBPACK_IMPORTED_MODULE_0__components_Layout_FooterBar_vue___default.a, HeaderBar: __WEBPACK_IMPORTED_MODULE_1__components_Layout_HeaderBar_vue___default.a }
});

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(27)
/* template */
var __vue_template__ = __webpack_require__(28)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/js/components/Layout-FooterBar.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2b790560", Component.options)
  } else {
    hotAPI.reload("data-v-2b790560", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'Footer'
});

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "footer" }, [
      _c("div", { staticClass: "container" }, [
        _c("p", [_vm._v("© 2018 Jared Sackett")])
      ])
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-2b790560", module.exports)
  }
}

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(30)
}
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = __webpack_require__(32)
/* template */
var __vue_template__ = __webpack_require__(35)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/js/components/Layout-HeaderBar.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5275c42e", Component.options)
  } else {
    hotAPI.reload("data-v-5275c42e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(31);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(12)("86948496", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5275c42e\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Layout-HeaderBar.vue", function() {
     var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-5275c42e\",\"scoped\":false,\"hasInlineConfig\":true}!../../../node_modules/sass-loader/lib/loader.js!../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Layout-HeaderBar.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(11)(false);
// imports


// module
exports.push([module.i, "\n@-webkit-keyframes spinAround {\nfrom {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n}\nto {\n    -webkit-transform: rotate(359deg);\n            transform: rotate(359deg);\n}\n}\n@keyframes spinAround {\nfrom {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n}\nto {\n    -webkit-transform: rotate(359deg);\n            transform: rotate(359deg);\n}\n}\n.delete, .modal-close, .is-unselectable, .button, .file, .breadcrumb, .pagination-previous,\n.pagination-next,\n.pagination-link,\n.pagination-ellipsis, .tabs {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.select:not(.is-multiple):not(.is-loading)::after, .navbar-link:not(.is-arrowless)::after {\n  border: 3px solid transparent;\n  border-radius: 2px;\n  border-right: 0;\n  border-top: 0;\n  content: \" \";\n  display: block;\n  height: 0.625em;\n  margin-top: -0.4375em;\n  pointer-events: none;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg);\n  -webkit-transform-origin: center;\n          transform-origin: center;\n  width: 0.625em;\n}\n.box:not(:last-child), .content:not(:last-child), .notification:not(:last-child), .progress:not(:last-child), .table:not(:last-child), .table-container:not(:last-child), .title:not(:last-child),\n.subtitle:not(:last-child), .block:not(:last-child), .highlight:not(:last-child), .breadcrumb:not(:last-child), .level:not(:last-child), .list:not(:last-child), .message:not(:last-child), .tabs:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.delete, .modal-close {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  background-color: rgba(10, 10, 10, 0.2);\n  border: none;\n  border-radius: 290486px;\n  cursor: pointer;\n  pointer-events: auto;\n  display: inline-block;\n  -webkit-box-flex: 0;\n      -ms-flex-positive: 0;\n          flex-grow: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n  font-size: 0;\n  height: 20px;\n  max-height: 20px;\n  max-width: 20px;\n  min-height: 20px;\n  min-width: 20px;\n  outline: none;\n  position: relative;\n  vertical-align: top;\n  width: 20px;\n}\n.delete::before, .modal-close::before, .delete::after, .modal-close::after {\n    background-color: white;\n    content: \"\";\n    display: block;\n    left: 50%;\n    position: absolute;\n    top: 50%;\n    -webkit-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n            transform: translateX(-50%) translateY(-50%) rotate(45deg);\n    -webkit-transform-origin: center center;\n            transform-origin: center center;\n}\n.delete::before, .modal-close::before {\n    height: 2px;\n    width: 50%;\n}\n.delete::after, .modal-close::after {\n    height: 50%;\n    width: 2px;\n}\n.delete:hover, .modal-close:hover, .delete:focus, .modal-close:focus {\n    background-color: rgba(10, 10, 10, 0.3);\n}\n.delete:active, .modal-close:active {\n    background-color: rgba(10, 10, 10, 0.4);\n}\n.is-small.delete, .is-small.modal-close {\n    height: 16px;\n    max-height: 16px;\n    max-width: 16px;\n    min-height: 16px;\n    min-width: 16px;\n    width: 16px;\n}\n.is-medium.delete, .is-medium.modal-close {\n    height: 24px;\n    max-height: 24px;\n    max-width: 24px;\n    min-height: 24px;\n    min-width: 24px;\n    width: 24px;\n}\n.is-large.delete, .is-large.modal-close {\n    height: 32px;\n    max-height: 32px;\n    max-width: 32px;\n    min-height: 32px;\n    min-width: 32px;\n    width: 32px;\n}\n.button.is-loading::after, .select.is-loading::after, .control.is-loading::after, .loader {\n  -webkit-animation: spinAround 500ms infinite linear;\n          animation: spinAround 500ms infinite linear;\n  border: 2px solid #dbdbdb;\n  border-radius: 290486px;\n  border-right-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  display: block;\n  height: 1em;\n  position: relative;\n  width: 1em;\n}\n.is-overlay, .image.is-square img, .image.is-1by1 img, .image.is-5by4 img, .image.is-4by3 img, .image.is-3by2 img, .image.is-5by3 img, .image.is-16by9 img, .image.is-2by1 img, .image.is-3by1 img, .image.is-4by5 img, .image.is-3by4 img, .image.is-2by3 img, .image.is-3by5 img, .image.is-9by16 img, .image.is-1by2 img, .image.is-1by3 img, .modal, .modal-background, .hero-video {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n.button, .input, .taginput .taginput-container.is-focusable,\n.textarea, .select select, .file-cta,\n.file-name, .pagination-previous,\n.pagination-next,\n.pagination-link,\n.pagination-ellipsis {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 1rem;\n  height: 2.25em;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  line-height: 1.5;\n  padding-bottom: calc(0.375em - 1px);\n  padding-left: calc(0.625em - 1px);\n  padding-right: calc(0.625em - 1px);\n  padding-top: calc(0.375em - 1px);\n  position: relative;\n  vertical-align: top;\n}\n.button:focus, .input:focus, .taginput .taginput-container.is-focusable:focus,\n  .textarea:focus, .select select:focus, .file-cta:focus,\n  .file-name:focus, .pagination-previous:focus,\n  .pagination-next:focus,\n  .pagination-link:focus,\n  .pagination-ellipsis:focus, .is-focused.button, .is-focused.input, .taginput .is-focused.taginput-container.is-focusable,\n  .is-focused.textarea, .select select.is-focused, .is-focused.file-cta,\n  .is-focused.file-name, .is-focused.pagination-previous,\n  .is-focused.pagination-next,\n  .is-focused.pagination-link,\n  .is-focused.pagination-ellipsis, .button:active, .input:active, .taginput .taginput-container.is-focusable:active,\n  .textarea:active, .select select:active, .file-cta:active,\n  .file-name:active, .pagination-previous:active,\n  .pagination-next:active,\n  .pagination-link:active,\n  .pagination-ellipsis:active, .is-active.button, .is-active.input, .taginput .is-active.taginput-container.is-focusable,\n  .is-active.textarea, .select select.is-active, .is-active.file-cta,\n  .is-active.file-name, .is-active.pagination-previous,\n  .is-active.pagination-next,\n  .is-active.pagination-link,\n  .is-active.pagination-ellipsis {\n    outline: none;\n}\n.button[disabled], .input[disabled], .taginput .taginput-container.is-focusable[disabled],\n  .textarea[disabled], .select select[disabled], .file-cta[disabled],\n  .file-name[disabled], .pagination-previous[disabled],\n  .pagination-next[disabled],\n  .pagination-link[disabled],\n  .pagination-ellipsis[disabled] {\n    cursor: not-allowed;\n}\n\n/*! bulma.io v0.7.2 | MIT License | github.com/jgthms/bulma */\n@keyframes spinAround {\nfrom {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n}\nto {\n    -webkit-transform: rotate(359deg);\n            transform: rotate(359deg);\n}\n}\n.delete, .modal-close, .is-unselectable, .button, .file, .breadcrumb, .pagination-previous,\n.pagination-next,\n.pagination-link,\n.pagination-ellipsis, .tabs {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.select:not(.is-multiple):not(.is-loading)::after, .navbar-link:not(.is-arrowless)::after {\n  border: 3px solid transparent;\n  border-radius: 2px;\n  border-right: 0;\n  border-top: 0;\n  content: \" \";\n  display: block;\n  height: 0.625em;\n  margin-top: -0.4375em;\n  pointer-events: none;\n  position: absolute;\n  top: 50%;\n  -webkit-transform: rotate(-45deg);\n          transform: rotate(-45deg);\n  -webkit-transform-origin: center;\n          transform-origin: center;\n  width: 0.625em;\n}\n.box:not(:last-child), .content:not(:last-child), .notification:not(:last-child), .progress:not(:last-child), .table:not(:last-child), .table-container:not(:last-child), .title:not(:last-child),\n.subtitle:not(:last-child), .block:not(:last-child), .highlight:not(:last-child), .breadcrumb:not(:last-child), .level:not(:last-child), .list:not(:last-child), .message:not(:last-child), .tabs:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.delete, .modal-close {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  background-color: rgba(10, 10, 10, 0.2);\n  border: none;\n  border-radius: 290486px;\n  cursor: pointer;\n  pointer-events: auto;\n  display: inline-block;\n  -webkit-box-flex: 0;\n      -ms-flex-positive: 0;\n          flex-grow: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n  font-size: 0;\n  height: 20px;\n  max-height: 20px;\n  max-width: 20px;\n  min-height: 20px;\n  min-width: 20px;\n  outline: none;\n  position: relative;\n  vertical-align: top;\n  width: 20px;\n}\n.delete::before, .modal-close::before, .delete::after, .modal-close::after {\n    background-color: white;\n    content: \"\";\n    display: block;\n    left: 50%;\n    position: absolute;\n    top: 50%;\n    -webkit-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n            transform: translateX(-50%) translateY(-50%) rotate(45deg);\n    -webkit-transform-origin: center center;\n            transform-origin: center center;\n}\n.delete::before, .modal-close::before {\n    height: 2px;\n    width: 50%;\n}\n.delete::after, .modal-close::after {\n    height: 50%;\n    width: 2px;\n}\n.delete:hover, .modal-close:hover, .delete:focus, .modal-close:focus {\n    background-color: rgba(10, 10, 10, 0.3);\n}\n.delete:active, .modal-close:active {\n    background-color: rgba(10, 10, 10, 0.4);\n}\n.is-small.delete, .is-small.modal-close {\n    height: 16px;\n    max-height: 16px;\n    max-width: 16px;\n    min-height: 16px;\n    min-width: 16px;\n    width: 16px;\n}\n.is-medium.delete, .is-medium.modal-close {\n    height: 24px;\n    max-height: 24px;\n    max-width: 24px;\n    min-height: 24px;\n    min-width: 24px;\n    width: 24px;\n}\n.is-large.delete, .is-large.modal-close {\n    height: 32px;\n    max-height: 32px;\n    max-width: 32px;\n    min-height: 32px;\n    min-width: 32px;\n    width: 32px;\n}\n.button.is-loading::after, .select.is-loading::after, .control.is-loading::after, .loader {\n  -webkit-animation: spinAround 500ms infinite linear;\n          animation: spinAround 500ms infinite linear;\n  border: 2px solid #dbdbdb;\n  border-radius: 290486px;\n  border-right-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  display: block;\n  height: 1em;\n  position: relative;\n  width: 1em;\n}\n.is-overlay, .image.is-square img, .image.is-1by1 img, .image.is-5by4 img, .image.is-4by3 img, .image.is-3by2 img, .image.is-5by3 img, .image.is-16by9 img, .image.is-2by1 img, .image.is-3by1 img, .image.is-4by5 img, .image.is-3by4 img, .image.is-2by3 img, .image.is-3by5 img, .image.is-9by16 img, .image.is-1by2 img, .image.is-1by3 img, .modal, .modal-background, .hero-video {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n.button, .input, .taginput .taginput-container.is-focusable,\n.textarea, .select select, .file-cta,\n.file-name, .pagination-previous,\n.pagination-next,\n.pagination-link,\n.pagination-ellipsis {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 1rem;\n  height: 2.25em;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  line-height: 1.5;\n  padding-bottom: calc(0.375em - 1px);\n  padding-left: calc(0.625em - 1px);\n  padding-right: calc(0.625em - 1px);\n  padding-top: calc(0.375em - 1px);\n  position: relative;\n  vertical-align: top;\n}\n.button:focus, .input:focus, .taginput .taginput-container.is-focusable:focus,\n  .textarea:focus, .select select:focus, .file-cta:focus,\n  .file-name:focus, .pagination-previous:focus,\n  .pagination-next:focus,\n  .pagination-link:focus,\n  .pagination-ellipsis:focus, .is-focused.button, .is-focused.input, .taginput .is-focused.taginput-container.is-focusable,\n  .is-focused.textarea, .select select.is-focused, .is-focused.file-cta,\n  .is-focused.file-name, .is-focused.pagination-previous,\n  .is-focused.pagination-next,\n  .is-focused.pagination-link,\n  .is-focused.pagination-ellipsis, .button:active, .input:active, .taginput .taginput-container.is-focusable:active,\n  .textarea:active, .select select:active, .file-cta:active,\n  .file-name:active, .pagination-previous:active,\n  .pagination-next:active,\n  .pagination-link:active,\n  .pagination-ellipsis:active, .is-active.button, .is-active.input, .taginput .is-active.taginput-container.is-focusable,\n  .is-active.textarea, .select select.is-active, .is-active.file-cta,\n  .is-active.file-name, .is-active.pagination-previous,\n  .is-active.pagination-next,\n  .is-active.pagination-link,\n  .is-active.pagination-ellipsis {\n    outline: none;\n}\n.button[disabled], .input[disabled], .taginput .taginput-container.is-focusable[disabled],\n  .textarea[disabled], .select select[disabled], .file-cta[disabled],\n  .file-name[disabled], .pagination-previous[disabled],\n  .pagination-next[disabled],\n  .pagination-link[disabled],\n  .pagination-ellipsis[disabled] {\n    cursor: not-allowed;\n}\n\n/*! minireset.css v0.0.3 | MIT License | github.com/jgthms/minireset.css */\nhtml,\nbody,\np,\nol,\nul,\nli,\ndl,\ndt,\ndd,\nblockquote,\nfigure,\nfieldset,\nlegend,\ntextarea,\npre,\niframe,\nhr,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  margin: 0;\n  padding: 0;\n}\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: 100%;\n  font-weight: normal;\n}\nul {\n  list-style: none;\n}\nbutton,\ninput,\nselect,\ntextarea {\n  margin: 0;\n}\nhtml {\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n}\n*, *::before, *::after {\n  -webkit-box-sizing: inherit;\n          box-sizing: inherit;\n}\nimg,\naudio,\nvideo {\n  height: auto;\n  max-width: 100%;\n}\niframe {\n  border: 0;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\ntd,\nth {\n  padding: 0;\n  text-align: left;\n}\nhtml {\n  background-color: white;\n  font-size: 16px;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  min-width: 300px;\n  overflow-x: hidden;\n  overflow-y: scroll;\n  text-rendering: optimizeLegibility;\n  -webkit-text-size-adjust: 100%;\n     -moz-text-size-adjust: 100%;\n      -ms-text-size-adjust: 100%;\n          text-size-adjust: 100%;\n}\narticle,\naside,\nfigure,\nfooter,\nheader,\nhgroup,\nsection {\n  display: block;\n}\nbody,\nbutton,\ninput,\nselect,\ntextarea {\n  font-family: BlinkMacSystemFont, -apple-system, \"Segoe UI\", \"Roboto\", \"Oxygen\", \"Ubuntu\", \"Cantarell\", \"Fira Sans\", \"Droid Sans\", \"Helvetica Neue\", \"Helvetica\", \"Arial\", sans-serif;\n}\ncode,\npre {\n  -moz-osx-font-smoothing: auto;\n  -webkit-font-smoothing: auto;\n  font-family: monospace;\n}\nbody {\n  color: #4a4a4a;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n}\na {\n  color: #00d1b2;\n  cursor: pointer;\n  text-decoration: none;\n}\na strong {\n    color: currentColor;\n}\na:hover {\n    color: #363636;\n}\ncode {\n  background-color: whitesmoke;\n  color: #ff3860;\n  font-size: 0.875em;\n  font-weight: normal;\n  padding: 0.25em 0.5em 0.25em;\n}\nhr {\n  background-color: whitesmoke;\n  border: none;\n  display: block;\n  height: 2px;\n  margin: 1.5rem 0;\n}\nimg {\n  height: auto;\n  max-width: 100%;\n}\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  vertical-align: baseline;\n}\nsmall {\n  font-size: 0.875em;\n}\nspan {\n  font-style: inherit;\n  font-weight: inherit;\n}\nstrong {\n  color: #363636;\n  font-weight: 700;\n}\npre {\n  -webkit-overflow-scrolling: touch;\n  background-color: whitesmoke;\n  color: #4a4a4a;\n  font-size: 0.875em;\n  overflow-x: auto;\n  padding: 1.25rem 1.5rem;\n  white-space: pre;\n  word-wrap: normal;\n}\npre code {\n    background-color: transparent;\n    color: currentColor;\n    font-size: 1em;\n    padding: 0;\n}\ntable td,\ntable th {\n  text-align: left;\n  vertical-align: top;\n}\ntable th {\n  color: #363636;\n}\n.is-clearfix::after {\n  clear: both;\n  content: \" \";\n  display: table;\n}\n.is-pulled-left {\n  float: left !important;\n}\n.is-pulled-right {\n  float: right !important;\n}\n.is-clipped {\n  overflow: hidden !important;\n}\n.is-size-1 {\n  font-size: 3rem !important;\n}\n.is-size-2 {\n  font-size: 2.5rem !important;\n}\n.is-size-3 {\n  font-size: 2rem !important;\n}\n.is-size-4 {\n  font-size: 1.5rem !important;\n}\n.is-size-5 {\n  font-size: 1.25rem !important;\n}\n.is-size-6 {\n  font-size: 1rem !important;\n}\n.is-size-7 {\n  font-size: 0.75rem !important;\n}\n@media screen and (max-width: 768px) {\n.is-size-1-mobile {\n    font-size: 3rem !important;\n}\n.is-size-2-mobile {\n    font-size: 2.5rem !important;\n}\n.is-size-3-mobile {\n    font-size: 2rem !important;\n}\n.is-size-4-mobile {\n    font-size: 1.5rem !important;\n}\n.is-size-5-mobile {\n    font-size: 1.25rem !important;\n}\n.is-size-6-mobile {\n    font-size: 1rem !important;\n}\n.is-size-7-mobile {\n    font-size: 0.75rem !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.is-size-1-tablet {\n    font-size: 3rem !important;\n}\n.is-size-2-tablet {\n    font-size: 2.5rem !important;\n}\n.is-size-3-tablet {\n    font-size: 2rem !important;\n}\n.is-size-4-tablet {\n    font-size: 1.5rem !important;\n}\n.is-size-5-tablet {\n    font-size: 1.25rem !important;\n}\n.is-size-6-tablet {\n    font-size: 1rem !important;\n}\n.is-size-7-tablet {\n    font-size: 0.75rem !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.is-size-1-touch {\n    font-size: 3rem !important;\n}\n.is-size-2-touch {\n    font-size: 2.5rem !important;\n}\n.is-size-3-touch {\n    font-size: 2rem !important;\n}\n.is-size-4-touch {\n    font-size: 1.5rem !important;\n}\n.is-size-5-touch {\n    font-size: 1.25rem !important;\n}\n.is-size-6-touch {\n    font-size: 1rem !important;\n}\n.is-size-7-touch {\n    font-size: 0.75rem !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.is-size-1-desktop {\n    font-size: 3rem !important;\n}\n.is-size-2-desktop {\n    font-size: 2.5rem !important;\n}\n.is-size-3-desktop {\n    font-size: 2rem !important;\n}\n.is-size-4-desktop {\n    font-size: 1.5rem !important;\n}\n.is-size-5-desktop {\n    font-size: 1.25rem !important;\n}\n.is-size-6-desktop {\n    font-size: 1rem !important;\n}\n.is-size-7-desktop {\n    font-size: 0.75rem !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.is-size-1-widescreen {\n    font-size: 3rem !important;\n}\n.is-size-2-widescreen {\n    font-size: 2.5rem !important;\n}\n.is-size-3-widescreen {\n    font-size: 2rem !important;\n}\n.is-size-4-widescreen {\n    font-size: 1.5rem !important;\n}\n.is-size-5-widescreen {\n    font-size: 1.25rem !important;\n}\n.is-size-6-widescreen {\n    font-size: 1rem !important;\n}\n.is-size-7-widescreen {\n    font-size: 0.75rem !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.is-size-1-fullhd {\n    font-size: 3rem !important;\n}\n.is-size-2-fullhd {\n    font-size: 2.5rem !important;\n}\n.is-size-3-fullhd {\n    font-size: 2rem !important;\n}\n.is-size-4-fullhd {\n    font-size: 1.5rem !important;\n}\n.is-size-5-fullhd {\n    font-size: 1.25rem !important;\n}\n.is-size-6-fullhd {\n    font-size: 1rem !important;\n}\n.is-size-7-fullhd {\n    font-size: 0.75rem !important;\n}\n}\n.has-text-centered {\n  text-align: center !important;\n}\n.has-text-justified {\n  text-align: justify !important;\n}\n.has-text-left {\n  text-align: left !important;\n}\n.has-text-right {\n  text-align: right !important;\n}\n@media screen and (max-width: 768px) {\n.has-text-centered-mobile {\n    text-align: center !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.has-text-centered-tablet {\n    text-align: center !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.has-text-centered-tablet-only {\n    text-align: center !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.has-text-centered-touch {\n    text-align: center !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.has-text-centered-desktop {\n    text-align: center !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.has-text-centered-desktop-only {\n    text-align: center !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.has-text-centered-widescreen {\n    text-align: center !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.has-text-centered-widescreen-only {\n    text-align: center !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.has-text-centered-fullhd {\n    text-align: center !important;\n}\n}\n@media screen and (max-width: 768px) {\n.has-text-justified-mobile {\n    text-align: justify !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.has-text-justified-tablet {\n    text-align: justify !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.has-text-justified-tablet-only {\n    text-align: justify !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.has-text-justified-touch {\n    text-align: justify !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.has-text-justified-desktop {\n    text-align: justify !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.has-text-justified-desktop-only {\n    text-align: justify !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.has-text-justified-widescreen {\n    text-align: justify !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.has-text-justified-widescreen-only {\n    text-align: justify !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.has-text-justified-fullhd {\n    text-align: justify !important;\n}\n}\n@media screen and (max-width: 768px) {\n.has-text-left-mobile {\n    text-align: left !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.has-text-left-tablet {\n    text-align: left !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.has-text-left-tablet-only {\n    text-align: left !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.has-text-left-touch {\n    text-align: left !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.has-text-left-desktop {\n    text-align: left !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.has-text-left-desktop-only {\n    text-align: left !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.has-text-left-widescreen {\n    text-align: left !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.has-text-left-widescreen-only {\n    text-align: left !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.has-text-left-fullhd {\n    text-align: left !important;\n}\n}\n@media screen and (max-width: 768px) {\n.has-text-right-mobile {\n    text-align: right !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.has-text-right-tablet {\n    text-align: right !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.has-text-right-tablet-only {\n    text-align: right !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.has-text-right-touch {\n    text-align: right !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.has-text-right-desktop {\n    text-align: right !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.has-text-right-desktop-only {\n    text-align: right !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.has-text-right-widescreen {\n    text-align: right !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.has-text-right-widescreen-only {\n    text-align: right !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.has-text-right-fullhd {\n    text-align: right !important;\n}\n}\n.is-capitalized {\n  text-transform: capitalize !important;\n}\n.is-lowercase {\n  text-transform: lowercase !important;\n}\n.is-uppercase {\n  text-transform: uppercase !important;\n}\n.is-italic {\n  font-style: italic !important;\n}\n.has-text-white {\n  color: white !important;\n}\na.has-text-white:hover, a.has-text-white:focus {\n  color: #e6e6e6 !important;\n}\n.has-background-white {\n  background-color: white !important;\n}\n.has-text-black {\n  color: #0a0a0a !important;\n}\na.has-text-black:hover, a.has-text-black:focus {\n  color: black !important;\n}\n.has-background-black {\n  background-color: #0a0a0a !important;\n}\n.has-text-light {\n  color: whitesmoke !important;\n}\na.has-text-light:hover, a.has-text-light:focus {\n  color: #dbdbdb !important;\n}\n.has-background-light {\n  background-color: whitesmoke !important;\n}\n.has-text-dark {\n  color: #0a0a0a !important;\n}\na.has-text-dark:hover, a.has-text-dark:focus {\n  color: black !important;\n}\n.has-background-dark {\n  background-color: #0a0a0a !important;\n}\n.has-text-primary {\n  color: #00d1b2 !important;\n}\na.has-text-primary:hover, a.has-text-primary:focus {\n  color: #009e86 !important;\n}\n.has-background-primary {\n  background-color: #00d1b2 !important;\n}\n.has-text-info {\n  color: #209cee !important;\n}\na.has-text-info:hover, a.has-text-info:focus {\n  color: #0f81cc !important;\n}\n.has-background-info {\n  background-color: #209cee !important;\n}\n.has-text-success {\n  color: #23d160 !important;\n}\na.has-text-success:hover, a.has-text-success:focus {\n  color: #1ca64c !important;\n}\n.has-background-success {\n  background-color: #23d160 !important;\n}\n.has-text-warning {\n  color: #ffdd57 !important;\n}\na.has-text-warning:hover, a.has-text-warning:focus {\n  color: #ffd324 !important;\n}\n.has-background-warning {\n  background-color: #ffdd57 !important;\n}\n.has-text-danger {\n  color: #ff3860 !important;\n}\na.has-text-danger:hover, a.has-text-danger:focus {\n  color: #ff0537 !important;\n}\n.has-background-danger {\n  background-color: #ff3860 !important;\n}\n.has-text-black-bis {\n  color: #121212 !important;\n}\n.has-background-black-bis {\n  background-color: #121212 !important;\n}\n.has-text-black-ter {\n  color: #242424 !important;\n}\n.has-background-black-ter {\n  background-color: #242424 !important;\n}\n.has-text-grey-darker {\n  color: #363636 !important;\n}\n.has-background-grey-darker {\n  background-color: #363636 !important;\n}\n.has-text-grey-dark {\n  color: #4a4a4a !important;\n}\n.has-background-grey-dark {\n  background-color: #4a4a4a !important;\n}\n.has-text-grey {\n  color: #7a7a7a !important;\n}\n.has-background-grey {\n  background-color: #7a7a7a !important;\n}\n.has-text-grey-light {\n  color: #b5b5b5 !important;\n}\n.has-background-grey-light {\n  background-color: #b5b5b5 !important;\n}\n.has-text-grey-lighter {\n  color: #dbdbdb !important;\n}\n.has-background-grey-lighter {\n  background-color: #dbdbdb !important;\n}\n.has-text-white-ter {\n  color: whitesmoke !important;\n}\n.has-background-white-ter {\n  background-color: whitesmoke !important;\n}\n.has-text-white-bis {\n  color: #fafafa !important;\n}\n.has-background-white-bis {\n  background-color: #fafafa !important;\n}\n.has-text-weight-light {\n  font-weight: 300 !important;\n}\n.has-text-weight-normal {\n  font-weight: 400 !important;\n}\n.has-text-weight-semibold {\n  font-weight: 600 !important;\n}\n.has-text-weight-bold {\n  font-weight: 700 !important;\n}\n.is-block {\n  display: block !important;\n}\n@media screen and (max-width: 768px) {\n.is-block-mobile {\n    display: block !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.is-block-tablet {\n    display: block !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.is-block-tablet-only {\n    display: block !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.is-block-touch {\n    display: block !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.is-block-desktop {\n    display: block !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.is-block-desktop-only {\n    display: block !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.is-block-widescreen {\n    display: block !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.is-block-widescreen-only {\n    display: block !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.is-block-fullhd {\n    display: block !important;\n}\n}\n.is-flex {\n  display: -webkit-box !important;\n  display: -ms-flexbox !important;\n  display: flex !important;\n}\n@media screen and (max-width: 768px) {\n.is-flex-mobile {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.is-flex-tablet {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.is-flex-tablet-only {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.is-flex-touch {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.is-flex-desktop {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.is-flex-desktop-only {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.is-flex-widescreen {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.is-flex-widescreen-only {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.is-flex-fullhd {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n}\n.is-inline {\n  display: inline !important;\n}\n@media screen and (max-width: 768px) {\n.is-inline-mobile {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.is-inline-tablet {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.is-inline-tablet-only {\n    display: inline !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.is-inline-touch {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.is-inline-desktop {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.is-inline-desktop-only {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.is-inline-widescreen {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.is-inline-widescreen-only {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.is-inline-fullhd {\n    display: inline !important;\n}\n}\n.is-inline-block {\n  display: inline-block !important;\n}\n@media screen and (max-width: 768px) {\n.is-inline-block-mobile {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.is-inline-block-tablet {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.is-inline-block-tablet-only {\n    display: inline-block !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.is-inline-block-touch {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.is-inline-block-desktop {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.is-inline-block-desktop-only {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.is-inline-block-widescreen {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.is-inline-block-widescreen-only {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.is-inline-block-fullhd {\n    display: inline-block !important;\n}\n}\n.is-inline-flex {\n  display: -webkit-inline-box !important;\n  display: -ms-inline-flexbox !important;\n  display: inline-flex !important;\n}\n@media screen and (max-width: 768px) {\n.is-inline-flex-mobile {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.is-inline-flex-tablet {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.is-inline-flex-tablet-only {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.is-inline-flex-touch {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.is-inline-flex-desktop {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.is-inline-flex-desktop-only {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.is-inline-flex-widescreen {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.is-inline-flex-widescreen-only {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.is-inline-flex-fullhd {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n.is-hidden {\n  display: none !important;\n}\n.is-sr-only {\n  border: none !important;\n  clip: rect(0, 0, 0, 0) !important;\n  height: 0.01em !important;\n  overflow: hidden !important;\n  padding: 0 !important;\n  position: absolute !important;\n  white-space: nowrap !important;\n  width: 0.01em !important;\n}\n@media screen and (max-width: 768px) {\n.is-hidden-mobile {\n    display: none !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.is-hidden-tablet {\n    display: none !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.is-hidden-tablet-only {\n    display: none !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.is-hidden-touch {\n    display: none !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.is-hidden-desktop {\n    display: none !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.is-hidden-desktop-only {\n    display: none !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.is-hidden-widescreen {\n    display: none !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.is-hidden-widescreen-only {\n    display: none !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.is-hidden-fullhd {\n    display: none !important;\n}\n}\n.is-invisible {\n  visibility: hidden !important;\n}\n@media screen and (max-width: 768px) {\n.is-invisible-mobile {\n    visibility: hidden !important;\n}\n}\n@media screen and (min-width: 769px), print {\n.is-invisible-tablet {\n    visibility: hidden !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.is-invisible-tablet-only {\n    visibility: hidden !important;\n}\n}\n@media screen and (max-width: 1087px) {\n.is-invisible-touch {\n    visibility: hidden !important;\n}\n}\n@media screen and (min-width: 1088px) {\n.is-invisible-desktop {\n    visibility: hidden !important;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.is-invisible-desktop-only {\n    visibility: hidden !important;\n}\n}\n@media screen and (min-width: 1280px) {\n.is-invisible-widescreen {\n    visibility: hidden !important;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.is-invisible-widescreen-only {\n    visibility: hidden !important;\n}\n}\n@media screen and (min-width: 1472px) {\n.is-invisible-fullhd {\n    visibility: hidden !important;\n}\n}\n.is-marginless {\n  margin: 0 !important;\n}\n.is-paddingless {\n  padding: 0 !important;\n}\n.is-radiusless {\n  border-radius: 0 !important;\n}\n.is-shadowless {\n  -webkit-box-shadow: none !important;\n          box-shadow: none !important;\n}\n.box {\n  background-color: white;\n  border-radius: 6px;\n  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n          box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n  color: #4a4a4a;\n  display: block;\n  padding: 1.25rem;\n}\na.box:hover, a.box:focus {\n  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px #00d1b2;\n          box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px #00d1b2;\n}\na.box:active {\n  -webkit-box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2), 0 0 0 1px #00d1b2;\n          box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2), 0 0 0 1px #00d1b2;\n}\n.button {\n  background-color: white;\n  border-color: #dbdbdb;\n  border-width: 1px;\n  color: #363636;\n  cursor: pointer;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  padding-bottom: calc(0.375em - 1px);\n  padding-left: 0.75em;\n  padding-right: 0.75em;\n  padding-top: calc(0.375em - 1px);\n  text-align: center;\n  white-space: nowrap;\n}\n.button strong {\n    color: inherit;\n}\n.button .icon, .button .icon.is-small, .button .icon.is-medium, .button .icon.is-large {\n    height: 1.5em;\n    width: 1.5em;\n}\n.button .icon:first-child:not(:last-child) {\n    margin-left: calc(-0.375em - 1px);\n    margin-right: 0.1875em;\n}\n.button .icon:last-child:not(:first-child) {\n    margin-left: 0.1875em;\n    margin-right: calc(-0.375em - 1px);\n}\n.button .icon:first-child:last-child {\n    margin-left: calc(-0.375em - 1px);\n    margin-right: calc(-0.375em - 1px);\n}\n.button:hover, .button.is-hovered {\n    border-color: #b5b5b5;\n    color: #363636;\n}\n.button:focus, .button.is-focused {\n    border-color: #00d1b2;\n    color: #363636;\n}\n.button:focus:not(:active), .button.is-focused:not(:active) {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n}\n.button:active, .button.is-active {\n    border-color: #4a4a4a;\n    color: #363636;\n}\n.button.is-text {\n    background-color: transparent;\n    border-color: transparent;\n    color: #4a4a4a;\n    text-decoration: underline;\n}\n.button.is-text:hover, .button.is-text.is-hovered, .button.is-text:focus, .button.is-text.is-focused {\n      background-color: whitesmoke;\n      color: #363636;\n}\n.button.is-text:active, .button.is-text.is-active {\n      background-color: #e8e8e8;\n      color: #363636;\n}\n.button.is-text[disabled] {\n      background-color: transparent;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-white {\n    background-color: white;\n    border-color: transparent;\n    color: #0a0a0a;\n}\n.button.is-white:hover, .button.is-white.is-hovered {\n      background-color: #f9f9f9;\n      border-color: transparent;\n      color: #0a0a0a;\n}\n.button.is-white:focus, .button.is-white.is-focused {\n      border-color: transparent;\n      color: #0a0a0a;\n}\n.button.is-white:focus:not(:active), .button.is-white.is-focused:not(:active) {\n        -webkit-box-shadow: 0 0 0 0.125em rgba(255, 255, 255, 0.25);\n                box-shadow: 0 0 0 0.125em rgba(255, 255, 255, 0.25);\n}\n.button.is-white:active, .button.is-white.is-active {\n      background-color: #f2f2f2;\n      border-color: transparent;\n      color: #0a0a0a;\n}\n.button.is-white[disabled] {\n      background-color: white;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-white.is-inverted {\n      background-color: #0a0a0a;\n      color: white;\n}\n.button.is-white.is-inverted:hover {\n        background-color: black;\n}\n.button.is-white.is-inverted[disabled] {\n        background-color: #0a0a0a;\n        border-color: transparent;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: white;\n}\n.button.is-white.is-loading::after {\n      border-color: transparent transparent #0a0a0a #0a0a0a !important;\n}\n.button.is-white.is-outlined {\n      background-color: transparent;\n      border-color: white;\n      color: white;\n}\n.button.is-white.is-outlined:hover, .button.is-white.is-outlined:focus {\n        background-color: white;\n        border-color: white;\n        color: #0a0a0a;\n}\n.button.is-white.is-outlined.is-loading::after {\n        border-color: transparent transparent white white !important;\n}\n.button.is-white.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: white;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: white;\n}\n.button.is-white.is-inverted.is-outlined {\n      background-color: transparent;\n      border-color: #0a0a0a;\n      color: #0a0a0a;\n}\n.button.is-white.is-inverted.is-outlined:hover, .button.is-white.is-inverted.is-outlined:focus {\n        background-color: #0a0a0a;\n        color: white;\n}\n.button.is-white.is-inverted.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #0a0a0a;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #0a0a0a;\n}\n.button.is-black {\n    background-color: #0a0a0a;\n    border-color: transparent;\n    color: white;\n}\n.button.is-black:hover, .button.is-black.is-hovered {\n      background-color: #040404;\n      border-color: transparent;\n      color: white;\n}\n.button.is-black:focus, .button.is-black.is-focused {\n      border-color: transparent;\n      color: white;\n}\n.button.is-black:focus:not(:active), .button.is-black.is-focused:not(:active) {\n        -webkit-box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n                box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n}\n.button.is-black:active, .button.is-black.is-active {\n      background-color: black;\n      border-color: transparent;\n      color: white;\n}\n.button.is-black[disabled] {\n      background-color: #0a0a0a;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-black.is-inverted {\n      background-color: white;\n      color: #0a0a0a;\n}\n.button.is-black.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-black.is-inverted[disabled] {\n        background-color: white;\n        border-color: transparent;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #0a0a0a;\n}\n.button.is-black.is-loading::after {\n      border-color: transparent transparent white white !important;\n}\n.button.is-black.is-outlined {\n      background-color: transparent;\n      border-color: #0a0a0a;\n      color: #0a0a0a;\n}\n.button.is-black.is-outlined:hover, .button.is-black.is-outlined:focus {\n        background-color: #0a0a0a;\n        border-color: #0a0a0a;\n        color: white;\n}\n.button.is-black.is-outlined.is-loading::after {\n        border-color: transparent transparent #0a0a0a #0a0a0a !important;\n}\n.button.is-black.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #0a0a0a;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #0a0a0a;\n}\n.button.is-black.is-inverted.is-outlined {\n      background-color: transparent;\n      border-color: white;\n      color: white;\n}\n.button.is-black.is-inverted.is-outlined:hover, .button.is-black.is-inverted.is-outlined:focus {\n        background-color: white;\n        color: #0a0a0a;\n}\n.button.is-black.is-inverted.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: white;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: white;\n}\n.button.is-light {\n    background-color: whitesmoke;\n    border-color: transparent;\n    color: #363636;\n}\n.button.is-light:hover, .button.is-light.is-hovered {\n      background-color: #eeeeee;\n      border-color: transparent;\n      color: #363636;\n}\n.button.is-light:focus, .button.is-light.is-focused {\n      border-color: transparent;\n      color: #363636;\n}\n.button.is-light:focus:not(:active), .button.is-light.is-focused:not(:active) {\n        -webkit-box-shadow: 0 0 0 0.125em rgba(245, 245, 245, 0.25);\n                box-shadow: 0 0 0 0.125em rgba(245, 245, 245, 0.25);\n}\n.button.is-light:active, .button.is-light.is-active {\n      background-color: #e8e8e8;\n      border-color: transparent;\n      color: #363636;\n}\n.button.is-light[disabled] {\n      background-color: whitesmoke;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-light.is-inverted {\n      background-color: #363636;\n      color: whitesmoke;\n}\n.button.is-light.is-inverted:hover {\n        background-color: #292929;\n}\n.button.is-light.is-inverted[disabled] {\n        background-color: #363636;\n        border-color: transparent;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: whitesmoke;\n}\n.button.is-light.is-loading::after {\n      border-color: transparent transparent #363636 #363636 !important;\n}\n.button.is-light.is-outlined {\n      background-color: transparent;\n      border-color: whitesmoke;\n      color: whitesmoke;\n}\n.button.is-light.is-outlined:hover, .button.is-light.is-outlined:focus {\n        background-color: whitesmoke;\n        border-color: whitesmoke;\n        color: #363636;\n}\n.button.is-light.is-outlined.is-loading::after {\n        border-color: transparent transparent whitesmoke whitesmoke !important;\n}\n.button.is-light.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: whitesmoke;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: whitesmoke;\n}\n.button.is-light.is-inverted.is-outlined {\n      background-color: transparent;\n      border-color: #363636;\n      color: #363636;\n}\n.button.is-light.is-inverted.is-outlined:hover, .button.is-light.is-inverted.is-outlined:focus {\n        background-color: #363636;\n        color: whitesmoke;\n}\n.button.is-light.is-inverted.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #363636;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #363636;\n}\n.button.is-dark {\n    background-color: #0a0a0a;\n    border-color: transparent;\n    color: whitesmoke;\n}\n.button.is-dark:hover, .button.is-dark.is-hovered {\n      background-color: #040404;\n      border-color: transparent;\n      color: whitesmoke;\n}\n.button.is-dark:focus, .button.is-dark.is-focused {\n      border-color: transparent;\n      color: whitesmoke;\n}\n.button.is-dark:focus:not(:active), .button.is-dark.is-focused:not(:active) {\n        -webkit-box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n                box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n}\n.button.is-dark:active, .button.is-dark.is-active {\n      background-color: black;\n      border-color: transparent;\n      color: whitesmoke;\n}\n.button.is-dark[disabled] {\n      background-color: #0a0a0a;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-dark.is-inverted {\n      background-color: whitesmoke;\n      color: #0a0a0a;\n}\n.button.is-dark.is-inverted:hover {\n        background-color: #e8e8e8;\n}\n.button.is-dark.is-inverted[disabled] {\n        background-color: whitesmoke;\n        border-color: transparent;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #0a0a0a;\n}\n.button.is-dark.is-loading::after {\n      border-color: transparent transparent whitesmoke whitesmoke !important;\n}\n.button.is-dark.is-outlined {\n      background-color: transparent;\n      border-color: #0a0a0a;\n      color: #0a0a0a;\n}\n.button.is-dark.is-outlined:hover, .button.is-dark.is-outlined:focus {\n        background-color: #0a0a0a;\n        border-color: #0a0a0a;\n        color: whitesmoke;\n}\n.button.is-dark.is-outlined.is-loading::after {\n        border-color: transparent transparent #0a0a0a #0a0a0a !important;\n}\n.button.is-dark.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #0a0a0a;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #0a0a0a;\n}\n.button.is-dark.is-inverted.is-outlined {\n      background-color: transparent;\n      border-color: whitesmoke;\n      color: whitesmoke;\n}\n.button.is-dark.is-inverted.is-outlined:hover, .button.is-dark.is-inverted.is-outlined:focus {\n        background-color: whitesmoke;\n        color: #0a0a0a;\n}\n.button.is-dark.is-inverted.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: whitesmoke;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: whitesmoke;\n}\n.button.is-primary {\n    background-color: #00d1b2;\n    border-color: transparent;\n    color: #fff;\n}\n.button.is-primary:hover, .button.is-primary.is-hovered {\n      background-color: #00c4a7;\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-primary:focus, .button.is-primary.is-focused {\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-primary:focus:not(:active), .button.is-primary.is-focused:not(:active) {\n        -webkit-box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n                box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n}\n.button.is-primary:active, .button.is-primary.is-active {\n      background-color: #00b89c;\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-primary[disabled] {\n      background-color: #00d1b2;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-primary.is-inverted {\n      background-color: #fff;\n      color: #00d1b2;\n}\n.button.is-primary.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-primary.is-inverted[disabled] {\n        background-color: #fff;\n        border-color: transparent;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #00d1b2;\n}\n.button.is-primary.is-loading::after {\n      border-color: transparent transparent #fff #fff !important;\n}\n.button.is-primary.is-outlined {\n      background-color: transparent;\n      border-color: #00d1b2;\n      color: #00d1b2;\n}\n.button.is-primary.is-outlined:hover, .button.is-primary.is-outlined:focus {\n        background-color: #00d1b2;\n        border-color: #00d1b2;\n        color: #fff;\n}\n.button.is-primary.is-outlined.is-loading::after {\n        border-color: transparent transparent #00d1b2 #00d1b2 !important;\n}\n.button.is-primary.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #00d1b2;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #00d1b2;\n}\n.button.is-primary.is-inverted.is-outlined {\n      background-color: transparent;\n      border-color: #fff;\n      color: #fff;\n}\n.button.is-primary.is-inverted.is-outlined:hover, .button.is-primary.is-inverted.is-outlined:focus {\n        background-color: #fff;\n        color: #00d1b2;\n}\n.button.is-primary.is-inverted.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #fff;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #fff;\n}\n.button.is-info {\n    background-color: #209cee;\n    border-color: transparent;\n    color: #fff;\n}\n.button.is-info:hover, .button.is-info.is-hovered {\n      background-color: #1496ed;\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-info:focus, .button.is-info.is-focused {\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-info:focus:not(:active), .button.is-info.is-focused:not(:active) {\n        -webkit-box-shadow: 0 0 0 0.125em rgba(32, 156, 238, 0.25);\n                box-shadow: 0 0 0 0.125em rgba(32, 156, 238, 0.25);\n}\n.button.is-info:active, .button.is-info.is-active {\n      background-color: #118fe4;\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-info[disabled] {\n      background-color: #209cee;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-info.is-inverted {\n      background-color: #fff;\n      color: #209cee;\n}\n.button.is-info.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-info.is-inverted[disabled] {\n        background-color: #fff;\n        border-color: transparent;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #209cee;\n}\n.button.is-info.is-loading::after {\n      border-color: transparent transparent #fff #fff !important;\n}\n.button.is-info.is-outlined {\n      background-color: transparent;\n      border-color: #209cee;\n      color: #209cee;\n}\n.button.is-info.is-outlined:hover, .button.is-info.is-outlined:focus {\n        background-color: #209cee;\n        border-color: #209cee;\n        color: #fff;\n}\n.button.is-info.is-outlined.is-loading::after {\n        border-color: transparent transparent #209cee #209cee !important;\n}\n.button.is-info.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #209cee;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #209cee;\n}\n.button.is-info.is-inverted.is-outlined {\n      background-color: transparent;\n      border-color: #fff;\n      color: #fff;\n}\n.button.is-info.is-inverted.is-outlined:hover, .button.is-info.is-inverted.is-outlined:focus {\n        background-color: #fff;\n        color: #209cee;\n}\n.button.is-info.is-inverted.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #fff;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #fff;\n}\n.button.is-success {\n    background-color: #23d160;\n    border-color: transparent;\n    color: #fff;\n}\n.button.is-success:hover, .button.is-success.is-hovered {\n      background-color: #22c65b;\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-success:focus, .button.is-success.is-focused {\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-success:focus:not(:active), .button.is-success.is-focused:not(:active) {\n        -webkit-box-shadow: 0 0 0 0.125em rgba(35, 209, 96, 0.25);\n                box-shadow: 0 0 0 0.125em rgba(35, 209, 96, 0.25);\n}\n.button.is-success:active, .button.is-success.is-active {\n      background-color: #20bc56;\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-success[disabled] {\n      background-color: #23d160;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-success.is-inverted {\n      background-color: #fff;\n      color: #23d160;\n}\n.button.is-success.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-success.is-inverted[disabled] {\n        background-color: #fff;\n        border-color: transparent;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #23d160;\n}\n.button.is-success.is-loading::after {\n      border-color: transparent transparent #fff #fff !important;\n}\n.button.is-success.is-outlined {\n      background-color: transparent;\n      border-color: #23d160;\n      color: #23d160;\n}\n.button.is-success.is-outlined:hover, .button.is-success.is-outlined:focus {\n        background-color: #23d160;\n        border-color: #23d160;\n        color: #fff;\n}\n.button.is-success.is-outlined.is-loading::after {\n        border-color: transparent transparent #23d160 #23d160 !important;\n}\n.button.is-success.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #23d160;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #23d160;\n}\n.button.is-success.is-inverted.is-outlined {\n      background-color: transparent;\n      border-color: #fff;\n      color: #fff;\n}\n.button.is-success.is-inverted.is-outlined:hover, .button.is-success.is-inverted.is-outlined:focus {\n        background-color: #fff;\n        color: #23d160;\n}\n.button.is-success.is-inverted.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #fff;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #fff;\n}\n.button.is-warning {\n    background-color: #ffdd57;\n    border-color: transparent;\n    color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning:hover, .button.is-warning.is-hovered {\n      background-color: #ffdb4a;\n      border-color: transparent;\n      color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning:focus, .button.is-warning.is-focused {\n      border-color: transparent;\n      color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning:focus:not(:active), .button.is-warning.is-focused:not(:active) {\n        -webkit-box-shadow: 0 0 0 0.125em rgba(255, 221, 87, 0.25);\n                box-shadow: 0 0 0 0.125em rgba(255, 221, 87, 0.25);\n}\n.button.is-warning:active, .button.is-warning.is-active {\n      background-color: #ffd83d;\n      border-color: transparent;\n      color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning[disabled] {\n      background-color: #ffdd57;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-warning.is-inverted {\n      background-color: rgba(0, 0, 0, 0.7);\n      color: #ffdd57;\n}\n.button.is-warning.is-inverted:hover {\n        background-color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning.is-inverted[disabled] {\n        background-color: rgba(0, 0, 0, 0.7);\n        border-color: transparent;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #ffdd57;\n}\n.button.is-warning.is-loading::after {\n      border-color: transparent transparent rgba(0, 0, 0, 0.7) rgba(0, 0, 0, 0.7) !important;\n}\n.button.is-warning.is-outlined {\n      background-color: transparent;\n      border-color: #ffdd57;\n      color: #ffdd57;\n}\n.button.is-warning.is-outlined:hover, .button.is-warning.is-outlined:focus {\n        background-color: #ffdd57;\n        border-color: #ffdd57;\n        color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning.is-outlined.is-loading::after {\n        border-color: transparent transparent #ffdd57 #ffdd57 !important;\n}\n.button.is-warning.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #ffdd57;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #ffdd57;\n}\n.button.is-warning.is-inverted.is-outlined {\n      background-color: transparent;\n      border-color: rgba(0, 0, 0, 0.7);\n      color: rgba(0, 0, 0, 0.7);\n}\n.button.is-warning.is-inverted.is-outlined:hover, .button.is-warning.is-inverted.is-outlined:focus {\n        background-color: rgba(0, 0, 0, 0.7);\n        color: #ffdd57;\n}\n.button.is-warning.is-inverted.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: rgba(0, 0, 0, 0.7);\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: rgba(0, 0, 0, 0.7);\n}\n.button.is-danger {\n    background-color: #ff3860;\n    border-color: transparent;\n    color: #fff;\n}\n.button.is-danger:hover, .button.is-danger.is-hovered {\n      background-color: #ff2b56;\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-danger:focus, .button.is-danger.is-focused {\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-danger:focus:not(:active), .button.is-danger.is-focused:not(:active) {\n        -webkit-box-shadow: 0 0 0 0.125em rgba(255, 56, 96, 0.25);\n                box-shadow: 0 0 0 0.125em rgba(255, 56, 96, 0.25);\n}\n.button.is-danger:active, .button.is-danger.is-active {\n      background-color: #ff1f4b;\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-danger[disabled] {\n      background-color: #ff3860;\n      border-color: transparent;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.button.is-danger.is-inverted {\n      background-color: #fff;\n      color: #ff3860;\n}\n.button.is-danger.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-danger.is-inverted[disabled] {\n        background-color: #fff;\n        border-color: transparent;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #ff3860;\n}\n.button.is-danger.is-loading::after {\n      border-color: transparent transparent #fff #fff !important;\n}\n.button.is-danger.is-outlined {\n      background-color: transparent;\n      border-color: #ff3860;\n      color: #ff3860;\n}\n.button.is-danger.is-outlined:hover, .button.is-danger.is-outlined:focus {\n        background-color: #ff3860;\n        border-color: #ff3860;\n        color: #fff;\n}\n.button.is-danger.is-outlined.is-loading::after {\n        border-color: transparent transparent #ff3860 #ff3860 !important;\n}\n.button.is-danger.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #ff3860;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #ff3860;\n}\n.button.is-danger.is-inverted.is-outlined {\n      background-color: transparent;\n      border-color: #fff;\n      color: #fff;\n}\n.button.is-danger.is-inverted.is-outlined:hover, .button.is-danger.is-inverted.is-outlined:focus {\n        background-color: #fff;\n        color: #ff3860;\n}\n.button.is-danger.is-inverted.is-outlined[disabled] {\n        background-color: transparent;\n        border-color: #fff;\n        -webkit-box-shadow: none;\n                box-shadow: none;\n        color: #fff;\n}\n.button.is-small {\n    border-radius: 2px;\n    font-size: 0.75rem;\n}\n.button.is-medium {\n    font-size: 1.25rem;\n}\n.button.is-large {\n    font-size: 1.5rem;\n}\n.button[disabled] {\n    background-color: white;\n    border-color: #dbdbdb;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    opacity: 0.5;\n}\n.button.is-fullwidth {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    width: 100%;\n}\n.button.is-loading {\n    color: transparent !important;\n    pointer-events: none;\n}\n.button.is-loading::after {\n      position: absolute;\n      left: calc(50% - (1em / 2));\n      top: calc(50% - (1em / 2));\n      position: absolute !important;\n}\n.button.is-static {\n    background-color: whitesmoke;\n    border-color: #dbdbdb;\n    color: #7a7a7a;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    pointer-events: none;\n}\n.button.is-rounded {\n    border-radius: 290486px;\n    padding-left: 1em;\n    padding-right: 1em;\n}\n.buttons {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n}\n.buttons .button {\n    margin-bottom: 0.5rem;\n}\n.buttons .button:not(:last-child):not(.is-fullwidth) {\n      margin-right: 0.5rem;\n}\n.buttons:last-child {\n    margin-bottom: -0.5rem;\n}\n.buttons:not(:last-child) {\n    margin-bottom: 1rem;\n}\n.buttons.has-addons .button:not(:first-child) {\n    border-bottom-left-radius: 0;\n    border-top-left-radius: 0;\n}\n.buttons.has-addons .button:not(:last-child) {\n    border-bottom-right-radius: 0;\n    border-top-right-radius: 0;\n    margin-right: -1px;\n}\n.buttons.has-addons .button:last-child {\n    margin-right: 0;\n}\n.buttons.has-addons .button:hover, .buttons.has-addons .button.is-hovered {\n    z-index: 2;\n}\n.buttons.has-addons .button:focus, .buttons.has-addons .button.is-focused, .buttons.has-addons .button:active, .buttons.has-addons .button.is-active, .buttons.has-addons .button.is-selected {\n    z-index: 3;\n}\n.buttons.has-addons .button:focus:hover, .buttons.has-addons .button.is-focused:hover, .buttons.has-addons .button:active:hover, .buttons.has-addons .button.is-active:hover, .buttons.has-addons .button.is-selected:hover {\n      z-index: 4;\n}\n.buttons.has-addons .button.is-expanded {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n}\n.buttons.is-centered {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.buttons.is-right {\n    -webkit-box-pack: end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n}\n.container {\n  margin: 0 auto;\n  position: relative;\n}\n@media screen and (min-width: 1088px) {\n.container {\n      max-width: 960px;\n      width: 960px;\n}\n.container.is-fluid {\n        margin-left: 64px;\n        margin-right: 64px;\n        max-width: none;\n        width: auto;\n}\n}\n@media screen and (max-width: 1279px) {\n.container.is-widescreen {\n      max-width: 1152px;\n      width: auto;\n}\n}\n@media screen and (max-width: 1471px) {\n.container.is-fullhd {\n      max-width: 1344px;\n      width: auto;\n}\n}\n@media screen and (min-width: 1280px) {\n.container {\n      max-width: 1152px;\n      width: 1152px;\n}\n}\n@media screen and (min-width: 1472px) {\n.container {\n      max-width: 1344px;\n      width: 1344px;\n}\n}\n.content li + li {\n  margin-top: 0.25em;\n}\n.content p:not(:last-child),\n.content dl:not(:last-child),\n.content ol:not(:last-child),\n.content ul:not(:last-child),\n.content blockquote:not(:last-child),\n.content pre:not(:last-child),\n.content table:not(:last-child) {\n  margin-bottom: 1em;\n}\n.content h1,\n.content h2,\n.content h3,\n.content h4,\n.content h5,\n.content h6 {\n  color: #363636;\n  font-weight: 600;\n  line-height: 1.125;\n}\n.content h1 {\n  font-size: 2em;\n  margin-bottom: 0.5em;\n}\n.content h1:not(:first-child) {\n    margin-top: 1em;\n}\n.content h2 {\n  font-size: 1.75em;\n  margin-bottom: 0.5714em;\n}\n.content h2:not(:first-child) {\n    margin-top: 1.1428em;\n}\n.content h3 {\n  font-size: 1.5em;\n  margin-bottom: 0.6666em;\n}\n.content h3:not(:first-child) {\n    margin-top: 1.3333em;\n}\n.content h4 {\n  font-size: 1.25em;\n  margin-bottom: 0.8em;\n}\n.content h5 {\n  font-size: 1.125em;\n  margin-bottom: 0.8888em;\n}\n.content h6 {\n  font-size: 1em;\n  margin-bottom: 1em;\n}\n.content blockquote {\n  background-color: whitesmoke;\n  border-left: 5px solid #dbdbdb;\n  padding: 1.25em 1.5em;\n}\n.content ol {\n  list-style-position: outside;\n  margin-left: 2em;\n  margin-top: 1em;\n}\n.content ol:not([type]) {\n    list-style-type: decimal;\n}\n.content ol:not([type]).is-lower-alpha {\n      list-style-type: lower-alpha;\n}\n.content ol:not([type]).is-lower-roman {\n      list-style-type: lower-roman;\n}\n.content ol:not([type]).is-upper-alpha {\n      list-style-type: upper-alpha;\n}\n.content ol:not([type]).is-upper-roman {\n      list-style-type: upper-roman;\n}\n.content ul {\n  list-style: disc outside;\n  margin-left: 2em;\n  margin-top: 1em;\n}\n.content ul ul {\n    list-style-type: circle;\n    margin-top: 0.5em;\n}\n.content ul ul ul {\n      list-style-type: square;\n}\n.content dd {\n  margin-left: 2em;\n}\n.content figure {\n  margin-left: 2em;\n  margin-right: 2em;\n  text-align: center;\n}\n.content figure:not(:first-child) {\n    margin-top: 2em;\n}\n.content figure:not(:last-child) {\n    margin-bottom: 2em;\n}\n.content figure img {\n    display: inline-block;\n}\n.content figure figcaption {\n    font-style: italic;\n}\n.content pre {\n  -webkit-overflow-scrolling: touch;\n  overflow-x: auto;\n  padding: 1.25em 1.5em;\n  white-space: pre;\n  word-wrap: normal;\n}\n.content sup,\n.content sub {\n  font-size: 75%;\n}\n.content table {\n  width: 100%;\n}\n.content table td,\n  .content table th {\n    border: 1px solid #dbdbdb;\n    border-width: 0 0 1px;\n    padding: 0.5em 0.75em;\n    vertical-align: top;\n}\n.content table th {\n    color: #363636;\n    text-align: left;\n}\n.content table thead td,\n  .content table thead th {\n    border-width: 0 0 2px;\n    color: #363636;\n}\n.content table tfoot td,\n  .content table tfoot th {\n    border-width: 2px 0 0;\n    color: #363636;\n}\n.content table tbody tr:last-child td,\n  .content table tbody tr:last-child th {\n    border-bottom-width: 0;\n}\n.content.is-small {\n  font-size: 0.75rem;\n}\n.content.is-medium {\n  font-size: 1.25rem;\n}\n.content.is-large {\n  font-size: 1.5rem;\n}\n.input, .taginput .taginput-container.is-focusable,\n.textarea {\n  background-color: white;\n  border-color: #dbdbdb;\n  color: #363636;\n  -webkit-box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);\n          box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);\n  max-width: 100%;\n  width: 100%;\n}\n.input::-moz-placeholder, .taginput .taginput-container.is-focusable::-moz-placeholder,\n  .textarea::-moz-placeholder {\n    color: rgba(54, 54, 54, 0.3);\n}\n.input::-webkit-input-placeholder, .taginput .taginput-container.is-focusable::-webkit-input-placeholder,\n  .textarea::-webkit-input-placeholder {\n    color: rgba(54, 54, 54, 0.3);\n}\n.input:-moz-placeholder, .taginput .taginput-container.is-focusable:-moz-placeholder,\n  .textarea:-moz-placeholder {\n    color: rgba(54, 54, 54, 0.3);\n}\n.input:-ms-input-placeholder, .taginput .taginput-container.is-focusable:-ms-input-placeholder,\n  .textarea:-ms-input-placeholder {\n    color: rgba(54, 54, 54, 0.3);\n}\n.input:hover, .taginput .taginput-container.is-focusable:hover, .input.is-hovered, .taginput .is-hovered.taginput-container.is-focusable,\n  .textarea:hover,\n  .textarea.is-hovered {\n    border-color: #b5b5b5;\n}\n.input:focus, .taginput .taginput-container.is-focusable:focus, .input.is-focused, .taginput .is-focused.taginput-container.is-focusable, .input:active, .taginput .taginput-container.is-focusable:active, .input.is-active, .taginput .is-active.taginput-container.is-focusable,\n  .textarea:focus,\n  .textarea.is-focused,\n  .textarea:active,\n  .textarea.is-active {\n    border-color: #00d1b2;\n    -webkit-box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n            box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n}\n.input[disabled], .taginput .taginput-container.is-focusable[disabled],\n  .textarea[disabled] {\n    background-color: whitesmoke;\n    border-color: whitesmoke;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    color: #7a7a7a;\n}\n.input[disabled]::-moz-placeholder, .taginput .taginput-container.is-focusable[disabled]::-moz-placeholder,\n    .textarea[disabled]::-moz-placeholder {\n      color: rgba(122, 122, 122, 0.3);\n}\n.input[disabled]::-webkit-input-placeholder, .taginput .taginput-container.is-focusable[disabled]::-webkit-input-placeholder,\n    .textarea[disabled]::-webkit-input-placeholder {\n      color: rgba(122, 122, 122, 0.3);\n}\n.input[disabled]:-moz-placeholder, .taginput .taginput-container.is-focusable[disabled]:-moz-placeholder,\n    .textarea[disabled]:-moz-placeholder {\n      color: rgba(122, 122, 122, 0.3);\n}\n.input[disabled]:-ms-input-placeholder, .taginput .taginput-container.is-focusable[disabled]:-ms-input-placeholder,\n    .textarea[disabled]:-ms-input-placeholder {\n      color: rgba(122, 122, 122, 0.3);\n}\n.input[readonly], .taginput .taginput-container.is-focusable[readonly],\n  .textarea[readonly] {\n    -webkit-box-shadow: none;\n            box-shadow: none;\n}\n.input.is-white, .taginput .is-white.taginput-container.is-focusable,\n  .textarea.is-white {\n    border-color: white;\n}\n.input.is-white:focus, .taginput .is-white.taginput-container.is-focusable:focus, .input.is-white.is-focused, .taginput .is-white.is-focused.taginput-container.is-focusable, .input.is-white:active, .taginput .is-white.taginput-container.is-focusable:active, .input.is-white.is-active, .taginput .is-white.is-active.taginput-container.is-focusable,\n    .textarea.is-white:focus,\n    .textarea.is-white.is-focused,\n    .textarea.is-white:active,\n    .textarea.is-white.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(255, 255, 255, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(255, 255, 255, 0.25);\n}\n.input.is-black, .taginput .is-black.taginput-container.is-focusable,\n  .textarea.is-black {\n    border-color: #0a0a0a;\n}\n.input.is-black:focus, .taginput .is-black.taginput-container.is-focusable:focus, .input.is-black.is-focused, .taginput .is-black.is-focused.taginput-container.is-focusable, .input.is-black:active, .taginput .is-black.taginput-container.is-focusable:active, .input.is-black.is-active, .taginput .is-black.is-active.taginput-container.is-focusable,\n    .textarea.is-black:focus,\n    .textarea.is-black.is-focused,\n    .textarea.is-black:active,\n    .textarea.is-black.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n}\n.input.is-light, .taginput .is-light.taginput-container.is-focusable,\n  .textarea.is-light {\n    border-color: whitesmoke;\n}\n.input.is-light:focus, .taginput .is-light.taginput-container.is-focusable:focus, .input.is-light.is-focused, .taginput .is-light.is-focused.taginput-container.is-focusable, .input.is-light:active, .taginput .is-light.taginput-container.is-focusable:active, .input.is-light.is-active, .taginput .is-light.is-active.taginput-container.is-focusable,\n    .textarea.is-light:focus,\n    .textarea.is-light.is-focused,\n    .textarea.is-light:active,\n    .textarea.is-light.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(245, 245, 245, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(245, 245, 245, 0.25);\n}\n.input.is-dark, .taginput .is-dark.taginput-container.is-focusable,\n  .textarea.is-dark {\n    border-color: #0a0a0a;\n}\n.input.is-dark:focus, .taginput .is-dark.taginput-container.is-focusable:focus, .input.is-dark.is-focused, .taginput .is-dark.is-focused.taginput-container.is-focusable, .input.is-dark:active, .taginput .is-dark.taginput-container.is-focusable:active, .input.is-dark.is-active, .taginput .is-dark.is-active.taginput-container.is-focusable,\n    .textarea.is-dark:focus,\n    .textarea.is-dark.is-focused,\n    .textarea.is-dark:active,\n    .textarea.is-dark.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n}\n.input.is-primary, .taginput .is-primary.taginput-container.is-focusable,\n  .textarea.is-primary {\n    border-color: #00d1b2;\n}\n.input.is-primary:focus, .taginput .is-primary.taginput-container.is-focusable:focus, .input.is-primary.is-focused, .taginput .is-primary.is-focused.taginput-container.is-focusable, .input.is-primary:active, .taginput .is-primary.taginput-container.is-focusable:active, .input.is-primary.is-active, .taginput .is-primary.is-active.taginput-container.is-focusable,\n    .textarea.is-primary:focus,\n    .textarea.is-primary.is-focused,\n    .textarea.is-primary:active,\n    .textarea.is-primary.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n}\n.input.is-info, .taginput .is-info.taginput-container.is-focusable,\n  .textarea.is-info {\n    border-color: #209cee;\n}\n.input.is-info:focus, .taginput .is-info.taginput-container.is-focusable:focus, .input.is-info.is-focused, .taginput .is-info.is-focused.taginput-container.is-focusable, .input.is-info:active, .taginput .is-info.taginput-container.is-focusable:active, .input.is-info.is-active, .taginput .is-info.is-active.taginput-container.is-focusable,\n    .textarea.is-info:focus,\n    .textarea.is-info.is-focused,\n    .textarea.is-info:active,\n    .textarea.is-info.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(32, 156, 238, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(32, 156, 238, 0.25);\n}\n.input.is-success, .taginput .is-success.taginput-container.is-focusable,\n  .textarea.is-success {\n    border-color: #23d160;\n}\n.input.is-success:focus, .taginput .is-success.taginput-container.is-focusable:focus, .input.is-success.is-focused, .taginput .is-success.is-focused.taginput-container.is-focusable, .input.is-success:active, .taginput .is-success.taginput-container.is-focusable:active, .input.is-success.is-active, .taginput .is-success.is-active.taginput-container.is-focusable,\n    .textarea.is-success:focus,\n    .textarea.is-success.is-focused,\n    .textarea.is-success:active,\n    .textarea.is-success.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(35, 209, 96, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(35, 209, 96, 0.25);\n}\n.input.is-warning, .taginput .is-warning.taginput-container.is-focusable,\n  .textarea.is-warning {\n    border-color: #ffdd57;\n}\n.input.is-warning:focus, .taginput .is-warning.taginput-container.is-focusable:focus, .input.is-warning.is-focused, .taginput .is-warning.is-focused.taginput-container.is-focusable, .input.is-warning:active, .taginput .is-warning.taginput-container.is-focusable:active, .input.is-warning.is-active, .taginput .is-warning.is-active.taginput-container.is-focusable,\n    .textarea.is-warning:focus,\n    .textarea.is-warning.is-focused,\n    .textarea.is-warning:active,\n    .textarea.is-warning.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(255, 221, 87, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(255, 221, 87, 0.25);\n}\n.input.is-danger, .taginput .is-danger.taginput-container.is-focusable,\n  .textarea.is-danger {\n    border-color: #ff3860;\n}\n.input.is-danger:focus, .taginput .is-danger.taginput-container.is-focusable:focus, .input.is-danger.is-focused, .taginput .is-danger.is-focused.taginput-container.is-focusable, .input.is-danger:active, .taginput .is-danger.taginput-container.is-focusable:active, .input.is-danger.is-active, .taginput .is-danger.is-active.taginput-container.is-focusable,\n    .textarea.is-danger:focus,\n    .textarea.is-danger.is-focused,\n    .textarea.is-danger:active,\n    .textarea.is-danger.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(255, 56, 96, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(255, 56, 96, 0.25);\n}\n.input.is-small, .taginput .is-small.taginput-container.is-focusable,\n  .textarea.is-small {\n    border-radius: 2px;\n    font-size: 0.75rem;\n}\n.input.is-medium, .taginput .is-medium.taginput-container.is-focusable,\n  .textarea.is-medium {\n    font-size: 1.25rem;\n}\n.input.is-large, .taginput .is-large.taginput-container.is-focusable,\n  .textarea.is-large {\n    font-size: 1.5rem;\n}\n.input.is-fullwidth, .taginput .is-fullwidth.taginput-container.is-focusable,\n  .textarea.is-fullwidth {\n    display: block;\n    width: 100%;\n}\n.input.is-inline, .taginput .is-inline.taginput-container.is-focusable,\n  .textarea.is-inline {\n    display: inline;\n    width: auto;\n}\n.input.is-rounded, .taginput .is-rounded.taginput-container.is-focusable {\n  border-radius: 290486px;\n  padding-left: 1em;\n  padding-right: 1em;\n}\n.input.is-static, .taginput .is-static.taginput-container.is-focusable {\n  background-color: transparent;\n  border-color: transparent;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n  padding-left: 0;\n  padding-right: 0;\n}\n.textarea {\n  display: block;\n  max-width: 100%;\n  min-width: 100%;\n  padding: 0.625em;\n  resize: vertical;\n}\n.textarea:not([rows]) {\n    max-height: 600px;\n    min-height: 120px;\n}\n.textarea[rows] {\n    height: initial;\n}\n.textarea.has-fixed-size {\n    resize: none;\n}\n.checkbox,\n.radio {\n  cursor: pointer;\n  display: inline-block;\n  line-height: 1.25;\n  position: relative;\n}\n.checkbox input,\n  .radio input {\n    cursor: pointer;\n}\n.checkbox:hover,\n  .radio:hover {\n    color: #363636;\n}\n.checkbox[disabled],\n  .radio[disabled] {\n    color: #7a7a7a;\n    cursor: not-allowed;\n}\n.radio + .radio {\n  margin-left: 0.5em;\n}\n.select {\n  display: inline-block;\n  max-width: 100%;\n  position: relative;\n  vertical-align: top;\n}\n.select:not(.is-multiple) {\n    height: 2.25em;\n}\n.select:not(.is-multiple):not(.is-loading)::after {\n    border-color: #00d1b2;\n    right: 1.125em;\n    z-index: 4;\n}\n.select.is-rounded select {\n    border-radius: 290486px;\n    padding-left: 1em;\n}\n.select select {\n    background-color: white;\n    border-color: #dbdbdb;\n    color: #363636;\n    cursor: pointer;\n    display: block;\n    font-size: 1em;\n    max-width: 100%;\n    outline: none;\n}\n.select select::-moz-placeholder {\n      color: rgba(54, 54, 54, 0.3);\n}\n.select select::-webkit-input-placeholder {\n      color: rgba(54, 54, 54, 0.3);\n}\n.select select:-moz-placeholder {\n      color: rgba(54, 54, 54, 0.3);\n}\n.select select:-ms-input-placeholder {\n      color: rgba(54, 54, 54, 0.3);\n}\n.select select:hover, .select select.is-hovered {\n      border-color: #b5b5b5;\n}\n.select select:focus, .select select.is-focused, .select select:active, .select select.is-active {\n      border-color: #00d1b2;\n      -webkit-box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n}\n.select select[disabled] {\n      background-color: whitesmoke;\n      border-color: whitesmoke;\n      -webkit-box-shadow: none;\n              box-shadow: none;\n      color: #7a7a7a;\n}\n.select select[disabled]::-moz-placeholder {\n        color: rgba(122, 122, 122, 0.3);\n}\n.select select[disabled]::-webkit-input-placeholder {\n        color: rgba(122, 122, 122, 0.3);\n}\n.select select[disabled]:-moz-placeholder {\n        color: rgba(122, 122, 122, 0.3);\n}\n.select select[disabled]:-ms-input-placeholder {\n        color: rgba(122, 122, 122, 0.3);\n}\n.select select::-ms-expand {\n      display: none;\n}\n.select select[disabled]:hover {\n      border-color: whitesmoke;\n}\n.select select:not([multiple]) {\n      padding-right: 2.5em;\n}\n.select select[multiple] {\n      height: auto;\n      padding: 0;\n}\n.select select[multiple] option {\n        padding: 0.5em 1em;\n}\n.select:not(.is-multiple):not(.is-loading):hover::after {\n    border-color: #363636;\n}\n.select.is-white:not(:hover)::after {\n    border-color: white;\n}\n.select.is-white select {\n    border-color: white;\n}\n.select.is-white select:hover, .select.is-white select.is-hovered {\n      border-color: #f2f2f2;\n}\n.select.is-white select:focus, .select.is-white select.is-focused, .select.is-white select:active, .select.is-white select.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(255, 255, 255, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(255, 255, 255, 0.25);\n}\n.select.is-black:not(:hover)::after {\n    border-color: #0a0a0a;\n}\n.select.is-black select {\n    border-color: #0a0a0a;\n}\n.select.is-black select:hover, .select.is-black select.is-hovered {\n      border-color: black;\n}\n.select.is-black select:focus, .select.is-black select.is-focused, .select.is-black select:active, .select.is-black select.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n}\n.select.is-light:not(:hover)::after {\n    border-color: whitesmoke;\n}\n.select.is-light select {\n    border-color: whitesmoke;\n}\n.select.is-light select:hover, .select.is-light select.is-hovered {\n      border-color: #e8e8e8;\n}\n.select.is-light select:focus, .select.is-light select.is-focused, .select.is-light select:active, .select.is-light select.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(245, 245, 245, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(245, 245, 245, 0.25);\n}\n.select.is-dark:not(:hover)::after {\n    border-color: #0a0a0a;\n}\n.select.is-dark select {\n    border-color: #0a0a0a;\n}\n.select.is-dark select:hover, .select.is-dark select.is-hovered {\n      border-color: black;\n}\n.select.is-dark select:focus, .select.is-dark select.is-focused, .select.is-dark select:active, .select.is-dark select.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(10, 10, 10, 0.25);\n}\n.select.is-primary:not(:hover)::after {\n    border-color: #00d1b2;\n}\n.select.is-primary select {\n    border-color: #00d1b2;\n}\n.select.is-primary select:hover, .select.is-primary select.is-hovered {\n      border-color: #00b89c;\n}\n.select.is-primary select:focus, .select.is-primary select.is-focused, .select.is-primary select:active, .select.is-primary select.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n}\n.select.is-info:not(:hover)::after {\n    border-color: #209cee;\n}\n.select.is-info select {\n    border-color: #209cee;\n}\n.select.is-info select:hover, .select.is-info select.is-hovered {\n      border-color: #118fe4;\n}\n.select.is-info select:focus, .select.is-info select.is-focused, .select.is-info select:active, .select.is-info select.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(32, 156, 238, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(32, 156, 238, 0.25);\n}\n.select.is-success:not(:hover)::after {\n    border-color: #23d160;\n}\n.select.is-success select {\n    border-color: #23d160;\n}\n.select.is-success select:hover, .select.is-success select.is-hovered {\n      border-color: #20bc56;\n}\n.select.is-success select:focus, .select.is-success select.is-focused, .select.is-success select:active, .select.is-success select.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(35, 209, 96, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(35, 209, 96, 0.25);\n}\n.select.is-warning:not(:hover)::after {\n    border-color: #ffdd57;\n}\n.select.is-warning select {\n    border-color: #ffdd57;\n}\n.select.is-warning select:hover, .select.is-warning select.is-hovered {\n      border-color: #ffd83d;\n}\n.select.is-warning select:focus, .select.is-warning select.is-focused, .select.is-warning select:active, .select.is-warning select.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(255, 221, 87, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(255, 221, 87, 0.25);\n}\n.select.is-danger:not(:hover)::after {\n    border-color: #ff3860;\n}\n.select.is-danger select {\n    border-color: #ff3860;\n}\n.select.is-danger select:hover, .select.is-danger select.is-hovered {\n      border-color: #ff1f4b;\n}\n.select.is-danger select:focus, .select.is-danger select.is-focused, .select.is-danger select:active, .select.is-danger select.is-active {\n      -webkit-box-shadow: 0 0 0 0.125em rgba(255, 56, 96, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(255, 56, 96, 0.25);\n}\n.select.is-small {\n    border-radius: 2px;\n    font-size: 0.75rem;\n}\n.select.is-medium {\n    font-size: 1.25rem;\n}\n.select.is-large {\n    font-size: 1.5rem;\n}\n.select.is-disabled::after {\n    border-color: #7a7a7a;\n}\n.select.is-fullwidth {\n    width: 100%;\n}\n.select.is-fullwidth select {\n      width: 100%;\n}\n.select.is-loading::after {\n    margin-top: 0;\n    position: absolute;\n    right: 0.625em;\n    top: 0.625em;\n    -webkit-transform: none;\n            transform: none;\n}\n.select.is-loading.is-small:after {\n    font-size: 0.75rem;\n}\n.select.is-loading.is-medium:after {\n    font-size: 1.25rem;\n}\n.select.is-loading.is-large:after {\n    font-size: 1.5rem;\n}\n.file {\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  position: relative;\n}\n.file.is-white .file-cta {\n    background-color: white;\n    border-color: transparent;\n    color: #0a0a0a;\n}\n.file.is-white:hover .file-cta, .file.is-white.is-hovered .file-cta {\n    background-color: #f9f9f9;\n    border-color: transparent;\n    color: #0a0a0a;\n}\n.file.is-white:focus .file-cta, .file.is-white.is-focused .file-cta {\n    border-color: transparent;\n    -webkit-box-shadow: 0 0 0.5em rgba(255, 255, 255, 0.25);\n            box-shadow: 0 0 0.5em rgba(255, 255, 255, 0.25);\n    color: #0a0a0a;\n}\n.file.is-white:active .file-cta, .file.is-white.is-active .file-cta {\n    background-color: #f2f2f2;\n    border-color: transparent;\n    color: #0a0a0a;\n}\n.file.is-black .file-cta {\n    background-color: #0a0a0a;\n    border-color: transparent;\n    color: white;\n}\n.file.is-black:hover .file-cta, .file.is-black.is-hovered .file-cta {\n    background-color: #040404;\n    border-color: transparent;\n    color: white;\n}\n.file.is-black:focus .file-cta, .file.is-black.is-focused .file-cta {\n    border-color: transparent;\n    -webkit-box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.25);\n            box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.25);\n    color: white;\n}\n.file.is-black:active .file-cta, .file.is-black.is-active .file-cta {\n    background-color: black;\n    border-color: transparent;\n    color: white;\n}\n.file.is-light .file-cta {\n    background-color: whitesmoke;\n    border-color: transparent;\n    color: #363636;\n}\n.file.is-light:hover .file-cta, .file.is-light.is-hovered .file-cta {\n    background-color: #eeeeee;\n    border-color: transparent;\n    color: #363636;\n}\n.file.is-light:focus .file-cta, .file.is-light.is-focused .file-cta {\n    border-color: transparent;\n    -webkit-box-shadow: 0 0 0.5em rgba(245, 245, 245, 0.25);\n            box-shadow: 0 0 0.5em rgba(245, 245, 245, 0.25);\n    color: #363636;\n}\n.file.is-light:active .file-cta, .file.is-light.is-active .file-cta {\n    background-color: #e8e8e8;\n    border-color: transparent;\n    color: #363636;\n}\n.file.is-dark .file-cta {\n    background-color: #0a0a0a;\n    border-color: transparent;\n    color: whitesmoke;\n}\n.file.is-dark:hover .file-cta, .file.is-dark.is-hovered .file-cta {\n    background-color: #040404;\n    border-color: transparent;\n    color: whitesmoke;\n}\n.file.is-dark:focus .file-cta, .file.is-dark.is-focused .file-cta {\n    border-color: transparent;\n    -webkit-box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.25);\n            box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.25);\n    color: whitesmoke;\n}\n.file.is-dark:active .file-cta, .file.is-dark.is-active .file-cta {\n    background-color: black;\n    border-color: transparent;\n    color: whitesmoke;\n}\n.file.is-primary .file-cta {\n    background-color: #00d1b2;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-primary:hover .file-cta, .file.is-primary.is-hovered .file-cta {\n    background-color: #00c4a7;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-primary:focus .file-cta, .file.is-primary.is-focused .file-cta {\n    border-color: transparent;\n    -webkit-box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.25);\n            box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.25);\n    color: #fff;\n}\n.file.is-primary:active .file-cta, .file.is-primary.is-active .file-cta {\n    background-color: #00b89c;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-info .file-cta {\n    background-color: #209cee;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-info:hover .file-cta, .file.is-info.is-hovered .file-cta {\n    background-color: #1496ed;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-info:focus .file-cta, .file.is-info.is-focused .file-cta {\n    border-color: transparent;\n    -webkit-box-shadow: 0 0 0.5em rgba(32, 156, 238, 0.25);\n            box-shadow: 0 0 0.5em rgba(32, 156, 238, 0.25);\n    color: #fff;\n}\n.file.is-info:active .file-cta, .file.is-info.is-active .file-cta {\n    background-color: #118fe4;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-success .file-cta {\n    background-color: #23d160;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-success:hover .file-cta, .file.is-success.is-hovered .file-cta {\n    background-color: #22c65b;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-success:focus .file-cta, .file.is-success.is-focused .file-cta {\n    border-color: transparent;\n    -webkit-box-shadow: 0 0 0.5em rgba(35, 209, 96, 0.25);\n            box-shadow: 0 0 0.5em rgba(35, 209, 96, 0.25);\n    color: #fff;\n}\n.file.is-success:active .file-cta, .file.is-success.is-active .file-cta {\n    background-color: #20bc56;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-warning .file-cta {\n    background-color: #ffdd57;\n    border-color: transparent;\n    color: rgba(0, 0, 0, 0.7);\n}\n.file.is-warning:hover .file-cta, .file.is-warning.is-hovered .file-cta {\n    background-color: #ffdb4a;\n    border-color: transparent;\n    color: rgba(0, 0, 0, 0.7);\n}\n.file.is-warning:focus .file-cta, .file.is-warning.is-focused .file-cta {\n    border-color: transparent;\n    -webkit-box-shadow: 0 0 0.5em rgba(255, 221, 87, 0.25);\n            box-shadow: 0 0 0.5em rgba(255, 221, 87, 0.25);\n    color: rgba(0, 0, 0, 0.7);\n}\n.file.is-warning:active .file-cta, .file.is-warning.is-active .file-cta {\n    background-color: #ffd83d;\n    border-color: transparent;\n    color: rgba(0, 0, 0, 0.7);\n}\n.file.is-danger .file-cta {\n    background-color: #ff3860;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-danger:hover .file-cta, .file.is-danger.is-hovered .file-cta {\n    background-color: #ff2b56;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-danger:focus .file-cta, .file.is-danger.is-focused .file-cta {\n    border-color: transparent;\n    -webkit-box-shadow: 0 0 0.5em rgba(255, 56, 96, 0.25);\n            box-shadow: 0 0 0.5em rgba(255, 56, 96, 0.25);\n    color: #fff;\n}\n.file.is-danger:active .file-cta, .file.is-danger.is-active .file-cta {\n    background-color: #ff1f4b;\n    border-color: transparent;\n    color: #fff;\n}\n.file.is-small {\n    font-size: 0.75rem;\n}\n.file.is-medium {\n    font-size: 1.25rem;\n}\n.file.is-medium .file-icon .fa {\n      font-size: 21px;\n}\n.file.is-large {\n    font-size: 1.5rem;\n}\n.file.is-large .file-icon .fa {\n      font-size: 28px;\n}\n.file.has-name .file-cta {\n    border-bottom-right-radius: 0;\n    border-top-right-radius: 0;\n}\n.file.has-name .file-name {\n    border-bottom-left-radius: 0;\n    border-top-left-radius: 0;\n}\n.file.has-name.is-empty .file-cta {\n    border-radius: 4px;\n}\n.file.has-name.is-empty .file-name {\n    display: none;\n}\n.file.is-boxed .file-label {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n}\n.file.is-boxed .file-cta {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    height: auto;\n    padding: 1em 3em;\n}\n.file.is-boxed .file-name {\n    border-width: 0 1px 1px;\n}\n.file.is-boxed .file-icon {\n    height: 1.5em;\n    width: 1.5em;\n}\n.file.is-boxed .file-icon .fa {\n      font-size: 21px;\n}\n.file.is-boxed.is-small .file-icon .fa {\n    font-size: 14px;\n}\n.file.is-boxed.is-medium .file-icon .fa {\n    font-size: 28px;\n}\n.file.is-boxed.is-large .file-icon .fa {\n    font-size: 35px;\n}\n.file.is-boxed.has-name .file-cta {\n    border-radius: 4px 4px 0 0;\n}\n.file.is-boxed.has-name .file-name {\n    border-radius: 0 0 4px 4px;\n    border-width: 0 1px 1px;\n}\n.file.is-centered {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.file.is-fullwidth .file-label {\n    width: 100%;\n}\n.file.is-fullwidth .file-name {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    max-width: none;\n}\n.file.is-right {\n    -webkit-box-pack: end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n}\n.file.is-right .file-cta {\n      border-radius: 0 4px 4px 0;\n}\n.file.is-right .file-name {\n      border-radius: 4px 0 0 4px;\n      border-width: 1px 0 1px 1px;\n      -webkit-box-ordinal-group: 0;\n          -ms-flex-order: -1;\n              order: -1;\n}\n.file-label {\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  cursor: pointer;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  overflow: hidden;\n  position: relative;\n}\n.file-label:hover .file-cta {\n    background-color: #eeeeee;\n    color: #363636;\n}\n.file-label:hover .file-name {\n    border-color: #d5d5d5;\n}\n.file-label:active .file-cta {\n    background-color: #e8e8e8;\n    color: #363636;\n}\n.file-label:active .file-name {\n    border-color: #cfcfcf;\n}\n.file-input {\n  height: 100%;\n  left: 0;\n  opacity: 0;\n  outline: none;\n  position: absolute;\n  top: 0;\n  width: 100%;\n}\n.file-cta,\n.file-name {\n  border-color: #dbdbdb;\n  border-radius: 4px;\n  font-size: 1em;\n  padding-left: 1em;\n  padding-right: 1em;\n  white-space: nowrap;\n}\n.file-cta {\n  background-color: whitesmoke;\n  color: #4a4a4a;\n}\n.file-name {\n  border-color: #dbdbdb;\n  border-style: solid;\n  border-width: 1px 1px 1px 0;\n  display: block;\n  max-width: 16em;\n  overflow: hidden;\n  text-align: left;\n  text-overflow: ellipsis;\n}\n.file-icon {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  height: 1em;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  margin-right: 0.5em;\n  width: 1em;\n}\n.file-icon .fa {\n    font-size: 14px;\n}\n.label {\n  color: #363636;\n  display: block;\n  font-size: 1rem;\n  font-weight: 700;\n}\n.label:not(:last-child) {\n    margin-bottom: 0.5em;\n}\n.label.is-small {\n    font-size: 0.75rem;\n}\n.label.is-medium {\n    font-size: 1.25rem;\n}\n.label.is-large {\n    font-size: 1.5rem;\n}\n.help {\n  display: block;\n  font-size: 0.75rem;\n  margin-top: 0.25rem;\n}\n.help.is-white {\n    color: white;\n}\n.help.is-black {\n    color: #0a0a0a;\n}\n.help.is-light {\n    color: whitesmoke;\n}\n.help.is-dark {\n    color: #0a0a0a;\n}\n.help.is-primary {\n    color: #00d1b2;\n}\n.help.is-info {\n    color: #209cee;\n}\n.help.is-success {\n    color: #23d160;\n}\n.help.is-warning {\n    color: #ffdd57;\n}\n.help.is-danger {\n    color: #ff3860;\n}\n.field:not(:last-child) {\n  margin-bottom: 0.75rem;\n}\n.field.has-addons {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n}\n.field.has-addons .control:not(:last-child) {\n    margin-right: -1px;\n}\n.field.has-addons .control:not(:first-child):not(:last-child) .button,\n  .field.has-addons .control:not(:first-child):not(:last-child) .input,\n  .field.has-addons .control:not(:first-child):not(:last-child) .taginput .taginput-container.is-focusable,\n  .taginput .field.has-addons .control:not(:first-child):not(:last-child) .taginput-container.is-focusable,\n  .field.has-addons .control:not(:first-child):not(:last-child) .select select {\n    border-radius: 0;\n}\n.field.has-addons .control:first-child .button,\n  .field.has-addons .control:first-child .input,\n  .field.has-addons .control:first-child .taginput .taginput-container.is-focusable,\n  .taginput .field.has-addons .control:first-child .taginput-container.is-focusable,\n  .field.has-addons .control:first-child .select select {\n    border-bottom-right-radius: 0;\n    border-top-right-radius: 0;\n}\n.field.has-addons .control:last-child .button,\n  .field.has-addons .control:last-child .input,\n  .field.has-addons .control:last-child .taginput .taginput-container.is-focusable,\n  .taginput .field.has-addons .control:last-child .taginput-container.is-focusable,\n  .field.has-addons .control:last-child .select select {\n    border-bottom-left-radius: 0;\n    border-top-left-radius: 0;\n}\n.field.has-addons .control .button:not([disabled]):hover, .field.has-addons .control .button:not([disabled]).is-hovered,\n  .field.has-addons .control .input:not([disabled]):hover,\n  .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]):hover,\n  .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]):hover,\n  .field.has-addons .control .input:not([disabled]).is-hovered,\n  .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]).is-hovered,\n  .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]).is-hovered,\n  .field.has-addons .control .select select:not([disabled]):hover,\n  .field.has-addons .control .select select:not([disabled]).is-hovered {\n    z-index: 2;\n}\n.field.has-addons .control .button:not([disabled]):focus, .field.has-addons .control .button:not([disabled]).is-focused, .field.has-addons .control .button:not([disabled]):active, .field.has-addons .control .button:not([disabled]).is-active,\n  .field.has-addons .control .input:not([disabled]):focus,\n  .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]):focus,\n  .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]):focus,\n  .field.has-addons .control .input:not([disabled]).is-focused,\n  .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]).is-focused,\n  .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]).is-focused,\n  .field.has-addons .control .input:not([disabled]):active,\n  .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]):active,\n  .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]):active,\n  .field.has-addons .control .input:not([disabled]).is-active,\n  .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]).is-active,\n  .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]).is-active,\n  .field.has-addons .control .select select:not([disabled]):focus,\n  .field.has-addons .control .select select:not([disabled]).is-focused,\n  .field.has-addons .control .select select:not([disabled]):active,\n  .field.has-addons .control .select select:not([disabled]).is-active {\n    z-index: 3;\n}\n.field.has-addons .control .button:not([disabled]):focus:hover, .field.has-addons .control .button:not([disabled]).is-focused:hover, .field.has-addons .control .button:not([disabled]):active:hover, .field.has-addons .control .button:not([disabled]).is-active:hover,\n    .field.has-addons .control .input:not([disabled]):focus:hover,\n    .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]):focus:hover,\n    .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]):focus:hover,\n    .field.has-addons .control .input:not([disabled]).is-focused:hover,\n    .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]).is-focused:hover,\n    .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]).is-focused:hover,\n    .field.has-addons .control .input:not([disabled]):active:hover,\n    .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]):active:hover,\n    .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]):active:hover,\n    .field.has-addons .control .input:not([disabled]).is-active:hover,\n    .field.has-addons .control .taginput .taginput-container.is-focusable:not([disabled]).is-active:hover,\n    .taginput .field.has-addons .control .taginput-container.is-focusable:not([disabled]).is-active:hover,\n    .field.has-addons .control .select select:not([disabled]):focus:hover,\n    .field.has-addons .control .select select:not([disabled]).is-focused:hover,\n    .field.has-addons .control .select select:not([disabled]):active:hover,\n    .field.has-addons .control .select select:not([disabled]).is-active:hover {\n      z-index: 4;\n}\n.field.has-addons .control.is-expanded {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n}\n.field.has-addons.has-addons-centered {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.field.has-addons.has-addons-right {\n    -webkit-box-pack: end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n}\n.field.has-addons.has-addons-fullwidth .control {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n}\n.field.is-grouped {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n}\n.field.is-grouped > .control {\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n}\n.field.is-grouped > .control:not(:last-child) {\n      margin-bottom: 0;\n      margin-right: 0.75rem;\n}\n.field.is-grouped > .control.is-expanded {\n      -webkit-box-flex: 1;\n          -ms-flex-positive: 1;\n              flex-grow: 1;\n      -ms-flex-negative: 1;\n          flex-shrink: 1;\n}\n.field.is-grouped.is-grouped-centered {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.field.is-grouped.is-grouped-right {\n    -webkit-box-pack: end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n}\n.field.is-grouped.is-grouped-multiline {\n    -ms-flex-wrap: wrap;\n        flex-wrap: wrap;\n}\n.field.is-grouped.is-grouped-multiline > .control:last-child, .field.is-grouped.is-grouped-multiline > .control:not(:last-child) {\n      margin-bottom: 0.75rem;\n}\n.field.is-grouped.is-grouped-multiline:last-child {\n      margin-bottom: -0.75rem;\n}\n.field.is-grouped.is-grouped-multiline:not(:last-child) {\n      margin-bottom: 0;\n}\n@media screen and (min-width: 769px), print {\n.field.is-horizontal {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n}\n.field-label .label {\n  font-size: inherit;\n}\n@media screen and (max-width: 768px) {\n.field-label {\n    margin-bottom: 0.5rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.field-label {\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n    margin-right: 1.5rem;\n    text-align: right;\n}\n.field-label.is-small {\n      font-size: 0.75rem;\n      padding-top: 0.375em;\n}\n.field-label.is-normal {\n      padding-top: 0.375em;\n}\n.field-label.is-medium {\n      font-size: 1.25rem;\n      padding-top: 0.375em;\n}\n.field-label.is-large {\n      font-size: 1.5rem;\n      padding-top: 0.375em;\n}\n}\n.field-body .field .field {\n  margin-bottom: 0;\n}\n@media screen and (min-width: 769px), print {\n.field-body {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 5;\n        -ms-flex-positive: 5;\n            flex-grow: 5;\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n}\n.field-body .field {\n      margin-bottom: 0;\n}\n.field-body > .field {\n      -ms-flex-negative: 1;\n          flex-shrink: 1;\n}\n.field-body > .field:not(.is-narrow) {\n        -webkit-box-flex: 1;\n            -ms-flex-positive: 1;\n                flex-grow: 1;\n}\n.field-body > .field:not(:last-child) {\n        margin-right: 0.75rem;\n}\n}\n.control {\n  clear: both;\n  font-size: 1rem;\n  position: relative;\n  text-align: left;\n}\n.control.has-icon .icon {\n    color: #dbdbdb;\n    height: 2.25em;\n    pointer-events: none;\n    position: absolute;\n    top: 0;\n    width: 2.25em;\n    z-index: 4;\n}\n.control.has-icon .input:focus + .icon, .control.has-icon .taginput .taginput-container.is-focusable:focus + .icon, .taginput .control.has-icon .taginput-container.is-focusable:focus + .icon {\n    color: #7a7a7a;\n}\n.control.has-icon .input.is-small + .icon, .control.has-icon .taginput .is-small.taginput-container.is-focusable + .icon, .taginput .control.has-icon .is-small.taginput-container.is-focusable + .icon {\n    font-size: 0.75rem;\n}\n.control.has-icon .input.is-medium + .icon, .control.has-icon .taginput .is-medium.taginput-container.is-focusable + .icon, .taginput .control.has-icon .is-medium.taginput-container.is-focusable + .icon {\n    font-size: 1.25rem;\n}\n.control.has-icon .input.is-large + .icon, .control.has-icon .taginput .is-large.taginput-container.is-focusable + .icon, .taginput .control.has-icon .is-large.taginput-container.is-focusable + .icon {\n    font-size: 1.5rem;\n}\n.control.has-icon:not(.has-icon-right) .icon {\n    left: 0;\n}\n.control.has-icon:not(.has-icon-right) .input, .control.has-icon:not(.has-icon-right) .taginput .taginput-container.is-focusable, .taginput .control.has-icon:not(.has-icon-right) .taginput-container.is-focusable {\n    padding-left: 2.25em;\n}\n.control.has-icon.has-icon-right .icon {\n    right: 0;\n}\n.control.has-icon.has-icon-right .input, .control.has-icon.has-icon-right .taginput .taginput-container.is-focusable, .taginput .control.has-icon.has-icon-right .taginput-container.is-focusable {\n    padding-right: 2.25em;\n}\n.control.has-icons-left .input:focus ~ .icon, .control.has-icons-left .taginput .taginput-container.is-focusable:focus ~ .icon, .taginput .control.has-icons-left .taginput-container.is-focusable:focus ~ .icon,\n  .control.has-icons-left .select:focus ~ .icon, .control.has-icons-right .input:focus ~ .icon, .control.has-icons-right .taginput .taginput-container.is-focusable:focus ~ .icon, .taginput .control.has-icons-right .taginput-container.is-focusable:focus ~ .icon,\n  .control.has-icons-right .select:focus ~ .icon {\n    color: #7a7a7a;\n}\n.control.has-icons-left .input.is-small ~ .icon, .control.has-icons-left .taginput .is-small.taginput-container.is-focusable ~ .icon, .taginput .control.has-icons-left .is-small.taginput-container.is-focusable ~ .icon,\n  .control.has-icons-left .select.is-small ~ .icon, .control.has-icons-right .input.is-small ~ .icon, .control.has-icons-right .taginput .is-small.taginput-container.is-focusable ~ .icon, .taginput .control.has-icons-right .is-small.taginput-container.is-focusable ~ .icon,\n  .control.has-icons-right .select.is-small ~ .icon {\n    font-size: 0.75rem;\n}\n.control.has-icons-left .input.is-medium ~ .icon, .control.has-icons-left .taginput .is-medium.taginput-container.is-focusable ~ .icon, .taginput .control.has-icons-left .is-medium.taginput-container.is-focusable ~ .icon,\n  .control.has-icons-left .select.is-medium ~ .icon, .control.has-icons-right .input.is-medium ~ .icon, .control.has-icons-right .taginput .is-medium.taginput-container.is-focusable ~ .icon, .taginput .control.has-icons-right .is-medium.taginput-container.is-focusable ~ .icon,\n  .control.has-icons-right .select.is-medium ~ .icon {\n    font-size: 1.25rem;\n}\n.control.has-icons-left .input.is-large ~ .icon, .control.has-icons-left .taginput .is-large.taginput-container.is-focusable ~ .icon, .taginput .control.has-icons-left .is-large.taginput-container.is-focusable ~ .icon,\n  .control.has-icons-left .select.is-large ~ .icon, .control.has-icons-right .input.is-large ~ .icon, .control.has-icons-right .taginput .is-large.taginput-container.is-focusable ~ .icon, .taginput .control.has-icons-right .is-large.taginput-container.is-focusable ~ .icon,\n  .control.has-icons-right .select.is-large ~ .icon {\n    font-size: 1.5rem;\n}\n.control.has-icons-left .icon, .control.has-icons-right .icon {\n    color: #dbdbdb;\n    height: 2.25em;\n    pointer-events: none;\n    position: absolute;\n    top: 0;\n    width: 2.25em;\n    z-index: 4;\n}\n.control.has-icons-left .input, .control.has-icons-left .taginput .taginput-container.is-focusable, .taginput .control.has-icons-left .taginput-container.is-focusable,\n  .control.has-icons-left .select select {\n    padding-left: 2.25em;\n}\n.control.has-icons-left .icon.is-left {\n    left: 0;\n}\n.control.has-icons-right .input, .control.has-icons-right .taginput .taginput-container.is-focusable, .taginput .control.has-icons-right .taginput-container.is-focusable,\n  .control.has-icons-right .select select {\n    padding-right: 2.25em;\n}\n.control.has-icons-right .icon.is-right {\n    right: 0;\n}\n.control.is-loading::after {\n    position: absolute !important;\n    right: 0.625em;\n    top: 0.625em;\n    z-index: 4;\n}\n.control.is-loading.is-small:after {\n    font-size: 0.75rem;\n}\n.control.is-loading.is-medium:after {\n    font-size: 1.25rem;\n}\n.control.is-loading.is-large:after {\n    font-size: 1.5rem;\n}\n.icon {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  height: 1.5rem;\n  width: 1.5rem;\n}\n.icon.is-small {\n    height: 1rem;\n    width: 1rem;\n}\n.icon.is-medium {\n    height: 2rem;\n    width: 2rem;\n}\n.icon.is-large {\n    height: 3rem;\n    width: 3rem;\n}\n.image {\n  display: block;\n  position: relative;\n}\n.image img {\n    display: block;\n    height: auto;\n    width: 100%;\n}\n.image img.is-rounded {\n      border-radius: 290486px;\n}\n.image.is-square img, .image.is-1by1 img, .image.is-5by4 img, .image.is-4by3 img, .image.is-3by2 img, .image.is-5by3 img, .image.is-16by9 img, .image.is-2by1 img, .image.is-3by1 img, .image.is-4by5 img, .image.is-3by4 img, .image.is-2by3 img, .image.is-3by5 img, .image.is-9by16 img, .image.is-1by2 img, .image.is-1by3 img {\n    height: 100%;\n    width: 100%;\n}\n.image.is-square, .image.is-1by1 {\n    padding-top: 100%;\n}\n.image.is-5by4 {\n    padding-top: 80%;\n}\n.image.is-4by3 {\n    padding-top: 75%;\n}\n.image.is-3by2 {\n    padding-top: 66.6666%;\n}\n.image.is-5by3 {\n    padding-top: 60%;\n}\n.image.is-16by9 {\n    padding-top: 56.25%;\n}\n.image.is-2by1 {\n    padding-top: 50%;\n}\n.image.is-3by1 {\n    padding-top: 33.3333%;\n}\n.image.is-4by5 {\n    padding-top: 125%;\n}\n.image.is-3by4 {\n    padding-top: 133.3333%;\n}\n.image.is-2by3 {\n    padding-top: 150%;\n}\n.image.is-3by5 {\n    padding-top: 166.6666%;\n}\n.image.is-9by16 {\n    padding-top: 177.7777%;\n}\n.image.is-1by2 {\n    padding-top: 200%;\n}\n.image.is-1by3 {\n    padding-top: 300%;\n}\n.image.is-16x16 {\n    height: 16px;\n    width: 16px;\n}\n.image.is-24x24 {\n    height: 24px;\n    width: 24px;\n}\n.image.is-32x32 {\n    height: 32px;\n    width: 32px;\n}\n.image.is-48x48 {\n    height: 48px;\n    width: 48px;\n}\n.image.is-64x64 {\n    height: 64px;\n    width: 64px;\n}\n.image.is-96x96 {\n    height: 96px;\n    width: 96px;\n}\n.image.is-128x128 {\n    height: 128px;\n    width: 128px;\n}\n.notification {\n  background-color: whitesmoke;\n  border-radius: 4px;\n  padding: 1.25rem 2.5rem 1.25rem 1.5rem;\n  position: relative;\n}\n.notification a:not(.button):not(.dropdown-item) {\n    color: currentColor;\n    text-decoration: underline;\n}\n.notification strong {\n    color: currentColor;\n}\n.notification code,\n  .notification pre {\n    background: white;\n}\n.notification pre code {\n    background: transparent;\n}\n.notification > .delete {\n    position: absolute;\n    right: 0.5rem;\n    top: 0.5rem;\n}\n.notification .title,\n  .notification .subtitle,\n  .notification .content {\n    color: currentColor;\n}\n.notification.is-white {\n    background-color: white;\n    color: #0a0a0a;\n}\n.notification.is-black {\n    background-color: #0a0a0a;\n    color: white;\n}\n.notification.is-light {\n    background-color: whitesmoke;\n    color: #363636;\n}\n.notification.is-dark {\n    background-color: #0a0a0a;\n    color: whitesmoke;\n}\n.notification.is-primary {\n    background-color: #00d1b2;\n    color: #fff;\n}\n.notification.is-info {\n    background-color: #209cee;\n    color: #fff;\n}\n.notification.is-success {\n    background-color: #23d160;\n    color: #fff;\n}\n.notification.is-warning {\n    background-color: #ffdd57;\n    color: rgba(0, 0, 0, 0.7);\n}\n.notification.is-danger {\n    background-color: #ff3860;\n    color: #fff;\n}\n.progress {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  border: none;\n  border-radius: 290486px;\n  display: block;\n  height: 1rem;\n  overflow: hidden;\n  padding: 0;\n  width: 100%;\n}\n.progress::-webkit-progress-bar {\n    background-color: #dbdbdb;\n}\n.progress::-webkit-progress-value {\n    background-color: #4a4a4a;\n}\n.progress::-moz-progress-bar {\n    background-color: #4a4a4a;\n}\n.progress::-ms-fill {\n    background-color: #4a4a4a;\n    border: none;\n}\n.progress.is-white::-webkit-progress-value {\n    background-color: white;\n}\n.progress.is-white::-moz-progress-bar {\n    background-color: white;\n}\n.progress.is-white::-ms-fill {\n    background-color: white;\n}\n.progress.is-black::-webkit-progress-value {\n    background-color: #0a0a0a;\n}\n.progress.is-black::-moz-progress-bar {\n    background-color: #0a0a0a;\n}\n.progress.is-black::-ms-fill {\n    background-color: #0a0a0a;\n}\n.progress.is-light::-webkit-progress-value {\n    background-color: whitesmoke;\n}\n.progress.is-light::-moz-progress-bar {\n    background-color: whitesmoke;\n}\n.progress.is-light::-ms-fill {\n    background-color: whitesmoke;\n}\n.progress.is-dark::-webkit-progress-value {\n    background-color: #0a0a0a;\n}\n.progress.is-dark::-moz-progress-bar {\n    background-color: #0a0a0a;\n}\n.progress.is-dark::-ms-fill {\n    background-color: #0a0a0a;\n}\n.progress.is-primary::-webkit-progress-value {\n    background-color: #00d1b2;\n}\n.progress.is-primary::-moz-progress-bar {\n    background-color: #00d1b2;\n}\n.progress.is-primary::-ms-fill {\n    background-color: #00d1b2;\n}\n.progress.is-info::-webkit-progress-value {\n    background-color: #209cee;\n}\n.progress.is-info::-moz-progress-bar {\n    background-color: #209cee;\n}\n.progress.is-info::-ms-fill {\n    background-color: #209cee;\n}\n.progress.is-success::-webkit-progress-value {\n    background-color: #23d160;\n}\n.progress.is-success::-moz-progress-bar {\n    background-color: #23d160;\n}\n.progress.is-success::-ms-fill {\n    background-color: #23d160;\n}\n.progress.is-warning::-webkit-progress-value {\n    background-color: #ffdd57;\n}\n.progress.is-warning::-moz-progress-bar {\n    background-color: #ffdd57;\n}\n.progress.is-warning::-ms-fill {\n    background-color: #ffdd57;\n}\n.progress.is-danger::-webkit-progress-value {\n    background-color: #ff3860;\n}\n.progress.is-danger::-moz-progress-bar {\n    background-color: #ff3860;\n}\n.progress.is-danger::-ms-fill {\n    background-color: #ff3860;\n}\n.progress.is-small {\n    height: 0.75rem;\n}\n.progress.is-medium {\n    height: 1.25rem;\n}\n.progress.is-large {\n    height: 1.5rem;\n}\n.table {\n  background-color: white;\n  color: #363636;\n}\n.table td,\n  .table th {\n    border: 1px solid #dbdbdb;\n    border-width: 0 0 1px;\n    padding: 0.5em 0.75em;\n    vertical-align: top;\n}\n.table td.is-white,\n    .table th.is-white {\n      background-color: white;\n      border-color: white;\n      color: #0a0a0a;\n}\n.table td.is-black,\n    .table th.is-black {\n      background-color: #0a0a0a;\n      border-color: #0a0a0a;\n      color: white;\n}\n.table td.is-light,\n    .table th.is-light {\n      background-color: whitesmoke;\n      border-color: whitesmoke;\n      color: #363636;\n}\n.table td.is-dark,\n    .table th.is-dark {\n      background-color: #0a0a0a;\n      border-color: #0a0a0a;\n      color: whitesmoke;\n}\n.table td.is-primary,\n    .table th.is-primary {\n      background-color: #00d1b2;\n      border-color: #00d1b2;\n      color: #fff;\n}\n.table td.is-info,\n    .table th.is-info {\n      background-color: #209cee;\n      border-color: #209cee;\n      color: #fff;\n}\n.table td.is-success,\n    .table th.is-success {\n      background-color: #23d160;\n      border-color: #23d160;\n      color: #fff;\n}\n.table td.is-warning,\n    .table th.is-warning {\n      background-color: #ffdd57;\n      border-color: #ffdd57;\n      color: rgba(0, 0, 0, 0.7);\n}\n.table td.is-danger,\n    .table th.is-danger {\n      background-color: #ff3860;\n      border-color: #ff3860;\n      color: #fff;\n}\n.table td.is-narrow,\n    .table th.is-narrow {\n      white-space: nowrap;\n      width: 1%;\n}\n.table td.is-selected,\n    .table th.is-selected {\n      background-color: #00d1b2;\n      color: #fff;\n}\n.table td.is-selected a,\n      .table td.is-selected strong,\n      .table th.is-selected a,\n      .table th.is-selected strong {\n        color: currentColor;\n}\n.table th {\n    color: #363636;\n    text-align: left;\n}\n.table tr.is-selected {\n    background-color: #00d1b2;\n    color: #fff;\n}\n.table tr.is-selected a,\n    .table tr.is-selected strong {\n      color: currentColor;\n}\n.table tr.is-selected td,\n    .table tr.is-selected th {\n      border-color: #fff;\n      color: currentColor;\n}\n.table thead td,\n  .table thead th {\n    border-width: 0 0 2px;\n    color: #363636;\n}\n.table tfoot td,\n  .table tfoot th {\n    border-width: 2px 0 0;\n    color: #363636;\n}\n.table tbody tr:last-child td,\n  .table tbody tr:last-child th {\n    border-bottom-width: 0;\n}\n.table.is-bordered td,\n  .table.is-bordered th {\n    border-width: 1px;\n}\n.table.is-bordered tr:last-child td,\n  .table.is-bordered tr:last-child th {\n    border-bottom-width: 1px;\n}\n.table.is-fullwidth {\n    width: 100%;\n}\n.table.is-hoverable tbody tr:not(.is-selected):hover {\n    background-color: #fafafa;\n}\n.table.is-hoverable.is-striped tbody tr:not(.is-selected):hover {\n    background-color: #fafafa;\n}\n.table.is-hoverable.is-striped tbody tr:not(.is-selected):hover:nth-child(even) {\n      background-color: whitesmoke;\n}\n.table.is-narrow td,\n  .table.is-narrow th {\n    padding: 0.25em 0.5em;\n}\n.table.is-striped tbody tr:not(.is-selected):nth-child(even) {\n    background-color: #fafafa;\n}\n.table-container {\n  -webkit-overflow-scrolling: touch;\n  overflow: auto;\n  overflow-y: hidden;\n  max-width: 100%;\n}\n.tags {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n}\n.tags .tag {\n    margin-bottom: 0.5rem;\n}\n.tags .tag:not(:last-child) {\n      margin-right: 0.5rem;\n}\n.tags:last-child {\n    margin-bottom: -0.5rem;\n}\n.tags:not(:last-child) {\n    margin-bottom: 1rem;\n}\n.tags.has-addons .tag {\n    margin-right: 0;\n}\n.tags.has-addons .tag:not(:first-child) {\n      border-bottom-left-radius: 0;\n      border-top-left-radius: 0;\n}\n.tags.has-addons .tag:not(:last-child) {\n      border-bottom-right-radius: 0;\n      border-top-right-radius: 0;\n}\n.tags.is-centered {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.tags.is-centered .tag {\n      margin-right: 0.25rem;\n      margin-left: 0.25rem;\n}\n.tags.is-right {\n    -webkit-box-pack: end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n}\n.tags.is-right .tag:not(:first-child) {\n      margin-left: 0.5rem;\n}\n.tags.is-right .tag:not(:last-child) {\n      margin-right: 0;\n}\n.tag:not(body) {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  background-color: whitesmoke;\n  border-radius: 4px;\n  color: #4a4a4a;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 0.75rem;\n  height: 2em;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  line-height: 1.5;\n  padding-left: 0.75em;\n  padding-right: 0.75em;\n  white-space: nowrap;\n}\n.tag:not(body) .delete {\n    margin-left: 0.25rem;\n    margin-right: -0.375rem;\n}\n.tag:not(body).is-white {\n    background-color: white;\n    color: #0a0a0a;\n}\n.tag:not(body).is-black {\n    background-color: #0a0a0a;\n    color: white;\n}\n.tag:not(body).is-light {\n    background-color: whitesmoke;\n    color: #363636;\n}\n.tag:not(body).is-dark {\n    background-color: #0a0a0a;\n    color: whitesmoke;\n}\n.tag:not(body).is-primary {\n    background-color: #00d1b2;\n    color: #fff;\n}\n.tag:not(body).is-info {\n    background-color: #209cee;\n    color: #fff;\n}\n.tag:not(body).is-success {\n    background-color: #23d160;\n    color: #fff;\n}\n.tag:not(body).is-warning {\n    background-color: #ffdd57;\n    color: rgba(0, 0, 0, 0.7);\n}\n.tag:not(body).is-danger {\n    background-color: #ff3860;\n    color: #fff;\n}\n.tag:not(body).is-medium {\n    font-size: 1rem;\n}\n.tag:not(body).is-large {\n    font-size: 1.25rem;\n}\n.tag:not(body) .icon:first-child:not(:last-child) {\n    margin-left: -0.375em;\n    margin-right: 0.1875em;\n}\n.tag:not(body) .icon:last-child:not(:first-child) {\n    margin-left: 0.1875em;\n    margin-right: -0.375em;\n}\n.tag:not(body) .icon:first-child:last-child {\n    margin-left: -0.375em;\n    margin-right: -0.375em;\n}\n.tag:not(body).is-delete {\n    margin-left: 1px;\n    padding: 0;\n    position: relative;\n    width: 2em;\n}\n.tag:not(body).is-delete::before, .tag:not(body).is-delete::after {\n      background-color: currentColor;\n      content: \"\";\n      display: block;\n      left: 50%;\n      position: absolute;\n      top: 50%;\n      -webkit-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n              transform: translateX(-50%) translateY(-50%) rotate(45deg);\n      -webkit-transform-origin: center center;\n              transform-origin: center center;\n}\n.tag:not(body).is-delete::before {\n      height: 1px;\n      width: 50%;\n}\n.tag:not(body).is-delete::after {\n      height: 50%;\n      width: 1px;\n}\n.tag:not(body).is-delete:hover, .tag:not(body).is-delete:focus {\n      background-color: #e8e8e8;\n}\n.tag:not(body).is-delete:active {\n      background-color: #dbdbdb;\n}\n.tag:not(body).is-rounded {\n    border-radius: 290486px;\n}\na.tag:hover {\n  text-decoration: underline;\n}\n.title,\n.subtitle {\n  word-break: break-word;\n}\n.title em,\n  .title span,\n  .subtitle em,\n  .subtitle span {\n    font-weight: inherit;\n}\n.title sub,\n  .subtitle sub {\n    font-size: 0.75em;\n}\n.title sup,\n  .subtitle sup {\n    font-size: 0.75em;\n}\n.title .tag,\n  .subtitle .tag {\n    vertical-align: middle;\n}\n.title {\n  color: #363636;\n  font-size: 2rem;\n  font-weight: 600;\n  line-height: 1.125;\n}\n.title strong {\n    color: inherit;\n    font-weight: inherit;\n}\n.title + .highlight {\n    margin-top: -0.75rem;\n}\n.title:not(.is-spaced) + .subtitle {\n    margin-top: -1.25rem;\n}\n.title.is-1 {\n    font-size: 3rem;\n}\n.title.is-2 {\n    font-size: 2.5rem;\n}\n.title.is-3 {\n    font-size: 2rem;\n}\n.title.is-4 {\n    font-size: 1.5rem;\n}\n.title.is-5 {\n    font-size: 1.25rem;\n}\n.title.is-6 {\n    font-size: 1rem;\n}\n.title.is-7 {\n    font-size: 0.75rem;\n}\n.subtitle {\n  color: #4a4a4a;\n  font-size: 1.25rem;\n  font-weight: 400;\n  line-height: 1.25;\n}\n.subtitle strong {\n    color: #363636;\n    font-weight: 600;\n}\n.subtitle:not(.is-spaced) + .title {\n    margin-top: -1.25rem;\n}\n.subtitle.is-1 {\n    font-size: 3rem;\n}\n.subtitle.is-2 {\n    font-size: 2.5rem;\n}\n.subtitle.is-3 {\n    font-size: 2rem;\n}\n.subtitle.is-4 {\n    font-size: 1.5rem;\n}\n.subtitle.is-5 {\n    font-size: 1.25rem;\n}\n.subtitle.is-6 {\n    font-size: 1rem;\n}\n.subtitle.is-7 {\n    font-size: 0.75rem;\n}\n.heading {\n  display: block;\n  font-size: 11px;\n  letter-spacing: 1px;\n  margin-bottom: 5px;\n  text-transform: uppercase;\n}\n.highlight {\n  font-weight: 400;\n  max-width: 100%;\n  overflow: hidden;\n  padding: 0;\n}\n.highlight pre {\n    overflow: auto;\n    max-width: 100%;\n}\n.number {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  background-color: whitesmoke;\n  border-radius: 290486px;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  font-size: 1.25rem;\n  height: 2em;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  margin-right: 1.5rem;\n  min-width: 2.5em;\n  padding: 0.25rem 0.5rem;\n  text-align: center;\n  vertical-align: top;\n}\n.breadcrumb {\n  font-size: 1rem;\n  white-space: nowrap;\n}\n.breadcrumb a {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    color: #00d1b2;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    padding: 0 0.75em;\n}\n.breadcrumb a:hover {\n      color: #363636;\n}\n.breadcrumb li {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.breadcrumb li:first-child a {\n      padding-left: 0;\n}\n.breadcrumb li.is-active a {\n      color: #363636;\n      cursor: default;\n      pointer-events: none;\n}\n.breadcrumb li + li::before {\n      color: #b5b5b5;\n      content: \"/\";\n}\n.breadcrumb ul,\n  .breadcrumb ol {\n    -webkit-box-align: start;\n        -ms-flex-align: start;\n            align-items: flex-start;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-wrap: wrap;\n        flex-wrap: wrap;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.breadcrumb .icon:first-child {\n    margin-right: 0.5em;\n}\n.breadcrumb .icon:last-child {\n    margin-left: 0.5em;\n}\n.breadcrumb.is-centered ol,\n  .breadcrumb.is-centered ul {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.breadcrumb.is-right ol,\n  .breadcrumb.is-right ul {\n    -webkit-box-pack: end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n}\n.breadcrumb.is-small {\n    font-size: 0.75rem;\n}\n.breadcrumb.is-medium {\n    font-size: 1.25rem;\n}\n.breadcrumb.is-large {\n    font-size: 1.5rem;\n}\n.breadcrumb.has-arrow-separator li + li::before {\n    content: \"\\2192\";\n}\n.breadcrumb.has-bullet-separator li + li::before {\n    content: \"\\2022\";\n}\n.breadcrumb.has-dot-separator li + li::before {\n    content: \"\\B7\";\n}\n.breadcrumb.has-succeeds-separator li + li::before {\n    content: \"\\227B\";\n}\n.card {\n  background-color: white;\n  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n          box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n  color: #4a4a4a;\n  max-width: 100%;\n  position: relative;\n}\n.card-header {\n  background-color: transparent;\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  -webkit-box-shadow: 0 1px 2px rgba(10, 10, 10, 0.1);\n          box-shadow: 0 1px 2px rgba(10, 10, 10, 0.1);\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.card-header-title {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  color: #363636;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  font-weight: 700;\n  padding: 0.75rem;\n}\n.card-header-title.is-centered {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.card-header-icon {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  cursor: pointer;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  padding: 0.75rem;\n}\n.card-image {\n  display: block;\n  position: relative;\n}\n.card-content {\n  background-color: transparent;\n  padding: 1.5rem;\n}\n.card-footer {\n  background-color: transparent;\n  border-top: 1px solid #dbdbdb;\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.card-footer-item {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-preferred-size: 0;\n      flex-basis: 0;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  padding: 0.75rem;\n}\n.card-footer-item:not(:last-child) {\n    border-right: 1px solid #dbdbdb;\n}\n.card .media:not(:last-child) {\n  margin-bottom: 0.75rem;\n}\n.dropdown {\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  position: relative;\n  vertical-align: top;\n}\n.dropdown.is-active .dropdown-menu, .dropdown.is-hoverable:hover .dropdown-menu {\n    display: block;\n}\n.dropdown.is-right .dropdown-menu {\n    left: auto;\n    right: 0;\n}\n.dropdown.is-up .dropdown-menu {\n    bottom: 100%;\n    padding-bottom: 4px;\n    padding-top: initial;\n    top: auto;\n}\n.dropdown-menu {\n  display: none;\n  left: 0;\n  min-width: 12rem;\n  padding-top: 4px;\n  position: absolute;\n  top: 100%;\n  z-index: 20;\n}\n.dropdown-content {\n  background-color: white;\n  border-radius: 4px;\n  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n          box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n  padding-bottom: 0.5rem;\n  padding-top: 0.5rem;\n}\n.dropdown-item, .dropdown .dropdown-menu .has-link a {\n  color: #4a4a4a;\n  display: block;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  padding: 0.375rem 1rem;\n  position: relative;\n}\na.dropdown-item, .dropdown .dropdown-menu .has-link a,\nbutton.dropdown-item {\n  padding-right: 3rem;\n  text-align: left;\n  white-space: nowrap;\n  width: 100%;\n}\na.dropdown-item:hover, .dropdown .dropdown-menu .has-link a:hover,\n  button.dropdown-item:hover {\n    background-color: whitesmoke;\n    color: #0a0a0a;\n}\na.dropdown-item.is-active, .dropdown .dropdown-menu .has-link a.is-active,\n  button.dropdown-item.is-active {\n    background-color: #00d1b2;\n    color: #fff;\n}\n.dropdown-divider {\n  background-color: #dbdbdb;\n  border: none;\n  display: block;\n  height: 1px;\n  margin: 0.5rem 0;\n}\n.level {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n}\n.level code {\n    border-radius: 4px;\n}\n.level img {\n    display: inline-block;\n    vertical-align: top;\n}\n.level.is-mobile {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.level.is-mobile .level-left,\n    .level.is-mobile .level-right {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n}\n.level.is-mobile .level-left + .level-right {\n      margin-top: 0;\n}\n.level.is-mobile .level-item:not(:last-child) {\n      margin-bottom: 0;\n      margin-right: 0.75rem;\n}\n.level.is-mobile .level-item:not(.is-narrow) {\n      -webkit-box-flex: 1;\n          -ms-flex-positive: 1;\n              flex-grow: 1;\n}\n@media screen and (min-width: 769px), print {\n.level {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n}\n.level > .level-item:not(.is-narrow) {\n        -webkit-box-flex: 1;\n            -ms-flex-positive: 1;\n                flex-grow: 1;\n}\n}\n.level-item {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-preferred-size: auto;\n      flex-basis: auto;\n  -webkit-box-flex: 0;\n      -ms-flex-positive: 0;\n          flex-grow: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.level-item .title,\n  .level-item .subtitle {\n    margin-bottom: 0;\n}\n@media screen and (max-width: 768px) {\n.level-item:not(:last-child) {\n      margin-bottom: 0.75rem;\n}\n}\n.level-left,\n.level-right {\n  -ms-flex-preferred-size: auto;\n      flex-basis: auto;\n  -webkit-box-flex: 0;\n      -ms-flex-positive: 0;\n          flex-grow: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n}\n.level-left .level-item.is-flexible,\n  .level-right .level-item.is-flexible {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n}\n@media screen and (min-width: 769px), print {\n.level-left .level-item:not(:last-child),\n    .level-right .level-item:not(:last-child) {\n      margin-right: 0.75rem;\n}\n}\n.level-left {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n}\n@media screen and (max-width: 768px) {\n.level-left + .level-right {\n      margin-top: 1.5rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.level-left {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n}\n}\n.level-right {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n}\n@media screen and (min-width: 769px), print {\n.level-right {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n}\n}\n.list {\n  background-color: white;\n  border-radius: 4px;\n  -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n          box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n}\n.list-item {\n  display: block;\n  padding: 0.5em 1em;\n}\n.list-item:not(a) {\n    color: #4a4a4a;\n}\n.list-item:first-child {\n    border-top-left-radius: 4px;\n    border-top-right-radius: 4px;\n}\n.list-item:last-child {\n    border-top-left-radius: 4px;\n    border-top-right-radius: 4px;\n}\n.list-item:not(:last-child) {\n    border-bottom: 1px solid #dbdbdb;\n}\n.list-item.is-active {\n    background-color: #00d1b2;\n    color: #fff;\n}\na.list-item {\n  background-color: whitesmoke;\n  cursor: pointer;\n}\n.media {\n  -webkit-box-align: start;\n      -ms-flex-align: start;\n          align-items: flex-start;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  text-align: left;\n}\n.media .content:not(:last-child) {\n    margin-bottom: 0.75rem;\n}\n.media .media {\n    border-top: 1px solid rgba(219, 219, 219, 0.5);\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    padding-top: 0.75rem;\n}\n.media .media .content:not(:last-child),\n    .media .media .control:not(:last-child) {\n      margin-bottom: 0.5rem;\n}\n.media .media .media {\n      padding-top: 0.5rem;\n}\n.media .media .media + .media {\n        margin-top: 0.5rem;\n}\n.media + .media {\n    border-top: 1px solid rgba(219, 219, 219, 0.5);\n    margin-top: 1rem;\n    padding-top: 1rem;\n}\n.media.is-large + .media {\n    margin-top: 1.5rem;\n    padding-top: 1.5rem;\n}\n.media-left,\n.media-right {\n  -ms-flex-preferred-size: auto;\n      flex-basis: auto;\n  -webkit-box-flex: 0;\n      -ms-flex-positive: 0;\n          flex-grow: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n}\n.media-left {\n  margin-right: 1rem;\n}\n.media-right {\n  margin-left: 1rem;\n}\n.media-content {\n  -ms-flex-preferred-size: auto;\n      flex-basis: auto;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  -ms-flex-negative: 1;\n      flex-shrink: 1;\n  text-align: left;\n}\n@media screen and (max-width: 768px) {\n.media-content {\n    overflow-x: auto;\n}\n}\n.menu {\n  font-size: 1rem;\n}\n.menu.is-small {\n    font-size: 0.75rem;\n}\n.menu.is-medium {\n    font-size: 1.25rem;\n}\n.menu.is-large {\n    font-size: 1.5rem;\n}\n.menu-list {\n  line-height: 1.25;\n}\n.menu-list a {\n    border-radius: 2px;\n    color: #4a4a4a;\n    display: block;\n    padding: 0.5em 0.75em;\n}\n.menu-list a:hover {\n      background-color: whitesmoke;\n      color: #363636;\n}\n.menu-list a.is-active {\n      background-color: #00d1b2;\n      color: #fff;\n}\n.menu-list li ul {\n    border-left: 1px solid #dbdbdb;\n    margin: 0.75em;\n    padding-left: 0.75em;\n}\n.menu-label {\n  color: #7a7a7a;\n  font-size: 0.75em;\n  letter-spacing: 0.1em;\n  text-transform: uppercase;\n}\n.menu-label:not(:first-child) {\n    margin-top: 1em;\n}\n.menu-label:not(:last-child) {\n    margin-bottom: 1em;\n}\n.message {\n  background-color: whitesmoke;\n  border-radius: 4px;\n  font-size: 1rem;\n}\n.message strong {\n    color: currentColor;\n}\n.message a:not(.button):not(.tag) {\n    color: currentColor;\n    text-decoration: underline;\n}\n.message.is-small {\n    font-size: 0.75rem;\n}\n.message.is-medium {\n    font-size: 1.25rem;\n}\n.message.is-large {\n    font-size: 1.5rem;\n}\n.message.is-white {\n    background-color: white;\n}\n.message.is-white .message-header {\n      background-color: white;\n      color: #0a0a0a;\n}\n.message.is-white .message-body {\n      border-color: white;\n      color: #4d4d4d;\n}\n.message.is-black {\n    background-color: #fafafa;\n}\n.message.is-black .message-header {\n      background-color: #0a0a0a;\n      color: white;\n}\n.message.is-black .message-body {\n      border-color: #0a0a0a;\n      color: #090909;\n}\n.message.is-light {\n    background-color: #fafafa;\n}\n.message.is-light .message-header {\n      background-color: whitesmoke;\n      color: #363636;\n}\n.message.is-light .message-body {\n      border-color: whitesmoke;\n      color: #505050;\n}\n.message.is-dark {\n    background-color: #fafafa;\n}\n.message.is-dark .message-header {\n      background-color: #0a0a0a;\n      color: whitesmoke;\n}\n.message.is-dark .message-body {\n      border-color: #0a0a0a;\n      color: #090909;\n}\n.message.is-primary {\n    background-color: #f5fffd;\n}\n.message.is-primary .message-header {\n      background-color: #00d1b2;\n      color: #fff;\n}\n.message.is-primary .message-body {\n      border-color: #00d1b2;\n      color: #021310;\n}\n.message.is-info {\n    background-color: #f6fbfe;\n}\n.message.is-info .message-header {\n      background-color: #209cee;\n      color: #fff;\n}\n.message.is-info .message-body {\n      border-color: #209cee;\n      color: #12537e;\n}\n.message.is-success {\n    background-color: #f6fef9;\n}\n.message.is-success .message-header {\n      background-color: #23d160;\n      color: #fff;\n}\n.message.is-success .message-body {\n      border-color: #23d160;\n      color: #0e301a;\n}\n.message.is-warning {\n    background-color: #fffdf5;\n}\n.message.is-warning .message-header {\n      background-color: #ffdd57;\n      color: rgba(0, 0, 0, 0.7);\n}\n.message.is-warning .message-body {\n      border-color: #ffdd57;\n      color: #3b3108;\n}\n.message.is-danger {\n    background-color: #fff5f7;\n}\n.message.is-danger .message-header {\n      background-color: #ff3860;\n      color: #fff;\n}\n.message.is-danger .message-body {\n      border-color: #ff3860;\n      color: #cd0930;\n}\n.message-header {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  background-color: #4a4a4a;\n  border-radius: 4px 4px 0 0;\n  color: #fff;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  font-weight: 700;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n  line-height: 1.25;\n  padding: 0.75em 1em;\n  position: relative;\n}\n.message-header .delete {\n    -webkit-box-flex: 0;\n        -ms-flex-positive: 0;\n            flex-grow: 0;\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n    margin-left: 0.75em;\n}\n.message-header + .message-body {\n    border-width: 0;\n    border-top-left-radius: 0;\n    border-top-right-radius: 0;\n}\n.message-body {\n  border-color: #dbdbdb;\n  border-radius: 4px;\n  border-style: solid;\n  border-width: 0 0 0 4px;\n  color: #4a4a4a;\n  padding: 1.25em 1.5em;\n}\n.message-body code,\n  .message-body pre {\n    background-color: white;\n}\n.message-body pre code {\n    background-color: transparent;\n}\n.modal {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: none;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  overflow: hidden;\n  position: fixed;\n  z-index: 40;\n}\n.modal.is-active {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.modal-background {\n  background-color: rgba(10, 10, 10, 0.86);\n}\n.modal-content,\n.modal-card {\n  margin: 0 20px;\n  max-height: calc(100vh - 160px);\n  overflow: auto;\n  position: relative;\n  width: 100%;\n}\n@media screen and (min-width: 769px), print {\n.modal-content,\n    .modal-card {\n      margin: 0 auto;\n      max-height: calc(100vh - 40px);\n      width: 640px;\n}\n}\n.modal-close {\n  background: none;\n  height: 40px;\n  position: fixed;\n  right: 20px;\n  top: 20px;\n  width: 40px;\n}\n.modal-card {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  max-height: calc(100vh - 40px);\n  overflow: hidden;\n  -ms-overflow-y: visible;\n}\n.modal-card-head,\n.modal-card-foot {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  background-color: whitesmoke;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  padding: 20px;\n  position: relative;\n}\n.modal-card-head {\n  border-bottom: 1px solid #dbdbdb;\n  border-top-left-radius: 6px;\n  border-top-right-radius: 6px;\n}\n.modal-card-title {\n  color: #363636;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n  font-size: 1.5rem;\n  line-height: 1;\n}\n.modal-card-foot {\n  border-bottom-left-radius: 6px;\n  border-bottom-right-radius: 6px;\n  border-top: 1px solid #dbdbdb;\n}\n.modal-card-foot .button:not(:last-child) {\n    margin-right: 10px;\n}\n.modal-card-body {\n  -webkit-overflow-scrolling: touch;\n  background-color: white;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  -ms-flex-negative: 1;\n      flex-shrink: 1;\n  overflow: auto;\n  padding: 20px;\n}\n.navbar {\n  background-color: white;\n  min-height: 3.25rem;\n  position: relative;\n  z-index: 30;\n}\n.navbar.is-white {\n    background-color: white;\n    color: #0a0a0a;\n}\n.navbar.is-white .navbar-brand > .navbar-item,\n    .navbar.is-white .navbar-brand .navbar-link {\n      color: #0a0a0a;\n}\n.navbar.is-white .navbar-brand > a.navbar-item:hover, .navbar.is-white .navbar-brand > a.navbar-item.is-active,\n    .navbar.is-white .navbar-brand .navbar-link:hover,\n    .navbar.is-white .navbar-brand .navbar-link.is-active {\n      background-color: #f2f2f2;\n      color: #0a0a0a;\n}\n.navbar.is-white .navbar-brand .navbar-link::after {\n      border-color: #0a0a0a;\n}\n.navbar.is-white .navbar-burger {\n      color: #0a0a0a;\n}\n@media screen and (min-width: 1088px) {\n.navbar.is-white .navbar-start > .navbar-item,\n      .navbar.is-white .navbar-start .navbar-link,\n      .navbar.is-white .navbar-end > .navbar-item,\n      .navbar.is-white .navbar-end .navbar-link {\n        color: #0a0a0a;\n}\n.navbar.is-white .navbar-start > a.navbar-item:hover, .navbar.is-white .navbar-start > a.navbar-item.is-active,\n      .navbar.is-white .navbar-start .navbar-link:hover,\n      .navbar.is-white .navbar-start .navbar-link.is-active,\n      .navbar.is-white .navbar-end > a.navbar-item:hover,\n      .navbar.is-white .navbar-end > a.navbar-item.is-active,\n      .navbar.is-white .navbar-end .navbar-link:hover,\n      .navbar.is-white .navbar-end .navbar-link.is-active {\n        background-color: #f2f2f2;\n        color: #0a0a0a;\n}\n.navbar.is-white .navbar-start .navbar-link::after,\n      .navbar.is-white .navbar-end .navbar-link::after {\n        border-color: #0a0a0a;\n}\n.navbar.is-white .navbar-item.has-dropdown:hover .navbar-link,\n      .navbar.is-white .navbar-item.has-dropdown.is-active .navbar-link {\n        background-color: #f2f2f2;\n        color: #0a0a0a;\n}\n.navbar.is-white .navbar-dropdown a.navbar-item.is-active {\n        background-color: white;\n        color: #0a0a0a;\n}\n}\n.navbar.is-black {\n    background-color: #0a0a0a;\n    color: white;\n}\n.navbar.is-black .navbar-brand > .navbar-item,\n    .navbar.is-black .navbar-brand .navbar-link {\n      color: white;\n}\n.navbar.is-black .navbar-brand > a.navbar-item:hover, .navbar.is-black .navbar-brand > a.navbar-item.is-active,\n    .navbar.is-black .navbar-brand .navbar-link:hover,\n    .navbar.is-black .navbar-brand .navbar-link.is-active {\n      background-color: black;\n      color: white;\n}\n.navbar.is-black .navbar-brand .navbar-link::after {\n      border-color: white;\n}\n.navbar.is-black .navbar-burger {\n      color: white;\n}\n@media screen and (min-width: 1088px) {\n.navbar.is-black .navbar-start > .navbar-item,\n      .navbar.is-black .navbar-start .navbar-link,\n      .navbar.is-black .navbar-end > .navbar-item,\n      .navbar.is-black .navbar-end .navbar-link {\n        color: white;\n}\n.navbar.is-black .navbar-start > a.navbar-item:hover, .navbar.is-black .navbar-start > a.navbar-item.is-active,\n      .navbar.is-black .navbar-start .navbar-link:hover,\n      .navbar.is-black .navbar-start .navbar-link.is-active,\n      .navbar.is-black .navbar-end > a.navbar-item:hover,\n      .navbar.is-black .navbar-end > a.navbar-item.is-active,\n      .navbar.is-black .navbar-end .navbar-link:hover,\n      .navbar.is-black .navbar-end .navbar-link.is-active {\n        background-color: black;\n        color: white;\n}\n.navbar.is-black .navbar-start .navbar-link::after,\n      .navbar.is-black .navbar-end .navbar-link::after {\n        border-color: white;\n}\n.navbar.is-black .navbar-item.has-dropdown:hover .navbar-link,\n      .navbar.is-black .navbar-item.has-dropdown.is-active .navbar-link {\n        background-color: black;\n        color: white;\n}\n.navbar.is-black .navbar-dropdown a.navbar-item.is-active {\n        background-color: #0a0a0a;\n        color: white;\n}\n}\n.navbar.is-light {\n    background-color: whitesmoke;\n    color: #363636;\n}\n.navbar.is-light .navbar-brand > .navbar-item,\n    .navbar.is-light .navbar-brand .navbar-link {\n      color: #363636;\n}\n.navbar.is-light .navbar-brand > a.navbar-item:hover, .navbar.is-light .navbar-brand > a.navbar-item.is-active,\n    .navbar.is-light .navbar-brand .navbar-link:hover,\n    .navbar.is-light .navbar-brand .navbar-link.is-active {\n      background-color: #e8e8e8;\n      color: #363636;\n}\n.navbar.is-light .navbar-brand .navbar-link::after {\n      border-color: #363636;\n}\n.navbar.is-light .navbar-burger {\n      color: #363636;\n}\n@media screen and (min-width: 1088px) {\n.navbar.is-light .navbar-start > .navbar-item,\n      .navbar.is-light .navbar-start .navbar-link,\n      .navbar.is-light .navbar-end > .navbar-item,\n      .navbar.is-light .navbar-end .navbar-link {\n        color: #363636;\n}\n.navbar.is-light .navbar-start > a.navbar-item:hover, .navbar.is-light .navbar-start > a.navbar-item.is-active,\n      .navbar.is-light .navbar-start .navbar-link:hover,\n      .navbar.is-light .navbar-start .navbar-link.is-active,\n      .navbar.is-light .navbar-end > a.navbar-item:hover,\n      .navbar.is-light .navbar-end > a.navbar-item.is-active,\n      .navbar.is-light .navbar-end .navbar-link:hover,\n      .navbar.is-light .navbar-end .navbar-link.is-active {\n        background-color: #e8e8e8;\n        color: #363636;\n}\n.navbar.is-light .navbar-start .navbar-link::after,\n      .navbar.is-light .navbar-end .navbar-link::after {\n        border-color: #363636;\n}\n.navbar.is-light .navbar-item.has-dropdown:hover .navbar-link,\n      .navbar.is-light .navbar-item.has-dropdown.is-active .navbar-link {\n        background-color: #e8e8e8;\n        color: #363636;\n}\n.navbar.is-light .navbar-dropdown a.navbar-item.is-active {\n        background-color: whitesmoke;\n        color: #363636;\n}\n}\n.navbar.is-dark {\n    background-color: #0a0a0a;\n    color: whitesmoke;\n}\n.navbar.is-dark .navbar-brand > .navbar-item,\n    .navbar.is-dark .navbar-brand .navbar-link {\n      color: whitesmoke;\n}\n.navbar.is-dark .navbar-brand > a.navbar-item:hover, .navbar.is-dark .navbar-brand > a.navbar-item.is-active,\n    .navbar.is-dark .navbar-brand .navbar-link:hover,\n    .navbar.is-dark .navbar-brand .navbar-link.is-active {\n      background-color: black;\n      color: whitesmoke;\n}\n.navbar.is-dark .navbar-brand .navbar-link::after {\n      border-color: whitesmoke;\n}\n.navbar.is-dark .navbar-burger {\n      color: whitesmoke;\n}\n@media screen and (min-width: 1088px) {\n.navbar.is-dark .navbar-start > .navbar-item,\n      .navbar.is-dark .navbar-start .navbar-link,\n      .navbar.is-dark .navbar-end > .navbar-item,\n      .navbar.is-dark .navbar-end .navbar-link {\n        color: whitesmoke;\n}\n.navbar.is-dark .navbar-start > a.navbar-item:hover, .navbar.is-dark .navbar-start > a.navbar-item.is-active,\n      .navbar.is-dark .navbar-start .navbar-link:hover,\n      .navbar.is-dark .navbar-start .navbar-link.is-active,\n      .navbar.is-dark .navbar-end > a.navbar-item:hover,\n      .navbar.is-dark .navbar-end > a.navbar-item.is-active,\n      .navbar.is-dark .navbar-end .navbar-link:hover,\n      .navbar.is-dark .navbar-end .navbar-link.is-active {\n        background-color: black;\n        color: whitesmoke;\n}\n.navbar.is-dark .navbar-start .navbar-link::after,\n      .navbar.is-dark .navbar-end .navbar-link::after {\n        border-color: whitesmoke;\n}\n.navbar.is-dark .navbar-item.has-dropdown:hover .navbar-link,\n      .navbar.is-dark .navbar-item.has-dropdown.is-active .navbar-link {\n        background-color: black;\n        color: whitesmoke;\n}\n.navbar.is-dark .navbar-dropdown a.navbar-item.is-active {\n        background-color: #0a0a0a;\n        color: whitesmoke;\n}\n}\n.navbar.is-primary {\n    background-color: #00d1b2;\n    color: #fff;\n}\n.navbar.is-primary .navbar-brand > .navbar-item,\n    .navbar.is-primary .navbar-brand .navbar-link {\n      color: #fff;\n}\n.navbar.is-primary .navbar-brand > a.navbar-item:hover, .navbar.is-primary .navbar-brand > a.navbar-item.is-active,\n    .navbar.is-primary .navbar-brand .navbar-link:hover,\n    .navbar.is-primary .navbar-brand .navbar-link.is-active {\n      background-color: #00b89c;\n      color: #fff;\n}\n.navbar.is-primary .navbar-brand .navbar-link::after {\n      border-color: #fff;\n}\n.navbar.is-primary .navbar-burger {\n      color: #fff;\n}\n@media screen and (min-width: 1088px) {\n.navbar.is-primary .navbar-start > .navbar-item,\n      .navbar.is-primary .navbar-start .navbar-link,\n      .navbar.is-primary .navbar-end > .navbar-item,\n      .navbar.is-primary .navbar-end .navbar-link {\n        color: #fff;\n}\n.navbar.is-primary .navbar-start > a.navbar-item:hover, .navbar.is-primary .navbar-start > a.navbar-item.is-active,\n      .navbar.is-primary .navbar-start .navbar-link:hover,\n      .navbar.is-primary .navbar-start .navbar-link.is-active,\n      .navbar.is-primary .navbar-end > a.navbar-item:hover,\n      .navbar.is-primary .navbar-end > a.navbar-item.is-active,\n      .navbar.is-primary .navbar-end .navbar-link:hover,\n      .navbar.is-primary .navbar-end .navbar-link.is-active {\n        background-color: #00b89c;\n        color: #fff;\n}\n.navbar.is-primary .navbar-start .navbar-link::after,\n      .navbar.is-primary .navbar-end .navbar-link::after {\n        border-color: #fff;\n}\n.navbar.is-primary .navbar-item.has-dropdown:hover .navbar-link,\n      .navbar.is-primary .navbar-item.has-dropdown.is-active .navbar-link {\n        background-color: #00b89c;\n        color: #fff;\n}\n.navbar.is-primary .navbar-dropdown a.navbar-item.is-active {\n        background-color: #00d1b2;\n        color: #fff;\n}\n}\n.navbar.is-info {\n    background-color: #209cee;\n    color: #fff;\n}\n.navbar.is-info .navbar-brand > .navbar-item,\n    .navbar.is-info .navbar-brand .navbar-link {\n      color: #fff;\n}\n.navbar.is-info .navbar-brand > a.navbar-item:hover, .navbar.is-info .navbar-brand > a.navbar-item.is-active,\n    .navbar.is-info .navbar-brand .navbar-link:hover,\n    .navbar.is-info .navbar-brand .navbar-link.is-active {\n      background-color: #118fe4;\n      color: #fff;\n}\n.navbar.is-info .navbar-brand .navbar-link::after {\n      border-color: #fff;\n}\n.navbar.is-info .navbar-burger {\n      color: #fff;\n}\n@media screen and (min-width: 1088px) {\n.navbar.is-info .navbar-start > .navbar-item,\n      .navbar.is-info .navbar-start .navbar-link,\n      .navbar.is-info .navbar-end > .navbar-item,\n      .navbar.is-info .navbar-end .navbar-link {\n        color: #fff;\n}\n.navbar.is-info .navbar-start > a.navbar-item:hover, .navbar.is-info .navbar-start > a.navbar-item.is-active,\n      .navbar.is-info .navbar-start .navbar-link:hover,\n      .navbar.is-info .navbar-start .navbar-link.is-active,\n      .navbar.is-info .navbar-end > a.navbar-item:hover,\n      .navbar.is-info .navbar-end > a.navbar-item.is-active,\n      .navbar.is-info .navbar-end .navbar-link:hover,\n      .navbar.is-info .navbar-end .navbar-link.is-active {\n        background-color: #118fe4;\n        color: #fff;\n}\n.navbar.is-info .navbar-start .navbar-link::after,\n      .navbar.is-info .navbar-end .navbar-link::after {\n        border-color: #fff;\n}\n.navbar.is-info .navbar-item.has-dropdown:hover .navbar-link,\n      .navbar.is-info .navbar-item.has-dropdown.is-active .navbar-link {\n        background-color: #118fe4;\n        color: #fff;\n}\n.navbar.is-info .navbar-dropdown a.navbar-item.is-active {\n        background-color: #209cee;\n        color: #fff;\n}\n}\n.navbar.is-success {\n    background-color: #23d160;\n    color: #fff;\n}\n.navbar.is-success .navbar-brand > .navbar-item,\n    .navbar.is-success .navbar-brand .navbar-link {\n      color: #fff;\n}\n.navbar.is-success .navbar-brand > a.navbar-item:hover, .navbar.is-success .navbar-brand > a.navbar-item.is-active,\n    .navbar.is-success .navbar-brand .navbar-link:hover,\n    .navbar.is-success .navbar-brand .navbar-link.is-active {\n      background-color: #20bc56;\n      color: #fff;\n}\n.navbar.is-success .navbar-brand .navbar-link::after {\n      border-color: #fff;\n}\n.navbar.is-success .navbar-burger {\n      color: #fff;\n}\n@media screen and (min-width: 1088px) {\n.navbar.is-success .navbar-start > .navbar-item,\n      .navbar.is-success .navbar-start .navbar-link,\n      .navbar.is-success .navbar-end > .navbar-item,\n      .navbar.is-success .navbar-end .navbar-link {\n        color: #fff;\n}\n.navbar.is-success .navbar-start > a.navbar-item:hover, .navbar.is-success .navbar-start > a.navbar-item.is-active,\n      .navbar.is-success .navbar-start .navbar-link:hover,\n      .navbar.is-success .navbar-start .navbar-link.is-active,\n      .navbar.is-success .navbar-end > a.navbar-item:hover,\n      .navbar.is-success .navbar-end > a.navbar-item.is-active,\n      .navbar.is-success .navbar-end .navbar-link:hover,\n      .navbar.is-success .navbar-end .navbar-link.is-active {\n        background-color: #20bc56;\n        color: #fff;\n}\n.navbar.is-success .navbar-start .navbar-link::after,\n      .navbar.is-success .navbar-end .navbar-link::after {\n        border-color: #fff;\n}\n.navbar.is-success .navbar-item.has-dropdown:hover .navbar-link,\n      .navbar.is-success .navbar-item.has-dropdown.is-active .navbar-link {\n        background-color: #20bc56;\n        color: #fff;\n}\n.navbar.is-success .navbar-dropdown a.navbar-item.is-active {\n        background-color: #23d160;\n        color: #fff;\n}\n}\n.navbar.is-warning {\n    background-color: #ffdd57;\n    color: rgba(0, 0, 0, 0.7);\n}\n.navbar.is-warning .navbar-brand > .navbar-item,\n    .navbar.is-warning .navbar-brand .navbar-link {\n      color: rgba(0, 0, 0, 0.7);\n}\n.navbar.is-warning .navbar-brand > a.navbar-item:hover, .navbar.is-warning .navbar-brand > a.navbar-item.is-active,\n    .navbar.is-warning .navbar-brand .navbar-link:hover,\n    .navbar.is-warning .navbar-brand .navbar-link.is-active {\n      background-color: #ffd83d;\n      color: rgba(0, 0, 0, 0.7);\n}\n.navbar.is-warning .navbar-brand .navbar-link::after {\n      border-color: rgba(0, 0, 0, 0.7);\n}\n.navbar.is-warning .navbar-burger {\n      color: rgba(0, 0, 0, 0.7);\n}\n@media screen and (min-width: 1088px) {\n.navbar.is-warning .navbar-start > .navbar-item,\n      .navbar.is-warning .navbar-start .navbar-link,\n      .navbar.is-warning .navbar-end > .navbar-item,\n      .navbar.is-warning .navbar-end .navbar-link {\n        color: rgba(0, 0, 0, 0.7);\n}\n.navbar.is-warning .navbar-start > a.navbar-item:hover, .navbar.is-warning .navbar-start > a.navbar-item.is-active,\n      .navbar.is-warning .navbar-start .navbar-link:hover,\n      .navbar.is-warning .navbar-start .navbar-link.is-active,\n      .navbar.is-warning .navbar-end > a.navbar-item:hover,\n      .navbar.is-warning .navbar-end > a.navbar-item.is-active,\n      .navbar.is-warning .navbar-end .navbar-link:hover,\n      .navbar.is-warning .navbar-end .navbar-link.is-active {\n        background-color: #ffd83d;\n        color: rgba(0, 0, 0, 0.7);\n}\n.navbar.is-warning .navbar-start .navbar-link::after,\n      .navbar.is-warning .navbar-end .navbar-link::after {\n        border-color: rgba(0, 0, 0, 0.7);\n}\n.navbar.is-warning .navbar-item.has-dropdown:hover .navbar-link,\n      .navbar.is-warning .navbar-item.has-dropdown.is-active .navbar-link {\n        background-color: #ffd83d;\n        color: rgba(0, 0, 0, 0.7);\n}\n.navbar.is-warning .navbar-dropdown a.navbar-item.is-active {\n        background-color: #ffdd57;\n        color: rgba(0, 0, 0, 0.7);\n}\n}\n.navbar.is-danger {\n    background-color: #ff3860;\n    color: #fff;\n}\n.navbar.is-danger .navbar-brand > .navbar-item,\n    .navbar.is-danger .navbar-brand .navbar-link {\n      color: #fff;\n}\n.navbar.is-danger .navbar-brand > a.navbar-item:hover, .navbar.is-danger .navbar-brand > a.navbar-item.is-active,\n    .navbar.is-danger .navbar-brand .navbar-link:hover,\n    .navbar.is-danger .navbar-brand .navbar-link.is-active {\n      background-color: #ff1f4b;\n      color: #fff;\n}\n.navbar.is-danger .navbar-brand .navbar-link::after {\n      border-color: #fff;\n}\n.navbar.is-danger .navbar-burger {\n      color: #fff;\n}\n@media screen and (min-width: 1088px) {\n.navbar.is-danger .navbar-start > .navbar-item,\n      .navbar.is-danger .navbar-start .navbar-link,\n      .navbar.is-danger .navbar-end > .navbar-item,\n      .navbar.is-danger .navbar-end .navbar-link {\n        color: #fff;\n}\n.navbar.is-danger .navbar-start > a.navbar-item:hover, .navbar.is-danger .navbar-start > a.navbar-item.is-active,\n      .navbar.is-danger .navbar-start .navbar-link:hover,\n      .navbar.is-danger .navbar-start .navbar-link.is-active,\n      .navbar.is-danger .navbar-end > a.navbar-item:hover,\n      .navbar.is-danger .navbar-end > a.navbar-item.is-active,\n      .navbar.is-danger .navbar-end .navbar-link:hover,\n      .navbar.is-danger .navbar-end .navbar-link.is-active {\n        background-color: #ff1f4b;\n        color: #fff;\n}\n.navbar.is-danger .navbar-start .navbar-link::after,\n      .navbar.is-danger .navbar-end .navbar-link::after {\n        border-color: #fff;\n}\n.navbar.is-danger .navbar-item.has-dropdown:hover .navbar-link,\n      .navbar.is-danger .navbar-item.has-dropdown.is-active .navbar-link {\n        background-color: #ff1f4b;\n        color: #fff;\n}\n.navbar.is-danger .navbar-dropdown a.navbar-item.is-active {\n        background-color: #ff3860;\n        color: #fff;\n}\n}\n.navbar > .container {\n    -webkit-box-align: stretch;\n        -ms-flex-align: stretch;\n            align-items: stretch;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    min-height: 3.25rem;\n    width: 100%;\n}\n.navbar.has-shadow {\n    -webkit-box-shadow: 0 2px 0 0 whitesmoke;\n            box-shadow: 0 2px 0 0 whitesmoke;\n}\n.navbar.is-fixed-bottom, .navbar.is-fixed-top {\n    left: 0;\n    position: fixed;\n    right: 0;\n    z-index: 30;\n}\n.navbar.is-fixed-bottom {\n    bottom: 0;\n}\n.navbar.is-fixed-bottom.has-shadow {\n      -webkit-box-shadow: 0 -2px 0 0 whitesmoke;\n              box-shadow: 0 -2px 0 0 whitesmoke;\n}\n.navbar.is-fixed-top {\n    top: 0;\n}\nhtml.has-navbar-fixed-top,\nbody.has-navbar-fixed-top {\n  padding-top: 3.25rem;\n}\nhtml.has-navbar-fixed-bottom,\nbody.has-navbar-fixed-bottom {\n  padding-bottom: 3.25rem;\n}\n.navbar-brand,\n.navbar-tabs {\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n  min-height: 3.25rem;\n}\n.navbar-brand a.navbar-item:hover {\n  background-color: transparent;\n}\n.navbar-tabs {\n  -webkit-overflow-scrolling: touch;\n  max-width: 100vw;\n  overflow-x: auto;\n  overflow-y: hidden;\n}\n.navbar-burger {\n  color: #4a4a4a;\n  cursor: pointer;\n  display: block;\n  height: 3.25rem;\n  position: relative;\n  width: 3.25rem;\n  margin-left: auto;\n}\n.navbar-burger span {\n    background-color: currentColor;\n    display: block;\n    height: 1px;\n    left: calc(50% - 8px);\n    position: absolute;\n    -webkit-transform-origin: center;\n            transform-origin: center;\n    -webkit-transition-duration: 86ms;\n            transition-duration: 86ms;\n    -webkit-transition-property: background-color, opacity, -webkit-transform;\n    transition-property: background-color, opacity, -webkit-transform;\n    transition-property: background-color, opacity, transform;\n    transition-property: background-color, opacity, transform, -webkit-transform;\n    -webkit-transition-timing-function: ease-out;\n            transition-timing-function: ease-out;\n    width: 16px;\n}\n.navbar-burger span:nth-child(1) {\n      top: calc(50% - 6px);\n}\n.navbar-burger span:nth-child(2) {\n      top: calc(50% - 1px);\n}\n.navbar-burger span:nth-child(3) {\n      top: calc(50% + 4px);\n}\n.navbar-burger:hover {\n    background-color: rgba(0, 0, 0, 0.05);\n}\n.navbar-burger.is-active span:nth-child(1) {\n    -webkit-transform: translateY(5px) rotate(45deg);\n            transform: translateY(5px) rotate(45deg);\n}\n.navbar-burger.is-active span:nth-child(2) {\n    opacity: 0;\n}\n.navbar-burger.is-active span:nth-child(3) {\n    -webkit-transform: translateY(-5px) rotate(-45deg);\n            transform: translateY(-5px) rotate(-45deg);\n}\n.navbar-menu {\n  display: none;\n}\n.navbar-item,\n.navbar-link {\n  color: #4a4a4a;\n  display: block;\n  line-height: 1.5;\n  padding: 0.5rem 0.75rem;\n  position: relative;\n}\n.navbar-item .icon:only-child,\n  .navbar-link .icon:only-child {\n    margin-left: -0.25rem;\n    margin-right: -0.25rem;\n}\na.navbar-item,\n.navbar-link {\n  cursor: pointer;\n}\na.navbar-item:hover, a.navbar-item.is-active,\n  .navbar-link:hover,\n  .navbar-link.is-active {\n    background-color: #fafafa;\n    color: #00d1b2;\n}\n.navbar-item {\n  display: block;\n  -webkit-box-flex: 0;\n      -ms-flex-positive: 0;\n          flex-grow: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n}\n.navbar-item img {\n    max-height: 1.75rem;\n}\n.navbar-item.has-dropdown {\n    padding: 0;\n}\n.navbar-item.is-expanded {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n}\n.navbar-item.is-tab {\n    border-bottom: 1px solid transparent;\n    min-height: 3.25rem;\n    padding-bottom: calc(0.5rem - 1px);\n}\n.navbar-item.is-tab:hover {\n      background-color: transparent;\n      border-bottom-color: #00d1b2;\n}\n.navbar-item.is-tab.is-active {\n      background-color: transparent;\n      border-bottom-color: #00d1b2;\n      border-bottom-style: solid;\n      border-bottom-width: 3px;\n      color: #00d1b2;\n      padding-bottom: calc(0.5rem - 3px);\n}\n.navbar-content {\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  -ms-flex-negative: 1;\n      flex-shrink: 1;\n}\n.navbar-link:not(.is-arrowless) {\n  padding-right: 2.5em;\n}\n.navbar-link:not(.is-arrowless)::after {\n    border-color: #00d1b2;\n    margin-top: -0.375em;\n    right: 1.125em;\n}\n.navbar-dropdown {\n  font-size: 0.875rem;\n  padding-bottom: 0.5rem;\n  padding-top: 0.5rem;\n}\n.navbar-dropdown .navbar-item {\n    padding-left: 1.5rem;\n    padding-right: 1.5rem;\n}\n.navbar-divider {\n  background-color: whitesmoke;\n  border: none;\n  display: none;\n  height: 2px;\n  margin: 0.5rem 0;\n}\n@media screen and (max-width: 1087px) {\n.navbar > .container {\n    display: block;\n}\n.navbar-brand .navbar-item,\n  .navbar-tabs .navbar-item {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.navbar-link::after {\n    display: none;\n}\n.navbar-menu {\n    background-color: white;\n    -webkit-box-shadow: 0 8px 16px rgba(10, 10, 10, 0.1);\n            box-shadow: 0 8px 16px rgba(10, 10, 10, 0.1);\n    padding: 0.5rem 0;\n}\n.navbar-menu.is-active {\n      display: block;\n}\n.navbar.is-fixed-bottom-touch, .navbar.is-fixed-top-touch {\n    left: 0;\n    position: fixed;\n    right: 0;\n    z-index: 30;\n}\n.navbar.is-fixed-bottom-touch {\n    bottom: 0;\n}\n.navbar.is-fixed-bottom-touch.has-shadow {\n      -webkit-box-shadow: 0 -2px 3px rgba(10, 10, 10, 0.1);\n              box-shadow: 0 -2px 3px rgba(10, 10, 10, 0.1);\n}\n.navbar.is-fixed-top-touch {\n    top: 0;\n}\n.navbar.is-fixed-top .navbar-menu, .navbar.is-fixed-top-touch .navbar-menu {\n    -webkit-overflow-scrolling: touch;\n    max-height: calc(100vh - 3.25rem);\n    overflow: auto;\n}\nhtml.has-navbar-fixed-top-touch,\n  body.has-navbar-fixed-top-touch {\n    padding-top: 3.25rem;\n}\nhtml.has-navbar-fixed-bottom-touch,\n  body.has-navbar-fixed-bottom-touch {\n    padding-bottom: 3.25rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.navbar,\n  .navbar-menu,\n  .navbar-start,\n  .navbar-end {\n    -webkit-box-align: stretch;\n        -ms-flex-align: stretch;\n            align-items: stretch;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.navbar {\n    min-height: 3.25rem;\n}\n.navbar.is-spaced {\n      padding: 1rem 2rem;\n}\n.navbar.is-spaced .navbar-start,\n      .navbar.is-spaced .navbar-end {\n        -webkit-box-align: center;\n            -ms-flex-align: center;\n                align-items: center;\n}\n.navbar.is-spaced a.navbar-item,\n      .navbar.is-spaced .navbar-link {\n        border-radius: 4px;\n}\n.navbar.is-transparent a.navbar-item:hover, .navbar.is-transparent a.navbar-item.is-active,\n    .navbar.is-transparent .navbar-link:hover,\n    .navbar.is-transparent .navbar-link.is-active {\n      background-color: transparent !important;\n}\n.navbar.is-transparent .navbar-item.has-dropdown.is-active .navbar-link, .navbar.is-transparent .navbar-item.has-dropdown.is-hoverable:hover .navbar-link {\n      background-color: transparent !important;\n}\n.navbar.is-transparent .navbar-dropdown a.navbar-item:hover {\n      background-color: whitesmoke;\n      color: #0a0a0a;\n}\n.navbar.is-transparent .navbar-dropdown a.navbar-item.is-active {\n      background-color: whitesmoke;\n      color: #00d1b2;\n}\n.navbar-burger {\n    display: none;\n}\n.navbar-item,\n  .navbar-link {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.navbar-item {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.navbar-item.has-dropdown {\n      -webkit-box-align: stretch;\n          -ms-flex-align: stretch;\n              align-items: stretch;\n}\n.navbar-item.has-dropdown-up .navbar-link::after {\n      -webkit-transform: rotate(135deg) translate(0.25em, -0.25em);\n              transform: rotate(135deg) translate(0.25em, -0.25em);\n}\n.navbar-item.has-dropdown-up .navbar-dropdown {\n      border-bottom: 2px solid #dbdbdb;\n      border-radius: 6px 6px 0 0;\n      border-top: none;\n      bottom: 100%;\n      -webkit-box-shadow: 0 -8px 8px rgba(10, 10, 10, 0.1);\n              box-shadow: 0 -8px 8px rgba(10, 10, 10, 0.1);\n      top: auto;\n}\n.navbar-item.is-active .navbar-dropdown, .navbar-item.is-hoverable:hover .navbar-dropdown {\n      display: block;\n}\n.navbar.is-spaced .navbar-item.is-active .navbar-dropdown, .navbar-item.is-active .navbar-dropdown.is-boxed, .navbar.is-spaced .navbar-item.is-hoverable:hover .navbar-dropdown, .navbar-item.is-hoverable:hover .navbar-dropdown.is-boxed {\n        opacity: 1;\n        pointer-events: auto;\n        -webkit-transform: translateY(0);\n                transform: translateY(0);\n}\n.navbar-menu {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n}\n.navbar-start {\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n    margin-right: auto;\n}\n.navbar-end {\n    -webkit-box-pack: end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n    margin-left: auto;\n}\n.navbar-dropdown {\n    background-color: white;\n    border-bottom-left-radius: 6px;\n    border-bottom-right-radius: 6px;\n    border-top: 2px solid #dbdbdb;\n    -webkit-box-shadow: 0 8px 8px rgba(10, 10, 10, 0.1);\n            box-shadow: 0 8px 8px rgba(10, 10, 10, 0.1);\n    display: none;\n    font-size: 0.875rem;\n    left: 0;\n    min-width: 100%;\n    position: absolute;\n    top: 100%;\n    z-index: 20;\n}\n.navbar-dropdown .navbar-item {\n      padding: 0.375rem 1rem;\n      white-space: nowrap;\n}\n.navbar-dropdown a.navbar-item {\n      padding-right: 3rem;\n}\n.navbar-dropdown a.navbar-item:hover {\n        background-color: whitesmoke;\n        color: #0a0a0a;\n}\n.navbar-dropdown a.navbar-item.is-active {\n        background-color: whitesmoke;\n        color: #00d1b2;\n}\n.navbar.is-spaced .navbar-dropdown, .navbar-dropdown.is-boxed {\n      border-radius: 6px;\n      border-top: none;\n      -webkit-box-shadow: 0 8px 8px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n              box-shadow: 0 8px 8px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n      display: block;\n      opacity: 0;\n      pointer-events: none;\n      top: calc(100% + (-4px));\n      -webkit-transform: translateY(-5px);\n              transform: translateY(-5px);\n      -webkit-transition-duration: 86ms;\n              transition-duration: 86ms;\n      -webkit-transition-property: opacity, -webkit-transform;\n      transition-property: opacity, -webkit-transform;\n      transition-property: opacity, transform;\n      transition-property: opacity, transform, -webkit-transform;\n}\n.navbar-dropdown.is-right {\n      left: auto;\n      right: 0;\n}\n.navbar-divider {\n    display: block;\n}\n.navbar > .container .navbar-brand,\n  .container > .navbar .navbar-brand {\n    margin-left: -.75rem;\n}\n.navbar > .container .navbar-menu,\n  .container > .navbar .navbar-menu {\n    margin-right: -.75rem;\n}\n.navbar.is-fixed-bottom-desktop, .navbar.is-fixed-top-desktop {\n    left: 0;\n    position: fixed;\n    right: 0;\n    z-index: 30;\n}\n.navbar.is-fixed-bottom-desktop {\n    bottom: 0;\n}\n.navbar.is-fixed-bottom-desktop.has-shadow {\n      -webkit-box-shadow: 0 -2px 3px rgba(10, 10, 10, 0.1);\n              box-shadow: 0 -2px 3px rgba(10, 10, 10, 0.1);\n}\n.navbar.is-fixed-top-desktop {\n    top: 0;\n}\nhtml.has-navbar-fixed-top-desktop,\n  body.has-navbar-fixed-top-desktop {\n    padding-top: 3.25rem;\n}\nhtml.has-navbar-fixed-bottom-desktop,\n  body.has-navbar-fixed-bottom-desktop {\n    padding-bottom: 3.25rem;\n}\nhtml.has-spaced-navbar-fixed-top,\n  body.has-spaced-navbar-fixed-top {\n    padding-top: 5.25rem;\n}\nhtml.has-spaced-navbar-fixed-bottom,\n  body.has-spaced-navbar-fixed-bottom {\n    padding-bottom: 5.25rem;\n}\na.navbar-item.is-active,\n  .navbar-link.is-active {\n    color: #0a0a0a;\n}\na.navbar-item.is-active:not(:hover),\n  .navbar-link.is-active:not(:hover) {\n    background-color: transparent;\n}\n.navbar-item.has-dropdown:hover .navbar-link, .navbar-item.has-dropdown.is-active .navbar-link {\n    background-color: #fafafa;\n}\n}\n.pagination {\n  font-size: 1rem;\n  margin: -0.25rem;\n}\n.pagination.is-small {\n    font-size: 0.75rem;\n}\n.pagination.is-medium {\n    font-size: 1.25rem;\n}\n.pagination.is-large {\n    font-size: 1.5rem;\n}\n.pagination.is-rounded .pagination-previous,\n  .pagination.is-rounded .pagination-next {\n    padding-left: 1em;\n    padding-right: 1em;\n    border-radius: 290486px;\n}\n.pagination.is-rounded .pagination-link {\n    border-radius: 290486px;\n}\n.pagination,\n.pagination-list {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  text-align: center;\n}\n.pagination-previous,\n.pagination-next,\n.pagination-link,\n.pagination-ellipsis {\n  font-size: 1em;\n  padding-left: 0.5em;\n  padding-right: 0.5em;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  margin: 0.25rem;\n  text-align: center;\n}\n.pagination-previous,\n.pagination-next,\n.pagination-link {\n  border-color: #dbdbdb;\n  color: #363636;\n  min-width: 2.25em;\n}\n.pagination-previous:hover,\n  .pagination-next:hover,\n  .pagination-link:hover {\n    border-color: #b5b5b5;\n    color: #363636;\n}\n.pagination-previous:focus,\n  .pagination-next:focus,\n  .pagination-link:focus {\n    border-color: #00d1b2;\n}\n.pagination-previous:active,\n  .pagination-next:active,\n  .pagination-link:active {\n    -webkit-box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n            box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.2);\n}\n.pagination-previous[disabled],\n  .pagination-next[disabled],\n  .pagination-link[disabled] {\n    background-color: #dbdbdb;\n    border-color: #dbdbdb;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    color: #7a7a7a;\n    opacity: 0.5;\n}\n.pagination-previous,\n.pagination-next {\n  padding-left: 0.75em;\n  padding-right: 0.75em;\n  white-space: nowrap;\n}\n.pagination-link.is-current {\n  background-color: #00d1b2;\n  border-color: #00d1b2;\n  color: #fff;\n}\n.pagination-ellipsis {\n  color: #b5b5b5;\n  pointer-events: none;\n}\n.pagination-list {\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n}\n@media screen and (max-width: 768px) {\n.pagination {\n    -ms-flex-wrap: wrap;\n        flex-wrap: wrap;\n}\n.pagination-previous,\n  .pagination-next {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n}\n.pagination-list li {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n}\n}\n@media screen and (min-width: 769px), print {\n.pagination-list {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n    -webkit-box-ordinal-group: 2;\n        -ms-flex-order: 1;\n            order: 1;\n}\n.pagination-previous {\n    -webkit-box-ordinal-group: 3;\n        -ms-flex-order: 2;\n            order: 2;\n}\n.pagination-next {\n    -webkit-box-ordinal-group: 4;\n        -ms-flex-order: 3;\n            order: 3;\n}\n.pagination {\n    -webkit-box-pack: justify;\n        -ms-flex-pack: justify;\n            justify-content: space-between;\n}\n.pagination.is-centered .pagination-previous {\n      -webkit-box-ordinal-group: 2;\n          -ms-flex-order: 1;\n              order: 1;\n}\n.pagination.is-centered .pagination-list {\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n      -webkit-box-ordinal-group: 3;\n          -ms-flex-order: 2;\n              order: 2;\n}\n.pagination.is-centered .pagination-next {\n      -webkit-box-ordinal-group: 4;\n          -ms-flex-order: 3;\n              order: 3;\n}\n.pagination.is-right .pagination-previous {\n      -webkit-box-ordinal-group: 2;\n          -ms-flex-order: 1;\n              order: 1;\n}\n.pagination.is-right .pagination-next {\n      -webkit-box-ordinal-group: 3;\n          -ms-flex-order: 2;\n              order: 2;\n}\n.pagination.is-right .pagination-list {\n      -webkit-box-pack: end;\n          -ms-flex-pack: end;\n              justify-content: flex-end;\n      -webkit-box-ordinal-group: 4;\n          -ms-flex-order: 3;\n              order: 3;\n}\n}\n.panel {\n  font-size: 1rem;\n}\n.panel:not(:last-child) {\n    margin-bottom: 1.5rem;\n}\n.panel-heading,\n.panel-tabs,\n.panel-block {\n  border-bottom: 1px solid #dbdbdb;\n  border-left: 1px solid #dbdbdb;\n  border-right: 1px solid #dbdbdb;\n}\n.panel-heading:first-child,\n  .panel-tabs:first-child,\n  .panel-block:first-child {\n    border-top: 1px solid #dbdbdb;\n}\n.panel-heading {\n  background-color: whitesmoke;\n  border-radius: 4px 4px 0 0;\n  color: #363636;\n  font-size: 1.25em;\n  font-weight: 300;\n  line-height: 1.25;\n  padding: 0.5em 0.75em;\n}\n.panel-tabs {\n  -webkit-box-align: end;\n      -ms-flex-align: end;\n          align-items: flex-end;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  font-size: 0.875em;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.panel-tabs a {\n    border-bottom: 1px solid #dbdbdb;\n    margin-bottom: -1px;\n    padding: 0.5em;\n}\n.panel-tabs a.is-active {\n      border-bottom-color: #4a4a4a;\n      color: #363636;\n}\n.panel-list a {\n  color: #4a4a4a;\n}\n.panel-list a:hover {\n    color: #00d1b2;\n}\n.panel-block {\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  color: #363636;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  padding: 0.5em 0.75em;\n}\n.panel-block input[type=\"checkbox\"] {\n    margin-right: 0.75em;\n}\n.panel-block > .control {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n    width: 100%;\n}\n.panel-block.is-wrapped {\n    -ms-flex-wrap: wrap;\n        flex-wrap: wrap;\n}\n.panel-block.is-active {\n    border-left-color: #00d1b2;\n    color: #363636;\n}\n.panel-block.is-active .panel-icon {\n      color: #00d1b2;\n}\na.panel-block,\nlabel.panel-block {\n  cursor: pointer;\n}\na.panel-block:hover,\n  label.panel-block:hover {\n    background-color: whitesmoke;\n}\n.panel-icon {\n  display: inline-block;\n  font-size: 14px;\n  height: 1em;\n  line-height: 1em;\n  text-align: center;\n  vertical-align: top;\n  width: 1em;\n  color: #7a7a7a;\n  margin-right: 0.75em;\n}\n.panel-icon .fa {\n    font-size: inherit;\n    line-height: inherit;\n}\n.tabs {\n  -webkit-overflow-scrolling: touch;\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  font-size: 1rem;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n  overflow: hidden;\n  overflow-x: auto;\n  white-space: nowrap;\n}\n.tabs a {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    border-bottom-color: #dbdbdb;\n    border-bottom-style: solid;\n    border-bottom-width: 1px;\n    color: #4a4a4a;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    margin-bottom: -1px;\n    padding: 0.5em 1em;\n    vertical-align: top;\n}\n.tabs a:hover {\n      border-bottom-color: #363636;\n      color: #363636;\n}\n.tabs li {\n    display: block;\n}\n.tabs li.is-active a {\n      border-bottom-color: #00d1b2;\n      color: #00d1b2;\n}\n.tabs ul {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    border-bottom-color: #dbdbdb;\n    border-bottom-style: solid;\n    border-bottom-width: 1px;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.tabs ul.is-left {\n      padding-right: 0.75em;\n}\n.tabs ul.is-center {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n      padding-left: 0.75em;\n      padding-right: 0.75em;\n}\n.tabs ul.is-right {\n      -webkit-box-pack: end;\n          -ms-flex-pack: end;\n              justify-content: flex-end;\n      padding-left: 0.75em;\n}\n.tabs .icon:first-child {\n    margin-right: 0.5em;\n}\n.tabs .icon:last-child {\n    margin-left: 0.5em;\n}\n.tabs.is-centered ul {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.tabs.is-right ul {\n    -webkit-box-pack: end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n}\n.tabs.is-boxed a {\n    border: 1px solid transparent;\n    border-radius: 4px 4px 0 0;\n}\n.tabs.is-boxed a:hover {\n      background-color: whitesmoke;\n      border-bottom-color: #dbdbdb;\n}\n.tabs.is-boxed li.is-active a {\n    background-color: white;\n    border-color: #dbdbdb;\n    border-bottom-color: transparent !important;\n}\n.tabs.is-fullwidth li {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n}\n.tabs.is-toggle a {\n    border-color: #dbdbdb;\n    border-style: solid;\n    border-width: 1px;\n    margin-bottom: 0;\n    position: relative;\n}\n.tabs.is-toggle a:hover {\n      background-color: whitesmoke;\n      border-color: #b5b5b5;\n      z-index: 2;\n}\n.tabs.is-toggle li + li {\n    margin-left: -1px;\n}\n.tabs.is-toggle li:first-child a {\n    border-radius: 4px 0 0 4px;\n}\n.tabs.is-toggle li:last-child a {\n    border-radius: 0 4px 4px 0;\n}\n.tabs.is-toggle li.is-active a {\n    background-color: #00d1b2;\n    border-color: #00d1b2;\n    color: #fff;\n    z-index: 1;\n}\n.tabs.is-toggle ul {\n    border-bottom: none;\n}\n.tabs.is-toggle.is-toggle-rounded li:first-child a {\n    border-bottom-left-radius: 290486px;\n    border-top-left-radius: 290486px;\n    padding-left: 1.25em;\n}\n.tabs.is-toggle.is-toggle-rounded li:last-child a {\n    border-bottom-right-radius: 290486px;\n    border-top-right-radius: 290486px;\n    padding-right: 1.25em;\n}\n.tabs.is-small {\n    font-size: 0.75rem;\n}\n.tabs.is-medium {\n    font-size: 1.25rem;\n}\n.tabs.is-large {\n    font-size: 1.5rem;\n}\n.column {\n  display: block;\n  -ms-flex-preferred-size: 0;\n      flex-basis: 0;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  -ms-flex-negative: 1;\n      flex-shrink: 1;\n  padding: 0.75rem;\n}\n.columns.is-mobile > .column.is-narrow {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n}\n.columns.is-mobile > .column.is-full {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 100%;\n}\n.columns.is-mobile > .column.is-three-quarters {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 75%;\n}\n.columns.is-mobile > .column.is-two-thirds {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 66.6666%;\n}\n.columns.is-mobile > .column.is-half {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 50%;\n}\n.columns.is-mobile > .column.is-one-third {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 33.3333%;\n}\n.columns.is-mobile > .column.is-one-quarter {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 25%;\n}\n.columns.is-mobile > .column.is-one-fifth {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 20%;\n}\n.columns.is-mobile > .column.is-two-fifths {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 40%;\n}\n.columns.is-mobile > .column.is-three-fifths {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 60%;\n}\n.columns.is-mobile > .column.is-four-fifths {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 80%;\n}\n.columns.is-mobile > .column.is-offset-three-quarters {\n    margin-left: 75%;\n}\n.columns.is-mobile > .column.is-offset-two-thirds {\n    margin-left: 66.6666%;\n}\n.columns.is-mobile > .column.is-offset-half {\n    margin-left: 50%;\n}\n.columns.is-mobile > .column.is-offset-one-third {\n    margin-left: 33.3333%;\n}\n.columns.is-mobile > .column.is-offset-one-quarter {\n    margin-left: 25%;\n}\n.columns.is-mobile > .column.is-offset-one-fifth {\n    margin-left: 20%;\n}\n.columns.is-mobile > .column.is-offset-two-fifths {\n    margin-left: 40%;\n}\n.columns.is-mobile > .column.is-offset-three-fifths {\n    margin-left: 60%;\n}\n.columns.is-mobile > .column.is-offset-four-fifths {\n    margin-left: 80%;\n}\n.columns.is-mobile > .column.is-1 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 8.33333%;\n}\n.columns.is-mobile > .column.is-offset-1 {\n    margin-left: 8.33333%;\n}\n.columns.is-mobile > .column.is-2 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 16.66667%;\n}\n.columns.is-mobile > .column.is-offset-2 {\n    margin-left: 16.66667%;\n}\n.columns.is-mobile > .column.is-3 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 25%;\n}\n.columns.is-mobile > .column.is-offset-3 {\n    margin-left: 25%;\n}\n.columns.is-mobile > .column.is-4 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 33.33333%;\n}\n.columns.is-mobile > .column.is-offset-4 {\n    margin-left: 33.33333%;\n}\n.columns.is-mobile > .column.is-5 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 41.66667%;\n}\n.columns.is-mobile > .column.is-offset-5 {\n    margin-left: 41.66667%;\n}\n.columns.is-mobile > .column.is-6 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 50%;\n}\n.columns.is-mobile > .column.is-offset-6 {\n    margin-left: 50%;\n}\n.columns.is-mobile > .column.is-7 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 58.33333%;\n}\n.columns.is-mobile > .column.is-offset-7 {\n    margin-left: 58.33333%;\n}\n.columns.is-mobile > .column.is-8 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 66.66667%;\n}\n.columns.is-mobile > .column.is-offset-8 {\n    margin-left: 66.66667%;\n}\n.columns.is-mobile > .column.is-9 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 75%;\n}\n.columns.is-mobile > .column.is-offset-9 {\n    margin-left: 75%;\n}\n.columns.is-mobile > .column.is-10 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 83.33333%;\n}\n.columns.is-mobile > .column.is-offset-10 {\n    margin-left: 83.33333%;\n}\n.columns.is-mobile > .column.is-11 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 91.66667%;\n}\n.columns.is-mobile > .column.is-offset-11 {\n    margin-left: 91.66667%;\n}\n.columns.is-mobile > .column.is-12 {\n    -webkit-box-flex: 0;\n        -ms-flex: none;\n            flex: none;\n    width: 100%;\n}\n.columns.is-mobile > .column.is-offset-12 {\n    margin-left: 100%;\n}\n@media screen and (max-width: 768px) {\n.column.is-narrow-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n}\n.column.is-full-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-three-quarters-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-two-thirds-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.6666%;\n}\n.column.is-half-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-one-third-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-one-fifth-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 20%;\n}\n.column.is-two-fifths-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 40%;\n}\n.column.is-three-fifths-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 60%;\n}\n.column.is-four-fifths-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 80%;\n}\n.column.is-offset-three-quarters-mobile {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds-mobile {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half-mobile {\n      margin-left: 50%;\n}\n.column.is-offset-one-third-mobile {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter-mobile {\n      margin-left: 25%;\n}\n.column.is-offset-one-fifth-mobile {\n      margin-left: 20%;\n}\n.column.is-offset-two-fifths-mobile {\n      margin-left: 40%;\n}\n.column.is-offset-three-fifths-mobile {\n      margin-left: 60%;\n}\n.column.is-offset-four-fifths-mobile {\n      margin-left: 80%;\n}\n.column.is-1-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1-mobile {\n      margin-left: 8.33333%;\n}\n.column.is-2-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2-mobile {\n      margin-left: 16.66667%;\n}\n.column.is-3-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-offset-3-mobile {\n      margin-left: 25%;\n}\n.column.is-4-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4-mobile {\n      margin-left: 33.33333%;\n}\n.column.is-5-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5-mobile {\n      margin-left: 41.66667%;\n}\n.column.is-6-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-offset-6-mobile {\n      margin-left: 50%;\n}\n.column.is-7-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7-mobile {\n      margin-left: 58.33333%;\n}\n.column.is-8-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8-mobile {\n      margin-left: 66.66667%;\n}\n.column.is-9-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-offset-9-mobile {\n      margin-left: 75%;\n}\n.column.is-10-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10-mobile {\n      margin-left: 83.33333%;\n}\n.column.is-11-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11-mobile {\n      margin-left: 91.66667%;\n}\n.column.is-12-mobile {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-offset-12-mobile {\n      margin-left: 100%;\n}\n}\n@media screen and (min-width: 769px), print {\n.column.is-narrow, .column.is-narrow-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n}\n.column.is-full, .column.is-full-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-three-quarters, .column.is-three-quarters-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-two-thirds, .column.is-two-thirds-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.6666%;\n}\n.column.is-half, .column.is-half-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-one-third, .column.is-one-third-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter, .column.is-one-quarter-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-one-fifth, .column.is-one-fifth-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 20%;\n}\n.column.is-two-fifths, .column.is-two-fifths-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 40%;\n}\n.column.is-three-fifths, .column.is-three-fifths-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 60%;\n}\n.column.is-four-fifths, .column.is-four-fifths-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 80%;\n}\n.column.is-offset-three-quarters, .column.is-offset-three-quarters-tablet {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds, .column.is-offset-two-thirds-tablet {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half, .column.is-offset-half-tablet {\n      margin-left: 50%;\n}\n.column.is-offset-one-third, .column.is-offset-one-third-tablet {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter, .column.is-offset-one-quarter-tablet {\n      margin-left: 25%;\n}\n.column.is-offset-one-fifth, .column.is-offset-one-fifth-tablet {\n      margin-left: 20%;\n}\n.column.is-offset-two-fifths, .column.is-offset-two-fifths-tablet {\n      margin-left: 40%;\n}\n.column.is-offset-three-fifths, .column.is-offset-three-fifths-tablet {\n      margin-left: 60%;\n}\n.column.is-offset-four-fifths, .column.is-offset-four-fifths-tablet {\n      margin-left: 80%;\n}\n.column.is-1, .column.is-1-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1, .column.is-offset-1-tablet {\n      margin-left: 8.33333%;\n}\n.column.is-2, .column.is-2-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2, .column.is-offset-2-tablet {\n      margin-left: 16.66667%;\n}\n.column.is-3, .column.is-3-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-offset-3, .column.is-offset-3-tablet {\n      margin-left: 25%;\n}\n.column.is-4, .column.is-4-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4, .column.is-offset-4-tablet {\n      margin-left: 33.33333%;\n}\n.column.is-5, .column.is-5-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5, .column.is-offset-5-tablet {\n      margin-left: 41.66667%;\n}\n.column.is-6, .column.is-6-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-offset-6, .column.is-offset-6-tablet {\n      margin-left: 50%;\n}\n.column.is-7, .column.is-7-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7, .column.is-offset-7-tablet {\n      margin-left: 58.33333%;\n}\n.column.is-8, .column.is-8-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8, .column.is-offset-8-tablet {\n      margin-left: 66.66667%;\n}\n.column.is-9, .column.is-9-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-offset-9, .column.is-offset-9-tablet {\n      margin-left: 75%;\n}\n.column.is-10, .column.is-10-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10, .column.is-offset-10-tablet {\n      margin-left: 83.33333%;\n}\n.column.is-11, .column.is-11-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11, .column.is-offset-11-tablet {\n      margin-left: 91.66667%;\n}\n.column.is-12, .column.is-12-tablet {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-offset-12, .column.is-offset-12-tablet {\n      margin-left: 100%;\n}\n}\n@media screen and (max-width: 1087px) {\n.column.is-narrow-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n}\n.column.is-full-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-three-quarters-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-two-thirds-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.6666%;\n}\n.column.is-half-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-one-third-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-one-fifth-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 20%;\n}\n.column.is-two-fifths-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 40%;\n}\n.column.is-three-fifths-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 60%;\n}\n.column.is-four-fifths-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 80%;\n}\n.column.is-offset-three-quarters-touch {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds-touch {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half-touch {\n      margin-left: 50%;\n}\n.column.is-offset-one-third-touch {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter-touch {\n      margin-left: 25%;\n}\n.column.is-offset-one-fifth-touch {\n      margin-left: 20%;\n}\n.column.is-offset-two-fifths-touch {\n      margin-left: 40%;\n}\n.column.is-offset-three-fifths-touch {\n      margin-left: 60%;\n}\n.column.is-offset-four-fifths-touch {\n      margin-left: 80%;\n}\n.column.is-1-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1-touch {\n      margin-left: 8.33333%;\n}\n.column.is-2-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2-touch {\n      margin-left: 16.66667%;\n}\n.column.is-3-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-offset-3-touch {\n      margin-left: 25%;\n}\n.column.is-4-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4-touch {\n      margin-left: 33.33333%;\n}\n.column.is-5-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5-touch {\n      margin-left: 41.66667%;\n}\n.column.is-6-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-offset-6-touch {\n      margin-left: 50%;\n}\n.column.is-7-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7-touch {\n      margin-left: 58.33333%;\n}\n.column.is-8-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8-touch {\n      margin-left: 66.66667%;\n}\n.column.is-9-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-offset-9-touch {\n      margin-left: 75%;\n}\n.column.is-10-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10-touch {\n      margin-left: 83.33333%;\n}\n.column.is-11-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11-touch {\n      margin-left: 91.66667%;\n}\n.column.is-12-touch {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-offset-12-touch {\n      margin-left: 100%;\n}\n}\n@media screen and (min-width: 1088px) {\n.column.is-narrow-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n}\n.column.is-full-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-three-quarters-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-two-thirds-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.6666%;\n}\n.column.is-half-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-one-third-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-one-fifth-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 20%;\n}\n.column.is-two-fifths-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 40%;\n}\n.column.is-three-fifths-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 60%;\n}\n.column.is-four-fifths-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 80%;\n}\n.column.is-offset-three-quarters-desktop {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds-desktop {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half-desktop {\n      margin-left: 50%;\n}\n.column.is-offset-one-third-desktop {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter-desktop {\n      margin-left: 25%;\n}\n.column.is-offset-one-fifth-desktop {\n      margin-left: 20%;\n}\n.column.is-offset-two-fifths-desktop {\n      margin-left: 40%;\n}\n.column.is-offset-three-fifths-desktop {\n      margin-left: 60%;\n}\n.column.is-offset-four-fifths-desktop {\n      margin-left: 80%;\n}\n.column.is-1-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1-desktop {\n      margin-left: 8.33333%;\n}\n.column.is-2-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2-desktop {\n      margin-left: 16.66667%;\n}\n.column.is-3-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-offset-3-desktop {\n      margin-left: 25%;\n}\n.column.is-4-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4-desktop {\n      margin-left: 33.33333%;\n}\n.column.is-5-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5-desktop {\n      margin-left: 41.66667%;\n}\n.column.is-6-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-offset-6-desktop {\n      margin-left: 50%;\n}\n.column.is-7-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7-desktop {\n      margin-left: 58.33333%;\n}\n.column.is-8-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8-desktop {\n      margin-left: 66.66667%;\n}\n.column.is-9-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-offset-9-desktop {\n      margin-left: 75%;\n}\n.column.is-10-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10-desktop {\n      margin-left: 83.33333%;\n}\n.column.is-11-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11-desktop {\n      margin-left: 91.66667%;\n}\n.column.is-12-desktop {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-offset-12-desktop {\n      margin-left: 100%;\n}\n}\n@media screen and (min-width: 1280px) {\n.column.is-narrow-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n}\n.column.is-full-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-three-quarters-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-two-thirds-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.6666%;\n}\n.column.is-half-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-one-third-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-one-fifth-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 20%;\n}\n.column.is-two-fifths-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 40%;\n}\n.column.is-three-fifths-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 60%;\n}\n.column.is-four-fifths-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 80%;\n}\n.column.is-offset-three-quarters-widescreen {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds-widescreen {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half-widescreen {\n      margin-left: 50%;\n}\n.column.is-offset-one-third-widescreen {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter-widescreen {\n      margin-left: 25%;\n}\n.column.is-offset-one-fifth-widescreen {\n      margin-left: 20%;\n}\n.column.is-offset-two-fifths-widescreen {\n      margin-left: 40%;\n}\n.column.is-offset-three-fifths-widescreen {\n      margin-left: 60%;\n}\n.column.is-offset-four-fifths-widescreen {\n      margin-left: 80%;\n}\n.column.is-1-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1-widescreen {\n      margin-left: 8.33333%;\n}\n.column.is-2-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2-widescreen {\n      margin-left: 16.66667%;\n}\n.column.is-3-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-offset-3-widescreen {\n      margin-left: 25%;\n}\n.column.is-4-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4-widescreen {\n      margin-left: 33.33333%;\n}\n.column.is-5-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5-widescreen {\n      margin-left: 41.66667%;\n}\n.column.is-6-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-offset-6-widescreen {\n      margin-left: 50%;\n}\n.column.is-7-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7-widescreen {\n      margin-left: 58.33333%;\n}\n.column.is-8-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8-widescreen {\n      margin-left: 66.66667%;\n}\n.column.is-9-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-offset-9-widescreen {\n      margin-left: 75%;\n}\n.column.is-10-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10-widescreen {\n      margin-left: 83.33333%;\n}\n.column.is-11-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11-widescreen {\n      margin-left: 91.66667%;\n}\n.column.is-12-widescreen {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-offset-12-widescreen {\n      margin-left: 100%;\n}\n}\n@media screen and (min-width: 1472px) {\n.column.is-narrow-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n}\n.column.is-full-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-three-quarters-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-two-thirds-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.6666%;\n}\n.column.is-half-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-one-third-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-one-fifth-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 20%;\n}\n.column.is-two-fifths-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 40%;\n}\n.column.is-three-fifths-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 60%;\n}\n.column.is-four-fifths-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 80%;\n}\n.column.is-offset-three-quarters-fullhd {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds-fullhd {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half-fullhd {\n      margin-left: 50%;\n}\n.column.is-offset-one-third-fullhd {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter-fullhd {\n      margin-left: 25%;\n}\n.column.is-offset-one-fifth-fullhd {\n      margin-left: 20%;\n}\n.column.is-offset-two-fifths-fullhd {\n      margin-left: 40%;\n}\n.column.is-offset-three-fifths-fullhd {\n      margin-left: 60%;\n}\n.column.is-offset-four-fifths-fullhd {\n      margin-left: 80%;\n}\n.column.is-1-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1-fullhd {\n      margin-left: 8.33333%;\n}\n.column.is-2-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2-fullhd {\n      margin-left: 16.66667%;\n}\n.column.is-3-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.column.is-offset-3-fullhd {\n      margin-left: 25%;\n}\n.column.is-4-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4-fullhd {\n      margin-left: 33.33333%;\n}\n.column.is-5-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5-fullhd {\n      margin-left: 41.66667%;\n}\n.column.is-6-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.column.is-offset-6-fullhd {\n      margin-left: 50%;\n}\n.column.is-7-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7-fullhd {\n      margin-left: 58.33333%;\n}\n.column.is-8-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8-fullhd {\n      margin-left: 66.66667%;\n}\n.column.is-9-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.column.is-offset-9-fullhd {\n      margin-left: 75%;\n}\n.column.is-10-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10-fullhd {\n      margin-left: 83.33333%;\n}\n.column.is-11-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11-fullhd {\n      margin-left: 91.66667%;\n}\n.column.is-12-fullhd {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n.column.is-offset-12-fullhd {\n      margin-left: 100%;\n}\n}\n.columns {\n  margin-left: -0.75rem;\n  margin-right: -0.75rem;\n  margin-top: -0.75rem;\n}\n.columns:last-child {\n    margin-bottom: -0.75rem;\n}\n.columns:not(:last-child) {\n    margin-bottom: calc(1.5rem - 0.75rem);\n}\n.columns.is-centered {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.columns.is-gapless {\n    margin-left: 0;\n    margin-right: 0;\n    margin-top: 0;\n}\n.columns.is-gapless > .column {\n      margin: 0;\n      padding: 0 !important;\n}\n.columns.is-gapless:not(:last-child) {\n      margin-bottom: 1.5rem;\n}\n.columns.is-gapless:last-child {\n      margin-bottom: 0;\n}\n.columns.is-mobile {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.columns.is-multiline {\n    -ms-flex-wrap: wrap;\n        flex-wrap: wrap;\n}\n.columns.is-vcentered {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n@media screen and (min-width: 769px), print {\n.columns:not(.is-desktop) {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-desktop {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n}\n}\n.columns.is-variable {\n  --columnGap: 0.75rem;\n  margin-left: calc(-1 * var(--columnGap));\n  margin-right: calc(-1 * var(--columnGap));\n}\n.columns.is-variable .column {\n    padding-left: var(--columnGap);\n    padding-right: var(--columnGap);\n}\n.columns.is-variable.is-0 {\n    --columnGap: 0rem;\n}\n@media screen and (max-width: 768px) {\n.columns.is-variable.is-0-mobile {\n      --columnGap: 0rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.columns.is-variable.is-0-tablet {\n      --columnGap: 0rem;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.columns.is-variable.is-0-tablet-only {\n      --columnGap: 0rem;\n}\n}\n@media screen and (max-width: 1087px) {\n.columns.is-variable.is-0-touch {\n      --columnGap: 0rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-variable.is-0-desktop {\n      --columnGap: 0rem;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.columns.is-variable.is-0-desktop-only {\n      --columnGap: 0rem;\n}\n}\n@media screen and (min-width: 1280px) {\n.columns.is-variable.is-0-widescreen {\n      --columnGap: 0rem;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.columns.is-variable.is-0-widescreen-only {\n      --columnGap: 0rem;\n}\n}\n@media screen and (min-width: 1472px) {\n.columns.is-variable.is-0-fullhd {\n      --columnGap: 0rem;\n}\n}\n.columns.is-variable.is-1 {\n    --columnGap: 0.25rem;\n}\n@media screen and (max-width: 768px) {\n.columns.is-variable.is-1-mobile {\n      --columnGap: 0.25rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.columns.is-variable.is-1-tablet {\n      --columnGap: 0.25rem;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.columns.is-variable.is-1-tablet-only {\n      --columnGap: 0.25rem;\n}\n}\n@media screen and (max-width: 1087px) {\n.columns.is-variable.is-1-touch {\n      --columnGap: 0.25rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-variable.is-1-desktop {\n      --columnGap: 0.25rem;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.columns.is-variable.is-1-desktop-only {\n      --columnGap: 0.25rem;\n}\n}\n@media screen and (min-width: 1280px) {\n.columns.is-variable.is-1-widescreen {\n      --columnGap: 0.25rem;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.columns.is-variable.is-1-widescreen-only {\n      --columnGap: 0.25rem;\n}\n}\n@media screen and (min-width: 1472px) {\n.columns.is-variable.is-1-fullhd {\n      --columnGap: 0.25rem;\n}\n}\n.columns.is-variable.is-2 {\n    --columnGap: 0.5rem;\n}\n@media screen and (max-width: 768px) {\n.columns.is-variable.is-2-mobile {\n      --columnGap: 0.5rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.columns.is-variable.is-2-tablet {\n      --columnGap: 0.5rem;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.columns.is-variable.is-2-tablet-only {\n      --columnGap: 0.5rem;\n}\n}\n@media screen and (max-width: 1087px) {\n.columns.is-variable.is-2-touch {\n      --columnGap: 0.5rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-variable.is-2-desktop {\n      --columnGap: 0.5rem;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.columns.is-variable.is-2-desktop-only {\n      --columnGap: 0.5rem;\n}\n}\n@media screen and (min-width: 1280px) {\n.columns.is-variable.is-2-widescreen {\n      --columnGap: 0.5rem;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.columns.is-variable.is-2-widescreen-only {\n      --columnGap: 0.5rem;\n}\n}\n@media screen and (min-width: 1472px) {\n.columns.is-variable.is-2-fullhd {\n      --columnGap: 0.5rem;\n}\n}\n.columns.is-variable.is-3 {\n    --columnGap: 0.75rem;\n}\n@media screen and (max-width: 768px) {\n.columns.is-variable.is-3-mobile {\n      --columnGap: 0.75rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.columns.is-variable.is-3-tablet {\n      --columnGap: 0.75rem;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.columns.is-variable.is-3-tablet-only {\n      --columnGap: 0.75rem;\n}\n}\n@media screen and (max-width: 1087px) {\n.columns.is-variable.is-3-touch {\n      --columnGap: 0.75rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-variable.is-3-desktop {\n      --columnGap: 0.75rem;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.columns.is-variable.is-3-desktop-only {\n      --columnGap: 0.75rem;\n}\n}\n@media screen and (min-width: 1280px) {\n.columns.is-variable.is-3-widescreen {\n      --columnGap: 0.75rem;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.columns.is-variable.is-3-widescreen-only {\n      --columnGap: 0.75rem;\n}\n}\n@media screen and (min-width: 1472px) {\n.columns.is-variable.is-3-fullhd {\n      --columnGap: 0.75rem;\n}\n}\n.columns.is-variable.is-4 {\n    --columnGap: 1rem;\n}\n@media screen and (max-width: 768px) {\n.columns.is-variable.is-4-mobile {\n      --columnGap: 1rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.columns.is-variable.is-4-tablet {\n      --columnGap: 1rem;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.columns.is-variable.is-4-tablet-only {\n      --columnGap: 1rem;\n}\n}\n@media screen and (max-width: 1087px) {\n.columns.is-variable.is-4-touch {\n      --columnGap: 1rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-variable.is-4-desktop {\n      --columnGap: 1rem;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.columns.is-variable.is-4-desktop-only {\n      --columnGap: 1rem;\n}\n}\n@media screen and (min-width: 1280px) {\n.columns.is-variable.is-4-widescreen {\n      --columnGap: 1rem;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.columns.is-variable.is-4-widescreen-only {\n      --columnGap: 1rem;\n}\n}\n@media screen and (min-width: 1472px) {\n.columns.is-variable.is-4-fullhd {\n      --columnGap: 1rem;\n}\n}\n.columns.is-variable.is-5 {\n    --columnGap: 1.25rem;\n}\n@media screen and (max-width: 768px) {\n.columns.is-variable.is-5-mobile {\n      --columnGap: 1.25rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.columns.is-variable.is-5-tablet {\n      --columnGap: 1.25rem;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.columns.is-variable.is-5-tablet-only {\n      --columnGap: 1.25rem;\n}\n}\n@media screen and (max-width: 1087px) {\n.columns.is-variable.is-5-touch {\n      --columnGap: 1.25rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-variable.is-5-desktop {\n      --columnGap: 1.25rem;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.columns.is-variable.is-5-desktop-only {\n      --columnGap: 1.25rem;\n}\n}\n@media screen and (min-width: 1280px) {\n.columns.is-variable.is-5-widescreen {\n      --columnGap: 1.25rem;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.columns.is-variable.is-5-widescreen-only {\n      --columnGap: 1.25rem;\n}\n}\n@media screen and (min-width: 1472px) {\n.columns.is-variable.is-5-fullhd {\n      --columnGap: 1.25rem;\n}\n}\n.columns.is-variable.is-6 {\n    --columnGap: 1.5rem;\n}\n@media screen and (max-width: 768px) {\n.columns.is-variable.is-6-mobile {\n      --columnGap: 1.5rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.columns.is-variable.is-6-tablet {\n      --columnGap: 1.5rem;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.columns.is-variable.is-6-tablet-only {\n      --columnGap: 1.5rem;\n}\n}\n@media screen and (max-width: 1087px) {\n.columns.is-variable.is-6-touch {\n      --columnGap: 1.5rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-variable.is-6-desktop {\n      --columnGap: 1.5rem;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.columns.is-variable.is-6-desktop-only {\n      --columnGap: 1.5rem;\n}\n}\n@media screen and (min-width: 1280px) {\n.columns.is-variable.is-6-widescreen {\n      --columnGap: 1.5rem;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.columns.is-variable.is-6-widescreen-only {\n      --columnGap: 1.5rem;\n}\n}\n@media screen and (min-width: 1472px) {\n.columns.is-variable.is-6-fullhd {\n      --columnGap: 1.5rem;\n}\n}\n.columns.is-variable.is-7 {\n    --columnGap: 1.75rem;\n}\n@media screen and (max-width: 768px) {\n.columns.is-variable.is-7-mobile {\n      --columnGap: 1.75rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.columns.is-variable.is-7-tablet {\n      --columnGap: 1.75rem;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.columns.is-variable.is-7-tablet-only {\n      --columnGap: 1.75rem;\n}\n}\n@media screen and (max-width: 1087px) {\n.columns.is-variable.is-7-touch {\n      --columnGap: 1.75rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-variable.is-7-desktop {\n      --columnGap: 1.75rem;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.columns.is-variable.is-7-desktop-only {\n      --columnGap: 1.75rem;\n}\n}\n@media screen and (min-width: 1280px) {\n.columns.is-variable.is-7-widescreen {\n      --columnGap: 1.75rem;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.columns.is-variable.is-7-widescreen-only {\n      --columnGap: 1.75rem;\n}\n}\n@media screen and (min-width: 1472px) {\n.columns.is-variable.is-7-fullhd {\n      --columnGap: 1.75rem;\n}\n}\n.columns.is-variable.is-8 {\n    --columnGap: 2rem;\n}\n@media screen and (max-width: 768px) {\n.columns.is-variable.is-8-mobile {\n      --columnGap: 2rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.columns.is-variable.is-8-tablet {\n      --columnGap: 2rem;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.columns.is-variable.is-8-tablet-only {\n      --columnGap: 2rem;\n}\n}\n@media screen and (max-width: 1087px) {\n.columns.is-variable.is-8-touch {\n      --columnGap: 2rem;\n}\n}\n@media screen and (min-width: 1088px) {\n.columns.is-variable.is-8-desktop {\n      --columnGap: 2rem;\n}\n}\n@media screen and (min-width: 1088px) and (max-width: 1279px) {\n.columns.is-variable.is-8-desktop-only {\n      --columnGap: 2rem;\n}\n}\n@media screen and (min-width: 1280px) {\n.columns.is-variable.is-8-widescreen {\n      --columnGap: 2rem;\n}\n}\n@media screen and (min-width: 1280px) and (max-width: 1471px) {\n.columns.is-variable.is-8-widescreen-only {\n      --columnGap: 2rem;\n}\n}\n@media screen and (min-width: 1472px) {\n.columns.is-variable.is-8-fullhd {\n      --columnGap: 2rem;\n}\n}\n.tile {\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  display: block;\n  -ms-flex-preferred-size: 0;\n      flex-basis: 0;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  -ms-flex-negative: 1;\n      flex-shrink: 1;\n  min-height: -webkit-min-content;\n  min-height: -moz-min-content;\n  min-height: min-content;\n}\n.tile.is-ancestor {\n    margin-left: -0.75rem;\n    margin-right: -0.75rem;\n    margin-top: -0.75rem;\n}\n.tile.is-ancestor:last-child {\n      margin-bottom: -0.75rem;\n}\n.tile.is-ancestor:not(:last-child) {\n      margin-bottom: 0.75rem;\n}\n.tile.is-child {\n    margin: 0 !important;\n}\n.tile.is-parent {\n    padding: 0.75rem;\n}\n.tile.is-vertical {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n}\n.tile.is-vertical > .tile.is-child:not(:last-child) {\n      margin-bottom: 1.5rem !important;\n}\n@media screen and (min-width: 769px), print {\n.tile:not(.is-child) {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n}\n.tile.is-1 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 8.33333%;\n}\n.tile.is-2 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 16.66667%;\n}\n.tile.is-3 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 25%;\n}\n.tile.is-4 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 33.33333%;\n}\n.tile.is-5 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 41.66667%;\n}\n.tile.is-6 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 50%;\n}\n.tile.is-7 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 58.33333%;\n}\n.tile.is-8 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 66.66667%;\n}\n.tile.is-9 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 75%;\n}\n.tile.is-10 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 83.33333%;\n}\n.tile.is-11 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 91.66667%;\n}\n.tile.is-12 {\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n      width: 100%;\n}\n}\n.hero {\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n}\n.hero .navbar {\n    background: none;\n}\n.hero .tabs ul {\n    border-bottom: none;\n}\n.hero.is-white {\n    background-color: white;\n    color: #0a0a0a;\n}\n.hero.is-white a:not(.button):not(.dropdown-item):not(.tag),\n    .hero.is-white strong {\n      color: inherit;\n}\n.hero.is-white .title {\n      color: #0a0a0a;\n}\n.hero.is-white .subtitle {\n      color: rgba(10, 10, 10, 0.9);\n}\n.hero.is-white .subtitle a:not(.button),\n      .hero.is-white .subtitle strong {\n        color: #0a0a0a;\n}\n@media screen and (max-width: 1087px) {\n.hero.is-white .navbar-menu {\n        background-color: white;\n}\n}\n.hero.is-white .navbar-item,\n    .hero.is-white .navbar-link {\n      color: rgba(10, 10, 10, 0.7);\n}\n.hero.is-white a.navbar-item:hover, .hero.is-white a.navbar-item.is-active,\n    .hero.is-white .navbar-link:hover,\n    .hero.is-white .navbar-link.is-active {\n      background-color: #f2f2f2;\n      color: #0a0a0a;\n}\n.hero.is-white .tabs a {\n      color: #0a0a0a;\n      opacity: 0.9;\n}\n.hero.is-white .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-white .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-white .tabs.is-boxed a, .hero.is-white .tabs.is-toggle a {\n      color: #0a0a0a;\n}\n.hero.is-white .tabs.is-boxed a:hover, .hero.is-white .tabs.is-toggle a:hover {\n        background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-white .tabs.is-boxed li.is-active a, .hero.is-white .tabs.is-boxed li.is-active a:hover, .hero.is-white .tabs.is-toggle li.is-active a, .hero.is-white .tabs.is-toggle li.is-active a:hover {\n      background-color: #0a0a0a;\n      border-color: #0a0a0a;\n      color: white;\n}\n.hero.is-white.is-bold {\n      background-image: linear-gradient(141deg, #e6e6e6 0%, white 71%, white 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-white.is-bold .navbar-menu {\n          background-image: linear-gradient(141deg, #e6e6e6 0%, white 71%, white 100%);\n}\n}\n.hero.is-black {\n    background-color: #0a0a0a;\n    color: white;\n}\n.hero.is-black a:not(.button):not(.dropdown-item):not(.tag),\n    .hero.is-black strong {\n      color: inherit;\n}\n.hero.is-black .title {\n      color: white;\n}\n.hero.is-black .subtitle {\n      color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-black .subtitle a:not(.button),\n      .hero.is-black .subtitle strong {\n        color: white;\n}\n@media screen and (max-width: 1087px) {\n.hero.is-black .navbar-menu {\n        background-color: #0a0a0a;\n}\n}\n.hero.is-black .navbar-item,\n    .hero.is-black .navbar-link {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-black a.navbar-item:hover, .hero.is-black a.navbar-item.is-active,\n    .hero.is-black .navbar-link:hover,\n    .hero.is-black .navbar-link.is-active {\n      background-color: black;\n      color: white;\n}\n.hero.is-black .tabs a {\n      color: white;\n      opacity: 0.9;\n}\n.hero.is-black .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-black .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-black .tabs.is-boxed a, .hero.is-black .tabs.is-toggle a {\n      color: white;\n}\n.hero.is-black .tabs.is-boxed a:hover, .hero.is-black .tabs.is-toggle a:hover {\n        background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-black .tabs.is-boxed li.is-active a, .hero.is-black .tabs.is-boxed li.is-active a:hover, .hero.is-black .tabs.is-toggle li.is-active a, .hero.is-black .tabs.is-toggle li.is-active a:hover {\n      background-color: white;\n      border-color: white;\n      color: #0a0a0a;\n}\n.hero.is-black.is-bold {\n      background-image: linear-gradient(141deg, black 0%, #0a0a0a 71%, #181616 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-black.is-bold .navbar-menu {\n          background-image: linear-gradient(141deg, black 0%, #0a0a0a 71%, #181616 100%);\n}\n}\n.hero.is-light {\n    background-color: whitesmoke;\n    color: #363636;\n}\n.hero.is-light a:not(.button):not(.dropdown-item):not(.tag),\n    .hero.is-light strong {\n      color: inherit;\n}\n.hero.is-light .title {\n      color: #363636;\n}\n.hero.is-light .subtitle {\n      color: rgba(54, 54, 54, 0.9);\n}\n.hero.is-light .subtitle a:not(.button),\n      .hero.is-light .subtitle strong {\n        color: #363636;\n}\n@media screen and (max-width: 1087px) {\n.hero.is-light .navbar-menu {\n        background-color: whitesmoke;\n}\n}\n.hero.is-light .navbar-item,\n    .hero.is-light .navbar-link {\n      color: rgba(54, 54, 54, 0.7);\n}\n.hero.is-light a.navbar-item:hover, .hero.is-light a.navbar-item.is-active,\n    .hero.is-light .navbar-link:hover,\n    .hero.is-light .navbar-link.is-active {\n      background-color: #e8e8e8;\n      color: #363636;\n}\n.hero.is-light .tabs a {\n      color: #363636;\n      opacity: 0.9;\n}\n.hero.is-light .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-light .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-light .tabs.is-boxed a, .hero.is-light .tabs.is-toggle a {\n      color: #363636;\n}\n.hero.is-light .tabs.is-boxed a:hover, .hero.is-light .tabs.is-toggle a:hover {\n        background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-light .tabs.is-boxed li.is-active a, .hero.is-light .tabs.is-boxed li.is-active a:hover, .hero.is-light .tabs.is-toggle li.is-active a, .hero.is-light .tabs.is-toggle li.is-active a:hover {\n      background-color: #363636;\n      border-color: #363636;\n      color: whitesmoke;\n}\n.hero.is-light.is-bold {\n      background-image: linear-gradient(141deg, #dfd8d9 0%, whitesmoke 71%, white 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-light.is-bold .navbar-menu {\n          background-image: linear-gradient(141deg, #dfd8d9 0%, whitesmoke 71%, white 100%);\n}\n}\n.hero.is-dark {\n    background-color: #0a0a0a;\n    color: whitesmoke;\n}\n.hero.is-dark a:not(.button):not(.dropdown-item):not(.tag),\n    .hero.is-dark strong {\n      color: inherit;\n}\n.hero.is-dark .title {\n      color: whitesmoke;\n}\n.hero.is-dark .subtitle {\n      color: rgba(245, 245, 245, 0.9);\n}\n.hero.is-dark .subtitle a:not(.button),\n      .hero.is-dark .subtitle strong {\n        color: whitesmoke;\n}\n@media screen and (max-width: 1087px) {\n.hero.is-dark .navbar-menu {\n        background-color: #0a0a0a;\n}\n}\n.hero.is-dark .navbar-item,\n    .hero.is-dark .navbar-link {\n      color: rgba(245, 245, 245, 0.7);\n}\n.hero.is-dark a.navbar-item:hover, .hero.is-dark a.navbar-item.is-active,\n    .hero.is-dark .navbar-link:hover,\n    .hero.is-dark .navbar-link.is-active {\n      background-color: black;\n      color: whitesmoke;\n}\n.hero.is-dark .tabs a {\n      color: whitesmoke;\n      opacity: 0.9;\n}\n.hero.is-dark .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-dark .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-dark .tabs.is-boxed a, .hero.is-dark .tabs.is-toggle a {\n      color: whitesmoke;\n}\n.hero.is-dark .tabs.is-boxed a:hover, .hero.is-dark .tabs.is-toggle a:hover {\n        background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-dark .tabs.is-boxed li.is-active a, .hero.is-dark .tabs.is-boxed li.is-active a:hover, .hero.is-dark .tabs.is-toggle li.is-active a, .hero.is-dark .tabs.is-toggle li.is-active a:hover {\n      background-color: whitesmoke;\n      border-color: whitesmoke;\n      color: #0a0a0a;\n}\n.hero.is-dark.is-bold {\n      background-image: linear-gradient(141deg, black 0%, #0a0a0a 71%, #181616 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-dark.is-bold .navbar-menu {\n          background-image: linear-gradient(141deg, black 0%, #0a0a0a 71%, #181616 100%);\n}\n}\n.hero.is-primary {\n    background-color: #00d1b2;\n    color: #fff;\n}\n.hero.is-primary a:not(.button):not(.dropdown-item):not(.tag),\n    .hero.is-primary strong {\n      color: inherit;\n}\n.hero.is-primary .title {\n      color: #fff;\n}\n.hero.is-primary .subtitle {\n      color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-primary .subtitle a:not(.button),\n      .hero.is-primary .subtitle strong {\n        color: #fff;\n}\n@media screen and (max-width: 1087px) {\n.hero.is-primary .navbar-menu {\n        background-color: #00d1b2;\n}\n}\n.hero.is-primary .navbar-item,\n    .hero.is-primary .navbar-link {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-primary a.navbar-item:hover, .hero.is-primary a.navbar-item.is-active,\n    .hero.is-primary .navbar-link:hover,\n    .hero.is-primary .navbar-link.is-active {\n      background-color: #00b89c;\n      color: #fff;\n}\n.hero.is-primary .tabs a {\n      color: #fff;\n      opacity: 0.9;\n}\n.hero.is-primary .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-primary .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-primary .tabs.is-boxed a, .hero.is-primary .tabs.is-toggle a {\n      color: #fff;\n}\n.hero.is-primary .tabs.is-boxed a:hover, .hero.is-primary .tabs.is-toggle a:hover {\n        background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-primary .tabs.is-boxed li.is-active a, .hero.is-primary .tabs.is-boxed li.is-active a:hover, .hero.is-primary .tabs.is-toggle li.is-active a, .hero.is-primary .tabs.is-toggle li.is-active a:hover {\n      background-color: #fff;\n      border-color: #fff;\n      color: #00d1b2;\n}\n.hero.is-primary.is-bold {\n      background-image: linear-gradient(141deg, #009e6c 0%, #00d1b2 71%, #00e7eb 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-primary.is-bold .navbar-menu {\n          background-image: linear-gradient(141deg, #009e6c 0%, #00d1b2 71%, #00e7eb 100%);\n}\n}\n.hero.is-info {\n    background-color: #209cee;\n    color: #fff;\n}\n.hero.is-info a:not(.button):not(.dropdown-item):not(.tag),\n    .hero.is-info strong {\n      color: inherit;\n}\n.hero.is-info .title {\n      color: #fff;\n}\n.hero.is-info .subtitle {\n      color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-info .subtitle a:not(.button),\n      .hero.is-info .subtitle strong {\n        color: #fff;\n}\n@media screen and (max-width: 1087px) {\n.hero.is-info .navbar-menu {\n        background-color: #209cee;\n}\n}\n.hero.is-info .navbar-item,\n    .hero.is-info .navbar-link {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-info a.navbar-item:hover, .hero.is-info a.navbar-item.is-active,\n    .hero.is-info .navbar-link:hover,\n    .hero.is-info .navbar-link.is-active {\n      background-color: #118fe4;\n      color: #fff;\n}\n.hero.is-info .tabs a {\n      color: #fff;\n      opacity: 0.9;\n}\n.hero.is-info .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-info .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-info .tabs.is-boxed a, .hero.is-info .tabs.is-toggle a {\n      color: #fff;\n}\n.hero.is-info .tabs.is-boxed a:hover, .hero.is-info .tabs.is-toggle a:hover {\n        background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-info .tabs.is-boxed li.is-active a, .hero.is-info .tabs.is-boxed li.is-active a:hover, .hero.is-info .tabs.is-toggle li.is-active a, .hero.is-info .tabs.is-toggle li.is-active a:hover {\n      background-color: #fff;\n      border-color: #fff;\n      color: #209cee;\n}\n.hero.is-info.is-bold {\n      background-image: linear-gradient(141deg, #04a6d7 0%, #209cee 71%, #3287f5 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-info.is-bold .navbar-menu {\n          background-image: linear-gradient(141deg, #04a6d7 0%, #209cee 71%, #3287f5 100%);\n}\n}\n.hero.is-success {\n    background-color: #23d160;\n    color: #fff;\n}\n.hero.is-success a:not(.button):not(.dropdown-item):not(.tag),\n    .hero.is-success strong {\n      color: inherit;\n}\n.hero.is-success .title {\n      color: #fff;\n}\n.hero.is-success .subtitle {\n      color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-success .subtitle a:not(.button),\n      .hero.is-success .subtitle strong {\n        color: #fff;\n}\n@media screen and (max-width: 1087px) {\n.hero.is-success .navbar-menu {\n        background-color: #23d160;\n}\n}\n.hero.is-success .navbar-item,\n    .hero.is-success .navbar-link {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-success a.navbar-item:hover, .hero.is-success a.navbar-item.is-active,\n    .hero.is-success .navbar-link:hover,\n    .hero.is-success .navbar-link.is-active {\n      background-color: #20bc56;\n      color: #fff;\n}\n.hero.is-success .tabs a {\n      color: #fff;\n      opacity: 0.9;\n}\n.hero.is-success .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-success .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-success .tabs.is-boxed a, .hero.is-success .tabs.is-toggle a {\n      color: #fff;\n}\n.hero.is-success .tabs.is-boxed a:hover, .hero.is-success .tabs.is-toggle a:hover {\n        background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-success .tabs.is-boxed li.is-active a, .hero.is-success .tabs.is-boxed li.is-active a:hover, .hero.is-success .tabs.is-toggle li.is-active a, .hero.is-success .tabs.is-toggle li.is-active a:hover {\n      background-color: #fff;\n      border-color: #fff;\n      color: #23d160;\n}\n.hero.is-success.is-bold {\n      background-image: linear-gradient(141deg, #12af2f 0%, #23d160 71%, #2ce28a 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-success.is-bold .navbar-menu {\n          background-image: linear-gradient(141deg, #12af2f 0%, #23d160 71%, #2ce28a 100%);\n}\n}\n.hero.is-warning {\n    background-color: #ffdd57;\n    color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning a:not(.button):not(.dropdown-item):not(.tag),\n    .hero.is-warning strong {\n      color: inherit;\n}\n.hero.is-warning .title {\n      color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning .subtitle {\n      color: rgba(0, 0, 0, 0.9);\n}\n.hero.is-warning .subtitle a:not(.button),\n      .hero.is-warning .subtitle strong {\n        color: rgba(0, 0, 0, 0.7);\n}\n@media screen and (max-width: 1087px) {\n.hero.is-warning .navbar-menu {\n        background-color: #ffdd57;\n}\n}\n.hero.is-warning .navbar-item,\n    .hero.is-warning .navbar-link {\n      color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning a.navbar-item:hover, .hero.is-warning a.navbar-item.is-active,\n    .hero.is-warning .navbar-link:hover,\n    .hero.is-warning .navbar-link.is-active {\n      background-color: #ffd83d;\n      color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning .tabs a {\n      color: rgba(0, 0, 0, 0.7);\n      opacity: 0.9;\n}\n.hero.is-warning .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-warning .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-warning .tabs.is-boxed a, .hero.is-warning .tabs.is-toggle a {\n      color: rgba(0, 0, 0, 0.7);\n}\n.hero.is-warning .tabs.is-boxed a:hover, .hero.is-warning .tabs.is-toggle a:hover {\n        background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-warning .tabs.is-boxed li.is-active a, .hero.is-warning .tabs.is-boxed li.is-active a:hover, .hero.is-warning .tabs.is-toggle li.is-active a, .hero.is-warning .tabs.is-toggle li.is-active a:hover {\n      background-color: rgba(0, 0, 0, 0.7);\n      border-color: rgba(0, 0, 0, 0.7);\n      color: #ffdd57;\n}\n.hero.is-warning.is-bold {\n      background-image: linear-gradient(141deg, #ffaf24 0%, #ffdd57 71%, #fffa70 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-warning.is-bold .navbar-menu {\n          background-image: linear-gradient(141deg, #ffaf24 0%, #ffdd57 71%, #fffa70 100%);\n}\n}\n.hero.is-danger {\n    background-color: #ff3860;\n    color: #fff;\n}\n.hero.is-danger a:not(.button):not(.dropdown-item):not(.tag),\n    .hero.is-danger strong {\n      color: inherit;\n}\n.hero.is-danger .title {\n      color: #fff;\n}\n.hero.is-danger .subtitle {\n      color: rgba(255, 255, 255, 0.9);\n}\n.hero.is-danger .subtitle a:not(.button),\n      .hero.is-danger .subtitle strong {\n        color: #fff;\n}\n@media screen and (max-width: 1087px) {\n.hero.is-danger .navbar-menu {\n        background-color: #ff3860;\n}\n}\n.hero.is-danger .navbar-item,\n    .hero.is-danger .navbar-link {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-danger a.navbar-item:hover, .hero.is-danger a.navbar-item.is-active,\n    .hero.is-danger .navbar-link:hover,\n    .hero.is-danger .navbar-link.is-active {\n      background-color: #ff1f4b;\n      color: #fff;\n}\n.hero.is-danger .tabs a {\n      color: #fff;\n      opacity: 0.9;\n}\n.hero.is-danger .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-danger .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-danger .tabs.is-boxed a, .hero.is-danger .tabs.is-toggle a {\n      color: #fff;\n}\n.hero.is-danger .tabs.is-boxed a:hover, .hero.is-danger .tabs.is-toggle a:hover {\n        background-color: rgba(10, 10, 10, 0.1);\n}\n.hero.is-danger .tabs.is-boxed li.is-active a, .hero.is-danger .tabs.is-boxed li.is-active a:hover, .hero.is-danger .tabs.is-toggle li.is-active a, .hero.is-danger .tabs.is-toggle li.is-active a:hover {\n      background-color: #fff;\n      border-color: #fff;\n      color: #ff3860;\n}\n.hero.is-danger.is-bold {\n      background-image: linear-gradient(141deg, #ff0561 0%, #ff3860 71%, #ff5257 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-danger.is-bold .navbar-menu {\n          background-image: linear-gradient(141deg, #ff0561 0%, #ff3860 71%, #ff5257 100%);\n}\n}\n.hero.is-small .hero-body {\n    padding-bottom: 1.5rem;\n    padding-top: 1.5rem;\n}\n@media screen and (min-width: 769px), print {\n.hero.is-medium .hero-body {\n      padding-bottom: 9rem;\n      padding-top: 9rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.hero.is-large .hero-body {\n      padding-bottom: 18rem;\n      padding-top: 18rem;\n}\n}\n.hero.is-halfheight .hero-body, .hero.is-fullheight .hero-body, .hero.is-fullheight-with-navbar .hero-body {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.hero.is-halfheight .hero-body > .container, .hero.is-fullheight .hero-body > .container, .hero.is-fullheight-with-navbar .hero-body > .container {\n      -webkit-box-flex: 1;\n          -ms-flex-positive: 1;\n              flex-grow: 1;\n      -ms-flex-negative: 1;\n          flex-shrink: 1;\n}\n.hero.is-halfheight {\n    min-height: 50vh;\n}\n.hero.is-fullheight {\n    min-height: 100vh;\n}\n.hero.is-fullheight-with-navbar {\n    min-height: calc(100vh - 3.25rem);\n}\n.hero-video {\n  overflow: hidden;\n}\n.hero-video video {\n    left: 50%;\n    min-height: 100%;\n    min-width: 100%;\n    position: absolute;\n    top: 50%;\n    -webkit-transform: translate3d(-50%, -50%, 0);\n            transform: translate3d(-50%, -50%, 0);\n}\n.hero-video.is-transparent {\n    opacity: 0.3;\n}\n@media screen and (max-width: 768px) {\n.hero-video {\n      display: none;\n}\n}\n.hero-buttons {\n  margin-top: 1.5rem;\n}\n@media screen and (max-width: 768px) {\n.hero-buttons .button {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n}\n.hero-buttons .button:not(:last-child) {\n        margin-bottom: 0.75rem;\n}\n}\n@media screen and (min-width: 769px), print {\n.hero-buttons {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n}\n.hero-buttons .button:not(:last-child) {\n        margin-right: 1.5rem;\n}\n}\n.hero-head,\n.hero-foot {\n  -webkit-box-flex: 0;\n      -ms-flex-positive: 0;\n          flex-grow: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n}\n.hero-body {\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n  padding: 3rem 1.5rem;\n}\n.section {\n  padding: 3rem 1.5rem;\n}\n@media screen and (min-width: 1088px) {\n.section.is-medium {\n      padding: 9rem 1.5rem;\n}\n.section.is-large {\n      padding: 18rem 1.5rem;\n}\n}\n.footer {\n  background-color: #fafafa;\n  padding: 3rem 1.5rem 6rem;\n}\n.is-noscroll {\n  position: fixed;\n  overflow-y: hidden;\n  width: 100%;\n  bottom: 0;\n}\n@-webkit-keyframes fadeOut {\nfrom {\n    opacity: 1;\n}\nto {\n    opacity: 0;\n}\n}\n@keyframes fadeOut {\nfrom {\n    opacity: 1;\n}\nto {\n    opacity: 0;\n}\n}\n.fadeOut {\n  -webkit-animation-name: fadeOut;\n          animation-name: fadeOut;\n}\n@-webkit-keyframes fadeOutDown {\nfrom {\n    opacity: 1;\n}\nto {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n            transform: translate3d(0, 100%, 0);\n}\n}\n@keyframes fadeOutDown {\nfrom {\n    opacity: 1;\n}\nto {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n            transform: translate3d(0, 100%, 0);\n}\n}\n.fadeOutDown {\n  -webkit-animation-name: fadeOutDown;\n          animation-name: fadeOutDown;\n}\n@-webkit-keyframes fadeOutUp {\nfrom {\n    opacity: 1;\n}\nto {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n            transform: translate3d(0, -100%, 0);\n}\n}\n@keyframes fadeOutUp {\nfrom {\n    opacity: 1;\n}\nto {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n            transform: translate3d(0, -100%, 0);\n}\n}\n.fadeOutUp {\n  -webkit-animation-name: fadeOutUp;\n          animation-name: fadeOutUp;\n}\n@-webkit-keyframes fadeIn {\nfrom {\n    opacity: 0;\n}\nto {\n    opacity: 1;\n}\n}\n@keyframes fadeIn {\nfrom {\n    opacity: 0;\n}\nto {\n    opacity: 1;\n}\n}\n.fadeIn {\n  -webkit-animation-name: fadeIn;\n          animation-name: fadeIn;\n}\n@-webkit-keyframes fadeInDown {\nfrom {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n            transform: translate3d(0, -100%, 0);\n}\nto {\n    opacity: 1;\n    -webkit-transform: none;\n            transform: none;\n}\n}\n@keyframes fadeInDown {\nfrom {\n    opacity: 0;\n    -webkit-transform: translate3d(0, -100%, 0);\n            transform: translate3d(0, -100%, 0);\n}\nto {\n    opacity: 1;\n    -webkit-transform: none;\n            transform: none;\n}\n}\n.fadeInDown {\n  -webkit-animation-name: fadeInDown;\n          animation-name: fadeInDown;\n}\n@-webkit-keyframes fadeInUp {\nfrom {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n            transform: translate3d(0, 100%, 0);\n}\nto {\n    opacity: 1;\n    -webkit-transform: none;\n            transform: none;\n}\n}\n@keyframes fadeInUp {\nfrom {\n    opacity: 0;\n    -webkit-transform: translate3d(0, 100%, 0);\n            transform: translate3d(0, 100%, 0);\n}\nto {\n    opacity: 1;\n    -webkit-transform: none;\n            transform: none;\n}\n}\n.fadeInUp {\n  -webkit-animation-name: fadeInUp;\n          animation-name: fadeInUp;\n}\n\n/**\r\n * Vue Transitions\r\n */\n.fade-enter-active,\n.fade-leave-active {\n  -webkit-transition: opacity 150ms ease-out;\n  transition: opacity 150ms ease-out;\n}\n.fade-enter,\n.fade-leave-to {\n  opacity: 0;\n}\n.zoom-in-enter-active,\n.zoom-in-leave-active {\n  -webkit-transition: opacity 150ms ease-out;\n  transition: opacity 150ms ease-out;\n}\n.zoom-in-enter-active .animation-content,\n  .zoom-in-enter-active .animation-content,\n  .zoom-in-leave-active .animation-content,\n  .zoom-in-leave-active .animation-content {\n    -webkit-transition: -webkit-transform 150ms ease-out;\n    transition: -webkit-transform 150ms ease-out;\n    transition: transform 150ms ease-out;\n    transition: transform 150ms ease-out, -webkit-transform 150ms ease-out;\n}\n.zoom-in-enter,\n.zoom-in-leave-active {\n  opacity: 0;\n}\n.zoom-in-enter .animation-content,\n  .zoom-in-enter .animation-content,\n  .zoom-in-leave-active .animation-content,\n  .zoom-in-leave-active .animation-content {\n    -webkit-transform: scale(0.95);\n            transform: scale(0.95);\n}\n.zoom-out-enter-active,\n.zoom-out-leave-active {\n  -webkit-transition: opacity 150ms ease-out;\n  transition: opacity 150ms ease-out;\n}\n.zoom-out-enter-active .animation-content,\n  .zoom-out-enter-active .animation-content,\n  .zoom-out-leave-active .animation-content,\n  .zoom-out-leave-active .animation-content {\n    -webkit-transition: -webkit-transform 150ms ease-out;\n    transition: -webkit-transform 150ms ease-out;\n    transition: transform 150ms ease-out;\n    transition: transform 150ms ease-out, -webkit-transform 150ms ease-out;\n}\n.zoom-out-enter,\n.zoom-out-leave-active {\n  opacity: 0;\n}\n.zoom-out-enter .animation-content,\n  .zoom-out-enter .animation-content,\n  .zoom-out-leave-active .animation-content,\n  .zoom-out-leave-active .animation-content {\n    -webkit-transform: scale(1.05);\n            transform: scale(1.05);\n}\n.slide-next-enter-active,\n.slide-next-leave-active,\n.slide-prev-enter-active,\n.slide-prev-leave-active {\n  -webkit-transition: -webkit-transform 250ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n  transition: -webkit-transform 250ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n  transition: transform 250ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n  transition: transform 250ms cubic-bezier(0.785, 0.135, 0.15, 0.86), -webkit-transform 250ms cubic-bezier(0.785, 0.135, 0.15, 0.86);\n}\n.slide-prev-leave-to, .slide-next-enter {\n  -webkit-transform: translate3d(-100%, 0, 0);\n          transform: translate3d(-100%, 0, 0);\n  position: absolute;\n  width: 100%;\n}\n.slide-prev-enter, .slide-next-leave-to {\n  -webkit-transform: translate3d(100%, 0, 0);\n          transform: translate3d(100%, 0, 0);\n  position: absolute;\n  width: 100%;\n}\n.autocomplete {\n  position: relative;\n}\n.autocomplete .dropdown-menu {\n    display: block;\n    min-width: 100%;\n    max-width: 100%;\n}\n.autocomplete .dropdown-menu.is-opened-top {\n      top: auto;\n      bottom: 100%;\n}\n.autocomplete .dropdown-content {\n    overflow: auto;\n    max-height: 200px;\n}\n.autocomplete .dropdown-item, .autocomplete .dropdown .dropdown-menu .has-link a, .dropdown .dropdown-menu .has-link .autocomplete a {\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n.autocomplete .dropdown-item.is-hovered, .autocomplete .dropdown .dropdown-menu .has-link a.is-hovered, .dropdown .dropdown-menu .has-link .autocomplete a.is-hovered {\n      background: whitesmoke;\n      color: #0a0a0a;\n}\n.autocomplete .dropdown-item.is-disabled, .autocomplete .dropdown .dropdown-menu .has-link a.is-disabled, .dropdown .dropdown-menu .has-link .autocomplete a.is-disabled {\n      opacity: 0.5;\n      cursor: not-allowed;\n}\n.autocomplete.is-small {\n    border-radius: 2px;\n    font-size: 0.75rem;\n}\n.autocomplete.is-medium {\n    font-size: 1.25rem;\n}\n.autocomplete.is-large {\n    font-size: 1.5rem;\n}\n.b-checkbox.checkbox {\n  outline: none;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.b-checkbox.checkbox + .checkbox {\n    margin-left: 0.5em;\n}\n.b-checkbox.checkbox input[type=checkbox] {\n    position: absolute;\n    left: 0;\n    opacity: 0;\n    outline: none;\n    z-index: -1;\n}\n.b-checkbox.checkbox input[type=checkbox] + .check {\n      width: 1.25em;\n      height: 1.25em;\n      -ms-flex-negative: 0;\n          flex-shrink: 0;\n      border-radius: 4px;\n      border: 2px solid #7a7a7a;\n      -webkit-transition: background 150ms ease-out;\n      transition: background 150ms ease-out;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check {\n      background: #00d1b2 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:%23fff' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n      border-color: #00d1b2;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check.is-white {\n        background: white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:%230a0a0a' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n        border-color: white;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check.is-black {\n        background: #0a0a0a url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:white' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #0a0a0a;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check.is-light {\n        background: whitesmoke url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:%23363636' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n        border-color: whitesmoke;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check.is-dark {\n        background: #0a0a0a url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:whitesmoke' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #0a0a0a;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check.is-primary {\n        background: #00d1b2 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:%23fff' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #00d1b2;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check.is-info {\n        background: #209cee url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:%23fff' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #209cee;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check.is-success {\n        background: #23d160 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:%23fff' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #23d160;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check.is-warning {\n        background: #ffdd57 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:rgba(0, 0, 0, 0.7)' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #ffdd57;\n}\n.b-checkbox.checkbox input[type=checkbox]:checked + .check.is-danger {\n        background: #ff3860 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:%23fff' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #ff3860;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check {\n      background: #00d1b2 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:%23fff' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n      border-color: #00d1b2;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check.is-white {\n        background: white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:%230a0a0a' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n        border-color: white;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check.is-black {\n        background: #0a0a0a url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:white' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #0a0a0a;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check.is-light {\n        background: whitesmoke url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:%23363636' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n        border-color: whitesmoke;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check.is-dark {\n        background: #0a0a0a url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:whitesmoke' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #0a0a0a;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check.is-primary {\n        background: #00d1b2 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:%23fff' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #00d1b2;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check.is-info {\n        background: #209cee url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:%23fff' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #209cee;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check.is-success {\n        background: #23d160 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:%23fff' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #23d160;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check.is-warning {\n        background: #ffdd57 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:rgba(0, 0, 0, 0.7)' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #ffdd57;\n}\n.b-checkbox.checkbox input[type=checkbox]:indeterminate + .check.is-danger {\n        background: #ff3860 url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect style='fill:%23fff' width='0.7' height='0.2' x='.15' y='.4'%3E%3C/rect%3E%3C/svg%3E\") no-repeat center center;\n        border-color: #ff3860;\n}\n.b-checkbox.checkbox .control-label {\n    padding-left: 0.5em;\n}\n.b-checkbox.checkbox[disabled] {\n    opacity: 0.5;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check {\n    border-color: #00d1b2;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check.is-white {\n      border-color: white;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check.is-black {\n      border-color: #0a0a0a;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check.is-light {\n      border-color: whitesmoke;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check.is-dark {\n      border-color: #0a0a0a;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check.is-primary {\n      border-color: #00d1b2;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check.is-info {\n      border-color: #209cee;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check.is-success {\n      border-color: #23d160;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check.is-warning {\n      border-color: #ffdd57;\n}\n.b-checkbox.checkbox:hover input[type=checkbox] + .check.is-danger {\n      border-color: #ff3860;\n}\n.b-checkbox.checkbox:focus input[type=checkbox] + .check {\n    -webkit-box-shadow: 0 0 0.5em rgba(122, 122, 122, 0.8);\n            box-shadow: 0 0 0.5em rgba(122, 122, 122, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check {\n    -webkit-box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n            box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check.is-white {\n      -webkit-box-shadow: 0 0 0.5em rgba(255, 255, 255, 0.8);\n              box-shadow: 0 0 0.5em rgba(255, 255, 255, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check.is-black {\n      -webkit-box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n              box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check.is-light {\n      -webkit-box-shadow: 0 0 0.5em rgba(245, 245, 245, 0.8);\n              box-shadow: 0 0 0.5em rgba(245, 245, 245, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check.is-dark {\n      -webkit-box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n              box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check.is-primary {\n      -webkit-box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n              box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check.is-info {\n      -webkit-box-shadow: 0 0 0.5em rgba(32, 156, 238, 0.8);\n              box-shadow: 0 0 0.5em rgba(32, 156, 238, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check.is-success {\n      -webkit-box-shadow: 0 0 0.5em rgba(35, 209, 96, 0.8);\n              box-shadow: 0 0 0.5em rgba(35, 209, 96, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check.is-warning {\n      -webkit-box-shadow: 0 0 0.5em rgba(255, 221, 87, 0.8);\n              box-shadow: 0 0 0.5em rgba(255, 221, 87, 0.8);\n}\n.b-checkbox.checkbox:focus input[type=checkbox]:checked + .check.is-danger {\n      -webkit-box-shadow: 0 0 0.5em rgba(255, 56, 96, 0.8);\n              box-shadow: 0 0 0.5em rgba(255, 56, 96, 0.8);\n}\n.b-checkbox.checkbox.is-small {\n    border-radius: 2px;\n    font-size: 0.75rem;\n}\n.b-checkbox.checkbox.is-medium {\n    font-size: 1.25rem;\n}\n.b-checkbox.checkbox.is-large {\n    font-size: 1.5rem;\n}\n.collapse .collapse-trigger {\n  display: inline;\n  cursor: pointer;\n}\n.collapse .collapse-content {\n  display: inherit;\n}\n.datepicker {\n  font-size: 0.875rem;\n}\n.datepicker .dropdown,\n  .datepicker .dropdown-trigger {\n    width: 100%;\n}\n.datepicker .dropdown-item, .datepicker .dropdown .dropdown-menu .has-link a, .dropdown .dropdown-menu .has-link .datepicker a {\n    font-size: inherit;\n}\n.datepicker .datepicker-header {\n    padding-bottom: 0.875rem;\n    margin-bottom: 0.875rem;\n    border-bottom: 1px solid #dbdbdb;\n}\n.datepicker .datepicker-footer {\n    padding-top: 0.875rem;\n    border-top: 1px solid #dbdbdb;\n}\n.datepicker .datepicker-table {\n    display: table;\n    margin: 0 auto 0.875rem auto;\n}\n.datepicker .datepicker-table .datepicker-cell {\n      text-align: center;\n      vertical-align: middle;\n      display: table-cell;\n      border-radius: 4px;\n      padding: 0.5rem 0.75rem;\n}\n.datepicker .datepicker-table .datepicker-header {\n      display: table-header-group;\n}\n.datepicker .datepicker-table .datepicker-header .datepicker-cell {\n        color: #7a7a7a;\n        font-weight: 600;\n}\n.datepicker .datepicker-table .datepicker-body {\n      display: table-row-group;\n}\n.datepicker .datepicker-table .datepicker-body .datepicker-row {\n        display: table-row;\n}\n.datepicker .datepicker-table .datepicker-body .datepicker-row .datepicker-cell.is-unselectable {\n          color: #b5b5b5;\n}\n.datepicker .datepicker-table .datepicker-body .datepicker-row .datepicker-cell.is-today {\n          border: solid 1px rgba(0, 209, 178, 0.5);\n}\n.datepicker .datepicker-table .datepicker-body .datepicker-row .datepicker-cell.is-selectable {\n          color: #4a4a4a;\n}\n.datepicker .datepicker-table .datepicker-body .datepicker-row .datepicker-cell.is-selectable:hover:not(.is-selected), .datepicker .datepicker-table .datepicker-body .datepicker-row .datepicker-cell.is-selectable:focus:not(.is-selected) {\n            background-color: whitesmoke;\n            color: #0a0a0a;\n            cursor: pointer;\n}\n.datepicker .datepicker-table .datepicker-body .datepicker-row .datepicker-cell.is-selected {\n          background-color: #00d1b2;\n          color: #fff;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell {\n        padding: 0.3rem 0.75rem 0.75rem;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event {\n          position: relative;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events {\n            bottom: .425rem;\n            display: -webkit-box;\n            display: -ms-flexbox;\n            display: flex;\n            -webkit-box-pack: center;\n                -ms-flex-pack: center;\n                    justify-content: center;\n            left: 0;\n            padding: 0 .35rem;\n            position: absolute;\n            width: 100%;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events .event.is-white {\n              background-color: white;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events .event.is-black {\n              background-color: #0a0a0a;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events .event.is-light {\n              background-color: whitesmoke;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events .event.is-dark {\n              background-color: #0a0a0a;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events .event.is-primary {\n              background-color: #00d1b2;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events .event.is-info {\n              background-color: #209cee;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events .event.is-success {\n              background-color: #23d160;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events .event.is-warning {\n              background-color: #ffdd57;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event .events .event.is-danger {\n              background-color: #ff3860;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event.dots .event {\n            border-radius: 50%;\n            height: .35em;\n            margin: 0 .1em;\n            width: .35em;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.has-event.bars .event {\n            height: .25em;\n            width: 100%;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.is-selected {\n          overflow: hidden;\n}\n.datepicker .datepicker-table .datepicker-body.has-events .datepicker-cell.is-selected .events .event.is-primary {\n            background-color: #1fffdd;\n}\n.datepicker.is-small {\n    border-radius: 2px;\n    font-size: 0.75rem;\n}\n.datepicker.is-medium {\n    font-size: 1.25rem;\n}\n.datepicker.is-large {\n    font-size: 1.5rem;\n}\n@media screen and (min-width: 769px) and (max-width: 1087px) {\n.datepicker .datepicker-table .datepicker-cell {\n      padding: 0.75rem 1rem;\n}\n}\n@media screen and (max-width: 768px) {\n.datepicker .datepicker-table .datepicker-cell {\n      padding: 0.25rem 0.5rem;\n}\n}\n.dialog .modal-card {\n  max-width: 460px;\n  width: auto;\n}\n.dialog .modal-card .modal-card-head {\n    font-size: 1.25rem;\n    font-weight: 600;\n}\n.dialog .modal-card .modal-card-body .field {\n    margin-top: 16px;\n}\n.dialog .modal-card .modal-card-body.is-titleless {\n    border-top-left-radius: 6px;\n    border-top-right-radius: 6px;\n}\n.dialog .modal-card .modal-card-foot {\n    -webkit-box-pack: end;\n        -ms-flex-pack: end;\n            justify-content: flex-end;\n}\n.dialog .modal-card .modal-card-foot .button {\n      display: inline;\n      min-width: 5em;\n      font-weight: 600;\n}\n@media screen and (min-width: 769px), print {\n.dialog .modal-card {\n      min-width: 320px;\n}\n}\n.dialog.is-small .modal-card,\n.dialog.is-small .input,\n.dialog.is-small .taginput .taginput-container.is-focusable,\n.taginput .dialog.is-small .taginput-container.is-focusable,\n.dialog.is-small .button {\n  border-radius: 2px;\n  font-size: 0.75rem;\n}\n.dialog.is-medium .modal-card,\n.dialog.is-medium .input,\n.dialog.is-medium .taginput .taginput-container.is-focusable,\n.taginput .dialog.is-medium .taginput-container.is-focusable,\n.dialog.is-medium .button {\n  font-size: 1.25rem;\n}\n.dialog.is-large .modal-card,\n.dialog.is-large .input,\n.dialog.is-large .taginput .taginput-container.is-focusable,\n.taginput .dialog.is-large .taginput-container.is-focusable,\n.dialog.is-large .button {\n  font-size: 1.5rem;\n}\n.dropdown + .dropdown {\n  margin-left: 0.5em;\n}\n.dropdown .background {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  position: fixed;\n  background-color: rgba(10, 10, 10, 0.86);\n  z-index: 10;\n  cursor: pointer;\n}\n@media screen and (min-width: 1088px) {\n.dropdown .background {\n      display: none;\n}\n}\n.dropdown .dropdown-menu .dropdown-item.is-disabled, .dropdown .dropdown-menu .has-link a.is-disabled {\n  cursor: not-allowed;\n}\n.dropdown .dropdown-menu .dropdown-item.is-disabled:hover, .dropdown .dropdown-menu .has-link a.is-disabled:hover {\n    background: inherit;\n    color: inherit;\n}\n.dropdown .dropdown-menu .has-link a {\n  padding-right: 3rem;\n  white-space: nowrap;\n}\n.dropdown:not(.is-disabled) .dropdown-menu .dropdown-item.is-disabled, .dropdown:not(.is-disabled) .dropdown-menu .has-link a.is-disabled {\n  opacity: 0.5;\n}\n.dropdown .navbar-item {\n  height: 100%;\n}\n.dropdown.is-disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n.dropdown.is-disabled .dropdown-trigger {\n    pointer-events: none;\n}\n.dropdown.is-inline .dropdown-menu {\n  position: static;\n  display: inline-block;\n  padding: 0;\n}\n.dropdown.is-top-right .dropdown-menu {\n  top: auto;\n  bottom: 100%;\n}\n.dropdown.is-top-left .dropdown-menu {\n  top: auto;\n  bottom: 100%;\n  right: 0;\n  left: auto;\n}\n.dropdown.is-bottom-left .dropdown-menu {\n  right: 0;\n  left: auto;\n}\n@media screen and (max-width: 1087px) {\n.dropdown.is-mobile-modal .dropdown-menu {\n    position: fixed;\n    width: calc(100vw - 40px);\n    max-width: 460px;\n    max-height: calc(100vh - 120px);\n    top: 25% !important;\n    left: 50% !important;\n    bottom: auto !important;\n    right: auto !important;\n    -webkit-transform: translate3d(-50%, -25%, 0);\n            transform: translate3d(-50%, -25%, 0);\n    white-space: normal;\n    overflow-y: auto;\n}\n.dropdown.is-mobile-modal .dropdown-menu .dropdown-item, .dropdown.is-mobile-modal .dropdown-menu .has-link a {\n      padding: 1rem 1.5rem;\n}\n}\n.label {\n  font-weight: 600;\n}\n.field.is-grouped .field {\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n}\n.field.is-grouped .field + .field {\n    margin-left: 0.75rem;\n}\n.field.is-grouped .field.is-expanded {\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    -ms-flex-negative: 1;\n        flex-shrink: 1;\n}\n.field.has-addons .control:first-child .control .button,\n.field.has-addons .control:first-child .control .input,\n.field.has-addons .control:first-child .control .taginput .taginput-container.is-focusable,\n.taginput .field.has-addons .control:first-child .control .taginput-container.is-focusable,\n.field.has-addons .control:first-child .control .select select {\n  border-bottom-left-radius: 4px;\n  border-top-left-radius: 4px;\n}\n.field.has-addons .control:last-child .control .button,\n.field.has-addons .control:last-child .control .input,\n.field.has-addons .control:last-child .control .taginput .taginput-container.is-focusable,\n.taginput .field.has-addons .control:last-child .control .taginput-container.is-focusable,\n.field.has-addons .control:last-child .control .select select {\n  border-bottom-right-radius: 4px;\n  border-top-right-radius: 4px;\n}\n.field.has-addons .control .control .button,\n.field.has-addons .control .control .input,\n.field.has-addons .control .control .taginput .taginput-container.is-focusable,\n.taginput .field.has-addons .control .control .taginput-container.is-focusable,\n.field.has-addons .control .control .select select {\n  border-radius: 0;\n}\n.control .help.counter {\n  float: right;\n  margin-left: 0.5em;\n}\n.control .icon.is-clickable {\n  pointer-events: auto;\n  cursor: pointer;\n}\n.icon {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  cursor: inherit;\n}\n.icon svg {\n    background-color: transparent;\n    fill: currentColor;\n    stroke-width: 0;\n    stroke: currentColor;\n    pointer-events: none;\n    width: 1.5rem;\n    height: 1.5rem;\n}\n.loading-overlay {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: none;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  overflow: hidden;\n}\n.loading-overlay.is-active {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.loading-overlay.is-full-page {\n    z-index: 999;\n    position: fixed;\n}\n.loading-overlay.is-full-page .loading-icon:after {\n      top: calc(50% - 2.5em);\n      left: calc(50% - 2.5em);\n      width: 5em;\n      height: 5em;\n}\n.loading-overlay .loading-background {\n    bottom: 0;\n    left: 0;\n    position: absolute;\n    right: 0;\n    top: 0;\n    background: #7f7f7f;\n    background: rgba(255, 255, 255, 0.5);\n}\n.loading-overlay .loading-icon {\n    position: relative;\n}\n.loading-overlay .loading-icon:after {\n      -webkit-animation: spinAround 500ms infinite linear;\n              animation: spinAround 500ms infinite linear;\n      border: 2px solid #dbdbdb;\n      border-radius: 290486px;\n      border-right-color: transparent;\n      border-top-color: transparent;\n      content: \"\";\n      display: block;\n      height: 1em;\n      position: relative;\n      width: 1em;\n      position: absolute;\n      top: calc(50% - 1.5em);\n      left: calc(50% - 1.5em);\n      width: 3em;\n      height: 3em;\n      border-width: 0.25em;\n}\n.message .media,\n.notification .media {\n  padding-top: 0;\n  border: 0;\n}\n.notification > .delete {\n  right: 0.5rem !important;\n  top: 0.5rem !important;\n}\n.modal .animation-content {\n  margin: 0 20px;\n}\n.modal .animation-content .modal-card {\n    margin: 0;\n}\n@media screen and (max-width: 768px) {\n.modal .animation-content {\n      width: 100%;\n}\n}\n.notices {\n  position: fixed;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 2em;\n  overflow: hidden;\n  z-index: 1000;\n  pointer-events: none;\n}\n.notices .toast {\n    display: -webkit-inline-box;\n    display: -ms-inline-flexbox;\n    display: inline-flex;\n    -webkit-animation-duration: 150ms;\n            animation-duration: 150ms;\n    margin: 0.5em 0;\n    text-align: center;\n    -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);\n            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);\n    border-radius: 2em;\n    padding: 0.75em 1.5em;\n    pointer-events: auto;\n    opacity: 0.92;\n}\n.notices .toast.is-white {\n      color: #0a0a0a;\n      background: white;\n}\n.notices .toast.is-black {\n      color: white;\n      background: #0a0a0a;\n}\n.notices .toast.is-light {\n      color: #363636;\n      background: whitesmoke;\n}\n.notices .toast.is-dark {\n      color: whitesmoke;\n      background: #0a0a0a;\n}\n.notices .toast.is-primary {\n      color: #fff;\n      background: #00d1b2;\n}\n.notices .toast.is-info {\n      color: #fff;\n      background: #209cee;\n}\n.notices .toast.is-success {\n      color: #fff;\n      background: #23d160;\n}\n.notices .toast.is-warning {\n      color: rgba(0, 0, 0, 0.7);\n      background: #ffdd57;\n}\n.notices .toast.is-danger {\n      color: #fff;\n      background: #ff3860;\n}\n.notices .snackbar {\n    display: -webkit-inline-box;\n    display: -ms-inline-flexbox;\n    display: inline-flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    -ms-flex-pack: distribute;\n        justify-content: space-around;\n    -webkit-animation-duration: 150ms;\n            animation-duration: 150ms;\n    margin: 0.5em 0;\n    -webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);\n            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);\n    border-radius: 4px;\n    pointer-events: auto;\n    background: #0a0a0a;\n    color: whitesmoke;\n    min-height: 3em;\n}\n.notices .snackbar .text {\n      padding: 0.5em 1em;\n}\n.notices .snackbar .action {\n      margin-left: auto;\n      padding: 0.5em;\n      padding-left: 0;\n}\n.notices .snackbar .action .button {\n        font-weight: 600;\n        text-transform: uppercase;\n}\n.notices .snackbar .action.is-white .button {\n        color: white;\n}\n.notices .snackbar .action.is-black .button {\n        color: #0a0a0a;\n}\n.notices .snackbar .action.is-light .button {\n        color: whitesmoke;\n}\n.notices .snackbar .action.is-dark .button {\n        color: #0a0a0a;\n}\n.notices .snackbar .action.is-primary .button {\n        color: #00d1b2;\n}\n.notices .snackbar .action.is-info .button {\n        color: #209cee;\n}\n.notices .snackbar .action.is-success .button {\n        color: #23d160;\n}\n.notices .snackbar .action.is-warning .button {\n        color: #ffdd57;\n}\n.notices .snackbar .action.is-danger .button {\n        color: #ff3860;\n}\n@media screen and (max-width: 768px) {\n.notices .snackbar {\n        width: 100%;\n        margin: 0;\n        border-radius: 0;\n}\n}\n@media screen and (min-width: 769px), print {\n.notices .snackbar {\n        min-width: 350px;\n        max-width: 600px;\n        overflow: hidden;\n}\n}\n.notices .toast.is-top, .notices .toast.is-bottom,\n  .notices .snackbar.is-top,\n  .notices .snackbar.is-bottom {\n    -ms-flex-item-align: center;\n        align-self: center;\n}\n.notices .toast.is-top-right, .notices .toast.is-bottom-right,\n  .notices .snackbar.is-top-right,\n  .notices .snackbar.is-bottom-right {\n    -ms-flex-item-align: end;\n        align-self: flex-end;\n}\n.notices .toast.is-top-left, .notices .toast.is-bottom-left,\n  .notices .snackbar.is-top-left,\n  .notices .snackbar.is-bottom-left {\n    -ms-flex-item-align: start;\n        align-self: flex-start;\n}\n.notices .toast.is-toast,\n  .notices .snackbar.is-toast {\n    opacity: 0.92;\n}\n.notices.is-top {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n}\n.notices.is-bottom {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: reverse;\n        -ms-flex-direction: column-reverse;\n            flex-direction: column-reverse;\n}\n.notices.has-custom-container {\n    position: absolute;\n}\n@media screen and (max-width: 768px) {\n.notices {\n      padding: 0;\n      position: fixed !important;\n}\n}\n.pagination .pagination-next,\n.pagination .pagination-previous {\n  padding-left: 0.25em;\n  padding-right: 0.25em;\n}\n.pagination .pagination-next.is-disabled,\n  .pagination .pagination-previous.is-disabled {\n    pointer-events: none;\n    cursor: not-allowed;\n    opacity: 0.5;\n}\n.pagination.is-simple {\n  -webkit-box-pack: normal;\n      -ms-flex-pack: normal;\n          justify-content: normal;\n}\n.pagination .is-current {\n  pointer-events: none;\n  cursor: not-allowed;\n}\n.b-radio.radio {\n  outline: none;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.b-radio.radio + .radio {\n    margin-left: 0.5em;\n}\n.b-radio.radio input[type=radio] {\n    position: absolute;\n    left: 0;\n    opacity: 0;\n    outline: none;\n    z-index: -1;\n}\n.b-radio.radio input[type=radio] + .check {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n      -ms-flex-negative: 0;\n          flex-shrink: 0;\n      width: 1.25em;\n      height: 1.25em;\n      border: 2px solid #7a7a7a;\n      border-radius: 50%;\n      -webkit-transition: background 150ms ease-out;\n      transition: background 150ms ease-out;\n}\n.b-radio.radio input[type=radio] + .check:before {\n        content: \"\";\n        border-radius: 50%;\n        width: 0.625em;\n        height: 0.625em;\n        background: #00d1b2;\n        -webkit-transform: scale(0);\n                transform: scale(0);\n        -webkit-transition: -webkit-transform 150ms ease-out;\n        transition: -webkit-transform 150ms ease-out;\n        transition: transform 150ms ease-out;\n        transition: transform 150ms ease-out, -webkit-transform 150ms ease-out;\n}\n.b-radio.radio input[type=radio] + .check.is-white:before {\n        background: white;\n}\n.b-radio.radio input[type=radio] + .check.is-black:before {\n        background: #0a0a0a;\n}\n.b-radio.radio input[type=radio] + .check.is-light:before {\n        background: whitesmoke;\n}\n.b-radio.radio input[type=radio] + .check.is-dark:before {\n        background: #0a0a0a;\n}\n.b-radio.radio input[type=radio] + .check.is-primary:before {\n        background: #00d1b2;\n}\n.b-radio.radio input[type=radio] + .check.is-info:before {\n        background: #209cee;\n}\n.b-radio.radio input[type=radio] + .check.is-success:before {\n        background: #23d160;\n}\n.b-radio.radio input[type=radio] + .check.is-warning:before {\n        background: #ffdd57;\n}\n.b-radio.radio input[type=radio] + .check.is-danger:before {\n        background: #ff3860;\n}\n.b-radio.radio input[type=radio]:checked + .check {\n      border-color: #00d1b2;\n}\n.b-radio.radio input[type=radio]:checked + .check.is-white {\n        border-color: white;\n}\n.b-radio.radio input[type=radio]:checked + .check.is-black {\n        border-color: #0a0a0a;\n}\n.b-radio.radio input[type=radio]:checked + .check.is-light {\n        border-color: whitesmoke;\n}\n.b-radio.radio input[type=radio]:checked + .check.is-dark {\n        border-color: #0a0a0a;\n}\n.b-radio.radio input[type=radio]:checked + .check.is-primary {\n        border-color: #00d1b2;\n}\n.b-radio.radio input[type=radio]:checked + .check.is-info {\n        border-color: #209cee;\n}\n.b-radio.radio input[type=radio]:checked + .check.is-success {\n        border-color: #23d160;\n}\n.b-radio.radio input[type=radio]:checked + .check.is-warning {\n        border-color: #ffdd57;\n}\n.b-radio.radio input[type=radio]:checked + .check.is-danger {\n        border-color: #ff3860;\n}\n.b-radio.radio input[type=radio]:checked + .check:before {\n        -webkit-transform: scale(1);\n                transform: scale(1);\n}\n.b-radio.radio .control-label {\n    padding-left: 0.5em;\n}\n.b-radio.radio[disabled] {\n    opacity: 0.5;\n}\n.b-radio.radio:hover input[type=radio] + .check {\n    border-color: #00d1b2;\n}\n.b-radio.radio:hover input[type=radio] + .check.is-white {\n      border-color: white;\n}\n.b-radio.radio:hover input[type=radio] + .check.is-black {\n      border-color: #0a0a0a;\n}\n.b-radio.radio:hover input[type=radio] + .check.is-light {\n      border-color: whitesmoke;\n}\n.b-radio.radio:hover input[type=radio] + .check.is-dark {\n      border-color: #0a0a0a;\n}\n.b-radio.radio:hover input[type=radio] + .check.is-primary {\n      border-color: #00d1b2;\n}\n.b-radio.radio:hover input[type=radio] + .check.is-info {\n      border-color: #209cee;\n}\n.b-radio.radio:hover input[type=radio] + .check.is-success {\n      border-color: #23d160;\n}\n.b-radio.radio:hover input[type=radio] + .check.is-warning {\n      border-color: #ffdd57;\n}\n.b-radio.radio:hover input[type=radio] + .check.is-danger {\n      border-color: #ff3860;\n}\n.b-radio.radio:focus input[type=radio] + .check {\n    -webkit-box-shadow: 0 0 0.5em rgba(122, 122, 122, 0.8);\n            box-shadow: 0 0 0.5em rgba(122, 122, 122, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check {\n    -webkit-box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n            box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check.is-white {\n      -webkit-box-shadow: 0 0 0.5em rgba(255, 255, 255, 0.8);\n              box-shadow: 0 0 0.5em rgba(255, 255, 255, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check.is-black {\n      -webkit-box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n              box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check.is-light {\n      -webkit-box-shadow: 0 0 0.5em rgba(245, 245, 245, 0.8);\n              box-shadow: 0 0 0.5em rgba(245, 245, 245, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check.is-dark {\n      -webkit-box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n              box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check.is-primary {\n      -webkit-box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n              box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check.is-info {\n      -webkit-box-shadow: 0 0 0.5em rgba(32, 156, 238, 0.8);\n              box-shadow: 0 0 0.5em rgba(32, 156, 238, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check.is-success {\n      -webkit-box-shadow: 0 0 0.5em rgba(35, 209, 96, 0.8);\n              box-shadow: 0 0 0.5em rgba(35, 209, 96, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check.is-warning {\n      -webkit-box-shadow: 0 0 0.5em rgba(255, 221, 87, 0.8);\n              box-shadow: 0 0 0.5em rgba(255, 221, 87, 0.8);\n}\n.b-radio.radio:focus input[type=radio]:checked + .check.is-danger {\n      -webkit-box-shadow: 0 0 0.5em rgba(255, 56, 96, 0.8);\n              box-shadow: 0 0 0.5em rgba(255, 56, 96, 0.8);\n}\n.b-radio.radio.is-small {\n    border-radius: 2px;\n    font-size: 0.75rem;\n}\n.b-radio.radio.is-medium {\n    font-size: 1.25rem;\n}\n.b-radio.radio.is-large {\n    font-size: 1.5rem;\n}\n.select select {\n  padding-right: 2.5em;\n}\n.select select option {\n    color: #4a4a4a;\n    padding: 0.25em 0.5em;\n}\n.select select option:disabled {\n    cursor: not-allowed;\n    opacity: 0.5;\n}\n.select select optgroup {\n    color: #b5b5b5;\n    font-weight: 400;\n    font-style: normal;\n    padding: 0.25em 0;\n}\n.select.is-empty select {\n  color: rgba(122, 122, 122, 0.7);\n}\n.switch {\n  cursor: pointer;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.switch + .switch {\n    margin-left: 0.5em;\n}\n.switch input[type=checkbox] {\n    display: none;\n}\n.switch input[type=checkbox] + .check {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -ms-flex-negative: 0;\n          flex-shrink: 0;\n      width: 2.75em;\n      height: 1.575em;\n      padding: 0.2em;\n      background: #b5b5b5;\n      border-radius: 1em;\n      -webkit-transition: background 150ms ease-out;\n      transition: background 150ms ease-out;\n}\n.switch input[type=checkbox] + .check:before {\n        content: \"\";\n        display: block;\n        border-radius: 1em;\n        width: 1.175em;\n        height: 1.175em;\n        background: whitesmoke;\n        -webkit-box-shadow: 0 3px 1px 0 rgba(0, 0, 0, 0.05), 0 2px 2px 0 rgba(0, 0, 0, 0.1), 0 3px 3px 0 rgba(0, 0, 0, 0.05);\n                box-shadow: 0 3px 1px 0 rgba(0, 0, 0, 0.05), 0 2px 2px 0 rgba(0, 0, 0, 0.1), 0 3px 3px 0 rgba(0, 0, 0, 0.05);\n        -webkit-transition: width 150ms ease-out, -webkit-transform 150ms ease-out;\n        transition: width 150ms ease-out, -webkit-transform 150ms ease-out;\n        transition: transform 150ms ease-out, width 150ms ease-out;\n        transition: transform 150ms ease-out, width 150ms ease-out, -webkit-transform 150ms ease-out;\n        will-change: transform;\n}\n.switch input[type=checkbox] + .check.is-elastic:before {\n        width: 1.75em;\n}\n.switch input[type=checkbox]:checked + .check {\n      background: #00d1b2;\n}\n.switch input[type=checkbox]:checked + .check.is-white {\n        background: white;\n}\n.switch input[type=checkbox]:checked + .check.is-black {\n        background: #0a0a0a;\n}\n.switch input[type=checkbox]:checked + .check.is-light {\n        background: whitesmoke;\n}\n.switch input[type=checkbox]:checked + .check.is-dark {\n        background: #0a0a0a;\n}\n.switch input[type=checkbox]:checked + .check.is-primary {\n        background: #00d1b2;\n}\n.switch input[type=checkbox]:checked + .check.is-info {\n        background: #209cee;\n}\n.switch input[type=checkbox]:checked + .check.is-success {\n        background: #23d160;\n}\n.switch input[type=checkbox]:checked + .check.is-warning {\n        background: #ffdd57;\n}\n.switch input[type=checkbox]:checked + .check.is-danger {\n        background: #ff3860;\n}\n.switch input[type=checkbox]:checked + .check:before {\n        -webkit-transform: translate3d(100%, 0, 0);\n                transform: translate3d(100%, 0, 0);\n}\n.switch input[type=checkbox]:checked + .check.is-elastic:before {\n        -webkit-transform: translate3d(36.36364%, 0, 0);\n                transform: translate3d(36.36364%, 0, 0);\n}\n.switch .control-label {\n    padding-left: 0.5em;\n}\n.switch:hover input[type=checkbox] + .check {\n    background: rgba(181, 181, 181, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check {\n    background: rgba(0, 209, 178, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check.is-white {\n      background: rgba(255, 255, 255, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check.is-black {\n      background: rgba(10, 10, 10, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check.is-light {\n      background: rgba(245, 245, 245, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check.is-dark {\n      background: rgba(10, 10, 10, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check.is-primary {\n      background: rgba(0, 209, 178, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check.is-info {\n      background: rgba(32, 156, 238, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check.is-success {\n      background: rgba(35, 209, 96, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check.is-warning {\n      background: rgba(255, 221, 87, 0.9);\n}\n.switch:hover input[type=checkbox]:checked + .check.is-danger {\n      background: rgba(255, 56, 96, 0.9);\n}\n.switch:focus {\n    outline: none;\n}\n.switch:focus input[type=checkbox] + .check {\n      -webkit-box-shadow: 0 0 0.5em rgba(122, 122, 122, 0.6);\n              box-shadow: 0 0 0.5em rgba(122, 122, 122, 0.6);\n}\n.switch:focus input[type=checkbox]:checked + .check {\n      -webkit-box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n              box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n}\n.switch:focus input[type=checkbox]:checked + .check.is-white {\n        -webkit-box-shadow: 0 0 0.5em rgba(255, 255, 255, 0.8);\n                box-shadow: 0 0 0.5em rgba(255, 255, 255, 0.8);\n}\n.switch:focus input[type=checkbox]:checked + .check.is-black {\n        -webkit-box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n                box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n}\n.switch:focus input[type=checkbox]:checked + .check.is-light {\n        -webkit-box-shadow: 0 0 0.5em rgba(245, 245, 245, 0.8);\n                box-shadow: 0 0 0.5em rgba(245, 245, 245, 0.8);\n}\n.switch:focus input[type=checkbox]:checked + .check.is-dark {\n        -webkit-box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n                box-shadow: 0 0 0.5em rgba(10, 10, 10, 0.8);\n}\n.switch:focus input[type=checkbox]:checked + .check.is-primary {\n        -webkit-box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n                box-shadow: 0 0 0.5em rgba(0, 209, 178, 0.8);\n}\n.switch:focus input[type=checkbox]:checked + .check.is-info {\n        -webkit-box-shadow: 0 0 0.5em rgba(32, 156, 238, 0.8);\n                box-shadow: 0 0 0.5em rgba(32, 156, 238, 0.8);\n}\n.switch:focus input[type=checkbox]:checked + .check.is-success {\n        -webkit-box-shadow: 0 0 0.5em rgba(35, 209, 96, 0.8);\n                box-shadow: 0 0 0.5em rgba(35, 209, 96, 0.8);\n}\n.switch:focus input[type=checkbox]:checked + .check.is-warning {\n        -webkit-box-shadow: 0 0 0.5em rgba(255, 221, 87, 0.8);\n                box-shadow: 0 0 0.5em rgba(255, 221, 87, 0.8);\n}\n.switch:focus input[type=checkbox]:checked + .check.is-danger {\n        -webkit-box-shadow: 0 0 0.5em rgba(255, 56, 96, 0.8);\n                box-shadow: 0 0 0.5em rgba(255, 56, 96, 0.8);\n}\n.switch.is-small {\n    border-radius: 2px;\n    font-size: 0.75rem;\n}\n.switch.is-medium {\n    font-size: 1.25rem;\n}\n.switch.is-large {\n    font-size: 1.5rem;\n}\n.switch[disabled] {\n    opacity: 0.5;\n    cursor: not-allowed;\n    color: #7a7a7a;\n}\n.table-wrapper .table {\n  margin-bottom: 0;\n}\n.table-wrapper:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n@media screen and (max-width: 1087px) {\n.table-wrapper {\n    overflow-x: auto;\n}\n}\n.b-table {\n  -webkit-transition: opacity 86ms ease-out;\n  transition: opacity 86ms ease-out;\n}\n@media screen and (min-width: 769px), print {\n.b-table .table-mobile-sort {\n      display: none;\n}\n}\n.b-table .icon {\n    -webkit-transition: opacity 86ms ease-out, -webkit-transform 150ms ease-out;\n    transition: opacity 86ms ease-out, -webkit-transform 150ms ease-out;\n    transition: transform 150ms ease-out, opacity 86ms ease-out;\n    transition: transform 150ms ease-out, opacity 86ms ease-out, -webkit-transform 150ms ease-out;\n}\n.b-table .icon.is-desc {\n      -webkit-transform: rotate(180deg);\n              transform: rotate(180deg);\n}\n.b-table .icon.is-expanded {\n      -webkit-transform: rotate(90deg);\n              transform: rotate(90deg);\n}\n.b-table .table {\n    width: 100%;\n    border: 1px solid transparent;\n    border-radius: 4px;\n    border-collapse: separate;\n}\n.b-table .table th {\n      font-weight: 600;\n}\n.b-table .table th .th-wrap {\n        display: -webkit-box;\n        display: -ms-flexbox;\n        display: flex;\n        -webkit-box-align: center;\n            -ms-flex-align: center;\n                align-items: center;\n}\n.b-table .table th .th-wrap .icon {\n          margin-left: 0.5rem;\n          margin-right: 0;\n          font-size: 1rem;\n}\n.b-table .table th .th-wrap.is-numeric {\n          -webkit-box-orient: horizontal;\n          -webkit-box-direction: reverse;\n              -ms-flex-direction: row-reverse;\n                  flex-direction: row-reverse;\n          text-align: right;\n}\n.b-table .table th .th-wrap.is-numeric .icon {\n            margin-left: 0;\n            margin-right: 0.5rem;\n}\n.b-table .table th .th-wrap.is-centered {\n          -webkit-box-pack: center;\n              -ms-flex-pack: center;\n                  justify-content: center;\n          text-align: center;\n}\n.b-table .table th.is-current-sort {\n        border-color: #7a7a7a;\n        font-weight: 700;\n}\n.b-table .table th.is-sortable:hover {\n        border-color: #7a7a7a;\n}\n.b-table .table th.is-sortable,\n      .b-table .table th.is-sortable .th-wrap {\n        cursor: pointer;\n}\n.b-table .table tr.is-selected .checkbox input:checked + .check {\n      background: #fff url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Cpath style='fill:%2300d1b2' d='M 0.04038059,0.6267767 0.14644661,0.52071068 0.42928932,0.80355339 0.3232233,0.90961941 z M 0.21715729,0.80355339 0.85355339,0.16715729 0.95961941,0.2732233 0.3232233,0.90961941 z'%3E%3C/path%3E%3C/svg%3E\") no-repeat center center;\n}\n.b-table .table tr.is-selected .checkbox input + .check {\n      border-color: #fff;\n}\n.b-table .table tr.is-empty:hover {\n      background-color: transparent;\n}\n.b-table .table .chevron-cell {\n      vertical-align: middle;\n}\n.b-table .table .checkbox-cell {\n      width: 40px;\n}\n.b-table .table .checkbox-cell .checkbox {\n        vertical-align: middle;\n}\n.b-table .table .checkbox-cell .checkbox .check {\n          -webkit-transition: none;\n          transition: none;\n}\n.b-table .table tr.detail {\n      -webkit-box-shadow: inset 0 1px 3px #dbdbdb;\n              box-shadow: inset 0 1px 3px #dbdbdb;\n      background: #fafafa;\n}\n.b-table .table tr.detail .detail-container {\n        padding: 1rem;\n}\n.b-table .table:focus {\n      border-color: #00d1b2;\n      -webkit-box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n              box-shadow: 0 0 0 0.125em rgba(0, 209, 178, 0.25);\n}\n.b-table .table.is-bordered th.is-current-sort,\n    .b-table .table.is-bordered th.is-sortable:hover {\n      border-color: #dbdbdb;\n      background: whitesmoke;\n}\n@media screen and (max-width: 768px) {\n.b-table .table.has-mobile-cards thead {\n        display: none;\n}\n.b-table .table.has-mobile-cards tfoot th {\n        border: 0;\n        display: inherit;\n}\n.b-table .table.has-mobile-cards tr {\n        -webkit-box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n                box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);\n        max-width: 100%;\n        position: relative;\n        display: block;\n}\n.b-table .table.has-mobile-cards tr td {\n          border: 0;\n          display: inherit;\n}\n.b-table .table.has-mobile-cards tr td:last-child {\n            border-bottom: 0;\n}\n.b-table .table.has-mobile-cards tr:not(:last-child) {\n          margin-bottom: 1rem;\n}\n.b-table .table.has-mobile-cards tr:not([class*=\"is-\"]) {\n          background: inherit;\n}\n.b-table .table.has-mobile-cards tr:not([class*=\"is-\"]):hover {\n            background-color: inherit;\n}\n.b-table .table.has-mobile-cards tr.detail {\n          margin-top: -1rem;\n}\n.b-table .table.has-mobile-cards tr:not(.detail):not(.is-empty):not(.table-footer) td {\n        display: -webkit-box;\n        display: -ms-flexbox;\n        display: flex;\n        width: auto;\n        -webkit-box-pack: justify;\n            -ms-flex-pack: justify;\n                justify-content: space-between;\n        text-align: right;\n        border-bottom: 1px solid whitesmoke;\n}\n.b-table .table.has-mobile-cards tr:not(.detail):not(.is-empty):not(.table-footer) td:before {\n          content: attr(data-label);\n          font-weight: 600;\n          padding-right: 0.5em;\n          text-align: left;\n}\n}\n.b-table .level {\n    padding-bottom: 1.5rem;\n}\n.b-table.is-loading {\n    position: relative;\n    pointer-events: none;\n    opacity: 0.5;\n}\n.b-table.is-loading:after {\n      -webkit-animation: spinAround 500ms infinite linear;\n              animation: spinAround 500ms infinite linear;\n      border: 2px solid #dbdbdb;\n      border-radius: 290486px;\n      border-right-color: transparent;\n      border-top-color: transparent;\n      content: \"\";\n      display: block;\n      height: 1em;\n      position: relative;\n      width: 1em;\n      position: absolute;\n      top: 4em;\n      left: calc(50% - 2.5em);\n      width: 5em;\n      height: 5em;\n      border-width: 0.25em;\n}\n.b-tabs .tabs {\n  margin-bottom: 0;\n  -ms-flex-negative: 0;\n      flex-shrink: 0;\n}\n.b-tabs .is-disabled {\n  pointer-events: none;\n  cursor: not-allowed;\n  opacity: 0.5;\n}\n.b-tabs .tab-content {\n  position: relative;\n  overflow: hidden;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  padding: 1rem;\n}\n.b-tabs .tab-content .tab-item {\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n    -ms-flex-preferred-size: auto;\n        flex-basis: auto;\n}\n.b-tabs:not(:last-child) {\n  margin-bottom: 1.5rem;\n}\n.b-tabs.is-fullwidth {\n  width: 100%;\n}\n.tag .has-ellipsis {\n  max-width: 10em;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n.taginput .taginput-container.is-focusable {\n  padding-bottom: 0;\n  padding-top: calc(0.275em - 1px);\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  height: auto;\n  cursor: text;\n}\n.taginput .taginput-container > .tag,\n.taginput .taginput-container > .tags {\n  margin-bottom: calc(0.275em - 1px);\n  font-size: 0.9em;\n  height: 1.7em;\n}\n.taginput .taginput-container > .tag .tag,\n  .taginput .taginput-container > .tags .tag {\n    margin-bottom: 0;\n    font-size: 0.9em;\n    height: 1.7em;\n}\n.taginput .taginput-container > .tag:not(:last-child),\n  .taginput .taginput-container > .tags:not(:last-child) {\n    margin-right: 0.275rem;\n}\n.taginput .taginput-container .autocomplete {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.taginput .taginput-container .autocomplete input {\n    height: 1.7em;\n    margin-bottom: calc(0.275em - 1px);\n    padding-top: 0;\n    padding-bottom: 0;\n    border: none;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    min-width: 8em;\n}\n.taginput .taginput-container .autocomplete input:focus {\n      -webkit-box-shadow: none !important;\n              box-shadow: none !important;\n}\n.taginput .taginput-container .autocomplete .icon {\n    height: 1.7em;\n}\n.taginput .taginput-container .autocomplete > .control.is-loading::after {\n    top: 0.375em;\n}\n.timepicker .dropdown-menu {\n  min-width: 0;\n}\n.timepicker .dropdown,\n.timepicker .dropdown-trigger {\n  width: 100%;\n}\n.timepicker .dropdown-item, .timepicker .dropdown .dropdown-menu .has-link a, .dropdown .dropdown-menu .has-link .timepicker a {\n  font-size: inherit;\n  padding: 0;\n}\n.timepicker .timepicker-footer {\n  padding: 0 0.5rem 0 0.5rem;\n}\n.timepicker .dropdown-content .control {\n  font-size: 1.25em;\n  margin-right: 0 !important;\n}\n.timepicker .dropdown-content .control .select select {\n    font-weight: 600;\n    padding-right: calc(0.625em - 1px);\n    border: 0;\n}\n.timepicker .dropdown-content .control .select select option:disabled {\n      color: rgba(122, 122, 122, 0.7);\n}\n.timepicker .dropdown-content .control .select:after {\n    display: none;\n}\n.timepicker .dropdown-content .control.is-colon {\n    font-size: 1.7em;\n}\n.timepicker.is-small {\n  border-radius: 2px;\n  font-size: 0.75rem;\n}\n.timepicker.is-medium {\n  font-size: 1.25rem;\n}\n.timepicker.is-large {\n  font-size: 1.5rem;\n}\n.tooltip {\n  position: relative;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n}\n.tooltip.is-top:before, .tooltip.is-top:after {\n    top: auto;\n    right: auto;\n    bottom: calc(100% + 5px + 2px);\n    left: 50%;\n    -webkit-transform: translateX(-50%);\n            transform: translateX(-50%);\n}\n.tooltip.is-top.is-white:before {\n    border-top: 5px solid white;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    bottom: calc(100% + 2px);\n}\n.tooltip.is-top.is-black:before {\n    border-top: 5px solid #0a0a0a;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    bottom: calc(100% + 2px);\n}\n.tooltip.is-top.is-light:before {\n    border-top: 5px solid whitesmoke;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    bottom: calc(100% + 2px);\n}\n.tooltip.is-top.is-dark:before {\n    border-top: 5px solid #0a0a0a;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    bottom: calc(100% + 2px);\n}\n.tooltip.is-top.is-primary:before {\n    border-top: 5px solid #00d1b2;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    bottom: calc(100% + 2px);\n}\n.tooltip.is-top.is-info:before {\n    border-top: 5px solid #209cee;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    bottom: calc(100% + 2px);\n}\n.tooltip.is-top.is-success:before {\n    border-top: 5px solid #23d160;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    bottom: calc(100% + 2px);\n}\n.tooltip.is-top.is-warning:before {\n    border-top: 5px solid #ffdd57;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    bottom: calc(100% + 2px);\n}\n.tooltip.is-top.is-danger:before {\n    border-top: 5px solid #ff3860;\n    border-right: 5px solid transparent;\n    border-left: 5px solid transparent;\n    bottom: calc(100% + 2px);\n}\n.tooltip.is-top.is-multiline.is-small:after {\n    width: 180px;\n}\n.tooltip.is-top.is-multiline.is-medium:after {\n    width: 240px;\n}\n.tooltip.is-top.is-multiline.is-large:after {\n    width: 300px;\n}\n.tooltip.is-right:before, .tooltip.is-right:after {\n    top: 50%;\n    right: auto;\n    bottom: auto;\n    left: calc(100% + 5px + 2px);\n    -webkit-transform: translateY(-50%);\n            transform: translateY(-50%);\n}\n.tooltip.is-right.is-white:before {\n    border-top: 5px solid transparent;\n    border-right: 5px solid white;\n    border-bottom: 5px solid transparent;\n    left: calc(100% + 2px);\n}\n.tooltip.is-right.is-black:before {\n    border-top: 5px solid transparent;\n    border-right: 5px solid #0a0a0a;\n    border-bottom: 5px solid transparent;\n    left: calc(100% + 2px);\n}\n.tooltip.is-right.is-light:before {\n    border-top: 5px solid transparent;\n    border-right: 5px solid whitesmoke;\n    border-bottom: 5px solid transparent;\n    left: calc(100% + 2px);\n}\n.tooltip.is-right.is-dark:before {\n    border-top: 5px solid transparent;\n    border-right: 5px solid #0a0a0a;\n    border-bottom: 5px solid transparent;\n    left: calc(100% + 2px);\n}\n.tooltip.is-right.is-primary:before {\n    border-top: 5px solid transparent;\n    border-right: 5px solid #00d1b2;\n    border-bottom: 5px solid transparent;\n    left: calc(100% + 2px);\n}\n.tooltip.is-right.is-info:before {\n    border-top: 5px solid transparent;\n    border-right: 5px solid #209cee;\n    border-bottom: 5px solid transparent;\n    left: calc(100% + 2px);\n}\n.tooltip.is-right.is-success:before {\n    border-top: 5px solid transparent;\n    border-right: 5px solid #23d160;\n    border-bottom: 5px solid transparent;\n    left: calc(100% + 2px);\n}\n.tooltip.is-right.is-warning:before {\n    border-top: 5px solid transparent;\n    border-right: 5px solid #ffdd57;\n    border-bottom: 5px solid transparent;\n    left: calc(100% + 2px);\n}\n.tooltip.is-right.is-danger:before {\n    border-top: 5px solid transparent;\n    border-right: 5px solid #ff3860;\n    border-bottom: 5px solid transparent;\n    left: calc(100% + 2px);\n}\n.tooltip.is-right.is-multiline.is-small:after {\n    width: 180px;\n}\n.tooltip.is-right.is-multiline.is-medium:after {\n    width: 240px;\n}\n.tooltip.is-right.is-multiline.is-large:after {\n    width: 300px;\n}\n.tooltip.is-bottom:before, .tooltip.is-bottom:after {\n    top: calc(100% + 5px + 2px);\n    right: auto;\n    bottom: auto;\n    left: 50%;\n    -webkit-transform: translateX(-50%);\n            transform: translateX(-50%);\n}\n.tooltip.is-bottom.is-white:before {\n    border-right: 5px solid transparent;\n    border-bottom: 5px solid white;\n    border-left: 5px solid transparent;\n    top: calc(100% + 2px);\n}\n.tooltip.is-bottom.is-black:before {\n    border-right: 5px solid transparent;\n    border-bottom: 5px solid #0a0a0a;\n    border-left: 5px solid transparent;\n    top: calc(100% + 2px);\n}\n.tooltip.is-bottom.is-light:before {\n    border-right: 5px solid transparent;\n    border-bottom: 5px solid whitesmoke;\n    border-left: 5px solid transparent;\n    top: calc(100% + 2px);\n}\n.tooltip.is-bottom.is-dark:before {\n    border-right: 5px solid transparent;\n    border-bottom: 5px solid #0a0a0a;\n    border-left: 5px solid transparent;\n    top: calc(100% + 2px);\n}\n.tooltip.is-bottom.is-primary:before {\n    border-right: 5px solid transparent;\n    border-bottom: 5px solid #00d1b2;\n    border-left: 5px solid transparent;\n    top: calc(100% + 2px);\n}\n.tooltip.is-bottom.is-info:before {\n    border-right: 5px solid transparent;\n    border-bottom: 5px solid #209cee;\n    border-left: 5px solid transparent;\n    top: calc(100% + 2px);\n}\n.tooltip.is-bottom.is-success:before {\n    border-right: 5px solid transparent;\n    border-bottom: 5px solid #23d160;\n    border-left: 5px solid transparent;\n    top: calc(100% + 2px);\n}\n.tooltip.is-bottom.is-warning:before {\n    border-right: 5px solid transparent;\n    border-bottom: 5px solid #ffdd57;\n    border-left: 5px solid transparent;\n    top: calc(100% + 2px);\n}\n.tooltip.is-bottom.is-danger:before {\n    border-right: 5px solid transparent;\n    border-bottom: 5px solid #ff3860;\n    border-left: 5px solid transparent;\n    top: calc(100% + 2px);\n}\n.tooltip.is-bottom.is-multiline.is-small:after {\n    width: 180px;\n}\n.tooltip.is-bottom.is-multiline.is-medium:after {\n    width: 240px;\n}\n.tooltip.is-bottom.is-multiline.is-large:after {\n    width: 300px;\n}\n.tooltip.is-left:before, .tooltip.is-left:after {\n    top: 50%;\n    right: calc(100% + 5px + 2px);\n    bottom: auto;\n    left: auto;\n    -webkit-transform: translateY(-50%);\n            transform: translateY(-50%);\n}\n.tooltip.is-left.is-white:before {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    border-left: 5px solid white;\n    right: calc(100% + 2px);\n}\n.tooltip.is-left.is-black:before {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    border-left: 5px solid #0a0a0a;\n    right: calc(100% + 2px);\n}\n.tooltip.is-left.is-light:before {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    border-left: 5px solid whitesmoke;\n    right: calc(100% + 2px);\n}\n.tooltip.is-left.is-dark:before {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    border-left: 5px solid #0a0a0a;\n    right: calc(100% + 2px);\n}\n.tooltip.is-left.is-primary:before {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    border-left: 5px solid #00d1b2;\n    right: calc(100% + 2px);\n}\n.tooltip.is-left.is-info:before {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    border-left: 5px solid #209cee;\n    right: calc(100% + 2px);\n}\n.tooltip.is-left.is-success:before {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    border-left: 5px solid #23d160;\n    right: calc(100% + 2px);\n}\n.tooltip.is-left.is-warning:before {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    border-left: 5px solid #ffdd57;\n    right: calc(100% + 2px);\n}\n.tooltip.is-left.is-danger:before {\n    border-top: 5px solid transparent;\n    border-bottom: 5px solid transparent;\n    border-left: 5px solid #ff3860;\n    right: calc(100% + 2px);\n}\n.tooltip.is-left.is-multiline.is-small:after {\n    width: 180px;\n}\n.tooltip.is-left.is-multiline.is-medium:after {\n    width: 240px;\n}\n.tooltip.is-left.is-multiline.is-large:after {\n    width: 300px;\n}\n.tooltip:before, .tooltip:after {\n    position: absolute;\n    content: \"\";\n    opacity: 0;\n    visibility: hidden;\n    pointer-events: none;\n}\n.tooltip:before {\n    z-index: 889;\n}\n.tooltip:after {\n    content: attr(data-label);\n    width: auto;\n    padding: 0.35rem 0.75rem;\n    border-radius: 6px;\n    font-size: 0.85rem;\n    font-weight: 400;\n    -webkit-box-shadow: 0px 1px 2px 1px rgba(0, 1, 0, 0.2);\n            box-shadow: 0px 1px 2px 1px rgba(0, 1, 0, 0.2);\n    z-index: 888;\n    white-space: nowrap;\n}\n.tooltip:not([data-label=\"\"]):hover:before, .tooltip:not([data-label=\"\"]):hover:after {\n    opacity: 1;\n    visibility: visible;\n}\n.tooltip.is-white:after {\n    background: white;\n    color: #0a0a0a;\n}\n.tooltip.is-black:after {\n    background: #0a0a0a;\n    color: white;\n}\n.tooltip.is-light:after {\n    background: whitesmoke;\n    color: #363636;\n}\n.tooltip.is-dark:after {\n    background: #0a0a0a;\n    color: whitesmoke;\n}\n.tooltip.is-primary:after {\n    background: #00d1b2;\n    color: #fff;\n}\n.tooltip.is-info:after {\n    background: #209cee;\n    color: #fff;\n}\n.tooltip.is-success:after {\n    background: #23d160;\n    color: #fff;\n}\n.tooltip.is-warning:after {\n    background: #ffdd57;\n    color: rgba(0, 0, 0, 0.7);\n}\n.tooltip.is-danger:after {\n    background: #ff3860;\n    color: #fff;\n}\n.tooltip:not([data-label=\"\"]).is-always:before, .tooltip:not([data-label=\"\"]).is-always:after {\n    opacity: 1;\n    visibility: visible;\n}\n.tooltip.is-multiline:after {\n    display: flex-block;\n    text-align: center;\n    white-space: normal;\n}\n.tooltip.is-dashed {\n    border-bottom: 1px dashed #b5b5b5;\n    cursor: default;\n}\n.tooltip.is-square:after {\n    border-radius: 0;\n}\n.tooltip.is-animated:before, .tooltip.is-animated:after {\n    -webkit-transition: opacity 86ms ease-out, visibility 86ms ease-out;\n    transition: opacity 86ms ease-out, visibility 86ms ease-out;\n}\n.upload {\n  position: relative;\n}\n.upload input[type=file] {\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    opacity: 0;\n    outline: none;\n    z-index: -1;\n}\n.upload .upload-draggable {\n    display: inline-block;\n    cursor: pointer;\n    padding: 0.25em;\n    border: 1px dashed #b5b5b5;\n    border-radius: 6px;\n}\n.upload .upload-draggable.is-disabled {\n      opacity: 0.5;\n      cursor: not-allowed;\n}\n.upload .upload-draggable.is-loading {\n      position: relative;\n      pointer-events: none;\n      opacity: 0.5;\n}\n.upload .upload-draggable.is-loading:after {\n        -webkit-animation: spinAround 500ms infinite linear;\n                animation: spinAround 500ms infinite linear;\n        border: 2px solid #dbdbdb;\n        border-radius: 290486px;\n        border-right-color: transparent;\n        border-top-color: transparent;\n        content: \"\";\n        display: block;\n        height: 1em;\n        position: relative;\n        width: 1em;\n        top: 0;\n        left: calc(50% - 1.5em);\n        width: 3em;\n        height: 3em;\n        border-width: 0.25em;\n}\n.upload .upload-draggable:hover.is-white, .upload .upload-draggable.is-hovered.is-white {\n      border-color: white;\n      background: rgba(255, 255, 255, 0.05);\n}\n.upload .upload-draggable:hover.is-black, .upload .upload-draggable.is-hovered.is-black {\n      border-color: #0a0a0a;\n      background: rgba(10, 10, 10, 0.05);\n}\n.upload .upload-draggable:hover.is-light, .upload .upload-draggable.is-hovered.is-light {\n      border-color: whitesmoke;\n      background: rgba(245, 245, 245, 0.05);\n}\n.upload .upload-draggable:hover.is-dark, .upload .upload-draggable.is-hovered.is-dark {\n      border-color: #0a0a0a;\n      background: rgba(10, 10, 10, 0.05);\n}\n.upload .upload-draggable:hover.is-primary, .upload .upload-draggable.is-hovered.is-primary {\n      border-color: #00d1b2;\n      background: rgba(0, 209, 178, 0.05);\n}\n.upload .upload-draggable:hover.is-info, .upload .upload-draggable.is-hovered.is-info {\n      border-color: #209cee;\n      background: rgba(32, 156, 238, 0.05);\n}\n.upload .upload-draggable:hover.is-success, .upload .upload-draggable.is-hovered.is-success {\n      border-color: #23d160;\n      background: rgba(35, 209, 96, 0.05);\n}\n.upload .upload-draggable:hover.is-warning, .upload .upload-draggable.is-hovered.is-warning {\n      border-color: #ffdd57;\n      background: rgba(255, 221, 87, 0.05);\n}\n.upload .upload-draggable:hover.is-danger, .upload .upload-draggable.is-hovered.is-danger {\n      border-color: #ff3860;\n      background: rgba(255, 56, 96, 0.05);\n}\n.title, .subtitle, .navbar-item {\n  text-shadow: 0 0 1em black;\n}\n", ""]);

// exports


/***/ }),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Layout_Navbar__ = __webpack_require__(33);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Layout_Navbar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Layout_Navbar__);
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'Header',
  components: { Navbar: __WEBPACK_IMPORTED_MODULE_0__Layout_Navbar___default.a }
});

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(1)
/* script */
var __vue_script__ = null
/* template */
var __vue_template__ = __webpack_require__(34)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/js/components/Layout-Navbar.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-25858350", Component.options)
  } else {
    hotAPI.reload("data-v-25858350", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "navbar" }, [
    _c("div", { staticClass: "container" }, [
      _vm._m(0),
      _vm._v(" "),
      _c("div", { staticClass: "navbar-menu" }, [
        _c(
          "div",
          { staticClass: "navbar-start" },
          [
            _c(
              "router-link",
              {
                staticClass: "navbar-item",
                attrs: { tag: "a", to: { name: "home" } }
              },
              [_vm._v("Home")]
            ),
            _vm._v(" "),
            _c(
              "router-link",
              {
                staticClass: "navbar-item",
                attrs: { tag: "a", to: { name: "about" } }
              },
              [_vm._v("About")]
            )
          ],
          1
        ),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "navbar-end" },
          [
            _c(
              "router-link",
              {
                staticClass: "navbar-item",
                attrs: { tag: "a", to: { name: "login" } }
              },
              [_vm._v("Login")]
            ),
            _vm._v(" "),
            _c(
              "router-link",
              {
                staticClass: "navbar-item",
                attrs: { tag: "a", to: { name: "register" } }
              },
              [_vm._v("Register")]
            )
          ],
          1
        )
      ])
    ])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "navbar-brand" }, [
      _c("div", { staticClass: "navbar-burger" })
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-25858350", module.exports)
  }
}

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "hero is-dark vheader" },
    [_c("Navbar"), _vm._v(" "), _vm._m(0)],
    1
  )
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "hero-body has-text-centered" }, [
      _c("h1", { staticClass: "title is-1" }, [_vm._v("VerText")]),
      _vm._v(" "),
      _c("h2", { staticClass: "subtitle" }, [
        _vm._v("The tool to memorize any text..."),
        _c("span", { staticClass: "is-italic" }, [_vm._v("Verbatim")])
      ])
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-5275c42e", module.exports)
  }
}

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c("header-bar"),
      _vm._v(" "),
      _c("div", { staticClass: "container" }, [_vm._t("default")], 2),
      _vm._v(" "),
      _c("footer-bar")
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-6a25d30d", module.exports)
  }
}

/***/ }),
/* 37 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })
],[13]);