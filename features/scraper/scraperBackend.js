'use strict';

const Datastore = require('nedb');
const scraperDB = new Datastore({ filename: './store/scraper', autoload: true });

const Xray = require('x-ray');

const scraperBackend = {
    register: function (server, options, next) {
        server.route({
            method: 'GET',
            path:'/scrapers',
            handler: function (request, reply) {
                scraperDB.find({}, function (err, docs) {
                    return reply(docs);
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/scraper',
            handler: function (request, reply) {
                scraperDB.insert([request.payload], function (err, newDocs) {
                    reply({});
                });
            }
        });

        server.route({
            method: 'DELETE',
            path:'/scraper/{id}',
            handler: function (request, reply) {
                scraperDB.remove({ _id: request.params.id }, {}, function (err, numRemoved) {
                    reply({numRemoved: numRemoved});
                });
            }
        });

        server.route({
            method: 'POST',
            path:'/scraper/{id}/scrape',
            handler: function (request, reply) {
                scraperDB.findOne({ _id: request.params.id }, function (err, doc) {
                    if (doc) {
                        Xray()(doc.url, doc.selector, [doc.fields])(function(err, result) {
                            console.log(result);
                        })
                    }

                    return reply({});
                });
            }
        });

        server.route({
            method: 'GET',
            path: '/scraperFrontend.js',
            handler: {
                file: './features/scraper/scraperFrontend.js'
            }
        });

        server.route({
            method: 'GET',
            path: '/scraper.css',
            handler: {
                file: './features/scraper/scraper.css'
            }
        });

        next();
    }
};

scraperBackend.register.attributes = {
    name: 'scraperBackend',
    version: '1.0.0'
};

module.exports = scraperBackend;
