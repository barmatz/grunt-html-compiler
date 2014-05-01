/*
 * grunt-html-compiler
 * https://github.com/barmatz/grunt-html-compiler
 *
 * Copyright (c) 2014 Or Barmatz
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    grunt.registerMultiTask('htmlcompiler', 'Grunt task to compile an HTML document.', function() {
        var self = this,
        fs = require('fs'),
        path = require('path'),
        options = this.options({
            doctype: 'UTF-8',
            encoding: 'UTF-8',
            vendors: null,
            scripts: null,
            stylesheets: null,
            title: '',
            body: null,
            root: '.'
        }),
        targetPath = fs.realpathSync(this.target.replace(/^(.*)\/.*$/, '$1'));

        function getAssets(assets) {
            return grunt.file.expandMapping(assets).map(function (files) {
                return require('path').relative(targetPath, fs.realpathSync(options.root + '/' + files.src));
            });
        }

        function getElement(template, options) {
            return grunt.template.process(template, {data: options});
        }

        function getScriptsElement(src) {
            return getElement('<script src="<%= src %>"></script>', {src: src});
        }

        function getStylesheetElement(href) {
            return getElement('<link rel="stylesheet" href="<%= href %>"/>', {href: href});
        }

        options.vendors = getAssets(options.vendors).map(function (file) {
            if (/\.js$/.test(file)) {
                return getScriptsElement(file);
            } else if (/\.css$/.test(file)) {
                return getStylesheetElement(file);
            }

            return null;
        }).join('\n\t\t');
        
        options.stylesheets = getAssets(options.stylesheets).map(function (file) {
            return getStylesheetElement(file);
        }).join('\n\t\t');

        options.scripts = getAssets(options.scripts).map(function (file) {
            return getScriptsElement(file);
        }).join('\n\t\t');

        grunt.file.write(self.target, grunt.template.process('<!doctype <%= doctype %>>\n<html>\n\t<head>\n\t\t<title><%= title %></title>\n\t\t<meta charset="<%= encoding %>"/>\n\t\t<%= vendors %>\n\t\t<%= stylesheets %>\n\t</head>\n\t<body>\n\t\t<%= body %>\n\t\t<%= scripts %>\n\t</body>\n</html>', {data: options}).replace(/^\s*$/g, ''));
    });
};