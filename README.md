# grunt-html-compiler

> Grunt task to compile an HTML document.

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-html-compiler --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-html-compiler');
```

## The "htmlcompiler" task

### Overview
In your project's Gruntfile, add a section named `htmlcompiler` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  htmlcompiler: {
    options: {
      // global options
    },
    a: {
      options: {
        // task specific options
      },
      dest: 'a.html'
    },
    b: {
      options: {
        // task specific options
      },
      dest: 'b.html'
    }
  }
});
```

### Options

#### options.doctype
Type: `String`  
Default value: `html`

A string value that is used as the [DOCTYPE](https://developer.mozilla.org/en-US/docs/Web/API/document.doctype).

#### options.encoding
Type: `String`  
Default value: `UTF-8`

A string value that is used in the META tag [`charset` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta#attr-charset).

#### options.vendors
Type: `String|Array|Object`  
Default value: `null`

A file reference to all vendor assets that will be added before any other scripts or stylesheets in the `HEAD` tag.

#### options.stylesheets
Type: `String|Array|Object`  
Default value: `null`

A file reference to all stylesheet assets that will be added in the `HEAD` tag.

#### options.scripts
Type: `String|Array|Object`  
Default value: `null`

A file reference to all script assets that will be appended before the end of the `BODY` tag.

#### options.title
Type: `String`  
Default value: `null`

The title of the document.

#### options.body
Type: `String`  
Default value: ''

The content of the `BODY` tag.

#### options.meta
Type: `Array`  
Default value: `[]`

A list of metadata information.

```js
grunt.initConfig({
  htmlcompiler: {
    index: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, user-scalable=no'
        },
        {
          httpEquiv: 'refresh',
          content: '30'
        },
        {
          charset: 'UTF-8'
        }
      ],
      dest: 'index.html'
    }
  }
});
```

#### options.root
Type: `String`  
Default value: `.`

The root scope of all paths. Any external assets that are included will be converted to relative URL's based on this value.

### Usage Examples

#### Default Options
In this example, an `index.html` file will be created with a basic structure.

```js
grunt.initConfig({
  htmlcompiler: {
    'index.html': {}
  }
});
```

```html
<!doctype html>
<html>
  <head>
    <title></title>
    <meta charset="UTF-8"/>
  </head>
  <body>
  </body>
</html>
```

It is also possible to generate multiple files based on shared options.  
In this example two HTML file will be created, sharing the same title but with different body content.

```js
grunt.initConfig({
  htmlcompiler: {
    options: {
      title: 'Shared title'
    },
    foo: {
      options: {
        body: 'My foo'
      },
      dest: 'foo.html'
    },
    bar: {
      options: {
        body: 'My bar'
      },
      dest: 'bar.html'
    }
  }
});
```

#### Custom Options
In this example, an `index.html` file will be created with relative assets from the project.

```js
grunt.initConfig({
  htmlcompiler: {
    options: {
      doctype: 'html',
      encoding: 'UTF-8'
    },
    index: {
      options: {
        vendors: 'vendor/**',
        scripts: 'scripts/**/*.js',
        stylesheets: 'stylesheets/**/*.css',
        title: 'HTML Compiler Page',
        body: 'Hello world',
        root: '.'
      },
      dest: 'index.html'
    }
  }
});
```

```html
<!doctype html>
<html>
  <head>
    <title>HTML Compiler Page</title>
    <meta charset="UTF-8"/>
    <link rel="stylesheet" href="vendor/jquery.css"/>
    <script src="vendor/jquery.js"></script>
    <link rel="stylesheet" href="stylesheets/reset.css"/>
    <link rel="stylesheet" href="stylesheets/style.css"/>
  </head>
  <body>
    Hello world
    <script src="scripts/script.js"></script>
  </body>
</html>
```

#### Adding inline style elements
The `stylesheet` option can accept an object as one of it's items when it's an array.
If the object has a `content` property a `style` element will be created with the value as it's inner HTML , instead of a `link` element.

```js
grunt.initConfig({
  htmlcompiler: {
    index: {
      options: {
        stylesheets: [
          {
            content: 'html, body { height: 100%; }'
          }
        ]
      },
      dest: 'index.html'
    }
  }
});
```

```html
<!doctype html>
<html>
  <head>
    <style>html, body { height: 100%; }</style>
  </head>
  <body></body>
</html>
```

#### Adding attributes to elements
Attributes can be added by assigning the resource as an object and creating a `attrs` property. The resource path is defined with a `src` property.
The `attrs`property is a key/value object.

```js
grunt.initConfig({
  htmlcompiler: {
    index: {
      options: {
        stylesheets: [
          'style.css',
          {
            attrs: {
              media: 'print'
            },
            src: 'print.css'
          }
        ],
        body: {
          attrs: {
            dir: 'ltr'
          },
          content: 'Hello world'
        }
      },
      dest: 'index.html'
    }
  }
});
```

```html
<!doctype html>
<html>
  <head>
    <link rel="stylesheet" href="style.css"/>
    <link rel="stylesheet" href="print.css" media="print"/>
  </head>
  <body dir="ltr">Hello world</body>
</html>
```

## Release History

  * 2014-06-24 v0.2.2 Fixed typo.
  * 2014-06-24 v0.2.1 Added advance element specification options.
  * 2014-06-18 v0.2.0 Added advance file specification options.
  * 2014-05-16 v0.1.9 Fixed bug when vendor/scripts/stylesheets options are not defined.
  * 2014-05-12 v0.1.8 Removed extra quotation from meta element.
  * 2014-05-02 v0.1.7 Fixed issues with version 0.1.6.
  * 2014-05-02 v0.1.6 Fixed issues with version 0.1.5.
  * 2014-05-02 v0.1.5 Added support for META tags.
  * 2014-05-01 v0.1.4 Added auto creation of target paths if they don't exist and new colours for the logs.
  * 2014-05-01 v0.1.3 Added support for external URLs.
  * 2014-05-01 v0.1.2 Added task logs, changed default doctype and added versions to the release history.
  * 2014-05-01 v0.1.1 Removed empty lines from output.
  * 2014-04-30 v0.1.0 Initial release.
