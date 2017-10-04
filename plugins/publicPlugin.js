'use strict';

const cheerio = require('cheerio');
const indexHtml = require('fs').readFileSync('./public/index.html').toString();
const $ = cheerio.load(indexHtml);
const features = require('fs').readdirSync('./features');

features.forEach(function(feature) {
    $('head').append('<script src="'+feature+'Frontend.js"></script>');
});

const publicPlugin = {
    register: function (server, options, next) {
        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {
                reply($.html());
            }
        });

        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: './public',
                    redirectToSlash: true,
                    index: true
                }
            }
        });

        next();
    }
};

publicPlugin.register.attributes = {
    name: 'publicPlugin',
    version: '1.0.0'
};

module.exports = publicPlugin;
