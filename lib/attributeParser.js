var path = require('path');
var url = require('url');
var Parser = require("fastparse");
var loaderUtils = require('loader-utils');

/**
 * HELPERS
 */

// Reminder: path.isAbsolute is not available in Node 0.10.x
var pathIsAbsolute = function (attrValue) {
  return path.resolve(attrValue) == path.normalize(attrValue);
};

// Detects is a given resource string includes a custom loader
var hasCustomLoader = function (resourcePath) {
	var resource = resourcePath.split('!\.');
	if (resource.length > 1)
	  return resource;
	return false;
};

// Checks whether a string contains a template expression
var isTemplate = function (expression) {
	return /\{\{.*\}\}/.test(expression);
};

/**
 * ATTRIBUTECONTEXT CLASS
 */
var AttributeContext = function(isRelevantTagAttr, usid, root, parseDynamicRoutes) {
  this.matches = [];
  this.isRelevantTagAttr = isRelevantTagAttr;
  this.usid = usid;
  this.data = {};
  this.root = root;
  this.parseDynamicRoutes = parseDynamicRoutes;

  // The ident method builds a unique string expression
  // that replaces an attribute value.
  // This value is replaced again for the expected expression
  // once the template has been transformed to a function
  this.ident = function() {
    return "____" + usid + Math.random() + "____";
  };
};

// The replaceMatches method does an initial parse
// that replaces attribute values with a unique expression
AttributeContext.prototype.replaceMatches = function(content) {
  var self = this;
  content = [content];
  this.matches.reverse();

  this.matches.forEach(function(match) {
    // Determine if the attribute contains a template expresssion
    if (match.containsTemplate) {
      // Check if path should be modified to include the "root" option
      if (pathIsAbsolute(match.value) && self.root !== undefined) {
        var x = content.pop();
        content.push(x.substr(match.start + match.length));
        content.push(self.parseDynamicRoutes ? loaderUtils.urlToRequest(match.value, self.root) : match.value);
        content.push(x.substr(0, match.start));
      }
    } else {
      // Ignore if path is absolute and no root path has been defined
      if (pathIsAbsolute(match.value) && self.root === undefined) {
        return;
      }

      // Ignore if is a URL
      if (!loaderUtils.isUrlRequest(match.value, self.root)) {
        return;
      }

      var uri = url.parse(match.value);
      if (uri.hash !== null && uri.hash !== undefined) {
        uri.hash = null;
        match.value = uri.format();
        match.length = match.value.length;
      }

      do {
        var ident = self.ident();
      } while (self.data[ident]);

      self.data[ident] = match;

      var x = content.pop();
      content.push(x.substr(match.start + match.length));
      content.push(ident);
      content.push(x.substr(0, match.start));
    }
  });

  content.reverse();
  return content.join('');
};

// Replaces the expressions inserted by replaceMatches with the corresponding requires
AttributeContext.prototype.resolveAttributes = function(content) {
  var regex = new RegExp('____' + this.usid + '[0-9\\.]+____', 'g');
  var self = this;
  return content.replace(regex, function(match) {
    if (!self.data[match]) {
      return match;
    }

    var url = self.data[match].value;
    // Make resource available through file-loader
    var fallbackLoader = require.resolve('../file-loader.js') + '?url=' + encodeURIComponent(url);
    return "\" + require(" + JSON.stringify(fallbackLoader + '!' + loaderUtils.urlToRequest(url, self.root)) + ") + \"";
  });
};

/**
 * PARSER
 */

// Process a tag attribute
var processMatch = function(match, strUntilValue, name, value, index) {
  var self = this;
  var containsTemplate = false;

  // Check if attribute is included in the "attributes" option
  if (!this.isRelevantTagAttr(this.currentTag, name)) {
    return;
  }

  this.matches.push({
    start: index + strUntilValue.length,
    length: value.length,
    value: value,
    containsTemplate: isTemplate(value)
  });
};

// Parser configuration
var specs = {
  outside: {
    "<!--.*?-->": true,
    "<![CDATA[.*?]]>": true,
    "<[!\\?].*?>": true,
    "<\/[^>]+>": true,
    "<([a-zA-Z\\-:]+)\\s*": function(match, tagName) {
      this.currentTag = tagName;
      return 'inside';
    }
  },

  inside: {
    "\\s+": true, // Eat up whitespace
    ">": 'outside', // End of attributes
    "(([a-zA-Z\\-]+)\\s*=\\s*\")([^\"]*)\"": processMatch,
    "(([a-zA-Z\\-]+)\\s*=\\s*\')([^\']*)\'": processMatch,
    "(([a-zA-Z\\-]+)\\s*=\\s*)([^\\s>]+)": processMatch
  }
};

var parser = new Parser(specs);

module.exports = function parse(html, isRelevantTagAttr, usid, root) {
  var context = new AttributeContext(isRelevantTagAttr, usid, root);
  return parser.parse('outside', html, context);
};
