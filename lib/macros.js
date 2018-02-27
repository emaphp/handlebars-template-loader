var loaderUtils = require('loader-utils');

var strRepeat = function(str, times) {
  var result = '';

  for (var i = 0; i < times; i++) {
    result += str;
  }

  return result;
};

// Default macros
module.exports = {
  // Includes a child template using the same context
  require: function(resourcePath) {
    // Since Handlebars v4, an extra argument called "container" is passed to the helper wrapper.
    // In order to keep compatibility, we remove the first argument from the list if we detect that more than 6 arguments are available.
    // See issue #9 for details.
    return "require(" + JSON.stringify(loaderUtils.urlToRequest(resourcePath)) + ").apply(null, Array.prototype.slice.call(arguments, arguments.length > 6))";
  },

  // Includes the contents of a given resource
  include: function(resourcePath) {
    return "require(" + JSON.stringify(loaderUtils.urlToRequest(resourcePath)) + ")";
  },

  repeat: function(str, times) {
    var text = strRepeat(str || '', typeof(times) == 'undefined' ? 1 : parseInt(times));
    return "'" + text + "'";
  }
};
