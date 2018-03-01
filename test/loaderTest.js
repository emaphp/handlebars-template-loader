var fs = require('fs');
var path = require('path');
var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-string'));

var loader = require('../');
var WebpackLoaderMock = require('./lib/WebpackLoaderMock');
var loadTemplate = require('./lib/loadTemplate');
var loadOutput = require('./lib/loadOutput');
var removeFirstline = require('./lib/removeFirstline');

function testTemplate(loader, template, options, testFn) {
  loader.call(new WebpackLoaderMock({
    query: options.query,
    resource: path.join(__dirname, 'templates', template),
    options: options.options,
    async: function(err, source) {
      testFn(source);
    }
  }), loadTemplate(template));
}

describe('loader', function() {
  it('should load simple handlebars template', function(done) {
    testTemplate(loader, 'simple.html', {}, function(output) {
      // Copy and paste the result of `console.log(output)` to templates/output/simple.txt
      assert.equal(removeFirstline(output), loadOutput('simple.txt').trimRight());
      done();
    });
  });

  it('should prepend html comment', function(done) {
    testTemplate(loader, 'simple.html', {
      query: {
        prependFilenameComment: __dirname
      }
    }, function(output) {
      assert.equal(removeFirstline(output), loadOutput('simple-with-comment.txt').trimRight());
      done();
    });
  });

  it('should be possible to require a template', function(done) {
    testTemplate(loader, 'require.html', {}, function(output) {
      assert.equal(removeFirstline(output), loadOutput('require.txt').trimRight());
      done();
    });
  });

  it('should be possible to include a template', function(done) {
    testTemplate(loader, 'include.html', {}, function(output) {
      assert.equal(removeFirstline(output), loadOutput('include.txt').trimRight());
      done();
    });
  });

  it('should require an image', function(done) {
    testTemplate(loader, 'image.html', {}, function(output) {
      assert.equal(removeFirstline(output), loadOutput('image.txt').trimRight());
      done();
    });
  });

  it('should require given custom attributes', function(done) {
    testTemplate(loader, 'custom-attributes.html', {
      query: {
        attributes: ['img:src', 'link:href']
      }
    }, function(output) {
      assert.equal(removeFirstline(output), loadOutput('custom-attributes.txt').trimRight());
      done();
    });
  });

  it('should not parse an absolute image without root option given', function(done) {
    testTemplate(loader, 'absolute-image.html', {}, function(output) {
      assert.equal(removeFirstline(output), loadOutput('absolute-image.txt').trimRight());
      done();
    });
  });

  it('should parse an absolute image if root option is given', function(done) {
    testTemplate(loader, 'absolute-image.html', {
      query: {
        root: '/bar'
      }
    }, function(output) {
      assert.equal(removeFirstline(output), loadOutput('absolute-image-with-root.txt').trimRight());
      done();
    });
  });

  it('should leave dynamic attribute unaltered', function(done) {
    testTemplate(loader, 'dynamic-attribute.html', {
      query: {}
    }, function(output) {
      assert.equal(removeFirstline(output), loadOutput('dynamic-attribute.txt').trimRight());
      done();
    });
  });

  it('should ignore root option if parseDynamicRoutes is not specified', function(done) {
    testTemplate(loader, 'dynamic-attribute-with-root.html', {
      query: {
        root: '/bar'
      }
    }, function(output) {
      assert.equal(removeFirstline(output), loadOutput('dynamic-attribute-with-root.txt').trimRight());
      done();
    });
  });

  it('should modify dynamic routes', function(done) {
    testTemplate(loader, 'dynamic-attribute-with-parseDynamicRoutes.html', {
      query: {
        root: '/bar',
        parseDynamicRoutes: true
      }
    }, function(output) {
      assert.equal(removeFirstline(output), loadOutput('dynamic-attribute-with-parseDynamicRoutes.txt').trimRight());
      done();
    });
  });

  it('should support compilation options', function(done) {
    // srcName makes the loader return a {code, map} object literal
    testTemplate(loader, 'compilation-options.html', {
      query: {
        srcName: 'foo.js'
      }
    }, function(output) {
      assert.equal(removeFirstline(output), loadOutput('compilation-options.txt').trimRight());
      done();
    });
  });
});
