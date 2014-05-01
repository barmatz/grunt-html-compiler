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
        var fs = require('fs'),
        path = require('path'),
        options = this.options({
            doctype: 'html',
            encoding: 'UTF-8',
            vendors: null,
            scripts: null,
            stylesheets: null,
            title: '',
            body: null,
            root: '.'
        }),
        target = this.target,
        targetPath = fs.realpathSync(target.replace(/^(.*)\/.*$/, '$1'));

        function isExternalAsset(asset) {
            return /^\w+:\/\//.test(asset);   
        }


        function getAssets(assets) {
            var externalAssets = {}, i;

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
                                externalAssets[asset] = null;
                            }
                        });
                    }
                    break;
            }

            return grunt.file.expandMapping(assets).map(function (files) {
                return require('path').relative(targetPath, fs.realpathSync(options.root + '/' + files.src));
            }).concat(Object.keys(externalAssets));
        }

        function getElement(template, options) {
            return grunt.template.process(template, {data: options});
        }

        function getScriptsElement(src) {
            grunt.log.writeln(grunt.template.process('Linking script <%= filename %>', {data: { filename: src }}));
            return getElement('<script src="<%= src %>"></script>', {src: src});
        }

        function getStylesheetElement(href) {
            grunt.log.writeln(grunt.template.process('Linking stylesheet <%= filename %>', {data: { filename: href }}));
            return getElement('<link rel="stylesheet" href="<%= href %>"/>', {href: href});
        }

        grunt.log.writeln(grunt.template.process('Doctype set to <%= doctype %>\nEncoding set to <%= encoding %>', {data: options}));

        options.vendors = getAssets(options.vendors).map(function (file) {
            if (/\.js$/.test(file)) {
                return getScriptsElement(file);
            } else if (/\.css$/.test(file)) {
                return getStylesheetElement(file);
            }

            return null;
        }).join('\n\t\t');
        
        options.stylesheets = getAssets(options.stylesheets).map(function (filename) {
            return getStylesheetElement(filename);
        }).join('\n\t\t');

        options.scripts = getAssets(options.scripts).map(function (filename) {
            return getScriptsElement(filename);
        }).join('\n\t\t');

        grunt.file.write(target, grunt.template.process('<!doctype <%= doctype %>>\n<html>\n\t<head>\n\t\t<title><%= title %></title>\n\t\t<meta charset="<%= encoding %>"/>\n\t\t<%= vendors %>\n\t\t<%= stylesheets %>\n\t</head>\n\t<body>\n\t\t<%= body %>\n\t\t<%= scripts %>\n\t</body>\n</html>', {data: options}).replace(/^\n|\s+$/gm, ''));
        grunt.log.ok(grunt.template.process('Created <%= filename %>', {data: { filename: target }}));
    });
};