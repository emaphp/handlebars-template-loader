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
    require: function(resourcePath) {
        // Since Handlebars v4, an extra argument called "container" is passed to the helper wrapper.
        // In order to keep compatibility, we remove the first argument from the list if we detect that more than 4 arguments are available.
        // See issue #9 for details.
        return "require(" + JSON.stringify(loaderUtils.urlToRequest(resourcePath)) + ").apply(null, Array.prototype.slice.call(arguments, arguments.length > 4))";
    },

    include: function(resourcePath) {
        return "require(" + JSON.stringify(loaderUtils.urlToRequest(resourcePath)) + ")";
    },

    br: function(times) {
        var str = strRepeat('<br>', typeof(times) == 'undefined' ? 1 : parseInt(times));
        return "'" + str + "'";
    },

    nl: function() {
        var str = strRepeat('\\n', typeof(times) == 'undefined' ? 1 : parseInt(times));
        return "'" + str + "'";
    }
};