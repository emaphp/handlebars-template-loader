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
###License

Released under the MIT license.