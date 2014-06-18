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
chalk = require('chalk');

module.exports = function(grunt) {
    function isExternalAsset(asset) {
        return /^\w+:\/\//.test(asset);   
    }

    function getAssets(assets, filepath, options) {
        var externalAssets = {};

        switch (typeof assets) {
            case 'string':
                if (isExternalAsset(assets)) {
                    return assets;
                }
                break;
            case 'object':
                if (assets instanceof Array) {
                    assets.forEach(function (asset) {
                        if (isExternalAsset(asset)) {
                            externalAssets[asset] = true;
                        }
                    });
                }
                break;
        }

        return grunt.file.expandMapping(assets).map(function (files) {
            return path.relative(filepath, fs.realpathSync(options.root + '/' + files.src));
        }).concat(Object.keys(externalAssets));
    }

    function getElement(template, options) {
        return grunt.template.process(template, {data: options});
    }

    function getScriptsElement(src) {
        grunt.log.writeln(grunt.template.process('Linking script <%= filename %>', {data: { filename: chalk.cyan(src) }}));
        return getElement('<script src="<%= src %>"></script>', {src: src});
    }

    function getStylesheetElement(href) {
        grunt.log.writeln(grunt.template.process('Linking stylesheet <%= filename %>', {data: { filename: chalk.cyan(href) }}));
        return getElement('<link rel="stylesheet" href="<%= href %>"/>', {href: href});
    }

    function getMetaElement(data) {
        if ('name' in data) {
            return getElement('<meta name="<%= name %>" content="<%= content %>"/>', data);
        } else if ('http-equiv' in data) {
            return getElement('<meta http-equiv="<%= http-equiv %>" content="<%= content %>"/>', data);
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

        options.vendors = getAssets(options.vendors, filepath, options).map(function (file) {
            if (/\.js$/.test(file)) {
                return getScriptsElement(file);
            } else if (/\.css$/.test(file)) {
                return getStylesheetElement(file);
            }

            return null;
        }).join('\n\t\t');

        options.stylesheets = getAssets(options.stylesheets, filepath, options).map(function (filename) {
            return getStylesheetElement(filename);
        }).join('\n\t\t');

        options.scripts = getAssets(options.scripts, filepath, options).map(function (filename) {
            return getScriptsElement(filename);
        }).join('\n\t\t');

        options.encoding = getMetaElement({charset: options.encoding});

        options.meta = options.meta.map(function (data) {
            return getMetaElement(data);
        }).join('\n\t\t');

        grunt.file.write(filename, grunt.template.process('<!doctype <%= doctype %>>\n<html>\n\t<head>\n\t\t<title><%= title %></title>\n\t\t<%= encoding %>\n\t\t<%= meta %>\n\t\t<%= vendors %>\n\t\t<%= stylesheets %>\n\t</head>\n\t<body>\n\t\t<%= body %>\n\t\t<%= scripts %>\n\t</body>\n</html>', {data: options}).replace(/^\n|\s+$/gm, ''));
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