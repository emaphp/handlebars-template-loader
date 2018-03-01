handlebars-template-loader
==========================

A Handlebars template loader for Webpack

### Changelog

<br>
 * 1.0: Loader now works with Webpack 4. Still a beta release.

<br/>
<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-generate-toc again -->

**Table of Contents**

- [Installation](#installation)
- [Usage](#usage)
- [Loading templates](#loading-templates)
- [Using helpers](#using-helpers)
- [Using partials](#using-partials)
- [Options](#options)
    - [Prepending filename comment](#prepending-filename-comment)
    - [Images](#images)
    - [Runtime path](#runtime-path)
    - [Compilation options](#compilation-options)
- [Macros](#macros)
    - [require](#require)
    - [include](#include)
    - [repeat](#repeat)
    - [Custom macros](#custom-macros)
    - [Disabling macros](#disabling-macros)
    - [Arguments](#arguments)
    - [Escaping](#escaping)
- [License](#license)

<!-- markdown-toc end -->

<br/>

# Installation #

<br/>

```bash
npm install handlebars-template-loader
```

<br/>

>Since version 0.5.4, this loaders does not include Handlebars in its dependency list. Make sure to install Handlebars before running webpack. Read https://github.com/npm/npm/issues/6565 for details.

<br/>

# Usage #

<br/>

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            { test: /\.hbs/, loader: "handlebars-template-loader" }
        ]
    },

    node: {
        fs: "empty" // avoids error messages
    }
};
```

<br/>

# Loading templates #

<br/>

```html
<!-- File: hello.hbs -->
<p>Hello&nbsp;{{name}}</p>
```

<br/>

```javascript
// File: app.js
var compiled = require('./hello.hbs');
return compiled({name: "world"});
```

<br/>

# Using helpers #

<br/>

```javascript
// File: helpers.js

// Get Handlebars instance
var Handlebars = require('handlebars-template-loader/runtime');

Handlebars.registerHelper('list', function(items, options) {
  var out = "<ul>";

  for(var i=0, l=items.length; i<l; i++) {
    out = out + "<li>" + options.fn(items[i]) + "</li>";
  }

  return out + "</ul>";
});

Handlebars.registerHelper('link', function(text, url) {
  text = Handlebars.Utils.escapeExpression(text);
  url  = Handlebars.Utils.escapeExpression(url);

  var result = '<a href="' + url + '">' + text + '</a>';

  return new Handlebars.SafeString(result);
});
```

<br/>

```javascript
// File: main.js

// Include template helpers
require("./helpers.js");
```

<br/>

# Using partials #

<br/>

```javascript
    // Get Handlebars instance
    var Handlebars = require('handlebars-template-loader/runtime');

    // Require partial
    var partial = require('path/to/my/_partial.hbs');

    // Register partial
    Handlebars.registerPartial('my_partial_name', partial);

```

<br/>

# Options #

<br/>

## Prepending filename comment ##

<br/>

When debugging a large single page app with the DevTools, it's often hard to find the template that contains a bug. With the following config a HTML comment is prepended to the template with the relative path in it (e.g. `<!-- view/user/edit.html -->`).

<br/>

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            {
                test: /\.hbs$/,
                loader: "handlebars-template-loader",
                query: {
                    prependFilenameComment: __dirname,
                }
            }
        ]
    }
};
```

<br/>

## Images ##

<br/>

In order to load images you must install either the `file-loader` or the `url-loader` package.

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            //...
            { test: /\.hbs/, loader: "handlebars-template-loader" },
            { test: /\.jpg/, loader: "file-loader" },
            { test: /\.png/, loader: "url-loader?mimetype=image/png" },
        ]
    }
};
```

<br/>

```html
<!-- Require image using file-loader -->
<img src="img/portrait.jpg">

<!-- Require image using url-loader -->
<img src="img/icon.png">
```

<br/>

Images with an absolute path are not translated unless a `root` option is defined

```html
<!-- Using root = undefined => no translation -->
<img src="/not_translated.jpg">

<!-- Using root = 'images' => require('images/image.jpg') -->
<img src="/image.jpg">
```

<br/>

In order to deactivate image processing define the `attributes` option as an empty array.

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            {
                test: /\.hbs$/,
                loader: "handlebars-template-loader",
                query: {
                    attributes: []
                }
            }
        ]
    }
};
```

<br/>

You could also add which attributes need to be processed in the form of pairs *tag:attribute*.

<br/>

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            {
                test: /\.hbs$/,
                loader: "handlebars-template-loader",
                query: {
                    attributes: ['img:src', 'x-img:src']
                }
            }
        ]
    }
};
```

Dynamic attributes won't be afected by this behaviour by default.

```html
<!-- Ignore "root" argument if attribute contains a template expression -->
<img src="/img/{{doge}}.png" class="doge-img">
```

In order to append the root directory you'll need to specify the `parseDynamicRoutes` argument.

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "handlebars-template-loader",
                query: {
                    root: "myapp",
                    parseDynamicRoutes: true
                }
            }
        ]
    }
};
```

```html
<!-- Attribute now translates to "myapp/img/{{doge}}.png" -->
<img src="/img/cat-<%- currentCat.url %>.png" class="doge-img">
```

<br/>

## Runtime path ##

If you have a custom location for your Handlebars runtime module then you can set that in your `query` object via the `runtimePath` property. This is the path to the Handlebars runtime that every `.hbs` file will require and use. By default this loader looks up the absolute path to the `handlebars/runtime` in your `node_modules` folder. Changing this property is useful if you are doing somethign non-standard with your Handlebar templates, for example setting an alias for the `handlebars/runtime` path.

<br/>

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "handlebars-template-loader",
                query: {
                    runtimePath: 'handlebars/runtime'
                }
            }
        ]
    }
};
```

<br />

## Compilation options ##

<br/>

Handlebars does support [additional compilation options](http://handlebarsjs.com/reference.html) that you can specify in your `query` object literal.

<br/>

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "handlebars-template-loader",
                query: {
                    root: "myapp",
                    strict: true,
                    noEscape: true
                }
            }
        ]
    }
};
```

<br/>

# Macros #

<br/>
Macros allow additional features like including templates or inserting custom text in a compiled templates.

<br/>

## require ##

<br/>

The `require` macro expects a path to a handlebars template. The macro is then translated to a webpack require expression that evaluates the template using the same arguments.

<br/>

```html
<h4>Profile</h4>

Name: <strong>{{name}}</strong>
<br/>
Surname: <strong>{{surname}}</strong>
<div class="profile-details">
    @require('profile-details.hbs')
</div>
```

<br/>

## include ##

<br/>

While the `require` macro expects a resource that returns a function, the `include` macro can be used for resources that return plain text. For example, we can include text loaded through the `html-loader` directly in our template.

```html
<div class="wiki">
    <h3>Introduction</h3>
    @include('intro.htm')
    <h3>Authors</h3>
    @include('authors.htm')
</div>
```

<br/>

## repeat ##

<br/>

The `repeat` macro will repeat the given string the amount of times as specified by the second argument (default to 1). It will only accept string literals.

```html
<p>Lorem ipsum</p>
@repeat('<br/>', 3)
<p>Sit amet</p>
@repeat('\n')
```

<br/>

## Custom macros ##

<br/>

We can include additional macros by defining them in the webpack configuration file. Remember that the value returned by a macro is inserted as plain javascript, so in order to insert a custom text we need to use nested quotes. For example, let's say that we want a macro that includes a copyright string in our template.

<br/>

```javascript
// File: webpack.config.js
module.exports = {
    // ...

    module: {
        loaders: {
            // ...
            { test: /\.hbs/, loader: "handlebars-template-loader" },
        }
    },

    macros: {
        copyright: function () {
            return "'<p>Copyright FakeCorp 2014 - 2015</p>'";
        }
    }
}
```

<br/>

We then invoke our macro from within the template as usual.

<br/>

```html
<footer>
    @copyright()
</footer>
```

<br/>

## Disabling macros ##

<br/>

You can disable macros if you are a bit unsure about their usage or just simply want faster processing. This is achieved by setting the `parseMacros` options to false.

<br/>

```javascript
module.exports = {
    // ...

    module: {
        loaders: {
            // ...
            {
                test: /\.hbs/,
                loader: "handlebars-template-loader",
                query: {
                    parseMacros: false
                }
            },
        }
    }
}
```

<br/>

## Arguments ##

<br/>

Macros can accept an arbitrary number of arguments. Only boolean, strings and numeric types are supported.

<br/>

```javascript
// File: webpack.config.js
module.exports = {
    // ...

    module: {
        loaders: {
            // ...
            { test: /\.html$/, loader: "handlebars-template-loader" },
        }
    },

    macros: {
        header: function (size, content) {
            return "'<h" + size + ">" + content + "</h" + size + ">'";
        }
    }
}
```

<br/>

```html
@header(1, 'Welcome')
<p>Lorem ipsum</p>
@header(3, 'Contents')
<p>Sit amet</p>
```

<br/>

## Escaping ##

<br/>

Macro expressions can be escaped with the `\` character.

```html
@repeat('<br/>', 3)
\@escaped()
@custom_macro()
```

Translates to

```html
<br/><br/><br/>
@escaped()
custom string
```

<br/>

# License #

Released under the MIT license.
