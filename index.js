var Handlebars = require('handlebars');
var HbsRuntime = require('./runtime');
var loaderUtils = require('loader-utils');
var path = require('path');

// Parsers
var attributeParser = require('./lib/attributeParser');
var macroParser = require('./lib/macroParser');

// Helpers
var _extend = function(obj, from) {
  for (var key in from) {
    if (!from.hasOwnProperty(key)) continue;
    obj[key] = from[key];
  }
  return obj;
};

// Extendable arguments
var macros = _extend({}, require('./lib/macros'));

module.exports = function(content) {
  if (this.cacheable) this.cacheable();
  var callback = this.async();

  // Default arguments
  var root,
      parseMacros = true,
      attributes = ['img:src'],
      parseDynamicRoutes = false,
      runtimePath = require.resolve('handlebars/runtime').replace(/\\/g, '/');

  // Parse arguments
  var query = this.query instanceof Object ? this.query : loaderUtils.parseQuery(this.query);

  if (typeof(query) === 'object') {
    if (query.attributes !== undefined) {
      attributes = Array.isArray(query.attributes) ? query.attributes : [];
    }

    root = query.root;

    if (query.parseMacros !== undefined) {
      parseMacros = !!query.parseMacros;
    }

    // Prepend a html comment with the filename in it
    if (query.prependFilenameComment) {
      var filenameRelative = path.relative(query.prependFilenameComment, this.resource);
      content = '\n<!-- ' + filenameRelative + '  -->\n' + content;
    }

    // Check if dynamic routes must be parsed
    if (query.parseDynamicRoutes !== undefined) {
      parseDynamicRoutes = !!query.parseDynamicRoutes;
    }

    if (query.runtimePath) {
      runtimePath = query.runtimePath;
    }
  }

  // Include additional macros
  if (this.options && this.options.macros instanceof Object) {
    _extend(macros, this.options.macros);
  }

  // Parser contexts
  var macrosContext, attributesContext;

  // Parse macros
  if (parseMacros) {
    macrosContext = macroParser(content, function (macro) {
      return macros[macro] !== undefined && typeof(macros[macro]) === 'function';
    }, 'MACRO');
    content = macrosContext.replaceMatches(content);
  }

  // Parse attributes
  attributesContext = attributeParser(content, function (tag, attr) {
    return attributes.indexOf(tag + ':' + attr) !== -1;
  }, 'ATTRIBUTE', root, parseDynamicRoutes);
  content = attributesContext.replaceMatches(content);

  // Compile template
  var source = Handlebars.precompile(content, query);

  // Resolve macros
  if (parseMacros) {
    source = macrosContext.resolveMacros(source, macros);
  }

  // Resolve attributes
  source = attributesContext.resolveAttributes(source);

  callback(null, 'var Handlebars = require(\'' + runtimePath + '\');\n' +
           'module.exports = (Handlebars[\'default\'] || Handlebars).template(' + source + ');');
};

module.exports.Handlebars = HbsRuntime;
