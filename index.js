var Handlebars = require('handlebars');

module.exports = function(content) {
    this.cacheable && this.cacheable();
    var callback = this.async();
    var fn = Handlebars.precompile(content);
    callback(null, "var Handlebars = require('handlebars');\n" +
    "module.exports = (Handlebars[\"default\"] || Handlebars).template(" + fn + ");");
};

module.exports.Handlebars = Handlebars;