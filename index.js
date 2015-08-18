var Handlebars = require('handlebars');
var path = require('path');

module.exports = function() {
    var loaderUtils = require('loader-utils');

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
    var attributes = ['img:src'];
    var macros = _extend({}, require('./lib/macros'));

    return function(content) {
        this.cacheable && this.cacheable();
        var callback = this.async();

        // Default arguments
        var root,
            parseMacros = true,
            attributes = ['img:src'];

        // Parse arguments
        var query = loaderUtils.parseQuery(this.query);

        if (typeof(query) == 'object') {
            if (query.attributes !== undefined) {
                attributes = Array.isArray(query.attributes) ? query.attributes : [];
            }

            root = query.root;

            if (query.parseMacros !== undefined) {
                parseMacros = !!query.parseMacros;
            }

            // Prepend a html comment with the filename in it
            if (query.prependFilenameComment) {
                var filename = loaderUtils.getRemainingRequest(this);
                var filenameRelative = path.relative(query.prependFilenameComment, filename);

                content = "\n<!-- " + filenameRelative + "  -->\n" + content;
            }
        }

        // Include additional macros
        if (typeof(this.options.macros) == 'object') {
            _extend(macros, this.options.macros);
        }

        // Parse macros
        if (parseMacros) {
            var macrosContext = macroParser(content, function(macro) {
                return macros[macro] !== undefined && typeof(macros[macro]) == 'function';
            }, 'MACRO');
            content = macrosContext.replaceMatches(content);
        }

        // Parse attributes
        var attributesContext = attributeParser(content, function(tag, attr) {
            return attributes.indexOf(tag + ':' + attr) != -1;
        }, 'ATTRIBUTE', root);
        content = attributesContext.replaceMatches(content);

        // Compile template
        var source = Handlebars.precompile(content);

        // Resolve macros
        if (parseMacros) {
            source = macrosContext.resolveMacros(source, macros);
        }

        // Resolve attributes
        source = attributesContext.resolveAttributes(source);

        callback(null, "var Handlebars = require('" + require.resolve('handlebars') + "');\n" +
            "module.exports = (Handlebars[\"default\"] || Handlebars).template(" + source + ");");
    };
}();

module.exports.Handlebars = Handlebars;