/*
 * grunt-html-compiler
 * https://github.com/barmatz/grunt-html-compiler
 *
 * Copyright (c) 2014 Or Barmatz
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs'),
path = require('path'),
chalk = require('chalk'),
Attrs = require('./Attrs');

module.exports = function(grunt) {
    function isExternalAsset(asset) {
        return /^\w+:\/\//.test(asset);   
    }

    function getAssets(assets, filepath, root, factory) {
        var returnVal = [],
        expandMapping = grunt.file.expandMapping;

        function addToReturnVal(asset, attrs) {
            if (isExternalAsset(asset)) {
                returnVal.push(factory(asset, attrs));
            } else {
                returnVal = returnVal.concat(expandMapping(asset).map(function (file) {
                    return factory(path.relative(filepath, fs.realpathSync(root + '/' + file.src)), attrs);
                }));
            }
        }

        switch (typeof assets) {
            case 'string':
                addToReturnVal(assets);
                break;
            case 'object':
                if (assets instanceof Array) {
                    addToReturnVal(assets.filter(function (asset) {
                        if (typeof asset === 'object') {
                            if ('src' in asset) {
                                addToReturnVal(asset.src, asset.attrs);
                            } else if ('content' in asset) {
                                returnVal.push(factory(null, asset.attrs, asset.content));
                            }

                            return false;
                        }

                        return true;
                    }));
                }
                break;
        }

        return returnVal;
    }

    function getElement(template, options) {
        return grunt.template.process(template, {data: options});
    }

    function getScriptsElement(src /*, attrs, content*/) {
        var attrs = arguments[1],
        content = arguments[2];

        if (attrs) {
            attrs = new Attrs(attrs);
        }

        grunt.log.writeln(grunt.template.process('Linking script <%= filename %><%= attrs %>', {data: { filename: chalk.cyan(src), attrs: attrs ? ' attributes(' + attrs.toString() + ')' : '' }}));
        return getElement('<script<%= src %><%= attrs %>><%= content %></script>', {content: content || '', src: content ? '' : ' src="' + src + '"', attrs: attrs ? ' ' + attrs.toHtml() : ''});
    }

    function getStylesheetElement(href /*, attrs, content*/) {
        var attrs = arguments[1],
        content = arguments[2];

        if (attrs) {
            attrs = new Attrs(attrs);
        }

        if (content) {
            grunt.log.writeln(grunt.template.process('Created style element<%= attrs %>\n\t<%= content%>', {data: {content: chalk.magenta(content), attrs: attrs ? ' with ' + attrs.toString() : '' }}));
        
            return getElement('<style<%= attrs %>><%= content %></style>', {content: content, attrs: attrs ? ' ' + attrs.toHtml() : ''});
        }

        grunt.log.writeln(grunt.template.process('Linking stylesheet <%= filename %><%= attrs %>', {data: { filename: chalk.cyan(href), attrs: attrs ? chalk.gray('\n\tattributes(' + attrs.toString() + ')') : '' }}));

        return getElement('<link rel="stylesheet" href="<%= href %>"<%= attrs %>/>', {href: href, attrs: attrs ? ' ' + attrs.toHtml() : ''});
    }

    function getMetaElement(data) {
        if ('name' in data) {
            return getElement('<meta name="<%= name %>" content="<%= content %>"/>', data);
        } else if ('httpEquiv' in data) {
            return getElement('<meta http-equiv="<%= httpEquiv %>" content="<%= content %>"/>', data);
        } else if ('charset' in data) {
            return getElement('<meta charset="<%= charset %>"/>', data);
        }

        return '';
    }

    function createFile(filename, options) {
        var pathPattern = /^(.*)\/.*$/,
        hasPath = pathPattern.test(filename),
        filepath = hasPath ? filename.replace(pathPattern, '$1') : '.';

        if (filepath && !grunt.file.exists(filepath)) {
            grunt.file.mkdir(filepath);
            grunt.log.writeln(grunt.template.process('Create path <%= filepath %>', {data: { filepath: chalk.cyan(filepath) }}));
        }

        filepath = fs.realpathSync(filepath);

        grunt.log.writeln(grunt.template.process('Doctype set to <%= doctype %>\nEncoding set to <%= encoding %>', {data: {
            doctype: chalk.cyan(options.doctype),
            encoding: chalk.cyan(options.encoding)
        }}));

        options.vendors = getAssets(options.vendors, filepath, options.root, function (filename, attrs, content) {
            if (/\.js$/.test(filename)) {
                return getScriptsElement(filename, attrs, content);
            } else if (/\.css$/.test(filename)) {
                return getStylesheetElement(filename, attrs, content);
            }

            return null;
        }).join('\n\t\t');

        options.stylesheets = getAssets(options.stylesheets, filepath, options.root, function (filename, attrs, content) {
            return getStylesheetElement(filename, attrs, content);
        }).join('\n\t\t');

        options.scripts = getAssets(options.scripts, filepath, options.root, function (filename, attrs, content) {
            return getScriptsElement(filename, attrs, content);
        }).join('\n\t\t');

        options.encoding = getMetaElement({charset: options.encoding});

        options.meta = options.meta.map(function (data) {
            return getMetaElement(data);
        }).join('\n\t\t');

        options.bodyAttrs = null;

        if (typeof options.body === 'object') {
            options.bodyAttrs = new Attrs(options.body.attrs).toHtml();
            options.body = options.body.content;

            grunt.log.writeln(chalk.gray(grunt.template.process('body attributes(<%= attrs %>)', {data: { attrs: options.bodyAttrs.toString() }})));

            options.bodyAttrs = ' ' + options.bodyAttrs;
        }

        grunt.file.write(filename, grunt.template.process('<!doctype <%= doctype %>>\n<html>\n\t<head>\n\t\t<title><%= title %></title>\n\t\t<%= encoding %>\n\t\t<%= meta %>\n\t\t<%= vendors %>\n\t\t<%= stylesheets %>\n\t</head>\n\t<body<%= bodyAttrs %>>\n\t\t<%= body %>\n\t\t<%= scripts %>\n\t</body>\n</html>', {data: options}).replace(/^\n|\s+$/gm, ''));
        grunt.log.ok(grunt.template.process('Created <%= filename %>', {data: { filename: chalk.cyan(filename) }}));
    }

    grunt.registerMultiTask('htmlcompiler', 'Grunt task to compile an HTML document.', function() {
        var options = this.options({
            doctype: 'html',
            encoding: 'UTF-8',
            vendors: [],
            scripts: [],
            stylesheets: [],
            title: '',
            meta: [],
            body: null,
            root: '.'
        }),
        files = this.files;

        if (files && files.length > 0) {
            files.forEach(function (file) {
                createFile(file.dest, options);
            });
        } else {
            createFile(this.target, options);
        }
    });
};