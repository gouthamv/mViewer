// Version: v1.0.0-rc.1
// Last commit: 8b061b4 (2013-02-15 12:10:22 -0800)


(function() {
/*global __fail__*/

/**
Ember Debug

@module ember
@submodule ember-debug
*/

/**
@class Ember
*/

if ('undefined' === typeof Ember) {
  Ember = {};

  if ('undefined' !== typeof window) {
    window.Em = window.Ember = Em = Ember;
  }
}

Ember.ENV = 'undefined' === typeof ENV ? {} : ENV;

if (!('MANDATORY_SETTER' in Ember.ENV)) {
  Ember.ENV.MANDATORY_SETTER = true; // default to true for debug dist
}

/**
  Define an assertion that will throw an exception if the condition is not
  met. Ember build tools will remove any calls to `Ember.assert()` when
  doing a production build. Example:

  ```javascript
  // Test for truthiness
  Ember.assert('Must pass a valid object', obj);
  // Fail unconditionally
  Ember.assert('This code path should never be run')
  ```

  @method assert
  @param {String} desc A description of the assertion. This will become
    the text of the Error thrown if the assertion fails.
  @param {Boolean} test Must be truthy for the assertion to pass. If
    falsy, an exception will be thrown.
*/
Ember.assert = function(desc, test) {
  if (!test) throw new Error("assertion failed: "+desc);
};


/**
  Display a warning with the provided message. Ember build tools will
  remove any calls to `Ember.warn()` when doing a production build.

  @method warn
  @param {String} message A warning to display.
  @param {Boolean} test An optional boolean. If falsy, the warning
    will be displayed.
*/
Ember.warn = function(message, test) {
  if (!test) {
    Ember.Logger.warn("WARNING: "+message);
    if ('trace' in Ember.Logger) Ember.Logger.trace();
  }
};

/**
  Display a debug notice. Ember build tools will remove any calls to
  `Ember.debug()` when doing a production build.

  ```javascript
  Ember.debug("I'm a debug notice!");
  ```

  @method debug
  @param {String} message A debug message to display.
*/
Ember.debug = function(message) {
  Ember.Logger.debug("DEBUG: "+message);
};

/**
  Display a deprecation warning with the provided message and a stack trace
  (Chrome and Firefox only). Ember build tools will remove any calls to
  `Ember.deprecate()` when doing a production build.

  @method deprecate
  @param {String} message A description of the deprecation.
  @param {Boolean} test An optional boolean. If falsy, the deprecation
    will be displayed.
*/
Ember.deprecate = function(message, test) {
  if (Ember && Ember.TESTING_DEPRECATION) { return; }

  if (arguments.length === 1) { test = false; }
  if (test) { return; }

  if (Ember && Ember.ENV.RAISE_ON_DEPRECATION) { throw new Error(message); }

  var error;

  // When using new Error, we can't do the arguments check for Chrome. Alternatives are welcome
  try { __fail__.fail(); } catch (e) { error = e; }

  if (Ember.LOG_STACKTRACE_ON_DEPRECATION && error.stack) {
    var stack, stackStr = '';
    if (error['arguments']) {
      // Chrome
      stack = error.stack.replace(/^\s+at\s+/gm, '').
                          replace(/^([^\(]+?)([\n$])/gm, '{anonymous}($1)$2').
                          replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}($1)').split('\n');
      stack.shift();
    } else {
      // Firefox
      stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').
                          replace(/^\(/gm, '{anonymous}(').split('\n');
    }

    stackStr = "\n    " + stack.slice(2).join("\n    ");
    message = message + stackStr;
  }

  Ember.Logger.warn("DEPRECATION: "+message);
};



/**
  Display a deprecation warning with the provided message and a stack trace
  (Chrome and Firefox only) when the wrapped method is called.

  Ember build tools will not remove calls to `Ember.deprecateFunc()`, though
  no warnings will be shown in production.

  @method deprecateFunc
  @param {String} message A description of the deprecation.
  @param {Function} func The function to be deprecated.
*/
Ember.deprecateFunc = function(message, func) {
  return function() {
    Ember.deprecate(message);
    return func.apply(this, arguments);
  };
};

})();

// Version: v1.0.0-rc.1
// Last commit: 8b061b4 (2013-02-15 12:10:22 -0800)


(function() {
var define, requireModule;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requireModule = function(name) {
    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(deps[i]));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;
  };
})();
(function() {
/*globals Em:true ENV */

/**
@module ember
@submodule ember-metal
*/

/**
  All Ember methods and functions are defined inside of this namespace. You
  generally should not add new properties to this namespace as it may be
  overwritten by future versions of Ember.

  You can also use the shorthand `Em` instead of `Ember`.

  Ember-Runtime is a framework that provides core functions for Ember including
  cross-platform functions, support for property observing and objects. Its
  focus is on small size and performance. You can use this in place of or
  along-side other cross-platform libraries such as jQuery.

  The core Runtime framework is based on the jQuery API with a number of
  performance optimizations.

  @class Ember
  @static
  @version 1.0.0-rc.1
*/

if ('undefined' === typeof Ember) {
  // Create core object. Make it act like an instance of Ember.Namespace so that
  // objects assigned to it are given a sane string representation.
  Ember = {};
}

// Default imports, exports and lookup to the global object;
var imports = Ember.imports = Ember.imports || this;
var exports = Ember.exports = Ember.exports || this;
var lookup  = Ember.lookup  = Ember.lookup  || this;

// aliases needed to keep minifiers from removing the global context
exports.Em = exports.Ember = Em = Ember;

// Make sure these are set whether Ember was already defined or not

Ember.isNamespace = true;

Ember.toString = function() { return "Ember"; };


/**
  @property VERSION
  @type String
  @default '1.0.0-rc.1'
  @final
*/
Ember.VERSION = '1.0.0-rc.1';

/**
  Standard environmental variables. You can define these in a global `ENV`
  variable before loading Ember to control various configuration
  settings.

  @property ENV
  @type Hash
*/
Ember.ENV = Ember.ENV || ('undefined' === typeof ENV ? {} : ENV);

Ember.config = Ember.config || {};

// ..........................................................
// BOOTSTRAP
//

/**
  Determines whether Ember should enhances some built-in object prototypes to
  provide a more friendly API. If enabled, a few methods will be added to
  `Function`, `String`, and `Array`. `Object.prototype` will not be enhanced,
  which is the one that causes most trouble for people.

  In general we recommend leaving this option set to true since it rarely
  conflicts with other code. If you need to turn it off however, you can
  define an `ENV.EXTEND_PROTOTYPES` config to disable it.

  @property EXTEND_PROTOTYPES
  @type Boolean
  @default true
*/
Ember.EXTEND_PROTOTYPES = Ember.ENV.EXTEND_PROTOTYPES;

if (typeof Ember.EXTEND_PROTOTYPES === 'undefined') {
  Ember.EXTEND_PROTOTYPES = true;
}

/**
  Determines whether Ember logs a full stack trace during deprecation warnings

  @property LOG_STACKTRACE_ON_DEPRECATION
  @type Boolean
  @default true
*/
Ember.LOG_STACKTRACE_ON_DEPRECATION = (Ember.ENV.LOG_STACKTRACE_ON_DEPRECATION !== false);

/**
  Determines whether Ember should add ECMAScript 5 shims to older browsers.

  @property SHIM_ES5
  @type Boolean
  @default Ember.EXTEND_PROTOTYPES
*/
Ember.SHIM_ES5 = (Ember.ENV.SHIM_ES5 === false) ? false : Ember.EXTEND_PROTOTYPES;

/**
  Empty function. Useful for some operations.

  @method K
  @private
  @return {Object}
*/
Ember.K = function() { return this; };


// Stub out the methods defined by the ember-debug package in case it's not loaded

if ('undefined' === typeof Ember.assert) { Ember.assert = Ember.K; }
if ('undefined' === typeof Ember.warn) { Ember.warn = Ember.K; }
if ('undefined' === typeof Ember.debug) { Ember.debug = Ember.K; }
if ('undefined' === typeof Ember.deprecate) { Ember.deprecate = Ember.K; }
if ('undefined' === typeof Ember.deprecateFunc) {
  Ember.deprecateFunc = function(_, func) { return func; };
}

/**
  Previously we used `Ember.$.uuid`, however `$.uuid` has been removed from
  jQuery master. We'll just bootstrap our own uuid now.

  @property uuid
  @type Number
  @private
*/
Ember.uuid = 0;

// ..........................................................
// LOGGER
//

function consoleMethod(name) {
  if (imports.console && imports.console[name]) {
    // Older IE doesn't support apply, but Chrome needs it
    if (imports.console[name].apply) {
      return function() {
        imports.console[name].apply(imports.console, arguments);
      };
    } else {
      return function() {
        var message = Array.prototype.join.call(arguments, ', ');
        imports.console[name](message);
      };
    }
  }
}

/**
  Inside Ember-Metal, simply uses the methods from `imports.console`.
  Override this to provide more robust logging functionality.

  @class Logger
  @namespace Ember
*/
Ember.Logger = {
  log:   consoleMethod('log')   || Ember.K,
  warn:  consoleMethod('warn')  || Ember.K,
  error: consoleMethod('error') || Ember.K,
  info:  consoleMethod('info')  || Ember.K,
  debug: consoleMethod('debug') || consoleMethod('info') || Ember.K
};


// ..........................................................
// ERROR HANDLING
//

/**
  A function may be assigned to `Ember.onerror` to be called when Ember
  internals encounter an error. This is useful for specialized error handling
  and reporting code.

  @event onerror
  @for Ember
  @param {Exception} error the error object
*/
Ember.onerror = null;

/**
  @private

  Wrap code block in a try/catch if {{#crossLink "Ember/onerror"}}{{/crossLink}} is set.

  @method handleErrors
  @for Ember
  @param {Function} func
  @param [context]
*/
Ember.handleErrors = function(func, context) {
  // Unfortunately in some browsers we lose the backtrace if we rethrow the existing error,
  // so in the event that we don't have an `onerror` handler we don't wrap in a try/catch
  if ('function' === typeof Ember.onerror) {
    try {
      return func.apply(context || this);
    } catch (error) {
      Ember.onerror(error);
    }
  } else {
    return func.apply(context || this);
  }
};

Ember.merge = function(original, updates) {
  for (var prop in updates) {
    if (!updates.hasOwnProperty(prop)) { continue; }
    original[prop] = updates[prop];
  }
};

})();



(function() {
/*globals Node */
/**
@module ember-metal
*/

/**
  Platform specific methods and feature detectors needed by the framework.

  @class platform
  @namespace Ember
  @static
*/
var platform = Ember.platform = {};


/**
  Identical to `Object.create()`. Implements if not available natively.

  @method create
  @for Ember
*/
Ember.create = Object.create;

// STUB_OBJECT_CREATE allows us to override other libraries that stub
// Object.create different than we would prefer
if (!Ember.create || Ember.ENV.STUB_OBJECT_CREATE) {
  var K = function() {};

  Ember.create = function(obj, props) {
    K.prototype = obj;
    obj = new K();
    if (props) {
      K.prototype = obj;
      for (var prop in props) {
        K.prototype[prop] = props[prop].value;
      }
      obj = new K();
    }
    K.prototype = null;

    return obj;
  };

  Ember.create.isSimulated = true;
}

var defineProperty = Object.defineProperty;
var canRedefineProperties, canDefinePropertyOnDOM;

// Catch IE8 where Object.defineProperty exists but only works on DOM elements
if (defineProperty) {
  try {
    defineProperty({}, 'a',{get:function(){}});
  } catch (e) {
    defineProperty = null;
  }
}

if (defineProperty) {
  // Detects a bug in Android <3.2 where you cannot redefine a property using
  // Object.defineProperty once accessors have already been set.
  canRedefineProperties = (function() {
    var obj = {};

    defineProperty(obj, 'a', {
      configurable: true,
      enumerable: true,
      get: function() { },
      set: function() { }
    });

    defineProperty(obj, 'a', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: true
    });

    return obj.a === true;
  })();

  // This is for Safari 5.0, which supports Object.defineProperty, but not
  // on DOM nodes.
  canDefinePropertyOnDOM = (function(){
    try {
      defineProperty(document.createElement('div'), 'definePropertyOnDOM', {});
      return true;
    } catch(e) { }

    return false;
  })();

  if (!canRedefineProperties) {
    defineProperty = null;
  } else if (!canDefinePropertyOnDOM) {
    defineProperty = function(obj, keyName, desc){
      var isNode;

      if (typeof Node === "object") {
        isNode = obj instanceof Node;
      } else {
        isNode = typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string";
      }

      if (isNode) {
        // TODO: Should we have a warning here?
        return (obj[keyName] = desc.value);
      } else {
        return Object.defineProperty(obj, keyName, desc);
      }
    };
  }
}

/**
@class platform
@namespace Ember
*/

/**
  Identical to `Object.defineProperty()`. Implements as much functionality
  as possible if not available natively.

  @method defineProperty
  @param {Object} obj The object to modify
  @param {String} keyName property name to modify
  @param {Object} desc descriptor hash
  @return {void}
*/
platform.defineProperty = defineProperty;

/**
  Set to true if the platform supports native getters and setters.

  @property hasPropertyAccessors
  @final
*/
platform.hasPropertyAccessors = true;

if (!platform.defineProperty) {
  platform.hasPropertyAccessors = false;

  platform.defineProperty = function(obj, keyName, desc) {
    if (!desc.get) { obj[keyName] = desc.value; }
  };

  platform.defineProperty.isSimulated = true;
}

if (Ember.ENV.MANDATORY_SETTER && !platform.hasPropertyAccessors) {
  Ember.ENV.MANDATORY_SETTER = false;
}

})();



(function() {
/**
@module ember-metal
*/


var o_defineProperty = Ember.platform.defineProperty,
    o_create = Ember.create,
    // Used for guid generation...
    GUID_KEY = '__ember'+ (+ new Date()),
    uuid         = 0,
    numberCache  = [],
    stringCache  = {};

var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER;

/**
  @private

  A unique key used to assign guids and other private metadata to objects.
  If you inspect an object in your browser debugger you will often see these.
  They can be safely ignored.

  On browsers that support it, these properties are added with enumeration
  disabled so they won't show up when you iterate over your properties.

  @property GUID_KEY
  @for Ember
  @type String
  @final
*/
Ember.GUID_KEY = GUID_KEY;

var GUID_DESC = {
  writable:    false,
  configurable: false,
  enumerable:  false,
  value: null
};

/**
  @private

  Generates a new guid, optionally saving the guid to the object that you
  pass in. You will rarely need to use this method. Instead you should
  call `Ember.guidFor(obj)`, which return an existing guid if available.

  @method generateGuid
  @for Ember
  @param {Object} [obj] Object the guid will be used for. If passed in, the guid will
    be saved on the object and reused whenever you pass the same object
    again.

    If no object is passed, just generate a new guid.
  @param {String} [prefix] Prefix to place in front of the guid. Useful when you want to
    separate the guid into separate namespaces.
  @return {String} the guid
*/
Ember.generateGuid = function generateGuid(obj, prefix) {
  if (!prefix) prefix = 'ember';
  var ret = (prefix + (uuid++));
  if (obj) {
    GUID_DESC.value = ret;
    o_defineProperty(obj, GUID_KEY, GUID_DESC);
  }
  return ret ;
};

/**
  @private

  Returns a unique id for the object. If the object does not yet have a guid,
  one will be assigned to it. You can call this on any object,
  `Ember.Object`-based or not, but be aware that it will add a `_guid`
  property.

  You can also use this method on DOM Element objects.

  @method guidFor
  @for Ember
  @param obj {Object} any object, string, number, Element, or primitive
  @return {String} the unique guid for this instance.
*/
Ember.guidFor = function guidFor(obj) {

  // special cases where we don't want to add a key to object
  if (obj === undefined) return "(undefined)";
  if (obj === null) return "(null)";

  var cache, ret;
  var type = typeof obj;

  // Don't allow prototype changes to String etc. to change the guidFor
  switch(type) {
    case 'number':
      ret = numberCache[obj];
      if (!ret) ret = numberCache[obj] = 'nu'+obj;
      return ret;

    case 'string':
      ret = stringCache[obj];
      if (!ret) ret = stringCache[obj] = 'st'+(uuid++);
      return ret;

    case 'boolean':
      return obj ? '(true)' : '(false)';

    default:
      if (obj[GUID_KEY]) return obj[GUID_KEY];
      if (obj === Object) return '(Object)';
      if (obj === Array)  return '(Array)';
      ret = 'ember'+(uuid++);
      GUID_DESC.value = ret;
      o_defineProperty(obj, GUID_KEY, GUID_DESC);
      return ret;
  }
};

// ..........................................................
// META
//

var META_DESC = {
  writable:    true,
  configurable: false,
  enumerable:  false,
  value: null
};

var META_KEY = Ember.GUID_KEY+'_meta';

/**
  The key used to store meta information on object for property observing.

  @property META_KEY
  @for Ember
  @private
  @final
  @type String
*/
Ember.META_KEY = META_KEY;

// Placeholder for non-writable metas.
var EMPTY_META = {
  descs: {},
  watching: {}
};

if (MANDATORY_SETTER) { EMPTY_META.values = {}; }

Ember.EMPTY_META = EMPTY_META;

if (Object.freeze) Object.freeze(EMPTY_META);

var isDefinePropertySimulated = Ember.platform.defineProperty.isSimulated;

function Meta(obj) {
  this.descs = {};
  this.watching = {};
  this.cache = {};
  this.source = obj;
}

if (isDefinePropertySimulated) {
  // on platforms that don't support enumerable false
  // make meta fail jQuery.isPlainObject() to hide from
  // jQuery.extend() by having a property that fails
  // hasOwnProperty check.
  Meta.prototype.__preventPlainObject__ = true;

  // Without non-enumerable properties, meta objects will be output in JSON
  // unless explicitly suppressed
  Meta.prototype.toJSON = function () { };
}

/**
  Retrieves the meta hash for an object. If `writable` is true ensures the
  hash is writable for this object as well.

  The meta object contains information about computed property descriptors as
  well as any watched properties and other information. You generally will
  not access this information directly but instead work with higher level
  methods that manipulate this hash indirectly.

  @method meta
  @for Ember
  @private

  @param {Object} obj The object to retrieve meta for
  @param {Boolean} [writable=true] Pass `false` if you do not intend to modify
    the meta hash, allowing the method to avoid making an unnecessary copy.
  @return {Hash}
*/
Ember.meta = function meta(obj, writable) {

  var ret = obj[META_KEY];
  if (writable===false) return ret || EMPTY_META;

  if (!ret) {
    if (!isDefinePropertySimulated) o_defineProperty(obj, META_KEY, META_DESC);

    ret = new Meta(obj);

    if (MANDATORY_SETTER) { ret.values = {}; }

    obj[META_KEY] = ret;

    // make sure we don't accidentally try to create constructor like desc
    ret.descs.constructor = null;

  } else if (ret.source !== obj) {
    if (!isDefinePropertySimulated) o_defineProperty(obj, META_KEY, META_DESC);

    ret = o_create(ret);
    ret.descs    = o_create(ret.descs);
    ret.watching = o_create(ret.watching);
    ret.cache    = {};
    ret.source   = obj;

    if (MANDATORY_SETTER) { ret.values = o_create(ret.values); }

    obj[META_KEY] = ret;
  }
  return ret;
};

Ember.getMeta = function getMeta(obj, property) {
  var meta = Ember.meta(obj, false);
  return meta[property];
};

Ember.setMeta = function setMeta(obj, property, value) {
  var meta = Ember.meta(obj, true);
  meta[property] = value;
  return value;
};

/**
  @private

  In order to store defaults for a class, a prototype may need to create
  a default meta object, which will be inherited by any objects instantiated
  from the class's constructor.

  However, the properties of that meta object are only shallow-cloned,
  so if a property is a hash (like the event system's `listeners` hash),
  it will by default be shared across all instances of that class.

  This method allows extensions to deeply clone a series of nested hashes or
  other complex objects. For instance, the event system might pass
  `['listeners', 'foo:change', 'ember157']` to `prepareMetaPath`, which will
  walk down the keys provided.

  For each key, if the key does not exist, it is created. If it already
  exists and it was inherited from its constructor, the constructor's
  key is cloned.

  You can also pass false for `writable`, which will simply return
  undefined if `prepareMetaPath` discovers any part of the path that
  shared or undefined.

  @method metaPath
  @for Ember
  @param {Object} obj The object whose meta we are examining
  @param {Array} path An array of keys to walk down
  @param {Boolean} writable whether or not to create a new meta
    (or meta property) if one does not already exist or if it's
    shared with its constructor
*/
Ember.metaPath = function metaPath(obj, path, writable) {
  var meta = Ember.meta(obj, writable), keyName, value;

  for (var i=0, l=path.length; i<l; i++) {
    keyName = path[i];
    value = meta[keyName];

    if (!value) {
      if (!writable) { return undefined; }
      value = meta[keyName] = { __ember_source__: obj };
    } else if (value.__ember_source__ !== obj) {
      if (!writable) { return undefined; }
      value = meta[keyName] = o_create(value);
      value.__ember_source__ = obj;
    }

    meta = value;
  }

  return value;
};

/**
  @private

  Wraps the passed function so that `this._super` will point to the superFunc
  when the function is invoked. This is the primitive we use to implement
  calls to super.

  @method wrap
  @for Ember
  @param {Function} func The function to call
  @param {Function} superFunc The super function.
  @return {Function} wrapped function.
*/
Ember.wrap = function(func, superFunc) {
  function K() {}

  function superWrapper() {
    var ret, sup = this._super;
    this._super = superFunc || K;
    ret = func.apply(this, arguments);
    this._super = sup;
    return ret;
  }

  superWrapper.wrappedFunction = func;
  superWrapper.__ember_observes__ = func.__ember_observes__;
  superWrapper.__ember_observesBefore__ = func.__ember_observesBefore__;

  return superWrapper;
};

/**
  Returns true if the passed object is an array or Array-like.

  Ember Array Protocol:

    - the object has an objectAt property
    - the object is a native Array
    - the object is an Object, and has a length property

  Unlike `Ember.typeOf` this method returns true even if the passed object is
  not formally array but appears to be array-like (i.e. implements `Ember.Array`)

  ```javascript
  Ember.isArray();                                            // false
  Ember.isArray([]);                                          // true
  Ember.isArray( Ember.ArrayProxy.create({ content: [] }) );  // true
  ```

  @method isArray
  @for Ember
  @param {Object} obj The object to test
  @return {Boolean}
*/
Ember.isArray = function(obj) {
  if (!obj || obj.setInterval) { return false; }
  if (Array.isArray && Array.isArray(obj)) { return true; }
  if (Ember.Array && Ember.Array.detect(obj)) { return true; }
  if ((obj.length !== undefined) && 'object'===typeof obj) { return true; }
  return false;
};

/**
  Forces the passed object to be part of an array. If the object is already
  an array or array-like, returns the object. Otherwise adds the object to
  an array. If obj is `null` or `undefined`, returns an empty array.

  ```javascript
  Ember.makeArray();                           // []
  Ember.makeArray(null);                       // []
  Ember.makeArray(undefined);                  // []
  Ember.makeArray('lindsay');                  // ['lindsay']
  Ember.makeArray([1,2,42]);                   // [1,2,42]

  var controller = Ember.ArrayProxy.create({ content: [] });
  Ember.makeArray(controller) === controller;  // true
  ```

  @method makeArray
  @for Ember
  @param {Object} obj the object
  @return {Array}
*/
Ember.makeArray = function(obj) {
  if (obj === null || obj === undefined) { return []; }
  return Ember.isArray(obj) ? obj : [obj];
};

function canInvoke(obj, methodName) {
  return !!(obj && typeof obj[methodName] === 'function');
}

/**
  Checks to see if the `methodName` exists on the `obj`.

  @method canInvoke
  @for Ember
  @param {Object} obj The object to check for the method
  @param {String} methodName The method name to check for
*/
Ember.canInvoke = canInvoke;

/**
  Checks to see if the `methodName` exists on the `obj`,
  and if it does, invokes it with the arguments passed.

  @method tryInvoke
  @for Ember
  @param {Object} obj The object to check for the method
  @param {String} methodName The method name to check for
  @param {Array} [args] The arguments to pass to the method
  @return {anything} the return value of the invoked method or undefined if it cannot be invoked
*/
Ember.tryInvoke = function(obj, methodName, args) {
  if (canInvoke(obj, methodName)) {
    return obj[methodName].apply(obj, args || []);
  }
};

// https://github.com/emberjs/ember.js/pull/1617
var needsFinallyFix = (function() {
  var count = 0;
  try{
    try { }
    finally {
      count++;
      throw new Error('needsFinallyFixTest');
    }
  } catch (e) {}

  return count !== 1;
})();

/**
  Provides try { } finally { } functionality, while working
  around Safari's double finally bug.

  @method tryFinally
  @for Ember
  @param {Function} function The function to run the try callback
  @param {Function} function The function to run the finally callback
  @param [binding]
  @return {anything} The return value is the that of the finalizer,
  unless that valueis undefined, in which case it is the return value
  of the tryable
*/

if (needsFinallyFix) {
  Ember.tryFinally = function(tryable, finalizer, binding) {
    var result, finalResult, finalError;

    binding = binding || this;

    try {
      result = tryable.call(binding);
    } finally {
      try {
        finalResult = finalizer.call(binding);
      } catch (e){
        finalError = e;
      }
    }

    if (finalError) { throw finalError; }

    return (finalResult === undefined) ? result : finalResult;
  };
} else {
  Ember.tryFinally = function(tryable, finalizer, binding) {
    var result, finalResult;

    binding = binding || this;

    try {
      result = tryable.call(binding);
    } finally {
      finalResult = finalizer.call(binding);
    }

    return (finalResult === undefined) ? result : finalResult;
  };
}

/**
  Provides try { } catch finally { } functionality, while working
  around Safari's double finally bug.

  @method tryCatchFinally
  @for Ember
  @param {Function} function The function to run the try callback
  @param {Function} function The function to run the catchable callback
  @param {Function} function The function to run the finally callback
  @param [binding]
  @return {anything} The return value is the that of the finalizer,
  unless that value is undefined, in which case it is the return value
  of the tryable.
*/
if (needsFinallyFix) {
  Ember.tryCatchFinally = function(tryable, catchable, finalizer, binding) {
    var result, finalResult, finalError, finalReturn;

    binding = binding || this;

    try {
      result = tryable.call(binding);
    } catch(error) {
      result = catchable.call(binding, error);
    } finally {
      try {
        finalResult = finalizer.call(binding);
      } catch (e){
        finalError = e;
      }
    }

    if (finalError) { throw finalError; }

    return (finalResult === undefined) ? result : finalResult;
  };
} else {
  Ember.tryCatchFinally = function(tryable, catchable, finalizer, binding) {
    var result, finalResult;

    binding = binding || this;

    try {
      result = tryable.call(binding);
    } catch(error) {
      result = catchable.call(binding, error);
    } finally {
      finalResult = finalizer.call(binding);
    }

    return (finalResult === undefined) ? result : finalResult;
  };
}

})();



(function() {
// Ember.tryCatchFinally

/**
  The purpose of the Ember Instrumentation module is
  to provide efficient, general-purpose instrumentation
  for Ember.

  Subscribe to a listener by using `Ember.subscribe`:

  ```javascript
  Ember.subscribe("render", {
    before: function(name, timestamp, payload) {

    },

    after: function(name, timestamp, payload) {

    }
  });
  ```

  If you return a value from the `before` callback, that same
  value will be passed as a fourth parameter to the `after`
  callback.

  Instrument a block of code by using `Ember.instrument`:

  ```javascript
  Ember.instrument("render.handlebars", payload, function() {
    // rendering logic
  }, binding);
  ```

  Event names passed to `Ember.instrument` are namespaced
  by periods, from more general to more specific. Subscribers
  can listen for events by whatever level of granularity they
  are interested in.

  In the above example, the event is `render.handlebars`,
  and the subscriber listened for all events beginning with
  `render`. It would receive callbacks for events named
  `render`, `render.handlebars`, `render.container`, or
  even `render.handlebars.layout`.

  @class Instrumentation
  @namespace Ember
  @static
*/
Ember.Instrumentation = {};

var subscribers = [], cache = {};

var populateListeners = function(name) {
  var listeners = [], subscriber;

  for (var i=0, l=subscribers.length; i<l; i++) {
    subscriber = subscribers[i];
    if (subscriber.regex.test(name)) {
      listeners.push(subscriber.object);
    }
  }

  cache[name] = listeners;
  return listeners;
};

var time = (function() {
	var perf = 'undefined' !== typeof window ? window.performance || {} : {};
	var fn = perf.now || perf.mozNow || perf.webkitNow || perf.msNow || perf.oNow;
	// fn.bind will be available in all the browsers that support the advanced window.performance... ;-)
	return fn ? fn.bind(perf) : function() { return +new Date(); };
})();


Ember.Instrumentation.instrument = function(name, payload, callback, binding) {
  var listeners = cache[name], timeName, ret;

  if (Ember.STRUCTURED_PROFILE) {
    timeName = name + ": " + payload.object;
    console.time(timeName);
  }

  if (!listeners) {
    listeners = populateListeners(name);
  }

  if (listeners.length === 0) {
    ret = callback.call(binding);
    if (Ember.STRUCTURED_PROFILE) { console.timeEnd(timeName); }
    return ret;
  }

  var beforeValues = [], listener, i, l;

  function tryable(){
    for (i=0, l=listeners.length; i<l; i++) {
      listener = listeners[i];
      beforeValues[i] = listener.before(name, time(), payload);
    }

    return callback.call(binding);
  }

  function catchable(e){
    payload = payload || {};
    payload.exception = e;
  }

  function finalizer() {
    for (i=0, l=listeners.length; i<l; i++) {
      listener = listeners[i];
      listener.after(name, time(), payload, beforeValues[i]);
    }

    if (Ember.STRUCTURED_PROFILE) {
      console.timeEnd(timeName);
    }
  }

  return Ember.tryCatchFinally(tryable, catchable, finalizer);
};

Ember.Instrumentation.subscribe = function(pattern, object) {
  var paths = pattern.split("."), path, regex = [];

  for (var i=0, l=paths.length; i<l; i++) {
    path = paths[i];
    if (path === "*") {
      regex.push("[^\\.]*");
    } else {
      regex.push(path);
    }
  }

  regex = regex.join("\\.");
  regex = regex + "(\\..*)?";

  var subscriber = {
    pattern: pattern,
    regex: new RegExp("^" + regex + "$"),
    object: object
  };

  subscribers.push(subscriber);
  cache = {};

  return subscriber;
};

Ember.Instrumentation.unsubscribe = function(subscriber) {
  var index;

  for (var i=0, l=subscribers.length; i<l; i++) {
    if (subscribers[i] === subscriber) {
      index = i;
    }
  }

  subscribers.splice(index, 1);
  cache = {};
};

Ember.Instrumentation.reset = function() {
  subscribers = [];
  cache = {};
};

Ember.instrument = Ember.Instrumentation.instrument;
Ember.subscribe = Ember.Instrumentation.subscribe;

})();



(function() {
var utils = Ember.EnumerableUtils = {
  map: function(obj, callback, thisArg) {
    return obj.map ? obj.map.call(obj, callback, thisArg) : Array.prototype.map.call(obj, callback, thisArg);
  },

  forEach: function(obj, callback, thisArg) {
    return obj.forEach ? obj.forEach.call(obj, callback, thisArg) : Array.prototype.forEach.call(obj, callback, thisArg);
  },

  indexOf: function(obj, element, index) {
    return obj.indexOf ? obj.indexOf.call(obj, element, index) : Array.prototype.indexOf.call(obj, element, index);
  },

  indexesOf: function(obj, elements) {
    return elements === undefined ? [] : utils.map(elements, function(item) {
      return utils.indexOf(obj, item);
    });
  },

  addObject: function(array, item) {
    var index = utils.indexOf(array, item);
    if (index === -1) { array.push(item); }
  },

  removeObject: function(array, item) {
    var index = utils.indexOf(array, item);
    if (index !== -1) { array.splice(index, 1); }
  },

  replace: function(array, idx, amt, objects) {
    if (array.replace) {
      return array.replace(idx, amt, objects);
    } else {
      var args = Array.prototype.concat.apply([idx, amt], objects);
      return array.splice.apply(array, args);
    }
  },

  intersection: function(array1, array2) {
    var intersection = [];

    array1.forEach(function(element) {
      if (array2.indexOf(element) >= 0) {
        intersection.push(element);
      }
    });

    return intersection;
  }
};

})();



(function() {
/*jshint newcap:false*/
/**
@module ember-metal
*/

// NOTE: There is a bug in jshint that doesn't recognize `Object()` without `new`
// as being ok unless both `newcap:false` and not `use strict`.
// https://github.com/jshint/jshint/issues/392

// Testing this is not ideal, but we want to use native functions
// if available, but not to use versions created by libraries like Prototype
var isNativeFunc = function(func) {
  // This should probably work in all browsers likely to have ES5 array methods
  return func && Function.prototype.toString.call(func).indexOf('[native code]') > -1;
};

// From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/map
var arrayMap = isNativeFunc(Array.prototype.map) ? Array.prototype.map : function(fun /*, thisp */) {
  //"use strict";

  if (this === void 0 || this === null) {
    throw new TypeError();
  }

  var t = Object(this);
  var len = t.length >>> 0;
  if (typeof fun !== "function") {
    throw new TypeError();
  }

  var res = new Array(len);
  var thisp = arguments[1];
  for (var i = 0; i < len; i++) {
    if (i in t) {
      res[i] = fun.call(thisp, t[i], i, t);
    }
  }

  return res;
};

// From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach
var arrayForEach = isNativeFunc(Array.prototype.forEach) ? Array.prototype.forEach : function(fun /*, thisp */) {
  //"use strict";

  if (this === void 0 || this === null) {
    throw new TypeError();
  }

  var t = Object(this);
  var len = t.length >>> 0;
  if (typeof fun !== "function") {
    throw new TypeError();
  }

  var thisp = arguments[1];
  for (var i = 0; i < len; i++) {
    if (i in t) {
      fun.call(thisp, t[i], i, t);
    }
  }
};

var arrayIndexOf = isNativeFunc(Array.prototype.indexOf) ? Array.prototype.indexOf : function (obj, fromIndex) {
  if (fromIndex === null || fromIndex === undefined) { fromIndex = 0; }
  else if (fromIndex < 0) { fromIndex = Math.max(0, this.length + fromIndex); }
  for (var i = fromIndex, j = this.length; i < j; i++) {
    if (this[i] === obj) { return i; }
  }
  return -1;
};

Ember.ArrayPolyfills = {
  map: arrayMap,
  forEach: arrayForEach,
  indexOf: arrayIndexOf
};

if (Ember.SHIM_ES5) {
  if (!Array.prototype.map) {
    Array.prototype.map = arrayMap;
  }

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = arrayForEach;
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = arrayIndexOf;
  }
}

})();



(function() {
/**
@module ember-metal
*/

/*
  JavaScript (before ES6) does not have a Map implementation. Objects,
  which are often used as dictionaries, may only have Strings as keys.

  Because Ember has a way to get a unique identifier for every object
  via `Ember.guidFor`, we can implement a performant Map with arbitrary
  keys. Because it is commonly used in low-level bookkeeping, Map is
  implemented as a pure JavaScript object for performance.

  This implementation follows the current iteration of the ES6 proposal for
  maps (http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets),
  with two exceptions. First, because we need our implementation to be pleasant
  on older browsers, we do not use the `delete` name (using `remove` instead).
  Second, as we do not have the luxury of in-VM iteration, we implement a
  forEach method for iteration.

  Map is mocked out to look like an Ember object, so you can do
  `Ember.Map.create()` for symmetry with other Ember classes.
*/
var guidFor = Ember.guidFor,
    indexOf = Ember.ArrayPolyfills.indexOf;

var copy = function(obj) {
  var output = {};

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) { output[prop] = obj[prop]; }
  }

  return output;
};

var copyMap = function(original, newObject) {
  var keys = original.keys.copy(),
      values = copy(original.values);

  newObject.keys = keys;
  newObject.values = values;

  return newObject;
};

/**
  This class is used internally by Ember and Ember Data.
  Please do not use it at this time. We plan to clean it up
  and add many tests soon.

  @class OrderedSet
  @namespace Ember
  @constructor
  @private
*/
var OrderedSet = Ember.OrderedSet = function() {
  this.clear();
};

/**
  @method create
  @static
  @return {Ember.OrderedSet}
*/
OrderedSet.create = function() {
  return new OrderedSet();
};


OrderedSet.prototype = {
  /**
    @method clear
  */
  clear: function() {
    this.presenceSet = {};
    this.list = [];
  },

  /**
    @method add
    @param obj
  */
  add: function(obj) {
    var guid = guidFor(obj),
        presenceSet = this.presenceSet,
        list = this.list;

    if (guid in presenceSet) { return; }

    presenceSet[guid] = true;
    list.push(obj);
  },

  /**
    @method remove
    @param obj
  */
  remove: function(obj) {
    var guid = guidFor(obj),
        presenceSet = this.presenceSet,
        list = this.list;

    delete presenceSet[guid];

    var index = indexOf.call(list, obj);
    if (index > -1) {
      list.splice(index, 1);
    }
  },

  /**
    @method isEmpty
    @return {Boolean}
  */
  isEmpty: function() {
    return this.list.length === 0;
  },

  /**
    @method has
    @param obj
    @return {Boolean}
  */
  has: function(obj) {
    var guid = guidFor(obj),
        presenceSet = this.presenceSet;

    return guid in presenceSet;
  },

  /**
    @method forEach
    @param {Function} function
    @param target
  */
  forEach: function(fn, self) {
    // allow mutation during iteration
    var list = this.list.slice();

    for (var i = 0, j = list.length; i < j; i++) {
      fn.call(self, list[i]);
    }
  },

  /**
    @method toArray
    @return {Array}
  */
  toArray: function() {
    return this.list.slice();
  },

  /**
    @method copy
    @return {Ember.OrderedSet}
  */
  copy: function() {
    var set = new OrderedSet();

    set.presenceSet = copy(this.presenceSet);
    set.list = this.list.slice();

    return set;
  }
};

/**
  A Map stores values indexed by keys. Unlike JavaScript's
  default Objects, the keys of a Map can be any JavaScript
  object.

  Internally, a Map has two data structures:

  1. `keys`: an OrderedSet of all of the existing keys
  2. `values`: a JavaScript Object indexed by the `Ember.guidFor(key)`

  When a key/value pair is added for the first time, we
  add the key to the `keys` OrderedSet, and create or
  replace an entry in `values`. When an entry is deleted,
  we delete its entry in `keys` and `values`.

  @class Map
  @namespace Ember
  @private
  @constructor
*/
var Map = Ember.Map = function() {
  this.keys = Ember.OrderedSet.create();
  this.values = {};
};

/**
  @method create
  @static
*/
Map.create = function() {
  return new Map();
};

Map.prototype = {
  /**
    Retrieve the value associated with a given key.

    @method get
    @param {anything} key
    @return {anything} the value associated with the key, or `undefined`
  */
  get: function(key) {
    var values = this.values,
        guid = guidFor(key);

    return values[guid];
  },

  /**
    Adds a value to the map. If a value for the given key has already been
    provided, the new value will replace the old value.

    @method set
    @param {anything} key
    @param {anything} value
  */
  set: function(key, value) {
    var keys = this.keys,
        values = this.values,
        guid = guidFor(key);

    keys.add(key);
    values[guid] = value;
  },

  /**
    Removes a value from the map for an associated key.

    @method remove
    @param {anything} key
    @return {Boolean} true if an item was removed, false otherwise
  */
  remove: function(key) {
    // don't use ES6 "delete" because it will be annoying
    // to use in browsers that are not ES6 friendly;
    var keys = this.keys,
        values = this.values,
        guid = guidFor(key),
        value;

    if (values.hasOwnProperty(guid)) {
      keys.remove(key);
      value = values[guid];
      delete values[guid];
      return true;
    } else {
      return false;
    }
  },

  /**
    Check whether a key is present.

    @method has
    @param {anything} key
    @return {Boolean} true if the item was present, false otherwise
  */
  has: function(key) {
    var values = this.values,
        guid = guidFor(key);

    return values.hasOwnProperty(guid);
  },

  /**
    Iterate over all the keys and values. Calls the function once
    for each key, passing in the key and value, in that order.

    The keys are guaranteed to be iterated over in insertion order.

    @method forEach
    @param {Function} callback
    @param {anything} self if passed, the `this` value inside the
      callback. By default, `this` is the map.
  */
  forEach: function(callback, self) {
    var keys = this.keys,
        values = this.values;

    keys.forEach(function(key) {
      var guid = guidFor(key);
      callback.call(self, key, values[guid]);
    });
  },

  /**
    @method copy
    @return {Ember.Map}
  */
  copy: function() {
    return copyMap(this, new Map());
  }
};

/**
  @class MapWithDefault
  @namespace Ember
  @extends Ember.Map
  @private
  @constructor
  @param [options]
    @param {anything} [options.defaultValue]
*/
var MapWithDefault = Ember.MapWithDefault = function(options) {
  Map.call(this);
  this.defaultValue = options.defaultValue;
};

/**
  @method create
  @static
  @param [options]
    @param {anything} [options.defaultValue]
  @return {Ember.MapWithDefault|Ember.Map} If options are passed, returns
    `Ember.MapWithDefault` otherwise returns `Ember.Map`
*/
MapWithDefault.create = function(options) {
  if (options) {
    return new MapWithDefault(options);
  } else {
    return new Map();
  }
};

MapWithDefault.prototype = Ember.create(Map.prototype);

/**
  Retrieve the value associated with a given key.

  @method get
  @param {anything} key
  @return {anything} the value associated with the key, or the default value
*/
MapWithDefault.prototype.get = function(key) {
  var hasValue = this.has(key);

  if (hasValue) {
    return Map.prototype.get.call(this, key);
  } else {
    var defaultValue = this.defaultValue(key);
    this.set(key, defaultValue);
    return defaultValue;
  }
};

/**
  @method copy
  @return {Ember.MapWithDefault}
*/
MapWithDefault.prototype.copy = function() {
  return copyMap(this, new MapWithDefault({
    defaultValue: this.defaultValue
  }));
};

})();



(function() {
/**
@module ember-metal
*/

var META_KEY = Ember.META_KEY, get, set;

var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER;

var IS_GLOBAL = /^([A-Z$]|([0-9][A-Z$]))/;
var IS_GLOBAL_PATH = /^([A-Z$]|([0-9][A-Z$])).*[\.\*]/;
var HAS_THIS  = /^this[\.\*]/;
var FIRST_KEY = /^([^\.\*]+)/;

// ..........................................................
// GET AND SET
//
// If we are on a platform that supports accessors we can get use those.
// Otherwise simulate accessors by looking up the property directly on the
// object.

/**
  Gets the value of a property on an object. If the property is computed,
  the function will be invoked. If the property is not defined but the
  object implements the `unknownProperty` method then that will be invoked.

  If you plan to run on IE8 and older browsers then you should use this
  method anytime you want to retrieve a property on an object that you don't
  know for sure is private. (Properties beginning with an underscore '_'
  are considered private.)

  On all newer browsers, you only need to use this method to retrieve
  properties if the property might not be defined on the object and you want
  to respect the `unknownProperty` handler. Otherwise you can ignore this
  method.

  Note that if the object itself is `undefined`, this method will throw
  an error.

  @method get
  @for Ember
  @param {Object} obj The object to retrieve from.
  @param {String} keyName The property key to retrieve
  @return {Object} the property value or `null`.
*/
get = function get(obj, keyName) {
  // Helpers that operate with 'this' within an #each
  if (keyName === '') {
    return obj;
  }

  if (!keyName && 'string'===typeof obj) {
    keyName = obj;
    obj = null;
  }

  if (!obj || keyName.indexOf('.') !== -1) {
    Ember.assert("Cannot call get with '"+ keyName +"' on an undefined object.", obj !== undefined);
    return getPath(obj, keyName);
  }

  Ember.assert("You need to provide an object and key to `get`.", !!obj && keyName);

  var meta = obj[META_KEY], desc = meta && meta.descs[keyName], ret;
  if (desc) {
    return desc.get(obj, keyName);
  } else {
    if (MANDATORY_SETTER && meta && meta.watching[keyName] > 0) {
      ret = meta.values[keyName];
    } else {
      ret = obj[keyName];
    }

    if (ret === undefined &&
        'object' === typeof obj && !(keyName in obj) && 'function' === typeof obj.unknownProperty) {
      return obj.unknownProperty(keyName);
    }

    return ret;
  }
};

/**
  Sets the value of a property on an object, respecting computed properties
  and notifying observers and other listeners of the change. If the
  property is not defined but the object implements the `unknownProperty`
  method then that will be invoked as well.

  If you plan to run on IE8 and older browsers then you should use this
  method anytime you want to set a property on an object that you don't
  know for sure is private. (Properties beginning with an underscore '_'
  are considered private.)

  On all newer browsers, you only need to use this method to set
  properties if the property might not be defined on the object and you want
  to respect the `unknownProperty` handler. Otherwise you can ignore this
  method.

  @method set
  @for Ember
  @param {Object} obj The object to modify.
  @param {String} keyName The property key to set
  @param {Object} value The value to set
  @return {Object} the passed value.
*/
set = function set(obj, keyName, value, tolerant) {
  if (typeof obj === 'string') {
    Ember.assert("Path '" + obj + "' must be global if no obj is given.", IS_GLOBAL.test(obj));
    value = keyName;
    keyName = obj;
    obj = null;
  }

  if (!obj || keyName.indexOf('.') !== -1) {
    return setPath(obj, keyName, value, tolerant);
  }

  Ember.assert("You need to provide an object and key to `set`.", !!obj && keyName !== undefined);
  Ember.assert('calling set on destroyed object', !obj.isDestroyed);

  var meta = obj[META_KEY], desc = meta && meta.descs[keyName],
      isUnknown, currentValue;
  if (desc) {
    desc.set(obj, keyName, value);
  } else {
    isUnknown = 'object' === typeof obj && !(keyName in obj);

    // setUnknownProperty is called if `obj` is an object,
    // the property does not already exist, and the
    // `setUnknownProperty` method exists on the object
    if (isUnknown && 'function' === typeof obj.setUnknownProperty) {
      obj.setUnknownProperty(keyName, value);
    } else if (meta && meta.watching[keyName] > 0) {
      if (MANDATORY_SETTER) {
        currentValue = meta.values[keyName];
      } else {
        currentValue = obj[keyName];
      }
      // only trigger a change if the value has changed
      if (value !== currentValue) {
        Ember.propertyWillChange(obj, keyName);
        if (MANDATORY_SETTER) {
          if (currentValue === undefined && !(keyName in obj)) {
            Ember.defineProperty(obj, keyName, null, value); // setup mandatory setter
          } else {
            meta.values[keyName] = value;
          }
        } else {
          obj[keyName] = value;
        }
        Ember.propertyDidChange(obj, keyName);
      }
    } else {
      obj[keyName] = value;
    }
  }
  return value;
};

// Currently used only by Ember Data tests
if (Ember.config.overrideAccessors) {
  Ember.get = get;
  Ember.set = set;
  Ember.config.overrideAccessors();
  get = Ember.get;
  set = Ember.set;
}

function firstKey(path) {
  return path.match(FIRST_KEY)[0];
}

// assumes path is already normalized
function normalizeTuple(target, path) {
  var hasThis  = HAS_THIS.test(path),
      isGlobal = !hasThis && IS_GLOBAL_PATH.test(path),
      key;

  if (!target || isGlobal) target = Ember.lookup;
  if (hasThis) path = path.slice(5);

  if (target === Ember.lookup) {
    key = firstKey(path);
    target = get(target, key);
    path   = path.slice(key.length+1);
  }

  // must return some kind of path to be valid else other things will break.
  if (!path || path.length===0) throw new Error('Invalid Path');

  return [ target, path ];
}

function getPath(root, path) {
  var hasThis, parts, tuple, idx, len;

  // If there is no root and path is a key name, return that
  // property from the global object.
  // E.g. get('Ember') -> Ember
  if (root === null && path.indexOf('.') === -1) { return get(Ember.lookup, path); }

  // detect complicated paths and normalize them
  hasThis  = HAS_THIS.test(path);

  if (!root || hasThis) {
    tuple = normalizeTuple(root, path);
    root = tuple[0];
    path = tuple[1];
    tuple.length = 0;
  }

  parts = path.split(".");
  len = parts.length;
  for (idx=0; root && idx<len; idx++) {
    root = get(root, parts[idx], true);
    if (root && root.isDestroyed) { return undefined; }
  }
  return root;
}

function setPath(root, path, value, tolerant) {
  var keyName;

  // get the last part of the path
  keyName = path.slice(path.lastIndexOf('.') + 1);

  // get the first part of the part
  path    = path.slice(0, path.length-(keyName.length+1));

  // unless the path is this, look up the first part to
  // get the root
  if (path !== 'this') {
    root = getPath(root, path);
  }

  if (!keyName || keyName.length === 0) {
    throw new Error('You passed an empty path');
  }

  if (!root) {
    if (tolerant) { return; }
    else { throw new Error('Object in path '+path+' could not be found or was destroyed.'); }
  }

  return set(root, keyName, value);
}

/**
  @private

  Normalizes a target/path pair to reflect that actual target/path that should
  be observed, etc. This takes into account passing in global property
  paths (i.e. a path beginning with a captial letter not defined on the
  target) and * separators.

  @method normalizeTuple
  @for Ember
  @param {Object} target The current target. May be `null`.
  @param {String} path A path on the target or a global property path.
  @return {Array} a temporary array with the normalized target/path pair.
*/
Ember.normalizeTuple = function(target, path) {
  return normalizeTuple(target, path);
};

Ember.getWithDefault = function(root, key, defaultValue) {
  var value = get(root, key);

  if (value === undefined) { return defaultValue; }
  return value;
};


Ember.get = get;
Ember.getPath = Ember.deprecateFunc('getPath is deprecated since get now supports paths', Ember.get);

Ember.set = set;
Ember.setPath = Ember.deprecateFunc('setPath is deprecated since set now supports paths', Ember.set);

/**
  Error-tolerant form of `Ember.set`. Will not blow up if any part of the
  chain is `undefined`, `null`, or destroyed.

  This is primarily used when syncing bindings, which may try to update after
  an object has been destroyed.

  @method trySet
  @for Ember
  @param {Object} obj The object to modify.
  @param {String} keyName The property key to set
  @param {Object} value The value to set
*/
Ember.trySet = function(root, path, value) {
  return set(root, path, value, true);
};
Ember.trySetPath = Ember.deprecateFunc('trySetPath has been renamed to trySet', Ember.trySet);

/**
  Returns true if the provided path is global (e.g., `MyApp.fooController.bar`)
  instead of local (`foo.bar.baz`).

  @method isGlobalPath
  @for Ember
  @private
  @param {String} path
  @return Boolean
*/
Ember.isGlobalPath = function(path) {
  return IS_GLOBAL.test(path);
};


})();



(function() {
/**
@module ember-metal
*/

var GUID_KEY = Ember.GUID_KEY,
    META_KEY = Ember.META_KEY,
    EMPTY_META = Ember.EMPTY_META,
    metaFor = Ember.meta,
    o_create = Ember.create,
    objectDefineProperty = Ember.platform.defineProperty;

var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER;

// ..........................................................
// DESCRIPTOR
//

/**
  Objects of this type can implement an interface to responds requests to
  get and set. The default implementation handles simple properties.

  You generally won't need to create or subclass this directly.

  @class Descriptor
  @namespace Ember
  @private
  @constructor
*/
var Descriptor = Ember.Descriptor = function() {};

// ..........................................................
// DEFINING PROPERTIES API
//

var MANDATORY_SETTER_FUNCTION = Ember.MANDATORY_SETTER_FUNCTION = function(value) {
  Ember.assert("You must use Ember.set() to access this property (of " + this + ")", false);
};

var DEFAULT_GETTER_FUNCTION = Ember.DEFAULT_GETTER_FUNCTION = function(name) {
  return function() {
    var meta = this[META_KEY];
    return meta && meta.values[name];
  };
};

/**
  @private

  NOTE: This is a low-level method used by other parts of the API. You almost
  never want to call this method directly. Instead you should use
  `Ember.mixin()` to define new properties.

  Defines a property on an object. This method works much like the ES5
  `Object.defineProperty()` method except that it can also accept computed
  properties and other special descriptors.

  Normally this method takes only three parameters. However if you pass an
  instance of `Ember.Descriptor` as the third param then you can pass an
  optional value as the fourth parameter. This is often more efficient than
  creating new descriptor hashes for each property.

  ## Examples

  ```javascript
  // ES5 compatible mode
  Ember.defineProperty(contact, 'firstName', {
    writable: true,
    configurable: false,
    enumerable: true,
    value: 'Charles'
  });

  // define a simple property
  Ember.defineProperty(contact, 'lastName', undefined, 'Jolley');

  // define a computed property
  Ember.defineProperty(contact, 'fullName', Ember.computed(function() {
    return this.firstName+' '+this.lastName;
  }).property('firstName', 'lastName'));
  ```

  @method defineProperty
  @for Ember
  @param {Object} obj the object to define this property on. This may be a prototype.
  @param {String} keyName the name of the property
  @param {Ember.Descriptor} [desc] an instance of `Ember.Descriptor` (typically a
    computed property) or an ES5 descriptor.
    You must provide this or `data` but not both.
  @param {anything} [data] something other than a descriptor, that will
    become the explicit value of this property.
*/
Ember.defineProperty = function(obj, keyName, desc, data, meta) {
  var descs, existingDesc, watching, value;

  if (!meta) meta = metaFor(obj);
  descs = meta.descs;
  existingDesc = meta.descs[keyName];
  watching = meta.watching[keyName] > 0;

  if (existingDesc instanceof Ember.Descriptor) {
    existingDesc.teardown(obj, keyName);
  }

  if (desc instanceof Ember.Descriptor) {
    value = desc;

    descs[keyName] = desc;
    if (MANDATORY_SETTER && watching) {
      objectDefineProperty(obj, keyName, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: undefined // make enumerable
      });
    } else {
      obj[keyName] = undefined; // make enumerable
    }
    desc.setup(obj, keyName);
  } else {
    descs[keyName] = undefined; // shadow descriptor in proto
    if (desc == null) {
      value = data;

      if (MANDATORY_SETTER && watching) {
        meta.values[keyName] = data;
        objectDefineProperty(obj, keyName, {
          configurable: true,
          enumerable: true,
          set: MANDATORY_SETTER_FUNCTION,
          get: DEFAULT_GETTER_FUNCTION(keyName)
        });
      } else {
        obj[keyName] = data;
      }
    } else {
      value = desc;

      // compatibility with ES5
      objectDefineProperty(obj, keyName, desc);
    }
  }

  // if key is being watched, override chains that
  // were initialized with the prototype
  if (watching) { Ember.overrideChains(obj, keyName, meta); }

  // The `value` passed to the `didDefineProperty` hook is
  // either the descriptor or data, whichever was passed.
  if (obj.didDefineProperty) { obj.didDefineProperty(obj, keyName, value); }

  return this;
};


})();



(function() {
// Ember.tryFinally
/**
@module ember-metal
*/

var AFTER_OBSERVERS = ':change';
var BEFORE_OBSERVERS = ':before';

var guidFor = Ember.guidFor;

var deferred = 0;

/*
  this.observerSet = {
    [senderGuid]: { // variable name: `keySet`
      [keyName]: listIndex
    }
  },
  this.observers = [
    {
      sender: obj,
      keyName: keyName,
      eventName: eventName,
      listeners: [
        [target, method, onceFlag, suspendedFlag]
      ]
    },
    ...
  ]
*/
function ObserverSet() {
  this.clear();
}

ObserverSet.prototype.add = function(sender, keyName, eventName) {
  var observerSet = this.observerSet,
      observers = this.observers,
      senderGuid = Ember.guidFor(sender),
      keySet = observerSet[senderGuid],
      index;

  if (!keySet) {
    observerSet[senderGuid] = keySet = {};
  }
  index = keySet[keyName];
  if (index === undefined) {
    index = observers.push({
      sender: sender,
      keyName: keyName,
      eventName: eventName,
      listeners: []
    }) - 1;
    keySet[keyName] = index;
  }
  return observers[index].listeners;
};

ObserverSet.prototype.flush = function() {
  var observers = this.observers, i, len, observer, sender;
  this.clear();
  for (i=0, len=observers.length; i < len; ++i) {
    observer = observers[i];
    sender = observer.sender;
    if (sender.isDestroying || sender.isDestroyed) { continue; }
    Ember.sendEvent(sender, observer.eventName, [sender, observer.keyName], observer.listeners);
  }
};

ObserverSet.prototype.clear = function() {
  this.observerSet = {};
  this.observers = [];
};

var beforeObserverSet = new ObserverSet(), observerSet = new ObserverSet();

/**
  @method beginPropertyChanges
  @chainable
*/
Ember.beginPropertyChanges = function() {
  deferred++;
};

/**
  @method endPropertyChanges
*/
Ember.endPropertyChanges = function() {
  deferred--;
  if (deferred<=0) {
    beforeObserverSet.clear();
    observerSet.flush();
  }
};

/**
  Make a series of property changes together in an
  exception-safe way.

  ```javascript
  Ember.changeProperties(function() {
    obj1.set('foo', mayBlowUpWhenSet);
    obj2.set('bar', baz);
  });
  ```

  @method changeProperties
  @param {Function} callback
  @param [binding]
*/
Ember.changeProperties = function(cb, binding){
  Ember.beginPropertyChanges();
  Ember.tryFinally(cb, Ember.endPropertyChanges, binding);
};

/**
  Set a list of properties on an object. These properties are set inside
  a single `beginPropertyChanges` and `endPropertyChanges` batch, so
  observers will be buffered.

  @method setProperties
  @param target
  @param {Hash} properties
  @return target
*/
Ember.setProperties = function(self, hash) {
  Ember.changeProperties(function(){
    for(var prop in hash) {
      if (hash.hasOwnProperty(prop)) Ember.set(self, prop, hash[prop]);
    }
  });
  return self;
};


function changeEvent(keyName) {
  return keyName+AFTER_OBSERVERS;
}

function beforeEvent(keyName) {
  return keyName+BEFORE_OBSERVERS;
}

/**
  @method addObserver
  @param obj
  @param {String} path
  @param {Object|Function} targetOrMethod
  @param {Function|String} [method]
*/
Ember.addObserver = function(obj, path, target, method) {
  Ember.addListener(obj, changeEvent(path), target, method);
  Ember.watch(obj, path);
  return this;
};

Ember.observersFor = function(obj, path) {
  return Ember.listenersFor(obj, changeEvent(path));
};

/**
  @method removeObserver
  @param obj
  @param {String} path
  @param {Object|Function} targetOrMethod
  @param {Function|String} [method]
*/
Ember.removeObserver = function(obj, path, target, method) {
  Ember.unwatch(obj, path);
  Ember.removeListener(obj, changeEvent(path), target, method);
  return this;
};

/**
  @method addBeforeObserver
  @param obj
  @param {String} path
  @param {Object|Function} targetOrMethod
  @param {Function|String} [method]
*/
Ember.addBeforeObserver = function(obj, path, target, method) {
  Ember.addListener(obj, beforeEvent(path), target, method);
  Ember.watch(obj, path);
  return this;
};

// Suspend observer during callback.
//
// This should only be used by the target of the observer
// while it is setting the observed path.
Ember._suspendBeforeObserver = function(obj, path, target, method, callback) {
  return Ember._suspendListener(obj, beforeEvent(path), target, method, callback);
};

Ember._suspendObserver = function(obj, path, target, method, callback) {
  return Ember._suspendListener(obj, changeEvent(path), target, method, callback);
};

var map = Ember.ArrayPolyfills.map;

Ember._suspendBeforeObservers = function(obj, paths, target, method, callback) {
  var events = map.call(paths, beforeEvent);
  return Ember._suspendListeners(obj, events, target, method, callback);
};

Ember._suspendObservers = function(obj, paths, target, method, callback) {
  var events = map.call(paths, changeEvent);
  return Ember._suspendListeners(obj, events, target, method, callback);
};

Ember.beforeObserversFor = function(obj, path) {
  return Ember.listenersFor(obj, beforeEvent(path));
};

/**
  @method removeBeforeObserver
  @param obj
  @param {String} path
  @param {Object|Function} targetOrMethod
  @param {Function|String} [method]
*/
Ember.removeBeforeObserver = function(obj, path, target, method) {
  Ember.unwatch(obj, path);
  Ember.removeListener(obj, beforeEvent(path), target, method);
  return this;
};

Ember.notifyBeforeObservers = function(obj, keyName) {
  if (obj.isDestroying) { return; }

  var eventName = beforeEvent(keyName), listeners, listenersDiff;
  if (deferred) {
    listeners = beforeObserverSet.add(obj, keyName, eventName);
    listenersDiff = Ember.listenersDiff(obj, eventName, listeners);
    Ember.sendEvent(obj, eventName, [obj, keyName], listenersDiff);
  } else {
    Ember.sendEvent(obj, eventName, [obj, keyName]);
  }
};

Ember.notifyObservers = function(obj, keyName) {
  if (obj.isDestroying) { return; }

  var eventName = changeEvent(keyName), listeners;
  if (deferred) {
    listeners = observerSet.add(obj, keyName, eventName);
    Ember.listenersUnion(obj, eventName, listeners);
  } else {
    Ember.sendEvent(obj, eventName, [obj, keyName]);
  }
};

})();



(function() {
/**
@module ember-metal
*/

var guidFor = Ember.guidFor, // utils.js
    metaFor = Ember.meta, // utils.js
    get = Ember.get, // accessors.js
    set = Ember.set, // accessors.js
    normalizeTuple = Ember.normalizeTuple, // accessors.js
    GUID_KEY = Ember.GUID_KEY, // utils.js
    META_KEY = Ember.META_KEY, // utils.js
    // circular reference observer depends on Ember.watch
    // we should move change events to this file or its own property_events.js
    notifyObservers = Ember.notifyObservers, // observer.js
    forEach = Ember.ArrayPolyfills.forEach, // array.js
    FIRST_KEY = /^([^\.\*]+)/,
    IS_PATH = /[\.\*]/;

var MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER,
o_defineProperty = Ember.platform.defineProperty;

function firstKey(path) {
  return path.match(FIRST_KEY)[0];
}

// returns true if the passed path is just a keyName
function isKeyName(path) {
  return path==='*' || !IS_PATH.test(path);
}

// ..........................................................
// DEPENDENT KEYS
//

function iterDeps(method, obj, depKey, seen, meta) {

  var guid = guidFor(obj);
  if (!seen[guid]) seen[guid] = {};
  if (seen[guid][depKey]) return;
  seen[guid][depKey] = true;

  var deps = meta.deps;
  deps = deps && deps[depKey];
  if (deps) {
    for(var key in deps) {
      var desc = meta.descs[key];
      if (desc && desc._suspended === obj) continue;
      method(obj, key);
    }
  }
}


var WILL_SEEN, DID_SEEN;

// called whenever a property is about to change to clear the cache of any dependent keys (and notify those properties of changes, etc...)
function dependentKeysWillChange(obj, depKey, meta) {
  if (obj.isDestroying) { return; }

  var seen = WILL_SEEN, top = !seen;
  if (top) { seen = WILL_SEEN = {}; }
  iterDeps(propertyWillChange, obj, depKey, seen, meta);
  if (top) { WILL_SEEN = null; }
}

// called whenever a property has just changed to update dependent keys
function dependentKeysDidChange(obj, depKey, meta) {
  if (obj.isDestroying) { return; }

  var seen = DID_SEEN, top = !seen;
  if (top) { seen = DID_SEEN = {}; }
  iterDeps(propertyDidChange, obj, depKey, seen, meta);
  if (top) { DID_SEEN = null; }
}

// ..........................................................
// CHAIN
//

function addChainWatcher(obj, keyName, node) {
  if (!obj || ('object' !== typeof obj)) { return; } // nothing to do

  var m = metaFor(obj), nodes = m.chainWatchers;

  if (!m.hasOwnProperty('chainWatchers')) {
    nodes = m.chainWatchers = {};
  }

  if (!nodes[keyName]) { nodes[keyName] = []; }
  nodes[keyName].push(node);
  Ember.watch(obj, keyName);
}

function removeChainWatcher(obj, keyName, node) {
  if (!obj || 'object' !== typeof obj) { return; } // nothing to do

  var m = metaFor(obj, false);
  if (!m.hasOwnProperty('chainWatchers')) { return; } // nothing to do

  var nodes = m.chainWatchers;

  if (nodes[keyName]) {
    nodes = nodes[keyName];
    for (var i = 0, l = nodes.length; i < l; i++) {
      if (nodes[i] === node) { nodes.splice(i, 1); }
    }
  }
  Ember.unwatch(obj, keyName);
}

var pendingQueue = [];

// attempts to add the pendingQueue chains again. If some of them end up
// back in the queue and reschedule is true, schedules a timeout to try
// again.
function flushPendingChains() {
  if (pendingQueue.length === 0) { return; } // nothing to do

  var queue = pendingQueue;
  pendingQueue = [];

  forEach.call(queue, function(q) { q[0].add(q[1]); });

  Ember.warn('Watching an undefined global, Ember expects watched globals to be setup by the time the run loop is flushed, check for typos', pendingQueue.length === 0);
}

function isProto(pvalue) {
  return metaFor(pvalue, false).proto === pvalue;
}

// A ChainNode watches a single key on an object. If you provide a starting
// value for the key then the node won't actually watch it. For a root node
// pass null for parent and key and object for value.
var ChainNode = function(parent, key, value) {
  var obj;
  this._parent = parent;
  this._key    = key;

  // _watching is true when calling get(this._parent, this._key) will
  // return the value of this node.
  //
  // It is false for the root of a chain (because we have no parent)
  // and for global paths (because the parent node is the object with
  // the observer on it)
  this._watching = value===undefined;

  this._value  = value;
  this._paths = {};
  if (this._watching) {
    this._object = parent.value();
    if (this._object) { addChainWatcher(this._object, this._key, this); }
  }

  // Special-case: the EachProxy relies on immediate evaluation to
  // establish its observers.
  //
  // TODO: Replace this with an efficient callback that the EachProxy
  // can implement.
  if (this._parent && this._parent._key === '@each') {
    this.value();
  }
};

var ChainNodePrototype = ChainNode.prototype;

ChainNodePrototype.value = function() {
  if (this._value === undefined && this._watching) {
    var obj = this._parent.value();
    this._value = (obj && !isProto(obj)) ? get(obj, this._key) : undefined;
  }
  return this._value;
};

ChainNodePrototype.destroy = function() {
  if (this._watching) {
    var obj = this._object;
    if (obj) { removeChainWatcher(obj, this._key, this); }
    this._watching = false; // so future calls do nothing
  }
};

// copies a top level object only
ChainNodePrototype.copy = function(obj) {
  var ret = new ChainNode(null, null, obj),
      paths = this._paths, path;
  for (path in paths) {
    if (paths[path] <= 0) { continue; } // this check will also catch non-number vals.
    ret.add(path);
  }
  return ret;
};

// called on the root node of a chain to setup watchers on the specified
// path.
ChainNodePrototype.add = function(path) {
  var obj, tuple, key, src, paths;

  paths = this._paths;
  paths[path] = (paths[path] || 0) + 1;

  obj = this.value();
  tuple = normalizeTuple(obj, path);

  // the path was a local path
  if (tuple[0] && tuple[0] === obj) {
    path = tuple[1];
    key  = firstKey(path);
    path = path.slice(key.length+1);

  // global path, but object does not exist yet.
  // put into a queue and try to connect later.
  } else if (!tuple[0]) {
    pendingQueue.push([this, path]);
    tuple.length = 0;
    return;

  // global path, and object already exists
  } else {
    src  = tuple[0];
    key  = path.slice(0, 0-(tuple[1].length+1));
    path = tuple[1];
  }

  tuple.length = 0;
  this.chain(key, path, src);
};

// called on the root node of a chain to teardown watcher on the specified
// path
ChainNodePrototype.remove = function(path) {
  var obj, tuple, key, src, paths;

  paths = this._paths;
  if (paths[path] > 0) { paths[path]--; }

  obj = this.value();
  tuple = normalizeTuple(obj, path);
  if (tuple[0] === obj) {
    path = tuple[1];
    key  = firstKey(path);
    path = path.slice(key.length+1);
  } else {
    src  = tuple[0];
    key  = path.slice(0, 0-(tuple[1].length+1));
    path = tuple[1];
  }

  tuple.length = 0;
  this.unchain(key, path);
};

ChainNodePrototype.count = 0;

ChainNodePrototype.chain = function(key, path, src) {
  var chains = this._chains, node;
  if (!chains) { chains = this._chains = {}; }

  node = chains[key];
  if (!node) { node = chains[key] = new ChainNode(this, key, src); }
  node.count++; // count chains...

  // chain rest of path if there is one
  if (path && path.length>0) {
    key = firstKey(path);
    path = path.slice(key.length+1);
    node.chain(key, path); // NOTE: no src means it will observe changes...
  }
};

ChainNodePrototype.unchain = function(key, path) {
  var chains = this._chains, node = chains[key];

  // unchain rest of path first...
  if (path && path.length>1) {
    key  = firstKey(path);
    path = path.slice(key.length+1);
    node.unchain(key, path);
  }

  // delete node if needed.
  node.count--;
  if (node.count<=0) {
    delete chains[node._key];
    node.destroy();
  }

};

ChainNodePrototype.willChange = function() {
  var chains = this._chains;
  if (chains) {
    for(var key in chains) {
      if (!chains.hasOwnProperty(key)) { continue; }
      chains[key].willChange();
    }
  }

  if (this._parent) { this._parent.chainWillChange(this, this._key, 1); }
};

ChainNodePrototype.chainWillChange = function(chain, path, depth) {
  if (this._key) { path = this._key + '.' + path; }

  if (this._parent) {
    this._parent.chainWillChange(this, path, depth+1);
  } else {
    if (depth > 1) { Ember.propertyWillChange(this.value(), path); }
    path = 'this.' + path;
    if (this._paths[path] > 0) { Ember.propertyWillChange(this.value(), path); }
  }
};

ChainNodePrototype.chainDidChange = function(chain, path, depth) {
  if (this._key) { path = this._key + '.' + path; }
  if (this._parent) {
    this._parent.chainDidChange(this, path, depth+1);
  } else {
    if (depth > 1) { Ember.propertyDidChange(this.value(), path); }
    path = 'this.' + path;
    if (this._paths[path] > 0) { Ember.propertyDidChange(this.value(), path); }
  }
};

ChainNodePrototype.didChange = function(suppressEvent) {
  // invalidate my own value first.
  if (this._watching) {
    var obj = this._parent.value();
    if (obj !== this._object) {
      removeChainWatcher(this._object, this._key, this);
      this._object = obj;
      addChainWatcher(obj, this._key, this);
    }
    this._value  = undefined;

    // Special-case: the EachProxy relies on immediate evaluation to
    // establish its observers.
    if (this._parent && this._parent._key === '@each')
      this.value();
  }

  // then notify chains...
  var chains = this._chains;
  if (chains) {
    for(var key in chains) {
      if (!chains.hasOwnProperty(key)) { continue; }
      chains[key].didChange(suppressEvent);
    }
  }

  if (suppressEvent) { return; }

  // and finally tell parent about my path changing...
  if (this._parent) { this._parent.chainDidChange(this, this._key, 1); }
};

// get the chains for the current object. If the current object has
// chains inherited from the proto they will be cloned and reconfigured for
// the current object.
function chainsFor(obj) {
  var m = metaFor(obj), ret = m.chains;
  if (!ret) {
    ret = m.chains = new ChainNode(null, null, obj);
  } else if (ret.value() !== obj) {
    ret = m.chains = ret.copy(obj);
  }
  return ret;
}

Ember.overrideChains = function(obj, keyName, m) {
  chainsDidChange(obj, keyName, m, true);
};

function chainsWillChange(obj, keyName, m, arg) {
  if (!m.hasOwnProperty('chainWatchers')) { return; } // nothing to do

  var nodes = m.chainWatchers;

  nodes = nodes[keyName];
  if (!nodes) { return; }

  for(var i = 0, l = nodes.length; i < l; i++) {
    nodes[i].willChange(arg);
  }
}

function chainsDidChange(obj, keyName, m, arg) {
  if (!m.hasOwnProperty('chainWatchers')) { return; } // nothing to do

  var nodes = m.chainWatchers;

  nodes = nodes[keyName];
  if (!nodes) { return; }

  // looping in reverse because the chainWatchers array can be modified inside didChange
  for (var i = nodes.length - 1; i >= 0; i--) {
    nodes[i].didChange(arg);
  }
}

// ..........................................................
// WATCH
//

/**
  @private

  Starts watching a property on an object. Whenever the property changes,
  invokes `Ember.propertyWillChange` and `Ember.propertyDidChange`. This is the
  primitive used by observers and dependent keys; usually you will never call
  this method directly but instead use higher level methods like
  `Ember.addObserver()`

  @method watch
  @for Ember
  @param obj
  @param {String} keyName
*/
Ember.watch = function(obj, keyName) {
  // can't watch length on Array - it is special...
  if (keyName === 'length' && Ember.typeOf(obj) === 'array') { return this; }

  var m = metaFor(obj), watching = m.watching, desc;

  // activate watching first time
  if (!watching[keyName]) {
    watching[keyName] = 1;
    if (isKeyName(keyName)) {
      desc = m.descs[keyName];
      if (desc && desc.willWatch) { desc.willWatch(obj, keyName); }

      if ('function' === typeof obj.willWatchProperty) {
        obj.willWatchProperty(keyName);
      }

      if (MANDATORY_SETTER && keyName in obj) {
        m.values[keyName] = obj[keyName];
        o_defineProperty(obj, keyName, {
          configurable: true,
          enumerable: true,
          set: Ember.MANDATORY_SETTER_FUNCTION,
          get: Ember.DEFAULT_GETTER_FUNCTION(keyName)
        });
      }
    } else {
      chainsFor(obj).add(keyName);
    }

  }  else {
    watching[keyName] = (watching[keyName] || 0) + 1;
  }
  return this;
};

Ember.isWatching = function isWatching(obj, key) {
  var meta = obj[META_KEY];
  return (meta && meta.watching[key]) > 0;
};

Ember.watch.flushPending = flushPendingChains;

Ember.unwatch = function(obj, keyName) {
  // can't watch length on Array - it is special...
  if (keyName === 'length' && Ember.typeOf(obj) === 'array') { return this; }

  var m = metaFor(obj), watching = m.watching, desc;

  if (watching[keyName] === 1) {
    watching[keyName] = 0;

    if (isKeyName(keyName)) {
      desc = m.descs[keyName];
      if (desc && desc.didUnwatch) { desc.didUnwatch(obj, keyName); }

      if ('function' === typeof obj.didUnwatchProperty) {
        obj.didUnwatchProperty(keyName);
      }

      if (MANDATORY_SETTER && keyName in obj) {
        o_defineProperty(obj, keyName, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: m.values[keyName]
        });
        delete m.values[keyName];
      }
    } else {
      chainsFor(obj).remove(keyName);
    }

  } else if (watching[keyName]>1) {
    watching[keyName]--;
  }

  return this;
};

/**
  @private

  Call on an object when you first beget it from another object. This will
  setup any chained watchers on the object instance as needed. This method is
  safe to call multiple times.

  @method rewatch
  @for Ember
  @param obj
*/
Ember.rewatch = function(obj) {
  var m = metaFor(obj, false), chains = m.chains;

  // make sure the object has its own guid.
  if (GUID_KEY in obj && !obj.hasOwnProperty(GUID_KEY)) {
    Ember.generateGuid(obj, 'ember');
  }

  // make sure any chained watchers update.
  if (chains && chains.value() !== obj) {
    m.chains = chains.copy(obj);
  }

  return this;
};

Ember.finishChains = function(obj) {
  var m = metaFor(obj, false), chains = m.chains;
  if (chains) {
    if (chains.value() !== obj) {
      m.chains = chains = chains.copy(obj);
    }
    chains.didChange(true);
  }
};

// ..........................................................
// PROPERTY CHANGES
//

/**
  This function is called just before an object property is about to change.
  It will notify any before observers and prepare caches among other things.

  Normally you will not need to call this method directly but if for some
  reason you can't directly watch a property you can invoke this method
  manually along with `Ember.propertyDidChange()` which you should call just
  after the property value changes.

  @method propertyWillChange
  @for Ember
  @param {Object} obj The object with the property that will change
  @param {String} keyName The property key (or path) that will change.
  @return {void}
*/
function propertyWillChange(obj, keyName, value) {
  var m = metaFor(obj, false),
      watching = m.watching[keyName] > 0 || keyName === 'length',
      proto = m.proto,
      desc = m.descs[keyName];

  if (!watching) { return; }
  if (proto === obj) { return; }
  if (desc && desc.willChange) { desc.willChange(obj, keyName); }
  dependentKeysWillChange(obj, keyName, m);
  chainsWillChange(obj, keyName, m);
  Ember.notifyBeforeObservers(obj, keyName);
}

Ember.propertyWillChange = propertyWillChange;

/**
  This function is called just after an object property has changed.
  It will notify any observers and clear caches among other things.

  Normally you will not need to call this method directly but if for some
  reason you can't directly watch a property you can invoke this method
  manually along with `Ember.propertyWilLChange()` which you should call just
  before the property value changes.

  @method propertyDidChange
  @for Ember
  @param {Object} obj The object with the property that will change
  @param {String} keyName The property key (or path) that will change.
  @return {void}
*/
function propertyDidChange(obj, keyName) {
  var m = metaFor(obj, false),
      watching = m.watching[keyName] > 0 || keyName === 'length',
      proto = m.proto,
      desc = m.descs[keyName];

  if (proto === obj) { return; }

  // shouldn't this mean that we're watching this key?
  if (desc && desc.didChange) { desc.didChange(obj, keyName); }
  if (!watching && keyName !== 'length') { return; }

  dependentKeysDidChange(obj, keyName, m);
  chainsDidChange(obj, keyName, m);
  Ember.notifyObservers(obj, keyName);
}

Ember.propertyDidChange = propertyDidChange;

var NODE_STACK = [];

/**
  Tears down the meta on an object so that it can be garbage collected.
  Multiple calls will have no effect.

  @method destroy
  @for Ember
  @param {Object} obj  the object to destroy
  @return {void}
*/
Ember.destroy = function (obj) {
  var meta = obj[META_KEY], node, nodes, key, nodeObject;
  if (meta) {
    obj[META_KEY] = null;
    // remove chainWatchers to remove circular references that would prevent GC
    node = meta.chains;
    if (node) {
      NODE_STACK.push(node);
      // process tree
      while (NODE_STACK.length > 0) {
        node = NODE_STACK.pop();
        // push children
        nodes = node._chains;
        if (nodes) {
          for (key in nodes) {
            if (nodes.hasOwnProperty(key)) {
              NODE_STACK.push(nodes[key]);
            }
          }
        }
        // remove chainWatcher in node object
        if (node._watching) {
          nodeObject = node._object;
          if (nodeObject) {
            removeChainWatcher(nodeObject, node._key, node);
          }
        }
      }
    }
  }
};

})();



(function() {
/**
@module ember-metal
*/

Ember.warn("The CP_DEFAULT_CACHEABLE flag has been removed and computed properties are always cached by default. Use `volatile` if you don't want caching.", Ember.ENV.CP_DEFAULT_CACHEABLE !== false);


var get = Ember.get,
    set = Ember.set,
    metaFor = Ember.meta,
    guidFor = Ember.guidFor,
    a_slice = [].slice,
    o_create = Ember.create,
    META_KEY = Ember.META_KEY,
    watch = Ember.watch,
    unwatch = Ember.unwatch;

// ..........................................................
// DEPENDENT KEYS
//

// data structure:
//  meta.deps = {
//   'depKey': {
//     'keyName': count,
//   }
//  }

/*
  This function returns a map of unique dependencies for a
  given object and key.
*/
function keysForDep(obj, depsMeta, depKey) {
  var keys = depsMeta[depKey];
  if (!keys) {
    // if there are no dependencies yet for a the given key
    // create a new empty list of dependencies for the key
    keys = depsMeta[depKey] = {};
  } else if (!depsMeta.hasOwnProperty(depKey)) {
    // otherwise if the dependency list is inherited from
    // a superclass, clone the hash
    keys = depsMeta[depKey] = o_create(keys);
  }
  return keys;
}

/* return obj[META_KEY].deps */
function metaForDeps(obj, meta) {
  var deps = meta.deps;
  // If the current object has no dependencies...
  if (!deps) {
    // initialize the dependencies with a pointer back to
    // the current object
    deps = meta.deps = {};
  } else if (!meta.hasOwnProperty('deps')) {
    // otherwise if the dependencies are inherited from the
    // object's superclass, clone the deps
    deps = meta.deps = o_create(deps);
  }
  return deps;
}

function addDependentKeys(desc, obj, keyName, meta) {
  // the descriptor has a list of dependent keys, so
  // add all of its dependent keys.
  var depKeys = desc._dependentKeys, depsMeta, idx, len, depKey, keys;
  if (!depKeys) return;

  depsMeta = metaForDeps(obj, meta);

  for(idx = 0, len = depKeys.length; idx < len; idx++) {
    depKey = depKeys[idx];
    // Lookup keys meta for depKey
    keys = keysForDep(obj, depsMeta, depKey);
    // Increment the number of times depKey depends on keyName.
    keys[keyName] = (keys[keyName] || 0) + 1;
    // Watch the depKey
    watch(obj, depKey);
  }
}

function removeDependentKeys(desc, obj, keyName, meta) {
  // the descriptor has a list of dependent keys, so
  // add all of its dependent keys.
  var depKeys = desc._dependentKeys, depsMeta, idx, len, depKey, keys;
  if (!depKeys) return;

  depsMeta = metaForDeps(obj, meta);

  for(idx = 0, len = depKeys.length; idx < len; idx++) {
    depKey = depKeys[idx];
    // Lookup keys meta for depKey
    keys = keysForDep(obj, depsMeta, depKey);
    // Increment the number of times depKey depends on keyName.
    keys[keyName] = (keys[keyName] || 0) - 1;
    // Watch the depKey
    unwatch(obj, depKey);
  }
}

// ..........................................................
// COMPUTED PROPERTY
//

/**
  @class ComputedProperty
  @namespace Ember
  @extends Ember.Descriptor
  @constructor
*/
function ComputedProperty(func, opts) {
  this.func = func;
  this._cacheable = (opts && opts.cacheable !== undefined) ? opts.cacheable : true;
  this._dependentKeys = opts && opts.dependentKeys;
}

Ember.ComputedProperty = ComputedProperty;
ComputedProperty.prototype = new Ember.Descriptor();

var ComputedPropertyPrototype = ComputedProperty.prototype;

/**
  Call on a computed property to set it into cacheable mode. When in this
  mode the computed property will automatically cache the return value of
  your function until one of the dependent keys changes.

  ```javascript
  MyApp.president = Ember.Object.create({
    fullName: function() {
      return this.get('firstName') + ' ' + this.get('lastName');

      // After calculating the value of this function, Ember will
      // return that value without re-executing this function until
      // one of the dependent properties change.
    }.property('firstName', 'lastName')
  });
  ```

  Properties are cacheable by default.

  @method cacheable
  @param {Boolean} aFlag optional set to `false` to disable caching
  @chainable
*/
ComputedPropertyPrototype.cacheable = function(aFlag) {
  this._cacheable = aFlag !== false;
  return this;
};

/**
  Call on a computed property to set it into non-cached mode. When in this
  mode the computed property will not automatically cache the return value.

  ```javascript
  MyApp.outsideService = Ember.Object.create({
    value: function() {
      return OutsideService.getValue();
    }.property().volatile()
  });
  ```

  @method volatile
  @chainable
*/
ComputedPropertyPrototype.volatile = function() {
  return this.cacheable(false);
};

/**
  Sets the dependent keys on this computed property. Pass any number of
  arguments containing key paths that this computed property depends on.

  ```javascript
  MyApp.president = Ember.Object.create({
    fullName: Ember.computed(function() {
      return this.get('firstName') + ' ' + this.get('lastName');

      // Tell Ember that this computed property depends on firstName
      // and lastName
    }).property('firstName', 'lastName')
  });
  ```

  @method property
  @param {String} path* zero or more property paths
  @chainable
*/
ComputedPropertyPrototype.property = function() {
  var args = [];
  for (var i = 0, l = arguments.length; i < l; i++) {
    args.push(arguments[i]);
  }
  this._dependentKeys = args;
  return this;
};

/**
  In some cases, you may want to annotate computed properties with additional
  metadata about how they function or what values they operate on. For example,
  computed property functions may close over variables that are then no longer
  available for introspection.

  You can pass a hash of these values to a computed property like this:

  ```
  person: function() {
    var personId = this.get('personId');
    return App.Person.create({ id: personId });
  }.property().meta({ type: App.Person })
  ```

  The hash that you pass to the `meta()` function will be saved on the
  computed property descriptor under the `_meta` key. Ember runtime
  exposes a public API for retrieving these values from classes,
  via the `metaForProperty()` function.

  @method meta
  @param {Hash} meta
  @chainable
*/

ComputedPropertyPrototype.meta = function(meta) {
  if (arguments.length === 0) {
    return this._meta || {};
  } else {
    this._meta = meta;
    return this;
  }
};

/* impl descriptor API */
ComputedPropertyPrototype.willWatch = function(obj, keyName) {
  // watch already creates meta for this instance
  var meta = obj[META_KEY];
  Ember.assert('watch should have setup meta to be writable', meta.source === obj);
  if (!(keyName in meta.cache)) {
    addDependentKeys(this, obj, keyName, meta);
  }
};

ComputedPropertyPrototype.didUnwatch = function(obj, keyName) {
  var meta = obj[META_KEY];
  Ember.assert('unwatch should have setup meta to be writable', meta.source === obj);
  if (!(keyName in meta.cache)) {
    // unwatch already creates meta for this instance
    removeDependentKeys(this, obj, keyName, meta);
  }
};

/* impl descriptor API */
ComputedPropertyPrototype.didChange = function(obj, keyName) {
  // _suspended is set via a CP.set to ensure we don't clear
  // the cached value set by the setter
  if (this._cacheable && this._suspended !== obj) {
    var meta = metaFor(obj);
    if (keyName in meta.cache) {
      delete meta.cache[keyName];
      if (!meta.watching[keyName]) {
        removeDependentKeys(this, obj, keyName, meta);
      }
    }
  }
};

/* impl descriptor API */
ComputedPropertyPrototype.get = function(obj, keyName) {
  var ret, cache, meta;
  if (this._cacheable) {
    meta = metaFor(obj);
    cache = meta.cache;
    if (keyName in cache) { return cache[keyName]; }
    ret = cache[keyName] = this.func.call(obj, keyName);
    if (!meta.watching[keyName]) {
      addDependentKeys(this, obj, keyName, meta);
    }
  } else {
    ret = this.func.call(obj, keyName);
  }
  return ret;
};

/* impl descriptor API */
ComputedPropertyPrototype.set = function(obj, keyName, value) {
  var cacheable = this._cacheable,
      func = this.func,
      meta = metaFor(obj, cacheable),
      watched = meta.watching[keyName],
      oldSuspended = this._suspended,
      hadCachedValue = false,
      cache = meta.cache,
      cachedValue, ret;

  this._suspended = obj;

  try {
    if (cacheable && cache.hasOwnProperty(keyName)) {
      cachedValue = cache[keyName];
      hadCachedValue = true;
    }

    // Check if the CP has been wrapped
    if (func.wrappedFunction) { func = func.wrappedFunction; }

    // For backwards-compatibility with computed properties
    // that check for arguments.length === 2 to determine if
    // they are being get or set, only pass the old cached
    // value if the computed property opts into a third
    // argument.
    if (func.length === 3) {
      ret = func.call(obj, keyName, value, cachedValue);
    } else if (func.length === 2) {
      ret = func.call(obj, keyName, value);
    } else {
      Ember.defineProperty(obj, keyName, null, cachedValue);
      Ember.set(obj, keyName, value);
      return;
    }

    if (hadCachedValue && cachedValue === ret) { return; }

    if (watched) { Ember.propertyWillChange(obj, keyName); }

    if (hadCachedValue) {
      delete cache[keyName];
    }

    if (cacheable) {
      if (!watched && !hadCachedValue) {
        addDependentKeys(this, obj, keyName, meta);
      }
      cache[keyName] = ret;
    }

    if (watched) { Ember.propertyDidChange(obj, keyName); }
  } finally {
    this._suspended = oldSuspended;
  }
  return ret;
};

/* called when property is defined */
ComputedPropertyPrototype.setup = function(obj, keyName) {
  var meta = obj[META_KEY];
  if (meta && meta.watching[keyName]) {
    addDependentKeys(this, obj, keyName, metaFor(obj));
  }
};

/* called before property is overridden */
ComputedPropertyPrototype.teardown = function(obj, keyName) {
  var meta = metaFor(obj);

  if (meta.watching[keyName] || keyName in meta.cache) {
    removeDependentKeys(this, obj, keyName, meta);
  }

  if (this._cacheable) { delete meta.cache[keyName]; }

  return null; // no value to restore
};


/**
  This helper returns a new property descriptor that wraps the passed
  computed property function. You can use this helper to define properties
  with mixins or via `Ember.defineProperty()`.

  The function you pass will be used to both get and set property values.
  The function should accept two parameters, key and value. If value is not
  undefined you should set the value first. In either case return the
  current value of the property.

  @method computed
  @for Ember
  @param {Function} func The computed property function.
  @return {Ember.ComputedProperty} property descriptor instance
*/
Ember.computed = function(func) {
  var args;

  if (arguments.length > 1) {
    args = a_slice.call(arguments, 0, -1);
    func = a_slice.call(arguments, -1)[0];
  }

  var cp = new ComputedProperty(func);

  if (args) {
    cp.property.apply(cp, args);
  }

  return cp;
};

/**
  Returns the cached value for a property, if one exists.
  This can be useful for peeking at the value of a computed
  property that is generated lazily, without accidentally causing
  it to be created.

  @method cacheFor
  @for Ember
  @param {Object} obj the object whose property you want to check
  @param {String} key the name of the property whose cached value you want
    to return
*/
Ember.cacheFor = function cacheFor(obj, key) {
  var cache = metaFor(obj, false).cache;

  if (cache && key in cache) {
    return cache[key];
  }
};

/**
  @method computed.not
  @for Ember
  @param {String} dependentKey
*/
Ember.computed.not = function(dependentKey) {
  return Ember.computed(dependentKey, function(key) {
    return !get(this, dependentKey);
  });
};

/**
  @method computed.empty
  @for Ember
  @param {String} dependentKey
*/
Ember.computed.empty = function(dependentKey) {
  return Ember.computed(dependentKey, function(key) {
    var val = get(this, dependentKey);
    return val === undefined || val === null || val === '' || (Ember.isArray(val) && get(val, 'length') === 0);
  });
};

/**
  @method computed.bool
  @for Ember
  @param {String} dependentKey
*/
Ember.computed.bool = function(dependentKey) {
  return Ember.computed(dependentKey, function(key) {
    return !!get(this, dependentKey);
  });
};

/**
  @method computed.alias
  @for Ember
  @param {String} dependentKey
*/
Ember.computed.alias = function(dependentKey) {
  return Ember.computed(dependentKey, function(key, value){
    if (arguments.length === 1) {
      return get(this, dependentKey);
    } else {
      set(this, dependentKey, value);
      return value;
    }
  });
};

})();



(function() {
/**
@module ember-metal
*/

var o_create = Ember.create,
    metaFor = Ember.meta,
    metaPath = Ember.metaPath,
    META_KEY = Ember.META_KEY;

/*
  The event system uses a series of nested hashes to store listeners on an
  object. When a listener is registered, or when an event arrives, these
  hashes are consulted to determine which target and action pair to invoke.

  The hashes are stored in the object's meta hash, and look like this:

      // Object's meta hash
      {
        listeners: {       // variable name: `listenerSet`
          "foo:changed": [ // variable name: `actions`
            [target, method, onceFlag, suspendedFlag]
          ]
        }
      }

*/

function indexOf(array, target, method) {
  var index = -1;
  for (var i = 0, l = array.length; i < l; i++) {
    if (target === array[i][0] && method === array[i][1]) { index = i; break; }
  }
  return index;
}

function actionsFor(obj, eventName) {
  var meta = metaFor(obj, true),
      actions;

  if (!meta.listeners) { meta.listeners = {}; }

  if (!meta.hasOwnProperty('listeners')) {
    // setup inherited copy of the listeners object
    meta.listeners = o_create(meta.listeners);
  }

  actions = meta.listeners[eventName];

  // if there are actions, but the eventName doesn't exist in our listeners, then copy them from the prototype
  if (actions && !meta.listeners.hasOwnProperty(eventName)) {
    actions = meta.listeners[eventName] = meta.listeners[eventName].slice();
  } else if (!actions) {
    actions = meta.listeners[eventName] = [];
  }

  return actions;
}

function actionsUnion(obj, eventName, otherActions) {
  var meta = obj[META_KEY],
      actions = meta && meta.listeners && meta.listeners[eventName];

  if (!actions) { return; }
  for (var i = actions.length - 1; i >= 0; i--) {
    var target = actions[i][0],
        method = actions[i][1],
        once = actions[i][2],
        suspended = actions[i][3],
        actionIndex = indexOf(otherActions, target, method);

    if (actionIndex === -1) {
      otherActions.push([target, method, once, suspended]);
    }
  }
}

function actionsDiff(obj, eventName, otherActions) {
  var meta = obj[META_KEY],
      actions = meta && meta.listeners && meta.listeners[eventName],
      diffActions = [];

  if (!actions) { return; }
  for (var i = actions.length - 1; i >= 0; i--) {
    var target = actions[i][0],
        method = actions[i][1],
        once = actions[i][2],
        suspended = actions[i][3],
        actionIndex = indexOf(otherActions, target, method);

    if (actionIndex !== -1) { continue; }

    otherActions.push([target, method, once, suspended]);
    diffActions.push([target, method, once, suspended]);
  }

  return diffActions;
}

/**
  Add an event listener

  @method addListener
  @for Ember
  @param obj
  @param {String} eventName
  @param {Object|Function} targetOrMethod A target object or a function
  @param {Function|String} method A function or the name of a function to be called on `target`
*/
function addListener(obj, eventName, target, method, once) {
  Ember.assert("You must pass at least an object and event name to Ember.addListener", !!obj && !!eventName);

  if (!method && 'function' === typeof target) {
    method = target;
    target = null;
  }

  var actions = actionsFor(obj, eventName),
      actionIndex = indexOf(actions, target, method);

  if (actionIndex !== -1) { return; }

  actions.push([target, method, once, undefined]);

  if ('function' === typeof obj.didAddListener) {
    obj.didAddListener(eventName, target, method);
  }
}

/**
  Remove an event listener

  Arguments should match those passed to {{#crossLink "Ember/addListener"}}{{/crossLink}}

  @method removeListener
  @for Ember
  @param obj
  @param {String} eventName
  @param {Object|Function} targetOrMethod A target object or a function
  @param {Function|String} method A function or the name of a function to be called on `target`
*/
function removeListener(obj, eventName, target, method) {
  Ember.assert("You must pass at least an object and event name to Ember.removeListener", !!obj && !!eventName);

  if (!method && 'function' === typeof target) {
    method = target;
    target = null;
  }

  function _removeListener(target, method, once) {
    var actions = actionsFor(obj, eventName),
        actionIndex = indexOf(actions, target, method);

    // action doesn't exist, give up silently
    if (actionIndex === -1) { return; }

    actions.splice(actionIndex, 1);

    if ('function' === typeof obj.didRemoveListener) {
      obj.didRemoveListener(eventName, target, method);
    }
  }

  if (method) {
    _removeListener(target, method);
  } else {
    var meta = obj[META_KEY],
        actions = meta && meta.listeners && meta.listeners[eventName];

    if (!actions) { return; }
    for (var i = actions.length - 1; i >= 0; i--) {
      _removeListener(actions[i][0], actions[i][1]);
    }
  }
}

/**
  @private

  Suspend listener during callback.

  This should only be used by the target of the event listener
  when it is taking an action that would cause the event, e.g.
  an object might suspend its property change listener while it is
  setting that property.

  @method suspendListener
  @for Ember
  @param obj
  @param {String} eventName
  @param {Object|Function} targetOrMethod A target object or a function
  @param {Function|String} method A function or the name of a function to be called on `target`
  @param {Function} callback
*/
function suspendListener(obj, eventName, target, method, callback) {
  if (!method && 'function' === typeof target) {
    method = target;
    target = null;
  }

  var actions = actionsFor(obj, eventName),
      actionIndex = indexOf(actions, target, method),
      action;

  if (actionIndex !== -1) {
    action = actions[actionIndex].slice(); // copy it, otherwise we're modifying a shared object
    action[3] = true; // mark the action as suspended
    actions[actionIndex] = action; // replace the shared object with our copy
  }

  function tryable()   { return callback.call(target); }
  function finalizer() { if (action) { action[3] = undefined; } }

  return Ember.tryFinally(tryable, finalizer);
}

/**
  @private

  Suspend listener during callback.

  This should only be used by the target of the event listener
  when it is taking an action that would cause the event, e.g.
  an object might suspend its property change listener while it is
  setting that property.

  @method suspendListener
  @for Ember
  @param obj
  @param {Array} eventName Array of event names
  @param {Object|Function} targetOrMethod A target object or a function
  @param {Function|String} method A function or the name of a function to be called on `target`
  @param {Function} callback
*/
function suspendListeners(obj, eventNames, target, method, callback) {
  if (!method && 'function' === typeof target) {
    method = target;
    target = null;
  }

  var suspendedActions = [],
      eventName, actions, action, i, l;

  for (i=0, l=eventNames.length; i<l; i++) {
    eventName = eventNames[i];
    actions = actionsFor(obj, eventName);
    var actionIndex = indexOf(actions, target, method);

    if (actionIndex !== -1) {
      action = actions[actionIndex].slice();
      action[3] = true;
      actions[actionIndex] = action;
      suspendedActions.push(action);
    }
  }

  function tryable() { return callback.call(target); }

  function finalizer() {
    for (i = 0, l = suspendedActions.length; i < l; i++) {
      suspendedActions[i][3] = undefined;
    }
  }

  return Ember.tryFinally(tryable, finalizer);
}

/**
  @private

  Return a list of currently watched events

  @method watchedEvents
  @for Ember
  @param obj
*/
function watchedEvents(obj) {
  var listeners = obj[META_KEY].listeners, ret = [];

  if (listeners) {
    for(var eventName in listeners) {
      if (listeners[eventName]) { ret.push(eventName); }
    }
  }
  return ret;
}

/**
  @method sendEvent
  @for Ember
  @param obj
  @param {String} eventName
  @param {Array} params
  @return true
*/
function sendEvent(obj, eventName, params, actions) {
  // first give object a chance to handle it
  if (obj !== Ember && 'function' === typeof obj.sendEvent) {
    obj.sendEvent(eventName, params);
  }

  if (!actions) {
    var meta = obj[META_KEY];
    actions = meta && meta.listeners && meta.listeners[eventName];
  }

  if (!actions) { return; }

  for (var i = actions.length - 1; i >= 0; i--) { // looping in reverse for once listeners
    if (!actions[i] || actions[i][3] === true) { continue; }

    var target = actions[i][0],
        method = actions[i][1],
        once = actions[i][2];

    if (once) { removeListener(obj, eventName, target, method); }
    if (!target) { target = obj; }
    if ('string' === typeof method) { method = target[method]; }
    if (params) {
      method.apply(target, params);
    } else {
      method.apply(target);
    }
  }
  return true;
}

/**
  @private
  @method hasListeners
  @for Ember
  @param obj
  @param {String} eventName
*/
function hasListeners(obj, eventName) {
  var meta = obj[META_KEY],
      actions = meta && meta.listeners && meta.listeners[eventName];

  return !!(actions && actions.length);
}

/**
  @private
  @method listenersFor
  @for Ember
  @param obj
  @param {String} eventName
*/
function listenersFor(obj, eventName) {
  var ret = [];
  var meta = obj[META_KEY],
      actions = meta && meta.listeners && meta.listeners[eventName];

  if (!actions) { return ret; }

  for (var i = 0, l = actions.length; i < l; i++) {
    var target = actions[i][0],
        method = actions[i][1];
    ret.push([target, method]);
  }

  return ret;
}

Ember.addListener = addListener;
Ember.removeListener = removeListener;
Ember._suspendListener = suspendListener;
Ember._suspendListeners = suspendListeners;
Ember.sendEvent = sendEvent;
Ember.hasListeners = hasListeners;
Ember.watchedEvents = watchedEvents;
Ember.listenersFor = listenersFor;
Ember.listenersDiff = actionsDiff;
Ember.listenersUnion = actionsUnion;

})();



(function() {
// Ember.Logger
// Ember.watch.flushPending
// Ember.beginPropertyChanges, Ember.endPropertyChanges
// Ember.guidFor, Ember.tryFinally

/**
@module ember-metal
*/

// ..........................................................
// HELPERS
//

var slice = [].slice,
    forEach = Ember.ArrayPolyfills.forEach;

// invokes passed params - normalizing so you can pass target/func,
// target/string or just func
function invoke(target, method, args, ignore) {

  if (method === undefined) {
    method = target;
    target = undefined;
  }

  if ('string' === typeof method) { method = target[method]; }
  if (args && ignore > 0) {
    args = args.length > ignore ? slice.call(args, ignore) : null;
  }

  return Ember.handleErrors(function() {
    // IE8's Function.prototype.apply doesn't accept undefined/null arguments.
    return method.apply(target || this, args || []);
  }, this);
}


// ..........................................................
// RUNLOOP
//

var timerMark; // used by timers...

/**
Ember RunLoop (Private)

@class RunLoop
@namespace Ember
@private
@constructor
*/
var RunLoop = function(prev) {
  this._prev = prev || null;
  this.onceTimers = {};
};

RunLoop.prototype = {
  /**
    @method end
  */
  end: function() {
    this.flush();
  },

  /**
    @method prev
  */
  prev: function() {
    return this._prev;
  },

  // ..........................................................
  // Delayed Actions
  //

  /**
    @method schedule
    @param {String} queueName
    @param target
    @param method
  */
  schedule: function(queueName, target, method) {
    var queues = this._queues, queue;
    if (!queues) { queues = this._queues = {}; }
    queue = queues[queueName];
    if (!queue) { queue = queues[queueName] = []; }

    var args = arguments.length > 3 ? slice.call(arguments, 3) : null;
    queue.push({ target: target, method: method, args: args });
    return this;
  },

  /**
    @method flush
    @param {String} queueName
  */
  flush: function(queueName) {
    var queueNames, idx, len, queue, log;

    if (!this._queues) { return this; } // nothing to do

    function iter(item) {
      invoke(item.target, item.method, item.args);
    }

    function tryable() {
      forEach.call(queue, iter);
    }

    Ember.watch.flushPending(); // make sure all chained watchers are setup

    if (queueName) {
      while (this._queues && (queue = this._queues[queueName])) {
        this._queues[queueName] = null;

        // the sync phase is to allow property changes to propagate. don't
        // invoke observers until that is finished.
        if (queueName === 'sync') {
          log = Ember.LOG_BINDINGS;
          if (log) { Ember.Logger.log('Begin: Flush Sync Queue'); }

          Ember.beginPropertyChanges();

          Ember.tryFinally(tryable, Ember.endPropertyChanges);

          if (log) { Ember.Logger.log('End: Flush Sync Queue'); }

        } else {
          forEach.call(queue, iter);
        }
      }

    } else {
      queueNames = Ember.run.queues;
      len = queueNames.length;
      idx = 0;

      outerloop:
      while (idx < len) {
        queueName = queueNames[idx];
        queue = this._queues && this._queues[queueName];
        delete this._queues[queueName];

        if (queue) {
          // the sync phase is to allow property changes to propagate. don't
          // invoke observers until that is finished.
          if (queueName === 'sync') {
            log = Ember.LOG_BINDINGS;
            if (log) { Ember.Logger.log('Begin: Flush Sync Queue'); }

            Ember.beginPropertyChanges();

            Ember.tryFinally(tryable, Ember.endPropertyChanges);

            if (log) { Ember.Logger.log('End: Flush Sync Queue'); }
          } else {
            forEach.call(queue, iter);
          }
        }

        // Loop through prior queues
        for (var i = 0; i <= idx; i++) {
          if (this._queues && this._queues[queueNames[i]]) {
            // Start over at the first queue with contents
            idx = i;
            continue outerloop;
          }
        }

        idx++;
      }
    }

    timerMark = null;

    return this;
  }

};

Ember.RunLoop = RunLoop;

// ..........................................................
// Ember.run - this is ideally the only public API the dev sees
//

/**
  Runs the passed target and method inside of a RunLoop, ensuring any
  deferred actions including bindings and views updates are flushed at the
  end.

  Normally you should not need to invoke this method yourself. However if
  you are implementing raw event handlers when interfacing with other
  libraries or plugins, you should probably wrap all of your code inside this
  call.

  ```javascript
  Ember.run(function(){
    // code to be execute within a RunLoop
  });
  ```

  @class run
  @namespace Ember
  @static
  @constructor
  @param {Object} [target] target of method to call
  @param {Function|String} method Method to invoke.
    May be a function or a string. If you pass a string
    then it will be looked up on the passed target.
  @param {Object} [args*] Any additional arguments you wish to pass to the method.
  @return {Object} return value from invoking the passed function.
*/
Ember.run = function(target, method) {
  var loop,
  args = arguments;
  run.begin();

  function tryable() {
    if (target || method) {
      return invoke(target, method, args, 2);
    }
  }

  return Ember.tryFinally(tryable, run.end);
};

var run = Ember.run;


/**
  Begins a new RunLoop. Any deferred actions invoked after the begin will
  be buffered until you invoke a matching call to `Ember.run.end()`. This is
  an lower-level way to use a RunLoop instead of using `Ember.run()`.

  ```javascript
  Ember.run.begin();
  // code to be execute within a RunLoop
  Ember.run.end();
  ```

  @method begin
  @return {void}
*/
Ember.run.begin = function() {
  run.currentRunLoop = new RunLoop(run.currentRunLoop);
};

/**
  Ends a RunLoop. This must be called sometime after you call
  `Ember.run.begin()` to flush any deferred actions. This is a lower-level way
  to use a RunLoop instead of using `Ember.run()`.

  ```javascript
  Ember.run.begin();
  // code to be execute within a RunLoop
  Ember.run.end();
  ```

  @method end
  @return {void}
*/
Ember.run.end = function() {
  Ember.assert('must have a current run loop', run.currentRunLoop);

  function tryable()   { run.currentRunLoop.end();  }
  function finalizer() { run.currentRunLoop = run.currentRunLoop.prev(); }

  Ember.tryFinally(tryable, finalizer);
};

/**
  Array of named queues. This array determines the order in which queues
  are flushed at the end of the RunLoop. You can define your own queues by
  simply adding the queue name to this array. Normally you should not need
  to inspect or modify this property.

  @property queues
  @type Array
  @default ['sync', 'actions', 'destroy', 'timers']
*/
Ember.run.queues = ['sync', 'actions', 'destroy', 'timers'];

/**
  Adds the passed target/method and any optional arguments to the named
  queue to be executed at the end of the RunLoop. If you have not already
  started a RunLoop when calling this method one will be started for you
  automatically.

  At the end of a RunLoop, any methods scheduled in this way will be invoked.
  Methods will be invoked in an order matching the named queues defined in
  the `run.queues` property.

  ```javascript
  Ember.run.schedule('timers', this, function(){
    // this will be executed at the end of the RunLoop, when timers are run
    console.log("scheduled on timers queue");
  });

  Ember.run.schedule('sync', this, function(){
    // this will be executed at the end of the RunLoop, when bindings are synced
    console.log("scheduled on sync queue");
  });

  // Note the functions will be run in order based on the run queues order. Output would be:
  //   scheduled on sync queue
  //   scheduled on timers queue
  ```

  @method schedule
  @param {String} queue The name of the queue to schedule against.
    Default queues are 'sync' and 'actions'
  @param {Object} [target] target object to use as the context when invoking a method.
  @param {String|Function} method The method to invoke. If you pass a string it
    will be resolved on the target object at the time the scheduled item is
    invoked allowing you to change the target function.
  @param {Object} [arguments*] Optional arguments to be passed to the queued method.
  @return {void}
*/
Ember.run.schedule = function(queue, target, method) {
  var loop = run.autorun();
  loop.schedule.apply(loop, arguments);
};

var scheduledAutorun;
function autorun() {
  scheduledAutorun = null;
  if (run.currentRunLoop) { run.end(); }
}

// Used by global test teardown
Ember.run.hasScheduledTimers = function() {
  return !!(scheduledAutorun || scheduledLater || scheduledNext);
};

// Used by global test teardown
Ember.run.cancelTimers = function () {
  if (scheduledAutorun) {
    clearTimeout(scheduledAutorun);
    scheduledAutorun = null;
  }
  if (scheduledLater) {
    clearTimeout(scheduledLater);
    scheduledLater = null;
  }
  if (scheduledNext) {
    clearTimeout(scheduledNext);
    scheduledNext = null;
  }
  timers = {};
};

/**
  Begins a new RunLoop if necessary and schedules a timer to flush the
  RunLoop at a later time. This method is used by parts of Ember to
  ensure the RunLoop always finishes. You normally do not need to call this
  method directly. Instead use `Ember.run()`

  @method autorun
  @example
    Ember.run.autorun();
  @return {Ember.RunLoop} the new current RunLoop
*/
Ember.run.autorun = function() {
  if (!run.currentRunLoop) {
    Ember.assert("You have turned on testing mode, which disabled the run-loop's autorun. You will need to wrap any code with asynchronous side-effects in an Ember.run", !Ember.testing);

    run.begin();

    if (!scheduledAutorun) {
      scheduledAutorun = setTimeout(autorun, 1);
    }
  }

  return run.currentRunLoop;
};

/**
  Immediately flushes any events scheduled in the 'sync' queue. Bindings
  use this queue so this method is a useful way to immediately force all
  bindings in the application to sync.

  You should call this method anytime you need any changed state to propagate
  throughout the app immediately without repainting the UI.

  ```javascript
  Ember.run.sync();
  ```

  @method sync
  @return {void}
*/
Ember.run.sync = function() {
  run.autorun();
  run.currentRunLoop.flush('sync');
};

// ..........................................................
// TIMERS
//

var timers = {}; // active timers...

var scheduledLater;
function invokeLaterTimers() {
  scheduledLater = null;
  var now = (+ new Date()), earliest = -1;
  for (var key in timers) {
    if (!timers.hasOwnProperty(key)) { continue; }
    var timer = timers[key];
    if (timer && timer.expires) {
      if (now >= timer.expires) {
        delete timers[key];
        invoke(timer.target, timer.method, timer.args, 2);
      } else {
        if (earliest<0 || (timer.expires < earliest)) earliest=timer.expires;
      }
    }
  }

  // schedule next timeout to fire...
  if (earliest > 0) { scheduledLater = setTimeout(invokeLaterTimers, earliest-(+ new Date())); }
}

/**
  Invokes the passed target/method and optional arguments after a specified
  period if time. The last parameter of this method must always be a number
  of milliseconds.

  You should use this method whenever you need to run some action after a
  period of time instead of using `setTimeout()`. This method will ensure that
  items that expire during the same script execution cycle all execute
  together, which is often more efficient than using a real setTimeout.

  ```javascript
  Ember.run.later(myContext, function(){
    // code here will execute within a RunLoop in about 500ms with this == myContext
  }, 500);
  ```

  @method later
  @param {Object} [target] target of method to invoke
  @param {Function|String} method The method to invoke.
    If you pass a string it will be resolved on the
    target at the time the method is invoked.
  @param {Object} [args*] Optional arguments to pass to the timeout.
  @param {Number} wait
    Number of milliseconds to wait.
  @return {String} a string you can use to cancel the timer in
    {{#crossLink "Ember/run.cancel"}}{{/crossLink}} later.
*/
Ember.run.later = function(target, method) {
  var args, expires, timer, guid, wait;

  // setTimeout compatibility...
  if (arguments.length===2 && 'function' === typeof target) {
    wait   = method;
    method = target;
    target = undefined;
    args   = [target, method];
  } else {
    args = slice.call(arguments);
    wait = args.pop();
  }

  expires = (+ new Date()) + wait;
  timer   = { target: target, method: method, expires: expires, args: args };
  guid    = Ember.guidFor(timer);
  timers[guid] = timer;
  run.once(timers, invokeLaterTimers);
  return guid;
};

function invokeOnceTimer(guid, onceTimers) {
  if (onceTimers[this.tguid]) { delete onceTimers[this.tguid][this.mguid]; }
  if (timers[guid]) { invoke(this.target, this.method, this.args); }
  delete timers[guid];
}

function scheduleOnce(queue, target, method, args) {
  var tguid = Ember.guidFor(target),
    mguid = Ember.guidFor(method),
    onceTimers = run.autorun().onceTimers,
    guid = onceTimers[tguid] && onceTimers[tguid][mguid],
    timer;

  if (guid && timers[guid]) {
    timers[guid].args = args; // replace args
  } else {
    timer = {
      target: target,
      method: method,
      args:   args,
      tguid:  tguid,
      mguid:  mguid
    };

    guid  = Ember.guidFor(timer);
    timers[guid] = timer;
    if (!onceTimers[tguid]) { onceTimers[tguid] = {}; }
    onceTimers[tguid][mguid] = guid; // so it isn't scheduled more than once

    run.schedule(queue, timer, invokeOnceTimer, guid, onceTimers);
  }

  return guid;
}

/**
  Schedules an item to run one time during the current RunLoop. Calling
  this method with the same target/method combination will have no effect.

  Note that although you can pass optional arguments these will not be
  considered when looking for duplicates. New arguments will replace previous
  calls.

  ```javascript
  Ember.run(function(){
    var doFoo = function() { foo(); }
    Ember.run.once(myContext, doFoo);
    Ember.run.once(myContext, doFoo);
    // doFoo will only be executed once at the end of the RunLoop
  });
  ```

  @method once
  @param {Object} [target] target of method to invoke
  @param {Function|String} method The method to invoke.
    If you pass a string it will be resolved on the
    target at the time the method is invoked.
  @param {Object} [args*] Optional arguments to pass to the timeout.
  @return {Object} timer
*/
Ember.run.once = function(target, method) {
  return scheduleOnce('actions', target, method, slice.call(arguments, 2));
};

Ember.run.scheduleOnce = function(queue, target, method, args) {
  return scheduleOnce(queue, target, method, slice.call(arguments, 3));
};

var scheduledNext;
function invokeNextTimers() {
  scheduledNext = null;
  for(var key in timers) {
    if (!timers.hasOwnProperty(key)) { continue; }
    var timer = timers[key];
    if (timer.next) {
      delete timers[key];
      invoke(timer.target, timer.method, timer.args, 2);
    }
  }
}

/**
  Schedules an item to run after control has been returned to the system.
  This is often equivalent to calling `setTimeout(function() {}, 1)`.

  ```javascript
  Ember.run.next(myContext, function(){
    // code to be executed in the next RunLoop, which will be scheduled after the current one
  });
  ```

  @method next
  @param {Object} [target] target of method to invoke
  @param {Function|String} method The method to invoke.
    If you pass a string it will be resolved on the
    target at the time the method is invoked.
  @param {Object} [args*] Optional arguments to pass to the timeout.
  @return {Object} timer
*/
Ember.run.next = function(target, method) {
  var guid,
      timer = {
        target: target,
        method: method,
        args: slice.call(arguments),
        next: true
      };

  guid = Ember.guidFor(timer);
  timers[guid] = timer;

  if (!scheduledNext) { scheduledNext = setTimeout(invokeNextTimers, 1); }
  return guid;
};

/**
  Cancels a scheduled item. Must be a value returned by `Ember.run.later()`,
  `Ember.run.once()`, or `Ember.run.next()`.

  ```javascript
  var runNext = Ember.run.next(myContext, function(){
    // will not be executed
  });
  Ember.run.cancel(runNext);

  var runLater = Ember.run.later(myContext, function(){
    // will not be executed
  }, 500);
  Ember.run.cancel(runLater);

  var runOnce = Ember.run.once(myContext, function(){
    // will not be executed
  });
  Ember.run.cancel(runOnce);
  ```

  @method cancel
  @param {Object} timer Timer object to cancel
  @return {void}
*/
Ember.run.cancel = function(timer) {
  delete timers[timer];
};

})();



(function() {
// Ember.Logger
// get, set, trySet
// guidFor, isArray, meta
// addObserver, removeObserver
// Ember.run.schedule
/**
@module ember-metal
*/

// ..........................................................
// CONSTANTS
//

/**
  Debug parameter you can turn on. This will log all bindings that fire to
  the console. This should be disabled in production code. Note that you
  can also enable this from the console or temporarily.

  @property LOG_BINDINGS
  @for Ember
  @type Boolean
  @default false
*/
Ember.LOG_BINDINGS = false || !!Ember.ENV.LOG_BINDINGS;

var get     = Ember.get,
    set     = Ember.set,
    guidFor = Ember.guidFor,
    isGlobalPath = Ember.isGlobalPath;


function getWithGlobals(obj, path) {
  return get(isGlobalPath(path) ? Ember.lookup : obj, path);
}

// ..........................................................
// BINDING
//

var Binding = function(toPath, fromPath) {
  this._direction = 'fwd';
  this._from = fromPath;
  this._to   = toPath;
  this._directionMap = Ember.Map.create();
};

/**
@class Binding
@namespace Ember
*/

Binding.prototype = {
  /**
    This copies the Binding so it can be connected to another object.

    @method copy
    @return {Ember.Binding}
  */
  copy: function () {
    var copy = new Binding(this._to, this._from);
    if (this._oneWay) { copy._oneWay = true; }
    return copy;
  },

  // ..........................................................
  // CONFIG
  //

  /**
    This will set `from` property path to the specified value. It will not
    attempt to resolve this property path to an actual object until you
    connect the binding.

    The binding will search for the property path starting at the root object
    you pass when you `connect()` the binding. It follows the same rules as
    `get()` - see that method for more information.

    @method from
    @param {String} propertyPath the property path to connect to
    @return {Ember.Binding} `this`
  */
  from: function(path) {
    this._from = path;
    return this;
  },

  /**
    This will set the `to` property path to the specified value. It will not
    attempt to resolve this property path to an actual object until you
    connect the binding.

    The binding will search for the property path starting at the root object
    you pass when you `connect()` the binding. It follows the same rules as
    `get()` - see that method for more information.

    @method to
    @param {String|Tuple} propertyPath A property path or tuple
    @return {Ember.Binding} `this`
  */
  to: function(path) {
    this._to = path;
    return this;
  },

  /**
    Configures the binding as one way. A one-way binding will relay changes
    on the `from` side to the `to` side, but not the other way around. This
    means that if you change the `to` side directly, the `from` side may have
    a different value.

    @method oneWay
    @return {Ember.Binding} `this`
  */
  oneWay: function() {
    this._oneWay = true;
    return this;
  },

  toString: function() {
    var oneWay = this._oneWay ? '[oneWay]' : '';
    return "Ember.Binding<" + guidFor(this) + ">(" + this._from + " -> " + this._to + ")" + oneWay;
  },

  // ..........................................................
  // CONNECT AND SYNC
  //

  /**
    Attempts to connect this binding instance so that it can receive and relay
    changes. This method will raise an exception if you have not set the
    from/to properties yet.

    @method connect
    @param {Object} obj The root object for this binding.
    @return {Ember.Binding} `this`
  */
  connect: function(obj) {
    Ember.assert('Must pass a valid object to Ember.Binding.connect()', !!obj);

    var fromPath = this._from, toPath = this._to;
    Ember.trySet(obj, toPath, getWithGlobals(obj, fromPath));

    // add an observer on the object to be notified when the binding should be updated
    Ember.addObserver(obj, fromPath, this, this.fromDidChange);

    // if the binding is a two-way binding, also set up an observer on the target
    if (!this._oneWay) { Ember.addObserver(obj, toPath, this, this.toDidChange); }

    this._readyToSync = true;

    return this;
  },

  /**
    Disconnects the binding instance. Changes will no longer be relayed. You
    will not usually need to call this method.

    @method disconnect
    @param {Object} obj The root object you passed when connecting the binding.
    @return {Ember.Binding} `this`
  */
  disconnect: function(obj) {
    Ember.assert('Must pass a valid object to Ember.Binding.disconnect()', !!obj);

    var twoWay = !this._oneWay;

    // remove an observer on the object so we're no longer notified of
    // changes that should update bindings.
    Ember.removeObserver(obj, this._from, this, this.fromDidChange);

    // if the binding is two-way, remove the observer from the target as well
    if (twoWay) { Ember.removeObserver(obj, this._to, this, this.toDidChange); }

    this._readyToSync = false; // disable scheduled syncs...
    return this;
  },

  // ..........................................................
  // PRIVATE
  //

  /* called when the from side changes */
  fromDidChange: function(target) {
    this._scheduleSync(target, 'fwd');
  },

  /* called when the to side changes */
  toDidChange: function(target) {
    this._scheduleSync(target, 'back');
  },

  _scheduleSync: function(obj, dir) {
    var directionMap = this._directionMap;
    var existingDir = directionMap.get(obj);

    // if we haven't scheduled the binding yet, schedule it
    if (!existingDir) {
      Ember.run.schedule('sync', this, this._sync, obj);
      directionMap.set(obj, dir);
    }

    // If both a 'back' and 'fwd' sync have been scheduled on the same object,
    // default to a 'fwd' sync so that it remains deterministic.
    if (existingDir === 'back' && dir === 'fwd') {
      directionMap.set(obj, 'fwd');
    }
  },

  _sync: function(obj) {
    var log = Ember.LOG_BINDINGS;

    // don't synchronize destroyed objects or disconnected bindings
    if (obj.isDestroyed || !this._readyToSync) { return; }

    // get the direction of the binding for the object we are
    // synchronizing from
    var directionMap = this._directionMap;
    var direction = directionMap.get(obj);

    var fromPath = this._from, toPath = this._to;

    directionMap.remove(obj);

    // if we're synchronizing from the remote object...
    if (direction === 'fwd') {
      var fromValue = getWithGlobals(obj, this._from);
      if (log) {
        Ember.Logger.log(' ', this.toString(), '->', fromValue, obj);
      }
      if (this._oneWay) {
        Ember.trySet(obj, toPath, fromValue);
      } else {
        Ember._suspendObserver(obj, toPath, this, this.toDidChange, function () {
          Ember.trySet(obj, toPath, fromValue);
        });
      }
    // if we're synchronizing *to* the remote object
    } else if (direction === 'back') {
      var toValue = get(obj, this._to);
      if (log) {
        Ember.Logger.log(' ', this.toString(), '<-', toValue, obj);
      }
      Ember._suspendObserver(obj, fromPath, this, this.fromDidChange, function () {
        Ember.trySet(Ember.isGlobalPath(fromPath) ? Ember.lookup : obj, fromPath, toValue);
      });
    }
  }

};

function mixinProperties(to, from) {
  for (var key in from) {
    if (from.hasOwnProperty(key)) {
      to[key] = from[key];
    }
  }
}

mixinProperties(Binding, {

  /**
    See {{#crossLink "Ember.Binding/from"}}{{/crossLink}}

    @method from
    @static
  */
  from: function() {
    var C = this, binding = new C();
    return binding.from.apply(binding, arguments);
  },

  /**
    See {{#crossLink "Ember.Binding/to"}}{{/crossLink}}

    @method to
    @static
  */
  to: function() {
    var C = this, binding = new C();
    return binding.to.apply(binding, arguments);
  },

  /**
    Creates a new Binding instance and makes it apply in a single direction.
    A one-way binding will relay changes on the `from` side object (supplied
    as the `from` argument) the `to` side, but not the other way around.
    This means that if you change the "to" side directly, the "from" side may have
    a different value.

    See {{#crossLink "Binding/oneWay"}}{{/crossLink}}

    @method oneWay
    @param {String} from from path.
    @param {Boolean} [flag] (Optional) passing nothing here will make the
      binding `oneWay`. You can instead pass `false` to disable `oneWay`, making the
      binding two way again.
  */
  oneWay: function(from, flag) {
    var C = this, binding = new C(null, from);
    return binding.oneWay(flag);
  }

});

/**
  An `Ember.Binding` connects the properties of two objects so that whenever
  the value of one property changes, the other property will be changed also.

  ## Automatic Creation of Bindings with `/^*Binding/`-named Properties

  You do not usually create Binding objects directly but instead describe
  bindings in your class or object definition using automatic binding
  detection.

  Properties ending in a `Binding` suffix will be converted to `Ember.Binding`
  instances. The value of this property should be a string representing a path
  to another object or a custom binding instanced created using Binding helpers
  (see "Customizing Your Bindings"):

  ```
  valueBinding: "MyApp.someController.title"
  ```

  This will create a binding from `MyApp.someController.title` to the `value`
  property of your object instance automatically. Now the two values will be
  kept in sync.

  ## One Way Bindings

  One especially useful binding customization you can use is the `oneWay()`
  helper. This helper tells Ember that you are only interested in
  receiving changes on the object you are binding from. For example, if you
  are binding to a preference and you want to be notified if the preference
  has changed, but your object will not be changing the preference itself, you
  could do:

  ```
  bigTitlesBinding: Ember.Binding.oneWay("MyApp.preferencesController.bigTitles")
  ```

  This way if the value of `MyApp.preferencesController.bigTitles` changes the
  `bigTitles` property of your object will change also. However, if you
  change the value of your `bigTitles` property, it will not update the
  `preferencesController`.

  One way bindings are almost twice as fast to setup and twice as fast to
  execute because the binding only has to worry about changes to one side.

  You should consider using one way bindings anytime you have an object that
  may be created frequently and you do not intend to change a property; only
  to monitor it for changes. (such as in the example above).

  ## Adding Bindings Manually

  All of the examples above show you how to configure a custom binding, but the
  result of these customizations will be a binding template, not a fully active
  Binding instance. The binding will actually become active only when you
  instantiate the object the binding belongs to. It is useful however, to
  understand what actually happens when the binding is activated.

  For a binding to function it must have at least a `from` property and a `to`
  property. The `from` property path points to the object/key that you want to
  bind from while the `to` path points to the object/key you want to bind to.

  When you define a custom binding, you are usually describing the property
  you want to bind from (such as `MyApp.someController.value` in the examples
  above). When your object is created, it will automatically assign the value
  you want to bind `to` based on the name of your binding key. In the
  examples above, during init, Ember objects will effectively call
  something like this on your binding:

  ```javascript
  binding = Ember.Binding.from(this.valueBinding).to("value");
  ```

  This creates a new binding instance based on the template you provide, and
  sets the to path to the `value` property of the new object. Now that the
  binding is fully configured with a `from` and a `to`, it simply needs to be
  connected to become active. This is done through the `connect()` method:

  ```javascript
  binding.connect(this);
  ```

  Note that when you connect a binding you pass the object you want it to be
  connected to. This object will be used as the root for both the from and
  to side of the binding when inspecting relative paths. This allows the
  binding to be automatically inherited by subclassed objects as well.

  Now that the binding is connected, it will observe both the from and to side
  and relay changes.

  If you ever needed to do so (you almost never will, but it is useful to
  understand this anyway), you could manually create an active binding by
  using the `Ember.bind()` helper method. (This is the same method used by
  to setup your bindings on objects):

  ```javascript
  Ember.bind(MyApp.anotherObject, "value", "MyApp.someController.value");
  ```

  Both of these code fragments have the same effect as doing the most friendly
  form of binding creation like so:

  ```javascript
  MyApp.anotherObject = Ember.Object.create({
    valueBinding: "MyApp.someController.value",

    // OTHER CODE FOR THIS OBJECT...
  });
  ```

  Ember's built in binding creation method makes it easy to automatically
  create bindings for you. You should always use the highest-level APIs
  available, even if you understand how it works underneath.

  @class Binding
  @namespace Ember
  @since Ember 0.9
*/
Ember.Binding = Binding;


/**
  Global helper method to create a new binding. Just pass the root object
  along with a `to` and `from` path to create and connect the binding.

  @method bind
  @for Ember
  @param {Object} obj The root object of the transform.
  @param {String} to The path to the 'to' side of the binding.
    Must be relative to obj.
  @param {String} from The path to the 'from' side of the binding.
    Must be relative to obj or a global path.
  @return {Ember.Binding} binding instance
*/
Ember.bind = function(obj, to, from) {
  return new Ember.Binding(to, from).connect(obj);
};

/**
  @method oneWay
  @for Ember
  @param {Object} obj The root object of the transform.
  @param {String} to The path to the 'to' side of the binding.
    Must be relative to obj.
  @param {String} from The path to the 'from' side of the binding.
    Must be relative to obj or a global path.
  @return {Ember.Binding} binding instance
*/
Ember.oneWay = function(obj, to, from) {
  return new Ember.Binding(to, from).oneWay().connect(obj);
};

})();



(function() {
/**
@module ember-metal
*/

var Mixin, REQUIRED, Alias,
    a_map = Ember.ArrayPolyfills.map,
    a_indexOf = Ember.ArrayPolyfills.indexOf,
    a_forEach = Ember.ArrayPolyfills.forEach,
    a_slice = [].slice,
    EMPTY_META = {}, // dummy for non-writable meta
    o_create = Ember.create,
    defineProperty = Ember.defineProperty,
    guidFor = Ember.guidFor;

function mixinsMeta(obj) {
  var m = Ember.meta(obj, true), ret = m.mixins;
  if (!ret) {
    ret = m.mixins = {};
  } else if (!m.hasOwnProperty('mixins')) {
    ret = m.mixins = o_create(ret);
  }
  return ret;
}

function initMixin(mixin, args) {
  if (args && args.length > 0) {
    mixin.mixins = a_map.call(args, function(x) {
      if (x instanceof Mixin) { return x; }

      // Note: Manually setup a primitive mixin here. This is the only
      // way to actually get a primitive mixin. This way normal creation
      // of mixins will give you combined mixins...
      var mixin = new Mixin();
      mixin.properties = x;
      return mixin;
    });
  }
  return mixin;
}

function isMethod(obj) {
  return 'function' === typeof obj &&
         obj.isMethod !== false &&
         obj !== Boolean && obj !== Object && obj !== Number && obj !== Array && obj !== Date && obj !== String;
}

var CONTINUE = {};

function mixinProperties(mixinsMeta, mixin) {
  var guid;

  if (mixin instanceof Mixin) {
    guid = guidFor(mixin);
    if (mixinsMeta[guid]) { return CONTINUE; }
    mixinsMeta[guid] = mixin;
    return mixin.properties;
  } else {
    return mixin; // apply anonymous mixin properties
  }
}

function concatenatedProperties(props, values, base) {
  var concats;

  // reset before adding each new mixin to pickup concats from previous
  concats = values.concatenatedProperties || base.concatenatedProperties;
  if (props.concatenatedProperties) {
    concats = concats ? concats.concat(props.concatenatedProperties) : props.concatenatedProperties;
  }

  return concats;
}

function giveDescriptorSuper(meta, key, property, values, descs) {
  var superProperty;

  // Computed properties override methods, and do not call super to them
  if (values[key] === undefined) {
    // Find the original descriptor in a parent mixin
    superProperty = descs[key];
  }

  // If we didn't find the original descriptor in a parent mixin, find
  // it on the original object.
  superProperty = superProperty || meta.descs[key];

  if (!superProperty || !(superProperty instanceof Ember.ComputedProperty)) {
    return property;
  }

  // Since multiple mixins may inherit from the same parent, we need
  // to clone the computed property so that other mixins do not receive
  // the wrapped version.
  property = o_create(property);
  property.func = Ember.wrap(property.func, superProperty.func);

  return property;
}

function giveMethodSuper(obj, key, method, values, descs) {
  var superMethod;

  // Methods overwrite computed properties, and do not call super to them.
  if (descs[key] === undefined) {
    // Find the original method in a parent mixin
    superMethod = values[key];
  }

  // If we didn't find the original value in a parent mixin, find it in
  // the original object
  superMethod = superMethod || obj[key];

  // Only wrap the new method if the original method was a function
  if ('function' !== typeof superMethod) {
    return method;
  }

  return Ember.wrap(method, superMethod);
}

function applyConcatenatedProperties(obj, key, value, values) {
  var baseValue = values[key] || obj[key];

  if (baseValue) {
    if ('function' === typeof baseValue.concat) {
      return baseValue.concat(value);
    } else {
      return Ember.makeArray(baseValue).concat(value);
    }
  } else {
    return Ember.makeArray(value);
  }
}

function addNormalizedProperty(base, key, value, meta, descs, values, concats) {
  if (value instanceof Ember.Descriptor) {
    if (value === REQUIRED && descs[key]) { return CONTINUE; }

    // Wrap descriptor function to implement
    // _super() if needed
    if (value.func) {
      value = giveDescriptorSuper(meta, key, value, values, descs);
    }

    descs[key]  = value;
    values[key] = undefined;
  } else {
    // impl super if needed...
    if (isMethod(value)) {
      value = giveMethodSuper(base, key, value, values, descs);
    } else if ((concats && a_indexOf.call(concats, key) >= 0) || key === 'concatenatedProperties') {
      value = applyConcatenatedProperties(base, key, value, values);
    }

    descs[key] = undefined;
    values[key] = value;
  }
}

function mergeMixins(mixins, m, descs, values, base) {
  var mixin, props, key, concats, meta;

  function removeKeys(keyName) {
    delete descs[keyName];
    delete values[keyName];
  }

  for(var i=0, l=mixins.length; i<l; i++) {
    mixin = mixins[i];
    Ember.assert('Expected hash or Mixin instance, got ' + Object.prototype.toString.call(mixin), typeof mixin === 'object' && mixin !== null && Object.prototype.toString.call(mixin) !== '[object Array]');

    props = mixinProperties(m, mixin);
    if (props === CONTINUE) { continue; }

    if (props) {
      meta = Ember.meta(base);
      concats = concatenatedProperties(props, values, base);

      for (key in props) {
        if (!props.hasOwnProperty(key)) { continue; }
        addNormalizedProperty(base, key, props[key], meta, descs, values, concats);
      }

      // manually copy toString() because some JS engines do not enumerate it
      if (props.hasOwnProperty('toString')) { base.toString = props.toString; }
    } else if (mixin.mixins) {
      mergeMixins(mixin.mixins, m, descs, values, base);
      if (mixin._without) { a_forEach.call(mixin._without, removeKeys); }
    }
  }
}

function writableReq(obj) {
  var m = Ember.meta(obj), req = m.required;
  if (!req || !m.hasOwnProperty('required')) {
    req = m.required = req ? o_create(req) : {};
  }
  return req;
}

var IS_BINDING = Ember.IS_BINDING = /^.+Binding$/;

function detectBinding(obj, key, value, m) {
  if (IS_BINDING.test(key)) {
    var bindings = m.bindings;
    if (!bindings) {
      bindings = m.bindings = {};
    } else if (!m.hasOwnProperty('bindings')) {
      bindings = m.bindings = o_create(m.bindings);
    }
    bindings[key] = value;
  }
}

function connectBindings(obj, m) {
  // TODO Mixin.apply(instance) should disconnect binding if exists
  var bindings = m.bindings, key, binding, to;
  if (bindings) {
    for (key in bindings) {
      binding = bindings[key];
      if (binding) {
        to = key.slice(0, -7); // strip Binding off end
        if (binding instanceof Ember.Binding) {
          binding = binding.copy(); // copy prototypes' instance
          binding.to(to);
        } else { // binding is string path
          binding = new Ember.Binding(to, binding);
        }
        binding.connect(obj);
        obj[key] = binding;
      }
    }
    // mark as applied
    m.bindings = {};
  }
}

function finishPartial(obj, m) {
  connectBindings(obj, m || Ember.meta(obj));
  return obj;
}

function followAlias(obj, desc, m, descs, values) {
  var altKey = desc.methodName, value;
  if (descs[altKey] || values[altKey]) {
    value = values[altKey];
    desc  = descs[altKey];
  } else if (m.descs[altKey]) {
    desc  = m.descs[altKey];
    value = undefined;
  } else {
    desc = undefined;
    value = obj[altKey];
  }

  return { desc: desc, value: value };
}

function updateObservers(obj, key, observer, observerKey, method) {
  if ('function' !== typeof observer) { return; }

  var paths = observer[observerKey];

  if (paths) {
    for (var i=0, l=paths.length; i<l; i++) {
      Ember[method](obj, paths[i], null, key);
    }
  }
}

function replaceObservers(obj, key, observer) {
  var prevObserver = obj[key];

  updateObservers(obj, key, prevObserver, '__ember_observesBefore__', 'removeBeforeObserver');
  updateObservers(obj, key, prevObserver, '__ember_observes__', 'removeObserver');

  updateObservers(obj, key, observer, '__ember_observesBefore__', 'addBeforeObserver');
  updateObservers(obj, key, observer, '__ember_observes__', 'addObserver');
}

function applyMixin(obj, mixins, partial) {
  var descs = {}, values = {}, m = Ember.meta(obj),
      key, value, desc;

  // Go through all mixins and hashes passed in, and:
  //
  // * Handle concatenated properties
  // * Set up _super wrapping if necessary
  // * Set up computed property descriptors
  // * Copying `toString` in broken browsers
  mergeMixins(mixins, mixinsMeta(obj), descs, values, obj);

  for(key in values) {
    if (key === 'contructor' || !values.hasOwnProperty(key)) { continue; }

    desc = descs[key];
    value = values[key];

    if (desc === REQUIRED) { continue; }

    while (desc && desc instanceof Alias) {
      var followed = followAlias(obj, desc, m, descs, values);
      desc = followed.desc;
      value = followed.value;
    }

    if (desc === undefined && value === undefined) { continue; }

    replaceObservers(obj, key, value);
    detectBinding(obj, key, value, m);
    defineProperty(obj, key, desc, value, m);
  }

  if (!partial) { // don't apply to prototype
    finishPartial(obj, m);
  }

  return obj;
}

/**
  @method mixin
  @for Ember
  @param obj
  @param mixins*
  @return obj
*/
Ember.mixin = function(obj) {
  var args = a_slice.call(arguments, 1);
  applyMixin(obj, args, false);
  return obj;
};

/**
  The `Ember.Mixin` class allows you to create mixins, whose properties can be
  added to other classes. For instance,

  ```javascript
  App.Editable = Ember.Mixin.create({
    edit: function() {
      console.log('starting to edit');
      this.set('isEditing', true);
    },
    isEditing: false
  });

  // Mix mixins into classes by passing them as the first arguments to
  // .extend or .create.
  App.CommentView = Ember.View.extend(App.Editable, {
    template: Ember.Handlebars.compile('{{#if isEditing}}...{{else}}...{{/if}}')
  });

  commentView = App.CommentView.create();
  commentView.edit(); // outputs 'starting to edit'
  ```

  Note that Mixins are created with `Ember.Mixin.create`, not
  `Ember.Mixin.extend`.

  @class Mixin
  @namespace Ember
*/
Ember.Mixin = function() { return initMixin(this, arguments); };

Mixin = Ember.Mixin;

Mixin._apply = applyMixin;

Mixin.applyPartial = function(obj) {
  var args = a_slice.call(arguments, 1);
  return applyMixin(obj, args, true);
};

Mixin.finishPartial = finishPartial;

Ember.anyUnprocessedMixins = false;

/**
  @method create
  @static
  @param arguments*
*/
Mixin.create = function() {
  Ember.anyUnprocessedMixins = true;
  var M = this;
  return initMixin(new M(), arguments);
};

var MixinPrototype = Mixin.prototype;

/**
  @method reopen
  @param arguments*
*/
MixinPrototype.reopen = function() {
  var mixin, tmp;

  if (this.properties) {
    mixin = Mixin.create();
    mixin.properties = this.properties;
    delete this.properties;
    this.mixins = [mixin];
  } else if (!this.mixins) {
    this.mixins = [];
  }

  var len = arguments.length, mixins = this.mixins, idx;

  for(idx=0; idx < len; idx++) {
    mixin = arguments[idx];
    Ember.assert('Expected hash or Mixin instance, got ' + Object.prototype.toString.call(mixin), typeof mixin === 'object' && mixin !== null && Object.prototype.toString.call(mixin) !== '[object Array]');

    if (mixin instanceof Mixin) {
      mixins.push(mixin);
    } else {
      tmp = Mixin.create();
      tmp.properties = mixin;
      mixins.push(tmp);
    }
  }

  return this;
};

/**
  @method apply
  @param obj
  @return applied object
*/
MixinPrototype.apply = function(obj) {
  return applyMixin(obj, [this], false);
};

MixinPrototype.applyPartial = function(obj) {
  return applyMixin(obj, [this], true);
};

function _detect(curMixin, targetMixin, seen) {
  var guid = guidFor(curMixin);

  if (seen[guid]) { return false; }
  seen[guid] = true;

  if (curMixin === targetMixin) { return true; }
  var mixins = curMixin.mixins, loc = mixins ? mixins.length : 0;
  while (--loc >= 0) {
    if (_detect(mixins[loc], targetMixin, seen)) { return true; }
  }
  return false;
}

/**
  @method detect
  @param obj
  @return {Boolean}
*/
MixinPrototype.detect = function(obj) {
  if (!obj) { return false; }
  if (obj instanceof Mixin) { return _detect(obj, this, {}); }
  var mixins = Ember.meta(obj, false).mixins;
  if (mixins) {
    return !!mixins[guidFor(this)];
  }
  return false;
};

MixinPrototype.without = function() {
  var ret = new Mixin(this);
  ret._without = a_slice.call(arguments);
  return ret;
};

function _keys(ret, mixin, seen) {
  if (seen[guidFor(mixin)]) { return; }
  seen[guidFor(mixin)] = true;

  if (mixin.properties) {
    var props = mixin.properties;
    for (var key in props) {
      if (props.hasOwnProperty(key)) { ret[key] = true; }
    }
  } else if (mixin.mixins) {
    a_forEach.call(mixin.mixins, function(x) { _keys(ret, x, seen); });
  }
}

MixinPrototype.keys = function() {
  var keys = {}, seen = {}, ret = [];
  _keys(keys, this, seen);
  for(var key in keys) {
    if (keys.hasOwnProperty(key)) { ret.push(key); }
  }
  return ret;
};

// returns the mixins currently applied to the specified object
// TODO: Make Ember.mixin
Mixin.mixins = function(obj) {
  var mixins = Ember.meta(obj, false).mixins, ret = [];

  if (!mixins) { return ret; }

  for (var key in mixins) {
    var mixin = mixins[key];

    // skip primitive mixins since these are always anonymous
    if (!mixin.properties) { ret.push(mixin); }
  }

  return ret;
};

REQUIRED = new Ember.Descriptor();
REQUIRED.toString = function() { return '(Required Property)'; };

/**
  Denotes a required property for a mixin

  @method required
  @for Ember
*/
Ember.required = function() {
  return REQUIRED;
};

Alias = function(methodName) {
  this.methodName = methodName;
};
Alias.prototype = new Ember.Descriptor();

/**
  Makes a property or method available via an additional name.

  ```javascript
  App.PaintSample = Ember.Object.extend({
    color: 'red',
    colour: Ember.alias('color'),
    name: function(){
      return "Zed";
    },
    moniker: Ember.alias("name")
  });

  var paintSample = App.PaintSample.create()
  paintSample.get('colour');  // 'red'
  paintSample.moniker();      // 'Zed'
  ```

  @method alias
  @for Ember
  @param {String} methodName name of the method or property to alias
  @return {Ember.Descriptor}
  @deprecated Use `Ember.aliasMethod` or `Ember.computed.alias` instead
*/
Ember.alias = function(methodName) {
  return new Alias(methodName);
};

Ember.deprecateFunc("Ember.alias is deprecated. Please use Ember.aliasMethod or Ember.computed.alias instead.", Ember.alias);

/**
  Makes a method available via an additional name.

  ```javascript
  App.Person = Ember.Object.extend({
    name: function(){
      return 'Tomhuda Katzdale';
    },
    moniker: Ember.aliasMethod('name')
  });

  var goodGuy = App.Person.create()
  ```

  @method aliasMethod
  @for Ember
  @param {String} methodName name of the method to alias
  @return {Ember.Descriptor}
*/
Ember.aliasMethod = function(methodName) {
  return new Alias(methodName);
};

// ..........................................................
// OBSERVER HELPER
//

/**
  @method observer
  @for Ember
  @param {Function} func
  @param {String} propertyNames*
  @return func
*/
Ember.observer = function(func) {
  var paths = a_slice.call(arguments, 1);
  func.__ember_observes__ = paths;
  return func;
};

// If observers ever become asynchronous, Ember.immediateObserver
// must remain synchronous.
/**
  @method immediateObserver
  @for Ember
  @param {Function} func
  @param {String} propertyNames*
  @return func
*/
Ember.immediateObserver = function() {
  for (var i=0, l=arguments.length; i<l; i++) {
    var arg = arguments[i];
    Ember.assert("Immediate observers must observe internal properties only, not properties on other objects.", typeof arg !== "string" || arg.indexOf('.') === -1);
  }

  return Ember.observer.apply(this, arguments);
};

/**
  @method beforeObserver
  @for Ember
  @param {Function} func
  @param {String} propertyNames*
  @return func
*/
Ember.beforeObserver = function(func) {
  var paths = a_slice.call(arguments, 1);
  func.__ember_observesBefore__ = paths;
  return func;
};

})();



(function() {
/**
Ember Metal

@module ember
@submodule ember-metal
*/

})();

(function() {
define("rsvp",
  [],
  function() {
    "use strict";
    var browserGlobal = (typeof window !== 'undefined') ? window : {};

    var MutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var RSVP, async;

    if (typeof process !== 'undefined' &&
      {}.toString.call(process) === '[object process]') {
      async = function(callback, binding) {
        process.nextTick(function() {
          callback.call(binding);
        });
      };
    } else if (MutationObserver) {
      var queue = [];

      var observer = new MutationObserver(function() {
        var toProcess = queue.slice();
        queue = [];

        toProcess.forEach(function(tuple) {
          var callback = tuple[0], binding = tuple[1];
          callback.call(binding);
        });
      });

      var element = document.createElement('div');
      observer.observe(element, { attributes: true });

      // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
      window.addEventListener('unload', function(){
        observer.disconnect();
        observer = null;
      });

      async = function(callback, binding) {
        queue.push([callback, binding]);
        element.setAttribute('drainQueue', 'drainQueue');
      };
    } else {
      async = function(callback, binding) {
        setTimeout(function() {
          callback.call(binding);
        }, 1);
      };
    }

    var Event = function(type, options) {
      this.type = type;

      for (var option in options) {
        if (!options.hasOwnProperty(option)) { continue; }

        this[option] = options[option];
      }
    };

    var indexOf = function(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i][0] === callback) { return i; }
      }

      return -1;
    };

    var callbacksFor = function(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    };

    var EventTarget = {
      mixin: function(object) {
        object.on = this.on;
        object.off = this.off;
        object.trigger = this.trigger;
        return object;
      },

      on: function(eventNames, callback, binding) {
        var allCallbacks = callbacksFor(this), callbacks, eventName;
        eventNames = eventNames.split(/\s+/);
        binding = binding || this;

        while (eventName = eventNames.shift()) {
          callbacks = allCallbacks[eventName];

          if (!callbacks) {
            callbacks = allCallbacks[eventName] = [];
          }

          if (indexOf(callbacks, callback) === -1) {
            callbacks.push([callback, binding]);
          }
        }
      },

      off: function(eventNames, callback) {
        var allCallbacks = callbacksFor(this), callbacks, eventName, index;
        eventNames = eventNames.split(/\s+/);

        while (eventName = eventNames.shift()) {
          if (!callback) {
            allCallbacks[eventName] = [];
            continue;
          }

          callbacks = allCallbacks[eventName];

          index = indexOf(callbacks, callback);

          if (index !== -1) { callbacks.splice(index, 1); }
        }
      },

      trigger: function(eventName, options) {
        var allCallbacks = callbacksFor(this),
            callbacks, callbackTuple, callback, binding, event;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callbackTuple = callbacks[i];
            callback = callbackTuple[0];
            binding = callbackTuple[1];

            if (typeof options !== 'object') {
              options = { detail: options };
            }

            event = new Event(eventName, options);
            callback.call(binding, event);
          }
        }
      }
    };

    var Promise = function() {
      this.on('promise:resolved', function(event) {
        this.trigger('success', { detail: event.detail });
      }, this);

      this.on('promise:failed', function(event) {
        this.trigger('error', { detail: event.detail });
      }, this);
    };

    var noop = function() {};

    var invokeCallback = function(type, promise, callback, event) {
      var hasCallback = typeof callback === 'function',
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(event.detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = event.detail;
        succeeded = true;
      }

      if (value && typeof value.then === 'function') {
        value.then(function(value) {
          promise.resolve(value);
        }, function(error) {
          promise.reject(error);
        });
      } else if (hasCallback && succeeded) {
        promise.resolve(value);
      } else if (failed) {
        promise.reject(error);
      } else {
        promise[type](value);
      }
    };

    Promise.prototype = {
      then: function(done, fail) {
        var thenPromise = new Promise();

        if (this.isResolved) {
          RSVP.async(function() {
            invokeCallback('resolve', thenPromise, done, { detail: this.resolvedValue });
          }, this);
        }

        if (this.isRejected) {
          RSVP.async(function() {
            invokeCallback('reject', thenPromise, fail, { detail: this.rejectedValue });
          }, this);
        }

        this.on('promise:resolved', function(event) {
          invokeCallback('resolve', thenPromise, done, event);
        });

        this.on('promise:failed', function(event) {
          invokeCallback('reject', thenPromise, fail, event);
        });

        return thenPromise;
      },

      resolve: function(value) {
        resolve(this, value);

        this.resolve = noop;
        this.reject = noop;
      },

      reject: function(value) {
        reject(this, value);

        this.resolve = noop;
        this.reject = noop;
      }
    };

    function resolve(promise, value) {
      RSVP.async(function() {
        promise.trigger('promise:resolved', { detail: value });
        promise.isResolved = true;
        promise.resolvedValue = value;
      });
    }

    function reject(promise, value) {
      RSVP.async(function() {
        promise.trigger('promise:failed', { detail: value });
        promise.isRejected = true;
        promise.rejectedValue = value;
      });
    }

    function all(promises) {
    	var i, results = [];
    	var allPromise = new Promise();
    	var remaining = promises.length;

      if (remaining === 0) {
        allPromise.resolve([]);
      }

    	var resolver = function(index) {
    		return function(value) {
    			resolve(index, value);
    		};
    	};

    	var resolve = function(index, value) {
    		results[index] = value;
    		if (--remaining === 0) {
    			allPromise.resolve(results);
    		}
    	};

    	var reject = function(error) {
    		allPromise.reject(error);
    	};

    	for (i = 0; i < remaining; i++) {
    		promises[i].then(resolver(i), reject);
    	}
    	return allPromise;
    }

    EventTarget.mixin(Promise.prototype);

    RSVP = { async: async, Promise: Promise, Event: Event, EventTarget: EventTarget, all: all, raiseOnUncaughtExceptions: true };
    return RSVP;
  });

})();

(function() {
define("container",
  [],
  function() {

    var objectCreate = Object.create || function(parent) {
      function F() {}
      F.prototype = parent;
      return new F();
    };

    function InheritingDict(parent) {
      this.parent = parent;
      this.dict = {};
    }

    InheritingDict.prototype = {
      get: function(key) {
        var dict = this.dict;

        if (dict.hasOwnProperty(key)) {
          return dict[key];
        }

        if (this.parent) {
          return this.parent.get(key);
        }
      },

      set: function(key, value) {
        this.dict[key] = value;
      },

      has: function(key) {
        var dict = this.dict;

        if (dict.hasOwnProperty(key)) {
          return true;
        }

        if (this.parent) {
          return this.parent.has(key);
        }

        return false;
      },

      eachLocal: function(callback, binding) {
        var dict = this.dict;

        for (var prop in dict) {
          if (dict.hasOwnProperty(prop)) {
            callback.call(binding, prop, dict[prop]);
          }
        }
      }
    };

    function Container(parent) {
      this.parent = parent;
      this.children = [];

      this.resolver = parent && parent.resolver || function() {};
      this.registry = new InheritingDict(parent && parent.registry);
      this.cache = new InheritingDict(parent && parent.cache);
      this.typeInjections = new InheritingDict(parent && parent.typeInjections);
      this.injections = {};
      this._options = new InheritingDict(parent && parent._options);
      this._typeOptions = new InheritingDict(parent && parent._typeOptions);
    }

    Container.prototype = {
      child: function() {
        var container = new Container(this);
        this.children.push(container);
        return container;
      },

      set: function(object, key, value) {
        object[key] = value;
      },

      register: function(type, name, factory, options) {
        var fullName;


        if (type.indexOf(':') !== -1){
          options = factory;
          factory = name;
          fullName = type;
        } else {
          Ember.deprecate('register("'+type +'", "'+ name+'") is now deprecated in-favour of register("'+type+':'+name+'");', true);
          fullName = type + ":" + name;
        }

        this.registry.set(fullName, factory);
        this._options.set(fullName, options || {});
      },

      resolve: function(fullName) {
        return this.resolver(fullName) || this.registry.get(fullName);
      },

      lookup: function(fullName) {
        if (this.cache.has(fullName)) {
          return this.cache.get(fullName);
        }

        var value = instantiate(this, fullName);

        if (!value) { return; }

        if (isSingleton(this, fullName)) {
          this.cache.set(fullName, value);
        }

        return value;
      },

      has: function(fullName) {
        if (this.cache.has(fullName)) {
          return true;
        }

        return !!factoryFor(this, fullName);
      },

      optionsForType: function(type, options) {
        if (this.parent) { illegalChildOperation('optionsForType'); }

        this._typeOptions.set(type, options);
      },

      options: function(type, options) {
        this.optionsForType(type, options);
      },

      typeInjection: function(type, property, fullName) {
        if (this.parent) { illegalChildOperation('typeInjection'); }

        var injections = this.typeInjections.get(type);
        if (!injections) {
          injections = [];
          this.typeInjections.set(type, injections);
        }
        injections.push({ property: property, fullName: fullName });
      },

      injection: function(factoryName, property, injectionName) {
        if (this.parent) { illegalChildOperation('injection'); }

        if (factoryName.indexOf(':') === -1) {
          return this.typeInjection(factoryName, property, injectionName);
        }

        var injections = this.injections[factoryName] = this.injections[factoryName] || [];
        injections.push({ property: property, fullName: injectionName });
      },

      destroy: function() {
        this.isDestroyed = true;

        for (var i=0, l=this.children.length; i<l; i++) {
          this.children[i].destroy();
        }

        this.children = [];

        eachDestroyable(this, function(item) {
          item.isDestroying = true;
        });

        eachDestroyable(this, function(item) {
          item.destroy();
        });

        delete this.parent;
        this.isDestroyed = true;
      },

      reset: function() {
        for (var i=0, l=this.children.length; i<l; i++) {
          resetCache(this.children[i]);
        }
        resetCache(this);
      }
    };

    function illegalChildOperation(operation) {
      throw new Error(operation + " is not currently supported on child containers");
    }

    function isSingleton(container, fullName) {
      var singleton = option(container, fullName, 'singleton');

      return singleton !== false;
    }

    function buildInjections(container, injections) {
      var hash = {};

      if (!injections) { return hash; }

      var injection, lookup;

      for (var i=0, l=injections.length; i<l; i++) {
        injection = injections[i];
        lookup = container.lookup(injection.fullName);
        hash[injection.property] = lookup;
      }

      return hash;
    }

    function option(container, fullName, optionName) {
      var options = container._options.get(fullName);

      if (options && options[optionName] !== undefined) {
        return options[optionName];
      }

      var type = fullName.split(":")[0];
      options = container._typeOptions.get(type);

      if (options) {
        return options[optionName];
      }
    }

    function factoryFor(container, fullName) {
      return container.resolve(fullName);
    }

    function instantiate(container, fullName) {
      var factory = factoryFor(container, fullName);

      var splitName = fullName.split(":"),
          type = splitName[0], name = splitName[1],
          value;

      if (option(container, fullName, 'instantiate') === false) {
        return factory;
      }

      if (factory) {
        var injections = [];
        injections = injections.concat(container.typeInjections.get(type) || []);
        injections = injections.concat(container.injections[fullName] || []);

        var hash = buildInjections(container, injections);
        hash.container = container;
        hash._debugContainerKey = fullName;

        value = factory.create(hash);

        return value;
      }
    }

    function eachDestroyable(container, callback) {
      container.cache.eachLocal(function(key, value) {
        if (option(container, key, 'instantiate') === false) { return; }
        callback(value);
      });
    }

    function resetCache(container) {
      container.cache.eachLocal(function(key, value) {
        if (option(container, key, 'instantiate') === false) { return; }
        value.destroy();
      });
      container.cache.dict = {};
    }

    return Container;
});

})();

(function() {
/*globals ENV */
/**
@module ember
@submodule ember-runtime
*/

var indexOf = Ember.EnumerableUtils.indexOf;

// ........................................
// TYPING & ARRAY MESSAGING
//

var TYPE_MAP = {};
var t = "Boolean Number String Function Array Date RegExp Object".split(" ");
Ember.ArrayPolyfills.forEach.call(t, function(name) {
  TYPE_MAP[ "[object " + name + "]" ] = name.toLowerCase();
});

var toString = Object.prototype.toString;

/**
  Returns a consistent type for the passed item.

  Use this instead of the built-in `typeof` to get the type of an item.
  It will return the same result across all browsers and includes a bit
  more detail. Here is what will be returned:

      | Return Value  | Meaning                                              |
      |---------------|------------------------------------------------------|
      | 'string'      | String primitive                                     |
      | 'number'      | Number primitive                                     |
      | 'boolean'     | Boolean primitive                                    |
      | 'null'        | Null value                                           |
      | 'undefined'   | Undefined value                                      |
      | 'function'    | A function                                           |
      | 'array'       | An instance of Array                                 |
      | 'class'       | A Ember class (created using Ember.Object.extend())  |
      | 'instance'    | A Ember object instance                              |
      | 'error'       | An instance of the Error object                      |
      | 'object'      | A JavaScript object not inheriting from Ember.Object |

  Examples:

  ```javascript
  Ember.typeOf();                       // 'undefined'
  Ember.typeOf(null);                   // 'null'
  Ember.typeOf(undefined);              // 'undefined'
  Ember.typeOf('michael');              // 'string'
  Ember.typeOf(101);                    // 'number'
  Ember.typeOf(true);                   // 'boolean'
  Ember.typeOf(Ember.makeArray);        // 'function'
  Ember.typeOf([1,2,90]);               // 'array'
  Ember.typeOf(Ember.Object.extend());  // 'class'
  Ember.typeOf(Ember.Object.create());  // 'instance'
  Ember.typeOf(new Error('teamocil'));  // 'error'

  // "normal" JavaScript object
  Ember.typeOf({a: 'b'});              // 'object'
  ```

  @method typeOf
  @for Ember
  @param item {Object} the item to check
  @return {String} the type
*/
Ember.typeOf = function(item) {
  var ret;

  ret = (item === null || item === undefined) ? String(item) : TYPE_MAP[toString.call(item)] || 'object';

  if (ret === 'function') {
    if (Ember.Object && Ember.Object.detect(item)) ret = 'class';
  } else if (ret === 'object') {
    if (item instanceof Error) ret = 'error';
    else if (Ember.Object && item instanceof Ember.Object) ret = 'instance';
    else ret = 'object';
  }

  return ret;
};

/**
  Returns true if the passed value is null or undefined. This avoids errors
  from JSLint complaining about use of ==, which can be technically
  confusing.

  ```javascript
  Ember.isNone();              // true
  Ember.isNone(null);          // true
  Ember.isNone(undefined);     // true
  Ember.isNone('');            // false
  Ember.isNone([]);            // false
  Ember.isNone(function(){});  // false
  ```

  @method isNone
  @for Ember
  @param {Object} obj Value to test
  @return {Boolean}
*/
Ember.isNone = function(obj) {
  return obj === null || obj === undefined;
};
Ember.none = Ember.deprecateFunc("Ember.none is deprecated. Please use Ember.isNone instead.", Ember.isNone);

/**
  Verifies that a value is `null` or an empty string, empty array,
  or empty function.

  Constrains the rules on `Ember.isNone` by returning false for empty
  string and empty arrays.

  ```javascript
  Ember.isEmpty();                // true
  Ember.isEmpty(null);            // true
  Ember.isEmpty(undefined);       // true
  Ember.isEmpty('');              // true
  Ember.isEmpty([]);              // true
  Ember.isEmpty('Adam Hawkins');  // false
  Ember.isEmpty([0,1,2]);         // false
  ```

  @method isEmpty
  @for Ember
  @param {Object} obj Value to test
  @return {Boolean}
*/
Ember.isEmpty = function(obj) {
  return obj === null || obj === undefined || (obj.length === 0 && typeof obj !== 'function') || (typeof obj === 'object' && Ember.get(obj, 'length') === 0);
};
Ember.empty = Ember.deprecateFunc("Ember.empty is deprecated. Please use Ember.isEmpty instead.", Ember.isEmpty) ;

/**
 This will compare two javascript values of possibly different types.
 It will tell you which one is greater than the other by returning:

  - -1 if the first is smaller than the second,
  - 0 if both are equal,
  - 1 if the first is greater than the second.

 The order is calculated based on `Ember.ORDER_DEFINITION`, if types are different.
 In case they have the same type an appropriate comparison for this type is made.

  ```javascript
  Ember.compare('hello', 'hello');  // 0
  Ember.compare('abc', 'dfg');      // -1
  Ember.compare(2, 1);              // 1
  ```

 @method compare
 @for Ember
 @param {Object} v First value to compare
 @param {Object} w Second value to compare
 @return {Number} -1 if v < w, 0 if v = w and 1 if v > w.
*/
Ember.compare = function compare(v, w) {
  if (v === w) { return 0; }

  var type1 = Ember.typeOf(v);
  var type2 = Ember.typeOf(w);

  var Comparable = Ember.Comparable;
  if (Comparable) {
    if (type1==='instance' && Comparable.detect(v.constructor)) {
      return v.constructor.compare(v, w);
    }

    if (type2 === 'instance' && Comparable.detect(w.constructor)) {
      return 1-w.constructor.compare(w, v);
    }
  }

  // If we haven't yet generated a reverse-mapping of Ember.ORDER_DEFINITION,
  // do so now.
  var mapping = Ember.ORDER_DEFINITION_MAPPING;
  if (!mapping) {
    var order = Ember.ORDER_DEFINITION;
    mapping = Ember.ORDER_DEFINITION_MAPPING = {};
    var idx, len;
    for (idx = 0, len = order.length; idx < len;  ++idx) {
      mapping[order[idx]] = idx;
    }

    // We no longer need Ember.ORDER_DEFINITION.
    delete Ember.ORDER_DEFINITION;
  }

  var type1Index = mapping[type1];
  var type2Index = mapping[type2];

  if (type1Index < type2Index) { return -1; }
  if (type1Index > type2Index) { return 1; }

  // types are equal - so we have to check values now
  switch (type1) {
    case 'boolean':
    case 'number':
      if (v < w) { return -1; }
      if (v > w) { return 1; }
      return 0;

    case 'string':
      var comp = v.localeCompare(w);
      if (comp < 0) { return -1; }
      if (comp > 0) { return 1; }
      return 0;

    case 'array':
      var vLen = v.length;
      var wLen = w.length;
      var l = Math.min(vLen, wLen);
      var r = 0;
      var i = 0;
      while (r === 0 && i < l) {
        r = compare(v[i],w[i]);
        i++;
      }
      if (r !== 0) { return r; }

      // all elements are equal now
      // shorter array should be ordered first
      if (vLen < wLen) { return -1; }
      if (vLen > wLen) { return 1; }
      // arrays are equal now
      return 0;

    case 'instance':
      if (Ember.Comparable && Ember.Comparable.detect(v)) {
        return v.compare(v, w);
      }
      return 0;

    case 'date':
      var vNum = v.getTime();
      var wNum = w.getTime();
      if (vNum < wNum) { return -1; }
      if (vNum > wNum) { return 1; }
      return 0;

    default:
      return 0;
  }
};

function _copy(obj, deep, seen, copies) {
  var ret, loc, key;

  // primitive data types are immutable, just return them.
  if ('object' !== typeof obj || obj===null) return obj;

  // avoid cyclical loops
  if (deep && (loc=indexOf(seen, obj))>=0) return copies[loc];

  Ember.assert('Cannot clone an Ember.Object that does not implement Ember.Copyable', !(obj instanceof Ember.Object) || (Ember.Copyable && Ember.Copyable.detect(obj)));

  // IMPORTANT: this specific test will detect a native array only. Any other
  // object will need to implement Copyable.
  if (Ember.typeOf(obj) === 'array') {
    ret = obj.slice();
    if (deep) {
      loc = ret.length;
      while(--loc>=0) ret[loc] = _copy(ret[loc], deep, seen, copies);
    }
  } else if (Ember.Copyable && Ember.Copyable.detect(obj)) {
    ret = obj.copy(deep, seen, copies);
  } else {
    ret = {};
    for(key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      // Prevents browsers that don't respect non-enumerability from
      // copying internal Ember properties
      if (key.substring(0,2) === '__') continue;

      ret[key] = deep ? _copy(obj[key], deep, seen, copies) : obj[key];
    }
  }

  if (deep) {
    seen.push(obj);
    copies.push(ret);
  }

  return ret;
}

/**
  Creates a clone of the passed object. This function can take just about
  any type of object and create a clone of it, including primitive values
  (which are not actually cloned because they are immutable).

  If the passed object implements the `clone()` method, then this function
  will simply call that method and return the result.

  @method copy
  @for Ember
  @param {Object} object The object to clone
  @param {Boolean} deep If true, a deep copy of the object is made
  @return {Object} The cloned object
*/
Ember.copy = function(obj, deep) {
  // fast paths
  if ('object' !== typeof obj || obj===null) return obj; // can't copy primitives
  if (Ember.Copyable && Ember.Copyable.detect(obj)) return obj.copy(deep);
  return _copy(obj, deep, deep ? [] : null, deep ? [] : null);
};

/**
  Convenience method to inspect an object. This method will attempt to
  convert the object into a useful string description.

  It is a pretty simple implementation. If you want something more robust,
  use something like JSDump: https://github.com/NV/jsDump

  @method inspect
  @for Ember
  @param {Object} obj The object you want to inspect.
  @return {String} A description of the object
*/
Ember.inspect = function(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj + '';
  }

  var v, ret = [];
  for(var key in obj) {
    if (obj.hasOwnProperty(key)) {
      v = obj[key];
      if (v === 'toString') { continue; } // ignore useless items
      if (Ember.typeOf(v) === 'function') { v = "function() { ... }"; }
      ret.push(key + ": " + v);
    }
  }
  return "{" + ret.join(", ") + "}";
};

/**
  Compares two objects, returning true if they are logically equal. This is
  a deeper comparison than a simple triple equal. For sets it will compare the
  internal objects. For any other object that implements `isEqual()` it will
  respect that method.

  ```javascript
  Ember.isEqual('hello', 'hello');  // true
  Ember.isEqual(1, 2);              // false
  Ember.isEqual([4,2], [4,2]);      // false
  ```

  @method isEqual
  @for Ember
  @param {Object} a first object to compare
  @param {Object} b second object to compare
  @return {Boolean}
*/
Ember.isEqual = function(a, b) {
  if (a && 'function'===typeof a.isEqual) return a.isEqual(b);
  return a === b;
};

// Used by Ember.compare
Ember.ORDER_DEFINITION = Ember.ENV.ORDER_DEFINITION || [
  'undefined',
  'null',
  'boolean',
  'number',
  'string',
  'array',
  'object',
  'instance',
  'function',
  'class',
  'date'
];

/**
  Returns all of the keys defined on an object or hash. This is useful
  when inspecting objects for debugging. On browsers that support it, this
  uses the native `Object.keys` implementation.

  @method keys
  @for Ember
  @param {Object} obj
  @return {Array} Array containing keys of obj
*/
Ember.keys = Object.keys;

if (!Ember.keys) {
  Ember.keys = function(obj) {
    var ret = [];
    for(var key in obj) {
      if (obj.hasOwnProperty(key)) { ret.push(key); }
    }
    return ret;
  };
}

// ..........................................................
// ERROR
//

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

/**
  A subclass of the JavaScript Error object for use in Ember.

  @class Error
  @namespace Ember
  @extends Error
  @constructor
*/
Ember.Error = function() {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
};

Ember.Error.prototype = Ember.create(Error.prototype);

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var STRING_DASHERIZE_REGEXP = (/[ _]/g);
var STRING_DASHERIZE_CACHE = {};
var STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
var STRING_CAMELIZE_REGEXP = (/(\-|_|\.|\s)+(.)?/g);
var STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
var STRING_UNDERSCORE_REGEXP_2 = (/\-|\s+/g);

/**
  Defines the hash of localized strings for the current language. Used by
  the `Ember.String.loc()` helper. To localize, add string values to this
  hash.

  @property STRINGS
  @for Ember
  @type Hash
*/
Ember.STRINGS = {};

/**
  Defines string helper methods including string formatting and localization.
  Unless `Ember.EXTEND_PROTOTYPES.String` is `false` these methods will also be
  added to the `String.prototype` as well.

  @class String
  @namespace Ember
  @static
*/
Ember.String = {

  /**
    Apply formatting options to the string. This will look for occurrences
    of "%@" in your string and substitute them with the arguments you pass into
    this method. If you want to control the specific order of replacement,
    you can add a number after the key as well to indicate which argument
    you want to insert.

    Ordered insertions are most useful when building loc strings where values
    you need to insert may appear in different orders.

    ```javascript
    "Hello %@ %@".fmt('John', 'Doe');     // "Hello John Doe"
    "Hello %@2, %@1".fmt('John', 'Doe');  // "Hello Doe, John"
    ```

    @method fmt
    @param {Object...} [args]
    @return {String} formatted string
  */
  fmt: function(str, formats) {
    // first, replace any ORDERED replacements.
    var idx  = 0; // the current index for non-numerical replacements
    return str.replace(/%@([0-9]+)?/g, function(s, argIndex) {
      argIndex = (argIndex) ? parseInt(argIndex,0) - 1 : idx++ ;
      s = formats[argIndex];
      return ((s === null) ? '(null)' : (s === undefined) ? '' : s).toString();
    }) ;
  },

  /**
    Formats the passed string, but first looks up the string in the localized
    strings hash. This is a convenient way to localize text. See
    `Ember.String.fmt()` for more information on formatting.

    Note that it is traditional but not required to prefix localized string
    keys with an underscore or other character so you can easily identify
    localized strings.

    ```javascript
    Ember.STRINGS = {
      '_Hello World': 'Bonjour le monde',
      '_Hello %@ %@': 'Bonjour %@ %@'
    };

    Ember.String.loc("_Hello World");  // 'Bonjour le monde';
    Ember.String.loc("_Hello %@ %@", ["John", "Smith"]);  // "Bonjour John Smith";
    ```

    @method loc
    @param {String} str The string to format
    @param {Array} formats Optional array of parameters to interpolate into string.
    @return {String} formatted string
  */
  loc: function(str, formats) {
    str = Ember.STRINGS[str] || str;
    return Ember.String.fmt(str, formats) ;
  },

  /**
    Splits a string into separate units separated by spaces, eliminating any
    empty strings in the process. This is a convenience method for split that
    is mostly useful when applied to the `String.prototype`.

    ```javascript
    Ember.String.w("alpha beta gamma").forEach(function(key) {
      console.log(key);
    });

    // > alpha
    // > beta
    // > gamma
    ```

    @method w
    @param {String} str The string to split
    @return {String} split string
  */
  w: function(str) { return str.split(/\s+/); },

  /**
    Converts a camelized string into all lower case separated by underscores.

    ```javascript
    'innerHTML'.decamelize();           // 'inner_html'
    'action_name'.decamelize();        // 'action_name'
    'css-class-name'.decamelize();     // 'css-class-name'
    'my favorite items'.decamelize();  // 'my favorite items'
    ```

    @method decamelize
    @param {String} str The string to decamelize.
    @return {String} the decamelized string.
  */
  decamelize: function(str) {
    return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
  },

  /**
    Replaces underscores or spaces with dashes.

    ```javascript
    'innerHTML'.dasherize();          // 'inner-html'
    'action_name'.dasherize();        // 'action-name'
    'css-class-name'.dasherize();     // 'css-class-name'
    'my favorite items'.dasherize();  // 'my-favorite-items'
    ```

    @method dasherize
    @param {String} str The string to dasherize.
    @return {String} the dasherized string.
  */
  dasherize: function(str) {
    var cache = STRING_DASHERIZE_CACHE,
        ret   = cache[str];

    if (ret) {
      return ret;
    } else {
      ret = Ember.String.decamelize(str).replace(STRING_DASHERIZE_REGEXP,'-');
      cache[str] = ret;
    }

    return ret;
  },

  /**
    Returns the lowerCaseCamel form of a string.

    ```javascript
    'innerHTML'.camelize();          // 'innerHTML'
    'action_name'.camelize();        // 'actionName'
    'css-class-name'.camelize();     // 'cssClassName'
    'my favorite items'.camelize();  // 'myFavoriteItems'
    ```

    @method camelize
    @param {String} str The string to camelize.
    @return {String} the camelized string.
  */
  camelize: function(str) {
    return str.replace(STRING_CAMELIZE_REGEXP, function(match, separator, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  },

  /**
    Returns the UpperCamelCase form of a string.

    ```javascript
    'innerHTML'.classify();          // 'InnerHTML'
    'action_name'.classify();        // 'ActionName'
    'css-class-name'.classify();     // 'CssClassName'
    'my favorite items'.classify();  // 'MyFavoriteItems'
    ```

    @method classify
    @param {String} str the string to classify
    @return {String} the classified string
  */
  classify: function(str) {
    var parts = str.split("."),
        out = [];

    for (var i=0, l=parts.length; i<l; i++) {
      var camelized = Ember.String.camelize(parts[i]);
      out.push(camelized.charAt(0).toUpperCase() + camelized.substr(1));
    }

    return out.join(".");
  },

  /**
    More general than decamelize. Returns the lower\_case\_and\_underscored
    form of a string.

    ```javascript
    'innerHTML'.underscore();          // 'inner_html'
    'action_name'.underscore();        // 'action_name'
    'css-class-name'.underscore();     // 'css_class_name'
    'my favorite items'.underscore();  // 'my_favorite_items'
    ```

    @method underscore
    @param {String} str The string to underscore.
    @return {String} the underscored string.
  */
  underscore: function(str) {
    return str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').
      replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase();
  },

  /**
    Returns the Capitalized form of a string

       'innerHTML'.capitalize()         => 'InnerHTML'
       'action_name'.capitalize()       => 'Action_name'
       'css-class-name'.capitalize()    => 'Css-class-name'
       'my favorite items'.capitalize() => 'My favorite items'

    @method capitalize
    @param {String} str
    @return {String}
  */
  capitalize: function(str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
  }

};

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/



var fmt = Ember.String.fmt,
    w   = Ember.String.w,
    loc = Ember.String.loc,
    camelize = Ember.String.camelize,
    decamelize = Ember.String.decamelize,
    dasherize = Ember.String.dasherize,
    underscore = Ember.String.underscore,
    capitalize = Ember.String.capitalize,
    classify = Ember.String.classify;

if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.String) {

  /**
    See {{#crossLink "Ember.String/fmt"}}{{/crossLink}}

    @method fmt
    @for String
  */
  String.prototype.fmt = function() {
    return fmt(this, arguments);
  };

  /**
    See {{#crossLink "Ember.String/w"}}{{/crossLink}}

    @method w
    @for String
  */
  String.prototype.w = function() {
    return w(this);
  };

  /**
    See {{#crossLink "Ember.String/loc"}}{{/crossLink}}

    @method loc
    @for String
  */
  String.prototype.loc = function() {
    return loc(this, arguments);
  };

  /**
    See {{#crossLink "Ember.String/camelize"}}{{/crossLink}}

    @method camelize
    @for String
  */
  String.prototype.camelize = function() {
    return camelize(this);
  };

  /**
    See {{#crossLink "Ember.String/decamelize"}}{{/crossLink}}

    @method decamelize
    @for String
  */
  String.prototype.decamelize = function() {
    return decamelize(this);
  };

  /**
    See {{#crossLink "Ember.String/dasherize"}}{{/crossLink}}

    @method dasherize
    @for String
  */
  String.prototype.dasherize = function() {
    return dasherize(this);
  };

  /**
    See {{#crossLink "Ember.String/underscore"}}{{/crossLink}}

    @method underscore
    @for String
  */
  String.prototype.underscore = function() {
    return underscore(this);
  };

  /**
    See {{#crossLink "Ember.String/classify"}}{{/crossLink}}

    @method classify
    @for String
  */
  String.prototype.classify = function() {
    return classify(this);
  };

  /**
    See {{#crossLink "Ember.String/capitalize"}}{{/crossLink}}

    @method capitalize
    @for String
  */
  String.prototype.capitalize = function() {
    return capitalize(this);
  };

}


})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var a_slice = Array.prototype.slice;

if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Function) {

  /**
    The `property` extension of Javascript's Function prototype is available
    when `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Function` is
    `true`, which is the default.

    Computed properties allow you to treat a function like a property:

    ```javascript
    MyApp.president = Ember.Object.create({
      firstName: "Barack",
      lastName: "Obama",

      fullName: function() {
        return this.get('firstName') + ' ' + this.get('lastName');

        // Call this flag to mark the function as a property
      }.property()
    });

    MyApp.president.get('fullName');    // "Barack Obama"
    ```

    Treating a function like a property is useful because they can work with
    bindings, just like any other property.

    Many computed properties have dependencies on other properties. For
    example, in the above example, the `fullName` property depends on
    `firstName` and `lastName` to determine its value. You can tell Ember
    about these dependencies like this:

    ```javascript
    MyApp.president = Ember.Object.create({
      firstName: "Barack",
      lastName: "Obama",

      fullName: function() {
        return this.get('firstName') + ' ' + this.get('lastName');

        // Tell Ember.js that this computed property depends on firstName
        // and lastName
      }.property('firstName', 'lastName')
    });
    ```

    Make sure you list these dependencies so Ember knows when to update
    bindings that connect to a computed property. Changing a dependency
    will not immediately trigger an update of the computed property, but
    will instead clear the cache so that it is updated when the next `get`
    is called on the property.

    See {{#crossLink "Ember.ComputedProperty"}}{{/crossLink}},
      {{#crossLink "Ember/computed"}}{{/crossLink}}

    @method property
    @for Function
  */
  Function.prototype.property = function() {
    var ret = Ember.computed(this);
    return ret.property.apply(ret, arguments);
  };

  /**
    The `observes` extension of Javascript's Function prototype is available
    when `Ember.EXTEND_PROTOTYPES` or `Ember.EXTEND_PROTOTYPES.Function` is
    true, which is the default.

    You can observe property changes simply by adding the `observes`
    call to the end of your method declarations in classes that you write.
    For example:

    ```javascript
    Ember.Object.create({
      valueObserver: function() {
        // Executes whenever the "value" property changes
      }.observes('value')
    });
    ```

    See {{#crossLink "Ember.Observable/observes"}}{{/crossLink}}

    @method observes
    @for Function
  */
  Function.prototype.observes = function() {
    this.__ember_observes__ = a_slice.call(arguments);
    return this;
  };

  /**
    The `observesBefore` extension of Javascript's Function prototype is
    available when `Ember.EXTEND_PROTOTYPES` or
    `Ember.EXTEND_PROTOTYPES.Function` is true, which is the default.

    You can get notified when a property changes is about to happen by
    by adding the `observesBefore` call to the end of your method
    declarations in classes that you write. For example:

    ```javascript
    Ember.Object.create({
      valueObserver: function() {
        // Executes whenever the "value" property is about to change
      }.observesBefore('value')
    });
    ```

    See {{#crossLink "Ember.Observable/observesBefore"}}{{/crossLink}}

    @method observesBefore
    @for Function
  */
  Function.prototype.observesBefore = function() {
    this.__ember_observesBefore__ = a_slice.call(arguments);
    return this;
  };

}


})();



(function() {

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

// ..........................................................
// HELPERS
//

var get = Ember.get, set = Ember.set;
var a_slice = Array.prototype.slice;
var a_indexOf = Ember.EnumerableUtils.indexOf;

var contexts = [];

function popCtx() {
  return contexts.length===0 ? {} : contexts.pop();
}

function pushCtx(ctx) {
  contexts.push(ctx);
  return null;
}

function iter(key, value) {
  var valueProvided = arguments.length === 2;

  function i(item) {
    var cur = get(item, key);
    return valueProvided ? value===cur : !!cur;
  }
  return i ;
}

/**
  This mixin defines the common interface implemented by enumerable objects
  in Ember. Most of these methods follow the standard Array iteration
  API defined up to JavaScript 1.8 (excluding language-specific features that
  cannot be emulated in older versions of JavaScript).

  This mixin is applied automatically to the Array class on page load, so you
  can use any of these methods on simple arrays. If Array already implements
  one of these methods, the mixin will not override them.

  ## Writing Your Own Enumerable

  To make your own custom class enumerable, you need two items:

  1. You must have a length property. This property should change whenever
     the number of items in your enumerable object changes. If you using this
     with an `Ember.Object` subclass, you should be sure to change the length
     property using `set().`

  2. If you must implement `nextObject().` See documentation.

  Once you have these two methods implement, apply the `Ember.Enumerable` mixin
  to your class and you will be able to enumerate the contents of your object
  like any other collection.

  ## Using Ember Enumeration with Other Libraries

  Many other libraries provide some kind of iterator or enumeration like
  facility. This is often where the most common API conflicts occur.
  Ember's API is designed to be as friendly as possible with other
  libraries by implementing only methods that mostly correspond to the
  JavaScript 1.8 API.

  @class Enumerable
  @namespace Ember
  @extends Ember.Mixin
  @since Ember 0.9
*/
Ember.Enumerable = Ember.Mixin.create(
  /** @scope Ember.Enumerable.prototype */ {

  // compatibility
  isEnumerable: true,

  /**
    Implement this method to make your class enumerable.

    This method will be call repeatedly during enumeration. The index value
    will always begin with 0 and increment monotonically. You don't have to
    rely on the index value to determine what object to return, but you should
    always check the value and start from the beginning when you see the
    requested index is 0.

    The `previousObject` is the object that was returned from the last call
    to `nextObject` for the current iteration. This is a useful way to
    manage iteration if you are tracing a linked list, for example.

    Finally the context parameter will always contain a hash you can use as
    a "scratchpad" to maintain any other state you need in order to iterate
    properly. The context object is reused and is not reset between
    iterations so make sure you setup the context with a fresh state whenever
    the index parameter is 0.

    Generally iterators will continue to call `nextObject` until the index
    reaches the your current length-1. If you run out of data before this
    time for some reason, you should simply return undefined.

    The default implementation of this method simply looks up the index.
    This works great on any Array-like objects.

    @method nextObject
    @param {Number} index the current index of the iteration
    @param {Object} previousObject the value returned by the last call to
      `nextObject`.
    @param {Object} context a context object you can use to maintain state.
    @return {Object} the next object in the iteration or undefined
  */
  nextObject: Ember.required(Function),

  /**
    Helper method returns the first object from a collection. This is usually
    used by bindings and other parts of the framework to extract a single
    object if the enumerable contains only one item.

    If you override this method, you should implement it so that it will
    always return the same value each time it is called. If your enumerable
    contains only one object, this method should always return that object.
    If your enumerable is empty, this method should return `undefined`.

    ```javascript
    var arr = ["a", "b", "c"];
    arr.firstObject();  // "a"

    var arr = [];
    arr.firstObject();  // undefined
    ```

    @property firstObject
    @return {Object} the object or undefined
  */
  firstObject: Ember.computed(function() {
    if (get(this, 'length')===0) return undefined ;

    // handle generic enumerables
    var context = popCtx(), ret;
    ret = this.nextObject(0, null, context);
    pushCtx(context);
    return ret ;
  }).property('[]'),

  /**
    Helper method returns the last object from a collection. If your enumerable
    contains only one object, this method should always return that object.
    If your enumerable is empty, this method should return `undefined`.

    ```javascript
    var arr = ["a", "b", "c"];
    arr.lastObject();  // "c"

    var arr = [];
    arr.lastObject();  // undefined
    ```

    @property lastObject
    @return {Object} the last object or undefined
  */
  lastObject: Ember.computed(function() {
    var len = get(this, 'length');
    if (len===0) return undefined ;
    var context = popCtx(), idx=0, cur, last = null;
    do {
      last = cur;
      cur = this.nextObject(idx++, last, context);
    } while (cur !== undefined);
    pushCtx(context);
    return last;
  }).property('[]'),

  /**
    Returns `true` if the passed object can be found in the receiver. The
    default version will iterate through the enumerable until the object
    is found. You may want to override this with a more efficient version.

    ```javascript
    var arr = ["a", "b", "c"];
    arr.contains("a"); // true
    arr.contains("z"); // false
    ```

    @method contains
    @param {Object} obj The object to search for.
    @return {Boolean} `true` if object is found in enumerable.
  */
  contains: function(obj) {
    return this.find(function(item) { return item===obj; }) !== undefined;
  },

  /**
    Iterates through the enumerable, calling the passed function on each
    item. This method corresponds to the `forEach()` method defined in
    JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

    ```javascript
    function(item, index, enumerable);
    ```

    - `item` is the current item in the iteration.
    - `index` is the current index in the iteration.
    - `enumerable` is the enumerable object itself.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as `this` on the context. This is a good way
    to give your iterator function access to the current object.

    @method forEach
    @param {Function} callback The callback to execute
    @param {Object} [target] The target object to use
    @return {Object} receiver
  */
  forEach: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var len = get(this, 'length'), last = null, context = popCtx();

    if (target === undefined) target = null;

    for(var idx=0;idx<len;idx++) {
      var next = this.nextObject(idx, last, context) ;
      callback.call(target, next, idx, this);
      last = next ;
    }
    last = null ;
    context = pushCtx(context);
    return this ;
  },

  /**
    Alias for `mapProperty`

    @method getEach
    @param {String} key name of the property
    @return {Array} The mapped array.
  */
  getEach: function(key) {
    return this.mapProperty(key);
  },

  /**
    Sets the value on the named property for each member. This is more
    efficient than using other methods defined on this helper. If the object
    implements Ember.Observable, the value will be changed to `set(),` otherwise
    it will be set directly. `null` objects are skipped.

    @method setEach
    @param {String} key The key to set
    @param {Object} value The object to set
    @return {Object} receiver
  */
  setEach: function(key, value) {
    return this.forEach(function(item) {
      set(item, key, value);
    });
  },

  /**
    Maps all of the items in the enumeration to another value, returning
    a new array. This method corresponds to `map()` defined in JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

    ```javascript
    function(item, index, enumerable);
    ```

    - `item` is the current item in the iteration.
    - `index` is the current index in the iteration.
    - `enumerable` is the enumerable object itself.

    It should return the mapped value.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as `this` on the context. This is a good way
    to give your iterator function access to the current object.

    @method map
    @param {Function} callback The callback to execute
    @param {Object} [target] The target object to use
    @return {Array} The mapped array.
  */
  map: function(callback, target) {
    var ret = [];
    this.forEach(function(x, idx, i) {
      ret[idx] = callback.call(target, x, idx,i);
    });
    return ret ;
  },

  /**
    Similar to map, this specialized function returns the value of the named
    property on all items in the enumeration.

    @method mapProperty
    @param {String} key name of the property
    @return {Array} The mapped array.
  */
  mapProperty: function(key) {
    return this.map(function(next) {
      return get(next, key);
    });
  },

  /**
    Returns an array with all of the items in the enumeration that the passed
    function returns true for. This method corresponds to `filter()` defined in
    JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

    ```javascript
    function(item, index, enumerable);
    ```

    - `item` is the current item in the iteration.
    - `index` is the current index in the iteration.
    - `enumerable` is the enumerable object itself.

    It should return the `true` to include the item in the results, `false`
    otherwise.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as `this` on the context. This is a good way
    to give your iterator function access to the current object.

    @method filter
    @param {Function} callback The callback to execute
    @param {Object} [target] The target object to use
    @return {Array} A filtered array.
  */
  filter: function(callback, target) {
    var ret = [];
    this.forEach(function(x, idx, i) {
      if (callback.call(target, x, idx, i)) ret.push(x);
    });
    return ret ;
  },

  /**
    Returns an array with all of the items in the enumeration where the passed
    function returns false for. This method is the inverse of filter().

    The callback method you provide should have the following signature (all
    parameters are optional):

          function(item, index, enumerable);

    - *item* is the current item in the iteration.
    - *index* is the current index in the iteration
    - *enumerable* is the enumerable object itself.

    It should return the a falsey value to include the item in the results.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as "this" on the context. This is a good way
    to give your iterator function access to the current object.

    @method reject
    @param {Function} callback The callback to execute
    @param {Object} [target] The target object to use
    @return {Array} A rejected array.
   */
  reject: function(callback, target) {
    return this.filter(function() {
      return !(callback.apply(target, arguments));
    });
  },

  /**
    Returns an array with just the items with the matched property. You
    can pass an optional second argument with the target value. Otherwise
    this will match any property that evaluates to `true`.

    @method filterProperty
    @param {String} key the property to test
    @param {String} [value] optional value to test against.
    @return {Array} filtered array
  */
  filterProperty: function(key, value) {
    return this.filter(iter.apply(this, arguments));
  },

  /**
    Returns an array with the items that do not have truthy values for
    key.  You can pass an optional second argument with the target value.  Otherwise
    this will match any property that evaluates to false.

    @method rejectProperty
    @param {String} key the property to test
    @param {String} [value] optional value to test against.
    @return {Array} rejected array
  */
  rejectProperty: function(key, value) {
    var exactValue = function(item) { return get(item, key) === value; },
        hasValue = function(item) { return !!get(item, key); },
        use = (arguments.length === 2 ? exactValue : hasValue);

    return this.reject(use);
  },

  /**
    Returns the first item in the array for which the callback returns true.
    This method works similar to the `filter()` method defined in JavaScript 1.6
    except that it will stop working on the array once a match is found.

    The callback method you provide should have the following signature (all
    parameters are optional):

    ```javascript
    function(item, index, enumerable);
    ```

    - `item` is the current item in the iteration.
    - `index` is the current index in the iteration.
    - `enumerable` is the enumerable object itself.

    It should return the `true` to include the item in the results, `false`
    otherwise.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as `this` on the context. This is a good way
    to give your iterator function access to the current object.

    @method find
    @param {Function} callback The callback to execute
    @param {Object} [target] The target object to use
    @return {Object} Found item or `undefined`.
  */
  find: function(callback, target) {
    var len = get(this, 'length') ;
    if (target === undefined) target = null;

    var last = null, next, found = false, ret ;
    var context = popCtx();
    for(var idx=0;idx<len && !found;idx++) {
      next = this.nextObject(idx, last, context) ;
      if (found = callback.call(target, next, idx, this)) ret = next ;
      last = next ;
    }
    next = last = null ;
    context = pushCtx(context);
    return ret ;
  },

  /**
    Returns the first item with a property matching the passed value. You
    can pass an optional second argument with the target value. Otherwise
    this will match any property that evaluates to `true`.

    This method works much like the more generic `find()` method.

    @method findProperty
    @param {String} key the property to test
    @param {String} [value] optional value to test against.
    @return {Object} found item or `undefined`
  */
  findProperty: function(key, value) {
    return this.find(iter.apply(this, arguments));
  },

  /**
    Returns `true` if the passed function returns true for every item in the
    enumeration. This corresponds with the `every()` method in JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

    ```javascript
    function(item, index, enumerable);
    ```

    - `item` is the current item in the iteration.
    - `index` is the current index in the iteration.
    - `enumerable` is the enumerable object itself.

    It should return the `true` or `false`.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as `this` on the context. This is a good way
    to give your iterator function access to the current object.

    Example Usage:

    ```javascript
    if (people.every(isEngineer)) { Paychecks.addBigBonus(); }
    ```

    @method every
    @param {Function} callback The callback to execute
    @param {Object} [target] The target object to use
    @return {Boolean}
  */
  every: function(callback, target) {
    return !this.find(function(x, idx, i) {
      return !callback.call(target, x, idx, i);
    });
  },

  /**
    Returns `true` if the passed property resolves to `true` for all items in
    the enumerable. This method is often simpler/faster than using a callback.

    @method everyProperty
    @param {String} key the property to test
    @param {String} [value] optional value to test against.
    @return {Boolean}
  */
  everyProperty: function(key, value) {
    return this.every(iter.apply(this, arguments));
  },


  /**
    Returns `true` if the passed function returns true for any item in the
    enumeration. This corresponds with the `some()` method in JavaScript 1.6.

    The callback method you provide should have the following signature (all
    parameters are optional):

    ```javascript
    function(item, index, enumerable);
    ```

    - `item` is the current item in the iteration.
    - `index` is the current index in the iteration.
    - `enumerable` is the enumerable object itself.

    It should return the `true` to include the item in the results, `false`
    otherwise.

    Note that in addition to a callback, you can also pass an optional target
    object that will be set as `this` on the context. This is a good way
    to give your iterator function access to the current object.

    Usage Example:

    ```javascript
    if (people.some(isManager)) { Paychecks.addBiggerBonus(); }
    ```

    @method some
    @param {Function} callback The callback to execute
    @param {Object} [target] The target object to use
    @return {Array} A filtered array.
  */
  some: function(callback, target) {
    return !!this.find(function(x, idx, i) {
      return !!callback.call(target, x, idx, i);
    });
  },

  /**
    Returns `true` if the passed property resolves to `true` for any item in
    the enumerable. This method is often simpler/faster than using a callback.

    @method someProperty
    @param {String} key the property to test
    @param {String} [value] optional value to test against.
    @return {Boolean} `true`
  */
  someProperty: function(key, value) {
    return this.some(iter.apply(this, arguments));
  },

  /**
    This will combine the values of the enumerator into a single value. It
    is a useful way to collect a summary value from an enumeration. This
    corresponds to the `reduce()` method defined in JavaScript 1.8.

    The callback method you provide should have the following signature (all
    parameters are optional):

    ```javascript
    function(previousValue, item, index, enumerable);
    ```

    - `previousValue` is the value returned by the last call to the iterator.
    - `item` is the current item in the iteration.
    - `index` is the current index in the iteration.
    - `enumerable` is the enumerable object itself.

    Return the new cumulative value.

    In addition to the callback you can also pass an `initialValue`. An error
    will be raised if you do not pass an initial value and the enumerator is
    empty.

    Note that unlike the other methods, this method does not allow you to
    pass a target object to set as this for the callback. It's part of the
    spec. Sorry.

    @method reduce
    @param {Function} callback The callback to execute
    @param {Object} initialValue Initial value for the reduce
    @param {String} reducerProperty internal use only.
    @return {Object} The reduced value.
  */
  reduce: function(callback, initialValue, reducerProperty) {
    if (typeof callback !== "function") { throw new TypeError(); }

    var ret = initialValue;

    this.forEach(function(item, i) {
      ret = callback.call(null, ret, item, i, this, reducerProperty);
    }, this);

    return ret;
  },

  /**
    Invokes the named method on every object in the receiver that
    implements it. This method corresponds to the implementation in
    Prototype 1.6.

    @method invoke
    @param {String} methodName the name of the method
    @param {Object...} args optional arguments to pass as well.
    @return {Array} return values from calling invoke.
  */
  invoke: function(methodName) {
    var args, ret = [];
    if (arguments.length>1) args = a_slice.call(arguments, 1);

    this.forEach(function(x, idx) {
      var method = x && x[methodName];
      if ('function' === typeof method) {
        ret[idx] = args ? method.apply(x, args) : method.call(x);
      }
    }, this);

    return ret;
  },

  /**
    Simply converts the enumerable into a genuine array. The order is not
    guaranteed. Corresponds to the method implemented by Prototype.

    @method toArray
    @return {Array} the enumerable as an array.
  */
  toArray: function() {
    var ret = [];
    this.forEach(function(o, idx) { ret[idx] = o; });
    return ret ;
  },

  /**
    Returns a copy of the array with all null elements removed.

    ```javascript
    var arr = ["a", null, "c", null];
    arr.compact();  // ["a", "c"]
    ```

    @method compact
    @return {Array} the array without null elements.
  */
  compact: function() { return this.without(null); },

  /**
    Returns a new enumerable that excludes the passed value. The default
    implementation returns an array regardless of the receiver type unless
    the receiver does not contain the value.

    ```javascript
    var arr = ["a", "b", "a", "c"];
    arr.without("a");  // ["b", "c"]
    ```

    @method without
    @param {Object} value
    @return {Ember.Enumerable}
  */
  without: function(value) {
    if (!this.contains(value)) return this; // nothing to do
    var ret = [] ;
    this.forEach(function(k) {
      if (k !== value) ret[ret.length] = k;
    }) ;
    return ret ;
  },

  /**
    Returns a new enumerable that contains only unique values. The default
    implementation returns an array regardless of the receiver type.

    ```javascript
    var arr = ["a", "a", "b", "b"];
    arr.uniq();  // ["a", "b"]
    ```

    @method uniq
    @return {Ember.Enumerable}
  */
  uniq: function() {
    var ret = [];
    this.forEach(function(k){
      if (a_indexOf(ret, k)<0) ret.push(k);
    });
    return ret;
  },

  /**
    This property will trigger anytime the enumerable's content changes.
    You can observe this property to be notified of changes to the enumerables
    content.

    For plain enumerables, this property is read only. `Ember.Array` overrides
    this method.

    @property []
    @type Ember.Array
  */
  '[]': Ember.computed(function(key, value) {
    return this;
  }),

  // ..........................................................
  // ENUMERABLE OBSERVERS
  //

  /**
    Registers an enumerable observer. Must implement `Ember.EnumerableObserver`
    mixin.

    @method addEnumerableObserver
    @param target {Object}
    @param opts {Hash}
  */
  addEnumerableObserver: function(target, opts) {
    var willChange = (opts && opts.willChange) || 'enumerableWillChange',
        didChange  = (opts && opts.didChange) || 'enumerableDidChange';

    var hasObservers = get(this, 'hasEnumerableObservers');
    if (!hasObservers) Ember.propertyWillChange(this, 'hasEnumerableObservers');
    Ember.addListener(this, '@enumerable:before', target, willChange);
    Ember.addListener(this, '@enumerable:change', target, didChange);
    if (!hasObservers) Ember.propertyDidChange(this, 'hasEnumerableObservers');
    return this;
  },

  /**
    Removes a registered enumerable observer.

    @method removeEnumerableObserver
    @param target {Object}
    @param [opts] {Hash}
  */
  removeEnumerableObserver: function(target, opts) {
    var willChange = (opts && opts.willChange) || 'enumerableWillChange',
        didChange  = (opts && opts.didChange) || 'enumerableDidChange';

    var hasObservers = get(this, 'hasEnumerableObservers');
    if (hasObservers) Ember.propertyWillChange(this, 'hasEnumerableObservers');
    Ember.removeListener(this, '@enumerable:before', target, willChange);
    Ember.removeListener(this, '@enumerable:change', target, didChange);
    if (hasObservers) Ember.propertyDidChange(this, 'hasEnumerableObservers');
    return this;
  },

  /**
    Becomes true whenever the array currently has observers watching changes
    on the array.

    @property hasEnumerableObservers
    @type Boolean
  */
  hasEnumerableObservers: Ember.computed(function() {
    return Ember.hasListeners(this, '@enumerable:change') || Ember.hasListeners(this, '@enumerable:before');
  }),


  /**
    Invoke this method just before the contents of your enumerable will
    change. You can either omit the parameters completely or pass the objects
    to be removed or added if available or just a count.

    @method enumerableContentWillChange
    @param {Ember.Enumerable|Number} removing An enumerable of the objects to
      be removed or the number of items to be removed.
    @param {Ember.Enumerable|Number} adding An enumerable of the objects to be
      added or the number of items to be added.
    @chainable
  */
  enumerableContentWillChange: function(removing, adding) {

    var removeCnt, addCnt, hasDelta;

    if ('number' === typeof removing) removeCnt = removing;
    else if (removing) removeCnt = get(removing, 'length');
    else removeCnt = removing = -1;

    if ('number' === typeof adding) addCnt = adding;
    else if (adding) addCnt = get(adding,'length');
    else addCnt = adding = -1;

    hasDelta = addCnt<0 || removeCnt<0 || addCnt-removeCnt!==0;

    if (removing === -1) removing = null;
    if (adding   === -1) adding   = null;

    Ember.propertyWillChange(this, '[]');
    if (hasDelta) Ember.propertyWillChange(this, 'length');
    Ember.sendEvent(this, '@enumerable:before', [this, removing, adding]);

    return this;
  },

  /**
    Invoke this method when the contents of your enumerable has changed.
    This will notify any observers watching for content changes. If your are
    implementing an ordered enumerable (such as an array), also pass the
    start and end values where the content changed so that it can be used to
    notify range observers.

    @method enumerableContentDidChange
    @param {Number} [start] optional start offset for the content change.
      For unordered enumerables, you should always pass -1.
    @param {Ember.Enumerable|Number} removing An enumerable of the objects to
      be removed or the number of items to be removed.
    @param {Ember.Enumerable|Number} adding  An enumerable of the objects to
      be added or the number of items to be added.
    @chainable
  */
  enumerableContentDidChange: function(removing, adding) {
    var notify = this.propertyDidChange, removeCnt, addCnt, hasDelta;

    if ('number' === typeof removing) removeCnt = removing;
    else if (removing) removeCnt = get(removing, 'length');
    else removeCnt = removing = -1;

    if ('number' === typeof adding) addCnt = adding;
    else if (adding) addCnt = get(adding, 'length');
    else addCnt = adding = -1;

    hasDelta = addCnt<0 || removeCnt<0 || addCnt-removeCnt!==0;

    if (removing === -1) removing = null;
    if (adding   === -1) adding   = null;

    Ember.sendEvent(this, '@enumerable:change', [this, removing, adding]);
    if (hasDelta) Ember.propertyDidChange(this, 'length');
    Ember.propertyDidChange(this, '[]');

    return this ;
  }

}) ;

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

// ..........................................................
// HELPERS
//

var get = Ember.get, set = Ember.set, meta = Ember.meta, map = Ember.EnumerableUtils.map, cacheFor = Ember.cacheFor;

function none(obj) { return obj===null || obj===undefined; }

// ..........................................................
// ARRAY
//
/**
  This module implements Observer-friendly Array-like behavior. This mixin is
  picked up by the Array class as well as other controllers, etc. that want to
  appear to be arrays.

  Unlike `Ember.Enumerable,` this mixin defines methods specifically for
  collections that provide index-ordered access to their contents. When you
  are designing code that needs to accept any kind of Array-like object, you
  should use these methods instead of Array primitives because these will
  properly notify observers of changes to the array.

  Although these methods are efficient, they do add a layer of indirection to
  your application so it is a good idea to use them only when you need the
  flexibility of using both true JavaScript arrays and "virtual" arrays such
  as controllers and collections.

  You can use the methods defined in this module to access and modify array
  contents in a KVO-friendly way. You can also be notified whenever the
  membership if an array changes by changing the syntax of the property to
  `.observes('*myProperty.[]')`.

  To support `Ember.Array` in your own class, you must override two
  primitives to use it: `replace()` and `objectAt()`.

  Note that the Ember.Array mixin also incorporates the `Ember.Enumerable`
  mixin. All `Ember.Array`-like objects are also enumerable.

  @class Array
  @namespace Ember
  @extends Ember.Mixin
  @uses Ember.Enumerable
  @since Ember 0.9.0
*/
Ember.Array = Ember.Mixin.create(Ember.Enumerable, /** @scope Ember.Array.prototype */ {

  // compatibility
  isSCArray: true,

  /**
    Your array must support the `length` property. Your replace methods should
    set this property whenever it changes.

    @property {Number} length
  */
  length: Ember.required(),

  /**
    Returns the object at the given `index`. If the given `index` is negative
    or is greater or equal than the array length, returns `undefined`.

    This is one of the primitives you must implement to support `Ember.Array`.
    If your object supports retrieving the value of an array item using `get()`
    (i.e. `myArray.get(0)`), then you do not need to implement this method
    yourself.

    ```javascript
    var arr = ['a', 'b', 'c', 'd'];
    arr.objectAt(0);   // "a"
    arr.objectAt(3);   // "d"
    arr.objectAt(-1);  // undefined
    arr.objectAt(4);   // undefined
    arr.objectAt(5);   // undefined
    ```

    @method objectAt
    @param {Number} idx The index of the item to return.
  */
  objectAt: function(idx) {
    if ((idx < 0) || (idx>=get(this, 'length'))) return undefined ;
    return get(this, idx);
  },

  /**
    This returns the objects at the specified indexes, using `objectAt`.

    ```javascript
    var arr = ['a', 'b', 'c', 'd'];
    arr.objectsAt([0, 1, 2]);  // ["a", "b", "c"]
    arr.objectsAt([2, 3, 4]);  // ["c", "d", undefined]
    ```

    @method objectsAt
    @param {Array} indexes An array of indexes of items to return.
   */
  objectsAt: function(indexes) {
    var self = this;
    return map(indexes, function(idx){ return self.objectAt(idx); });
  },

  // overrides Ember.Enumerable version
  nextObject: function(idx) {
    return this.objectAt(idx);
  },

  /**
    This is the handler for the special array content property. If you get
    this property, it will return this. If you set this property it a new
    array, it will replace the current content.

    This property overrides the default property defined in `Ember.Enumerable`.

    @property []
  */
  '[]': Ember.computed(function(key, value) {
    if (value !== undefined) this.replace(0, get(this, 'length'), value) ;
    return this ;
  }),

  firstObject: Ember.computed(function() {
    return this.objectAt(0);
  }),

  lastObject: Ember.computed(function() {
    return this.objectAt(get(this, 'length')-1);
  }),

  // optimized version from Enumerable
  contains: function(obj){
    return this.indexOf(obj) >= 0;
  },

  // Add any extra methods to Ember.Array that are native to the built-in Array.
  /**
    Returns a new array that is a slice of the receiver. This implementation
    uses the observable array methods to retrieve the objects for the new
    slice.

    ```javascript
    var arr = ['red', 'green', 'blue'];
    arr.slice(0);       // ['red', 'green', 'blue']
    arr.slice(0, 2);    // ['red', 'green']
    arr.slice(1, 100);  // ['green', 'blue']
    ```

    @method slice
    @param beginIndex {Integer} (Optional) index to begin slicing from.
    @param endIndex {Integer} (Optional) index to end the slice at.
    @return {Array} New array with specified slice
  */
  slice: function(beginIndex, endIndex) {
    var ret = [];
    var length = get(this, 'length') ;
    if (none(beginIndex)) beginIndex = 0 ;
    if (none(endIndex) || (endIndex > length)) endIndex = length ;
    while(beginIndex < endIndex) {
      ret[ret.length] = this.objectAt(beginIndex++) ;
    }
    return ret ;
  },

  /**
    Returns the index of the given object's first occurrence.
    If no `startAt` argument is given, the starting location to
    search is 0. If it's negative, will count backward from
    the end of the array. Returns -1 if no match is found.

    ```javascript
    var arr = ["a", "b", "c", "d", "a"];
    arr.indexOf("a");       //  0
    arr.indexOf("z");       // -1
    arr.indexOf("a", 2);    //  4
    arr.indexOf("a", -1);   //  4
    arr.indexOf("b", 3);    // -1
    arr.indexOf("a", 100);  // -1
    ```

    @method indexOf
    @param {Object} object the item to search for
    @param {Number} startAt optional starting location to search, default 0
    @return {Number} index or -1 if not found
  */
  indexOf: function(object, startAt) {
    var idx, len = get(this, 'length');

    if (startAt === undefined) startAt = 0;
    if (startAt < 0) startAt += len;

    for(idx=startAt;idx<len;idx++) {
      if (this.objectAt(idx, true) === object) return idx ;
    }
    return -1;
  },

  /**
    Returns the index of the given object's last occurrence.
    If no `startAt` argument is given, the search starts from
    the last position. If it's negative, will count backward
    from the end of the array. Returns -1 if no match is found.

    ```javascript
    var arr = ["a", "b", "c", "d", "a"];
    arr.lastIndexOf("a");       //  4
    arr.lastIndexOf("z");       // -1
    arr.lastIndexOf("a", 2);    //  0
    arr.lastIndexOf("a", -1);   //  4
    arr.lastIndexOf("b", 3);    //  1
    arr.lastIndexOf("a", 100);  //  4
    ```

    @method lastIndexOf
    @param {Object} object the item to search for
    @param {Number} startAt optional starting location to search, default 0
    @return {Number} index or -1 if not found
  */
  lastIndexOf: function(object, startAt) {
    var idx, len = get(this, 'length');

    if (startAt === undefined || startAt >= len) startAt = len-1;
    if (startAt < 0) startAt += len;

    for(idx=startAt;idx>=0;idx--) {
      if (this.objectAt(idx) === object) return idx ;
    }
    return -1;
  },

  // ..........................................................
  // ARRAY OBSERVERS
  //

  /**
    Adds an array observer to the receiving array. The array observer object
    normally must implement two methods:

    * `arrayWillChange(start, removeCount, addCount)` - This method will be
      called just before the array is modified.
    * `arrayDidChange(start, removeCount, addCount)` - This method will be
      called just after the array is modified.

    Both callbacks will be passed the starting index of the change as well a
    a count of the items to be removed and added. You can use these callbacks
    to optionally inspect the array during the change, clear caches, or do
    any other bookkeeping necessary.

    In addition to passing a target, you can also include an options hash
    which you can use to override the method names that will be invoked on the
    target.

    @method addArrayObserver
    @param {Object} target The observer object.
    @param {Hash} opts Optional hash of configuration options including
      `willChange`, `didChange`, and a `context` option.
    @return {Ember.Array} receiver
  */
  addArrayObserver: function(target, opts) {
    var willChange = (opts && opts.willChange) || 'arrayWillChange',
        didChange  = (opts && opts.didChange) || 'arrayDidChange';

    var hasObservers = get(this, 'hasArrayObservers');
    if (!hasObservers) Ember.propertyWillChange(this, 'hasArrayObservers');
    Ember.addListener(this, '@array:before', target, willChange);
    Ember.addListener(this, '@array:change', target, didChange);
    if (!hasObservers) Ember.propertyDidChange(this, 'hasArrayObservers');
    return this;
  },

  /**
    Removes an array observer from the object if the observer is current
    registered. Calling this method multiple times with the same object will
    have no effect.

    @method removeArrayObserver
    @param {Object} target The object observing the array.
    @return {Ember.Array} receiver
  */
  removeArrayObserver: function(target, opts) {
    var willChange = (opts && opts.willChange) || 'arrayWillChange',
        didChange  = (opts && opts.didChange) || 'arrayDidChange';

    var hasObservers = get(this, 'hasArrayObservers');
    if (hasObservers) Ember.propertyWillChange(this, 'hasArrayObservers');
    Ember.removeListener(this, '@array:before', target, willChange);
    Ember.removeListener(this, '@array:change', target, didChange);
    if (hasObservers) Ember.propertyDidChange(this, 'hasArrayObservers');
    return this;
  },

  /**
    Becomes true whenever the array currently has observers watching changes
    on the array.

    @property Boolean
  */
  hasArrayObservers: Ember.computed(function() {
    return Ember.hasListeners(this, '@array:change') || Ember.hasListeners(this, '@array:before');
  }),

  /**
    If you are implementing an object that supports `Ember.Array`, call this
    method just before the array content changes to notify any observers and
    invalidate any related properties. Pass the starting index of the change
    as well as a delta of the amounts to change.

    @method arrayContentWillChange
    @param {Number} startIdx The starting index in the array that will change.
    @param {Number} removeAmt The number of items that will be removed. If you
      pass `null` assumes 0
    @param {Number} addAmt The number of items that will be added  If you
      pass `null` assumes 0.
    @return {Ember.Array} receiver
  */
  arrayContentWillChange: function(startIdx, removeAmt, addAmt) {

    // if no args are passed assume everything changes
    if (startIdx===undefined) {
      startIdx = 0;
      removeAmt = addAmt = -1;
    } else {
      if (removeAmt === undefined) removeAmt=-1;
      if (addAmt    === undefined) addAmt=-1;
    }

    // Make sure the @each proxy is set up if anyone is observing @each
    if (Ember.isWatching(this, '@each')) { get(this, '@each'); }

    Ember.sendEvent(this, '@array:before', [this, startIdx, removeAmt, addAmt]);

    var removing, lim;
    if (startIdx>=0 && removeAmt>=0 && get(this, 'hasEnumerableObservers')) {
      removing = [];
      lim = startIdx+removeAmt;
      for(var idx=startIdx;idx<lim;idx++) removing.push(this.objectAt(idx));
    } else {
      removing = removeAmt;
    }

    this.enumerableContentWillChange(removing, addAmt);

    return this;
  },

  arrayContentDidChange: function(startIdx, removeAmt, addAmt) {

    // if no args are passed assume everything changes
    if (startIdx===undefined) {
      startIdx = 0;
      removeAmt = addAmt = -1;
    } else {
      if (removeAmt === undefined) removeAmt=-1;
      if (addAmt    === undefined) addAmt=-1;
    }

    var adding, lim;
    if (startIdx>=0 && addAmt>=0 && get(this, 'hasEnumerableObservers')) {
      adding = [];
      lim = startIdx+addAmt;
      for(var idx=startIdx;idx<lim;idx++) adding.push(this.objectAt(idx));
    } else {
      adding = addAmt;
    }

    this.enumerableContentDidChange(removeAmt, adding);
    Ember.sendEvent(this, '@array:change', [this, startIdx, removeAmt, addAmt]);

    var length      = get(this, 'length'),
        cachedFirst = cacheFor(this, 'firstObject'),
        cachedLast  = cacheFor(this, 'lastObject');
    if (this.objectAt(0) !== cachedFirst) {
      Ember.propertyWillChange(this, 'firstObject');
      Ember.propertyDidChange(this, 'firstObject');
    }
    if (this.objectAt(length-1) !== cachedLast) {
      Ember.propertyWillChange(this, 'lastObject');
      Ember.propertyDidChange(this, 'lastObject');
    }

    return this;
  },

  // ..........................................................
  // ENUMERATED PROPERTIES
  //

  /**
    Returns a special object that can be used to observe individual properties
    on the array. Just get an equivalent property on this object and it will
    return an enumerable that maps automatically to the named key on the
    member objects.

    @property @each
  */
  '@each': Ember.computed(function() {
    if (!this.__each) this.__each = new Ember.EachProxy(this);
    return this.__each;
  })

}) ;

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/


/**
  Implements some standard methods for comparing objects. Add this mixin to
  any class you create that can compare its instances.

  You should implement the `compare()` method.

  @class Comparable
  @namespace Ember
  @extends Ember.Mixin
  @since Ember 0.9
*/
Ember.Comparable = Ember.Mixin.create( /** @scope Ember.Comparable.prototype */{

  /**
    walk like a duck. Indicates that the object can be compared.

    @property isComparable
    @type Boolean
    @default true
  */
  isComparable: true,

  /**
    Override to return the result of the comparison of the two parameters. The
    compare method should return:

    - `-1` if `a < b`
    - `0` if `a == b`
    - `1` if `a > b`

    Default implementation raises an exception.

    @method compare
    @param a {Object} the first object to compare
    @param b {Object} the second object to compare
    @return {Integer} the result of the comparison
  */
  compare: Ember.required(Function)

});


})();



(function() {
/**
@module ember
@submodule ember-runtime
*/



var get = Ember.get, set = Ember.set;

/**
  Implements some standard methods for copying an object. Add this mixin to
  any object you create that can create a copy of itself. This mixin is
  added automatically to the built-in array.

  You should generally implement the `copy()` method to return a copy of the
  receiver.

  Note that `frozenCopy()` will only work if you also implement
  `Ember.Freezable`.

  @class Copyable
  @namespace Ember
  @extends Ember.Mixin
  @since Ember 0.9
*/
Ember.Copyable = Ember.Mixin.create(
/** @scope Ember.Copyable.prototype */ {

  /**
    Override to return a copy of the receiver. Default implementation raises
    an exception.

    @method copy
    @param deep {Boolean} if `true`, a deep copy of the object should be made
    @return {Object} copy of receiver
  */
  copy: Ember.required(Function),

  /**
    If the object implements `Ember.Freezable`, then this will return a new
    copy if the object is not frozen and the receiver if the object is frozen.

    Raises an exception if you try to call this method on a object that does
    not support freezing.

    You should use this method whenever you want a copy of a freezable object
    since a freezable object can simply return itself without actually
    consuming more memory.

    @method frozenCopy
    @return {Object} copy of receiver or receiver
  */
  frozenCopy: function() {
    if (Ember.Freezable && Ember.Freezable.detect(this)) {
      return get(this, 'isFrozen') ? this : this.copy().freeze();
    } else {
      throw new Error(Ember.String.fmt("%@ does not support freezing", [this]));
    }
  }
});

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/


var get = Ember.get, set = Ember.set;

/**
  The `Ember.Freezable` mixin implements some basic methods for marking an
  object as frozen. Once an object is frozen it should be read only. No changes
  may be made the internal state of the object.

  ## Enforcement

  To fully support freezing in your subclass, you must include this mixin and
  override any method that might alter any property on the object to instead
  raise an exception. You can check the state of an object by checking the
  `isFrozen` property.

  Although future versions of JavaScript may support language-level freezing
  object objects, that is not the case today. Even if an object is freezable,
  it is still technically possible to modify the object, even though it could
  break other parts of your application that do not expect a frozen object to
  change. It is, therefore, very important that you always respect the
  `isFrozen` property on all freezable objects.

  ## Example Usage

  The example below shows a simple object that implement the `Ember.Freezable`
  protocol.

  ```javascript
  Contact = Ember.Object.extend(Ember.Freezable, {
    firstName: null,
    lastName: null,

    // swaps the names
    swapNames: function() {
      if (this.get('isFrozen')) throw Ember.FROZEN_ERROR;
      var tmp = this.get('firstName');
      this.set('firstName', this.get('lastName'));
      this.set('lastName', tmp);
      return this;
    }

  });

  c = Context.create({ firstName: "John", lastName: "Doe" });
  c.swapNames();  // returns c
  c.freeze();
  c.swapNames();  // EXCEPTION
  ```

  ## Copying

  Usually the `Ember.Freezable` protocol is implemented in cooperation with the
  `Ember.Copyable` protocol, which defines a `frozenCopy()` method that will
  return a frozen object, if the object implements this method as well.

  @class Freezable
  @namespace Ember
  @extends Ember.Mixin
  @since Ember 0.9
*/
Ember.Freezable = Ember.Mixin.create(
/** @scope Ember.Freezable.prototype */ {

  /**
    Set to `true` when the object is frozen. Use this property to detect
    whether your object is frozen or not.

    @property isFrozen
    @type Boolean
  */
  isFrozen: false,

  /**
    Freezes the object. Once this method has been called the object should
    no longer allow any properties to be edited.

    @method freeze
    @return {Object} receiver
  */
  freeze: function() {
    if (get(this, 'isFrozen')) return this;
    set(this, 'isFrozen', true);
    return this;
  }

});

Ember.FROZEN_ERROR = "Frozen object cannot be modified.";

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var forEach = Ember.EnumerableUtils.forEach;

/**
  This mixin defines the API for modifying generic enumerables. These methods
  can be applied to an object regardless of whether it is ordered or
  unordered.

  Note that an Enumerable can change even if it does not implement this mixin.
  For example, a MappedEnumerable cannot be directly modified but if its
  underlying enumerable changes, it will change also.

  ## Adding Objects

  To add an object to an enumerable, use the `addObject()` method. This
  method will only add the object to the enumerable if the object is not
  already present and the object if of a type supported by the enumerable.

  ```javascript
  set.addObject(contact);
  ```

  ## Removing Objects

  To remove an object form an enumerable, use the `removeObject()` method. This
  will only remove the object if it is already in the enumerable, otherwise
  this method has no effect.

  ```javascript
  set.removeObject(contact);
  ```

  ## Implementing In Your Own Code

  If you are implementing an object and want to support this API, just include
  this mixin in your class and implement the required methods. In your unit
  tests, be sure to apply the Ember.MutableEnumerableTests to your object.

  @class MutableEnumerable
  @namespace Ember
  @extends Ember.Mixin
  @uses Ember.Enumerable
*/
Ember.MutableEnumerable = Ember.Mixin.create(Ember.Enumerable,
  /** @scope Ember.MutableEnumerable.prototype */ {

  /**
    __Required.__ You must implement this method to apply this mixin.

    Attempts to add the passed object to the receiver if the object is not
    already present in the collection. If the object is present, this method
    has no effect.

    If the passed object is of a type not supported by the receiver
    then this method should raise an exception.

    @method addObject
    @param {Object} object The object to add to the enumerable.
    @return {Object} the passed object
  */
  addObject: Ember.required(Function),

  /**
    Adds each object in the passed enumerable to the receiver.

    @method addObjects
    @param {Ember.Enumerable} objects the objects to add.
    @return {Object} receiver
  */
  addObjects: function(objects) {
    Ember.beginPropertyChanges(this);
    forEach(objects, function(obj) { this.addObject(obj); }, this);
    Ember.endPropertyChanges(this);
    return this;
  },

  /**
    __Required.__ You must implement this method to apply this mixin.

    Attempts to remove the passed object from the receiver collection if the
    object is in present in the collection. If the object is not present,
    this method has no effect.

    If the passed object is of a type not supported by the receiver
    then this method should raise an exception.

    @method removeObject
    @param {Object} object The object to remove from the enumerable.
    @return {Object} the passed object
  */
  removeObject: Ember.required(Function),


  /**
    Removes each objects in the passed enumerable from the receiver.

    @method removeObjects
    @param {Ember.Enumerable} objects the objects to remove
    @return {Object} receiver
  */
  removeObjects: function(objects) {
    Ember.beginPropertyChanges(this);
    forEach(objects, function(obj) { this.removeObject(obj); }, this);
    Ember.endPropertyChanges(this);
    return this;
  }

});

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/
// ..........................................................
// CONSTANTS
//

var OUT_OF_RANGE_EXCEPTION = "Index out of range" ;
var EMPTY = [];

// ..........................................................
// HELPERS
//

var get = Ember.get, set = Ember.set, forEach = Ember.EnumerableUtils.forEach;

/**
  This mixin defines the API for modifying array-like objects. These methods
  can be applied only to a collection that keeps its items in an ordered set.

  Note that an Array can change even if it does not implement this mixin.
  For example, one might implement a SparseArray that cannot be directly
  modified, but if its underlying enumerable changes, it will change also.

  @class MutableArray
  @namespace Ember
  @extends Ember.Mixin
  @uses Ember.Array
  @uses Ember.MutableEnumerable
*/
Ember.MutableArray = Ember.Mixin.create(Ember.Array, Ember.MutableEnumerable,
  /** @scope Ember.MutableArray.prototype */ {

  /**
    __Required.__ You must implement this method to apply this mixin.

    This is one of the primitives you must implement to support `Ember.Array`.
    You should replace amt objects started at idx with the objects in the
    passed array. You should also call `this.enumerableContentDidChange()`

    @method replace
    @param {Number} idx Starting index in the array to replace. If
      idx >= length, then append to the end of the array.
    @param {Number} amt Number of elements that should be removed from
      the array, starting at *idx*.
    @param {Array} objects An array of zero or more objects that should be
      inserted into the array at *idx*
  */
  replace: Ember.required(),

  /**
    Remove all elements from self. This is useful if you
    want to reuse an existing array without having to recreate it.

    ```javascript
    var colors = ["red", "green", "blue"];
    color.length();   //  3
    colors.clear();   //  []
    colors.length();  //  0
    ```

    @method clear
    @return {Ember.Array} An empty Array.
  */
  clear: function () {
    var len = get(this, 'length');
    if (len === 0) return this;
    this.replace(0, len, EMPTY);
    return this;
  },

  /**
    This will use the primitive `replace()` method to insert an object at the
    specified index.

    ```javascript
    var colors = ["red", "green", "blue"];
    colors.insertAt(2, "yellow");  // ["red", "green", "yellow", "blue"]
    colors.insertAt(5, "orange");  // Error: Index out of range
    ```

    @method insertAt
    @param {Number} idx index of insert the object at.
    @param {Object} object object to insert
  */
  insertAt: function(idx, object) {
    if (idx > get(this, 'length')) throw new Error(OUT_OF_RANGE_EXCEPTION) ;
    this.replace(idx, 0, [object]) ;
    return this ;
  },

  /**
    Remove an object at the specified index using the `replace()` primitive
    method. You can pass either a single index, or a start and a length.

    If you pass a start and length that is beyond the
    length this method will throw an `Ember.OUT_OF_RANGE_EXCEPTION`

    ```javascript
    var colors = ["red", "green", "blue", "yellow", "orange"];
    colors.removeAt(0);     // ["green", "blue", "yellow", "orange"]
    colors.removeAt(2, 2);  // ["green", "blue"]
    colors.removeAt(4, 2);  // Error: Index out of range
    ```

    @method removeAt
    @param {Number} start index, start of range
    @param {Number} len length of passing range
    @return {Object} receiver
  */
  removeAt: function(start, len) {
    if ('number' === typeof start) {

      if ((start < 0) || (start >= get(this, 'length'))) {
        throw new Error(OUT_OF_RANGE_EXCEPTION);
      }

      // fast case
      if (len === undefined) len = 1;
      this.replace(start, len, EMPTY);
    }

    return this ;
  },

  /**
    Push the object onto the end of the array. Works just like `push()` but it
    is KVO-compliant.

    ```javascript
    var colors = ["red", "green", "blue"];
    colors.pushObject("black");               // ["red", "green", "blue", "black"]
    colors.pushObject(["yellow", "orange"]);  // ["red", "green", "blue", "black", ["yellow", "orange"]]
    ```

    @method pushObject
    @param {anything} obj object to push
  */
  pushObject: function(obj) {
    this.insertAt(get(this, 'length'), obj) ;
    return obj ;
  },

  /**
    Add the objects in the passed numerable to the end of the array. Defers
    notifying observers of the change until all objects are added.

    ```javascript
    var colors = ["red", "green", "blue"];
    colors.pushObjects("black");               // ["red", "green", "blue", "black"]
    colors.pushObjects(["yellow", "orange"]);  // ["red", "green", "blue", "black", "yellow", "orange"]
    ```

    @method pushObjects
    @param {Ember.Enumerable} objects the objects to add
    @return {Ember.Array} receiver
  */
  pushObjects: function(objects) {
    this.replace(get(this, 'length'), 0, objects);
    return this;
  },

  /**
    Pop object from array or nil if none are left. Works just like `pop()` but
    it is KVO-compliant.

    ```javascript
    var colors = ["red", "green", "blue"];
    colors.popObject();   // "blue"
    console.log(colors);  // ["red", "green"]
    ```

    @method popObject
    @return object
  */
  popObject: function() {
    var len = get(this, 'length') ;
    if (len === 0) return null ;

    var ret = this.objectAt(len-1) ;
    this.removeAt(len-1, 1) ;
    return ret ;
  },

  /**
    Shift an object from start of array or nil if none are left. Works just
    like `shift()` but it is KVO-compliant.

    ```javascript
    var colors = ["red", "green", "blue"];
    colors.shiftObject();  // "red"
    console.log(colors);   // ["green", "blue"]
    ```

    @method shiftObject
    @return object
  */
  shiftObject: function() {
    if (get(this, 'length') === 0) return null ;
    var ret = this.objectAt(0) ;
    this.removeAt(0) ;
    return ret ;
  },

  /**
    Unshift an object to start of array. Works just like `unshift()` but it is
    KVO-compliant.

    ```javascript
    var colors = ["red", "green", "blue"];
    colors.unshiftObject("yellow");             // ["yellow", "red", "green", "blue"]
    colors.unshiftObject(["black", "white"]);   // [["black", "white"], "yellow", "red", "green", "blue"]
    ```

    @method unshiftObject
    @param {anything} obj object to unshift
  */
  unshiftObject: function(obj) {
    this.insertAt(0, obj) ;
    return obj ;
  },

  /**
    Adds the named objects to the beginning of the array. Defers notifying
    observers until all objects have been added.

    ```javascript
    var colors = ["red", "green", "blue"];
    colors.unshiftObjects(["black", "white"]);   // ["black", "white", "red", "green", "blue"]
    colors.unshiftObjects("yellow");             // Type Error: 'undefined' is not a function
    ```

    @method unshiftObjects
    @param {Ember.Enumerable} objects the objects to add
    @return {Ember.Array} receiver
  */
  unshiftObjects: function(objects) {
    this.replace(0, 0, objects);
    return this;
  },

  /**
    Reverse objects in the array. Works just like `reverse()` but it is
    KVO-compliant.

    @method reverseObjects
    @return {Ember.Array} receiver
   */
  reverseObjects: function() {
    var len = get(this, 'length');
    if (len === 0) return this;
    var objects = this.toArray().reverse();
    this.replace(0, len, objects);
    return this;
  },

  /**
    Replace all the the receiver's content with content of the argument.
    If argument is an empty array receiver will be cleared.

    ```javascript
    var colors = ["red", "green", "blue"];
    colors.setObjects(["black", "white"]);  // ["black", "white"]
    colors.setObjects([]);                  // []
    ```

    @method setObjects
    @param {Ember.Array} objects array whose content will be used for replacing
        the content of the receiver
    @return {Ember.Array} receiver with the new content
   */
  setObjects: function(objects) {
    if (objects.length === 0) return this.clear();

    var len = get(this, 'length');
    this.replace(0, len, objects);
    return this;
  },

  // ..........................................................
  // IMPLEMENT Ember.MutableEnumerable
  //

  removeObject: function(obj) {
    var loc = get(this, 'length') || 0;
    while(--loc >= 0) {
      var curObject = this.objectAt(loc) ;
      if (curObject === obj) this.removeAt(loc) ;
    }
    return this ;
  },

  addObject: function(obj) {
    if (!this.contains(obj)) this.pushObject(obj);
    return this ;
  }

});


})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var get = Ember.get, set = Ember.set, defineProperty = Ember.defineProperty;

/**
  ## Overview

  This mixin provides properties and property observing functionality, core
  features of the Ember object model.

  Properties and observers allow one object to observe changes to a
  property on another object. This is one of the fundamental ways that
  models, controllers and views communicate with each other in an Ember
  application.

  Any object that has this mixin applied can be used in observer
  operations. That includes `Ember.Object` and most objects you will
  interact with as you write your Ember application.

  Note that you will not generally apply this mixin to classes yourself,
  but you will use the features provided by this module frequently, so it
  is important to understand how to use it.

  ## Using `get()` and `set()`

  Because of Ember's support for bindings and observers, you will always
  access properties using the get method, and set properties using the
  set method. This allows the observing objects to be notified and
  computed properties to be handled properly.

  More documentation about `get` and `set` are below.

  ## Observing Property Changes

  You typically observe property changes simply by adding the `observes`
  call to the end of your method declarations in classes that you write.
  For example:

  ```javascript
  Ember.Object.create({
    valueObserver: function() {
      // Executes whenever the "value" property changes
    }.observes('value')
  });
  ```

  Although this is the most common way to add an observer, this capability
  is actually built into the `Ember.Object` class on top of two methods
  defined in this mixin: `addObserver` and `removeObserver`. You can use
  these two methods to add and remove observers yourself if you need to
  do so at runtime.

  To add an observer for a property, call:

  ```javascript
  object.addObserver('propertyKey', targetObject, targetAction)
  ```

  This will call the `targetAction` method on the `targetObject` to be called
  whenever the value of the `propertyKey` changes.

  Note that if `propertyKey` is a computed property, the observer will be
  called when any of the property dependencies are changed, even if the
  resulting value of the computed property is unchanged. This is necessary
  because computed properties are not computed until `get` is called.

  @class Observable
  @namespace Ember
  @extends Ember.Mixin
*/
Ember.Observable = Ember.Mixin.create(/** @scope Ember.Observable.prototype */ {

  /**
    Retrieves the value of a property from the object.

    This method is usually similar to using `object[keyName]` or `object.keyName`,
    however it supports both computed properties and the unknownProperty
    handler.

    Because `get` unifies the syntax for accessing all these kinds
    of properties, it can make many refactorings easier, such as replacing a
    simple property with a computed property, or vice versa.

    ### Computed Properties

    Computed properties are methods defined with the `property` modifier
    declared at the end, such as:

    ```javascript
    fullName: function() {
      return this.getEach('firstName', 'lastName').compact().join(' ');
    }.property('firstName', 'lastName')
    ```

    When you call `get` on a computed property, the function will be
    called and the return value will be returned instead of the function
    itself.

    ### Unknown Properties

    Likewise, if you try to call `get` on a property whose value is
    `undefined`, the `unknownProperty()` method will be called on the object.
    If this method returns any value other than `undefined`, it will be returned
    instead. This allows you to implement "virtual" properties that are
    not defined upfront.

    @method get
    @param {String} key The property to retrieve
    @return {Object} The property value or undefined.
  */
  get: function(keyName) {
    return get(this, keyName);
  },

  /**
    To get multiple properties at once, call `getProperties`
    with a list of strings or an array:

    ```javascript
    record.getProperties('firstName', 'lastName', 'zipCode');  // { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
    ```

    is equivalent to:

    ```javascript
    record.getProperties(['firstName', 'lastName', 'zipCode']);  // { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
    ```

    @method getProperties
    @param {String...|Array} list of keys to get
    @return {Hash}
  */
  getProperties: function() {
    var ret = {};
    var propertyNames = arguments;
    if (arguments.length === 1 && Ember.typeOf(arguments[0]) === 'array') {
      propertyNames = arguments[0];
    }
    for(var i = 0; i < propertyNames.length; i++) {
      ret[propertyNames[i]] = get(this, propertyNames[i]);
    }
    return ret;
  },

  /**
    Sets the provided key or path to the value.

    This method is generally very similar to calling `object[key] = value` or
    `object.key = value`, except that it provides support for computed
    properties, the `unknownProperty()` method and property observers.

    ### Computed Properties

    If you try to set a value on a key that has a computed property handler
    defined (see the `get()` method for an example), then `set()` will call
    that method, passing both the value and key instead of simply changing
    the value itself. This is useful for those times when you need to
    implement a property that is composed of one or more member
    properties.

    ### Unknown Properties

    If you try to set a value on a key that is undefined in the target
    object, then the `unknownProperty()` handler will be called instead. This
    gives you an opportunity to implement complex "virtual" properties that
    are not predefined on the object. If `unknownProperty()` returns
    undefined, then `set()` will simply set the value on the object.

    ### Property Observers

    In addition to changing the property, `set()` will also register a property
    change with the object. Unless you have placed this call inside of a
    `beginPropertyChanges()` and `endPropertyChanges(),` any "local" observers
    (i.e. observer methods declared on the same object), will be called
    immediately. Any "remote" observers (i.e. observer methods declared on
    another object) will be placed in a queue and called at a later time in a
    coalesced manner.

    ### Chaining

    In addition to property changes, `set()` returns the value of the object
    itself so you can do chaining like this:

    ```javascript
    record.set('firstName', 'Charles').set('lastName', 'Jolley');
    ```

    @method set
    @param {String} key The property to set
    @param {Object} value The value to set or `null`.
    @return {Ember.Observable}
  */
  set: function(keyName, value) {
    set(this, keyName, value);
    return this;
  },

  /**
    To set multiple properties at once, call `setProperties`
    with a Hash:

    ```javascript
    record.setProperties({ firstName: 'Charles', lastName: 'Jolley' });
    ```

    @method setProperties
    @param {Hash} hash the hash of keys and values to set
    @return {Ember.Observable}
  */
  setProperties: function(hash) {
    return Ember.setProperties(this, hash);
  },

  /**
    Begins a grouping of property changes.

    You can use this method to group property changes so that notifications
    will not be sent until the changes are finished. If you plan to make a
    large number of changes to an object at one time, you should call this
    method at the beginning of the changes to begin deferring change
    notifications. When you are done making changes, call
    `endPropertyChanges()` to deliver the deferred change notifications and end
    deferring.

    @method beginPropertyChanges
    @return {Ember.Observable}
  */
  beginPropertyChanges: function() {
    Ember.beginPropertyChanges();
    return this;
  },

  /**
    Ends a grouping of property changes.

    You can use this method to group property changes so that notifications
    will not be sent until the changes are finished. If you plan to make a
    large number of changes to an object at one time, you should call
    `beginPropertyChanges()` at the beginning of the changes to defer change
    notifications. When you are done making changes, call this method to
    deliver the deferred change notifications and end deferring.

    @method endPropertyChanges
    @return {Ember.Observable}
  */
  endPropertyChanges: function() {
    Ember.endPropertyChanges();
    return this;
  },

  /**
    Notify the observer system that a property is about to change.

    Sometimes you need to change a value directly or indirectly without
    actually calling `get()` or `set()` on it. In this case, you can use this
    method and `propertyDidChange()` instead. Calling these two methods
    together will notify all observers that the property has potentially
    changed value.

    Note that you must always call `propertyWillChange` and `propertyDidChange`
    as a pair. If you do not, it may get the property change groups out of
    order and cause notifications to be delivered more often than you would
    like.

    @method propertyWillChange
    @param {String} key The property key that is about to change.
    @return {Ember.Observable}
  */
  propertyWillChange: function(keyName){
    Ember.propertyWillChange(this, keyName);
    return this;
  },

  /**
    Notify the observer system that a property has just changed.

    Sometimes you need to change a value directly or indirectly without
    actually calling `get()` or `set()` on it. In this case, you can use this
    method and `propertyWillChange()` instead. Calling these two methods
    together will notify all observers that the property has potentially
    changed value.

    Note that you must always call `propertyWillChange` and `propertyDidChange`
    as a pair. If you do not, it may get the property change groups out of
    order and cause notifications to be delivered more often than you would
    like.

    @method propertyDidChange
    @param {String} keyName The property key that has just changed.
    @return {Ember.Observable}
  */
  propertyDidChange: function(keyName) {
    Ember.propertyDidChange(this, keyName);
    return this;
  },

  /**
    Convenience method to call `propertyWillChange` and `propertyDidChange` in
    succession.

    @method notifyPropertyChange
    @param {String} keyName The property key to be notified about.
    @return {Ember.Observable}
  */
  notifyPropertyChange: function(keyName) {
    this.propertyWillChange(keyName);
    this.propertyDidChange(keyName);
    return this;
  },

  addBeforeObserver: function(key, target, method) {
    Ember.addBeforeObserver(this, key, target, method);
  },

  /**
    Adds an observer on a property.

    This is the core method used to register an observer for a property.

    Once you call this method, anytime the key's value is set, your observer
    will be notified. Note that the observers are triggered anytime the
    value is set, regardless of whether it has actually changed. Your
    observer should be prepared to handle that.

    You can also pass an optional context parameter to this method. The
    context will be passed to your observer method whenever it is triggered.
    Note that if you add the same target/method pair on a key multiple times
    with different context parameters, your observer will only be called once
    with the last context you passed.

    ### Observer Methods

    Observer methods you pass should generally have the following signature if
    you do not pass a `context` parameter:

    ```javascript
    fooDidChange: function(sender, key, value, rev) { };
    ```

    The sender is the object that changed. The key is the property that
    changes. The value property is currently reserved and unused. The rev
    is the last property revision of the object when it changed, which you can
    use to detect if the key value has really changed or not.

    If you pass a `context` parameter, the context will be passed before the
    revision like so:

    ```javascript
    fooDidChange: function(sender, key, value, context, rev) { };
    ```

    Usually you will not need the value, context or revision parameters at
    the end. In this case, it is common to write observer methods that take
    only a sender and key value as parameters or, if you aren't interested in
    any of these values, to write an observer that has no parameters at all.

    @method addObserver
    @param {String} key The key to observer
    @param {Object} target The target object to invoke
    @param {String|Function} method The method to invoke.
    @return {Ember.Object} self
  */
  addObserver: function(key, target, method) {
    Ember.addObserver(this, key, target, method);
  },

  /**
    Remove an observer you have previously registered on this object. Pass
    the same key, target, and method you passed to `addObserver()` and your
    target will no longer receive notifications.

    @method removeObserver
    @param {String} key The key to observer
    @param {Object} target The target object to invoke
    @param {String|Function} method The method to invoke.
    @return {Ember.Observable} receiver
  */
  removeObserver: function(key, target, method) {
    Ember.removeObserver(this, key, target, method);
  },

  /**
    Returns `true` if the object currently has observers registered for a
    particular key. You can use this method to potentially defer performing
    an expensive action until someone begins observing a particular property
    on the object.

    @method hasObserverFor
    @param {String} key Key to check
    @return {Boolean}
  */
  hasObserverFor: function(key) {
    return Ember.hasListeners(this, key+':change');
  },

  /**
    @deprecated
    @method getPath
    @param {String} path The property path to retrieve
    @return {Object} The property value or undefined.
  */
  getPath: function(path) {
    Ember.deprecate("getPath is deprecated since get now supports paths");
    return this.get(path);
  },

  /**
    @deprecated
    @method setPath
    @param {String} path The path to the property that will be set
    @param {Object} value The value to set or `null`.
    @return {Ember.Observable}
  */
  setPath: function(path, value) {
    Ember.deprecate("setPath is deprecated since set now supports paths");
    return this.set(path, value);
  },

  /**
    Retrieves the value of a property, or a default value in the case that the
    property returns `undefined`.

    ```javascript
    person.getWithDefault('lastName', 'Doe');
    ```

    @method getWithDefault
    @param {String} keyName The name of the property to retrieve
    @param {Object} defaultValue The value to return if the property value is undefined
    @return {Object} The property value or the defaultValue.
  */
  getWithDefault: function(keyName, defaultValue) {
    return Ember.getWithDefault(this, keyName, defaultValue);
  },

  /**
    Set the value of a property to the current value plus some amount.

    ```javascript
    person.incrementProperty('age');
    team.incrementProperty('score', 2);
    ```

    @method incrementProperty
    @param {String} keyName The name of the property to increment
    @param {Object} increment The amount to increment by. Defaults to 1
    @return {Object} The new property value
  */
  incrementProperty: function(keyName, increment) {
    if (!increment) { increment = 1; }
    set(this, keyName, (get(this, keyName) || 0)+increment);
    return get(this, keyName);
  },

  /**
    Set the value of a property to the current value minus some amount.

    ```javascript
    player.decrementProperty('lives');
    orc.decrementProperty('health', 5);
    ```

    @method decrementProperty
    @param {String} keyName The name of the property to decrement
    @param {Object} increment The amount to decrement by. Defaults to 1
    @return {Object} The new property value
  */
  decrementProperty: function(keyName, increment) {
    if (!increment) { increment = 1; }
    set(this, keyName, (get(this, keyName) || 0)-increment);
    return get(this, keyName);
  },

  /**
    Set the value of a boolean property to the opposite of it's
    current value.

    ```javascript
    starship.toggleProperty('warpDriveEnaged');
    ```

    @method toggleProperty
    @param {String} keyName The name of the property to toggle
    @return {Object} The new property value
  */
  toggleProperty: function(keyName) {
    set(this, keyName, !get(this, keyName));
    return get(this, keyName);
  },

  /**
    Returns the cached value of a computed property, if it exists.
    This allows you to inspect the value of a computed property
    without accidentally invoking it if it is intended to be
    generated lazily.

    @method cacheFor
    @param {String} keyName
    @return {Object} The cached value of the computed property, if any
  */
  cacheFor: function(keyName) {
    return Ember.cacheFor(this, keyName);
  },

  // intended for debugging purposes
  observersForKey: function(keyName) {
    return Ember.observersFor(this, keyName);
  }
});


})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var get = Ember.get, set = Ember.set;

/**
@class TargetActionSupport
@namespace Ember
@extends Ember.Mixin
*/
Ember.TargetActionSupport = Ember.Mixin.create({
  target: null,
  action: null,

  targetObject: Ember.computed(function() {
    var target = get(this, 'target');

    if (Ember.typeOf(target) === "string") {
      var value = get(this, target);
      if (value === undefined) { value = get(Ember.lookup, target); }
      return value;
    } else {
      return target;
    }
  }).property('target'),

  triggerAction: function() {
    var action = get(this, 'action'),
        target = get(this, 'targetObject');

    if (target && action) {
      var ret;

      if (typeof target.send === 'function') {
        ret = target.send(action, this);
      } else {
        if (typeof action === 'string') {
          action = target[action];
        }
        ret = action.call(target, this);
      }
      if (ret !== false) ret = true;

      return ret;
    } else {
      return false;
    }
  }
});

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

/**
  This mixin allows for Ember objects to subscribe to and emit events.

  ```javascript
  App.Person = Ember.Object.extend(Ember.Evented, {
    greet: function() {
      // ...
      this.trigger('greet');
    }
  });

  var person = App.Person.create();

  person.on('greet', function() {
    console.log('Our person has greeted');
  });

  person.greet();

  // outputs: 'Our person has greeted'
  ```

  @class Evented
  @namespace Ember
  @extends Ember.Mixin
 */
Ember.Evented = Ember.Mixin.create({

  /**
   Subscribes to a named event with given function.

   ```javascript
   person.on('didLoad', function() {
     // fired once the person has loaded
   });
   ```

   An optional target can be passed in as the 2nd argument that will
   be set as the "this" for the callback. This is a good way to give your
   function access to the object triggering the event. When the target
   parameter is used the callback becomes the third argument.

   @method on
   @param {String} name The name of the event
   @param {Object} [target] The "this" binding for the callback
   @param {Function} method The callback to execute
  */
  on: function(name, target, method) {
    Ember.addListener(this, name, target, method);
  },

  /**
    Subscribes a function to a named event and then cancels the subscription
    after the first time the event is triggered. It is good to use ``one`` when
    you only care about the first time an event has taken place.

    This function takes an optional 2nd argument that will become the "this"
    value for the callback. If this argument is passed then the 3rd argument
    becomes the function.

    @method one
    @param {String} name The name of the event
    @param {Object} [target] The "this" binding for the callback
    @param {Function} method The callback to execute
  */
  one: function(name, target, method) {
    if (!method) {
      method = target;
      target = null;
    }

    Ember.addListener(this, name, target, method, true);
  },

  /**
    Triggers a named event for the object. Any additional arguments
    will be passed as parameters to the functions that are subscribed to the
    event.

    ```javascript
    person.on('didEat', function(food) {
      console.log('person ate some ' + food);
    });

    person.trigger('didEat', 'broccoli');

    // outputs: person ate some broccoli
    ```
    @method trigger
    @param {String} name The name of the event
    @param {Object...} args Optional arguments to pass on
  */
  trigger: function(name) {
    var args = [], i, l;
    for (i = 1, l = arguments.length; i < l; i++) {
      args.push(arguments[i]);
    }
    Ember.sendEvent(this, name, args);
  },

  fire: function(name) {
    Ember.deprecate("Ember.Evented#fire() has been deprecated in favor of trigger() for compatibility with jQuery. It will be removed in 1.0. Please update your code to call trigger() instead.");
    this.trigger.apply(this, arguments);
  },

  /**
    Cancels subscription for give name, target, and method.

    @method off
    @param {String} name The name of the event
    @param {Object} target The target of the subscription
    @param {Function} method The function of the subscription
  */
  off: function(name, target, method) {
    Ember.removeListener(this, name, target, method);
  },

  /**
    Checks to see if object has any subscriptions for named event.

    @method has
    @param {String} name The name of the event
    @return {Boolean} does the object have a subscription for event
   */
  has: function(name) {
    return Ember.hasListeners(this, name);
  }
});

})();



(function() {
var RSVP = requireModule("rsvp");

RSVP.async = function(callback, binding) {
  Ember.run.schedule('actions', binding, callback);
};

/**
@module ember
@submodule ember-runtime
*/

var get = Ember.get,
    slice = Array.prototype.slice;

/**
  @class Deferred
  @namespace Ember
  @extends Ember.Mixin
 */
Ember.DeferredMixin = Ember.Mixin.create({
  /**
    Add handlers to be called when the Deferred object is resolved or rejected.

    @method then
    @param {Function} doneCallback a callback function to be called when done
    @param {Function} failCallback a callback function to be called when failed
  */
  then: function(doneCallback, failCallback) {
    var promise = get(this, 'promise');
    return promise.then.apply(promise, arguments);
  },

  /**
    Resolve a Deferred object and call any `doneCallbacks` with the given args.

    @method resolve
  */
  resolve: function(value) {
    get(this, 'promise').resolve(value);
  },

  /**
    Reject a Deferred object and call any `failCallbacks` with the given args.

    @method reject
  */
  reject: function(value) {
    get(this, 'promise').reject(value);
  },

  promise: Ember.computed(function() {
    return new RSVP.Promise();
  })
});


})();



(function() {

})();



(function() {
Ember.Container = requireModule('container');
Ember.Container.set = Ember.set;

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/


// NOTE: this object should never be included directly. Instead use Ember.
// Ember.Object. We only define this separately so that Ember.Set can depend on it


var set = Ember.set, get = Ember.get,
    o_create = Ember.create,
    o_defineProperty = Ember.platform.defineProperty,
    a_slice = Array.prototype.slice,
    GUID_KEY = Ember.GUID_KEY,
    guidFor = Ember.guidFor,
    generateGuid = Ember.generateGuid,
    meta = Ember.meta,
    rewatch = Ember.rewatch,
    finishChains = Ember.finishChains,
    destroy = Ember.destroy,
    schedule = Ember.run.schedule,
    Mixin = Ember.Mixin,
    applyMixin = Mixin._apply,
    finishPartial = Mixin.finishPartial,
    reopen = Mixin.prototype.reopen,
    MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER,
    indexOf = Ember.EnumerableUtils.indexOf;

var undefinedDescriptor = {
  configurable: true,
  writable: true,
  enumerable: false,
  value: undefined
};

function makeCtor() {

  // Note: avoid accessing any properties on the object since it makes the
  // method a lot faster. This is glue code so we want it to be as fast as
  // possible.

  var wasApplied = false, initMixins, initProperties;

  var Class = function() {
    if (!wasApplied) {
      Class.proto(); // prepare prototype...
    }
    o_defineProperty(this, GUID_KEY, undefinedDescriptor);
    o_defineProperty(this, '_super', undefinedDescriptor);
    var m = meta(this);
    m.proto = this;
    if (initMixins) {
      // capture locally so we can clear the closed over variable
      var mixins = initMixins;
      initMixins = null;
      this.reopen.apply(this, mixins);
    }
    if (initProperties) {
      // capture locally so we can clear the closed over variable
      var props = initProperties;
      initProperties = null;

      var concatenatedProperties = this.concatenatedProperties;

      for (var i = 0, l = props.length; i < l; i++) {
        var properties = props[i];
        for (var keyName in properties) {
          if (!properties.hasOwnProperty(keyName)) { continue; }

          var value = properties[keyName],
              IS_BINDING = Ember.IS_BINDING;

          if (IS_BINDING.test(keyName)) {
            var bindings = m.bindings;
            if (!bindings) {
              bindings = m.bindings = {};
            } else if (!m.hasOwnProperty('bindings')) {
              bindings = m.bindings = o_create(m.bindings);
            }
            bindings[keyName] = value;
          }

          var desc = m.descs[keyName];

          Ember.assert("Ember.Object.create no longer supports defining computed properties.", !(value instanceof Ember.ComputedProperty));
          Ember.assert("Ember.Object.create no longer supports defining methods that call _super.", !(typeof value === 'function' && value.toString().indexOf('._super') !== -1));

          if (concatenatedProperties && indexOf(concatenatedProperties, keyName) >= 0) {
            var baseValue = this[keyName];

            if (baseValue) {
              if ('function' === typeof baseValue.concat) {
                value = baseValue.concat(value);
              } else {
                value = Ember.makeArray(baseValue).concat(value);
              }
            } else {
              value = Ember.makeArray(value);
            }
          }

          if (desc) {
            desc.set(this, keyName, value);
          } else {
            if (typeof this.setUnknownProperty === 'function' && !(keyName in this)) {
              this.setUnknownProperty(keyName, value);
            } else if (MANDATORY_SETTER) {
              Ember.defineProperty(this, keyName, null, value); // setup mandatory setter
            } else {
              this[keyName] = value;
            }
          }
        }
      }
    }
    finishPartial(this, m);
    delete m.proto;
    finishChains(this);
    this.init.apply(this, arguments);
  };

  Class.toString = Mixin.prototype.toString;
  Class.willReopen = function() {
    if (wasApplied) {
      Class.PrototypeMixin = Mixin.create(Class.PrototypeMixin);
    }

    wasApplied = false;
  };
  Class._initMixins = function(args) { initMixins = args; };
  Class._initProperties = function(args) { initProperties = args; };

  Class.proto = function() {
    var superclass = Class.superclass;
    if (superclass) { superclass.proto(); }

    if (!wasApplied) {
      wasApplied = true;
      Class.PrototypeMixin.applyPartial(Class.prototype);
      rewatch(Class.prototype);
    }

    return this.prototype;
  };

  return Class;

}

var CoreObject = makeCtor();
CoreObject.toString = function() { return "Ember.CoreObject"; };

CoreObject.PrototypeMixin = Mixin.create({
  reopen: function() {
    applyMixin(this, arguments, true);
    return this;
  },

  isInstance: true,

  init: function() {},

  /**
    Defines the properties that will be concatenated from the superclass
    (instead of overridden).

    By default, when you extend an Ember class a property defined in
    the subclass overrides a property with the same name that is defined
    in the superclass. However, there are some cases where it is preferable
    to build up a property's value by combining the superclass' property
    value with the subclass' value. An example of this in use within Ember
    is the `classNames` property of `Ember.View`.

    Here is some sample code showing the difference between a concatenated
    property and a normal one:

    ```javascript
    App.BarView = Ember.View.extend({
      someNonConcatenatedProperty: ['bar'],
      classNames: ['bar']
    });

    App.FooBarView = App.BarView.extend({
      someNonConcatenatedProperty: ['foo'],
      classNames: ['foo'],
    });

    var fooBarView = App.FooBarView.create();
    fooBarView.get('someNonConcatenatedProperty'); // ['foo']
    fooBarView.get('classNames'); // ['ember-view', 'bar', 'foo']
    ```

    This behavior extends to object creation as well. Continuing the
    above example:

    ```javascript
    var view = App.FooBarView.create({
      someNonConcatenatedProperty: ['baz'],
      classNames: ['baz']
    })
    view.get('someNonConcatenatedProperty'); // ['baz']
    view.get('classNames'); // ['ember-view', 'bar', 'foo', 'baz']
    ```
    Adding a single property that is not an array will just add it in the array:

    ```javascript
    var view = App.FooBarView.create({
      classNames: 'baz'
    })
    view.get('classNames'); // ['ember-view', 'bar', 'foo', 'baz']
    ```

    Using the `concatenatedProperties` property, we can tell to Ember that mix
    the content of the properties.

    In `Ember.View` the `classNameBindings` and `attributeBindings` properties
    are also concatenated, in addition to `classNames`.

    This feature is available for you to use throughout the Ember object model,
    although typical app developers are likely to use it infrequently.

    @property concatenatedProperties
    @type Array
    @default null
  */
  concatenatedProperties: null,

  /**
    @property isDestroyed
    @default false
  */
  isDestroyed: false,

  /**
    @property isDestroying
    @default false
  */
  isDestroying: false,

  /**
    Destroys an object by setting the `isDestroyed` flag and removing its
    metadata, which effectively destroys observers and bindings.

    If you try to set a property on a destroyed object, an exception will be
    raised.

    Note that destruction is scheduled for the end of the run loop and does not
    happen immediately.

    @method destroy
    @return {Ember.Object} receiver
  */
  destroy: function() {
    if (this._didCallDestroy) { return; }

    this.isDestroying = true;
    this._didCallDestroy = true;

    if (this.willDestroy) { this.willDestroy(); }

    schedule('destroy', this, this._scheduledDestroy);
    return this;
  },

  /**
    @private

    Invoked by the run loop to actually destroy the object. This is
    scheduled for execution by the `destroy` method.

    @method _scheduledDestroy
  */
  _scheduledDestroy: function() {
    destroy(this);
    set(this, 'isDestroyed', true);

    if (this.didDestroy) { this.didDestroy(); }
  },

  bind: function(to, from) {
    if (!(from instanceof Ember.Binding)) { from = Ember.Binding.from(from); }
    from.to(to).connect(this);
    return from;
  },

  /**
    Returns a string representation which attempts to provide more information
    than Javascript's `toString` typically does, in a generic way for all Ember
    objects.

        App.Person = Em.Object.extend()
        person = App.Person.create()
        person.toString() //=> "<App.Person:ember1024>"

    If the object's class is not defined on an Ember namespace, it will
    indicate it is a subclass of the registered superclass:

        Student = App.Person.extend()
        student = Student.create()
        student.toString() //=> "<(subclass of App.Person):ember1025>"

    If the method `toStringExtension` is defined, its return value will be
    included in the output.

        App.Teacher = App.Person.extend({
          toStringExtension: function(){
            return this.get('fullName');
          }
        });
        teacher = App.Teacher.create()
        teacher.toString(); // #=> "<App.Teacher:ember1026:Tom Dale>"

    @method toString
    @return {String} string representation
  */
  toString: function toString() {
    var hasToStringExtension = typeof this.toStringExtension === 'function',
        extension = hasToStringExtension ? ":" + this.toStringExtension() : '';
    var ret = '<'+this.constructor.toString()+':'+guidFor(this)+extension+'>';
    this.toString = makeToString(ret);
    return ret;
  }
});

CoreObject.PrototypeMixin.ownerConstructor = CoreObject;

function makeToString(ret) {
  return function() { return ret; };
}

if (Ember.config.overridePrototypeMixin) {
  Ember.config.overridePrototypeMixin(CoreObject.PrototypeMixin);
}

CoreObject.__super__ = null;

var ClassMixin = Mixin.create({

  ClassMixin: Ember.required(),

  PrototypeMixin: Ember.required(),

  isClass: true,

  isMethod: false,

  extend: function() {
    var Class = makeCtor(), proto;
    Class.ClassMixin = Mixin.create(this.ClassMixin);
    Class.PrototypeMixin = Mixin.create(this.PrototypeMixin);

    Class.ClassMixin.ownerConstructor = Class;
    Class.PrototypeMixin.ownerConstructor = Class;

    reopen.apply(Class.PrototypeMixin, arguments);

    Class.superclass = this;
    Class.__super__  = this.prototype;

    proto = Class.prototype = o_create(this.prototype);
    proto.constructor = Class;
    generateGuid(proto, 'ember');
    meta(proto).proto = proto; // this will disable observers on prototype

    Class.ClassMixin.apply(Class);
    return Class;
  },

  createWithMixins: function() {
    var C = this;
    if (arguments.length>0) { this._initMixins(arguments); }
    return new C();
  },

  create: function() {
    var C = this;
    if (arguments.length>0) { this._initProperties(arguments); }
    return new C();
  },

  reopen: function() {
    this.willReopen();
    reopen.apply(this.PrototypeMixin, arguments);
    return this;
  },

  reopenClass: function() {
    reopen.apply(this.ClassMixin, arguments);
    applyMixin(this, arguments, false);
    return this;
  },

  detect: function(obj) {
    if ('function' !== typeof obj) { return false; }
    while(obj) {
      if (obj===this) { return true; }
      obj = obj.superclass;
    }
    return false;
  },

  detectInstance: function(obj) {
    return obj instanceof this;
  },

  /**
    In some cases, you may want to annotate computed properties with additional
    metadata about how they function or what values they operate on. For
    example, computed property functions may close over variables that are then
    no longer available for introspection.

    You can pass a hash of these values to a computed property like this:

    ```javascript
    person: function() {
      var personId = this.get('personId');
      return App.Person.create({ id: personId });
    }.property().meta({ type: App.Person })
    ```

    Once you've done this, you can retrieve the values saved to the computed
    property from your class like this:

    ```javascript
    MyClass.metaForProperty('person');
    ```

    This will return the original hash that was passed to `meta()`.

    @method metaForProperty
    @param key {String} property name
  */
  metaForProperty: function(key) {
    var desc = meta(this.proto(), false).descs[key];

    Ember.assert("metaForProperty() could not find a computed property with key '"+key+"'.", !!desc && desc instanceof Ember.ComputedProperty);
    return desc._meta || {};
  },

  /**
    Iterate over each computed property for the class, passing its name
    and any associated metadata (see `metaForProperty`) to the callback.

    @method eachComputedProperty
    @param {Function} callback
    @param {Object} binding
  */
  eachComputedProperty: function(callback, binding) {
    var proto = this.proto(),
        descs = meta(proto).descs,
        empty = {},
        property;

    for (var name in descs) {
      property = descs[name];

      if (property instanceof Ember.ComputedProperty) {
        callback.call(binding || this, name, property._meta || empty);
      }
    }
  }

});

ClassMixin.ownerConstructor = CoreObject;

if (Ember.config.overrideClassMixin) {
  Ember.config.overrideClassMixin(ClassMixin);
}

CoreObject.ClassMixin = ClassMixin;
ClassMixin.apply(CoreObject);

/**
  @class CoreObject
  @namespace Ember
*/
Ember.CoreObject = CoreObject;

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var get = Ember.get, set = Ember.set, guidFor = Ember.guidFor, none = Ember.isNone;

/**
  An unordered collection of objects.

  A Set works a bit like an array except that its items are not ordered. You
  can create a set to efficiently test for membership for an object. You can
  also iterate through a set just like an array, even accessing objects by
  index, however there is no guarantee as to their order.

  All Sets are observable via the Enumerable Observer API - which works
  on any enumerable object including both Sets and Arrays.

  ## Creating a Set

  You can create a set like you would most objects using
  `new Ember.Set()`. Most new sets you create will be empty, but you can
  also initialize the set with some content by passing an array or other
  enumerable of objects to the constructor.

  Finally, you can pass in an existing set and the set will be copied. You
  can also create a copy of a set by calling `Ember.Set#copy()`.

  ```javascript
  // creates a new empty set
  var foundNames = new Ember.Set();

  // creates a set with four names in it.
  var names = new Ember.Set(["Charles", "Tom", "Juan", "Alex"]); // :P

  // creates a copy of the names set.
  var namesCopy = new Ember.Set(names);

  // same as above.
  var anotherNamesCopy = names.copy();
  ```

  ## Adding/Removing Objects

  You generally add or remove objects from a set using `add()` or
  `remove()`. You can add any type of object including primitives such as
  numbers, strings, and booleans.

  Unlike arrays, objects can only exist one time in a set. If you call `add()`
  on a set with the same object multiple times, the object will only be added
  once. Likewise, calling `remove()` with the same object multiple times will
  remove the object the first time and have no effect on future calls until
  you add the object to the set again.

  NOTE: You cannot add/remove `null` or `undefined` to a set. Any attempt to do
  so will be ignored.

  In addition to add/remove you can also call `push()`/`pop()`. Push behaves
  just like `add()` but `pop()`, unlike `remove()` will pick an arbitrary
  object, remove it and return it. This is a good way to use a set as a job
  queue when you don't care which order the jobs are executed in.

  ## Testing for an Object

  To test for an object's presence in a set you simply call
  `Ember.Set#contains()`.

  ## Observing changes

  When using `Ember.Set`, you can observe the `"[]"` property to be
  alerted whenever the content changes. You can also add an enumerable
  observer to the set to be notified of specific objects that are added and
  removed from the set. See `Ember.Enumerable` for more information on
  enumerables.

  This is often unhelpful. If you are filtering sets of objects, for instance,
  it is very inefficient to re-filter all of the items each time the set
  changes. It would be better if you could just adjust the filtered set based
  on what was changed on the original set. The same issue applies to merging
  sets, as well.

  ## Other Methods

  `Ember.Set` primary implements other mixin APIs. For a complete reference
  on the methods you will use with `Ember.Set`, please consult these mixins.
  The most useful ones will be `Ember.Enumerable` and
  `Ember.MutableEnumerable` which implement most of the common iterator
  methods you are used to on Array.

  Note that you can also use the `Ember.Copyable` and `Ember.Freezable`
  APIs on `Ember.Set` as well. Once a set is frozen it can no longer be
  modified. The benefit of this is that when you call `frozenCopy()` on it,
  Ember will avoid making copies of the set. This allows you to write
  code that can know with certainty when the underlying set data will or
  will not be modified.

  @class Set
  @namespace Ember
  @extends Ember.CoreObject
  @uses Ember.MutableEnumerable
  @uses Ember.Copyable
  @uses Ember.Freezable
  @since Ember 0.9
*/
Ember.Set = Ember.CoreObject.extend(Ember.MutableEnumerable, Ember.Copyable, Ember.Freezable,
  /** @scope Ember.Set.prototype */ {

  // ..........................................................
  // IMPLEMENT ENUMERABLE APIS
  //

  /**
    This property will change as the number of objects in the set changes.

    @property length
    @type number
    @default 0
  */
  length: 0,

  /**
    Clears the set. This is useful if you want to reuse an existing set
    without having to recreate it.

    ```javascript
    var colors = new Ember.Set(["red", "green", "blue"]);
    colors.length;  // 3
    colors.clear();
    colors.length;  // 0
    ```

    @method clear
    @return {Ember.Set} An empty Set
  */
  clear: function() {
    if (this.isFrozen) { throw new Error(Ember.FROZEN_ERROR); }

    var len = get(this, 'length');
    if (len === 0) { return this; }

    var guid;

    this.enumerableContentWillChange(len, 0);
    Ember.propertyWillChange(this, 'firstObject');
    Ember.propertyWillChange(this, 'lastObject');

    for (var i=0; i < len; i++){
      guid = guidFor(this[i]);
      delete this[guid];
      delete this[i];
    }

    set(this, 'length', 0);

    Ember.propertyDidChange(this, 'firstObject');
    Ember.propertyDidChange(this, 'lastObject');
    this.enumerableContentDidChange(len, 0);

    return this;
  },

  /**
    Returns true if the passed object is also an enumerable that contains the
    same objects as the receiver.

    ```javascript
    var colors = ["red", "green", "blue"],
        same_colors = new Ember.Set(colors);

    same_colors.isEqual(colors);               // true
    same_colors.isEqual(["purple", "brown"]);  // false
    ```

    @method isEqual
    @param {Ember.Set} obj the other object.
    @return {Boolean}
  */
  isEqual: function(obj) {
    // fail fast
    if (!Ember.Enumerable.detect(obj)) return false;

    var loc = get(this, 'length');
    if (get(obj, 'length') !== loc) return false;

    while(--loc >= 0) {
      if (!obj.contains(this[loc])) return false;
    }

    return true;
  },

  /**
    Adds an object to the set. Only non-`null` objects can be added to a set
    and those can only be added once. If the object is already in the set or
    the passed value is null this method will have no effect.

    This is an alias for `Ember.MutableEnumerable.addObject()`.

    ```javascript
    var colors = new Ember.Set();
    colors.add("blue");     // ["blue"]
    colors.add("blue");     // ["blue"]
    colors.add("red");      // ["blue", "red"]
    colors.add(null);       // ["blue", "red"]
    colors.add(undefined);  // ["blue", "red"]
    ```

    @method add
    @param {Object} obj The object to add.
    @return {Ember.Set} The set itself.
  */
  add: Ember.aliasMethod('addObject'),

  /**
    Removes the object from the set if it is found. If you pass a `null` value
    or an object that is already not in the set, this method will have no
    effect. This is an alias for `Ember.MutableEnumerable.removeObject()`.

    ```javascript
    var colors = new Ember.Set(["red", "green", "blue"]);
    colors.remove("red");     // ["blue", "green"]
    colors.remove("purple");  // ["blue", "green"]
    colors.remove(null);      // ["blue", "green"]
    ```

    @method remove
    @param {Object} obj The object to remove
    @return {Ember.Set} The set itself.
  */
  remove: Ember.aliasMethod('removeObject'),

  /**
    Removes the last element from the set and returns it, or `null` if it's empty.

    ```javascript
    var colors = new Ember.Set(["green", "blue"]);
    colors.pop();  // "blue"
    colors.pop();  // "green"
    colors.pop();  // null
    ```

    @method pop
    @return {Object} The removed object from the set or null.
  */
  pop: function() {
    if (get(this, 'isFrozen')) throw new Error(Ember.FROZEN_ERROR);
    var obj = this.length > 0 ? this[this.length-1] : null;
    this.remove(obj);
    return obj;
  },

  /**
    Inserts the given object on to the end of the set. It returns
    the set itself.

    This is an alias for `Ember.MutableEnumerable.addObject()`.

    ```javascript
    var colors = new Ember.Set();
    colors.push("red");   // ["red"]
    colors.push("green"); // ["red", "green"]
    colors.push("blue");  // ["red", "green", "blue"]
    ```

    @method push
    @return {Ember.Set} The set itself.
  */
  push: Ember.aliasMethod('addObject'),

  /**
    Removes the last element from the set and returns it, or `null` if it's empty.

    This is an alias for `Ember.Set.pop()`.

    ```javascript
    var colors = new Ember.Set(["green", "blue"]);
    colors.shift();  // "blue"
    colors.shift();  // "green"
    colors.shift();  // null
    ```

    @method shift
    @return {Object} The removed object from the set or null.
  */
  shift: Ember.aliasMethod('pop'),

  /**
    Inserts the given object on to the end of the set. It returns
    the set itself.

    This is an alias of `Ember.Set.push()`

    ```javascript
    var colors = new Ember.Set();
    colors.unshift("red");    // ["red"]
    colors.unshift("green");  // ["red", "green"]
    colors.unshift("blue");   // ["red", "green", "blue"]
    ```

    @method unshift
    @return {Ember.Set} The set itself.
  */
  unshift: Ember.aliasMethod('push'),

  /**
    Adds each object in the passed enumerable to the set.

    This is an alias of `Ember.MutableEnumerable.addObjects()`

    ```javascript
    var colors = new Ember.Set();
    colors.addEach(["red", "green", "blue"]);  // ["red", "green", "blue"]
    ```

    @method addEach
    @param {Ember.Enumerable} objects the objects to add.
    @return {Ember.Set} The set itself.
  */
  addEach: Ember.aliasMethod('addObjects'),

  /**
    Removes each object in the passed enumerable to the set.

    This is an alias of `Ember.MutableEnumerable.removeObjects()`

    ```javascript
    var colors = new Ember.Set(["red", "green", "blue"]);
    colors.removeEach(["red", "blue"]);  //  ["green"]
    ```

    @method removeEach
    @param {Ember.Enumerable} objects the objects to remove.
    @return {Ember.Set} The set itself.
  */
  removeEach: Ember.aliasMethod('removeObjects'),

  // ..........................................................
  // PRIVATE ENUMERABLE SUPPORT
  //

  init: function(items) {
    this._super();
    if (items) this.addObjects(items);
  },

  // implement Ember.Enumerable
  nextObject: function(idx) {
    return this[idx];
  },

  // more optimized version
  firstObject: Ember.computed(function() {
    return this.length > 0 ? this[0] : undefined;
  }),

  // more optimized version
  lastObject: Ember.computed(function() {
    return this.length > 0 ? this[this.length-1] : undefined;
  }),

  // implements Ember.MutableEnumerable
  addObject: function(obj) {
    if (get(this, 'isFrozen')) throw new Error(Ember.FROZEN_ERROR);
    if (none(obj)) return this; // nothing to do

    var guid = guidFor(obj),
        idx  = this[guid],
        len  = get(this, 'length'),
        added ;

    if (idx>=0 && idx<len && (this[idx] === obj)) return this; // added

    added = [obj];

    this.enumerableContentWillChange(null, added);
    Ember.propertyWillChange(this, 'lastObject');

    len = get(this, 'length');
    this[guid] = len;
    this[len] = obj;
    set(this, 'length', len+1);

    Ember.propertyDidChange(this, 'lastObject');
    this.enumerableContentDidChange(null, added);

    return this;
  },

  // implements Ember.MutableEnumerable
  removeObject: function(obj) {
    if (get(this, 'isFrozen')) throw new Error(Ember.FROZEN_ERROR);
    if (none(obj)) return this; // nothing to do

    var guid = guidFor(obj),
        idx  = this[guid],
        len = get(this, 'length'),
        isFirst = idx === 0,
        isLast = idx === len-1,
        last, removed;


    if (idx>=0 && idx<len && (this[idx] === obj)) {
      removed = [obj];

      this.enumerableContentWillChange(removed, null);
      if (isFirst) { Ember.propertyWillChange(this, 'firstObject'); }
      if (isLast)  { Ember.propertyWillChange(this, 'lastObject'); }

      // swap items - basically move the item to the end so it can be removed
      if (idx < len-1) {
        last = this[len-1];
        this[idx] = last;
        this[guidFor(last)] = idx;
      }

      delete this[guid];
      delete this[len-1];
      set(this, 'length', len-1);

      if (isFirst) { Ember.propertyDidChange(this, 'firstObject'); }
      if (isLast)  { Ember.propertyDidChange(this, 'lastObject'); }
      this.enumerableContentDidChange(removed, null);
    }

    return this;
  },

  // optimized version
  contains: function(obj) {
    return this[guidFor(obj)]>=0;
  },

  copy: function() {
    var C = this.constructor, ret = new C(), loc = get(this, 'length');
    set(ret, 'length', loc);
    while(--loc>=0) {
      ret[loc] = this[loc];
      ret[guidFor(this[loc])] = loc;
    }
    return ret;
  },

  toString: function() {
    var len = this.length, idx, array = [];
    for(idx = 0; idx < len; idx++) {
      array[idx] = this[idx];
    }
    return "Ember.Set<%@>".fmt(array.join(','));
  }

});

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

/**
  `Ember.Object` is the main base class for all Ember objects. It is a subclass
  of `Ember.CoreObject` with the `Ember.Observable` mixin applied. For details,
  see the documentation for each of these.

  @class Object
  @namespace Ember
  @extends Ember.CoreObject
  @uses Ember.Observable
*/
Ember.Object = Ember.CoreObject.extend(Ember.Observable);
Ember.Object.toString = function() { return "Ember.Object"; };

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var get = Ember.get, indexOf = Ember.ArrayPolyfills.indexOf;

/**
  A Namespace is an object usually used to contain other objects or methods
  such as an application or framework. Create a namespace anytime you want
  to define one of these new containers.

  # Example Usage

  ```javascript
  MyFramework = Ember.Namespace.create({
    VERSION: '1.0.0'
  });
  ```

  @class Namespace
  @namespace Ember
  @extends Ember.Object
*/
var Namespace = Ember.Namespace = Ember.Object.extend({
  isNamespace: true,

  init: function() {
    Ember.Namespace.NAMESPACES.push(this);
    Ember.Namespace.PROCESSED = false;
  },

  toString: function() {
    var name = get(this, 'name');
    if (name) { return name; }

    findNamespaces();
    return this[Ember.GUID_KEY+'_name'];
  },

  nameClasses: function() {
    processNamespace([this.toString()], this, {});
  },

  destroy: function() {
    var namespaces = Ember.Namespace.NAMESPACES;
    Ember.lookup[this.toString()] = undefined;
    namespaces.splice(indexOf.call(namespaces, this), 1);
    this._super();
  }
});

Namespace.reopenClass({
  NAMESPACES: [Ember],
  NAMESPACES_BY_ID: {},
  PROCESSED: false,
  processAll: processAllNamespaces,
  byName: function(name) {
    if (!Ember.BOOTED) {
      processAllNamespaces();
    }

    return NAMESPACES_BY_ID[name];
  }
});

var NAMESPACES_BY_ID = Namespace.NAMESPACES_BY_ID;

var hasOwnProp = ({}).hasOwnProperty,
    guidFor = Ember.guidFor;

function processNamespace(paths, root, seen) {
  var idx = paths.length;

  NAMESPACES_BY_ID[paths.join('.')] = root;

  // Loop over all of the keys in the namespace, looking for classes
  for(var key in root) {
    if (!hasOwnProp.call(root, key)) { continue; }
    var obj = root[key];

    // If we are processing the `Ember` namespace, for example, the
    // `paths` will start with `["Ember"]`. Every iteration through
    // the loop will update the **second** element of this list with
    // the key, so processing `Ember.View` will make the Array
    // `['Ember', 'View']`.
    paths[idx] = key;

    // If we have found an unprocessed class
    if (obj && obj.toString === classToString) {
      // Replace the class' `toString` with the dot-separated path
      // and set its `NAME_KEY`
      obj.toString = makeToString(paths.join('.'));
      obj[NAME_KEY] = paths.join('.');

    // Support nested namespaces
    } else if (obj && obj.isNamespace) {
      // Skip aliased namespaces
      if (seen[guidFor(obj)]) { continue; }
      seen[guidFor(obj)] = true;

      // Process the child namespace
      processNamespace(paths, obj, seen);
    }
  }

  paths.length = idx; // cut out last item
}

function findNamespaces() {
  var Namespace = Ember.Namespace, lookup = Ember.lookup, obj, isNamespace;

  if (Namespace.PROCESSED) { return; }

  for (var prop in lookup) {
    // These don't raise exceptions but can cause warnings
    if (prop === "parent" || prop === "top" || prop === "frameElement") { continue; }

    //  get(window.globalStorage, 'isNamespace') would try to read the storage for domain isNamespace and cause exception in Firefox.
    // globalStorage is a storage obsoleted by the WhatWG storage specification. See https://developer.mozilla.org/en/DOM/Storage#globalStorage
    if (prop === "globalStorage" && lookup.StorageList && lookup.globalStorage instanceof lookup.StorageList) { continue; }
    // Unfortunately, some versions of IE don't support window.hasOwnProperty
    if (lookup.hasOwnProperty && !lookup.hasOwnProperty(prop)) { continue; }

    // At times we are not allowed to access certain properties for security reasons.
    // There are also times where even if we can access them, we are not allowed to access their properties.
    try {
      obj = Ember.lookup[prop];
      isNamespace = obj && obj.isNamespace;
    } catch (e) {
      continue;
    }

    if (isNamespace) {
      Ember.deprecate("Namespaces should not begin with lowercase.", /^[A-Z]/.test(prop));
      obj[NAME_KEY] = prop;
    }
  }
}

var NAME_KEY = Ember.NAME_KEY = Ember.GUID_KEY + '_name';

function superClassString(mixin) {
  var superclass = mixin.superclass;
  if (superclass) {
    if (superclass[NAME_KEY]) { return superclass[NAME_KEY]; }
    else { return superClassString(superclass); }
  } else {
    return;
  }
}

function classToString() {
  if (!Ember.BOOTED && !this[NAME_KEY]) {
    processAllNamespaces();
  }

  var ret;

  if (this[NAME_KEY]) {
    ret = this[NAME_KEY];
  } else {
    var str = superClassString(this);
    if (str) {
      ret = "(subclass of " + str + ")";
    } else {
      ret = "(unknown mixin)";
    }
    this.toString = makeToString(ret);
  }

  return ret;
}

function processAllNamespaces() {
  var unprocessedNamespaces = !Namespace.PROCESSED,
      unprocessedMixins = Ember.anyUnprocessedMixins;

  if (unprocessedNamespaces) {
    findNamespaces();
    Namespace.PROCESSED = true;
  }

  if (unprocessedNamespaces || unprocessedMixins) {
    var namespaces = Namespace.NAMESPACES, namespace;
    for (var i=0, l=namespaces.length; i<l; i++) {
      namespace = namespaces[i];
      processNamespace([namespace.toString()], namespace, {});
    }

    Ember.anyUnprocessedMixins = false;
  }
}

function makeToString(ret) {
  return function() { return ret; };
}

Ember.Mixin.prototype.toString = classToString;

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

/**
  Defines a namespace that will contain an executable application. This is
  very similar to a normal namespace except that it is expected to include at
  least a 'ready' function which can be run to initialize the application.

  Currently `Ember.Application` is very similar to `Ember.Namespace.`  However,
  this class may be augmented by additional frameworks so it is important to
  use this instance when building new applications.

  # Example Usage

  ```javascript
  MyApp = Ember.Application.create({
    VERSION: '1.0.0',
    store: Ember.Store.create().from(Ember.fixtures)
  });

  MyApp.ready = function() {
    //..init code goes here...
  }
  ```

  @class Application
  @namespace Ember
  @extends Ember.Namespace
*/
Ember.Application = Ember.Namespace.extend();


})();



(function() {
/**
@module ember
@submodule ember-runtime
*/


var get = Ember.get, set = Ember.set;

/**
  An ArrayProxy wraps any other object that implements `Ember.Array` and/or
  `Ember.MutableArray,` forwarding all requests. This makes it very useful for
  a number of binding use cases or other cases where being able to swap
  out the underlying array is useful.

  A simple example of usage:

  ```javascript
  var pets = ['dog', 'cat', 'fish'];
  var ap = Ember.ArrayProxy.create({ content: Ember.A(pets) });

  ap.get('firstObject');                        // 'dog'
  ap.set('content', ['amoeba', 'paramecium']);
  ap.get('firstObject');                        // 'amoeba'
  ```

  This class can also be useful as a layer to transform the contents of
  an array, as they are accessed. This can be done by overriding
  `objectAtContent`:

  ```javascript
  var pets = ['dog', 'cat', 'fish'];
  var ap = Ember.ArrayProxy.create({
      content: Ember.A(pets),
      objectAtContent: function(idx) {
          return this.get('content').objectAt(idx).toUpperCase();
      }
  });

  ap.get('firstObject'); // . 'DOG'
  ```

  @class ArrayProxy
  @namespace Ember
  @extends Ember.Object
  @uses Ember.MutableArray
*/
Ember.ArrayProxy = Ember.Object.extend(Ember.MutableArray,
/** @scope Ember.ArrayProxy.prototype */ {

  /**
    The content array. Must be an object that implements `Ember.Array` and/or
    `Ember.MutableArray.`

    @property content
    @type Ember.Array
  */
  content: null,

  /**
   The array that the proxy pretends to be. In the default `ArrayProxy`
   implementation, this and `content` are the same. Subclasses of `ArrayProxy`
   can override this property to provide things like sorting and filtering.

   @property arrangedContent
  */
  arrangedContent: Ember.computed.alias('content'),

  /**
    Should actually retrieve the object at the specified index from the
    content. You can override this method in subclasses to transform the
    content item to something new.

    This method will only be called if content is non-`null`.

    @method objectAtContent
    @param {Number} idx The index to retrieve.
    @return {Object} the value or undefined if none found
  */
  objectAtContent: function(idx) {
    return get(this, 'arrangedContent').objectAt(idx);
  },

  /**
    Should actually replace the specified objects on the content array.
    You can override this method in subclasses to transform the content item
    into something new.

    This method will only be called if content is non-`null`.

    @method replaceContent
    @param {Number} idx The starting index
    @param {Number} amt The number of items to remove from the content.
    @param {Array} objects Optional array of objects to insert or null if no
      objects.
    @return {void}
  */
  replaceContent: function(idx, amt, objects) {
    get(this, 'content').replace(idx, amt, objects);
  },

  /**
    @private

    Invoked when the content property is about to change. Notifies observers that the
    entire array content will change.

    @method _contentWillChange
  */
  _contentWillChange: Ember.beforeObserver(function() {
    this._teardownContent();
  }, 'content'),

  _teardownContent: function() {
    var content = get(this, 'content');

    if (content) {
      content.removeArrayObserver(this, {
        willChange: 'contentArrayWillChange',
        didChange: 'contentArrayDidChange'
      });
    }
  },

  contentArrayWillChange: Ember.K,
  contentArrayDidChange: Ember.K,

  /**
    @private

    Invoked when the content property changes. Notifies observers that the
    entire array content has changed.

    @method _contentDidChange
  */
  _contentDidChange: Ember.observer(function() {
    var content = get(this, 'content');

    Ember.assert("Can't set ArrayProxy's content to itself", content !== this);

    this._setupContent();
  }, 'content'),

  _setupContent: function() {
    var content = get(this, 'content');

    if (content) {
      content.addArrayObserver(this, {
        willChange: 'contentArrayWillChange',
        didChange: 'contentArrayDidChange'
      });
    }
  },

  _arrangedContentWillChange: Ember.beforeObserver(function() {
    var arrangedContent = get(this, 'arrangedContent'),
        len = arrangedContent ? get(arrangedContent, 'length') : 0;

    this.arrangedContentArrayWillChange(this, 0, len, undefined);
    this.arrangedContentWillChange(this);

    this._teardownArrangedContent(arrangedContent);
  }, 'arrangedContent'),

  _arrangedContentDidChange: Ember.observer(function() {
    var arrangedContent = get(this, 'arrangedContent'),
        len = arrangedContent ? get(arrangedContent, 'length') : 0;

    Ember.assert("Can't set ArrayProxy's content to itself", arrangedContent !== this);

    this._setupArrangedContent();

    this.arrangedContentDidChange(this);
    this.arrangedContentArrayDidChange(this, 0, undefined, len);
  }, 'arrangedContent'),

  _setupArrangedContent: function() {
    var arrangedContent = get(this, 'arrangedContent');

    if (arrangedContent) {
      arrangedContent.addArrayObserver(this, {
        willChange: 'arrangedContentArrayWillChange',
        didChange: 'arrangedContentArrayDidChange'
      });
    }
  },

  _teardownArrangedContent: function() {
    var arrangedContent = get(this, 'arrangedContent');

    if (arrangedContent) {
      arrangedContent.removeArrayObserver(this, {
        willChange: 'arrangedContentArrayWillChange',
        didChange: 'arrangedContentArrayDidChange'
      });
    }
  },

  arrangedContentWillChange: Ember.K,
  arrangedContentDidChange: Ember.K,

  objectAt: function(idx) {
    return get(this, 'content') && this.objectAtContent(idx);
  },

  length: Ember.computed(function() {
    var arrangedContent = get(this, 'arrangedContent');
    return arrangedContent ? get(arrangedContent, 'length') : 0;
    // No dependencies since Enumerable notifies length of change
  }),

  replace: function(idx, amt, objects) {
    Ember.assert('The content property of '+ this.constructor + ' should be set before modifying it', this.get('content'));
    if (get(this, 'content')) this.replaceContent(idx, amt, objects);
    return this;
  },

  arrangedContentArrayWillChange: function(item, idx, removedCnt, addedCnt) {
    this.arrayContentWillChange(idx, removedCnt, addedCnt);
  },

  arrangedContentArrayDidChange: function(item, idx, removedCnt, addedCnt) {
    this.arrayContentDidChange(idx, removedCnt, addedCnt);
  },

  init: function() {
    this._super();
    this._setupContent();
    this._setupArrangedContent();
  },

  willDestroy: function() {
    this._teardownArrangedContent();
    this._teardownContent();
  }
});


})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var get = Ember.get,
    set = Ember.set,
    fmt = Ember.String.fmt,
    addBeforeObserver = Ember.addBeforeObserver,
    addObserver = Ember.addObserver,
    removeBeforeObserver = Ember.removeBeforeObserver,
    removeObserver = Ember.removeObserver,
    propertyWillChange = Ember.propertyWillChange,
    propertyDidChange = Ember.propertyDidChange;

function contentPropertyWillChange(content, contentKey) {
  var key = contentKey.slice(8); // remove "content."
  if (key in this) { return; }  // if shadowed in proxy
  propertyWillChange(this, key);
}

function contentPropertyDidChange(content, contentKey) {
  var key = contentKey.slice(8); // remove "content."
  if (key in this) { return; } // if shadowed in proxy
  propertyDidChange(this, key);
}

/**
  `Ember.ObjectProxy` forwards all properties not defined by the proxy itself
  to a proxied `content` object.

  ```javascript
  object = Ember.Object.create({
    name: 'Foo'
  });

  proxy = Ember.ObjectProxy.create({
    content: object
  });

  // Access and change existing properties
  proxy.get('name')          // 'Foo'
  proxy.set('name', 'Bar');
  object.get('name')         // 'Bar'

  // Create new 'description' property on `object`
  proxy.set('description', 'Foo is a whizboo baz');
  object.get('description')  // 'Foo is a whizboo baz'
  ```

  While `content` is unset, setting a property to be delegated will throw an
  Error.

  ```javascript
  proxy = Ember.ObjectProxy.create({
    content: null,
    flag: null
  });
  proxy.set('flag', true);
  proxy.get('flag');         // true
  proxy.get('foo');          // undefined
  proxy.set('foo', 'data');  // throws Error
  ```

  Delegated properties can be bound to and will change when content is updated.

  Computed properties on the proxy itself can depend on delegated properties.

  ```javascript
  ProxyWithComputedProperty = Ember.ObjectProxy.extend({
    fullName: function () {
      var firstName = this.get('firstName'),
          lastName = this.get('lastName');
      if (firstName && lastName) {
        return firstName + ' ' + lastName;
      }
      return firstName || lastName;
    }.property('firstName', 'lastName')
  });

  proxy = ProxyWithComputedProperty.create();

  proxy.get('fullName');  // undefined
  proxy.set('content', {
    firstName: 'Tom', lastName: 'Dale'
  }); // triggers property change for fullName on proxy

  proxy.get('fullName');  // 'Tom Dale'
  ```

  @class ObjectProxy
  @namespace Ember
  @extends Ember.Object
*/
Ember.ObjectProxy = Ember.Object.extend(
/** @scope Ember.ObjectProxy.prototype */ {
  /**
    The object whose properties will be forwarded.

    @property content
    @type Ember.Object
    @default null
  */
  content: null,
  _contentDidChange: Ember.observer(function() {
    Ember.assert("Can't set ObjectProxy's content to itself", this.get('content') !== this);
  }, 'content'),

  isTruthy: Ember.computed.bool('content'),

  _debugContainerKey: null,

  willWatchProperty: function (key) {
    var contentKey = 'content.' + key;
    addBeforeObserver(this, contentKey, null, contentPropertyWillChange);
    addObserver(this, contentKey, null, contentPropertyDidChange);
  },

  didUnwatchProperty: function (key) {
    var contentKey = 'content.' + key;
    removeBeforeObserver(this, contentKey, null, contentPropertyWillChange);
    removeObserver(this, contentKey, null, contentPropertyDidChange);
  },

  unknownProperty: function (key) {
    var content = get(this, 'content');
    if (content) {
      return get(content, key);
    }
  },

  setUnknownProperty: function (key, value) {
    var content = get(this, 'content');
    Ember.assert(fmt("Cannot delegate set('%@', %@) to the 'content' property of object proxy %@: its 'content' is undefined.", [key, value, this]), content);
    return set(content, key, value);
  }
});

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/


var set = Ember.set, get = Ember.get, guidFor = Ember.guidFor;
var forEach = Ember.EnumerableUtils.forEach;

var EachArray = Ember.Object.extend(Ember.Array, {

  init: function(content, keyName, owner) {
    this._super();
    this._keyName = keyName;
    this._owner   = owner;
    this._content = content;
  },

  objectAt: function(idx) {
    var item = this._content.objectAt(idx);
    return item && get(item, this._keyName);
  },

  length: Ember.computed(function() {
    var content = this._content;
    return content ? get(content, 'length') : 0;
  })

});

var IS_OBSERVER = /^.+:(before|change)$/;

function addObserverForContentKey(content, keyName, proxy, idx, loc) {
  var objects = proxy._objects, guid;
  if (!objects) objects = proxy._objects = {};

  while(--loc>=idx) {
    var item = content.objectAt(loc);
    if (item) {
      Ember.addBeforeObserver(item, keyName, proxy, 'contentKeyWillChange');
      Ember.addObserver(item, keyName, proxy, 'contentKeyDidChange');

      // keep track of the indicies each item was found at so we can map
      // it back when the obj changes.
      guid = guidFor(item);
      if (!objects[guid]) objects[guid] = [];
      objects[guid].push(loc);
    }
  }
}

function removeObserverForContentKey(content, keyName, proxy, idx, loc) {
  var objects = proxy._objects;
  if (!objects) objects = proxy._objects = {};
  var indicies, guid;

  while(--loc>=idx) {
    var item = content.objectAt(loc);
    if (item) {
      Ember.removeBeforeObserver(item, keyName, proxy, 'contentKeyWillChange');
      Ember.removeObserver(item, keyName, proxy, 'contentKeyDidChange');

      guid = guidFor(item);
      indicies = objects[guid];
      indicies[indicies.indexOf(loc)] = null;
    }
  }
}

/**
  This is the object instance returned when you get the `@each` property on an
  array. It uses the unknownProperty handler to automatically create
  EachArray instances for property names.

  @private
  @class EachProxy
  @namespace Ember
  @extends Ember.Object
*/
Ember.EachProxy = Ember.Object.extend({

  init: function(content) {
    this._super();
    this._content = content;
    content.addArrayObserver(this);

    // in case someone is already observing some keys make sure they are
    // added
    forEach(Ember.watchedEvents(this), function(eventName) {
      this.didAddListener(eventName);
    }, this);
  },

  /**
    You can directly access mapped properties by simply requesting them.
    The `unknownProperty` handler will generate an EachArray of each item.

    @method unknownProperty
    @param keyName {String}
    @param value {anything}
  */
  unknownProperty: function(keyName, value) {
    var ret;
    ret = new EachArray(this._content, keyName, this);
    Ember.defineProperty(this, keyName, null, ret);
    this.beginObservingContentKey(keyName);
    return ret;
  },

  // ..........................................................
  // ARRAY CHANGES
  // Invokes whenever the content array itself changes.

  arrayWillChange: function(content, idx, removedCnt, addedCnt) {
    var keys = this._keys, key, array, lim;

    lim = removedCnt>0 ? idx+removedCnt : -1;
    Ember.beginPropertyChanges(this);

    for(key in keys) {
      if (!keys.hasOwnProperty(key)) { continue; }

      if (lim>0) removeObserverForContentKey(content, key, this, idx, lim);

      Ember.propertyWillChange(this, key);
    }

    Ember.propertyWillChange(this._content, '@each');
    Ember.endPropertyChanges(this);
  },

  arrayDidChange: function(content, idx, removedCnt, addedCnt) {
    var keys = this._keys, key, array, lim;

    lim = addedCnt>0 ? idx+addedCnt : -1;
    Ember.beginPropertyChanges(this);

    for(key in keys) {
      if (!keys.hasOwnProperty(key)) { continue; }

      if (lim>0) addObserverForContentKey(content, key, this, idx, lim);

      Ember.propertyDidChange(this, key);
    }

    Ember.propertyDidChange(this._content, '@each');
    Ember.endPropertyChanges(this);
  },

  // ..........................................................
  // LISTEN FOR NEW OBSERVERS AND OTHER EVENT LISTENERS
  // Start monitoring keys based on who is listening...

  didAddListener: function(eventName) {
    if (IS_OBSERVER.test(eventName)) {
      this.beginObservingContentKey(eventName.slice(0, -7));
    }
  },

  didRemoveListener: function(eventName) {
    if (IS_OBSERVER.test(eventName)) {
      this.stopObservingContentKey(eventName.slice(0, -7));
    }
  },

  // ..........................................................
  // CONTENT KEY OBSERVING
  // Actual watch keys on the source content.

  beginObservingContentKey: function(keyName) {
    var keys = this._keys;
    if (!keys) keys = this._keys = {};
    if (!keys[keyName]) {
      keys[keyName] = 1;
      var content = this._content,
          len = get(content, 'length');
      addObserverForContentKey(content, keyName, this, 0, len);
    } else {
      keys[keyName]++;
    }
  },

  stopObservingContentKey: function(keyName) {
    var keys = this._keys;
    if (keys && (keys[keyName]>0) && (--keys[keyName]<=0)) {
      var content = this._content,
          len     = get(content, 'length');
      removeObserverForContentKey(content, keyName, this, 0, len);
    }
  },

  contentKeyWillChange: function(obj, keyName) {
    Ember.propertyWillChange(this, keyName);
  },

  contentKeyDidChange: function(obj, keyName) {
    Ember.propertyDidChange(this, keyName);
  }

});



})();



(function() {
/**
@module ember
@submodule ember-runtime
*/


var get = Ember.get, set = Ember.set;

// Add Ember.Array to Array.prototype. Remove methods with native
// implementations and supply some more optimized versions of generic methods
// because they are so common.
var NativeArray = Ember.Mixin.create(Ember.MutableArray, Ember.Observable, Ember.Copyable, {

  // because length is a built-in property we need to know to just get the
  // original property.
  get: function(key) {
    if (key==='length') return this.length;
    else if ('number' === typeof key) return this[key];
    else return this._super(key);
  },

  objectAt: function(idx) {
    return this[idx];
  },

  // primitive for array support.
  replace: function(idx, amt, objects) {

    if (this.isFrozen) throw Ember.FROZEN_ERROR ;

    // if we replaced exactly the same number of items, then pass only the
    // replaced range. Otherwise, pass the full remaining array length
    // since everything has shifted
    var len = objects ? get(objects, 'length') : 0;
    this.arrayContentWillChange(idx, amt, len);

    if (!objects || objects.length === 0) {
      this.splice(idx, amt) ;
    } else {
      var args = [idx, amt].concat(objects) ;
      this.splice.apply(this,args) ;
    }

    this.arrayContentDidChange(idx, amt, len);
    return this ;
  },

  // If you ask for an unknown property, then try to collect the value
  // from member items.
  unknownProperty: function(key, value) {
    var ret;// = this.reducedProperty(key, value) ;
    if ((value !== undefined) && ret === undefined) {
      ret = this[key] = value;
    }
    return ret ;
  },

  // If browser did not implement indexOf natively, then override with
  // specialized version
  indexOf: function(object, startAt) {
    var idx, len = this.length;

    if (startAt === undefined) startAt = 0;
    else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
    if (startAt < 0) startAt += len;

    for(idx=startAt;idx<len;idx++) {
      if (this[idx] === object) return idx ;
    }
    return -1;
  },

  lastIndexOf: function(object, startAt) {
    var idx, len = this.length;

    if (startAt === undefined) startAt = len-1;
    else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);
    if (startAt < 0) startAt += len;

    for(idx=startAt;idx>=0;idx--) {
      if (this[idx] === object) return idx ;
    }
    return -1;
  },

  copy: function(deep) {
    if (deep) {
      return this.map(function(item){ return Ember.copy(item, true); });
    }

    return this.slice();
  }
});

// Remove any methods implemented natively so we don't override them
var ignore = ['length'];
Ember.EnumerableUtils.forEach(NativeArray.keys(), function(methodName) {
  if (Array.prototype[methodName]) ignore.push(methodName);
});

if (ignore.length>0) {
  NativeArray = NativeArray.without.apply(NativeArray, ignore);
}

/**
  The NativeArray mixin contains the properties needed to to make the native
  Array support Ember.MutableArray and all of its dependent APIs. Unless you
  have `Ember.EXTEND_PROTOTYPES or `Ember.EXTEND_PROTOTYPES.Array` set to
  false, this will be applied automatically. Otherwise you can apply the mixin
  at anytime by calling `Ember.NativeArray.activate`.

  @class NativeArray
  @namespace Ember
  @extends Ember.Mixin
  @uses Ember.MutableArray
  @uses Ember.MutableEnumerable
  @uses Ember.Copyable
  @uses Ember.Freezable
*/
Ember.NativeArray = NativeArray;

/**
  Creates an `Ember.NativeArray` from an Array like object.
  Does not modify the original object.

  @method A
  @for Ember
  @return {Ember.NativeArray}
*/
Ember.A = function(arr){
  if (arr === undefined) { arr = []; }
  return Ember.Array.detect(arr) ? arr : Ember.NativeArray.apply(arr);
};

/**
  Activates the mixin on the Array.prototype if not already applied. Calling
  this method more than once is safe.

  @method activate
  @for Ember.NativeArray
  @static
  @return {void}
*/
Ember.NativeArray.activate = function() {
  NativeArray.apply(Array.prototype);

  Ember.A = function(arr) { return arr || []; };
};

if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.Array) {
  Ember.NativeArray.activate();
}


})();



(function() {
var DeferredMixin = Ember.DeferredMixin, // mixins/deferred
    EmberObject = Ember.Object,          // system/object
    get = Ember.get;

var Deferred = Ember.Object.extend(DeferredMixin);

Deferred.reopenClass({
  promise: function(callback, binding) {
    var deferred = Deferred.create();
    callback.call(binding, deferred);
    return get(deferred, 'promise');
  }
});

Ember.Deferred = Deferred;

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var loadHooks = Ember.ENV.EMBER_LOAD_HOOKS || {};
var loaded = {};

/**
@method onLoad
@for Ember
@param name {String} name of hook
@param callback {Function} callback to be called
*/
Ember.onLoad = function(name, callback) {
  var object;

  loadHooks[name] = loadHooks[name] || Ember.A();
  loadHooks[name].pushObject(callback);

  if (object = loaded[name]) {
    callback(object);
  }
};

/**
@method runLoadHooks
@for Ember
@param name {String} name of hook
@param object {Object} object to pass to callbacks
*/
Ember.runLoadHooks = function(name, object) {
  var hooks;

  loaded[name] = object;

  if (hooks = loadHooks[name]) {
    loadHooks[name].forEach(function(callback) {
      callback(object);
    });
  }
};

})();



(function() {

})();



(function() {
var get = Ember.get;

/**
@module ember
@submodule ember-runtime
*/

/**
  `Ember.ControllerMixin` provides a standard interface for all classes that
  compose Ember's controller layer: `Ember.Controller`,
  `Ember.ArrayController`, and `Ember.ObjectController`.

  Within an `Ember.Router`-managed application single shared instaces of every
  Controller object in your application's namespace will be added to the
  application's `Ember.Router` instance. See `Ember.Application#initialize`
  for additional information.

  ## Views

  By default a controller instance will be the rendering context
  for its associated `Ember.View.` This connection is made during calls to
  `Ember.ControllerMixin#connectOutlet`.

  Within the view's template, the `Ember.View` instance can be accessed
  through the controller with `{{view}}`.

  ## Target Forwarding

  By default a controller will target your application's `Ember.Router`
  instance. Calls to `{{action}}` within the template of a controller's view
  are forwarded to the router. See `Ember.Handlebars.helpers.action` for
  additional information.

  @class ControllerMixin
  @namespace Ember
  @extends Ember.Mixin
*/
Ember.ControllerMixin = Ember.Mixin.create({
  /* ducktype as a controller */
  isController: true,

  /**
    The object to which events from the view should be sent.

    For example, when a Handlebars template uses the `{{action}}` helper,
    it will attempt to send the event to the view's controller's `target`.

    By default, a controller's `target` is set to the router after it is
    instantiated by `Ember.Application#initialize`.

    @property target
    @default null
  */
  target: null,

  container: null,

  store: null,

  model: Ember.computed.alias('content'),

  send: function(actionName) {
    var args = [].slice.call(arguments, 1), target;

    if (this[actionName]) {
      Ember.assert("The controller " + this + " does not have the action " + actionName, typeof this[actionName] === 'function');
      this[actionName].apply(this, args);
    } else if(target = get(this, 'target')) {
      Ember.assert("The target for controller " + this + " (" + target + ") did not define a `send` method", typeof target.send === 'function');
      target.send.apply(target, arguments);
    }
  }
});

/**
  @class Controller
  @namespace Ember
  @extends Ember.Object
  @uses Ember.ControllerMixin
*/
Ember.Controller = Ember.Object.extend(Ember.ControllerMixin);

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var get = Ember.get, set = Ember.set, forEach = Ember.EnumerableUtils.forEach;

/**
  `Ember.SortableMixin` provides a standard interface for array proxies
  to specify a sort order and maintain this sorting when objects are added,
  removed, or updated without changing the implicit order of their underlying
  content array:

  ```javascript
  songs = [
    {trackNumber: 4, title: 'Ob-La-Di, Ob-La-Da'},
    {trackNumber: 2, title: 'Back in the U.S.S.R.'},
    {trackNumber: 3, title: 'Glass Onion'},
  ];

  songsController = Ember.ArrayController.create({
    content: songs,
    sortProperties: ['trackNumber'],
    sortAscending: true
  });

  songsController.get('firstObject');  // {trackNumber: 2, title: 'Back in the U.S.S.R.'}

  songsController.addObject({trackNumber: 1, title: 'Dear Prudence'});
  songsController.get('firstObject');  // {trackNumber: 1, title: 'Dear Prudence'}
  ```

  @class SortableMixin
  @namespace Ember
  @extends Ember.Mixin
  @uses Ember.MutableEnumerable
*/
Ember.SortableMixin = Ember.Mixin.create(Ember.MutableEnumerable, {

  /**
    Specifies which properties dictate the arrangedContent's sort order.

    @property {Array} sortProperties
  */
  sortProperties: null,

  /**
    Specifies the arrangedContent's sort direction

    @property {Boolean} sortAscending
  */
  sortAscending: true,

  orderBy: function(item1, item2) {
    var result = 0,
        sortProperties = get(this, 'sortProperties'),
        sortAscending = get(this, 'sortAscending');

    Ember.assert("you need to define `sortProperties`", !!sortProperties);

    forEach(sortProperties, function(propertyName) {
      if (result === 0) {
        result = Ember.compare(get(item1, propertyName), get(item2, propertyName));
        if ((result !== 0) && !sortAscending) {
          result = (-1) * result;
        }
      }
    });

    return result;
  },

  destroy: function() {
    var content = get(this, 'content'),
        sortProperties = get(this, 'sortProperties');

    if (content && sortProperties) {
      forEach(content, function(item) {
        forEach(sortProperties, function(sortProperty) {
          Ember.removeObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
        }, this);
      }, this);
    }

    return this._super();
  },

  isSorted: Ember.computed.bool('sortProperties'),

  arrangedContent: Ember.computed('content', 'sortProperties.@each', function(key, value) {
    var content = get(this, 'content'),
        isSorted = get(this, 'isSorted'),
        sortProperties = get(this, 'sortProperties'),
        self = this;

    if (content && isSorted) {
      content = content.slice();
      content.sort(function(item1, item2) {
        return self.orderBy(item1, item2);
      });
      forEach(content, function(item) {
        forEach(sortProperties, function(sortProperty) {
          Ember.addObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
        }, this);
      }, this);
      return Ember.A(content);
    }

    return content;
  }),

  _contentWillChange: Ember.beforeObserver(function() {
    var content = get(this, 'content'),
        sortProperties = get(this, 'sortProperties');

    if (content && sortProperties) {
      forEach(content, function(item) {
        forEach(sortProperties, function(sortProperty) {
          Ember.removeObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
        }, this);
      }, this);
    }

    this._super();
  }, 'content'),

  sortAscendingWillChange: Ember.beforeObserver(function() {
    this._lastSortAscending = get(this, 'sortAscending');
  }, 'sortAscending'),

  sortAscendingDidChange: Ember.observer(function() {
    if (get(this, 'sortAscending') !== this._lastSortAscending) {
      var arrangedContent = get(this, 'arrangedContent');
      arrangedContent.reverseObjects();
    }
  }, 'sortAscending'),

  contentArrayWillChange: function(array, idx, removedCount, addedCount) {
    var isSorted = get(this, 'isSorted');

    if (isSorted) {
      var arrangedContent = get(this, 'arrangedContent');
      var removedObjects = array.slice(idx, idx+removedCount);
      var sortProperties = get(this, 'sortProperties');

      forEach(removedObjects, function(item) {
        arrangedContent.removeObject(item);

        forEach(sortProperties, function(sortProperty) {
          Ember.removeObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
        }, this);
      }, this);
    }

    return this._super(array, idx, removedCount, addedCount);
  },

  contentArrayDidChange: function(array, idx, removedCount, addedCount) {
    var isSorted = get(this, 'isSorted'),
        sortProperties = get(this, 'sortProperties');

    if (isSorted) {
      var addedObjects = array.slice(idx, idx+addedCount);
      var arrangedContent = get(this, 'arrangedContent');

      forEach(addedObjects, function(item) {
        this.insertItemSorted(item);

        forEach(sortProperties, function(sortProperty) {
          Ember.addObserver(item, sortProperty, this, 'contentItemSortPropertyDidChange');
        }, this);
      }, this);
    }

    return this._super(array, idx, removedCount, addedCount);
  },

  insertItemSorted: function(item) {
    var arrangedContent = get(this, 'arrangedContent');
    var length = get(arrangedContent, 'length');

    var idx = this._binarySearch(item, 0, length);
    arrangedContent.insertAt(idx, item);
  },

  contentItemSortPropertyDidChange: function(item) {
    var arrangedContent = get(this, 'arrangedContent'),
        oldIndex = arrangedContent.indexOf(item),
        leftItem = arrangedContent.objectAt(oldIndex - 1),
        rightItem = arrangedContent.objectAt(oldIndex + 1),
        leftResult = leftItem && this.orderBy(item, leftItem),
        rightResult = rightItem && this.orderBy(item, rightItem);

    if (leftResult < 0 || rightResult > 0) {
      arrangedContent.removeObject(item);
      this.insertItemSorted(item);
    }
  },

  _binarySearch: function(item, low, high) {
    var mid, midItem, res, arrangedContent;

    if (low === high) {
      return low;
    }

    arrangedContent = get(this, 'arrangedContent');

    mid = low + Math.floor((high - low) / 2);
    midItem = arrangedContent.objectAt(mid);

    res = this.orderBy(midItem, item);

    if (res < 0) {
      return this._binarySearch(item, mid+1, high);
    } else if (res > 0) {
      return this._binarySearch(item, low, mid);
    }

    return mid;
  }
});

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

var get = Ember.get, set = Ember.set, isGlobalPath = Ember.isGlobalPath,
    forEach = Ember.EnumerableUtils.forEach, replace = Ember.EnumerableUtils.replace;

/**
  `Ember.ArrayController` provides a way for you to publish a collection of
  objects so that you can easily bind to the collection from a Handlebars
  `#each` helper, an `Ember.CollectionView`, or other controllers.

  The advantage of using an `ArrayController` is that you only have to set up
  your view bindings once; to change what's displayed, simply swap out the
  `content` property on the controller.

  For example, imagine you wanted to display a list of items fetched via an XHR
  request. Create an `Ember.ArrayController` and set its `content` property:

  ```javascript
  MyApp.listController = Ember.ArrayController.create();

  $.get('people.json', function(data) {
    MyApp.listController.set('content', data);
  });
  ```

  Then, create a view that binds to your new controller:

  ```handlebars
  {{#each MyApp.listController}}
    {{firstName}} {{lastName}}
  {{/each}}
  ```

  Although you are binding to the controller, the behavior of this controller
  is to pass through any methods or properties to the underlying array. This
  capability comes from `Ember.ArrayProxy`, which this class inherits from.

  Sometimes you want to display computed properties within the body of an
  `#each` helper that depend on the underlying items in `content`, but are not
  present on those items.   To do this, set `itemController` to the name of a
  controller (probably an `ObjectController`) that will wrap each individual item.

  For example:

  ```handlebars
    {{#each post in controller}}
      <li>{{title}} ({{titleLength}} characters)</li>
    {{/each}}
  ```

  ```javascript
  App.PostsController = Ember.ArrayController.extend({
    itemController: 'post'
  });

  App.PostController = Ember.ObjectController.extend({
    // the `title` property will be proxied to the underlying post.

    titleLength: function() {
      return this.get('title').length;
    }.property('title')
  });
  ```

  In some cases it is helpful to return a different `itemController` depending
  on the particular item.  Subclasses can do this by overriding
  `lookupItemController`.

  For example:

  ```javascript
  App.MyArrayController = Ember.ArrayController.extend({
    lookupItemController: function( object ) {
      if (object.get('isSpecial')) {
        return "special"; // use App.SpecialController
      } else {
        return "regular"; // use App.RegularController
      }
    }
  });
  ```

  @class ArrayController
  @namespace Ember
  @extends Ember.ArrayProxy
  @uses Ember.SortableMixin
  @uses Ember.ControllerMixin
*/

Ember.ArrayController = Ember.ArrayProxy.extend(Ember.ControllerMixin,
  Ember.SortableMixin, {

  /**
    The controller used to wrap items, if any.

    @property itemController
    @type String
    @default null
  */
  itemController: null,

  /**
    Return the name of the controller to wrap items, or `null` if items should
    be returned directly.  The default implementation simply returns the
    `itemController` property, but subclasses can override this method to return
    different controllers for different objects.

    For example:

    ```javascript
    App.MyArrayController = Ember.ArrayController.extend({
      lookupItemController: function( object ) {
        if (object.get('isSpecial')) {
          return "special"; // use App.SpecialController
        } else {
          return "regular"; // use App.RegularController
        }
      }
    });
    ```

    @method
    @type String
    @default null
  */
  lookupItemController: function(object) {
    return get(this, 'itemController');
  },

  objectAtContent: function(idx) {
    var length = get(this, 'length'),
        object = get(this,'arrangedContent').objectAt(idx);

    if (idx >= 0 && idx < length) {
      var controllerClass = this.lookupItemController(object);
      if (controllerClass) {
        return this.controllerAt(idx, object, controllerClass);
      }
    }

    // When `controllerClass` is falsy, we have not opted in to using item
    // controllers, so return the object directly.

    // When the index is out of range, we want to return the "out of range"
    // value, whatever that might be.  Rather than make assumptions
    // (e.g. guessing `null` or `undefined`) we defer this to `arrangedContent`.
    return object;
  },

  arrangedContentDidChange: function() {
    this._super();
    this._resetSubContainers();
  },

  arrayContentDidChange: function(idx, removedCnt, addedCnt) {
    var subContainers = get(this, 'subContainers'),
        subContainersToRemove = subContainers.slice(idx, idx+removedCnt);

    forEach(subContainersToRemove, function(subContainer) {
      if (subContainer) { subContainer.destroy(); }
    });

    replace(subContainers, idx, removedCnt, new Array(addedCnt));

    // The shadow array of subcontainers must be updated before we trigger
    // observers, otherwise observers will get the wrong subcontainer when
    // calling `objectAt`
    this._super(idx, removedCnt, addedCnt);
  },

  init: function() {
    this._super();
    if (!this.get('content')) { this.set('content', Ember.A()); }
    this._resetSubContainers();
  },

  controllerAt: function(idx, object, controllerClass) {
    var container = get(this, 'container'),
        subContainers = get(this, 'subContainers'),
        subContainer = subContainers[idx],
        controller;

    if (!subContainer) {
      subContainer = subContainers[idx] = container.child();
    }

    controller = subContainer.lookup("controller:" + controllerClass);
    if (!controller) {
      throw new Error('Could not resolve itemController: "' + controllerClass + '"');
    }

    controller.set('target', this);
    controller.set('content', object);

    return controller;
  },

  subContainers: null,

  _resetSubContainers: function() {
    var subContainers = get(this, 'subContainers');

    if (subContainers) {
      forEach(subContainers, function(subContainer) {
        if (subContainer) { subContainer.destroy(); }
      });
    }

    this.set('subContainers', Ember.A());
  }
});

})();



(function() {
/**
@module ember
@submodule ember-runtime
*/

/**
  `Ember.ObjectController` is part of Ember's Controller layer. A single shared
  instance of each `Ember.ObjectController` subclass in your application's
  namespace will be created at application initialization and be stored on your
  application's `Ember.Router` instance.

  `Ember.ObjectController` derives its functionality from its superclass
  `Ember.ObjectProxy` and the `Ember.ControllerMixin` mixin.

  @class ObjectController
  @namespace Ember
  @extends Ember.ObjectProxy
  @uses Ember.ControllerMixin
**/
Ember.ObjectController = Ember.ObjectProxy.extend(Ember.ControllerMixin);

})();



(function() {

})();



(function() {
/**
Ember Runtime

@module ember
@submodule ember-runtime
@requires ember-metal
*/

})();

(function() {
/**
@module ember
@submodule ember-views
*/

var jQuery = Ember.imports.jQuery;
Ember.assert("Ember Views require jQuery 1.8 or 1.9", jQuery && (jQuery().jquery.match(/^1\.(8|9)(\.\d+)?(pre|rc\d?)?/) || Ember.ENV.FORCE_JQUERY));

/**
  Alias for jQuery

  @method $
  @for Ember
*/
Ember.$ = jQuery;

})();



(function() {
/**
@module ember
@submodule ember-views
*/

// http://www.whatwg.org/specs/web-apps/current-work/multipage/dnd.html#dndevents
var dragEvents = Ember.String.w('dragstart drag dragenter dragleave dragover drop dragend');

// Copies the `dataTransfer` property from a browser event object onto the
// jQuery event object for the specified events
Ember.EnumerableUtils.forEach(dragEvents, function(eventName) {
  Ember.$.event.fixHooks[eventName] = { props: ['dataTransfer'] };
});

})();



(function() {
/**
@module ember
@submodule ember-views
*/

/*** BEGIN METAMORPH HELPERS ***/

// Internet Explorer prior to 9 does not allow setting innerHTML if the first element
// is a "zero-scope" element. This problem can be worked around by making
// the first node an invisible text node. We, like Modernizr, use &shy;
var needsShy = (function(){
  var testEl = document.createElement('div');
  testEl.innerHTML = "<div></div>";
  testEl.firstChild.innerHTML = "<script></script>";
  return testEl.firstChild.innerHTML === '';
})();

// IE 8 (and likely earlier) likes to move whitespace preceeding
// a script tag to appear after it. This means that we can
// accidentally remove whitespace when updating a morph.
var movesWhitespace = (function() {
  var testEl = document.createElement('div');
  testEl.innerHTML = "Test: <script type='text/x-placeholder'></script>Value";
  return testEl.childNodes[0].nodeValue === 'Test:' &&
          testEl.childNodes[2].nodeValue === ' Value';
})();

// Use this to find children by ID instead of using jQuery
var findChildById = function(element, id) {
  if (element.getAttribute('id') === id) { return element; }

  var len = element.childNodes.length, idx, node, found;
  for (idx=0; idx<len; idx++) {
    node = element.childNodes[idx];
    found = node.nodeType === 1 && findChildById(node, id);
    if (found) { return found; }
  }
};

var setInnerHTMLWithoutFix = function(element, html) {
  if (needsShy) {
    html = '&shy;' + html;
  }

  var matches = [];
  if (movesWhitespace) {
    // Right now we only check for script tags with ids with the
    // goal of targeting morphs.
    html = html.replace(/(\s+)(<script id='([^']+)')/g, function(match, spaces, tag, id) {
      matches.push([id, spaces]);
      return tag;
    });
  }

  element.innerHTML = html;

  // If we have to do any whitespace adjustments do them now
  if (matches.length > 0) {
    var len = matches.length, idx;
    for (idx=0; idx<len; idx++) {
      var script = findChildById(element, matches[idx][0]),
          node = document.createTextNode(matches[idx][1]);
      script.parentNode.insertBefore(node, script);
    }
  }

  if (needsShy) {
    var shyElement = element.firstChild;
    while (shyElement.nodeType === 1 && !shyElement.nodeName) {
      shyElement = shyElement.firstChild;
    }
    if (shyElement.nodeType === 3 && shyElement.nodeValue.charAt(0) === "\u00AD") {
      shyElement.nodeValue = shyElement.nodeValue.slice(1);
    }
  }
};

/*** END METAMORPH HELPERS */


var innerHTMLTags = {};
var canSetInnerHTML = function(tagName) {
  if (innerHTMLTags[tagName] !== undefined) {
    return innerHTMLTags[tagName];
  }

  var canSet = true;

  // IE 8 and earlier don't allow us to do innerHTML on select
  if (tagName.toLowerCase() === 'select') {
    var el = document.createElement('select');
    setInnerHTMLWithoutFix(el, '<option value="test">Test</option>');
    canSet = el.options.length === 1;
  }

  innerHTMLTags[tagName] = canSet;

  return canSet;
};

var setInnerHTML = function(element, html) {
  var tagName = element.tagName;

  if (canSetInnerHTML(tagName)) {
    setInnerHTMLWithoutFix(element, html);
  } else {
    Ember.assert("Can't set innerHTML on "+element.tagName+" in this browser", element.outerHTML);

    var startTag = element.outerHTML.match(new RegExp("<"+tagName+"([^>]*)>", 'i'))[0],
        endTag = '</'+tagName+'>';

    var wrapper = document.createElement('div');
    setInnerHTMLWithoutFix(wrapper, startTag + html + endTag);
    element = wrapper.firstChild;
    while (element.tagName !== tagName) {
      element = element.nextSibling;
    }
  }

  return element;
};

function isSimpleClick(event) {
  var modifier = event.shiftKey || event.metaKey || event.altKey || event.ctrlKey,
      secondaryClick = event.which > 1; // IE9 may return undefined

  return !modifier && !secondaryClick;
}

Ember.ViewUtils = {
  setInnerHTML: setInnerHTML,
  isSimpleClick: isSimpleClick
};

})();



(function() {
/**
@module ember
@submodule ember-views
*/

var get = Ember.get, set = Ember.set;
var indexOf = Ember.ArrayPolyfills.indexOf;





var ClassSet = function() {
  this.seen = {};
  this.list = [];
};

ClassSet.prototype = {
  add: function(string) {
    if (string in this.seen) { return; }
    this.seen[string] = true;

    this.list.push(string);
  },

  toDOM: function() {
    return this.list.join(" ");
  }
};

/**
  `Ember.RenderBuffer` gathers information regarding the a view and generates the
  final representation. `Ember.RenderBuffer` will generate HTML which can be pushed
  to the DOM.

  @class RenderBuffer
  @namespace Ember
  @constructor
*/
Ember.RenderBuffer = function(tagName) {
  return new Ember._RenderBuffer(tagName);
};

Ember._RenderBuffer = function(tagName) {
  this.tagNames = [tagName || null];
  this.buffer = [];
};

Ember._RenderBuffer.prototype =
/** @scope Ember.RenderBuffer.prototype */ {

  // The root view's element
  _element: null,

  /**
    @private

    An internal set used to de-dupe class names when `addClass()` is
    used. After each call to `addClass()`, the `classes` property
    will be updated.

    @property elementClasses
    @type Array
    @default []
  */
  elementClasses: null,

  /**
    Array of class names which will be applied in the class attribute.

    You can use `setClasses()` to set this property directly. If you
    use `addClass()`, it will be maintained for you.

    @property classes
    @type Array
    @default []
  */
  classes: null,

  /**
    The id in of the element, to be applied in the id attribute.

    You should not set this property yourself, rather, you should use
    the `id()` method of `Ember.RenderBuffer`.

    @property elementId
    @type String
    @default null
  */
  elementId: null,

  /**
    A hash keyed on the name of the attribute and whose value will be
    applied to that attribute. For example, if you wanted to apply a
    `data-view="Foo.bar"` property to an element, you would set the
    elementAttributes hash to `{'data-view':'Foo.bar'}`.

    You should not maintain this hash yourself, rather, you should use
    the `attr()` method of `Ember.RenderBuffer`.

    @property elementAttributes
    @type Hash
    @default {}
  */
  elementAttributes: null,

  /**
    A hash keyed on the name of the properties and whose value will be
    applied to that property. For example, if you wanted to apply a
    `checked=true` property to an element, you would set the
    elementProperties hash to `{'checked':true}`.

    You should not maintain this hash yourself, rather, you should use
    the `prop()` method of `Ember.RenderBuffer`.

    @property elementProperties
    @type Hash
    @default {}
  */
  elementProperties: null,

  /**
    The tagname of the element an instance of `Ember.RenderBuffer` represents.

    Usually, this gets set as the first parameter to `Ember.RenderBuffer`. For
    example, if you wanted to create a `p` tag, then you would call

    ```javascript
    Ember.RenderBuffer('p')
    ```

    @property elementTag
    @type String
    @default null
  */
  elementTag: null,

  /**
    A hash keyed on the name of the style attribute and whose value will
    be applied to that attribute. For example, if you wanted to apply a
    `background-color:black;` style to an element, you would set the
    elementStyle hash to `{'background-color':'black'}`.

    You should not maintain this hash yourself, rather, you should use
    the `style()` method of `Ember.RenderBuffer`.

    @property elementStyle
    @type Hash
    @default {}
  */
  elementStyle: null,

  /**
    Nested `RenderBuffers` will set this to their parent `RenderBuffer`
    instance.

    @property parentBuffer
    @type Ember._RenderBuffer
  */
  parentBuffer: null,

  /**
    Adds a string of HTML to the `RenderBuffer`.

    @method push
    @param {String} string HTML to push into the buffer
    @chainable
  */
  push: function(string) {
    this.buffer.push(string);
    return this;
  },

  /**
    Adds a class to the buffer, which will be rendered to the class attribute.

    @method addClass
    @param {String} className Class name to add to the buffer
    @chainable
  */
  addClass: function(className) {
    // lazily create elementClasses
    var elementClasses = this.elementClasses = (this.elementClasses || new ClassSet());
    this.elementClasses.add(className);
    this.classes = this.elementClasses.list;

    return this;
  },

  setClasses: function(classNames) {
    this.classes = classNames;
  },

  /**
    Sets the elementID to be used for the element.

    @method id
    @param {String} id
    @chainable
  */
  id: function(id) {
    this.elementId = id;
    return this;
  },

  // duck type attribute functionality like jQuery so a render buffer
  // can be used like a jQuery object in attribute binding scenarios.

  /**
    Adds an attribute which will be rendered to the element.

    @method attr
    @param {String} name The name of the attribute
    @param {String} value The value to add to the attribute
    @chainable
    @return {Ember.RenderBuffer|String} this or the current attribute value
  */
  attr: function(name, value) {
    var attributes = this.elementAttributes = (this.elementAttributes || {});

    if (arguments.length === 1) {
      return attributes[name];
    } else {
      attributes[name] = value;
    }

    return this;
  },

  /**
    Remove an attribute from the list of attributes to render.

    @method removeAttr
    @param {String} name The name of the attribute
    @chainable
  */
  removeAttr: function(name) {
    var attributes = this.elementAttributes;
    if (attributes) { delete attributes[name]; }

    return this;
  },

  /**
    Adds an property which will be rendered to the element.

    @method prop
    @param {String} name The name of the property
    @param {String} value The value to add to the property
    @chainable
    @return {Ember.RenderBuffer|String} this or the current property value
  */
  prop: function(name, value) {
    var properties = this.elementProperties = (this.elementProperties || {});

    if (arguments.length === 1) {
      return properties[name];
    } else {
      properties[name] = value;
    }

    return this;
  },

  /**
    Remove an property from the list of properties to render.

    @method removeProp
    @param {String} name The name of the property
    @chainable
  */
  removeProp: function(name) {
    var properties = this.elementProperties;
    if (properties) { delete properties[name]; }

    return this;
  },

  /**
    Adds a style to the style attribute which will be rendered to the element.

    @method style
    @param {String} name Name of the style
    @param {String} value
    @chainable
  */
  style: function(name, value) {
    var style = this.elementStyle = (this.elementStyle || {});

    this.elementStyle[name] = value;
    return this;
  },

  begin: function(tagName) {
    this.tagNames.push(tagName || null);
    return this;
  },

  pushOpeningTag: function() {
    var tagName = this.currentTagName();
    if (!tagName) { return; }

    if (!this._element && this.buffer.length === 0) {
      this._element = this.generateElement();
      return;
    }

    var buffer = this.buffer,
        id = this.elementId,
        classes = this.classes,
        attrs = this.elementAttributes,
        props = this.elementProperties,
        style = this.elementStyle,
        attr, prop;

    buffer.push('<' + tagName);

    if (id) {
      buffer.push(' id="' + this._escapeAttribute(id) + '"');
      this.elementId = null;
    }
    if (classes) {
      buffer.push(' class="' + this._escapeAttribute(classes.join(' ')) + '"');
      this.classes = null;
    }

    if (style) {
      buffer.push(' style="');

      for (prop in style) {
        if (style.hasOwnProperty(prop)) {
          buffer.push(prop + ':' + this._escapeAttribute(style[prop]) + ';');
        }
      }

      buffer.push('"');

      this.elementStyle = null;
    }

    if (attrs) {
      for (attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
          buffer.push(' ' + attr + '="' + this._escapeAttribute(attrs[attr]) + '"');
        }
      }

      this.elementAttributes = null;
    }

    if (props) {
      for (prop in props) {
        if (props.hasOwnProperty(prop)) {
          var value = props[prop];
          if (value || typeof(value) === 'number') {
            if (value === true) {
              buffer.push(' ' + prop + '="' + prop + '"');
            } else {
              buffer.push(' ' + prop + '="' + this._escapeAttribute(props[prop]) + '"');
            }
          }
        }
      }

      this.elementProperties = null;
    }

    buffer.push('>');
  },

  pushClosingTag: function() {
    var tagName = this.tagNames.pop();
    if (tagName) { this.buffer.push('</' + tagName + '>'); }
  },

  currentTagName: function() {
    return this.tagNames[this.tagNames.length-1];
  },

  generateElement: function() {
    var tagName = this.tagNames.pop(), // pop since we don't need to close
        element = document.createElement(tagName),
        $element = Ember.$(element),
        id = this.elementId,
        classes = this.classes,
        attrs = this.elementAttributes,
        props = this.elementProperties,
        style = this.elementStyle,
        styleBuffer = '', attr, prop;

    if (id) {
      $element.attr('id', id);
      this.elementId = null;
    }
    if (classes) {
      $element.attr('class', classes.join(' '));
      this.classes = null;
    }

    if (style) {
      for (prop in style) {
        if (style.hasOwnProperty(prop)) {
          styleBuffer += (prop + ':' + style[prop] + ';');
        }
      }

      $element.attr('style', styleBuffer);

      this.elementStyle = null;
    }

    if (attrs) {
      for (attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
          $element.attr(attr, attrs[attr]);
        }
      }

      this.elementAttributes = null;
    }

    if (props) {
      for (prop in props) {
        if (props.hasOwnProperty(prop)) {
          $element.prop(prop, props[prop]);
        }
      }

      this.elementProperties = null;
    }

    return element;
  },

  /**
    @method element
    @return {DOMElement} The element corresponding to the generated HTML
      of this buffer
  */
  element: function() {
    var html = this.innerString();

    if (html) {
      this._element = Ember.ViewUtils.setInnerHTML(this._element, html);
    }

    return this._element;
  },

  /**
    Generates the HTML content for this buffer.

    @method string
    @return {String} The generated HTML
  */
  string: function() {
    if (this._element) {
      return this.element().outerHTML;
    } else {
      return this.innerString();
    }
  },

  innerString: function() {
    return this.buffer.join('');
  },

  _escapeAttribute: function(value) {
    // Stolen shamelessly from Handlebars

    var escape = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
      "`": "&#x60;"
    };

    var badChars = /&(?!\w+;)|[<>"'`]/g;
    var possible = /[&<>"'`]/;

    var escapeChar = function(chr) {
      return escape[chr] || "&amp;";
    };

    var string = value.toString();

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  }

};

})();



(function() {
/**
@module ember
@submodule ember-views
*/

var get = Ember.get, set = Ember.set, fmt = Ember.String.fmt;

/**
  `Ember.EventDispatcher` handles delegating browser events to their
  corresponding `Ember.Views.` For example, when you click on a view,
  `Ember.EventDispatcher` ensures that that view's `mouseDown` method gets
  called.

  @class EventDispatcher
  @namespace Ember
  @private
  @extends Ember.Object
*/
Ember.EventDispatcher = Ember.Object.extend(
/** @scope Ember.EventDispatcher.prototype */{

  /**
    @private

    The root DOM element to which event listeners should be attached. Event
    listeners will be attached to the document unless this is overridden.

    Can be specified as a DOMElement or a selector string.

    The default body is a string since this may be evaluated before document.body
    exists in the DOM.

    @property rootElement
    @type DOMElement
    @default 'body'
  */
  rootElement: 'body',

  /**
    @private

    Sets up event listeners for standard browser events.

    This will be called after the browser sends a `DOMContentReady` event. By
    default, it will set up all of the listeners on the document body. If you
    would like to register the listeners on a different element, set the event
    dispatcher's `root` property.

    @method setup
    @param addedEvents {Hash}
  */
  setup: function(addedEvents) {
    var event, events = {
      touchstart  : 'touchStart',
      touchmove   : 'touchMove',
      touchend    : 'touchEnd',
      touchcancel : 'touchCancel',
      keydown     : 'keyDown',
      keyup       : 'keyUp',
      keypress    : 'keyPress',
      mousedown   : 'mouseDown',
      mouseup     : 'mouseUp',
      contextmenu : 'contextMenu',
      click       : 'click',
      dblclick    : 'doubleClick',
      mousemove   : 'mouseMove',
      focusin     : 'focusIn',
      focusout    : 'focusOut',
      mouseenter  : 'mouseEnter',
      mouseleave  : 'mouseLeave',
      submit      : 'submit',
      input       : 'input',
      change      : 'change',
      dragstart   : 'dragStart',
      drag        : 'drag',
      dragenter   : 'dragEnter',
      dragleave   : 'dragLeave',
      dragover    : 'dragOver',
      drop        : 'drop',
      dragend     : 'dragEnd'
    };

    Ember.$.extend(events, addedEvents || {});

    var rootElement = Ember.$(get(this, 'rootElement'));

    Ember.assert(fmt('You cannot use the same root element (%@) multiple times in an Ember.Application', [rootElement.selector || rootElement[0].tagName]), !rootElement.is('.ember-application'));
    Ember.assert('You cannot make a new Ember.Application using a root element that is a descendent of an existing Ember.Application', !rootElement.closest('.ember-application').length);
    Ember.assert('You cannot make a new Ember.Application using a root element that is an ancestor of an existing Ember.Application', !rootElement.find('.ember-application').length);

    rootElement.addClass('ember-application');

    Ember.assert('Unable to add "ember-application" class to rootElement. Make sure you set rootElement to the body or an element in the body.', rootElement.is('.ember-application'));

    for (event in events) {
      if (events.hasOwnProperty(event)) {
        this.setupHandler(rootElement, event, events[event]);
      }
    }
  },

  /**
    @private

    Registers an event listener on the document. If the given event is
    triggered, the provided event handler will be triggered on the target view.

    If the target view does not implement the event handler, or if the handler
    returns `false`, the parent view will be called. The event will continue to
    bubble to each successive parent view until it reaches the top.

    For example, to have the `mouseDown` method called on the target view when
    a `mousedown` event is received from the browser, do the following:

    ```javascript
    setupHandler('mousedown', 'mouseDown');
    ```

    @method setupHandler
    @param {Element} rootElement
    @param {String} event the browser-originated event to listen to
    @param {String} eventName the name of the method to call on the view
  */
  setupHandler: function(rootElement, event, eventName) {
    var self = this;

    rootElement.delegate('.ember-view', event + '.ember', function(evt, triggeringManager) {
      return Ember.handleErrors(function() {
        var view = Ember.View.views[this.id],
            result = true, manager = null;

        manager = self._findNearestEventManager(view,eventName);

        if (manager && manager !== triggeringManager) {
          result = self._dispatchEvent(manager, evt, eventName, view);
        } else if (view) {
          result = self._bubbleEvent(view,evt,eventName);
        } else {
          evt.stopPropagation();
        }

        return result;
      }, this);
    });

    rootElement.delegate('[data-ember-action]', event + '.ember', function(evt) {
      return Ember.handleErrors(function() {
        var actionId = Ember.$(evt.currentTarget).attr('data-ember-action'),
            action   = Ember.Handlebars.ActionHelper.registeredActions[actionId];

        // We have to check for action here since in some cases, jQuery will trigger
        // an event on `removeChild` (i.e. focusout) after we've already torn down the
        // action handlers for the view.
        if (action && action.eventName === eventName) {
          return action.handler(evt);
        }
      }, this);
    });
  },

  _findNearestEventManager: function(view, eventName) {
    var manager = null;

    while (view) {
      manager = get(view, 'eventManager');
      if (manager && manager[eventName]) { break; }

      view = get(view, 'parentView');
    }

    return manager;
  },

  _dispatchEvent: function(object, evt, eventName, view) {
    var result = true;

    var handler = object[eventName];
    if (Ember.typeOf(handler) === 'function') {
      result = handler.call(object, evt, view);
      // Do not preventDefault in eventManagers.
      evt.stopPropagation();
    }
    else {
      result = this._bubbleEvent(view, evt, eventName);
    }

    return result;
  },

  _bubbleEvent: function(view, evt, eventName) {
    return Ember.run(function() {
      return view.handleEvent(eventName, evt);
    });
  },

  destroy: function() {
    var rootElement = get(this, 'rootElement');
    Ember.$(rootElement).undelegate('.ember').removeClass('ember-application');
    return this._super();
  }
});

})();



(function() {
/**
@module ember
@submodule ember-views
*/

// Add a new named queue for rendering views that happens
// after bindings have synced, and a queue for scheduling actions
// that that should occur after view rendering.
var queues = Ember.run.queues;
queues.splice(Ember.$.inArray('actions', queues)+1, 0, 'render', 'afterRender');

})();



(function() {
/**
@module ember
@submodule ember-views
*/

var get = Ember.get, set = Ember.set;

// Original class declaration and documentation in runtime/lib/controllers/controller.js
// NOTE: It may be possible with YUIDoc to combine docs in two locations

/**
Additional methods for the ControllerMixin

@class ControllerMixin
@namespace Ember
*/
Ember.ControllerMixin.reopen({
  target: null,
  namespace: null,
  view: null,
  container: null,
  _childContainers: null,

  init: function() {
    this._super();
    set(this, '_childContainers', {});
  },

  _modelDidChange: Ember.observer(function() {
    var containers = get(this, '_childContainers'),
        container;

    for (var prop in containers) {
      if (!containers.hasOwnProperty(prop)) { continue; }
      containers[prop].destroy();
    }

    set(this, '_childContainers', {});
  }, 'model')
});

})();



(function() {

})();



(function() {
var states = {};

/**
@module ember
@submodule ember-views
*/

var get = Ember.get, set = Ember.set, addObserver = Ember.addObserver, removeObserver = Ember.removeObserver;
var meta = Ember.meta, guidFor = Ember.guidFor, fmt = Ember.String.fmt;
var a_slice = [].slice;
var a_forEach = Ember.EnumerableUtils.forEach;
var a_addObject = Ember.EnumerableUtils.addObject;

var childViewsProperty = Ember.computed(function() {
  var childViews = this._childViews, ret = Ember.A(), view = this;

  a_forEach(childViews, function(view) {
    if (view.isVirtual) {
      ret.pushObjects(get(view, 'childViews'));
    } else {
      ret.push(view);
    }
  });

  ret.replace = function (idx, removedCount, addedViews) {
    if (view instanceof Ember.ContainerView) {
      Ember.deprecate("Manipulating a Ember.ContainerView through its childViews property is deprecated. Please use the ContainerView instance itself as an Ember.MutableArray.");
      return view.replace(idx, removedCount, addedViews);
    }
    throw new Error("childViews is immutable");
  };

  return ret;
});

Ember.warn("The VIEW_PRESERVES_CONTEXT flag has been removed and the functionality can no longer be disabled.", Ember.ENV.VIEW_PRESERVES_CONTEXT !== false);

/**
  Global hash of shared templates. This will automatically be populated
  by the build tools so that you can store your Handlebars templates in
  separate files that get loaded into JavaScript at buildtime.

  @property TEMPLATES
  @for Ember
  @type Hash
*/
Ember.TEMPLATES = {};

Ember.CoreView = Ember.Object.extend(Ember.Evented, {
  isView: true,

  states: states,

  init: function() {
    this._super();

    // Register the view for event handling. This hash is used by
    // Ember.EventDispatcher to dispatch incoming events.
    if (!this.isVirtual) {
      Ember.assert("Attempted to register a view with an id already in use: "+this.elementId, !Ember.View.views[this.elementId]);
      Ember.View.views[this.elementId] = this;
    }

    this.addBeforeObserver('elementId', function() {
      throw new Error("Changing a view's elementId after creation is not allowed");
    });

    this.transitionTo('preRender');
  },

  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.

    @property parentView
    @type Ember.View
    @default null
  */
  parentView: Ember.computed(function() {
    var parent = this._parentView;

    if (parent && parent.isVirtual) {
      return get(parent, 'parentView');
    } else {
      return parent;
    }
  }).property('_parentView'),

  state: null,

  _parentView: null,

  // return the current view, not including virtual views
  concreteView: Ember.computed(function() {
    if (!this.isVirtual) { return this; }
    else { return get(this, 'parentView'); }
  }).property('parentView').volatile(),

  instrumentName: 'core_view',

  instrumentDetails: function(hash) {
    hash.object = this.toString();
  },

  /**
    @private

    Invoked by the view system when this view needs to produce an HTML
    representation. This method will create a new render buffer, if needed,
    then apply any default attributes, such as class names and visibility.
    Finally, the `render()` method is invoked, which is responsible for
    doing the bulk of the rendering.

    You should not need to override this method; instead, implement the
    `template` property, or if you need more control, override the `render`
    method.

    @method renderToBuffer
    @param {Ember.RenderBuffer} buffer the render buffer. If no buffer is
      passed, a default buffer, using the current view's `tagName`, will
      be used.
  */
  renderToBuffer: function(parentBuffer, bufferOperation) {
    var name = 'render.' + this.instrumentName,
        details = {};

    this.instrumentDetails(details);

    return Ember.instrument(name, details, function() {
      return this._renderToBuffer(parentBuffer, bufferOperation);
    }, this);
  },

  _renderToBuffer: function(parentBuffer, bufferOperation) {
    Ember.run.sync();

    // If this is the top-most view, start a new buffer. Otherwise,
    // create a new buffer relative to the original using the
    // provided buffer operation (for example, `insertAfter` will
    // insert a new buffer after the "parent buffer").
    var tagName = this.tagName;

    if (tagName === null || tagName === undefined) {
      tagName = 'div';
    }

    var buffer = this.buffer = parentBuffer && parentBuffer.begin(tagName) || Ember.RenderBuffer(tagName);
    this.transitionTo('inBuffer', false);

    this.beforeRender(buffer);
    this.render(buffer);
    this.afterRender(buffer);

    return buffer;
  },

  /**
    @private

    Override the default event firing from `Ember.Evented` to
    also call methods with the given name.

    @method trigger
    @param name {String}
  */
  trigger: function(name) {
    this._super.apply(this, arguments);
    var method = this[name];
    if (method) {
      var args = [], i, l;
      for (i = 1, l = arguments.length; i < l; i++) {
        args.push(arguments[i]);
      }
      return method.apply(this, args);
    }
  },

  has: function(name) {
    return Ember.typeOf(this[name]) === 'function' || this._super(name);
  },

  willDestroy: function() {
    var parent = this._parentView;

    // destroy the element -- this will avoid each child view destroying
    // the element over and over again...
    if (!this.removedFromDOM) { this.destroyElement(); }

    // remove from parent if found. Don't call removeFromParent,
    // as removeFromParent will try to remove the element from
    // the DOM again.
    if (parent) { parent.removeChild(this); }

    this.transitionTo('destroyed');

    // next remove view from global hash
    if (!this.isVirtual) delete Ember.View.views[this.elementId];
  },

  clearRenderedChildren: Ember.K,
  triggerRecursively: Ember.K,
  invokeRecursively: Ember.K,
  transitionTo: Ember.K,
  destroyElement: Ember.K
});

/**
  `Ember.View` is the class in Ember responsible for encapsulating templates of
  HTML content, combining templates with data to render as sections of a page's
  DOM, and registering and responding to user-initiated events.

  ## HTML Tag

  The default HTML tag name used for a view's DOM representation is `div`. This
  can be customized by setting the `tagName` property. The following view
class:

  ```javascript
  ParagraphView = Ember.View.extend({
    tagName: 'em'
  });
  ```

  Would result in instances with the following HTML:

  ```html
  <em id="ember1" class="ember-view"></em>
  ```

  ## HTML `class` Attribute

  The HTML `class` attribute of a view's tag can be set by providing a
  `classNames` property that is set to an array of strings:

  ```javascript
  MyView = Ember.View.extend({
    classNames: ['my-class', 'my-other-class']
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view my-class my-other-class"></div>
  ```

  `class` attribute values can also be set by providing a `classNameBindings`
  property set to an array of properties names for the view. The return value
  of these properties will be added as part of the value for the view's `class`
  attribute. These properties can be computed properties:

  ```javascript
  MyView = Ember.View.extend({
    classNameBindings: ['propertyA', 'propertyB'],
    propertyA: 'from-a',
    propertyB: function(){
      if(someLogic){ return 'from-b'; }
    }.property()
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view from-a from-b"></div>
  ```

  If the value of a class name binding returns a boolean the property name
  itself will be used as the class name if the property is true. The class name
  will not be added if the value is `false` or `undefined`.

  ```javascript
  MyView = Ember.View.extend({
    classNameBindings: ['hovered'],
    hovered: true
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view hovered"></div>
  ```

  When using boolean class name bindings you can supply a string value other
  than the property name for use as the `class` HTML attribute by appending the
  preferred value after a ":" character when defining the binding:

  ```javascript
  MyView = Ember.View.extend({
    classNameBindings: ['awesome:so-very-cool'],
    awesome: true
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view so-very-cool"></div>
  ```

  Boolean value class name bindings whose property names are in a
  camelCase-style format will be converted to a dasherized format:

  ```javascript
  MyView = Ember.View.extend({
    classNameBindings: ['isUrgent'],
    isUrgent: true
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view is-urgent"></div>
  ```

  Class name bindings can also refer to object values that are found by
  traversing a path relative to the view itself:

  ```javascript
  MyView = Ember.View.extend({
    classNameBindings: ['messages.empty']
    messages: Ember.Object.create({
      empty: true
    })
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view empty"></div>
  ```

  If you want to add a class name for a property which evaluates to true and
  and a different class name if it evaluates to false, you can pass a binding
  like this:

  ```javascript
  // Applies 'enabled' class when isEnabled is true and 'disabled' when isEnabled is false
  Ember.View.create({
    classNameBindings: ['isEnabled:enabled:disabled']
    isEnabled: true
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view enabled"></div>
  ```

  When isEnabled is `false`, the resulting HTML reprensentation looks like
  this:

  ```html
  <div id="ember1" class="ember-view disabled"></div>
  ```

  This syntax offers the convenience to add a class if a property is `false`:

  ```javascript
  // Applies no class when isEnabled is true and class 'disabled' when isEnabled is false
  Ember.View.create({
    classNameBindings: ['isEnabled::disabled']
    isEnabled: true
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view"></div>
  ```

  When the `isEnabled` property on the view is set to `false`, it will result
  in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view disabled"></div>
  ```

  Updates to the the value of a class name binding will result in automatic
  update of the  HTML `class` attribute in the view's rendered HTML
  representation. If the value becomes `false` or `undefined` the class name
  will be removed.

  Both `classNames` and `classNameBindings` are concatenated properties. See
  `Ember.Object` documentation for more information about concatenated
  properties.

  ## HTML Attributes

  The HTML attribute section of a view's tag can be set by providing an
  `attributeBindings` property set to an array of property names on the view.
  The return value of these properties will be used as the value of the view's
  HTML associated attribute:

  ```javascript
  AnchorView = Ember.View.extend({
    tagName: 'a',
    attributeBindings: ['href'],
    href: 'http://google.com'
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <a id="ember1" class="ember-view" href="http://google.com"></a>
  ```

  If the return value of an `attributeBindings` monitored property is a boolean
  the property will follow HTML's pattern of repeating the attribute's name as
  its value:

  ```javascript
  MyTextInput = Ember.View.extend({
    tagName: 'input',
    attributeBindings: ['disabled'],
    disabled: true
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <input id="ember1" class="ember-view" disabled="disabled" />
  ```

  `attributeBindings` can refer to computed properties:

  ```javascript
  MyTextInput = Ember.View.extend({
    tagName: 'input',
    attributeBindings: ['disabled'],
    disabled: function(){
      if (someLogic) {
        return true;
      } else {
        return false;
      }
    }.property()
  });
  ```

  Updates to the the property of an attribute binding will result in automatic
  update of the  HTML attribute in the view's rendered HTML representation.

  `attributeBindings` is a concatenated property. See `Ember.Object`
  documentation for more information about concatenated properties.

  ## Templates

  The HTML contents of a view's rendered representation are determined by its
  template. Templates can be any function that accepts an optional context
  parameter and returns a string of HTML that will be inserted within the
  view's tag. Most typically in Ember this function will be a compiled
  `Ember.Handlebars` template.

  ```javascript
  AView = Ember.View.extend({
    template: Ember.Handlebars.compile('I am the template')
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view">I am the template</div>
  ```

  Within an Ember application is more common to define a Handlebars templates as
  part of a page:

  ```html
  <script type='text/x-handlebars' data-template-name='some-template'>
    Hello
  </script>
  ```

  And associate it by name using a view's `templateName` property:

  ```javascript
  AView = Ember.View.extend({
    templateName: 'some-template'
  });
  ```

  Using a value for `templateName` that does not have a Handlebars template
  with a matching `data-template-name` attribute will throw an error.

  Assigning a value to both `template` and `templateName` properties will throw
  an error.

  For views classes that may have a template later defined (e.g. as the block
  portion of a `{{view}}` Handlebars helper call in another template or in
  a subclass), you can provide a `defaultTemplate` property set to compiled
  template function. If a template is not later provided for the view instance
  the `defaultTemplate` value will be used:

  ```javascript
  AView = Ember.View.extend({
    defaultTemplate: Ember.Handlebars.compile('I was the default'),
    template: null,
    templateName: null
  });
  ```

  Will result in instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view">I was the default</div>
  ```

  If a `template` or `templateName` is provided it will take precedence over
  `defaultTemplate`:

  ```javascript
  AView = Ember.View.extend({
    defaultTemplate: Ember.Handlebars.compile('I was the default')
  });

  aView = AView.create({
    template: Ember.Handlebars.compile('I was the template, not default')
  });
  ```

  Will result in the following HTML representation when rendered:

  ```html
  <div id="ember1" class="ember-view">I was the template, not default</div>
  ```

  ## View Context

  The default context of the compiled template is the view's controller:

  ```javascript
  AView = Ember.View.extend({
    template: Ember.Handlebars.compile('Hello {{excitedGreeting}}')
  });

  aController = Ember.Object.create({
    firstName: 'Barry',
    excitedGreeting: function(){
      return this.get("content.firstName") + "!!!"
    }.property()
  });

  aView = AView.create({
    controller: aController,
  });
  ```

  Will result in an HTML representation of:

  ```html
  <div id="ember1" class="ember-view">Hello Barry!!!</div>
  ```

  A context can also be explicitly supplied through the view's `context`
  property. If the view has neither `context` nor `controller` properties, the
  `parentView`'s context will be used.

  ## Layouts

  Views can have a secondary template that wraps their main template. Like
  primary templates, layouts can be any function that  accepts an optional
  context parameter and returns a string of HTML that will be inserted inside
  view's tag. Views whose HTML element is self closing (e.g. `<input />`)
  cannot have a layout and this property will be ignored.

  Most typically in Ember a layout will be a compiled `Ember.Handlebars`
  template.

  A view's layout can be set directly with the `layout` property or reference
  an existing Handlebars template by name with the `layoutName` property.

  A template used as a layout must contain a single use of the Handlebars
  `{{yield}}` helper. The HTML contents of a view's rendered `template` will be
  inserted at this location:

  ```javascript
  AViewWithLayout = Ember.View.extend({
    layout: Ember.Handlebars.compile("<div class='my-decorative-class'>{{yield}}</div>")
    template: Ember.Handlebars.compile("I got wrapped"),
  });
  ```

  Will result in view instances with an HTML representation of:

  ```html
  <div id="ember1" class="ember-view">
    <div class="my-decorative-class">
      I got wrapped
    </div>
  </div>
  ```

  See `Handlebars.helpers.yield` for more information.

  ## Responding to Browser Events

  Views can respond to user-initiated events in one of three ways: method
  implementation, through an event manager, and through `{{action}}` helper use
  in their template or layout.

  ### Method Implementation

  Views can respond to user-initiated events by implementing a method that
  matches the event name. A `jQuery.Event` object will be passed as the
  argument to this method.

  ```javascript
  AView = Ember.View.extend({
    click: function(event){
      // will be called when when an instance's
      // rendered element is clicked
    }
  });
  ```

  ### Event Managers

  Views can define an object as their `eventManager` property. This object can
  then implement methods that match the desired event names. Matching events
  that occur on the view's rendered HTML or the rendered HTML of any of its DOM
  descendants will trigger this method. A `jQuery.Event` object will be passed
  as the first argument to the method and an  `Ember.View` object as the
  second. The `Ember.View` will be the view whose rendered HTML was interacted
  with. This may be the view with the `eventManager` property or one of its
  descendent views.

  ```javascript
  AView = Ember.View.extend({
    eventManager: Ember.Object.create({
      doubleClick: function(event, view){
        // will be called when when an instance's
        // rendered element or any rendering
        // of this views's descendent
        // elements is clicked
      }
    })
  });
  ```

  An event defined for an event manager takes precedence over events of the
  same name handled through methods on the view.

  ```javascript
  AView = Ember.View.extend({
    mouseEnter: function(event){
      // will never trigger.
    },
    eventManager: Ember.Object.create({
      mouseEnter: function(event, view){
        // takes presedence over AView#mouseEnter
      }
    })
  });
  ```

  Similarly a view's event manager will take precedence for events of any views
  rendered as a descendent. A method name that matches an event name will not
  be called if the view instance was rendered inside the HTML representation of
  a view that has an `eventManager` property defined that handles events of the
  name. Events not handled by the event manager will still trigger method calls
  on the descendent.

  ```javascript
  OuterView = Ember.View.extend({
    template: Ember.Handlebars.compile("outer {{#view InnerView}}inner{{/view}} outer"),
    eventManager: Ember.Object.create({
      mouseEnter: function(event, view){
        // view might be instance of either
        // OutsideView or InnerView depending on
        // where on the page the user interaction occured
      }
    })
  });

  InnerView = Ember.View.extend({
    click: function(event){
      // will be called if rendered inside
      // an OuterView because OuterView's
      // eventManager doesn't handle click events
    },
    mouseEnter: function(event){
      // will never be called if rendered inside
      // an OuterView.
    }
  });
  ```

  ### Handlebars `{{action}}` Helper

  See `Handlebars.helpers.action`.

  ### Event Names

  Possible events names for any of the responding approaches described above
  are:

  Touch events:

  * `touchStart`
  * `touchMove`
  * `touchEnd`
  * `touchCancel`

  Keyboard events

  * `keyDown`
  * `keyUp`
  * `keyPress`

  Mouse events

  * `mouseDown`
  * `mouseUp`
  * `contextMenu`
  * `click`
  * `doubleClick`
  * `mouseMove`
  * `focusIn`
  * `focusOut`
  * `mouseEnter`
  * `mouseLeave`

  Form events:

  * `submit`
  * `change`
  * `focusIn`
  * `focusOut`
  * `input`

  HTML5 drag and drop events:

  * `dragStart`
  * `drag`
  * `dragEnter`
  * `dragLeave`
  * `drop`
  * `dragEnd`

  ## Handlebars `{{view}}` Helper

  Other `Ember.View` instances can be included as part of a view's template by
  using the `{{view}}` Handlebars helper. See `Handlebars.helpers.view` for
  additional information.

  @class View
  @namespace Ember
  @extends Ember.Object
  @uses Ember.Evented
*/
Ember.View = Ember.CoreView.extend(
/** @scope Ember.View.prototype */ {

  concatenatedProperties: ['classNames', 'classNameBindings', 'attributeBindings'],

  /**
    @property isView
    @type Boolean
    @default true
    @final
  */
  isView: true,

  // ..........................................................
  // TEMPLATE SUPPORT
  //

  /**
    The name of the template to lookup if no template is provided.

    `Ember.View` will look for a template with this name in this view's
    `templates` object. By default, this will be a global object
    shared in `Ember.TEMPLATES`.

    @property templateName
    @type String
    @default null
  */
  templateName: null,

  /**
    The name of the layout to lookup if no layout is provided.

    `Ember.View` will look for a template with this name in this view's
    `templates` object. By default, this will be a global object
    shared in `Ember.TEMPLATES`.

    @property layoutName
    @type String
    @default null
  */
  layoutName: null,

  /**
    The hash in which to look for `templateName`.

    @property templates
    @type Ember.Object
    @default Ember.TEMPLATES
  */
  templates: Ember.TEMPLATES,

  /**
    The template used to render the view. This should be a function that
    accepts an optional context parameter and returns a string of HTML that
    will be inserted into the DOM relative to its parent view.

    In general, you should set the `templateName` property instead of setting
    the template yourself.

    @property template
    @type Function
  */
  template: Ember.computed(function(key, value) {
    if (value !== undefined) { return value; }

    var templateName = get(this, 'templateName'),
        template = this.templateForName(templateName, 'template');

    Ember.assert("You specified the templateName " + templateName + " for " + this + ", but it did not exist.", !templateName || template);

    return template || get(this, 'defaultTemplate');
  }).property('templateName'),

  container: Ember.computed(function() {
    var parentView = get(this, '_parentView');

    if (parentView) { return get(parentView, 'container'); }

    return Ember.Container && Ember.Container.defaultContainer;
  }),

  /**
    The controller managing this view. If this property is set, it will be
    made available for use by the template.

    @property controller
    @type Object
  */
  controller: Ember.computed(function(key) {
    var parentView = get(this, '_parentView');
    return parentView ? get(parentView, 'controller') : null;
  }).property('_parentView'),

  /**
    A view may contain a layout. A layout is a regular template but
    supersedes the `template` property during rendering. It is the
    responsibility of the layout template to retrieve the `template`
    property from the view (or alternatively, call `Handlebars.helpers.yield`,
    `{{yield}}`) to render it in the correct location.

    This is useful for a view that has a shared wrapper, but which delegates
    the rendering of the contents of the wrapper to the `template` property
    on a subclass.

    @property layout
    @type Function
  */
  layout: Ember.computed(function(key) {
    var layoutName = get(this, 'layoutName'),
        layout = this.templateForName(layoutName, 'layout');

    Ember.assert("You specified the layoutName " + layoutName + " for " + this + ", but it did not exist.", !layoutName || layout);

    return layout || get(this, 'defaultLayout');
  }).property('layoutName'),

  templateForName: function(name, type) {
    if (!name) { return; }

    Ember.assert("templateNames are not allowed to contain periods: "+name, name.indexOf('.') === -1);

    var container = get(this, 'container');

    if (container) {
      return container.lookup('template:' + name);
    }
  },

  /**
    The object from which templates should access properties.

    This object will be passed to the template function each time the render
    method is called, but it is up to the individual function to decide what
    to do with it.

    By default, this will be the view's controller.

    @property context
    @type Object
  */
  context: Ember.computed(function(key, value) {
    if (arguments.length === 2) {
      set(this, '_context', value);
      return value;
    } else {
      return get(this, '_context');
    }
  }).volatile(),

  /**
    @private

    Private copy of the view's template context. This can be set directly
    by Handlebars without triggering the observer that causes the view
    to be re-rendered.

    The context of a view is looked up as follows:

    1. Supplied context (usually by Handlebars)
    2. Specified controller
    3. `parentView`'s context (for a child of a ContainerView)

    The code in Handlebars that overrides the `_context` property first
    checks to see whether the view has a specified controller. This is
    something of a hack and should be revisited.

    @property _context
  */
  _context: Ember.computed(function(key) {
    var parentView, controller;

    if (controller = get(this, 'controller')) {
      return controller;
    }

    parentView = this._parentView;
    if (parentView) {
      return get(parentView, '_context');
    }

    return null;
  }),

  /**
    @private

    If a value that affects template rendering changes, the view should be
    re-rendered to reflect the new value.

    @method _displayPropertyDidChange
  */
  _contextDidChange: Ember.observer(function() {
    this.rerender();
  }, 'context'),

  /**
    If `false`, the view will appear hidden in DOM.

    @property isVisible
    @type Boolean
    @default null
  */
  isVisible: true,

  /**
    @private

    Array of child views. You should never edit this array directly.
    Instead, use `appendChild` and `removeFromParent`.

    @property childViews
    @type Array
    @default []
  */
  childViews: childViewsProperty,

  _childViews: [],

  // When it's a virtual view, we need to notify the parent that their
  // childViews will change.
  _childViewsWillChange: Ember.beforeObserver(function() {
    if (this.isVirtual) {
      var parentView = get(this, 'parentView');
      if (parentView) { Ember.propertyWillChange(parentView, 'childViews'); }
    }
  }, 'childViews'),

  // When it's a virtual view, we need to notify the parent that their
  // childViews did change.
  _childViewsDidChange: Ember.observer(function() {
    if (this.isVirtual) {
      var parentView = get(this, 'parentView');
      if (parentView) { Ember.propertyDidChange(parentView, 'childViews'); }
    }
  }, 'childViews'),

  /**
    Return the nearest ancestor that is an instance of the provided
    class.

    @property nearestInstanceOf
    @param {Class} klass Subclass of Ember.View (or Ember.View itself)
    @return Ember.View
    @deprecated
  */
  nearestInstanceOf: function(klass) {
    Ember.deprecate("nearestInstanceOf is deprecated and will be removed from future releases. Use nearestOfType.");
    var view = get(this, 'parentView');

    while (view) {
      if(view instanceof klass) { return view; }
      view = get(view, 'parentView');
    }
  },

  /**
    Return the nearest ancestor that is an instance of the provided
    class or mixin.

    @property nearestOfType
    @param {Class,Mixin} klass Subclass of Ember.View (or Ember.View itself),
           or an instance of Ember.Mixin.
    @return Ember.View
  */
  nearestOfType: function(klass) {
    var view = get(this, 'parentView'),
        isOfType = klass instanceof Ember.Mixin ?
                   function(view) { return klass.detect(view); } :
                   function(view) { return klass.detect(view.constructor); };

    while (view) {
      if( isOfType(view) ) { return view; }
      view = get(view, 'parentView');
    }
  },

  /**
    Return the nearest ancestor that has a given property.

    @property nearestWithProperty
    @param {String} property A property name
    @return Ember.View
  */
  nearestWithProperty: function(property) {
    var view = get(this, 'parentView');

    while (view) {
      if (property in view) { return view; }
      view = get(view, 'parentView');
    }
  },

  /**
    Return the nearest ancestor whose parent is an instance of
    `klass`.

    @property nearestChildOf
    @param {Class} klass Subclass of Ember.View (or Ember.View itself)
    @return Ember.View
  */
  nearestChildOf: function(klass) {
    var view = get(this, 'parentView');

    while (view) {
      if(get(view, 'parentView') instanceof klass) { return view; }
      view = get(view, 'parentView');
    }
  },

  /**
    @private

    When the parent view changes, recursively invalidate `controller`

    @method _parentViewDidChange
  */
  _parentViewDidChange: Ember.observer(function() {
    if (this.isDestroying) { return; }

    if (get(this, 'parentView.controller') && !get(this, 'controller')) {
      this.notifyPropertyChange('controller');
    }
  }, '_parentView'),

  _controllerDidChange: Ember.observer(function() {
    if (this.isDestroying) { return; }

    this.rerender();

    this.forEachChildView(function(view) {
      view.propertyDidChange('controller');
    });
  }, 'controller'),

  cloneKeywords: function() {
    var templateData = get(this, 'templateData');

    var keywords = templateData ? Ember.copy(templateData.keywords) : {};
    set(keywords, 'view', get(this, 'concreteView'));
    set(keywords, '_view', this);
    set(keywords, 'controller', get(this, 'controller'));

    return keywords;
  },

  /**
    Called on your view when it should push strings of HTML into a
    `Ember.RenderBuffer`. Most users will want to override the `template`
    or `templateName` properties instead of this method.

    By default, `Ember.View` will look for a function in the `template`
    property and invoke it with the value of `context`. The value of
    `context` will be the view's controller unless you override it.

    @method render
    @param {Ember.RenderBuffer} buffer The render buffer
  */
  render: function(buffer) {
    // If this view has a layout, it is the responsibility of the
    // the layout to render the view's template. Otherwise, render the template
    // directly.
    var template = get(this, 'layout') || get(this, 'template');

    if (template) {
      var context = get(this, 'context');
      var keywords = this.cloneKeywords();
      var output;

      var data = {
        view: this,
        buffer: buffer,
        isRenderData: true,
        keywords: keywords,
        insideGroup: get(this, 'templateData.insideGroup')
      };

      // Invoke the template with the provided template context, which
      // is the view's controller by default. A hash of data is also passed that provides
      // the template with access to the view and render buffer.

      Ember.assert('template must be a function. Did you mean to call Ember.Handlebars.compile("...") or specify templateName instead?', typeof template === 'function');
      // The template should write directly to the render buffer instead
      // of returning a string.
      output = template(context, { data: data });

      // If the template returned a string instead of writing to the buffer,
      // push the string onto the buffer.
      if (output !== undefined) { buffer.push(output); }
    }
  },

  /**
    Renders the view again. This will work regardless of whether the
    view is already in the DOM or not. If the view is in the DOM, the
    rendering process will be deferred to give bindings a chance
    to synchronize.

    If children were added during the rendering process using `appendChild`,
    `rerender` will remove them, because they will be added again
    if needed by the next `render`.

    In general, if the display of your view changes, you should modify
    the DOM element directly instead of manually calling `rerender`, which can
    be slow.

    @method rerender
  */
  rerender: function() {
    return this.currentState.rerender(this);
  },

  clearRenderedChildren: function() {
    var lengthBefore = this.lengthBeforeRender,
        lengthAfter  = this.lengthAfterRender;

    // If there were child views created during the last call to render(),
    // remove them under the assumption that they will be re-created when
    // we re-render.

    // VIEW-TODO: Unit test this path.
    var childViews = this._childViews;
    for (var i=lengthAfter-1; i>=lengthBefore; i--) {
      if (childViews[i]) { childViews[i].destroy(); }
    }
  },

  /**
    @private

    Iterates over the view's `classNameBindings` array, inserts the value
    of the specified property into the `classNames` array, then creates an
    observer to update the view's element if the bound property ever changes
    in the future.

    @method _applyClassNameBindings
  */
  _applyClassNameBindings: function(classBindings) {
    var classNames = this.classNames,
    elem, newClass, dasherizedClass;

    // Loop through all of the configured bindings. These will be either
    // property names ('isUrgent') or property paths relative to the view
    // ('content.isUrgent')
    a_forEach(classBindings, function(binding) {

      // Variable in which the old class value is saved. The observer function
      // closes over this variable, so it knows which string to remove when
      // the property changes.
      var oldClass;
      // Extract just the property name from bindings like 'foo:bar'
      var parsedPath = Ember.View._parsePropertyPath(binding);

      // Set up an observer on the context. If the property changes, toggle the
      // class name.
      var observer = function() {
        // Get the current value of the property
        newClass = this._classStringForProperty(binding);
        elem = this.$();

        // If we had previously added a class to the element, remove it.
        if (oldClass) {
          elem.removeClass(oldClass);
          // Also remove from classNames so that if the view gets rerendered,
          // the class doesn't get added back to the DOM.
          classNames.removeObject(oldClass);
        }

        // If necessary, add a new class. Make sure we keep track of it so
        // it can be removed in the future.
        if (newClass) {
          elem.addClass(newClass);
          oldClass = newClass;
        } else {
          oldClass = null;
        }
      };

      // Get the class name for the property at its current value
      dasherizedClass = this._classStringForProperty(binding);

      if (dasherizedClass) {
        // Ensure that it gets into the classNames array
        // so it is displayed when we render.
        a_addObject(classNames, dasherizedClass);

        // Save a reference to the class name so we can remove it
        // if the observer fires. Remember that this variable has
        // been closed over by the observer.
        oldClass = dasherizedClass;
      }

      this.registerObserver(this, parsedPath.path, observer);
      // Remove className so when the view is rerendered,
      // the className is added based on binding reevaluation
      this.one('willClearRender', function() {
        if (oldClass) {
          classNames.removeObject(oldClass);
          oldClass = null;
        }
      });

    }, this);
  },

  /**
    @private

    Iterates through the view's attribute bindings, sets up observers for each,
    then applies the current value of the attributes to the passed render buffer.

    @method _applyAttributeBindings
    @param {Ember.RenderBuffer} buffer
  */
  _applyAttributeBindings: function(buffer, attributeBindings) {
    var attributeValue, elem, type;

    a_forEach(attributeBindings, function(binding) {
      var split = binding.split(':'),
          property = split[0],
          attributeName = split[1] || property;

      // Create an observer to add/remove/change the attribute if the
      // JavaScript property changes.
      var observer = function() {
        elem = this.$();
        if (!elem) { return; }

        attributeValue = get(this, property);

        Ember.View.applyAttributeBindings(elem, attributeName, attributeValue);
      };

      this.registerObserver(this, property, observer);

      // Determine the current value and add it to the render buffer
      // if necessary.
      attributeValue = get(this, property);
      Ember.View.applyAttributeBindings(buffer, attributeName, attributeValue);
    }, this);
  },

  /**
    @private

    Given a property name, returns a dasherized version of that
    property name if the property evaluates to a non-falsy value.

    For example, if the view has property `isUrgent` that evaluates to true,
    passing `isUrgent` to this method will return `"is-urgent"`.

    @method _classStringForProperty
    @param property
  */
  _classStringForProperty: function(property) {
    var parsedPath = Ember.View._parsePropertyPath(property);
    var path = parsedPath.path;

    var val = get(this, path);
    if (val === undefined && Ember.isGlobalPath(path)) {
      val = get(Ember.lookup, path);
    }

    return Ember.View._classStringForValue(path, val, parsedPath.className, parsedPath.falsyClassName);
  },

  // ..........................................................
  // ELEMENT SUPPORT
  //

  /**
    Returns the current DOM element for the view.

    @property element
    @type DOMElement
  */
  element: Ember.computed(function(key, value) {
    if (value !== undefined) {
      return this.currentState.setElement(this, value);
    } else {
      return this.currentState.getElement(this);
    }
  }).property('_parentView'),

  /**
    Returns a jQuery object for this view's element. If you pass in a selector
    string, this method will return a jQuery object, using the current element
    as its buffer.

    For example, calling `view.$('li')` will return a jQuery object containing
    all of the `li` elements inside the DOM element of this view.

    @property $
    @param {String} [selector] a jQuery-compatible selector string
    @return {jQuery} the CoreQuery object for the DOM node
  */
  $: function(sel) {
    return this.currentState.$(this, sel);
  },

  mutateChildViews: function(callback) {
    var childViews = this._childViews,
        idx = childViews.length,
        view;

    while(--idx >= 0) {
      view = childViews[idx];
      callback.call(this, view, idx);
    }

    return this;
  },

  forEachChildView: function(callback) {
    var childViews = this._childViews;

    if (!childViews) { return this; }

    var len = childViews.length,
        view, idx;

    for(idx = 0; idx < len; idx++) {
      view = childViews[idx];
      callback.call(this, view);
    }

    return this;
  },

  /**
    Appends the view's element to the specified parent element.

    If the view does not have an HTML representation yet, `createElement()`
    will be called automatically.

    Note that this method just schedules the view to be appended; the DOM
    element will not be appended to the given element until all bindings have
    finished synchronizing.

    This is not typically a function that you will need to call directly when
    building your application. You might consider using `Ember.ContainerView`
    instead. If you do need to use `appendTo`, be sure that the target element
    you are providing is associated with an `Ember.Application` and does not
    have an ancestor element that is associated with an Ember view.

    @method appendTo
    @param {String|DOMElement|jQuery} A selector, element, HTML string, or jQuery object
    @return {Ember.View} receiver
  */
  appendTo: function(target) {
    // Schedule the DOM element to be created and appended to the given
    // element after bindings have synchronized.
    this._insertElementLater(function() {
      Ember.assert("You cannot append to an existing Ember.View. Consider using Ember.ContainerView instead.", !Ember.$(target).is('.ember-view') && !Ember.$(target).parents().is('.ember-view'));
      this.$().appendTo(target);
    });

    return this;
  },

  /**
    Replaces the content of the specified parent element with this view's
    element. If the view does not have an HTML representation yet,
    `createElement()` will be called automatically.

    Note that this method just schedules the view to be appended; the DOM
    element will not be appended to the given element until all bindings have
    finished synchronizing

    @method replaceIn
    @param {String|DOMElement|jQuery} A selector, element, HTML string, or jQuery object
    @return {Ember.View} received
  */
  replaceIn: function(target) {
    Ember.assert("You cannot replace an existing Ember.View. Consider using Ember.ContainerView instead.", !Ember.$(target).is('.ember-view') && !Ember.$(target).parents().is('.ember-view'));

    this._insertElementLater(function() {
      Ember.$(target).empty();
      this.$().appendTo(target);
    });

    return this;
  },

  /**
    @private

    Schedules a DOM operation to occur during the next render phase. This
    ensures that all bindings have finished synchronizing before the view is
    rendered.

    To use, pass a function that performs a DOM operation.

    Before your function is called, this view and all child views will receive
    the `willInsertElement` event. After your function is invoked, this view
    and all of its child views will receive the `didInsertElement` event.

    ```javascript
    view._insertElementLater(function() {
      this.createElement();
      this.$().appendTo('body');
    });
    ```

    @method _insertElementLater
    @param {Function} fn the function that inserts the element into the DOM
  */
  _insertElementLater: function(fn) {
    this._scheduledInsert = Ember.run.scheduleOnce('render', this, '_insertElement', fn);
  },

  _insertElement: function (fn) {
    this._scheduledInsert = null;
    this.currentState.insertElement(this, fn);
  },

  /**
    Appends the view's element to the document body. If the view does
    not have an HTML representation yet, `createElement()` will be called
    automatically.

    Note that this method just schedules the view to be appended; the DOM
    element will not be appended to the document body until all bindings have
    finished synchronizing.

    @method append
    @return {Ember.View} receiver
  */
  append: function() {
    return this.appendTo(document.body);
  },

  /**
    Removes the view's element from the element to which it is attached.

    @method remove
    @return {Ember.View} receiver
  */
  remove: function() {
    // What we should really do here is wait until the end of the run loop
    // to determine if the element has been re-appended to a different
    // element.
    // In the interim, we will just re-render if that happens. It is more
    // important than elements get garbage collected.
    if (!this.removedFromDOM) { this.destroyElement(); }
    this.invokeRecursively(function(view) {
      if (view.clearRenderedChildren) { view.clearRenderedChildren(); }
    });
  },

  elementId: null,

  /**
    Attempts to discover the element in the parent element. The default
    implementation looks for an element with an ID of `elementId` (or the
    view's guid if `elementId` is null). You can override this method to
    provide your own form of lookup. For example, if you want to discover your
    element using a CSS class name instead of an ID.

    @method findElementInParentElement
    @param {DOMElement} parentElement The parent's DOM element
    @return {DOMElement} The discovered element
  */
  findElementInParentElement: function(parentElem) {
    var id = "#" + this.elementId;
    return Ember.$(id)[0] || Ember.$(id, parentElem)[0];
  },

  /**
    Creates a DOM representation of the view and all of its
    child views by recursively calling the `render()` method.

    After the element has been created, `didInsertElement` will
    be called on this view and all of its child views.

    @method createElement
    @return {Ember.View} receiver
  */
  createElement: function() {
    if (get(this, 'element')) { return this; }

    var buffer = this.renderToBuffer();
    set(this, 'element', buffer.element());

    return this;
  },

  /**
    Called when a view is going to insert an element into the DOM.

    @event willInsertElement
  */
  willInsertElement: Ember.K,

  /**
    Called when the element of the view has been inserted into the DOM.
    Override this function to do any set up that requires an element in the
    document body.

    @event didInsertElement
  */
  didInsertElement: Ember.K,

  /**
    Called when the view is about to rerender, but before anything has
    been torn down. This is a good opportunity to tear down any manual
    observers you have installed based on the DOM state

    @event willClearRender
  */
  willClearRender: Ember.K,

  /**
    @private

    Run this callback on the current view and recursively on child views.

    @method invokeRecursively
    @param fn {Function}
  */
  invokeRecursively: function(fn) {
    var childViews = [this], currentViews, view;

    while (childViews.length) {
      currentViews = childViews.slice();
      childViews = [];

      for (var i=0, l=currentViews.length; i<l; i++) {
        view = currentViews[i];
        fn.call(view, view);
        if (view._childViews) {
          childViews.push.apply(childViews, view._childViews);
        }
      }
    }
  },

  triggerRecursively: function(eventName) {
    var childViews = [this], currentViews, view;

    while (childViews.length) {
      currentViews = childViews.slice();
      childViews = [];

      for (var i=0, l=currentViews.length; i<l; i++) {
        view = currentViews[i];
        if (view.trigger) { view.trigger(eventName); }
        if (view._childViews) {
          childViews.push.apply(childViews, view._childViews);
        }
      }
    }
  },

  /**
    Destroys any existing element along with the element for any child views
    as well. If the view does not currently have a element, then this method
    will do nothing.

    If you implement `willDestroyElement()` on your view, then this method will
    be invoked on your view before your element is destroyed to give you a
    chance to clean up any event handlers, etc.

    If you write a `willDestroyElement()` handler, you can assume that your
    `didInsertElement()` handler was called earlier for the same element.

    Normally you will not call or override this method yourself, but you may
    want to implement the above callbacks when it is run.

    @method destroyElement
    @return {Ember.View} receiver
  */
  destroyElement: function() {
    return this.currentState.destroyElement(this);
  },

  /**
    Called when the element of the view is going to be destroyed. Override
    this function to do any teardown that requires an element, like removing
    event listeners.

    @event willDestroyElement
  */
  willDestroyElement: function() {},

  /**
    @private

    Triggers the `willDestroyElement` event (which invokes the
    `willDestroyElement()` method if it exists) on this view and all child
    views.

    Before triggering `willDestroyElement`, it first triggers the
    `willClearRender` event recursively.

    @method _notifyWillDestroyElement
  */
  _notifyWillDestroyElement: function() {
    this.triggerRecursively('willClearRender');
    this.triggerRecursively('willDestroyElement');
  },

  _elementWillChange: Ember.beforeObserver(function() {
    this.forEachChildView(function(view) {
      Ember.propertyWillChange(view, 'element');
    });
  }, 'element'),

  /**
    @private

    If this view's element changes, we need to invalidate the caches of our
    child views so that we do not retain references to DOM elements that are
    no longer needed.

    @method _elementDidChange
  */
  _elementDidChange: Ember.observer(function() {
    this.forEachChildView(function(view) {
      Ember.propertyDidChange(view, 'element');
    });
  }, 'element'),

  /**
    Called when the parentView property has changed.

    @event parentViewDidChange
  */
  parentViewDidChange: Ember.K,

  instrumentName: 'view',

  instrumentDetails: function(hash) {
    hash.template = get(this, 'templateName');
    this._super(hash);
  },

  _renderToBuffer: function(parentBuffer, bufferOperation) {
    this.lengthBeforeRender = this._childViews.length;
    var buffer = this._super(parentBuffer, bufferOperation);
    this.lengthAfterRender = this._childViews.length;

    return buffer;
  },

  renderToBufferIfNeeded: function () {
    return this.currentState.renderToBufferIfNeeded(this, this);
  },

  beforeRender: function(buffer) {
    this.applyAttributesToBuffer(buffer);
    buffer.pushOpeningTag();
  },

  afterRender: function(buffer) {
    buffer.pushClosingTag();
  },

  applyAttributesToBuffer: function(buffer) {
    // Creates observers for all registered class name and attribute bindings,
    // then adds them to the element.
    var classNameBindings = get(this, 'classNameBindings');
    if (classNameBindings.length) {
      this._applyClassNameBindings(classNameBindings);
    }

    // Pass the render buffer so the method can apply attributes directly.
    // This isn't needed for class name bindings because they use the
    // existing classNames infrastructure.
    var attributeBindings = get(this, 'attributeBindings');
    if (attributeBindings.length) {
      this._applyAttributeBindings(buffer, attributeBindings);
    }

    buffer.setClasses(this.classNames);
    buffer.id(this.elementId);

    var role = get(this, 'ariaRole');
    if (role) {
      buffer.attr('role', role);
    }

    if (get(this, 'isVisible') === false) {
      buffer.style('display', 'none');
    }
  },

  // ..........................................................
  // STANDARD RENDER PROPERTIES
  //

  /**
    Tag name for the view's outer element. The tag name is only used when an
    element is first created. If you change the `tagName` for an element, you
    must destroy and recreate the view element.

    By default, the render buffer will use a `<div>` tag for views.

    @property tagName
    @type String
    @default null
  */

  // We leave this null by default so we can tell the difference between
  // the default case and a user-specified tag.
  tagName: null,

  /**
    The WAI-ARIA role of the control represented by this view. For example, a
    button may have a role of type 'button', or a pane may have a role of
    type 'alertdialog'. This property is used by assistive software to help
    visually challenged users navigate rich web applications.

    The full list of valid WAI-ARIA roles is available at:
    http://www.w3.org/TR/wai-aria/roles#roles_categorization

    @property ariaRole
    @type String
    @default null
  */
  ariaRole: null,

  /**
    Standard CSS class names to apply to the view's outer element. This
    property automatically inherits any class names defined by the view's
    superclasses as well.

    @property classNames
    @type Array
    @default ['ember-view']
  */
  classNames: ['ember-view'],

  /**
    A list of properties of the view to apply as class names. If the property
    is a string value, the value of that string will be applied as a class
    name.

    ```javascript
    // Applies the 'high' class to the view element
    Ember.View.create({
      classNameBindings: ['priority']
      priority: 'high'
    });
    ```

    If the value of the property is a Boolean, the name of that property is
    added as a dasherized class name.

    ```javascript
    // Applies the 'is-urgent' class to the view element
    Ember.View.create({
      classNameBindings: ['isUrgent']
      isUrgent: true
    });
    ```

    If you would prefer to use a custom value instead of the dasherized
    property name, you can pass a binding like this:

    ```javascript
    // Applies the 'urgent' class to the view element
    Ember.View.create({
      classNameBindings: ['isUrgent:urgent']
      isUrgent: true
    });
    ```

    This list of properties is inherited from the view's superclasses as well.

    @property classNameBindings
    @type Array
    @default []
  */
  classNameBindings: [],

  /**
    A list of properties of the view to apply as attributes. If the property is
    a string value, the value of that string will be applied as the attribute.

    ```javascript
    // Applies the type attribute to the element
    // with the value "button", like <div type="button">
    Ember.View.create({
      attributeBindings: ['type'],
      type: 'button'
    });
    ```

    If the value of the property is a Boolean, the name of that property is
    added as an attribute.

    ```javascript
    // Renders something like <div enabled="enabled">
    Ember.View.create({
      attributeBindings: ['enabled'],
      enabled: true
    });
    ```

    @property attributeBindings
  */
  attributeBindings: [],

  // .......................................................
  // CORE DISPLAY METHODS
  //

  /**
    @private

    Setup a view, but do not finish waking it up.
    - configure `childViews`
    - register the view with the global views hash, which is used for event
      dispatch

    @method init
  */
  init: function() {
    this.elementId = this.elementId || guidFor(this);

    this._super();

    // setup child views. be sure to clone the child views array first
    this._childViews = this._childViews.slice();

    Ember.assert("Only arrays are allowed for 'classNameBindings'", Ember.typeOf(this.classNameBindings) === 'array');
    this.classNameBindings = Ember.A(this.classNameBindings.slice());

    Ember.assert("Only arrays are allowed for 'classNames'", Ember.typeOf(this.classNames) === 'array');
    this.classNames = Ember.A(this.classNames.slice());

    var viewController = get(this, 'viewController');
    if (viewController) {
      viewController = get(viewController);
      if (viewController) {
        set(viewController, 'view', this);
      }
    }
  },

  appendChild: function(view, options) {
    return this.currentState.appendChild(this, view, options);
  },

  /**
    Removes the child view from the parent view.

    @method removeChild
    @param {Ember.View} view
    @return {Ember.View} receiver
  */
  removeChild: function(view) {
    // If we're destroying, the entire subtree will be
    // freed, and the DOM will be handled separately,
    // so no need to mess with childViews.
    if (this.isDestroying) { return; }

    // update parent node
    set(view, '_parentView', null);

    // remove view from childViews array.
    var childViews = this._childViews;

    Ember.EnumerableUtils.removeObject(childViews, view);

    this.propertyDidChange('childViews'); // HUH?! what happened to will change?

    return this;
  },

  /**
    Removes all children from the `parentView`.

    @method removeAllChildren
    @return {Ember.View} receiver
  */
  removeAllChildren: function() {
    return this.mutateChildViews(function(view) {
      this.removeChild(view);
    });
  },

  destroyAllChildren: function() {
    return this.mutateChildViews(function(view) {
      view.destroy();
    });
  },

  /**
    Removes the view from its `parentView`, if one is found. Otherwise
    does nothing.

    @method removeFromParent
    @return {Ember.View} receiver
  */
  removeFromParent: function() {
    var parent = this._parentView;

    // Remove DOM element from parent
    this.remove();

    if (parent) { parent.removeChild(this); }
    return this;
  },

  /**
    You must call `destroy` on a view to destroy the view (and all of its
    child views). This will remove the view from any parent node, then make
    sure that the DOM element managed by the view can be released by the
    memory manager.

    @method willDestroy
  */
  willDestroy: function() {
    // calling this._super() will nuke computed properties and observers,
    // so collect any information we need before calling super.
    var childViews = this._childViews,
        parent = this._parentView,
        childLen, i;

    // destroy the element -- this will avoid each child view destroying
    // the element over and over again...
    if (!this.removedFromDOM) { this.destroyElement(); }

    childLen = childViews.length;
    for (i=childLen-1; i>=0; i--) {
      childViews[i].removedFromDOM = true;
    }

    // remove from non-virtual parent view if viewName was specified
    if (this.viewName) {
      var nonVirtualParentView = get(this, 'parentView');
      if (nonVirtualParentView) {
        set(nonVirtualParentView, this.viewName, null);
      }
    }

    // remove from parent if found. Don't call removeFromParent,
    // as removeFromParent will try to remove the element from
    // the DOM again.
    if (parent) { parent.removeChild(this); }

    this.transitionTo('destroyed');

    childLen = childViews.length;
    for (i=childLen-1; i>=0; i--) {
      childViews[i].destroy();
    }

    // next remove view from global hash
    if (!this.isVirtual) delete Ember.View.views[get(this, 'elementId')];
  },

  /**
    Instantiates a view to be added to the childViews array during view
    initialization. You generally will not call this method directly unless
    you are overriding `createChildViews()`. Note that this method will
    automatically configure the correct settings on the new view instance to
    act as a child of the parent.

    @method createChildView
    @param {Class} viewClass
    @param {Hash} [attrs] Attributes to add
    @return {Ember.View} new instance
  */
  createChildView: function(view, attrs) {
    if (view.isView && view._parentView === this) { return view; }

    if (Ember.CoreView.detect(view)) {
      attrs = attrs || {};
      attrs._parentView = this;
      attrs.templateData = attrs.templateData || get(this, 'templateData');

      view = view.create(attrs);

      // don't set the property on a virtual view, as they are invisible to
      // consumers of the view API
      if (view.viewName) { set(get(this, 'concreteView'), view.viewName, view); }
    } else {
      Ember.assert('You must pass instance or subclass of View', view.isView);

      if (attrs) {
        view.setProperties(attrs);
      }

      if (!get(view, 'templateData')) {
        set(view, 'templateData', get(this, 'templateData'));
      }

      set(view, '_parentView', this);
    }

    return view;
  },

  becameVisible: Ember.K,
  becameHidden: Ember.K,

  /**
    @private

    When the view's `isVisible` property changes, toggle the visibility
    element of the actual DOM element.

    @method _isVisibleDidChange
  */
  _isVisibleDidChange: Ember.observer(function() {
    var $el = this.$();
    if (!$el) { return; }

    var isVisible = get(this, 'isVisible');

    $el.toggle(isVisible);

    if (this._isAncestorHidden()) { return; }

    if (isVisible) {
      this._notifyBecameVisible();
    } else {
      this._notifyBecameHidden();
    }
  }, 'isVisible'),

  _notifyBecameVisible: function() {
    this.trigger('becameVisible');

    this.forEachChildView(function(view) {
      var isVisible = get(view, 'isVisible');

      if (isVisible || isVisible === null) {
        view._notifyBecameVisible();
      }
    });
  },

  _notifyBecameHidden: function() {
    this.trigger('becameHidden');
    this.forEachChildView(function(view) {
      var isVisible = get(view, 'isVisible');

      if (isVisible || isVisible === null) {
        view._notifyBecameHidden();
      }
    });
  },

  _isAncestorHidden: function() {
    var parent = get(this, 'parentView');

    while (parent) {
      if (get(parent, 'isVisible') === false) { return true; }

      parent = get(parent, 'parentView');
    }

    return false;
  },

  clearBuffer: function() {
    this.invokeRecursively(function(view) {
      view.buffer = null;
    });
  },

  transitionTo: function(state, children) {
    this.currentState = this.states[state];
    this.state = state;

    if (children !== false) {
      this.forEachChildView(function(view) {
        view.transitionTo(state);
      });
    }
  },

  // .......................................................
  // EVENT HANDLING
  //

  /**
    @private

    Handle events from `Ember.EventDispatcher`

    @method handleEvent
    @param eventName {String}
    @param evt {Event}
  */
  handleEvent: function(eventName, evt) {
    return this.currentState.handleEvent(this, eventName, evt);
  },

  registerObserver: function(root, path, target, observer) {
    Ember.addObserver(root, path, target, observer);

    this.one('willClearRender', function() {
      Ember.removeObserver(root, path, target, observer);
    });
  }

});

/*
  Describe how the specified actions should behave in the various
  states that a view can exist in. Possible states:

  * preRender: when a view is first instantiated, and after its
    element was destroyed, it is in the preRender state
  * inBuffer: once a view has been rendered, but before it has
    been inserted into the DOM, it is in the inBuffer state
  * inDOM: once a view has been inserted into the DOM it is in
    the inDOM state. A view spends the vast majority of its
    existence in this state.
  * destroyed: once a view has been destroyed (using the destroy
    method), it is in this state. No further actions can be invoked
    on a destroyed view.
*/

  // in the destroyed state, everything is illegal

  // before rendering has begun, all legal manipulations are noops.

  // inside the buffer, legal manipulations are done on the buffer

  // once the view has been inserted into the DOM, legal manipulations
  // are done on the DOM element.

var DOMManager = {
  prepend: function(view, html) {
    view.$().prepend(html);
  },

  after: function(view, html) {
    view.$().after(html);
  },

  html: function(view, html) {
    view.$().html(html);
  },

  replace: function(view) {
    var element = get(view, 'element');

    set(view, 'element', null);

    view._insertElementLater(function() {
      Ember.$(element).replaceWith(get(view, 'element'));
    });
  },

  remove: function(view) {
    view.$().remove();
  },

  empty: function(view) {
    view.$().empty();
  }
};

Ember.View.reopen({
  domManager: DOMManager
});

Ember.View.reopenClass({

  /**
    @private

    Parse a path and return an object which holds the parsed properties.

    For example a path like "content.isEnabled:enabled:disabled" wil return the
    following object:

    ```javascript
    {
      path: "content.isEnabled",
      className: "enabled",
      falsyClassName: "disabled",
      classNames: ":enabled:disabled"
    }
    ```

    @method _parsePropertyPath
    @static
  */
  _parsePropertyPath: function(path) {
    var split = path.split(':'),
        propertyPath = split[0],
        classNames = "",
        className,
        falsyClassName;

    // check if the property is defined as prop:class or prop:trueClass:falseClass
    if (split.length > 1) {
      className = split[1];
      if (split.length === 3) { falsyClassName = split[2]; }

      classNames = ':' + className;
      if (falsyClassName) { classNames += ":" + falsyClassName; }
    }

    return {
      path: propertyPath,
      classNames: classNames,
      className: (className === '') ? undefined : className,
      falsyClassName: falsyClassName
    };
  },

  /**
    @private

    Get the class name for a given value, based on the path, optional
    `className` and optional `falsyClassName`.

    - if a `className` or `falsyClassName` has been specified:
      - if the value is truthy and `className` has been specified,
        `className` is returned
      - if the value is falsy and `falsyClassName` has been specified,
        `falsyClassName` is returned
      - otherwise `null` is returned
    - if the value is `true`, the dasherized last part of the supplied path
      is returned
    - if the value is not `false`, `undefined` or `null`, the `value`
      is returned
    - if none of the above rules apply, `null` is returned

    @method _classStringForValue
    @param path
    @param val
    @param className
    @param falsyClassName
    @static
  */
  _classStringForValue: function(path, val, className, falsyClassName) {
    // When using the colon syntax, evaluate the truthiness or falsiness
    // of the value to determine which className to return
    if (className || falsyClassName) {
      if (className && !!val) {
        return className;

      } else if (falsyClassName && !val) {
        return falsyClassName;

      } else {
        return null;
      }

    // If value is a Boolean and true, return the dasherized property
    // name.
    } else if (val === true) {
      // Normalize property path to be suitable for use
      // as a class name. For exaple, content.foo.barBaz
      // becomes bar-baz.
      var parts = path.split('.');
      return Ember.String.dasherize(parts[parts.length-1]);

    // If the value is not false, undefined, or null, return the current
    // value of the property.
    } else if (val !== false && val !== undefined && val !== null) {
      return val;

    // Nothing to display. Return null so that the old class is removed
    // but no new class is added.
    } else {
      return null;
    }
  }
});

/**
  Global views hash

  @property views
  @static
  @type Hash
*/
Ember.View.views = {};

// If someone overrides the child views computed property when
// defining their class, we want to be able to process the user's
// supplied childViews and then restore the original computed property
// at view initialization time. This happens in Ember.ContainerView's init
// method.
Ember.View.childViewsProperty = childViewsProperty;

Ember.View.applyAttributeBindings = function(elem, name, value) {
  var type = Ember.typeOf(value);

  // if this changes, also change the logic in ember-handlebars/lib/helpers/binding.js
  if (name !== 'value' && (type === 'string' || (type === 'number' && !isNaN(value)))) {
    if (value !== elem.attr(name)) {
      elem.attr(name, value);
    }
  } else if (name === 'value' || type === 'boolean') {
    if (value !== elem.prop(name)) {
      // value and booleans should always be properties
      elem.prop(name, value);
    }
  } else if (!value) {
    elem.removeAttr(name);
  }
};

Ember.View.states = states;

})();



(function() {
/**
@module ember
@submodule ember-views
*/

var get = Ember.get, set = Ember.set;

Ember.View.states._default = {
  // appendChild is only legal while rendering the buffer.
  appendChild: function() {
    throw "You can't use appendChild outside of the rendering process";
  },

  $: function() {
    return undefined;
  },

  getElement: function() {
    return null;
  },

  // Handle events from `Ember.EventDispatcher`
  handleEvent: function() {
    return true; // continue event propagation
  },

  destroyElement: function(view) {
    set(view, 'element', null);
    if (view._scheduledInsert) {
      Ember.run.cancel(view._scheduledInsert);
      view._scheduledInsert = null;
    }
    return view;
  },

  renderToBufferIfNeeded: function () {
    return false;
  },

  rerender: Ember.K
};

})();



(function() {
/**
@module ember
@submodule ember-views
*/

var preRender = Ember.View.states.preRender = Ember.create(Ember.View.states._default);

Ember.merge(preRender, {
  // a view leaves the preRender state once its element has been
  // created (createElement).
  insertElement: function(view, fn) {
    view.createElement();
    view.triggerRecursively('willInsertElement');
    // after createElement, the view will be in the hasElement state.
    fn.call(view);
    view.transitionTo('inDOM');
    view.triggerRecursively('didInsertElement');
  },

  renderToBufferIfNeeded: function(view) {
    return view.renderToBuffer();
  },

  empty: Ember.K,

  setElement: function(view, value) {
    if (value !== null) {
      view.transitionTo('hasElement');
    }
    return value;
  }
});

})();



(function() {
/**
@module ember
@submodule ember-views
*/

var get = Ember.get, set = Ember.set, meta = Ember.meta;

var inBuffer = Ember.View.states.inBuffer = Ember.create(Ember.View.states._default);

Ember.merge(inBuffer, {
  $: function(view, sel) {
    // if we don't have an element yet, someone calling this.$() is
    // trying to update an element that isn't in the DOM. Instead,
    // rerender the view to allow the render method to reflect the
    // changes.
    view.rerender();
    return Ember.$();
  },

  // when a view is rendered in a buffer, rerendering it simply
  // replaces the existing buffer with a new one
  rerender: function(view) {
    throw new Ember.Error("Something you did caused a view to re-render after it rendered but before it was inserted into the DOM.");
  },

  // when a view is rendered in a buffer, appending a child
  // view will render that view and append the resulting
  // buffer into its buffer.
  appendChild: function(view, childView, options) {
    var buffer = view.buffer;

    childView = view.createChildView(childView, options);
    view._childViews.push(childView);

    childView.renderToBuffer(buffer);

    view.propertyDidChange('childViews');

    return childView;
  },

  // when a view is rendered in a buffer, destroying the
  // element will simply destroy the buffer and put the
  // state back into the preRender state.
  destroyElement: function(view) {
    view.clearBuffer();
    view._notifyWillDestroyElement();
    view.transitionTo('preRender');

    return view;
  },

  empty: function() {
    Ember.assert("Emptying a view in the inBuffer state is not allowed and should not happen under normal circumstances. Most likely there is a bug in your application. This may be due to excessive property change notifications.");
  },

  renderToBufferIfNeeded: function (view) {
    return view.buffer;
  },

  // It should be impossible for a rendered view to be scheduled for
  // insertion.
  insertElement: function() {
    throw "You can't insert an element that has already been rendered";
  },

  setElement: function(view, value) {
    if (value === null) {
      view.transitionTo('preRender');
    } else {
      view.clearBuffer();
      view.transitionTo('hasElement');
    }

    return value;
  }
});


})();



(function() {
/**
@module ember
@submodule ember-views
*/

var get = Ember.get, set = Ember.set, meta = Ember.meta;

var hasElement = Ember.View.states.hasElement = Ember.create(Ember.View.states._default);

Ember.merge(hasElement, {
  $: function(view, sel) {
    var elem = get(view, 'element');
    return sel ? Ember.$(sel, elem) : Ember.$(elem);
  },

  getElement: function(view) {
    var parent = get(view, 'parentView');
    if (parent) { parent = get(parent, 'element'); }
    if (parent) { return view.findElementInParentElement(parent); }
    return Ember.$("#" + get(view, 'elementId'))[0];
  },

  setElement: function(view, value) {
    if (value === null) {
      view.transitionTo('preRender');
    } else {
      throw "You cannot set an element to a non-null value when the element is already in the DOM.";
    }

    return value;
  },

  // once the view has been inserted into the DOM, rerendering is
  // deferred to allow bindings to synchronize.
  rerender: function(view) {
    view.triggerRecursively('willClearRender');

    view.clearRenderedChildren();

    view.domManager.replace(view);
    return view;
  },

  // once the view is already in the DOM, destroying it removes it
  // from the DOM, nukes its element, and puts it back into the
  // preRender state if inDOM.

  destroyElement: function(view) {
    view._notifyWillDestroyElement();
    view.domManager.remove(view);
    set(view, 'element', null);
    if (view._scheduledInsert) {
      Ember.run.cancel(view._scheduledInsert);
      view._scheduledInsert = null;
    }
    return view;
  },

  empty: function(view) {
    var _childViews = view._childViews, len, idx;
    if (_childViews) {
      len = _childViews.length;
      for (idx = 0; idx < len; idx++) {
        _childViews[idx]._notifyWillDestroyElement();
      }
    }
    view.domManager.empty(view);
  },

  // Handle events from `Ember.EventDispatcher`
  handleEvent: function(view, eventName, evt) {
    if (view.has(eventName)) {
      // Handler should be able to re-dispatch events, so we don't
      // preventDefault or stopPropagation.
      return view.trigger(eventName, evt);
    } else {
      return true; // continue event propagation
    }
  }
});

var inDOM = Ember.View.states.inDOM = Ember.create(hasElement);

Ember.merge(inDOM, {
  insertElement: function(view, fn) {
    throw "You can't insert an element into the DOM that has already been inserted";
  }
});

})();



(function() {
/**
@module ember
@submodule ember-views
*/

var destroyedError = "You can't call %@ on a destroyed view", fmt = Ember.String.fmt;

var destroyed = Ember.View.states.destroyed = Ember.create(Ember.View.states._default);

Ember.merge(destroyed, {
  appendChild: function() {
    throw fmt(destroyedError, ['appendChild']);
  },
  rerender: function() {
    throw fmt(destroyedError, ['rerender']);
  },
  destroyElement: function() {
    throw fmt(destroyedError, ['destroyElement']);
  },
  empty: function() {
    throw fmt(destroyedError, ['empty']);
  },

  setElement: function() {
    throw fmt(destroyedError, ["set('element', ...)"]);
  },

  renderToBufferIfNeeded: function() {
    throw fmt(destroyedError, ["renderToBufferIfNeeded"]);
  },

  // Since element insertion is scheduled, don't do anything if
  // the view has been destroyed between scheduling and execution
  insertElement: Ember.K
});


})();



(function() {
Ember.View.cloneStates = function(from) {
  var into = {};

  into._default = {};
  into.preRender = Ember.create(into._default);
  into.destroyed = Ember.create(into._default);
  into.inBuffer = Ember.create(into._default);
  into.hasElement = Ember.create(into._default);
  into.inDOM = Ember.create(into.hasElement);

  var viewState;

  for (var stateName in from) {
    if (!from.hasOwnProperty(stateName)) { continue; }
    Ember.merge(into[stateName], from[stateName]);
  }

  return into;
};

})();



(function() {
var states = Ember.View.cloneStates(Ember.View.states);

/**
@module ember
@submodule ember-views
*/

var get = Ember.get, set = Ember.set, meta = Ember.meta;
var forEach = Ember.EnumerableUtils.forEach;

/**
  A `ContainerView` is an `Ember.View` subclass that implements `Ember.MutableArray`
  allowing programatic management of its child views.

  ## Setting Initial Child Views

  The initial array of child views can be set in one of two ways. You can
  provide a `childViews` property at creation time that contains instance of
  `Ember.View`:

  ```javascript
  aContainer = Ember.ContainerView.create({
    childViews: [Ember.View.create(), Ember.View.create()]
  });
  ```

  You can also provide a list of property names whose values are instances of
  `Ember.View`:

  ```javascript
  aContainer = Ember.ContainerView.create({
    childViews: ['aView', 'bView', 'cView'],
    aView: Ember.View.create(),
    bView: Ember.View.create(),
    cView: Ember.View.create()
  });
  ```

  The two strategies can be combined:

  ```javascript
  aContainer = Ember.ContainerView.create({
    childViews: ['aView', Ember.View.create()],
    aView: Ember.View.create()
  });
  ```

  Each child view's rendering will be inserted into the container's rendered
  HTML in the same order as its position in the `childViews` property.

  ## Adding and Removing Child Views

  The container view implements `Ember.MutableArray` allowing programatic management of its child views.

  To remove a view, pass that view into a `removeObject` call on the container view.

  Given an empty `<body>` the following code

  ```javascript
  aContainer = Ember.ContainerView.create({
    classNames: ['the-container'],
    childViews: ['aView', 'bView'],
    aView: Ember.View.create({
      template: Ember.Handlebars.compile("A")
    }),
    bView: Ember.View.create({
      template: Ember.Handlebars.compile("B")
    })
  });

  aContainer.appendTo('body');
  ```

  Results in the HTML

  ```html
  <div class="ember-view the-container">
    <div class="ember-view">A</div>
    <div class="ember-view">B</div>
  </div>
  ```

  Removing a view

  ```javascript
  aContainer.toArray();  // [aContainer.aView, aContainer.bView]
  aContainer.removeObject(aContainer.get('bView'));
  aContainer.toArray();  // [aContainer.aView]
  ```

  Will result in the following HTML

  ```html
  <div class="ember-view the-container">
    <div class="ember-view">A</div>
  </div>
  ```

  Similarly, adding a child view is accomplished by adding `Ember.View` instances to the
  container view.

  Given an empty `<body>` the following code

  ```javascript
  aContainer = Ember.ContainerView.create({
    classNames: ['the-container'],
    childViews: ['aView', 'bView'],
    aView: Ember.View.create({
      template: Ember.Handlebars.compile("A")
    }),
    bView: Ember.View.create({
      template: Ember.Handlebars.compile("B")
    })
  });

  aContainer.appendTo('body');
  ```

  Results in the HTML

  ```html
  <div class="ember-view the-container">
    <div class="ember-view">A</div>
    <div class="ember-view">B</div>
  </div>
  ```

  Adding a view

  ```javascript
  AnotherViewClass = Ember.View.extend({
    template: Ember.Handlebars.compile("Another view")
  });

  aContainer.toArray();  // [aContainer.aView, aContainer.bView]
  aContainer.pushObject(AnotherViewClass.create());
  aContainer.toArray(); // [aContainer.aView, aContainer.bView, <AnotherViewClass instance>]
  ```

  Will result in the following HTML

  ```html
  <div class="ember-view the-container">
    <div class="ember-view">A</div>
    <div class="ember-view">B</div>
    <div class="ember-view">Another view</div>
  </div>
  ```

  ## Templates and Layout

  A `template`, `templateName`, `defaultTemplate`, `layout`, `layoutName` or
  `defaultLayout` property on a container view will not result in the template
  or layout being rendered. The HTML contents of a `Ember.ContainerView`'s DOM
  representation will only be the rendered HTML of its child views.

  ## Binding a View to Display

  If you would like to display a single view in your ContainerView, you can set
  its `currentView` property. When the `currentView` property is set to a view
  instance, it will be added to the ContainerView. If the `currentView` property
  is later changed to a different view, the new view will replace the old view.
  If `currentView` is set to `null`, the last `currentView` will be removed.

  This functionality is useful for cases where you want to bind the display of
  a ContainerView to a controller or state manager. For example, you can bind
  the `currentView` of a container to a controller like this:

  ```javascript
  App.appController = Ember.Object.create({
    view: Ember.View.create({
      templateName: 'person_template'
    })
  });
  ```

  ```handlebars
  {{view Ember.ContainerView currentViewBinding="App.appController.view"}}
  ```

  @class ContainerView
  @namespace Ember
  @extends Ember.View
*/
Ember.ContainerView = Ember.View.extend(Ember.MutableArray, {
  states: states,

  init: function() {
    this._super();

    var childViews = get(this, 'childViews');

    // redefine view's childViews property that was obliterated
    Ember.defineProperty(this, 'childViews', Ember.View.childViewsProperty);

    var _childViews = this._childViews;

    forEach(childViews, function(viewName, idx) {
      var view;

      if ('string' === typeof viewName) {
        view = get(this, viewName);
        view = this.createChildView(view);
        set(this, viewName, view);
      } else {
        view = this.createChildView(viewName);
      }

      _childViews[idx] = view;
    }, this);

    var currentView = get(this, 'currentView');
    if (currentView) {
      _childViews.push(this.createChildView(currentView));
    }
  },

  replace: function(idx, removedCount, addedViews) {
    var addedCount = addedViews ? get(addedViews, 'length') : 0;

    this.arrayContentWillChange(idx, removedCount, addedCount);
    this.childViewsWillChange(this._childViews, idx, removedCount);

    if (addedCount === 0) {
      this._childViews.splice(idx, removedCount) ;
    } else {
      var args = [idx, removedCount].concat(addedViews);
      this._childViews.splice.apply(this._childViews, args);
    }

    this.arrayContentDidChange(idx, removedCount, addedCount);
    this.childViewsDidChange(this._childViews, idx, removedCount, addedCount);

    return this;
  },

  objectAt: function(idx) {
    return this._childViews[idx];
  },

  length: Ember.computed(function () {
    return this._childViews.length;
  }),

  /**
    @private

    Instructs each child view to render to the passed render buffer.

    @method render
    @param {Ember.RenderBuffer} buffer the buffer to render to
  */
  render: function(buffer) {
    this.forEachChildView(function(view) {
      view.renderToBuffer(buffer);
    });
  },

  instrumentName: 'render.container',

  /**
    @private

    When a child view is removed, destroy its element so that
    it is removed from the DOM.

    The array observer that triggers this action is set up in the
    `renderToBuffer` method.

    @method childViewsWillChange
    @param {Ember.Array} views the child views array before mutation
    @param {Number} start the start position of the mutation
    @param {Number} removed the number of child views removed
  **/
  childViewsWillChange: function(views, start, removed) {
    this.propertyWillChange('childViews');

    if (removed > 0) {
      var changedViews = views.slice(start, start+removed);
      // transition to preRender before clearing parentView
      this.currentState.childViewsWillChange(this, views, start, removed);
      this.initializeViews(changedViews, null, null);
    }
  },

  removeChild: function(child) {
    this.removeObject(child);
    return this;
  },

  /**
    @private

    When a child view is added, make sure the DOM gets updated appropriately.

    If the view has already rendered an element, we tell the child view to
    create an element and insert it into the DOM. If the enclosing container
    view has already written to a buffer, but not yet converted that buffer
    into an element, we insert the string representation of the child into the
    appropriate place in the buffer.

    @method childViewsDidChange
    @param {Ember.Array} views the array of child views afte the mutation has occurred
    @param {Number} start the start position of the mutation
    @param {Number} removed the number of child views removed
    @param {Number} the number of child views added
  */
  childViewsDidChange: function(views, start, removed, added) {
    if (added > 0) {
      var changedViews = views.slice(start, start+added);
      this.initializeViews(changedViews, this, get(this, 'templateData'));
      this.currentState.childViewsDidChange(this, views, start, added);
    }
    this.propertyDidChange('childViews');
  },

  initializeViews: function(views, parentView, templateData) {
    forEach(views, function(view) {
      set(view, '_parentView', parentView);

      if (!get(view, 'templateData')) {
        set(view, 'templateData', templateData);
      }
    });
  },

  currentView: null,

  _currentViewWillChange: Ember.beforeObserver(function() {
    var currentView = get(this, 'currentView');
    if (currentView) {
      currentView.destroy();
    }
  }, 'currentView'),

  _currentViewDidChange: Ember.observer(function() {
    var currentView = get(this, 'currentView');
    if (currentView) {
      this.pushObject(currentView);
    }
  }, 'currentView'),

  _ensureChildrenAreInDOM: function () {
    this.currentState.ensureChildrenAreInDOM(this);
  }
});

Ember.merge(states._default, {
  childViewsWillChange: Ember.K,
  childViewsDidChange: Ember.K,
  ensureChildrenAreInDOM: Ember.K
});

Ember.merge(states.inBuffer, {
  childViewsDidChange: function(parentView, views, start, added) {
    throw new Error('You cannot modify child views while in the inBuffer state');
  }
});

Ember.merge(states.hasElement, {
  childViewsWillChange: function(view, views, start, removed) {
    for (var i=start; i<start+removed; i++) {
      views[i].remove();
    }
  },

  childViewsDidChange: function(view, views, start, added) {
    Ember.run.scheduleOnce('render', view, '_ensureChildrenAreInDOM');
  },

  ensureChildrenAreInDOM: function(view) {
    var childViews = view._childViews, i, len, childView, previous, buffer;
    for (i = 0, len = childViews.length; i < len; i++) {
      childView = childViews[i];
      buffer = childView.renderToBufferIfNeeded();
      if (buffer) {
        childView.triggerRecursively('willInsertElement');
        if (previous) {
          previous.domManager.after(previous, buffer.string());
        } else {
          view.domManager.prepend(view, buffer.string());
        }
        childView.transitionTo('inDOM');
        childView.propertyDidChange('element');
        childView.triggerRecursively('didInsertElement');
      }
      previous = childView;
    }
  }
});

})();



(function() {
/**
@module ember
@submodule ember-views
*/

var get = Ember.get, set = Ember.set, fmt = Ember.String.fmt;

/**
  `Ember.CollectionView` is an `Ember.View` descendent responsible for managing
  a collection (an array or array-like object) by maintaing a child view object
  and associated DOM representation for each item in the array and ensuring
  that child views and their associated rendered HTML are updated when items in
  the array are added, removed, or replaced.

  ## Setting content

  The managed collection of objects is referenced as the `Ember.CollectionView`
  instance's `content` property.

  ```javascript
  someItemsView = Ember.CollectionView.create({
    content: ['A', 'B','C']
  })
  ```

  The view for each item in the collection will have its `content` property set
  to the item.

  ## Specifying itemViewClass

  By default the view class for each item in the managed collection will be an
  instance of `Ember.View`. You can supply a different class by setting the
  `CollectionView`'s `itemViewClass` property.

  Given an empty `<body>` and the following code:

  ```javascript
  someItemsView = Ember.CollectionView.create({
    classNames: ['a-collection'],
    content: ['A','B','C'],
    itemViewClass: Ember.View.extend({
      template: Ember.Handlebars.compile("the letter: {{view.content}}")
    })
  });

  someItemsView.appendTo('body');
  ```

  Will result in the following HTML structure

  ```html
  <div class="ember-view a-collection">
    <div class="ember-view">the letter: A</div>
    <div class="ember-view">the letter: B</div>
    <div class="ember-view">the letter: C</div>
  </div>
  ```

  ## Automatic matching of parent/child tagNames

  Setting the `tagName` property of a `CollectionView` to any of
  "ul", "ol", "table", "thead", "tbody", "tfoot", "tr", or "select" will result
  in the item views receiving an appropriately matched `tagName` property.

  Given an empty `<body>` and the following code:

  ```javascript
  anUndorderedListView = Ember.CollectionView.create({
    tagName: 'ul',
    content: ['A','B','C'],
    itemViewClass: Ember.View.extend({
      template: Ember.Handlebars.compile("the letter: {{view.content}}")
    })
  });

  anUndorderedListView.appendTo('body');
  ```

  Will result in the following HTML structure

  ```html
  <ul class="ember-view a-collection">
    <li class="ember-view">the letter: A</li>
    <li class="ember-view">the letter: B</li>
    <li class="ember-view">the letter: C</li>
  </ul>
  ```

  Additional `tagName` pairs can be provided by adding to
  `Ember.CollectionView.CONTAINER_MAP `

  ```javascript
  Ember.CollectionView.CONTAINER_MAP['article'] = 'section'
  ```

  ## Programatic creation of child views

  For cases where additional customization beyond the use of a single
  `itemViewClass` or `tagName` matching is required CollectionView's
  `createChildView` method can be overidden:

  ```javascript
  CustomCollectionView = Ember.CollectionView.extend({
    createChildView: function(viewClass, attrs) {
      if (attrs.content.kind == 'album') {
        viewClass = App.AlbumView;
      } else {
        viewClass = App.SongView;
      }
      this._super(viewClass, attrs);
    }
  });
  ```

  ## Empty View

  You can provide an `Ember.View` subclass to the `Ember.CollectionView`
  instance as its `emptyView` property. If the `content` property of a
  `CollectionView` is set to `null` or an empty array, an instance of this view
  will be the `CollectionView`s only child.

  ```javascript
  aListWithNothing = Ember.CollectionView.create({
    classNames: ['nothing']
    content: null,
    emptyView: Ember.View.extend({
      template: Ember.Handlebars.compile("The collection is empty")
    })
  });

  aListWithNothing.appendTo('body');
  ```

  Will result in the following HTML structure

  ```html
  <div class="ember-view nothing">
    <div class="ember-view">
      The collection is empty
    </div>
  </div>
  ```

  ## Adding and Removing items

  The `childViews` property of a `CollectionView` should not be directly
  manipulated. Instead, add, remove, replace items from its `content` property.
  This will trigger appropriate changes to its rendered HTML.

  ## Use in templates via the `{{collection}}` `Ember.Handlebars` helper

  `Ember.Handlebars` provides a helper specifically for adding
  `CollectionView`s to templates. See `Ember.Handlebars.collection` for more
  details

  @class CollectionView
  @namespace Ember
  @extends Ember.ContainerView
  @since Ember 0.9
*/
Ember.CollectionView = Ember.ContainerView.extend(
/** @scope Ember.CollectionView.prototype */ {

  /**
    A list of items to be displayed by the `Ember.CollectionView`.

    @property content
    @type Ember.Array
    @default null
  */
  content: null,

  /**
    @private

    This provides metadata about what kind of empty view class this
    collection would like if it is being instantiated from another
    system (like Handlebars)

    @property emptyViewClass
  */
  emptyViewClass: Ember.View,

  /**
    An optional view to display if content is set to an empty array.

    @property emptyView
    @type Ember.View
    @default null
  */
  emptyView: null,

  /**
    @property itemViewClass
    @type Ember.View
    @default Ember.View
  */
  itemViewClass: Ember.View,

  init: function() {
    var ret = this._super();
    this._contentDidChange();
    return ret;
  },

  _contentWillChange: Ember.beforeObserver(function() {
    var content = this.get('content');

    if (content) { content.removeArrayObserver(this); }
    var len = content ? get(content, 'length') : 0;
    this.arrayWillChange(content, 0, len);
  }, 'content'),

  /**
    @private

    Check to make sure that the content has changed, and if so,
    update the children directly. This is always scheduled
    asynchronously, to allow the element to be created before
    bindings have synchronized and vice versa.

    @method _contentDidChange
  */
  _contentDidChange: Ember.observer(function() {
    var content = get(this, 'content');

    if (content) {
      Ember.assert(fmt("an Ember.CollectionView's content must implement Ember.Array. You passed %@", [content]), Ember.Array.detect(content));
      content.addArrayObserver(this);
    }

    var len = content ? get(content, 'length') : 0;
    this.arrayDidChange(content, 0, null, len);
  }, 'content'),

  willDestroy: function() {
    var content = get(this, 'content');
    if (content) { content.removeArrayObserver(this); }

    this._super();

    if (this._createdEmptyView) {
      this._createdEmptyView.destroy();
    }
  },

  arrayWillChange: function(content, start, removedCount) {
    // If the contents were empty before and this template collection has an
    // empty view remove it now.
    var emptyView = get(this, 'emptyView');
    if (emptyView && emptyView instanceof Ember.View) {
      emptyView.removeFromParent();
    }

    // Loop through child views that correspond with the removed items.
    // Note that we loop from the end of the array to the beginning because
    // we are mutating it as we go.
    var childViews = this._childViews, childView, idx, len;

    len = this._childViews.length;

    var removingAll = removedCount === len;

    if (removingAll) {
      this.currentState.empty(this);
    }

    for (idx = start + removedCount - 1; idx >= start; idx--) {
      childView = childViews[idx];
      if (removingAll) { childView.removedFromDOM = true; }
      childView.destroy();
    }
  },

  /**
    Called when a mutation to the underlying content array occurs.

    This method will replay that mutation against the views that compose the
    `Ember.CollectionView`, ensuring that the view reflects the model.

    This array observer is added in `contentDidChange`.

    @method arrayDidChange
    @param {Array} addedObjects the objects that were added to the content
    @param {Array} removedObjects the objects that were removed from the content
    @param {Number} changeIndex the index at which the changes occurred
  */
  arrayDidChange: function(content, start, removed, added) {
    var itemViewClass = get(this, 'itemViewClass'),
        addedViews = [], view, item, idx, len, itemTagName;

    if ('string' === typeof itemViewClass) {
      itemViewClass = get(itemViewClass);
    }

    Ember.assert(fmt("itemViewClass must be a subclass of Ember.View, not %@", [itemViewClass]), Ember.View.detect(itemViewClass));

    len = content ? get(content, 'length') : 0;
    if (len) {
      for (idx = start; idx < start+added; idx++) {
        item = content.objectAt(idx);

        view = this.createChildView(itemViewClass, {
          content: item,
          contentIndex: idx
        });

        addedViews.push(view);
      }
    } else {
      var emptyView = get(this, 'emptyView');
      if (!emptyView) { return; }

      var isClass = Ember.CoreView.detect(emptyView);

      emptyView = this.createChildView(emptyView);
      addedViews.push(emptyView);
      set(this, 'emptyView', emptyView);

      if (isClass) { this._createdEmptyView = emptyView; }
    }
    this.replace(start, 0, addedViews);
  },

  createChildView: function(view, attrs) {
    view = this._super(view, attrs);

    var itemTagName = get(view, 'tagName');
    var tagName = (itemTagName === null || itemTagName === undefined) ? Ember.CollectionView.CONTAINER_MAP[get(this, 'tagName')] : itemTagName;

    set(view, 'tagName', tagName);

    return view;
  }
});

/**
  A map of parent tags to their default child tags. You can add
  additional parent tags if you want collection views that use
  a particular parent tag to default to a child tag.

  @property CONTAINER_MAP
  @type Hash
  @static
  @final
*/
Ember.CollectionView.CONTAINER_MAP = {
  ul: 'li',
  ol: 'li',
  table: 'tr',
  thead: 'tr',
  tbody: 'tr',
  tfoot: 'tr',
  tr: 'td',
  select: 'option'
};

})();



(function() {

})();



(function() {
/*globals jQuery*/
/**
Ember Views

@module ember
@submodule ember-views
@requires ember-runtime
@main ember-views
*/

})();

(function() {
define("metamorph",
  [],
  function() {
    "use strict";
    // ==========================================================================
    // Project:   metamorph
    // Copyright: ©2011 My Company Inc. All rights reserved.
    // ==========================================================================

    var K = function(){},
        guid = 0,
        document = window.document,

        // Feature-detect the W3C range API, the extended check is for IE9 which only partially supports ranges
        supportsRange = ('createRange' in document) && (typeof Range !== 'undefined') && Range.prototype.createContextualFragment,

        // Internet Explorer prior to 9 does not allow setting innerHTML if the first element
        // is a "zero-scope" element. This problem can be worked around by making
        // the first node an invisible text node. We, like Modernizr, use &shy;
        needsShy = (function(){
          var testEl = document.createElement('div');
          testEl.innerHTML = "<div></div>";
          testEl.firstChild.innerHTML = "<script></script>";
          return testEl.firstChild.innerHTML === '';
        })(),


        // IE 8 (and likely earlier) likes to move whitespace preceeding
        // a script tag to appear after it. This means that we can
        // accidentally remove whitespace when updating a morph.
        movesWhitespace = (function() {
          var testEl = document.createElement('div');
          testEl.innerHTML = "Test: <script type='text/x-placeholder'></script>Value";
          return testEl.childNodes[0].nodeValue === 'Test:' &&
                  testEl.childNodes[2].nodeValue === ' Value';
        })();

    // Constructor that supports either Metamorph('foo') or new
    // Metamorph('foo');
    //
    // Takes a string of HTML as the argument.

    var Metamorph = function(html) {
      var self;

      if (this instanceof Metamorph) {
        self = this;
      } else {
        self = new K();
      }

      self.innerHTML = html;
      var myGuid = 'metamorph-'+(guid++);
      self.start = myGuid + '-start';
      self.end = myGuid + '-end';

      return self;
    };

    K.prototype = Metamorph.prototype;

    var rangeFor, htmlFunc, removeFunc, outerHTMLFunc, appendToFunc, afterFunc, prependFunc, startTagFunc, endTagFunc;

    outerHTMLFunc = function() {
      return this.startTag() + this.innerHTML + this.endTag();
    };

    startTagFunc = function() {
      /*
       * We replace chevron by its hex code in order to prevent escaping problems.
       * Check this thread for more explaination:
       * http://stackoverflow.com/questions/8231048/why-use-x3c-instead-of-when-generating-html-from-javascript
       */
      return "<script id='" + this.start + "' type='text/x-placeholder'>\x3C/script>";
    };

    endTagFunc = function() {
      /*
       * We replace chevron by its hex code in order to prevent escaping problems.
       * Check this thread for more explaination:
       * http://stackoverflow.com/questions/8231048/why-use-x3c-instead-of-when-generating-html-from-javascript
       */
      return "<script id='" + this.end + "' type='text/x-placeholder'>\x3C/script>";
    };

    // If we have the W3C range API, this process is relatively straight forward.
    if (supportsRange) {

      // Get a range for the current morph. Optionally include the starting and
      // ending placeholders.
      rangeFor = function(morph, outerToo) {
        var range = document.createRange();
        var before = document.getElementById(morph.start);
        var after = document.getElementById(morph.end);

        if (outerToo) {
          range.setStartBefore(before);
          range.setEndAfter(after);
        } else {
          range.setStartAfter(before);
          range.setEndBefore(after);
        }

        return range;
      };

      htmlFunc = function(html, outerToo) {
        // get a range for the current metamorph object
        var range = rangeFor(this, outerToo);

        // delete the contents of the range, which will be the
        // nodes between the starting and ending placeholder.
        range.deleteContents();

        // create a new document fragment for the HTML
        var fragment = range.createContextualFragment(html);

        // insert the fragment into the range
        range.insertNode(fragment);
      };

      removeFunc = function() {
        // get a range for the current metamorph object including
        // the starting and ending placeholders.
        var range = rangeFor(this, true);

        // delete the entire range.
        range.deleteContents();
      };

      appendToFunc = function(node) {
        var range = document.createRange();
        range.setStart(node);
        range.collapse(false);
        var frag = range.createContextualFragment(this.outerHTML());
        node.appendChild(frag);
      };

      afterFunc = function(html) {
        var range = document.createRange();
        var after = document.getElementById(this.end);

        range.setStartAfter(after);
        range.setEndAfter(after);

        var fragment = range.createContextualFragment(html);
        range.insertNode(fragment);
      };

      prependFunc = function(html) {
        var range = document.createRange();
        var start = document.getElementById(this.start);

        range.setStartAfter(start);
        range.setEndAfter(start);

        var fragment = range.createContextualFragment(html);
        range.insertNode(fragment);
      };

    } else {
      /**
       * This code is mostly taken from jQuery, with one exception. In jQuery's case, we
       * have some HTML and we need to figure out how to convert it into some nodes.
       *
       * In this case, jQuery needs to scan the HTML looking for an opening tag and use
       * that as the key for the wrap map. In our case, we know the parent node, and
       * can use its type as the key for the wrap map.
       **/
      var wrapMap = {
        select: [ 1, "<select multiple='multiple'>", "</select>" ],
        fieldset: [ 1, "<fieldset>", "</fieldset>" ],
        table: [ 1, "<table>", "</table>" ],
        tbody: [ 2, "<table><tbody>", "</tbody></table>" ],
        tr: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        colgroup: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        map: [ 1, "<map>", "</map>" ],
        _default: [ 0, "", "" ]
      };

      var findChildById = function(element, id) {
        if (element.getAttribute('id') === id) { return element; }

        var len = element.childNodes.length, idx, node, found;
        for (idx=0; idx<len; idx++) {
          node = element.childNodes[idx];
          found = node.nodeType === 1 && findChildById(node, id);
          if (found) { return found; }
        }
      };

      var setInnerHTML = function(element, html) {
        var matches = [];
        if (movesWhitespace) {
          // Right now we only check for script tags with ids with the
          // goal of targeting morphs.
          html = html.replace(/(\s+)(<script id='([^']+)')/g, function(match, spaces, tag, id) {
            matches.push([id, spaces]);
            return tag;
          });
        }

        element.innerHTML = html;

        // If we have to do any whitespace adjustments do them now
        if (matches.length > 0) {
          var len = matches.length, idx;
          for (idx=0; idx<len; idx++) {
            var script = findChildById(element, matches[idx][0]),
                node = document.createTextNode(matches[idx][1]);
            script.parentNode.insertBefore(node, script);
          }
        }
      };

      /**
       * Given a parent node and some HTML, generate a set of nodes. Return the first
       * node, which will allow us to traverse the rest using nextSibling.
       *
       * We need to do this because innerHTML in IE does not really parse the nodes.
       **/
      var firstNodeFor = function(parentNode, html) {
        var arr = wrapMap[parentNode.tagName.toLowerCase()] || wrapMap._default;
        var depth = arr[0], start = arr[1], end = arr[2];

        if (needsShy) { html = '&shy;'+html; }

        var element = document.createElement('div');

        setInnerHTML(element, start + html + end);

        for (var i=0; i<=depth; i++) {
          element = element.firstChild;
        }

        // Look for &shy; to remove it.
        if (needsShy) {
          var shyElement = element;

          // Sometimes we get nameless elements with the shy inside
          while (shyElement.nodeType === 1 && !shyElement.nodeName) {
            shyElement = shyElement.firstChild;
          }

          // At this point it's the actual unicode character.
          if (shyElement.nodeType === 3 && shyElement.nodeValue.charAt(0) === "\u00AD") {
            shyElement.nodeValue = shyElement.nodeValue.slice(1);
          }
        }

        return element;
      };

      /**
       * In some cases, Internet Explorer can create an anonymous node in
       * the hierarchy with no tagName. You can create this scenario via:
       *
       *     div = document.createElement("div");
       *     div.innerHTML = "<table>&shy<script></script><tr><td>hi</td></tr></table>";
       *     div.firstChild.firstChild.tagName //=> ""
       *
       * If our script markers are inside such a node, we need to find that
       * node and use *it* as the marker.
       **/
      var realNode = function(start) {
        while (start.parentNode.tagName === "") {
          start = start.parentNode;
        }

        return start;
      };

      /**
       * When automatically adding a tbody, Internet Explorer inserts the
       * tbody immediately before the first <tr>. Other browsers create it
       * before the first node, no matter what.
       *
       * This means the the following code:
       *
       *     div = document.createElement("div");
       *     div.innerHTML = "<table><script id='first'></script><tr><td>hi</td></tr><script id='last'></script></table>
       *
       * Generates the following DOM in IE:
       *
       *     + div
       *       + table
       *         - script id='first'
       *         + tbody
       *           + tr
       *             + td
       *               - "hi"
       *           - script id='last'
       *
       * Which means that the two script tags, even though they were
       * inserted at the same point in the hierarchy in the original
       * HTML, now have different parents.
       *
       * This code reparents the first script tag by making it the tbody's
       * first child.
       **/
      var fixParentage = function(start, end) {
        if (start.parentNode !== end.parentNode) {
          end.parentNode.insertBefore(start, end.parentNode.firstChild);
        }
      };

      htmlFunc = function(html, outerToo) {
        // get the real starting node. see realNode for details.
        var start = realNode(document.getElementById(this.start));
        var end = document.getElementById(this.end);
        var parentNode = end.parentNode;
        var node, nextSibling, last;

        // make sure that the start and end nodes share the same
        // parent. If not, fix it.
        fixParentage(start, end);

        // remove all of the nodes after the starting placeholder and
        // before the ending placeholder.
        node = start.nextSibling;
        while (node) {
          nextSibling = node.nextSibling;
          last = node === end;

          // if this is the last node, and we want to remove it as well,
          // set the `end` node to the next sibling. This is because
          // for the rest of the function, we insert the new nodes
          // before the end (note that insertBefore(node, null) is
          // the same as appendChild(node)).
          //
          // if we do not want to remove it, just break.
          if (last) {
            if (outerToo) { end = node.nextSibling; } else { break; }
          }

          node.parentNode.removeChild(node);

          // if this is the last node and we didn't break before
          // (because we wanted to remove the outer nodes), break
          // now.
          if (last) { break; }

          node = nextSibling;
        }

        // get the first node for the HTML string, even in cases like
        // tables and lists where a simple innerHTML on a div would
        // swallow some of the content.
        node = firstNodeFor(start.parentNode, html);

        // copy the nodes for the HTML between the starting and ending
        // placeholder.
        while (node) {
          nextSibling = node.nextSibling;
          parentNode.insertBefore(node, end);
          node = nextSibling;
        }
      };

      // remove the nodes in the DOM representing this metamorph.
      //
      // this includes the starting and ending placeholders.
      removeFunc = function() {
        var start = realNode(document.getElementById(this.start));
        var end = document.getElementById(this.end);

        this.html('');
        start.parentNode.removeChild(start);
        end.parentNode.removeChild(end);
      };

      appendToFunc = function(parentNode) {
        var node = firstNodeFor(parentNode, this.outerHTML());
        var nextSibling;

        while (node) {
          nextSibling = node.nextSibling;
          parentNode.appendChild(node);
          node = nextSibling;
        }
      };

      afterFunc = function(html) {
        // get the real starting node. see realNode for details.
        var end = document.getElementById(this.end);
        var insertBefore = end.nextSibling;
        var parentNode = end.parentNode;
        var nextSibling;
        var node;

        // get the first node for the HTML string, even in cases like
        // tables and lists where a simple innerHTML on a div would
        // swallow some of the content.
        node = firstNodeFor(parentNode, html);

        // copy the nodes for the HTML between the starting and ending
        // placeholder.
        while (node) {
          nextSibling = node.nextSibling;
          parentNode.insertBefore(node, insertBefore);
          node = nextSibling;
        }
      };

      prependFunc = function(html) {
        var start = document.getElementById(this.start);
        var parentNode = start.parentNode;
        var nextSibling;
        var node;

        node = firstNodeFor(parentNode, html);
        var insertBefore = start.nextSibling;

        while (node) {
          nextSibling = node.nextSibling;
          parentNode.insertBefore(node, insertBefore);
          node = nextSibling;
        }
      };
    }

    Metamorph.prototype.html = function(html) {
      this.checkRemoved();
      if (html === undefined) { return this.innerHTML; }

      htmlFunc.call(this, html);

      this.innerHTML = html;
    };

    Metamorph.prototype.replaceWith = function(html) {
      this.checkRemoved();
      htmlFunc.call(this, html, true);
    };

    Metamorph.prototype.remove = removeFunc;
    Metamorph.prototype.outerHTML = outerHTMLFunc;
    Metamorph.prototype.appendTo = appendToFunc;
    Metamorph.prototype.after = afterFunc;
    Metamorph.prototype.prepend = prependFunc;
    Metamorph.prototype.startTag = startTagFunc;
    Metamorph.prototype.endTag = endTagFunc;

    Metamorph.prototype.isRemoved = function() {
      var before = document.getElementById(this.start);
      var after = document.getElementById(this.end);

      return !before || !after;
    };

    Metamorph.prototype.checkRemoved = function() {
      if (this.isRemoved()) {
        throw new Error("Cannot perform operations on a Metamorph that is not in the DOM.");
      }
    };

    return Metamorph;
  });

})();

(function() {
/**
@module ember
@submodule ember-handlebars
*/

// Eliminate dependency on any Ember to simplify precompilation workflow
var objectCreate = Object.create || function(parent) {
  function F() {}
  F.prototype = parent;
  return new F();
};

var Handlebars = this.Handlebars || Ember.imports.Handlebars;
Ember.assert("Ember Handlebars requires Handlebars 1.0.0-rc.3 or greater", Handlebars && Handlebars.VERSION.match(/^1\.0\.[0-9](\.rc\.[23456789]+)?/));

/**
  Prepares the Handlebars templating library for use inside Ember's view
  system.

  The `Ember.Handlebars` object is the standard Handlebars library, extended to
  use Ember's `get()` method instead of direct property access, which allows
  computed properties to be used inside templates.

  To create an `Ember.Handlebars` template, call `Ember.Handlebars.compile()`.
  This will return a function that can be used by `Ember.View` for rendering.

  @class Handlebars
  @namespace Ember
*/
Ember.Handlebars = objectCreate(Handlebars);

/**
@class helpers
@namespace Ember.Handlebars
*/
Ember.Handlebars.helpers = objectCreate(Handlebars.helpers);

/**
  Override the the opcode compiler and JavaScript compiler for Handlebars.

  @class Compiler
  @namespace Ember.Handlebars
  @private
  @constructor
*/
Ember.Handlebars.Compiler = function() {};

// Handlebars.Compiler doesn't exist in runtime-only
if (Handlebars.Compiler) {
  Ember.Handlebars.Compiler.prototype = objectCreate(Handlebars.Compiler.prototype);
}

Ember.Handlebars.Compiler.prototype.compiler = Ember.Handlebars.Compiler;

/**
  @class JavaScriptCompiler
  @namespace Ember.Handlebars
  @private
  @constructor
*/
Ember.Handlebars.JavaScriptCompiler = function() {};

// Handlebars.JavaScriptCompiler doesn't exist in runtime-only
if (Handlebars.JavaScriptCompiler) {
  Ember.Handlebars.JavaScriptCompiler.prototype = objectCreate(Handlebars.JavaScriptCompiler.prototype);
  Ember.Handlebars.JavaScriptCompiler.prototype.compiler = Ember.Handlebars.JavaScriptCompiler;
}


Ember.Handlebars.JavaScriptCompiler.prototype.namespace = "Ember.Handlebars";


Ember.Handlebars.JavaScriptCompiler.prototype.initializeBuffer = function() {
  return "''";
};

/**
  @private

  Override the default buffer for Ember Handlebars. By default, Handlebars
  creates an empty String at the beginning of each invocation and appends to
  it. Ember's Handlebars overrides this to append to a single shared buffer.

  @method appendToBuffer
  @param string {String}
*/
Ember.Handlebars.JavaScriptCompiler.prototype.appendToBuffer = function(string) {
  return "data.buffer.push("+string+");";
};

var prefix = "ember" + (+new Date()), incr = 1;

/**
  @private

  Rewrite simple mustaches from `{{foo}}` to `{{bind "foo"}}`. This means that
  all simple mustaches in Ember's Handlebars will also set up an observer to
  keep the DOM up to date when the underlying property changes.

  @method mustache
  @for Ember.Handlebars.Compiler
  @param mustache
*/
Ember.Handlebars.Compiler.prototype.mustache = function(mustache) {
  if (mustache.isHelper && mustache.id.string === 'control') {
    mustache.hash = mustache.hash || new Handlebars.AST.HashNode([]);
    mustache.hash.pairs.push(["controlID", new Handlebars.AST.StringNode(prefix + incr++)]);
  } else if (mustache.params.length || mustache.hash) {
    // no changes required
  } else {
    var id = new Handlebars.AST.IdNode(['_triageMustache']);

    // Update the mustache node to include a hash value indicating whether the original node
    // was escaped. This will allow us to properly escape values when the underlying value
    // changes and we need to re-render the value.
    if(!mustache.escaped) {
      mustache.hash = mustache.hash || new Handlebars.AST.HashNode([]);
      mustache.hash.pairs.push(["unescaped", new Handlebars.AST.StringNode("true")]);
    }
    mustache = new Handlebars.AST.MustacheNode([id].concat([mustache.id]), mustache.hash, !mustache.escaped);
  }

  return Handlebars.Compiler.prototype.mustache.call(this, mustache);
};

/**
  Used for precompilation of Ember Handlebars templates. This will not be used
  during normal app execution.

  @method precompile
  @for Ember.Handlebars
  @static
  @param {String} string The template to precompile
*/
Ember.Handlebars.precompile = function(string) {
  var ast = Handlebars.parse(string);

  var options = {
    knownHelpers: {
      action: true,
      unbound: true,
      bindAttr: true,
      template: true,
      view: true,
      _triageMustache: true
    },
    data: true,
    stringParams: true
  };

  var environment = new Ember.Handlebars.Compiler().compile(ast, options);
  return new Ember.Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);
};

// We don't support this for Handlebars runtime-only
if (Handlebars.compile) {
  /**
    The entry point for Ember Handlebars. This replaces the default
    `Handlebars.compile` and turns on template-local data and String
    parameters.

    @method compile
    @for Ember.Handlebars
    @static
    @param {String} string The template to compile
    @return {Function}
  */
  Ember.Handlebars.compile = function(string) {
    var ast = Handlebars.parse(string);
    var options = { data: true, stringParams: true };
    var environment = new Ember.Handlebars.Compiler().compile(ast, options);
    var templateSpec = new Ember.Handlebars.JavaScriptCompiler().compile(environment, options, undefined, true);

    return Ember.Handlebars.template(templateSpec);
  };
}


})();

(function() {
var slice = Array.prototype.slice;

/**
  @private

  If a path starts with a reserved keyword, returns the root
  that should be used.

  @method normalizePath
  @for Ember
  @param root {Object}
  @param path {String}
  @param data {Hash}
*/
var normalizePath = Ember.Handlebars.normalizePath = function(root, path, data) {
  var keywords = (data && data.keywords) || {},
      keyword, isKeyword;

  // Get the first segment of the path. For example, if the
  // path is "foo.bar.baz", returns "foo".
  keyword = path.split('.', 1)[0];

  // Test to see if the first path is a keyword that has been
  // passed along in the view's data hash. If so, we will treat
  // that object as the new root.
  if (keywords.hasOwnProperty(keyword)) {
    // Look up the value in the template's data hash.
    root = keywords[keyword];
    isKeyword = true;

    // Handle cases where the entire path is the reserved
    // word. In that case, return the object itself.
    if (path === keyword) {
      path = '';
    } else {
      // Strip the keyword from the path and look up
      // the remainder from the newly found root.
      path = path.substr(keyword.length+1);
    }
  }

  return { root: root, path: path, isKeyword: isKeyword };
};


/**
  Lookup both on root and on window. If the path starts with
  a keyword, the corresponding object will be looked up in the
  template's data hash and used to resolve the path.

  @method get
  @for Ember.Handlebars
  @param {Object} root The object to look up the property on
  @param {String} path The path to be lookedup
  @param {Object} options The template's option hash
*/
var handlebarsGet = Ember.Handlebars.get = function(root, path, options) {
  var data = options && options.data,
      normalizedPath = normalizePath(root, path, data),
      value;

  // In cases where the path begins with a keyword, change the
  // root to the value represented by that keyword, and ensure
  // the path is relative to it.
  root = normalizedPath.root;
  path = normalizedPath.path;

  value = Ember.get(root, path);

  // If the path starts with a capital letter, look it up on Ember.lookup,
  // which defaults to the `window` object in browsers.
  if (value === undefined && root !== Ember.lookup && Ember.isGlobalPath(path)) {
    value = Ember.get(Ember.lookup, path);
  }
  return value;
};
Ember.Handlebars.getPath = Ember.deprecateFunc('`Ember.Handlebars.getPath` has been changed to `Ember.Handlebars.get` for consistency.', Ember.Handlebars.get);

Ember.Handlebars.resolveParams = function(context, params, options) {
  var resolvedParams = [], types = options.types, param, type;

  for (var i=0, l=params.length; i<l; i++) {
    param = params[i];
    type = types[i];

    if (type === 'ID') {
      resolvedParams.push(handlebarsGet(context, param, options));
    } else {
      resolvedParams.push(param);
    }
  }

  return resolvedParams;
};

Ember.Handlebars.resolveHash = function(context, hash, options) {
  var resolvedHash = {}, types = options.hashTypes, type;

  for (var key in hash) {
    if (!hash.hasOwnProperty(key)) { continue; }

    type = types[key];

    if (type === 'ID') {
      resolvedHash[key] = handlebarsGet(context, hash[key], options);
    } else {
      resolvedHash[key] = hash[key];
    }
  }

  return resolvedHash;
};

/**
  @private

  Registers a helper in Handlebars that will be called if no property with the
  given name can be found on the current context object, and no helper with
  that name is registered.

  This throws an exception with a more helpful error message so the user can
  track down where the problem is happening.

  @method helperMissing
  @for Ember.Handlebars.helpers
  @param {String} path
  @param {Hash} options
*/
Ember.Handlebars.registerHelper('helperMissing', function(path, options) {
  var error, view = "";

  error = "%@ Handlebars error: Could not find property '%@' on object %@.";
  if (options.data){
    view = options.data.view;
  }
  throw new Ember.Error(Ember.String.fmt(error, [view, path, this]));
});

/**
  Register a bound handlebars helper. Bound helpers behave similarly to regular
  handlebars helpers, with the added ability to re-render when the underlying data
  changes.

  ## Simple example

  ```javascript
  Ember.Handlebars.registerBoundHelper('capitalize', function(value) {
    return value.toUpperCase();
  });
  ```

  The above bound helper can be used inside of templates as follows:

  ```handlebars
  {{capitalize name}}
  ```

  In this case, when the `name` property of the template's context changes,
  the rendered value of the helper will update to reflect this change.

  ## Example with options

  Like normal handlebars helpers, bound helpers have access to the options
  passed into the helper call.

  ```javascript
  Ember.Handlebars.registerBoundHelper('repeat', function(value, options) {
    var count = options.hash.count;
    var a = [];
    while(a.length < count){
        a.push(value);
    }
    return a.join('');
  });
  ```

  This helper could be used in a template as follows:

  ```handlebars
  {{repeat text count=3}}
  ```

  ## Example with bound options

  Bound hash options are also supported. Example:

  ```handlebars
  {{repeat text countBinding="numRepeats"}}
  ```

  In this example, count will be bound to the value of
  the `numRepeats` property on the context. If that property
  changes, the helper will be re-rendered.

  ## Example with extra dependencies

  The `Ember.Handlebars.registerBoundHelper` method takes a variable length
  third parameter which indicates extra dependencies on the passed in value.
  This allows the handlebars helper to update when these dependencies change.

  ```javascript
  Ember.Handlebars.registerBoundHelper('capitalizeName', function(value) {
    return value.get('name').toUpperCase();
  }, 'name');
  ```

  ## Example with multiple bound properties

  `Ember.Handlebars.registerBoundHelper` supports binding to
  multiple properties, e.g.:

  ```javascript
  Ember.Handlebars.registerBoundHelper('concatenate', function() {
    var values = arguments[arguments.length - 1];
    return values.join('||');
  });
  ```

  Which allows for template syntax such as {{concatenate prop1 prop2}} or
  {{concatenate prop1 prop2 prop3}}. If any of the properties change,
  the helpr will re-render.  Note that dependency keys cannot be
  using in conjunction with multi-property helpers, since it is ambiguous
  which property the dependent keys would belong to.

  ## Use with unbound helper

  The {{unbound}} helper can be used with bound helper invocations
  to render them in their unbound form, e.g.

  ```handlebars
  {{unbound capitalize name}}
  ```

  In this example, if the name property changes, the helper
  will not re-render.


  @method registerBoundHelper
  @for Ember.Handlebars
  @param {String} name
  @param {Function} function
  @param {String} dependentKeys*
*/
Ember.Handlebars.registerBoundHelper = function(name, fn) {
  var dependentKeys = slice.call(arguments, 2);

  function helper() {
    var properties = slice.call(arguments, 0, -1),
      numProperties = properties.length,
      options = arguments[arguments.length - 1],
      normalizedProperties = [],
      data = options.data,
      hash = options.hash,
      view = data.view,
      currentContext = (options.contexts && options.contexts[0]) || this,
      normalized,
      pathRoot, path,
      loc, hashOption;

    // Detect bound options (e.g. countBinding="otherCount")
    hash.boundOptions = {};
    for (hashOption in hash) {
      if (!hash.hasOwnProperty(hashOption)) { continue; }

      if (Ember.IS_BINDING.test(hashOption) && typeof hash[hashOption] === 'string') {
        // Lop off 'Binding' suffix.
        hash.boundOptions[hashOption.slice(0, -7)] = hash[hashOption];
      }
    }

    // Expose property names on data.properties object.
    data.properties = [];
    for (loc = 0; loc < numProperties; ++loc) {
      data.properties.push(properties[loc]);
      normalizedProperties.push(normalizePath(currentContext, properties[loc], data));
    }

    if (data.isUnbound) {
      return evaluateUnboundHelper(this, fn, normalizedProperties, options);
    }

    if (dependentKeys.length === 0) {
      return evaluateMultiPropertyBoundHelper(currentContext, fn, normalizedProperties, options);
    }

    Ember.assert("Dependent keys can only be used with single-property helpers.", properties.length === 1);

    normalized = normalizedProperties[0];

    pathRoot = normalized.root;
    path = normalized.path;

    var bindView = new Ember._SimpleHandlebarsView(
      path, pathRoot, !options.hash.unescaped, options.data
    );

    bindView.normalizedValue = function() {
      var value = Ember._SimpleHandlebarsView.prototype.normalizedValue.call(bindView);
      return fn.call(view, value, options);
    };

    view.appendChild(bindView);

    view.registerObserver(pathRoot, path, bindView, rerenderBoundHelperView);

    for (var i=0, l=dependentKeys.length; i<l; i++) {
      view.registerObserver(pathRoot, path + '.' + dependentKeys[i], bindView, rerenderBoundHelperView);
    }
  }

  helper._rawFunction = fn;
  Ember.Handlebars.registerHelper(name, helper);
};

/**
  @private

  Renders the unbound form of an otherwise bound helper function.

  @param {Function} fn
  @param {Object} context
  @param {Array} normalizedProperties
  @param {String} options
*/
function evaluateMultiPropertyBoundHelper(context, fn, normalizedProperties, options) {
  var numProperties = normalizedProperties.length,
      self = this,
      data = options.data,
      view = data.view,
      hash = options.hash,
      boundOptions = hash.boundOptions,
      watchedProperties,
      boundOption, bindView, loc, property, len;

  bindView = new Ember._SimpleHandlebarsView(null, null, !hash.unescaped, data);
  bindView.normalizedValue = function() {
    var args = [], value, boundOption;

    // Copy over bound options.
    for (boundOption in boundOptions) {
      if (!boundOptions.hasOwnProperty(boundOption)) { continue; }
      property = normalizePath(context, boundOptions[boundOption], data);
      bindView.path = property.path;
      bindView.pathRoot = property.root;
      hash[boundOption] = Ember._SimpleHandlebarsView.prototype.normalizedValue.call(bindView);
    }

    for (loc = 0; loc < numProperties; ++loc) {
      property = normalizedProperties[loc];
      bindView.path = property.path;
      bindView.pathRoot = property.root;
      args.push(Ember._SimpleHandlebarsView.prototype.normalizedValue.call(bindView));
    }
    args.push(options);
    return fn.apply(context, args);
  };

  view.appendChild(bindView);

  // Assemble liast of watched properties that'll re-render this helper.
  watchedProperties = [];
  for (boundOption in boundOptions) {
    if (boundOptions.hasOwnProperty(boundOption)) {
      watchedProperties.push(normalizePath(context, boundOptions[boundOption], data));
    }
  }
  watchedProperties = watchedProperties.concat(normalizedProperties);

  // Observe each property.
  for (loc = 0, len = watchedProperties.length; loc < len; ++loc) {
    property = watchedProperties[loc];
    view.registerObserver(property.root, property.path, bindView, rerenderBoundHelperView);
  }

}

/**
  @private

  An observer function used with bound helpers which
  will schedule a re-render of the _SimpleHandlebarsView
  connected with the helper.
*/
function rerenderBoundHelperView() {
  Ember.run.scheduleOnce('render', this, 'rerender');
}

/**
  @private

  Renders the unbound form of an otherwise bound helper function.

  @param {Function} fn
  @param {Object} context
  @param {Array} normalizedProperties
  @param {String} options
*/
function evaluateUnboundHelper(context, fn, normalizedProperties, options) {
  var args = [], hash = options.hash, boundOptions = hash.boundOptions, loc, len, property, boundOption;

  for (boundOption in boundOptions) {
    if (!boundOptions.hasOwnProperty(boundOption)) { continue; }
    hash[boundOption] = Ember.Handlebars.get(context, boundOptions[boundOption], options);
  }

  for(loc = 0, len = normalizedProperties.length; loc < len; ++loc) {
    property = normalizedProperties[loc];
    args.push(Ember.Handlebars.get(context, property.path, options));
  }
  args.push(options);
  return fn.apply(context, args);
}

/**
  @private

  Overrides Handlebars.template so that we can distinguish
  user-created, top-level templates from inner contexts.

  @method template
  @for Ember.Handlebars
  @param {String} template spec
*/
Ember.Handlebars.template = function(spec){
  var t = Handlebars.template(spec);
  t.isTop = true;
  return t;
};


})();



(function() {
/**
  @method htmlSafe
  @for Ember.String
  @static
*/
Ember.String.htmlSafe = function(str) {
  return new Handlebars.SafeString(str);
};

var htmlSafe = Ember.String.htmlSafe;

if (Ember.EXTEND_PROTOTYPES === true || Ember.EXTEND_PROTOTYPES.String) {

  /**
    See {{#crossLink "Ember.String/htmlSafe"}}{{/crossLink}}

    @method htmlSafe
    @for String
  */
  String.prototype.htmlSafe = function() {
    return htmlSafe(this);
  };
}

})();



(function() {
Ember.Handlebars.resolvePaths = function(options) {
  var ret = [],
      contexts = options.contexts,
      roots = options.roots,
      data = options.data;

  for (var i=0, l=contexts.length; i<l; i++) {
    ret.push( Ember.Handlebars.get(roots[i], contexts[i], { data: data }) );
  }

  return ret;
};

})();



(function() {
/*jshint newcap:false*/
/**
@module ember
@submodule ember-handlebars
*/

var set = Ember.set, get = Ember.get;
var Metamorph = requireModule('metamorph');

// DOMManager should just abstract dom manipulation between jquery and metamorph
var DOMManager = {
  remove: function(view) {
    view.morph.remove();
  },

  prepend: function(view, html) {
    view.morph.prepend(html);
  },

  after: function(view, html) {
    view.morph.after(html);
  },

  html: function(view, html) {
    view.morph.html(html);
  },

  // This is messed up.
  replace: function(view) {
    var morph = view.morph;

    view.transitionTo('preRender');

    Ember.run.schedule('render', this, function() {
      if (view.isDestroying) { return; }

      view.clearRenderedChildren();
      var buffer = view.renderToBuffer();

      view.invokeRecursively(function(view) {
        view.propertyDidChange('element');
      });

      view.triggerRecursively('willInsertElement');
      morph.replaceWith(buffer.string());
      view.transitionTo('inDOM');
      view.triggerRecursively('didInsertElement');
    });
  },

  empty: function(view) {
    view.morph.html("");
  }
};

// The `morph` and `outerHTML` properties are internal only
// and not observable.

/**
  @class _Metamorph
  @namespace Ember
  @extends Ember.Mixin
  @private
*/
Ember._Metamorph = Ember.Mixin.create({
  isVirtual: true,
  tagName: '',

  instrumentName: 'render.metamorph',

  init: function() {
    this._super();
    this.morph = Metamorph();
  },

  beforeRender: function(buffer) {
    buffer.push(this.morph.startTag());
    buffer.pushOpeningTag();
  },

  afterRender: function(buffer) {
    buffer.pushClosingTag();
    buffer.push(this.morph.endTag());
  },

  createElement: function() {
    var buffer = this.renderToBuffer();
    this.outerHTML = buffer.string();
    this.clearBuffer();
  },

  domManager: DOMManager
});

/**
  @class _MetamorphView
  @namespace Ember
  @extends Ember.View
  @uses Ember._Metamorph
  @private
*/
Ember._MetamorphView = Ember.View.extend(Ember._Metamorph);

/**
  @class _SimpleMetamorphView
  @namespace Ember
  @extends Ember.View
  @uses Ember._Metamorph
  @private
*/
Ember._SimpleMetamorphView = Ember.CoreView.extend(Ember._Metamorph);


})();



(function() {
/*globals Handlebars */
/*jshint newcap:false*/
/**
@module ember
@submodule ember-handlebars
*/

var get = Ember.get, set = Ember.set, handlebarsGet = Ember.Handlebars.get;
var Metamorph = requireModule('metamorph');
function SimpleHandlebarsView(path, pathRoot, isEscaped, templateData) {
  this.path = path;
  this.pathRoot = pathRoot;
  this.isEscaped = isEscaped;
  this.templateData = templateData;

  this.morph = Metamorph();
  this.state = 'preRender';
  this.updateId = null;
}

Ember._SimpleHandlebarsView = SimpleHandlebarsView;

SimpleHandlebarsView.prototype = {
  isVirtual: true,
  isView: true,

  destroy: function () {
    if (this.updateId) {
      Ember.run.cancel(this.updateId);
      this.updateId = null;
    }
    this.morph = null;
  },

  propertyDidChange: Ember.K,

  normalizedValue: function() {
    var path = this.path,
        pathRoot = this.pathRoot,
        result, templateData;

    // Use the pathRoot as the result if no path is provided. This
    // happens if the path is `this`, which gets normalized into
    // a `pathRoot` of the current Handlebars context and a path
    // of `''`.
    if (path === '') {
      result = pathRoot;
    } else {
      templateData = this.templateData;
      result = handlebarsGet(pathRoot, path, { data: templateData });
    }

    return result;
  },

  renderToBuffer: function(buffer) {
    var string = '';

    string += this.morph.startTag();
    string += this.render();
    string += this.morph.endTag();

    buffer.push(string);
  },

  render: function() {
    // If not invoked via a triple-mustache ({{{foo}}}), escape
    // the content of the template.
    var escape = this.isEscaped;
    var result = this.normalizedValue();

    if (result === null || result === undefined) {
      result = "";
    } else if (!(result instanceof Handlebars.SafeString)) {
      result = String(result);
    }

    if (escape) { result = Handlebars.Utils.escapeExpression(result); }
    return result;
  },

  rerender: function() {
    switch(this.state) {
      case 'preRender':
      case 'destroyed':
        break;
      case 'inBuffer':
        throw new Ember.Error("Something you did tried to replace an {{expression}} before it was inserted into the DOM.");
      case 'hasElement':
      case 'inDOM':
        this.updateId = Ember.run.scheduleOnce('render', this, 'update');
        break;
    }

    return this;
  },

  update: function () {
    this.updateId = null;
    this.morph.html(this.render());
  },

  transitionTo: function(state) {
    this.state = state;
  }
};

var states = Ember.View.cloneStates(Ember.View.states), merge = Ember.merge;

merge(states._default, {
  rerenderIfNeeded: Ember.K
});

merge(states.inDOM, {
  rerenderIfNeeded: function(view) {
    if (get(view, 'normalizedValue') !== view._lastNormalizedValue) {
      view.rerender();
    }
  }
});

/**
  `Ember._HandlebarsBoundView` is a private view created by the Handlebars
  `{{bind}}` helpers that is used to keep track of bound properties.

  Every time a property is bound using a `{{mustache}}`, an anonymous subclass
  of `Ember._HandlebarsBoundView` is created with the appropriate sub-template
  and context set up. When the associated property changes, just the template
  for this view will re-render.

  @class _HandlebarsBoundView
  @namespace Ember
  @extends Ember._MetamorphView
  @private
*/
Ember._HandlebarsBoundView = Ember._MetamorphView.extend({
  instrumentName: 'render.boundHandlebars',
  states: states,

  /**
    The function used to determine if the `displayTemplate` or
    `inverseTemplate` should be rendered. This should be a function that takes
    a value and returns a Boolean.

    @property shouldDisplayFunc
    @type Function
    @default null
  */
  shouldDisplayFunc: null,

  /**
    Whether the template rendered by this view gets passed the context object
    of its parent template, or gets passed the value of retrieving `path`
    from the `pathRoot`.

    For example, this is true when using the `{{#if}}` helper, because the
    template inside the helper should look up properties relative to the same
    object as outside the block. This would be `false` when used with `{{#with
    foo}}` because the template should receive the object found by evaluating
    `foo`.

    @property preserveContext
    @type Boolean
    @default false
  */
  preserveContext: false,

  /**
    If `preserveContext` is true, this is the object that will be used
    to render the template.

    @property previousContext
    @type Object
  */
  previousContext: null,

  /**
    The template to render when `shouldDisplayFunc` evaluates to `true`.

    @property displayTemplate
    @type Function
    @default null
  */
  displayTemplate: null,

  /**
    The template to render when `shouldDisplayFunc` evaluates to `false`.

    @property inverseTemplate
    @type Function
    @default null
  */
  inverseTemplate: null,


  /**
    The path to look up on `pathRoot` that is passed to
    `shouldDisplayFunc` to determine which template to render.

    In addition, if `preserveContext` is `false,` the object at this path will
    be passed to the template when rendering.

    @property path
    @type String
    @default null
  */
  path: null,

  /**
    The object from which the `path` will be looked up. Sometimes this is the
    same as the `previousContext`, but in cases where this view has been
    generated for paths that start with a keyword such as `view` or
    `controller`, the path root will be that resolved object.

    @property pathRoot
    @type Object
  */
  pathRoot: null,

  normalizedValue: Ember.computed(function() {
    var path = get(this, 'path'),
        pathRoot  = get(this, 'pathRoot'),
        valueNormalizer = get(this, 'valueNormalizerFunc'),
        result, templateData;

    // Use the pathRoot as the result if no path is provided. This
    // happens if the path is `this`, which gets normalized into
    // a `pathRoot` of the current Handlebars context and a path
    // of `''`.
    if (path === '') {
      result = pathRoot;
    } else {
      templateData = get(this, 'templateData');
      result = handlebarsGet(pathRoot, path, { data: templateData });
    }

    return valueNormalizer ? valueNormalizer(result) : result;
  }).property('path', 'pathRoot', 'valueNormalizerFunc').volatile(),

  rerenderIfNeeded: function() {
    this.currentState.rerenderIfNeeded(this);
  },

  /**
    Determines which template to invoke, sets up the correct state based on
    that logic, then invokes the default `Ember.View` `render` implementation.

    This method will first look up the `path` key on `pathRoot`,
    then pass that value to the `shouldDisplayFunc` function. If that returns
    `true,` the `displayTemplate` function will be rendered to DOM. Otherwise,
    `inverseTemplate`, if specified, will be rendered.

    For example, if this `Ember._HandlebarsBoundView` represented the `{{#with
    foo}}` helper, it would look up the `foo` property of its context, and
    `shouldDisplayFunc` would always return true. The object found by looking
    up `foo` would be passed to `displayTemplate`.

    @method render
    @param {Ember.RenderBuffer} buffer
  */
  render: function(buffer) {
    // If not invoked via a triple-mustache ({{{foo}}}), escape
    // the content of the template.
    var escape = get(this, 'isEscaped');

    var shouldDisplay = get(this, 'shouldDisplayFunc'),
        preserveContext = get(this, 'preserveContext'),
        context = get(this, 'previousContext');

    var inverseTemplate = get(this, 'inverseTemplate'),
        displayTemplate = get(this, 'displayTemplate');

    var result = get(this, 'normalizedValue');
    this._lastNormalizedValue = result;

    // First, test the conditional to see if we should
    // render the template or not.
    if (shouldDisplay(result)) {
      set(this, 'template', displayTemplate);

      // If we are preserving the context (for example, if this
      // is an #if block, call the template with the same object.
      if (preserveContext) {
        set(this, '_context', context);
      } else {
      // Otherwise, determine if this is a block bind or not.
      // If so, pass the specified object to the template
        if (displayTemplate) {
          set(this, '_context', result);
        } else {
        // This is not a bind block, just push the result of the
        // expression to the render context and return.
          if (result === null || result === undefined) {
            result = "";
          } else if (!(result instanceof Handlebars.SafeString)) {
            result = String(result);
          }

          if (escape) { result = Handlebars.Utils.escapeExpression(result); }
          buffer.push(result);
          return;
        }
      }
    } else if (inverseTemplate) {
      set(this, 'template', inverseTemplate);

      if (preserveContext) {
        set(this, '_context', context);
      } else {
        set(this, '_context', result);
      }
    } else {
      set(this, 'template', function() { return ''; });
    }

    return this._super(buffer);
  }
});

})();



(function() {
/**
@module ember
@submodule ember-handlebars
*/

var get = Ember.get, set = Ember.set, fmt = Ember.String.fmt;
var handlebarsGet = Ember.Handlebars.get, normalizePath = Ember.Handlebars.normalizePath;
var forEach = Ember.ArrayPolyfills.forEach;

var EmberHandlebars = Ember.Handlebars, helpers = EmberHandlebars.helpers;

// Binds a property into the DOM. This will create a hook in DOM that the
// KVO system will look for and update if the property changes.
function bind(property, options, preserveContext, shouldDisplay, valueNormalizer, childProperties) {
  var data = options.data,
      fn = options.fn,
      inverse = options.inverse,
      view = data.view,
      currentContext = this,
      normalized, observer, i;

  normalized = normalizePath(currentContext, property, data);

  // Set up observers for observable objects
  if ('object' === typeof this) {
    if (data.insideGroup) {
      observer = function() {
        Ember.run.once(view, 'rerender');
      };

      var template, context, result = handlebarsGet(currentContext, property, options);

      result = valueNormalizer(result);

      context = preserveContext ? currentContext : result;
      if (shouldDisplay(result)) {
        template = fn;
      } else if (inverse) {
        template = inverse;
      }

      template(context, { data: options.data });
    } else {
      // Create the view that will wrap the output of this template/property
      // and add it to the nearest view's childViews array.
      // See the documentation of Ember._HandlebarsBoundView for more.
      var bindView = view.createChildView(Ember._HandlebarsBoundView, {
        preserveContext: preserveContext,
        shouldDisplayFunc: shouldDisplay,
        valueNormalizerFunc: valueNormalizer,
        displayTemplate: fn,
        inverseTemplate: inverse,
        path: property,
        pathRoot: currentContext,
        previousContext: currentContext,
        isEscaped: !options.hash.unescaped,
        templateData: options.data
      });

      view.appendChild(bindView);

      observer = function() {
        Ember.run.scheduleOnce('render', bindView, 'rerenderIfNeeded');
      };
    }

    // Observes the given property on the context and
    // tells the Ember._HandlebarsBoundView to re-render. If property
    // is an empty string, we are printing the current context
    // object ({{this}}) so updating it is not our responsibility.
    if (normalized.path !== '') {
      view.registerObserver(normalized.root, normalized.path, observer);
      if (childProperties) {
        for (i=0; i<childProperties.length; i++) {
          view.registerObserver(normalized.root, normalized.path+'.'+childProperties[i], observer);
        }
      }
    }
  } else {
    // The object is not observable, so just render it out and
    // be done with it.
    data.buffer.push(handlebarsGet(currentContext, property, options));
  }
}

function simpleBind(property, options) {
  var data = options.data,
      view = data.view,
      currentContext = this,
      normalized, observer;

  normalized = normalizePath(currentContext, property, data);

  // Set up observers for observable objects
  if ('object' === typeof this) {
    if (data.insideGroup) {
      observer = function() {
        Ember.run.once(view, 'rerender');
      };

      var result = handlebarsGet(currentContext, property, options);
      if (result === null || result === undefined) { result = ""; }
      data.buffer.push(result);
    } else {
      var bindView = new Ember._SimpleHandlebarsView(
        property, currentContext, !options.hash.unescaped, options.data
      );

      bindView._parentView = view;
      view.appendChild(bindView);

      observer = function() {
        Ember.run.scheduleOnce('render', bindView, 'rerender');
      };
    }

    // Observes the given property on the context and
    // tells the Ember._HandlebarsBoundView to re-render. If property
    // is an empty string, we are printing the current context
    // object ({{this}}) so updating it is not our responsibility.
    if (normalized.path !== '') {
      view.registerObserver(normalized.root, normalized.path, observer);
    }
  } else {
    // The object is not observable, so just render it out and
    // be done with it.
    data.buffer.push(handlebarsGet(currentContext, property, options));
  }
}

/**
  @private

  '_triageMustache' is used internally select between a binding and helper for
  the given context. Until this point, it would be hard to determine if the
  mustache is a property reference or a regular helper reference. This triage
  helper resolves that.

  This would not be typically invoked by directly.

  @method _triageMustache
  @for Ember.Handlebars.helpers
  @param {String} property Property/helperID to triage
  @param {Function} fn Context to provide for rendering
  @return {String} HTML string
*/
EmberHandlebars.registerHelper('_triageMustache', function(property, fn) {
  Ember.assert("You cannot pass more than one argument to the _triageMustache helper", arguments.length <= 2);
  if (helpers[property]) {
    return helpers[property].call(this, fn);
  }
  else {
    return helpers.bind.apply(this, arguments);
  }
});

/**
  @private

  `bind` can be used to display a value, then update that value if it
  changes. For example, if you wanted to print the `title` property of
  `content`:

  ```handlebars
  {{bind "content.title"}}
  ```

  This will return the `title` property as a string, then create a new observer
  at the specified path. If it changes, it will update the value in DOM. Note
  that if you need to support IE7 and IE8 you must modify the model objects
  properties using `Ember.get()` and `Ember.set()` for this to work as it
  relies on Ember's KVO system. For all other browsers this will be handled for
  you automatically.

  @method bind
  @for Ember.Handlebars.helpers
  @param {String} property Property to bind
  @param {Function} fn Context to provide for rendering
  @return {String} HTML string
*/
EmberHandlebars.registerHelper('bind', function(property, options) {
  Ember.assert("You cannot pass more than one argument to the bind helper", arguments.length <= 2);

  var context = (options.contexts && options.contexts[0]) || this;

  if (!options.fn) {
    return simpleBind.call(context, property, options);
  }

  return bind.call(context, property, options, false, function(result) {
    return !Ember.isNone(result);
  });
});

/**
  @private

  Use the `boundIf` helper to create a conditional that re-evaluates
  whenever the truthiness of the bound value changes.

  ```handlebars
  {{#boundIf "content.shouldDisplayTitle"}}
    {{content.title}}
  {{/boundIf}}
  ```

  @method boundIf
  @for Ember.Handlebars.helpers
  @param {String} property Property to bind
  @param {Function} fn Context to provide for rendering
  @return {String} HTML string
*/
EmberHandlebars.registerHelper('boundIf', function(property, fn) {
  var context = (fn.contexts && fn.contexts[0]) || this;
  var func = function(result) {
    var truthy = result && get(result, 'isTruthy');
    if (typeof truthy === 'boolean') { return truthy; }

    if (Ember.isArray(result)) {
      return get(result, 'length') !== 0;
    } else {
      return !!result;
    }
  };

  return bind.call(context, property, fn, true, func, func, ['isTruthy', 'length']);
});

/**
  @method with
  @for Ember.Handlebars.helpers
  @param {Function} context
  @param {Hash} options
  @return {String} HTML string
*/
EmberHandlebars.registerHelper('with', function(context, options) {
  if (arguments.length === 4) {
    var keywordName, path, rootPath, normalized;

    Ember.assert("If you pass more than one argument to the with helper, it must be in the form #with foo as bar", arguments[1] === "as");
    options = arguments[3];
    keywordName = arguments[2];
    path = arguments[0];

    Ember.assert("You must pass a block to the with helper", options.fn && options.fn !== Handlebars.VM.noop);

    if (Ember.isGlobalPath(path)) {
      Ember.bind(options.data.keywords, keywordName, path);
    } else {
      normalized = normalizePath(this, path, options.data);
      path = normalized.path;
      rootPath = normalized.root;

      // This is a workaround for the fact that you cannot bind separate objects
      // together. When we implement that functionality, we should use it here.
      var contextKey = Ember.$.expando + Ember.guidFor(rootPath);
      options.data.keywords[contextKey] = rootPath;

      // if the path is '' ("this"), just bind directly to the current context
      var contextPath = path ? contextKey + '.' + path : contextKey;
      Ember.bind(options.data.keywords, keywordName, contextPath);
    }

    return bind.call(this, path, options, true, function(result) {
      return !Ember.isNone(result);
    });
  } else {
    Ember.assert("You must pass exactly one argument to the with helper", arguments.length === 2);
    Ember.assert("You must pass a block to the with helper", options.fn && options.fn !== Handlebars.VM.noop);
    return helpers.bind.call(options.contexts[0], context, options);
  }
});


/**
  See `boundIf`

  @method if
  @for Ember.Handlebars.helpers
  @param {Function} context
  @param {Hash} options
  @return {String} HTML string
*/
EmberHandlebars.registerHelper('if', function(context, options) {
  Ember.assert("You must pass exactly one argument to the if helper", arguments.length === 2);
  Ember.assert("You must pass a block to the if helper", options.fn && options.fn !== Handlebars.VM.noop);

  return helpers.boundIf.call(options.contexts[0], context, options);
});

/**
  @method unless
  @for Ember.Handlebars.helpers
  @param {Function} context
  @param {Hash} options
  @return {String} HTML string
*/
EmberHandlebars.registerHelper('unless', function(context, options) {
  Ember.assert("You must pass exactly one argument to the unless helper", arguments.length === 2);
  Ember.assert("You must pass a block to the unless helper", options.fn && options.fn !== Handlebars.VM.noop);

  var fn = options.fn, inverse = options.inverse;

  options.fn = inverse;
  options.inverse = fn;

  return helpers.boundIf.call(options.contexts[0], context, options);
});

/**
  `bindAttr` allows you to create a binding between