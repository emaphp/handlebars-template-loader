handlebars-template-loader
==========================

A Handlebars template loader for Webpack

<br/>
###Usage

<br/>
**Installation**
```bash
$ npm install handlebars-template-loader
```

<br/>
**Add loader**
```javascript
module.exports = {
    //...
    loaders: [
        //...
        { test: /\.hbs/, loader: "handlebars-template-loader" }
    ]
    //...
    node: {
        fs: "empty" //avoids error messages
    }
};
```

<br/>
**Loading templates**

```html
<!-- file: hello.hbs -->
<p>Hello&nbsp;{{name}}</p>
```

```javascript
//file: app.js
var compiled = require('./hello.hbs');
return compiled({name: "world"});
```

<br/>
**Include tag**


```html
<!-- file: main.hbs -->
<p>Hello, <!--include message.hbs--></p>
```


```html
<!-- file: message.hbs -->
<em>how are you?</em>
```


<br/>
**Adding helpers**

```javascript
//file: helpers.js

//get handlebars instance
var Handlebars = require('handlebars-template-loader').Handlebars;

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

```javascript
//file: main.js

//include app helpers
require("./helpers.js");
```

<br/>
###License

Released under the MIT license.