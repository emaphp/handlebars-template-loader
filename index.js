var Handlebars = require('handlebars');

module.exports = function(content) {
    this.cacheable && this.cacheable();
    var callback = this.async();
    var fn = Handlebars.compile(content);
    callback(null, "module.exports = " + fn.source + ";");
}
